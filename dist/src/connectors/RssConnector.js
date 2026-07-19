"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RssConnector = void 0;
const BaseConnector_1 = require("./BaseConnector");
class RssConnector extends BaseConnector_1.BaseConnector {
    constructor() {
        super('RSS', '', 5);
    }
    async fetchFeed(url) {
        return this.get(url, { responseType: 'text' });
    }
}
exports.RssConnector = RssConnector;
