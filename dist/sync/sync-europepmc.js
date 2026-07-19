"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncEuropePMC = syncEuropePMC;
const prisma_1 = require("../config/prisma");
async function syncEuropePMC() {
    console.log('[SYNC] Starting Europe PMC synchronization...');
    const companies = await prisma_1.prisma.company.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true }
    });
    let successCount = 0;
    for (const company of companies) {
        try {
            const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=AFF:"${encodeURIComponent(company.name)}"&format=json&resultType=lite&pageSize=1000`;
            const res = await fetch(url);
            if (!res.ok)
                continue;
            const data = await res.json();
            const results = data?.resultList?.result || [];
            for (const pub of results) {
                if (!pub.pmid && !pub.doi)
                    continue;
                await prisma_1.prisma.companyPublication.upsert({
                    where: { pmid: pub.pmid || pub.doi },
                    update: {
                        title: pub.title,
                        journal: pub.journalTitle,
                        publicationDate: pub.pubYear,
                        authors: pub.authorString,
                        url: pub.doi ? `https://doi.org/${pub.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}`,
                        doi: pub.doi || undefined
                    },
                    create: {
                        pmid: pub.pmid || pub.doi,
                        doi: pub.doi || undefined,
                        companyId: company.id,
                        title: pub.title,
                        journal: pub.journalTitle,
                        publicationDate: pub.pubYear,
                        authors: pub.authorString,
                        url: pub.doi ? `https://doi.org/${pub.doi}` : `https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}`
                    }
                });
            }
            // Fetch Patents
            const patUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=SRC:PAT AND "${encodeURIComponent(company.name)}"&format=json&resultType=lite&pageSize=1000`;
            const patRes = await fetch(patUrl);
            if (patRes.ok) {
                const patData = await patRes.json();
                const patResults = patData?.resultList?.result || [];
                for (const pat of patResults) {
                    if (!pat.id)
                        continue;
                    await prisma_1.prisma.companyPatent.upsert({
                        where: { patentNumber: pat.id },
                        update: {
                            title: pat.title || 'Patent',
                            agencies: pat.authorString || 'EuropePMC',
                            url: `https://europepmc.org/patents/PAT/${pat.id}`
                        },
                        create: {
                            patentNumber: pat.id,
                            companyId: company.id,
                            title: pat.title || 'Patent',
                            status: 'Active',
                            agencies: pat.authorString || 'EuropePMC',
                            url: `https://europepmc.org/patents/PAT/${pat.id}`
                        }
                    });
                }
            }
            successCount++;
            console.log(`[SYNC] Upserted ${results.length} publications and patents for ${company.name}`);
        }
        catch (e) {
            console.error(`[SYNC] Error Europe PMC for ${company.name}:`, e.message);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    await prisma_1.prisma.apiSyncState.upsert({
        where: { apiName: 'EuropePMC' },
        update: { lastSyncTime: new Date(), status: 'SUCCESS', totalRecords: successCount },
        create: { apiName: 'EuropePMC', status: 'SUCCESS', totalRecords: successCount }
    });
    console.log('[SYNC] Europe PMC synchronization completed.');
}
if (require.main === module) {
    syncEuropePMC().then(() => process.exit(0)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
