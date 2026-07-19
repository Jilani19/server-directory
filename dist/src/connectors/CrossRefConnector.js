"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossRefConnector = void 0;
const BaseConnector_1 = require("./BaseConnector");
class CrossRefConnector extends BaseConnector_1.BaseConnector {
    constructor() {
        super('CROSSREF', 'https://api.crossref.org', 5);
        this.client.defaults.headers.common['User-Agent'] = 'CompanyIntelligence Platform admin@company.com';
    }
    async searchWorks(companyName) {
        return this.get(`/works?query.affiliation=\${encodeURIComponent(companyName)}\&rows=100`);
    }
}
exports.CrossRefConnector = CrossRefConnector;
