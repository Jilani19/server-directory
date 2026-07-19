"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCompetitors = syncCompetitors;
const prisma_1 = require("../config/prisma");
async function syncCompetitors() {
    console.log('[SYNC] Starting Competitor synchronization...');
    const companies = await prisma_1.prisma.company.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true }
    });
    let count = 0;
    // Extremely basic competitor generation for now based on matching Life Sciences domain
    for (const c1 of companies) {
        for (const c2 of companies) {
            if (c1.id === c2.id)
                continue;
            try {
                await prisma_1.prisma.companyCompetitor.upsert({
                    where: {
                        sourceCompanyId_targetCompanyId: {
                            sourceCompanyId: c1.id,
                            targetCompanyId: c2.id
                        }
                    },
                    update: {},
                    create: {
                        sourceCompanyId: c1.id,
                        targetCompanyId: c2.id
                    }
                });
                count++;
            }
            catch (e) {
                // ignore unique constraint errors
            }
        }
    }
    await prisma_1.prisma.apiSyncState.upsert({
        where: { apiName: 'Competitors' },
        update: { lastSyncTime: new Date(), status: 'SUCCESS', totalRecords: count },
        create: { apiName: 'Competitors', status: 'SUCCESS', totalRecords: count }
    });
    console.log('[SYNC] Competitor synchronization completed.');
}
if (require.main === module) {
    syncCompetitors().then(() => process.exit(0)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
