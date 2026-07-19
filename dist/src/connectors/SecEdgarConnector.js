"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecEdgarConnector = void 0;
const BaseConnector_1 = require("./BaseConnector");
class SecEdgarConnector extends BaseConnector_1.BaseConnector {
    constructor() {
        // SEC requires a 10 requests per second rate limit and a specific User-Agent
        super('SEC_EDGAR', 'https://data.sec.gov', 10);
        this.client.defaults.headers.common['User-Agent'] = 'CompanyIntelligence Platform admin@company.com';
    }
    async getSubmissions(cik) {
        const paddedCik = cik.padStart(10, '0');
        return this.get(`/submissions/CIK\${paddedCik}.json`);
    }
    async getCompanyConcepts(cik, taxonomy, tag) {
        const paddedCik = cik.padStart(10, '0');
        return this.get(`/api/xbrl/companyconcept/CIK\${paddedCik}/\${taxonomy}/\${tag}.json`);
    }
}
exports.SecEdgarConnector = SecEdgarConnector;
