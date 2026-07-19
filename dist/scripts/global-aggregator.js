"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const dbPath = path_1.default.resolve(__dirname, '../../prisma/dev.db');
const db = new sqlite3_1.default.Database(dbPath);
function dbRun(sql, params) {
    return new Promise((resolve, reject) => {
        db.run(sql, params ?? [], function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
function dbGet(sql, params) {
    return new Promise((resolve, reject) => {
        db.get(sql, params ?? [], function (err, row) {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
}
function dbAll(sql, params) {
    return new Promise((resolve, reject) => {
        db.all(sql, params ?? [], function (err, rows) {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
}
// Local Assets Paths
const LOGOS_DIR = path_1.default.resolve(__dirname, '../../../../client/public/assets/logos');
const COMPANIES_DIR = path_1.default.resolve(__dirname, '../../../../client/public/assets/companies');
// Ensure directories exist
if (!fs_1.default.existsSync(LOGOS_DIR))
    fs_1.default.mkdirSync(LOGOS_DIR, { recursive: true });
if (!fs_1.default.existsSync(COMPANIES_DIR))
    fs_1.default.mkdirSync(COMPANIES_DIR, { recursive: true });
const VALID_INDUSTRIES = [
    "pharmaceutical", "biopharmaceutical", "biotechnology", "clinical research",
    "clinical trials", "medical devices", "diagnostics", "vaccines", "biologics",
    "injectables", "cell therapy", "gene therapy", "healthcare", "drug discovery",
    "api manufacturing", "cmo", "cdmo", "cro", "research institute", "laboratory",
    "hospital", "healthcare technology", "medical equipment", "consumer healthcare",
    "veterinary", "nutraceutical", "contract manufacturing", "research services", "life sciences",
    "pharma"
];
function isLifeScience(industry) {
    if (!industry)
        return false;
    const ind = industry.toLowerCase();
    return VALID_INDUSTRIES.some(valid => ind.includes(valid));
}
// Configuration
const BATCH_SIZE = 50;
const WAIT_BETWEEN_REQUESTS_MS = 1000;
const APIS = [
    {
        name: 'WIKIDATA',
        url: 'https://query.wikidata.org/sparql',
        type: 'SPARQL',
        query: `
      SELECT ?company ?companyLabel ?countryLabel ?industryLabel ?logo WHERE {
        ?company wdt:P31/wdt:P279* wd:Q783794 . 
        VALUES ?country { wd:Q30 wd:Q668 }
        ?company wdt:P17 ?country .
        ?country rdfs:label ?countryLabel filter (lang(?countryLabel) = "en")
        OPTIONAL { ?company wdt:P452 ?industry . ?industry rdfs:label ?industryLabel filter (lang(?industryLabel) = "en") }
        OPTIONAL { ?company wdt:P154 ?logo }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      } LIMIT ${BATCH_SIZE} OFFSET {OFFSET}
    `
    }
];
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function downloadAsset(url, destPath, relativePath) {
    if (!url)
        return "";
    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'cGxPDirectoryBot/1.0 (admin@cgxp.directory)' }
        });
        if (!res.ok)
            throw new Error(`HTTP ${res.status}`);
        const buffer = Buffer.from(await res.arrayBuffer());
        fs_1.default.writeFileSync(destPath, buffer);
        return relativePath;
    }
    catch (err) {
        console.error(`Failed to download asset ${url}:`, err.message);
        return url; // fallback to original if failed
    }
}
async function getOrCreateSystemUser() {
    let user = await dbGet(`SELECT id FROM User WHERE email = 'system@cgxp.directory'`);
    if (!user) {
        const role = await dbGet(`SELECT id FROM Role WHERE name = 'SYSTEM_ADMIN'`);
        if (!role) {
            const id = (0, uuid_1.v4)();
            await dbRun(`INSERT INTO Role (id, name, description, updatedAt) VALUES (?, ?, ?, ?)`, [id, 'SYSTEM_ADMIN', 'System Admin', new Date().toISOString()]);
            const userId = (0, uuid_1.v4)();
            await dbRun(`INSERT INTO User (id, email, passwordHash, firstName, lastName, roleId, status, isDeleted, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [userId, 'system@cgxp.directory', 'dummy', 'System', 'Aggregator', id, 'ACTIVE', 0, new Date().toISOString()]);
            return userId;
        }
        const userId = (0, uuid_1.v4)();
        await dbRun(`INSERT INTO User (id, email, passwordHash, firstName, lastName, roleId, status, isDeleted, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [userId, 'system@cgxp.directory', 'dummy', 'System', 'Aggregator', role.id, 'ACTIVE', 0, new Date().toISOString()]);
        return userId;
    }
    return user.id;
}
async function getOrCreateCountry(name) {
    if (!name)
        return null;
    const cName = name.trim();
    let country = await dbGet(`SELECT id FROM Country WHERE name = ?`, [cName]);
    if (!country) {
        const id = (0, uuid_1.v4)();
        await dbRun(`INSERT INTO Country (id, name, code, isDeleted) VALUES (?, ?, ?, ?)`, [id, cName, cName.substring(0, 3).toUpperCase(), 0]);
        return id;
    }
    return country.id;
}
async function getOrCreateCategory(name) {
    if (!name || name.includes('API') || name.includes('Bulk Drugs'))
        return null;
    const cName = name.trim();
    const slug = cName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    let category = await dbGet(`SELECT id FROM CompanyCategory WHERE slug = ?`, [slug]);
    if (!category) {
        const id = (0, uuid_1.v4)();
        await dbRun(`INSERT INTO CompanyCategory (id, name, slug, updatedAt) VALUES (?, ?, ?, ?)`, [id, cName, slug, new Date().toISOString()]);
        return id;
    }
    return category.id;
}
async function syncWikidata(systemUserId) {
    const api = APIS.find(a => a.name === 'WIKIDATA');
    if (!api)
        return;
    let state = await dbGet(`SELECT * FROM ApiSyncState WHERE apiName = ?`, [api.name]);
    if (!state) {
        const id = (0, uuid_1.v4)();
        await dbRun(`INSERT INTO ApiSyncState (id, apiName, lastCursor, status, totalRecords, updatedAt) VALUES (?, ?, ?, ?, ?, ?)`, [id, api.name, "0", 'IDLE', 0, new Date().toISOString()]);
        state = { id, lastCursor: "0" };
    }
    let offset = parseInt(state.lastCursor || "0", 10);
    let hasMore = true;
    console.log(`[${api.name}] Starting sync from offset ${offset}...`);
    while (hasMore) {
        try {
            const query = api.query.replace('{OFFSET}', offset.toString());
            const res = await fetch(`${api.url}?query=${encodeURIComponent(query)}&format=json`, {
                headers: { 'User-Agent': 'cGxPDirectoryBot/1.0 (admin@cgxp.directory)', 'Accept': 'application/json' }
            });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(`HTTP ${res.status}: ${text.substring(0, 100)}`);
            }
            const data = await res.json();
            const bindings = data?.results?.bindings || [];
            if (bindings.length === 0) {
                hasMore = false;
                console.log(`[${api.name}] Exhausted pagination.`);
                break;
            }
            for (const item of bindings) {
                const name = item.companyLabel?.value;
                const wikidataId = item.company?.value?.split('/').pop();
                const countryName = item.countryLabel?.value;
                const industryName = item.industryLabel?.value;
                const logoUrlRaw = item.logo?.value;
                if (!name || !wikidataId)
                    continue;
                // Strict Validation Check
                if (!industryName || !isLifeScience(industryName)) {
                    continue;
                }
                const cName = (countryName || '').toLowerCase();
                if (!cName.includes('india') && !cName.includes('united states') && !cName.includes('usa') && !cName.includes('us')) {
                    continue;
                }
                const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                let existing = await dbGet(`SELECT id, logoUrl FROM Company WHERE wikidataId = ? OR name = ?`, [wikidataId, name]);
                const countryId = await getOrCreateCountry(countryName);
                const categoryId = await getOrCreateCategory(industryName || 'Pharmaceuticals');
                // Download logo if not already local
                let finalLogoUrl = logoUrlRaw;
                if (logoUrlRaw && (!existing || !existing.logoUrl || !existing.logoUrl.startsWith('/assets/logos/'))) {
                    const extension = logoUrlRaw.split('.').pop() || 'png';
                    const filename = `${wikidataId}.${extension}`;
                    finalLogoUrl = await downloadAsset(logoUrlRaw, path_1.default.join(LOGOS_DIR, filename), `/assets/logos/${filename}`);
                }
                else if (existing && existing.logoUrl) {
                    finalLogoUrl = existing.logoUrl;
                }
                if (existing) {
                    await dbRun(`UPDATE Company SET wikidataId = ?, logoUrl = ?, updatedAt = ? WHERE id = ?`, [wikidataId, finalLogoUrl, new Date().toISOString(), existing.id]);
                }
                else {
                    try {
                        const id = (0, uuid_1.v4)();
                        await dbRun(`INSERT INTO Company (id, name, slug, wikidataId, logoUrl, userId, countryId, status, isDeleted, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, name, slug + '-' + Math.floor(Math.random() * 10000), wikidataId, finalLogoUrl, systemUserId, countryId, 'VERIFIED', 0, new Date().toISOString()]);
                        if (categoryId) {
                            await dbRun(`INSERT INTO _CompanyToCompanyCategory (A, B) VALUES (?, ?)`, [id, categoryId]);
                        }
                    }
                    catch (e) {
                        console.error("Failed to insert company:", name, e.message);
                    }
                }
            }
            offset += BATCH_SIZE;
            await dbRun(`UPDATE ApiSyncState SET lastCursor = ?, totalRecords = totalRecords + ?, updatedAt = ? WHERE id = ?`, [offset.toString(), bindings.length, new Date().toISOString(), state.id]);
            console.log(`[${api.name}] Processed batch. New offset: ${offset}`);
            await sleep(WAIT_BETWEEN_REQUESTS_MS);
            // Continue until no more data
        }
        catch (err) {
            console.error(`[${api.name}] Error fetching batch at offset ${offset}:`, err.message);
            // Wait longer on error (e.g. rate limit) and retry, or break
            console.log(`[${api.name}] Pausing for 10 seconds before retry...`);
            await sleep(10000);
        }
    }
}
async function runAggregator() {
    console.log("=== Global Directory Data Aggregation Engine ===");
    const systemUserId = await getOrCreateSystemUser();
    console.log("Starting Wikidata Sync Engine...");
    await syncWikidata(systemUserId);
    console.log("Engine paused. Configure other APIs (ROR, OpenCorporates) to continue.");
    process.exit(0);
}
runAggregator().catch((e) => console.error(e));
