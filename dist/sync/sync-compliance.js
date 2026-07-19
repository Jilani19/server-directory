"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCompliance = syncCompliance;
const prisma_1 = require("../config/prisma");
async function syncCompliance() {
    console.log('[SYNC] Starting OpenFDA Compliance synchronization...');
    const companies = await prisma_1.prisma.company.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true }
    });
    let successCount = 0;
    for (const company of companies) {
        try {
            const firstWord = company.name.split(/[\s&]+/)[0].replace(/[^a-zA-Z0-9]/g, '');
            const url = `https://api.fda.gov/drug/enforcement.json?search=recalling_firm:*${encodeURIComponent(firstWord)}*&limit=1000`;
            const res = await fetch(url);
            if (!res.ok)
                continue;
            const data = await res.json();
            const results = data?.results || [];
            let added = 0;
            for (const enf of results) {
                if (!enf.recall_number)
                    continue;
                const existing = await prisma_1.prisma.companyDocument.findFirst({
                    where: { companyId: company.id, title: `FDA Recall: ${enf.recall_number}` }
                });
                if (!existing) {
                    await prisma_1.prisma.companyDocument.create({
                        data: {
                            companyId: company.id,
                            title: `FDA Recall: ${enf.recall_number}`,
                            type: 'Recall',
                            category: enf.status,
                            url: `https://www.accessdata.fda.gov/scripts/ires/index.cfm`
                        }
                    });
                    added++;
                }
            }
            successCount++;
            console.log(`[SYNC] Upserted ${added} compliance records for ${company.name}`);
        }
        catch (e) {
            console.error(`[SYNC] Error Compliance for ${company.name}:`, e.message);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    await prisma_1.prisma.apiSyncState.upsert({
        where: { apiName: 'Compliance' },
        update: { lastSyncTime: new Date(), status: 'SUCCESS', totalRecords: successCount },
        create: { apiName: 'Compliance', status: 'SUCCESS', totalRecords: successCount }
    });
    console.log('[SYNC] Compliance synchronization completed.');
}
if (require.main === module) {
    syncCompliance().then(() => process.exit(0)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
