"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncExecutives = syncExecutives;
const prisma_1 = require("../config/prisma");
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
async function syncExecutives() {
    console.log('[SYNC] Starting Executive synchronization (Yahoo Finance)...');
    const companies = await prisma_1.prisma.company.findMany({
        where: { isDeleted: false, ticker: { not: null } }
    });
    let successCount = 0;
    for (const company of companies) {
        if (!company.ticker)
            continue;
        let searchTicker = company.ticker;
        if (searchTicker.includes(':')) {
            searchTicker = searchTicker.split(':')[1];
        }
        console.log(`[SYNC] Fetching Executives for ${company.name} (${searchTicker})...`);
        try {
            const quoteSummary = await yahooFinance.quoteSummary(searchTicker, { modules: ['assetProfile'] });
            const profile = quoteSummary.assetProfile;
            if (profile && profile.companyOfficers) {
                let addedCount = 0;
                for (const officer of profile.companyOfficers) {
                    if (!officer.name)
                        continue;
                    const type = officer.title && (officer.title.toLowerCase().includes('board') || officer.title.toLowerCase().includes('director')) ? 'BOARD' : 'LEADERSHIP';
                    const existing = await prisma_1.prisma.companyExecutive.findFirst({
                        where: { companyId: company.id, name: officer.name }
                    });
                    if (!existing) {
                        await prisma_1.prisma.companyExecutive.create({
                            data: {
                                companyId: company.id,
                                name: officer.name,
                                title: officer.title || 'Executive',
                                type
                            }
                        });
                        addedCount++;
                    }
                }
                console.log(`[SYNC] Added ${addedCount} executives for ${company.name}`);
                if (addedCount > 0)
                    successCount++;
            }
        }
        catch (e) {
            console.error(`[SYNC] Error syncing Executives for ${company.name}:`, e.message);
        }
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    await prisma_1.prisma.apiSyncState.upsert({
        where: { apiName: 'Executives' },
        update: { lastSyncTime: new Date(), status: 'SUCCESS', totalRecords: successCount },
        create: { apiName: 'Executives', status: 'SUCCESS', totalRecords: successCount }
    });
    console.log('[SYNC] Executive synchronization completed.');
}
if (require.main === module) {
    syncExecutives().then(() => process.exit(0)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
