"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncCompanyDetails = syncCompanyDetails;
const prisma_1 = require("../config/prisma");
/**
 * Sync additional company details (description and history) from SEC filings.
 * This script queries the SEC EDGAR API for each company's CIK (if available)
 * and extracts brief paragraphs to populate the `description` and `history`
 * fields in the database.
 *
 * It uses the latest filing (e.g., 10-K) as a source of verified information.
 */
async function syncCompanyDetails() {
    console.log('[SYNC] Starting SEC company details sync...');
    const companies = await prisma_1.prisma.company.findMany({
        where: { isDeleted: false },
        select: { id: true, name: true, cik: true, description: true, history: true },
    });
    let success = 0;
    for (const comp of companies) {
        if (!comp.cik)
            continue; // No SEC identifier, skip
        if (comp.description && comp.history)
            continue; // Already populated
        try {
            // Fetch company submissions index
            const cikPadded = comp.cik.padStart(10, '0');
            const url = `https://data.sec.gov/submissions/CIK${cikPadded}.json`;
            const res = await fetch(url, {
                headers: { 'User-Agent': 'cGxPDirectoryBot/1.0 (contact@cgxp.directory)' },
            });
            if (!res.ok)
                continue;
            const data = await res.json();
            // Find the most recent 10-K filing
            const filing = data.filings?.recent?.form?.find((f) => f === '10-K');
            if (!filing)
                continue;
            const idx = data.filings.recent.form.findIndex((f) => f === '10-K');
            const accessionNumber = data.filings.recent.accessionNumber[idx];
            const filingUrl = `https://www.sec.gov/Archives/edgar/data/${parseInt(comp.cik)}/${accessionNumber.replace(/-/g, '')}/${accessionNumber}-index.html`;
            const filingRes = await fetch(filingUrl, {
                headers: { 'User-Agent': 'cGxPDirectoryBot/1.0 (contact@cgxp.directory)' },
            });
            if (!filingRes.ok)
                continue;
            const html = await filingRes.text();
            // Very naive extraction: take first two <p> tags as description and history
            const paragraphMatches = html.match(/<p[^>]*>(.*?)<\/p>/gi) || [];
            const clean = (s) => s.replace(/<[^>]+>/g, '').trim();
            const description = paragraphMatches[0] ? clean(paragraphMatches[0]) : null;
            const history = paragraphMatches[1] ? clean(paragraphMatches[1]) : null;
            await prisma_1.prisma.company.update({
                where: { id: comp.id },
                data: {
                    description: description ?? undefined,
                    history: history ?? undefined,
                    rawApiData: JSON.stringify({ source: 'SEC', verifiedAt: new Date().toISOString() }),
                },
            });
            success++;
            console.log(`[SYNC] Updated SEC details for ${comp.name}`);
        }
        catch (e) {
            console.error(`[SYNC] Error fetching SEC data for ${comp.name}:`, e.message);
        }
    }
    console.log(`[SYNC] SEC company details sync completed. Updated ${success} records.`);
}
// When run directly, execute the sync
if (require.main === module) {
    syncCompanyDetails().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
}
