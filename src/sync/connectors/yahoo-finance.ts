import { BaseConnector, ConnectorResponse } from "./base";
import { prisma } from "../../config/prisma";
import YahooFinance2 from "yahoo-finance2";
const yahooFinance = new (YahooFinance2 as any)();
import crypto from "crypto";
import { validateAndHistory } from "../engine/validation";
import { processAiChunking } from "../engine/ai-pipeline";
import { identityResolver, IdentityMismatchError } from "../engine/identity-resolver";

export class YahooFinanceConnector extends BaseConnector {
  name = "Yahoo_Finance_V2";
  version = "1.0.0";

  async execute(companyId?: string): Promise<ConnectorResponse> {
    if (!companyId) return { success: false, message: "Company ID required" };
    
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return { success: false, message: "Company not found" };

    try {
      let ticker = company.ticker;
      if (!ticker) {
        const searchResult: any = await yahooFinance.search(company.name);
        if (searchResult.quotes.length > 0) {
           ticker = searchResult.quotes[0].symbol;
        }
      }

      if (!ticker) {
        return { success: false, message: `Could not find ticker for ${company.name}` };
      }

      const quote: any = await yahooFinance.quoteSummary(ticker, { 
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

      const checksum = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
      await this.saveStagingPayload("Yahoo Finance", "/v11/finance/quoteSummary", payload, checksum);

      // Verify Identity
      identityResolver.verify(company, {
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
      const updateData: any = { ...newCompanyData, lastSyncSuccess: new Date() };
      if (!company.ticker && payload.ticker) updateData.ticker = payload.ticker;
      if (!company.website && payload.website) updateData.website = payload.website;

      await validateAndHistory("Company", company.id, "job_placeholder", company, updateData, "Yahoo_Finance");

      // Upsert into Company
      await prisma.company.update({
        where: { id: company.id },
        data: updateData
      });

      const existingPeriod = await prisma.companyFinancialPeriod.findFirst({
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
        await prisma.companyFinancialPeriod.update({
          where: { id: existingPeriod.id },
          data: periodData
        });
      } else {
        await prisma.companyFinancialPeriod.create({
          data: {
            id: crypto.randomUUID(),
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
        const existingWorkforce = await prisma.companyWorkforce.findFirst({
          where: { companyId: company.id, year: new Date().getFullYear() }
        });
        const empCount = parseInt(payload.employees, 10);
        if (existingWorkforce) {
          await prisma.companyWorkforce.update({
            where: { id: existingWorkforce.id },
            data: { count: empCount }
          });
        } else {
          await prisma.companyWorkforce.create({
            data: {
              id: crypto.randomUUID(),
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
        const existing = await prisma.companyFacility.findFirst({ where: { companyId: company.id, type: "HQ" } });
        if (!existing) {
          await prisma.companyFacility.create({
             data: {
               id: crypto.randomUUID(),
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
        await processAiChunking("Company", company.id, payload.description);
      }

      return { success: true, payload };
    } catch (e: any) {
      if (e instanceof IdentityMismatchError) {
        console.warn(`[YahooFinance] Identity mismatch rejected for ${companyId}: ${e.message}`);
        // Consider it a success so it doesn't fail the pipeline, but we skip updating
        return { success: true, message: e.message };
      }
      return { success: false, message: e.message };
    }
  }
}
