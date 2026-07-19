"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GleifConnector = void 0;
const BaseConnector_1 = require("./BaseConnector");
class GleifConnector extends BaseConnector_1.BaseConnector {
    constructor() {
        super('GLEIF', 'https://api.gleif.org/api/v1', 5);
    }
    async searchCompany(name) {
        return this.get(`/lei-records?filter[entity.legalName]=\${encodeURIComponent(name)}`);
    }
    async getByLei(lei) {
        return this.get(`/lei-records/\${lei}`);
    }
}
exports.GleifConnector = GleifConnector;
