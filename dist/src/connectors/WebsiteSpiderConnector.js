"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteSpiderConnector = void 0;
const BaseConnector_1 = require("./BaseConnector");
class WebsiteSpiderConnector extends BaseConnector_1.BaseConnector {
    constructor() {
        super('WEBSITE_SPIDER', '', 1); // External URLs provided dynamically
    }
    async fetchHomepage(url) {
        return this.get(url, { responseType: 'text' });
    }
}
exports.WebsiteSpiderConnector = WebsiteSpiderConnector;
