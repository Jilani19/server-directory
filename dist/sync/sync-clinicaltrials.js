"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncClinicalTrials = syncClinicalTrials;
const prisma_1 = require("../config/prisma");
const CLINICAL_TRIALS_API = 'https://clinicaltrials.gov/api/v2/studies';
async function syncClinicalTrials() {
    console.log('[SYNC] Starting Clinical Trials synchronization...');
    const companies = await prisma_1.prisma.company.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true }
    });
    let successCount = 0;
    for (const company of companies) {
        console.log(`[SYNC] Fetching Clinical Trials for ${company.name}...`);
        try {
            const term = company.name;
            const url = `${CLINICAL_TRIALS_API}?query.term=${encodeURIComponent(term)}&pageSize=1000`;
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`[SYNC] Failed to fetch trials for ${term} (Status: ${res.status})`);
                continue;
            }
            const contentType = res.headers.get('content-type') || '';
            if (!contentType.includes('application/json')) {
                console.error(`[SYNC] ClinicalTrials returned non-JSON for ${term}`);
                continue;
            }
            const data = await res.json();
            const studies = data.studies || [];
            for (const study of studies) {
                const protocolSection = study.protocolSection;
                if (!protocolSection)
                    continue;
                const identification = protocolSection.identificationModule;
                const status = protocolSection.statusModule;
                const design = protocolSection.designModule;
                const locationsModule = protocolSection.contactsLocationsModule?.locations || [];
                if (!identification?.nctId)
                    continue;
                const phase = design?.phases ? design.phases.join(', ') : null;
                await prisma_1.prisma.companyClinicalTrial.upsert({
                    where: { nctId: identification.nctId },
                    update: {
                        title: identification.briefTitle || "Unknown",
                        phase,
                        status: status?.overallStatus || null,
                        enrollment: design?.enrollmentInfo?.count || null,
                        url: `https://clinicaltrials.gov/study/${identification.nctId}`
                    },
                    create: {
                        nctId: identification.nctId,
                        companyId: company.id,
                        title: identification.briefTitle || "Unknown",
                        phase,
                        status: status?.overallStatus || null,
                        enrollment: design?.enrollmentInfo?.count || null,
                        url: `https://clinicaltrials.gov/study/${identification.nctId}`
                    }
                });
            }
            successCount++;
            console.log(`[SYNC] Upserted ${studies.length} clinical trials for ${company.name}.`);
            // We handle pagination if we want to fetch all trials, but for now we fetch up to 1000
        }
        catch (error) {
            console.error(`[SYNC] Error syncing trials for ${company.name}:`, error.message);
        }
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    await prisma_1.prisma.apiSyncState.upsert({
        where: { apiName: 'ClinicalTrials' },
        update: { lastSyncTime: new Date(), status: 'SUCCESS', totalRecords: successCount },
        create: { apiName: 'ClinicalTrials', status: 'SUCCESS', totalRecords: successCount }
    });
    console.log('[SYNC] Clinical Trials synchronization completed.');
}
if (require.main === module) {
    syncClinicalTrials().then(() => process.exit(0)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
