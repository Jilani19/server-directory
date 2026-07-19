"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncWikidata = syncWikidata;
const prisma_1 = require("../config/prisma");
const WIKIDATA_SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
async function syncWikidata() {
    console.log('[SYNC] Starting Wikidata synchronization...');
    // Get all companies from the database
    const companies = await prisma_1.prisma.company.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true, wikidataId: true }
    });
    for (const company of companies) {
        console.log(`[SYNC] Fetching Wikidata for ${company.name}...`);
        try {
            const sparqlQuery = `
        SELECT ?company ?founded ?ceoLabel ?hqLabel ?employees ?revenue ?marketCap ?website ?exchangeLabel ?ticker ?isin ?parentLabel (GROUP_CONCAT(DISTINCT ?subsidiaryLabel; separator=", ") AS ?subsidiaries) WHERE {
          ?company rdfs:label "${company.name}"@en.
          ?company wdt:P31/wdt:P279* wd:Q4830453. # instance of business/enterprise
          
          OPTIONAL { ?company wdt:P571 ?founded. }
          OPTIONAL { ?company wdt:P169 ?ceo. }
          OPTIONAL { ?company wdt:P159 ?hq. }
          OPTIONAL { ?company wdt:P1128 ?employees. }
          OPTIONAL { ?company wdt:P2139 ?revenue. }
          OPTIONAL { ?company wdt:P2226 ?marketCap. }
          OPTIONAL { ?company wdt:P856 ?website. }
          OPTIONAL { ?company wdt:P414 ?exchange. }
          OPTIONAL { ?company wdt:P249 ?ticker. }
          OPTIONAL { ?company wdt:P946 ?isin. }
          OPTIONAL { ?company wdt:P749 ?parent. }
          OPTIONAL { ?company wdt:P355 ?subsidiary. }
          
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". 
                                   ?ceo rdfs:label ?ceoLabel.
                                   ?hq rdfs:label ?hqLabel.
                                   ?exchange rdfs:label ?exchangeLabel.
                                   ?parent rdfs:label ?parentLabel.
                                   ?subsidiary rdfs:label ?subsidiaryLabel. }
        }
        GROUP BY ?company ?founded ?ceoLabel ?hqLabel ?employees ?revenue ?marketCap ?website ?exchangeLabel ?ticker ?isin ?parentLabel
        LIMIT 1
      `;
            const execQuery = `
        SELECT ?personLabel ?roleLabel ?image ?educationLabel ?startTime WHERE {
          ?company rdfs:label "${company.name}"@en.
          ?company wdt:P31/wdt:P279* wd:Q4830453.
          
          {
            ?company p:P169 ?statement.
            ?statement ps:P169 ?person.
            BIND("Chief Executive Officer" AS ?roleLabel)
          } UNION {
            ?company p:P488 ?statement.
            ?statement ps:P488 ?person.
            BIND("Chairperson" AS ?roleLabel)
          } UNION {
            ?company p:P3320 ?statement.
            ?statement ps:P3320 ?person.
            BIND("Board Member" AS ?roleLabel)
          } UNION {
            ?company p:P1037 ?statement.
            ?statement ps:P1037 ?person.
            BIND("Executive" AS ?roleLabel)
          }
          
          OPTIONAL { ?person wdt:P18 ?image. }
          OPTIONAL { ?person wdt:P69 ?education. }
          OPTIONAL { ?statement pq:P580 ?startTime. }
          
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
        }
        LIMIT 30
      `;
            const fetchOptions = {
                headers: { 'Accept': 'application/sparql-results+json', 'User-Agent': 'cGxP-Company-Intelligence/1.0 (admin@cgxp.com)' }
            };
            const mainRes = await fetch(`${WIKIDATA_SPARQL_ENDPOINT}?query=${encodeURIComponent(sparqlQuery)}&format=json`, fetchOptions);
            await new Promise(resolve => setTimeout(resolve, 2000));
            const execRes = await fetch(`${WIKIDATA_SPARQL_ENDPOINT}?query=${encodeURIComponent(execQuery)}&format=json`, fetchOptions);
            if (!mainRes.ok) {
                console.error(`[SYNC] Failed to fetch Wikidata for ${company.name} (Status: ${mainRes.status})`);
                const text = await mainRes.text();
                console.error(`[SYNC] Response: ${text.substring(0, 200)}`);
                continue;
            }
            let data;
            try {
                data = await mainRes.json();
            }
            catch (e) {
                console.error(`[SYNC] Wikidata returned non-JSON for ${company.name}`);
                const text = await mainRes.text().catch(() => '');
                console.error(`[SYNC] Body: ${text.substring(0, 200)}`);
                continue;
            }
            const results = data.results?.bindings;
            if (!results || results.length === 0)
                continue;
            const binding = results[0];
            // Extract Wikidata Q-ID
            let wikidataId = null;
            if (binding.company?.value) {
                const parts = binding.company.value.split('/');
                wikidataId = parts[parts.length - 1];
            }
            // Update Company with basic info
            await prisma_1.prisma.company.update({
                where: { id: company.id },
                data: {
                    wikidataId: wikidataId || undefined,
                    foundedYear: binding.founded?.value ? new Date(binding.founded.value).getFullYear().toString() : undefined,
                    incorporationDate: binding.founded?.value ? new Date(binding.founded.value).toISOString() : undefined,
                    ceo: binding.ceoLabel?.value,
                    hqAddress: binding.hqLabel?.value,
                    employees: binding.employees?.value,
                    revenue: binding.revenue?.value,
                    website: binding.website?.value,
                    stockExchange: binding.exchangeLabel?.value,
                    ticker: binding.ticker?.value,
                    isin: binding.isin?.value,
                    parentCompany: binding.parentLabel?.value,
                }
            });
            // Insert Headquarters as a Facility
            if (binding.hqLabel?.value) {
                const hqName = binding.hqLabel.value;
                const existingFacility = await prisma_1.prisma.companyFacility.findFirst({
                    where: { companyId: company.id, name: hqName }
                });
                if (!existingFacility) {
                    await prisma_1.prisma.companyFacility.create({
                        data: {
                            companyId: company.id,
                            name: hqName,
                            type: 'Headquarters',
                            city: hqName, // Approx
                            country: 'Global', // Approx, can be refined
                            source: 'Wikidata'
                        }
                    });
                }
            }
            // Query explicit facilities (manufacturing plants P1976)
            const facQuery = `
        SELECT ?plantLabel WHERE {
          ?company rdfs:label "${company.name}"@en.
          ?company wdt:P31/wdt:P279* wd:Q4830453.
          ?company wdt:P1976 ?plant.
          SERVICE wikibase:label { bd:serviceParam wikibase:language "en". ?plant rdfs:label ?plantLabel. }
        } LIMIT 10
      `;
            try {
                const facRes = await fetch(`${WIKIDATA_SPARQL_ENDPOINT}?query=${encodeURIComponent(facQuery)}&format=json`, fetchOptions);
                if (facRes.ok) {
                    const facData = await facRes.json();
                    const facBindings = facData.results?.bindings || [];
                    for (const fb of facBindings) {
                        const plantName = fb.plantLabel?.value;
                        if (!plantName)
                            continue;
                        const existingFacility = await prisma_1.prisma.companyFacility.findFirst({
                            where: { companyId: company.id, name: plantName }
                        });
                        if (!existingFacility) {
                            await prisma_1.prisma.companyFacility.create({
                                data: {
                                    companyId: company.id,
                                    name: plantName,
                                    type: 'Manufacturing Plant',
                                    source: 'Wikidata'
                                }
                            });
                        }
                    }
                }
            }
            catch (e) {
                // Ignore errors in supplementary fetch
            }
            // Update Subsidiaries
            if (binding.subsidiaries?.value) {
                const subNames = binding.subsidiaries.value.split(', ').filter(Boolean);
                for (const subName of subNames) {
                    // Check if exists
                    const existing = await prisma_1.prisma.companySubsidiary.findFirst({
                        where: { companyId: company.id, name: subName }
                    });
                    if (!existing) {
                        await prisma_1.prisma.companySubsidiary.create({
                            data: {
                                companyId: company.id,
                                name: subName
                            }
                        });
                    }
                }
            }
            // Update Executives
            if (execRes.ok) {
                const contentTypeExec = execRes.headers.get('content-type') || '';
                if (contentTypeExec.includes('application/json')) {
                    const execData = await execRes.json();
                    const execBindings = execData.results?.bindings || [];
                    for (const eb of execBindings) {
                        const name = eb.personLabel?.value;
                        const role = eb.roleLabel?.value;
                        if (!name || name.startsWith('http') || /^Q\d+$/.test(name))
                            continue;
                        const type = role === 'Board Member' || role === 'Chairperson' ? 'BOARD' : 'LEADERSHIP';
                        const existing = await prisma_1.prisma.companyExecutive.findFirst({
                            where: { companyId: company.id, name }
                        });
                        if (!existing) {
                            await prisma_1.prisma.companyExecutive.create({
                                data: {
                                    companyId: company.id,
                                    name,
                                    title: role,
                                    type
                                }
                            });
                        }
                    }
                }
            }
            console.log(`[SYNC] Successfully updated ${company.name} from Wikidata.`);
        }
        catch (error) {
            console.error(`[SYNC] Error syncing Wikidata for ${company.name}:`, error.message);
        }
        // Rate limiting: wait 1 second between requests to Wikidata
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    // Update Sync State
    await prisma_1.prisma.apiSyncState.upsert({
        where: { apiName: 'Wikidata' },
        update: { lastSyncTime: new Date(), status: 'SUCCESS', totalRecords: companies.length },
        create: { apiName: 'Wikidata', status: 'SUCCESS', totalRecords: companies.length }
    });
    console.log('[SYNC] Wikidata synchronization completed.');
}
if (require.main === module) {
    syncWikidata().then(() => process.exit(0)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
