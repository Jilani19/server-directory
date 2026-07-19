"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncOpenFDA = syncOpenFDA;
const prisma_1 = require("../config/prisma");
async function syncOpenFDA() {
    console.log('[SYNC] Starting OpenFDA synchronization...');
    const companies = await prisma_1.prisma.company.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true }
    });
    let successCount = 0;
    for (const company of companies) {
        try {
            const firstWord = company.name.split(/[\s&]+/)[0].replace(/[^a-zA-Z0-9]/g, '');
            const url = `https://api.fda.gov/drug/label.json?search=openfda.manufacturer_name:*${encodeURIComponent(firstWord)}*&limit=1000`;
            const res = await fetch(url);
            if (!res.ok)
                continue;
            const data = await res.json();
            const results = data?.results || [];
            for (const prod of results) {
                const openfda = prod.openfda;
                if (!openfda || !openfda.brand_name)
                    continue;
                const brandName = openfda.brand_name[0];
                const genericName = openfda.generic_name ? openfda.generic_name[0] : null;
                const route = openfda.route ? openfda.route[0] : null;
                const productType = openfda.product_type ? openfda.product_type[0] : null;
                const slug = `${company.name}-${brandName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                await prisma_1.prisma.product.upsert({
                    where: { slug },
                    update: {
                        name: brandName,
                        genericName,
                        dosageForm: route,
                        therapeuticArea: productType,
                        approvalStatus: 'Approved'
                    },
                    create: {
                        slug,
                        companyId: company.id,
                        name: brandName,
                        genericName,
                        dosageForm: route,
                        therapeuticArea: productType,
                        approvalStatus: 'Approved'
                    }
                });
            }
            successCount++;
            console.log(`[SYNC] Upserted ${results.length} products for ${company.name}`);
        }
        catch (e) {
            console.error(`[SYNC] Error OpenFDA for ${company.name}:`, e.message);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    await prisma_1.prisma.apiSyncState.upsert({
        where: { apiName: 'OpenFDA' },
        update: { lastSyncTime: new Date(), status: 'SUCCESS', totalRecords: successCount },
        create: { apiName: 'OpenFDA', status: 'SUCCESS', totalRecords: successCount }
    });
    console.log('[SYNC] OpenFDA synchronization completed.');
}
if (require.main === module) {
    syncOpenFDA().then(() => process.exit(0)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
