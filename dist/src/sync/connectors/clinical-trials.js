"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalTrialsConnector = void 0;
const base_1 = require("./base");
const prisma_1 = require("../../config/prisma");
const crypto_1 = __importDefault(require("crypto"));
const identity_resolver_1 = require("../engine/identity-resolver");
class ClinicalTrialsConnector extends base_1.BaseConnector {
    name = "ClinicalTrials.gov_ARES_API_REAL";
    version = "2.0.0";
    async execute(companyId) {
        if (!companyId)
            return { success: false, message: "Company ID required" };
        const company = await prisma_1.prisma.company.findUnique({ where: { id: companyId } });
        if (!company)
            return { success: false, message: "Company not found" };
        try {
            const url = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(company.name)}&pageSize=1000`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`ARES API returned ${response.status}`);
            }
            const payload = await response.json();
            const checksum = crypto_1.default.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
            await this.saveStagingPayload("ClinicalTrials.gov", url, payload, checksum);
            const studies = payload.studies || [];
            // Verify Identity using the first available sponsor name
            if (studies.length > 0) {
                const firstStudySponsor = studies[0].protocolSection?.sponsorCollaboratorsModule?.leadSponsor?.name;
                if (firstStudySponsor) {
                    identity_resolver_1.identityResolver.verify(company, {
                        name: firstStudySponsor,
                        source: "ClinicalTrials.gov"
                    });
                }
            }
            let activeTrialsCount = 0;
            let completedTrialsCount = 0;
            let phase1 = 0, phase2 = 0, phase3 = 0, phase4 = 0;
            for (const study of studies) {
                const pSec = study.protocolSection;
                if (!pSec)
                    continue;
                const nctId = pSec.identificationModule?.nctId;
                if (!nctId)
                    continue;
                const title = pSec.identificationModule?.briefTitle || pSec.identificationModule?.officialTitle || "Unknown Title";
                const status = pSec.statusModule?.overallStatus || "UNKNOWN";
                const phases = pSec.designModule?.phases?.join(", ") || "";
                const enrollment = pSec.designModule?.enrollmentInfo?.count || null;
                const sponsorName = pSec.sponsorCollaboratorsModule?.leadSponsor?.name || "";
                const officialUrl = `https://clinicaltrials.gov/study/${nctId}`;
                const conditions = pSec.conditionsModule?.conditions?.join(", ") || "";
                const interventions = pSec.armsInterventionsModule?.interventions?.map((i) => i.name).join(", ") || "";
                const arms = pSec.armsInterventionsModule?.armGroups?.map((a) => a.label).join(", ") || "";
                const collaborators = pSec.sponsorCollaboratorsModule?.collaborators?.map((c) => c.name).join(", ") || "";
                const investigators = pSec.contactsLocationsModule?.overallOfficials?.map((o) => o.name).join(", ") || "";
                let countries = new Set();
                let sites = new Set();
                for (const loc of pSec.contactsLocationsModule?.locations || []) {
                    if (loc.country)
                        countries.add(loc.country);
                    if (loc.facility)
                        sites.add(loc.facility);
                }
                const newTrialData = {
                    title,
                    status,
                    phase: phases,
                    enrollment: enrollment,
                    url: officialUrl,
                    conditions,
                    interventions,
                    arms,
                    collaborators,
                    investigators,
                    countries: Array.from(countries).join(", "),
                    sites: Array.from(sites).join(", "),
                    companyId: company.id
                };
                const existingTrial = await prisma_1.prisma.companyClinicalTrial.findUnique({ where: { nctId } });
                if (existingTrial) {
                    await prisma_1.prisma.companyClinicalTrial.update({
                        where: { nctId },
                        data: newTrialData
                    });
                }
                else {
                    await prisma_1.prisma.companyClinicalTrial.create({
                        data: { id: crypto_1.default.randomUUID(), nctId, ...newTrialData }
                    });
                }
                // Also write to global trial to satisfy the graph
                await prisma_1.prisma.globalClinicalTrial.upsert({
                    where: { nctId },
                    update: { title, status, phase: phases, enrollment, officialUrl, sponsorUrl: sponsorName },
                    create: { nctId, title, status, phase: phases, enrollment, officialUrl, sponsorUrl: sponsorName }
                });
                const globalTrial = await prisma_1.prisma.globalClinicalTrial.findUnique({ where: { nctId } });
                if (globalTrial) {
                    const existingRel = await prisma_1.prisma.companyTrialRelation.findFirst({
                        where: { companyId: company.id, trialId: globalTrial.id }
                    });
                    if (!existingRel) {
                        await prisma_1.prisma.companyTrialRelation.create({
                            data: { companyId: company.id, trialId: globalTrial.id, role: "LEAD_SPONSOR" }
                        });
                    }
                }
                // Stats
                if (status.toUpperCase() === "RECRUITING" || status.toUpperCase() === "ACTIVE, NOT RECRUITING")
                    activeTrialsCount++;
                if (status.toUpperCase() === "COMPLETED")
                    completedTrialsCount++;
                if (phases.includes("PHASE1"))
                    phase1++;
                if (phases.includes("PHASE2"))
                    phase2++;
                if (phases.includes("PHASE3"))
                    phase3++;
                if (phases.includes("PHASE4"))
                    phase4++;
            }
            await prisma_1.prisma.company.update({
                where: { id: company.id },
                data: {
                    totalTrialsCount: studies.length,
                    activeTrialsCount,
                    completedTrialsCount,
                    phase1TrialsCount: phase1,
                    phase2TrialsCount: phase2,
                    phase3TrialsCount: phase3,
                    phase4TrialsCount: phase4
                }
            });
            return { success: true, payload: { studiesCount: studies.length } };
        }
        catch (e) {
            if (e instanceof identity_resolver_1.IdentityMismatchError) {
                console.warn(`[ClinicalTrials] Identity mismatch rejected for ${companyId}: ${e.message}`);
                return { success: true, message: e.message };
            }
            return { success: false, message: e.message };
        }
    }
}
exports.ClinicalTrialsConnector = ClinicalTrialsConnector;
