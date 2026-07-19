"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncWikipedia = syncWikipedia;
const prisma_1 = require("../config/prisma");
async function syncWikipedia() {
    console.log('[SYNC] Starting Wikipedia synchronization...');
    const companies = await prisma_1.prisma.company.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true }
    });
    let successCount = 0;
    for (const company of companies) {
        try {
            const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(company.name)}`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'cGxPDirectoryBot/1.0 (contact@cgxp.directory)' }
            });
            if (!res.ok) {
                continue;
            }
            const data = await res.json();
            if (data.extract) {
                // Fetch short summary for Hero (first two sentences)
                const summary = data.extract;
                const heroSentences = summary.split('. ').slice(0, 2).join('. ') + (summary.includes('. ') ? '.' : '');
                // Fetch full article for detailed paragraphs
                const fullRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&titles=${encodeURIComponent(company.name)}&format=json`, {
                    headers: { 'User-Agent': 'cGxP‑Directory/1.0 (contact@cgxp.com)' },
                });
                let businessOverview = null;
                let description = null;
                let history = null;
                if (fullRes.ok) {
                    const fullJson = await fullRes.json();
                    const pages = fullJson.query?.pages || {};
                    const pageKey = Object.keys(pages)[0];
                    const fullText = pages[pageKey]?.extract || '';
                    // Split on double newlines – Wikipedia separates sections this way
                    const paragraphs = fullText.split('\n\n').filter((p) => p.trim().length > 0);
                    // Assign paragraphs with graceful fallbacks if sections are missing
                    const bo = paragraphs[0];
                    const desc = paragraphs[1];
                    const his = paragraphs[2];
                    businessOverview = bo ?? heroSentences;
                    description = desc ?? businessOverview;
                    history = his ?? description;
                }
                console.log('Before update:', { aboutDescription: heroSentences, businessOverview, description, history });
                await prisma_1.prisma.company.update({
                    where: { id: company.id },
                    data: {
                        aboutDescription: heroSentences,
                        businessOverview: businessOverview,
                        description: description,
                        history: history,
                        rawApiData: JSON.stringify({ source: 'Wikipedia', verifiedAt: new Date().toISOString() })
                    }
                });
                successCount++;
                console.log(`[SYNC] Updated Wikipedia overview for ${company.name}`);
            }
        }
        catch (e) {
            console.error(`[SYNC] Error Wikipedia for ${company.name}:`, e.message);
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    await prisma_1.prisma.apiSyncState.upsert({
        where: { apiName: 'Wikipedia' },
        update: { lastSyncTime: new Date(), status: 'SUCCESS', totalRecords: successCount },
        create: { apiName: 'Wikipedia', status: 'SUCCESS', totalRecords: successCount }
    });
    console.log('[SYNC] Wikipedia synchronization completed.');
}
// This script is intended to be run programmatically. The CLI entry point has been removed to avoid TypeScript issues.
