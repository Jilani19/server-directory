"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncYahooFinance = syncYahooFinance;
const prisma_1 = require("../config/prisma");
const YahooFinance = require('yahoo-finance2').default;
const yahooFinance = new YahooFinance();
async function syncYahooFinance() {
    console.log('[SYNC] Starting Yahoo Finance synchronization...');
    const companies = await prisma_1.prisma.company.findMany({
        where: { isDeleted: false, ticker: { not: null } }
    });
    for (const company of companies) {
        if (!company.ticker)
            continue;
        // Attempt to extract purely alphanumeric ticker if it contains exchange info (e.g. NYSE:JNJ -> JNJ)
        let searchTicker = company.ticker;
        if (searchTicker.includes(':')) {
            searchTicker = searchTicker.split(':')[1];
        }
        console.log(`[SYNC] Fetching Yahoo Finance for ${company.name} (${searchTicker})...`);
        try {
            // Get Quote for real-time price and market cap
            const quote = await yahooFinance.quote(searchTicker);
            // Get Financial Data for revenue, income, cash, debt, etc.
            const quoteSummary = await yahooFinance.quoteSummary(searchTicker, {
                modules: ['summaryProfile', 'financialData', 'defaultKeyStatistics', 'summaryDetail']
            });
            const profile = quoteSummary.summaryProfile;
            const financial = quoteSummary.financialData;
            const keyStats = quoteSummary.defaultKeyStatistics;
            const detail = quoteSummary.summaryDetail;
            const updateData = {};
            if (quote) {
                if (quote.marketCap)
                    updateData.marketCap = quote.marketCap.toString();
                if (quote.regularMarketPrice)
                    updateData.stockPrice = quote.regularMarketPrice.toString();
                if (quote.currency)
                    updateData.currency = quote.currency;
                if (quote.fiftyTwoWeekHigh)
                    updateData.fiftyTwoWeekHigh = quote.fiftyTwoWeekHigh.toString();
                if (quote.fiftyTwoWeekLow)
                    updateData.fiftyTwoWeekLow = quote.fiftyTwoWeekLow.toString();
                if (quote.epsTrailingTwelveMonths)
                    updateData.eps = quote.epsTrailingTwelveMonths.toString();
                if (quote.trailingPE)
                    updateData.peRatio = quote.trailingPE.toString();
                if (quote.sharesOutstanding)
                    updateData.sharesOutstanding = quote.sharesOutstanding.toString();
            }
            if (profile) {
                if (profile.fullTimeEmployees && !company.employees) {
                    updateData.employees = profile.fullTimeEmployees.toString();
                }
                if (profile.website && !company.website) {
                    updateData.website = profile.website;
                }
                if (profile.phone && !company.phone) {
                    updateData.phone = profile.phone;
                }
            }
            if (financial) {
                if (financial.totalRevenue)
                    updateData.revenue = financial.totalRevenue.toString();
                if (financial.financialCurrency)
                    updateData.currency = financial.financialCurrency;
                if (financial.ebitda)
                    updateData.ebitda = financial.ebitda.toString();
                if (financial.operatingMargins)
                    updateData.operatingIncome = (financial.operatingMargins * (financial.totalRevenue || 0)).toString(); // approximate
                if (financial.totalCash)
                    updateData.cash = financial.totalCash.toString();
                if (financial.totalDebt)
                    updateData.debt = financial.totalDebt.toString();
                if (financial.freeCashflow)
                    updateData.freeCashFlow = financial.freeCashflow.toString();
            }
            if (keyStats) {
                if (keyStats.enterpriseValue)
                    updateData.enterpriseValue = keyStats.enterpriseValue.toString();
                if (keyStats.netIncomeToCommon)
                    updateData.netIncome = keyStats.netIncomeToCommon.toString();
            }
            if (detail) {
                if (detail.dividendYield)
                    updateData.dividend = detail.dividendYield.toString();
            }
            if (Object.keys(updateData).length > 0) {
                await prisma_1.prisma.company.update({
                    where: { id: company.id },
                    data: updateData
                });
                console.log(`[SYNC] Updated financials for ${company.name} (Rev: ${updateData.revenue}, MC: ${updateData.marketCap})`);
            }
            else {
                console.log(`[SYNC] No new financial data for ${company.name}`);
            }
        }
        catch (e) {
            console.error(`[SYNC] Error syncing Yahoo Finance for ${company.name}:`, e.message);
        }
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    await prisma_1.prisma.apiSyncState.upsert({
        where: { apiName: 'YahooFinance' },
        update: { lastSyncTime: new Date(), status: 'SUCCESS', totalRecords: companies.length },
        create: { apiName: 'YahooFinance', status: 'SUCCESS', totalRecords: companies.length }
    });
    console.log('[SYNC] Yahoo Finance synchronization completed.');
}
if (require.main === module) {
    syncYahooFinance().then(() => process.exit(0)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
