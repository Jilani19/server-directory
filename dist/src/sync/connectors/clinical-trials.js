"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalTrialsConnector = void 0;
const base_1 = require("./base");
const prisma_1 = require("../../config/prisma");
const crypto_1 = __importDefault(require("crypto"));
class ClinicalTrialsConnector extends base_1.BaseConnector {
    name = "ClinicalTrials.gov_ARES_API";
    version = "1.0.0";
    async execute(companyId) {
        if (!companyId)
            return { success: false, message: "Company ID required" };
        const company = await prisma_1.prisma.company.findUnique({ where: { id: companyId } });
        if (!company)
            return { success: false, message: "Company not found" };
        try {
            // Mocked axios call to clinicaltrials.gov V2 ARES API
            // In reality: https://clinicaltrials.gov/api/v2/studies?query.sponsor=${company.name}
            const mockPayload = {
                nctId: "NCT" + Math.floor(Math.random() * 10000000).toString(),
                title: `Phase 3 Study of Novel Compound by ${company.name}`,
                status: "RECRUITING",
                phase: "PHASE_3",
                drugs: ["MockDrug-A", "MockDrug-B"]
            };
            const checksum = crypto_1.default.createHash("sha256").update(JSON.stringify(mockPayload)).digest("hex");
            await this.saveStagingPayload("ClinicalTrials.gov", "/api/v2/studies", mockPayload, checksum);
            // Normalization Engine Simulation
            const trial = await prisma_1.prisma.globalClinicalTrial.upsert({
                where: { nctId: mockPayload.nctId },
                update: {
                    title: mockPayload.title,
                    status: mockPayload.status,
                    phase: mockPayload.phase
                },
                create: {
                    nctId: mockPayload.nctId,
                    title: mockPayload.title,
                    status: mockPayload.status,
                    phase: mockPayload.phase
                }
            });
            // Link to Company (Knowledge Graph Edge)
            await prisma_1.prisma.companyTrialRelation.create({
                data: {
                    companyId: company.id,
                    trialId: trial.id,
                    role: "LEAD_SPONSOR"
                }
            });
            return { success: true, payload: mockPayload };
        }
        catch (e) {
            return { success: false, message: e.message };
        }
    }
}
exports.ClinicalTrialsConnector = ClinicalTrialsConnector;
