"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncNews = syncNews;
const prisma_1 = require("../config/prisma");
const rss_parser_1 = __importDefault(require("rss-parser"));
const parser = new rss_parser_1.default();
async function syncNews() {
    console.log('[SYNC] Starting News synchronization (Google News RSS)...');
    const companies = await prisma_1.prisma.company.findMany({
        where: { isDeleted: false }
    });
    for (const company of companies) {
        console.log(`[SYNC] Fetching News for ${company.name}...`);
        try {
            const feedUrl = `https://news.google.com/rss/search?q=${encodeURIComponent('"' + company.name + '"+pharmaceutical OR biotech')}&hl=en-US&gl=US&ceid=US:en`;
            const feed = await parser.parseURL(feedUrl);
            const articles = feed.items.slice(0, 5); // Take top 5 recent news
            for (const item of articles) {
                if (!item.title || !item.link)
                    continue;
                const existing = await prisma_1.prisma.companyNews.findFirst({
                    where: { companyId: company.id, url: item.link }
                });
                if (!existing) {
                    await prisma_1.prisma.companyNews.create({
                        data: {
                            companyId: company.id,
                            title: item.title,
                            url: item.link,
                            source: item.source || 'Google News',
                            date: item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                        }
                    });
                }
            }
            console.log(`[SYNC] Successfully updated news for ${company.name}`);
        }
        catch (e) {
            console.error(`[SYNC] Error syncing News for ${company.name}:`, e.message);
        }
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    await prisma_1.prisma.apiSyncState.upsert({
        where: { apiName: 'News' },
        update: { lastSyncTime: new Date(), status: 'SUCCESS', totalRecords: companies.length },
        create: { apiName: 'News', status: 'SUCCESS', totalRecords: companies.length }
    });
    console.log('[SYNC] News synchronization completed.');
}
if (require.main === module) {
    syncNews().then(() => process.exit(0)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
