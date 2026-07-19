"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClinicalTrialsConnector = void 0;
const BaseConnector_1 = require("./BaseConnector");
class ClinicalTrialsConnector extends BaseConnector_1.BaseConnector {
    constructor() {
        super('CLINICAL_TRIALS', 'https://clinicaltrials.gov/api/v2', 5);
    }
    async searchTrialsBySponsor(sponsorName) {
        return this.get(`/studies?query.leadSponsor=\${encodeURIComponent(sponsorName)}\&pageSize=100`);
    }
}
exports.ClinicalTrialsConnector = ClinicalTrialsConnector;
