"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubMedConnector = void 0;
const BaseConnector_1 = require("./BaseConnector");
class PubMedConnector extends BaseConnector_1.BaseConnector {
    constructor() {
        super('PUBMED', 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils', 3);
    }
    async searchPublications(companyName) {
        return this.get(`/esearch.fcgi?db=pubmed&term=\${encodeURIComponent(companyName)}[Affiliation]&retmode=json`);
    }
}
exports.PubMedConnector = PubMedConnector;
