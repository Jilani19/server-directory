"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YahooFinanceConnector = void 0;
const base_1 = require("./base");
const prisma_1 = require("../../config/prisma");
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const yahooFinance = new yahoo_finance2_1.default();
const crypto_1 = __importDefault(require("crypto"));
const validation_1 = require("../engine/validation");
const ai_pipeline_1 = require("../engine/ai-pipeline");
const identity_resolver_1 = require("../engine/identity-resolver");
class YahooFinanceConnector extends base_1.BaseConnector {
    name = "Yahoo_Finance_V2";
    version = "1.0.0";
    async execute(companyId) {
        if (!companyId)
            return { success: false, message: "Company ID required" };
        const company = await prisma_1.prisma.company.findUnique({ where: { id: companyId } });
        if (!company)
            return { success: false, message: "Company not found" };
        try {
            let ticker = company.ticker;
            if (!ticker) {
                const searchResult = await yahooFinance.search(company.name);
                if (searchResult.quotes.length > 0) {
                    ticker = searchResult.quotes[0].symbol;
                }
            }
            if (!ticker) {
                return { success: false, message: `Could not find ticker for ${company.name}` };
            }
            const quote = await yahooFinance.quoteSummary(ticker, {
                modules: [
                    "price", "summaryProfile", "financialData", "defaultKeyStatistics",
                    "summaryDetail", "incomeStatementHistory", "balanceSheetHistory", "cashflowStatementHistory"
                ]
            });
            const incomeStatement = quote.incomeStatementHistory?.incomeStatementHistory?.[0] || {};
            const balanceSheet = quote.balanceSheetHistory?.balanceSheetStatements?.[0] || {};
            const cashflow = quote.cashflowStatementHistory?.cashflowStatements?.[0] || {};
            const payload = {
                ticker,
                description: quote.summaryProfile?.longBusinessSummary,
                website: quote.summaryProfile?.website,
                phone: quote.summaryProfile?.phone,
                industry: quote.summaryProfile?.industry,
                employees: quote.summaryProfile?.fullTimeEmployees?.toString(),
                marketCap: quote.price?.marketCap?.toString() || quote.summaryDetail?.marketCap?.toString(),
                city: quote.summaryProfile?.city,
                state: quote.summaryProfile?.state,
                country: quote.summaryProfile?.country,
                address: quote.summaryProfile?.address1,
                currency: quote.price?.currency || quote.financialData?.financialCurrency,
                revenue: quote.financialData?.totalRevenue?.toString() || incomeStatement.totalRevenue?.toString(),
                netIncome: quote.financialData?.netIncomeToCommon?.toString() || incomeStatement.netIncome?.toString(),
                ebitda: quote.financialData?.ebitda?.toString() || incomeStatement.ebitda?.toString(),
                operatingIncome: quote.financialData?.operatingMargins?.toString() || incomeStatement.operatingIncome?.toString(),
                rdSpend: incomeStatement.researchDevelopment?.toString(),
                cash: quote.financialData?.totalCash?.toString() || balanceSheet.cash?.toString(),
                debt: quote.financialData?.totalDebt?.toString() || balanceSheet.shortLongTermDebt?.toString(),
                assets: quote.financialData?.totalAssets?.toString() || balanceSheet.totalAssets?.toString(),
                liabilities: balanceSheet.totalLiab?.toString(),
                equity: balanceSheet.totalStockholderEquity?.toString(),
                freeCashflow: quote.financialData?.freeCashflow?.toString(),
                profitMargins: quote.financialData?.profitMargins?.toString(),
                grossMargin: quote.financialData?.grossMargins?.toString(),
                eps: quote.defaultKeyStatistics?.trailingEps?.toString(),
                peRatio: quote.summaryDetail?.trailingPE?.toString(),
                sharesOutstanding: quote.defaultKeyStatistics?.sharesOutstanding?.toString(),
                fiftyTwoWeekHigh: quote.summaryDetail?.fiftyTwoWeekHigh?.toString(),
                fiftyTwoWeekLow: quote.summaryDetail?.fiftyTwoWeekLow?.toString(),
                dividend: quote.summaryDetail?.dividendYield?.toString(),
            };
            const checksum = crypto_1.default.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
            await this.saveStagingPayload("Yahoo Finance", "/v11/finance/quoteSummary", payload, checksum);
            // Verify Identity
            identity_resolver_1.identityResolver.verify(company, {
                ticker: payload.ticker,
                website: payload.website,
                name: company.name, // yahoo search result name is not always accurate, we rely on ticker
                source: "Yahoo Finance"
            });
            // Perform validation logging on Company entity
            const newCompanyData = {
                description: payload.description || company.description,
                phone: payload.phone || company.phone,
                employees: payload.employees || company.employees,
                revenue: payload.revenue || company.revenue,
                marketCap: payload.marketCap || company.marketCap,
                netIncome: payload.netIncome || company.netIncome,
                ebitda: payload.ebitda || company.ebitda,
                operatingIncome: payload.operatingIncome || company.operatingIncome,
                rdSpend: payload.rdSpend || company.rdSpend,
                cash: payload.cash || company.cash,
                debt: payload.debt || company.debt,
                assets: payload.assets || company.assets,
                liabilities: payload.liabilities || company.liabilities,
                equity: payload.equity || company.equity,
                freeCashFlow: payload.freeCashflow || company.freeCashFlow,
                eps: payload.eps || company.eps,
                peRatio: payload.peRatio || company.peRatio,
                sharesOutstanding: payload.sharesOutstanding || company.sharesOutstanding,
                fiftyTwoWeekHigh: payload.fiftyTwoWeekHigh || company.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: payload.fiftyTwoWeekLow || company.fiftyTwoWeekLow,
                dividend: payload.dividend || company.dividend,
                currency: payload.currency || company.currency,
                hqAddress: payload.address || company.hqAddress,
            };
            // Ensure we don't overwrite core identity fields if they exist
            const updateData = { ...newCompanyData, lastSyncSuccess: new Date() };
            if (!company.ticker && payload.ticker)
                updateData.ticker = payload.ticker;
            if (!company.website && payload.website)
                updateData.website = payload.website;
            await (0, validation_1.validateAndHistory)("Company", company.id, "job_placeholder", company, updateData, "Yahoo_Finance");
            // Upsert into Company
            await prisma_1.prisma.company.update({
                where: { id: company.id },
                data: updateData
            });
            const existingPeriod = await prisma_1.prisma.companyFinancialPeriod.findFirst({
                where: { companyId: company.id, quarter: null, year: new Date().getFullYear() }
            });
            const periodData = {
                revenue: payload.revenue,
                netIncome: payload.netIncome,
                operatingIncome: payload.operatingIncome,
                ebitda: payload.ebitda,
                cash: payload.cash,
                debt: payload.debt,
                assets: payload.assets,
                liabilities: payload.liabilities,
                eps: payload.eps,
                dividend: payload.dividend,
            };
            if (existingPeriod) {
                await prisma_1.prisma.companyFinancialPeriod.update({
                    where: { id: existingPeriod.id },
                    data: periodData
                });
            }
            else {
                await prisma_1.prisma.companyFinancialPeriod.create({
                    data: {
                        id: crypto_1.default.randomUUID(),
                        companyId: company.id,
                        quarter: null,
                        year: new Date().getFullYear(),
                        currency: payload.currency,
                        ...periodData
                    }
                });
            }
            // Insert Workforce History
            if (payload.employees) {
                const existingWorkforce = await prisma_1.prisma.companyWorkforce.findFirst({
                    where: { companyId: company.id, year: new Date().getFullYear() }
                });
                const empCount = parseInt(payload.employees, 10);
                if (existingWorkforce) {
                    await prisma_1.prisma.companyWorkforce.update({
                        where: { id: existingWorkforce.id },
                        data: { count: empCount }
                    });
                }
                else {
                    await prisma_1.prisma.companyWorkforce.create({
                        data: {
                            id: crypto_1.default.randomUUID(),
                            companyId: company.id,
                            year: new Date().getFullYear(),
                            count: empCount,
                            hiringTrend: "STABLE"
                        }
                    });
                }
            }
            // Upsert into CompanyFacility (HQ)
            if (payload.city && payload.country) {
                const existing = await prisma_1.prisma.companyFacility.findFirst({ where: { companyId: company.id, type: "HQ" } });
                if (!existing) {
                    await prisma_1.prisma.companyFacility.create({
                        data: {
                            id: crypto_1.default.randomUUID(),
                            companyId: company.id,
                            name: "Global Headquarters",
                            type: "HQ",
                            address: payload.address,
                            city: payload.city,
                            country: payload.country,
                            source: "Yahoo Finance",
                        }
                    });
                }
            }
            // Semantic Chunking for the AI layer
            if (payload.description) {
                await (0, ai_pipeline_1.processAiChunking)("Company", company.id, payload.description);
            }
            return { success: true, payload };
        }
        catch (e) {
            if (e instanceof identity_resolver_1.IdentityMismatchError) {
                console.warn(`[YahooFinance] Identity mismatch rejected for ${companyId}: ${e.message}`);
                // Consider it a success so it doesn't fail the pipeline, but we skip updating
                return { success: true, message: e.message };
            }
            return { success: false, message: e.message };
        }
    }
}
exports.YahooFinanceConnector = YahooFinanceConnector;
