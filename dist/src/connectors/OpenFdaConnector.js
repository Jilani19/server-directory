"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenFdaConnector = void 0;
const BaseConnector_1 = require("./BaseConnector");
class OpenFdaConnector extends BaseConnector_1.BaseConnector {
    constructor() {
        super('OPENFDA', 'https://api.fda.gov', 3);
    }
    async searchDrugs(companyName) {
        return this.get(`/drug/ndc.json?search=openfda.manufacturer_name:"\${encodeURIComponent(companyName)}"\&limit=100`);
    }
}
exports.OpenFdaConnector = OpenFdaConnector;
