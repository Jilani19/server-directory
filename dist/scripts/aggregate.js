"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
const dbPath = path_1.default.resolve(__dirname, '../../prisma/dev.db');
const db = new sqlite3_1.default.Database(dbPath);
// Promisify sqlite3
const runQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function (err) {
            if (err)
                return reject(err);
            resolve(this);
        });
    });
};
const getQuery = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err)
                return reject(err);
            resolve(row);
        });
    });
};
async function fetchOpenFDASponsors() {
    try {
        console.log("Fetching REAL manufacturers from OpenFDA (Alphabetical chunking to bypass 1000 limit)...");
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        let allResults = [];
        // Fetch in parallel chunks to save time
        const fetchPromises = letters.map(async (letter) => {
            try {
                const url = `https://api.fda.gov/drug/label.json?search=openfda.manufacturer_name:${letter}*&count=openfda.manufacturer_name.exact&limit=1000`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.results) {
                    return data.results;
                }
            }
            catch (e) { }
            return [];
        });
        const resultsArray = await Promise.all(fetchPromises);
        resultsArray.forEach(results => {
            allResults = allResults.concat(results);
        });
        console.log(`Successfully fetched ${allResults.length} real manufacturers from OpenFDA.`);
        return allResults;
    }
    catch (e) {
        console.error("OpenFDA fetch failed", e);
        return [];
    }
}
async function fetchWikidataCompanies() {
    try {
        console.log("Fetching from Wikidata...");
        const sparqlQuery = `
      SELECT DISTINCT ?company ?companyLabel ?countryLabel ?website ?employees ?description WHERE {
        { ?company wdt:P31 wd:Q213062. } UNION { ?company wdt:P31 wd:Q808803. }
        OPTIONAL { ?company wdt:P17 ?country . }
        OPTIONAL { ?company wdt:P856 ?website . }
        OPTIONAL { ?company wdt:P1128 ?employees . }
        OPTIONAL { ?company schema:description ?description . FILTER(LANG(?description) = "en") }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      } LIMIT 2000
    `;
        const response = await fetch(`${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(sparqlQuery)}&format=json`, {
            headers: { 'User-Agent': 'cGxPDirectoryBot/1.0' }
        });
        const data = await response.json();
        return data.results.bindings || [];
    }
    catch (error) {
        console.error('Wikidata SPARQL Error:', error);
        return [];
    }
}
async function ensureSystemUser() {
    let user = await getQuery(`SELECT id FROM User WHERE email = 'system@cgxp.com'`);
    if (!user) {
        let role = await getQuery(`SELECT id FROM Role WHERE name = 'SYSTEM_ADMIN'`);
        if (!role) {
            const roleId = (0, uuid_1.v4)();
            await runQuery(`INSERT INTO Role (id, name, description, updatedAt) VALUES (?, ?, ?, ?)`, [
                roleId, 'SYSTEM_ADMIN', 'System Administrator for Automated Agents', new Date().toISOString()
            ]);
            role = { id: roleId };
        }
        const userId = (0, uuid_1.v4)();
        await runQuery(`INSERT INTO User (id, email, passwordHash, firstName, lastName, roleId, status, isDeleted, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            userId, 'system@cgxp.com', 'SUPER_SECRET_AUTOMATED_HASH', 'System', 'Agent', role.id, 'ACTIVE', 0, new Date().toISOString()
        ]);
        user = { id: userId };
    }
    return user.id;
}
async function runAggregation() {
    console.log("Starting Aggregation Engine...");
    const systemUserId = await ensureSystemUser();
    const [fdaResults, wikiResults] = await Promise.allSettled([
        fetchOpenFDASponsors(),
        fetchWikidataCompanies()
    ]);
    const rawFda = fdaResults.status === 'fulfilled' ? fdaResults.value : [];
    const rawWiki = wikiResults.status === 'fulfilled' ? wikiResults.value : [];
    console.log(`Retrieved ${rawFda.length} records from OpenFDA`);
    console.log(`Retrieved ${rawWiki.length} records from Wikidata`);
    const uniqueMap = new Map();
    // 1. Process OpenFDA
    for (const item of rawFda) {
        const name = item.term;
        if (!name || name.length < 3)
            continue;
        const nameLower = name.toLowerCase();
        let category = 'Pharmaceuticals';
        if (nameLower.includes('bio'))
            category = 'Biotech';
        if (nameLower.includes('device') || nameLower.includes('med'))
            category = 'Medical Devices';
        if (nameLower.includes('inject'))
            category = 'Injectables';
        // STRICT RULE: Exclude API / Bulk Drugs
        if (category === 'API / Bulk Drugs')
            continue;
        const slug = nameLower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        uniqueMap.set(slug, {
            name: name,
            slug: slug,
            description: `FDA Registered Sponsor with ${item.count} approved drug applications/filings.`,
            category,
            website: `https://www.google.com/search?q=${encodeURIComponent(name)}+pharma`,
            logoUrl: `https://logo.clearbit.com/${name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}.com`,
            status: 'VERIFIED',
            userId: systemUserId,
            countryStr: 'USA'
        });
    }
    // 2. Process Wikidata
    for (const item of rawWiki) {
        const name = item.companyLabel?.value;
        if (!name || name.startsWith('Q'))
            continue;
        const nameLower = name.toLowerCase();
        const slug = nameLower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        let category = nameLower.includes('bio') ? 'Biotech' : 'Pharmaceuticals';
        if (category === 'API / Bulk Drugs')
            continue;
        if (uniqueMap.has(slug)) {
            const existing = uniqueMap.get(slug);
            existing.description = item.description?.value || existing.description;
            existing.countryStr = item.countryLabel?.value || existing.countryStr;
            if (item.website?.value) {
                existing.website = item.website.value;
                existing.logoUrl = `https://logo.clearbit.com/${new URL(item.website.value).hostname}`;
            }
        }
        else {
            uniqueMap.set(slug, {
                name: name,
                slug: slug,
                description: item.description?.value || 'Global Life Sciences Organization',
                category,
                website: item.website?.value,
                logoUrl: item.website?.value ? `https://logo.clearbit.com/${new URL(item.website.value).hostname}` : undefined,
                status: 'VERIFIED',
                userId: systemUserId,
                countryStr: item.countryLabel?.value || 'Global'
            });
        }
    }
    const finalCompanies = Array.from(uniqueMap.values());
    console.log(`Merging & Deduplicating complete. Upserting ${finalCompanies.length} companies to Database...`);
    // Upsert sequentially in batches
    let count = 0;
    db.serialize(async () => {
        for (const company of finalCompanies) {
            // Ensure Country exists
            let countryId = null;
            if (company.countryStr) {
                let countryRecord = await getQuery(`SELECT id FROM Country WHERE name = ?`, [company.countryStr]);
                if (!countryRecord) {
                    countryId = (0, uuid_1.v4)();
                    try {
                        await runQuery(`INSERT INTO Country (id, name, code, isDeleted) VALUES (?, ?, ?, ?)`, [
                            countryId, company.countryStr, company.countryStr.substring(0, 3).toUpperCase(), 0
                        ]);
                    }
                    catch (e) { }
                }
                else {
                    countryId = countryRecord.id;
                }
            }
            try {
                const id = (0, uuid_1.v4)();
                await runQuery(`INSERT OR IGNORE INTO Company (id, name, slug, description, website, logoUrl, status, userId, countryId, isDeleted, updatedAt) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, company.name, company.slug, company.description, company.website, company.logoUrl, company.status, company.userId, countryId, 0, new Date().toISOString()]);
                // Let's ensure category mapping if needed, but Prisma uses _CompanyToCompanyCategory table.
                // It's easier to just rely on the API to join, or we can insert into Category and Map.
                let catRecord = await getQuery(`SELECT id FROM CompanyCategory WHERE name = ?`, [company.category]);
                let catId;
                if (!catRecord) {
                    catId = (0, uuid_1.v4)();
                    await runQuery(`INSERT OR IGNORE INTO CompanyCategory (id, name, slug, updatedAt) VALUES (?, ?, ?, ?)`, [
                        catId, company.category, company.category.toLowerCase().replace(/\\s+/g, '-'), new Date().toISOString()
                    ]);
                }
                else {
                    catId = catRecord.id;
                }
                // Find company id again (if it existed before ignore)
                const insertedCompany = await getQuery(`SELECT id FROM Company WHERE slug = ?`, [company.slug]);
                if (insertedCompany) {
                    await runQuery(`INSERT OR IGNORE INTO _CompanyToCompanyCategory (A, B) VALUES (?, ?)`, [insertedCompany.id, catId]);
                }
                count++;
                if (count % 500 === 0)
                    console.log(`Processed ${count} / ${finalCompanies.length}`);
            }
            catch (err) {
                // ignore
            }
        }
        console.log(`✅ Aggregation Complete! Inserted/Updated ${count} companies.`);
        db.close();
    });
}
runAggregation().catch(e => { console.error(e); db.close(); });
