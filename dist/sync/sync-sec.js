"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncSec = syncSec;
const prisma_1 = require("../config/prisma");
const SEC_TICKER_TO_CIK_URL = 'https://www.sec.gov/files/company_tickers.json';
async function syncSec() {
    console.log('[SYNC] Starting SEC synchronization...');
    try {
        const fetchOptions = {
            headers: {
                'User-Agent': 'cGxPDirectory contact@cgxp.directory'
            }
        };
        // First fetch the CIK mapping to find the company
        const tickerRes = await fetch(SEC_TICKER_TO_CIK_URL, fetchOptions);
        if (!tickerRes.ok)
            throw new Error('Failed to fetch SEC ticker mapping');
        const tickerData = await tickerRes.json();
        const companies = await prisma_1.prisma.company.findMany({
            where: { isDeleted: false },
            select: { id: true, name: true, ticker: true, cik: true, stockExchange: true, jurisdiction: true, hqAddress: true, companyNumber: true, latestSecFiling: true }
        });
        let successCount = 0;
        for (const company of companies) {
            console.log(`[SYNC] Fetching SEC data for ${company.name}...`);
            try {
                let cikStr = company.cik;
                if (!cikStr) {
                    const searchTarget = (company.ticker || company.name).toLowerCase();
                    for (const key in tickerData) {
                        const entry = tickerData[key];
                        if (company.ticker && entry.ticker.toLowerCase() === searchTarget) {
                            cikStr = entry.cik_str.toString().padStart(10, '0');
                            break;
                        }
                        else if (!company.ticker && entry.title.toLowerCase().includes(searchTarget)) {
                            cikStr = entry.cik_str.toString().padStart(10, '0');
                            break;
                        }
                    }
                }
                if (!cikStr) {
                    console.log(`[SYNC] SEC CIK not found for ${company.name}`);
                    continue;
                }
                // Fetch the detailed submission data using the CIK
                const submissionsUrl = `https://data.sec.gov/submissions/CIK${cikStr}.json`;
                const subRes = await fetch(submissionsUrl, fetchOptions);
                if (!subRes.ok) {
                    console.error(`[SYNC] Failed to fetch SEC submissions for CIK ${cikStr}`);
                    continue;
                }
                const subData = await subRes.json();
                // Update Company with SEC info
                await prisma_1.prisma.company.update({
                    where: { id: company.id },
                    data: {
                        cik: cikStr,
                        legalName: subData.name || company.name,
                        ticker: company.ticker || subData.tickers?.[0],
                        stockExchange: company.stockExchange || subData.exchanges?.[0],
                        jurisdiction: company.jurisdiction || subData.stateOfIncorporation,
                        hqAddress: company.hqAddress || (subData.addresses?.business?.city ? `${subData.addresses.business.city}, ${subData.addresses.business.stateOrProvince || ''}` : undefined),
                        companyNumber: subData.ein || undefined,
                        latestSecFiling: subData.filings?.recent?.accessionNumber?.[0] || undefined
                    }
                });
                const recentFilings = subData.filings?.recent;
                if (recentFilings && recentFilings.accessionNumber) {
                    const forms = recentFilings.form || [];
                    const accessions = recentFilings.accessionNumber;
                    const reportDates = recentFilings.reportDate || [];
                    for (let i = 0; i < Math.min(10, accessions.length); i++) {
                        const form = forms[i];
                        const acc = accessions[i];
                        // Format SEC accession URL
                        const noDashes = acc.replace(/-/g, '');
                        const url = `https://www.sec.gov/Archives/edgar/data/${parseInt(cikStr, 10)}/${noDashes}/${acc}.txt`;
                        const existingDoc = await prisma_1.prisma.companyDocument.findFirst({
                            where: { companyId: company.id, title: `SEC Form ${form}` }
                        });
                        if (!existingDoc) {
                            await prisma_1.prisma.companyDocument.create({
                                data: {
                                    companyId: company.id,
                                    title: `SEC Form ${form}`,
                                    type: 'SEC Filing',
                                    category: form,
                                    url
                                }
                            });
                        }
                    }
                }
                successCount++;
                console.log(`[SYNC] Successfully updated ${company.name} from SEC.`);
            }
            catch (err) {
                console.error(`[SYNC] Error syncing SEC for ${company.name}:`, err.message);
            }
            // SEC enforces a limit of 10 requests per second
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        await prisma_1.prisma.apiSyncState.upsert({
            where: { apiName: 'SEC' },
            update: { lastSyncTime: new Date(), status: 'SUCCESS', totalRecords: successCount },
            create: { apiName: 'SEC', status: 'SUCCESS', totalRecords: successCount }
        });
    }
    catch (error) {
        console.error('[SYNC] SEC Sync Failed:', error.message);
        await prisma_1.prisma.apiSyncState.upsert({
            where: { apiName: 'SEC' },
            update: { lastSyncTime: new Date(), status: 'ERROR', errorMessage: error.message },
            create: { apiName: 'SEC', status: 'ERROR', errorMessage: error.message }
        });
    }
    console.log('[SYNC] SEC synchronization completed.');
}
if (require.main === module) {
    syncSec().then(() => process.exit(0)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
