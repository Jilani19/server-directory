"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YahooFinanceConnector = void 0;
const base_1 = require("./base");
const prisma_1 = require("../../config/prisma");
const yahoo_finance2_1 = __importDefault(require("yahoo-finance2"));
const crypto_1 = __importDefault(require("crypto"));
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
            const yf = new yahoo_finance2_1.default({ suppressNotices: ['yahooSurvey'] });
            let ticker = company.ticker;
            if (!ticker) {
                const searchResult = await yf.search(company.name);
                if (searchResult.quotes.length > 0) {
                    ticker = searchResult.quotes[0].symbol;
                }
            }
            if (!ticker) {
                return { success: false, message: `Could not find ticker for ${company.name}` };
            }
            const quote = await yf.quoteSummary(ticker, { modules: ["price", "summaryProfile", "financialData", "defaultKeyStatistics"] });
            const payload = {
                ticker,
                description: quote.summaryProfile?.longBusinessSummary,
                website: quote.summaryProfile?.website,
                phone: quote.summaryProfile?.phone,
                industry: quote.summaryProfile?.industry,
                employees: quote.summaryProfile?.fullTimeEmployees?.toString(),
                marketCap: quote.price?.marketCap?.toString(),
                city: quote.summaryProfile?.city,
                state: quote.summaryProfile?.state,
                country: quote.summaryProfile?.country,
                address: quote.summaryProfile?.address1,
                currency: quote.price?.currency,
                revenue: quote.financialData?.totalRevenue?.toString(),
                netIncome: quote.defaultKeyStatistics?.netIncomeToCommon?.toString(),
                cash: quote.financialData?.totalCash?.toString(),
                debt: quote.financialData?.totalDebt?.toString(),
                ebitda: quote.financialData?.ebitda?.toString(),
            };
            const checksum = crypto_1.default.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
            await this.saveStagingPayload("Yahoo Finance", "/v11/finance/quoteSummary", payload, checksum);
            // Upsert into Company (since original schema uses string fields directly on Company)
            await prisma_1.prisma.company.update({
                where: { id: company.id },
                data: {
                    ticker: payload.ticker,
                    description: payload.description || company.description,
                    website: payload.website || company.website,
                    phone: payload.phone || company.phone,
                    employees: payload.employees || company.employees,
                    revenue: payload.revenue || company.revenue,
                    marketCap: payload.marketCap || company.marketCap,
                    netIncome: payload.netIncome || company.netIncome,
                    cash: payload.cash || company.cash,
                    debt: payload.debt || company.debt,
                    ebitda: payload.ebitda || company.ebitda,
                    currency: payload.currency || company.currency,
                    hqAddress: payload.address || company.hqAddress,
                    lastSyncSuccess: new Date(),
                }
            });
            // Upsert into CompanyFacility (HQ)
            if (payload.city && payload.country) {
                const existing = await prisma_1.prisma.companyFacility.findFirst({ where: { companyId: company.id, type: "HQ" } });
                if (!existing) {
                    await prisma_1.prisma.companyFacility.create({
                        data: {
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
            return { success: true, payload };
        }
        catch (e) {
            return { success: false, message: e.message };
        }
    }
}
exports.YahooFinanceConnector = YahooFinanceConnector;
