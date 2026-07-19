import { BaseConnector, ConnectorResponse } from "./base";
import { prisma } from "../../config/prisma";
import crypto from "crypto";
import { identityResolver, IdentityMismatchError } from "../engine/identity-resolver";

export class CompanyEnrichmentConnector extends BaseConnector {
  name = "YahooFinance_API_REAL";
  version = "2.0.0";

  async execute(companyId?: string): Promise<ConnectorResponse> {
    if (!companyId) return { success: false, message: "Company ID required" };
    
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return { success: false, message: "Company not found" };

    try {
      // Using public Yahoo Finance quote endpoint
      const symbol = company.ticker;
      if (!symbol) {
        return { success: false, message: "No ticker available for enrichment" };
      }

      identityResolver.verify(company, {
        ticker: symbol,
        source: "Company Enrichment (Yahoo)"
      });

      const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
      
      const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      
      if (!response.ok) {
         throw new Error(`Yahoo Finance API returned ${response.status}`);
      }
      
      const payload = await response.json();
      const checksum = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
      await this.saveStagingPayload("YahooFinance", url, payload, checksum);

      const quote = payload.quoteResponse?.result?.[0] || {};
      
      const officialUrl = `https://finance.yahoo.com/quote/${symbol}`;

      // Update Company
      await prisma.company.update({
        where: { id: company.id },
        data: {
          officialUrl,
          marketCap: quote.marketCap ? quote.marketCap.toString() : null,
          currency: quote.currency || "USD"
        }
      });

      // Timeline for 52 week high/low changes
      if (quote.fiftyTwoWeekHigh) {
        await prisma.companyTimeline.create({
           data: {
             companyId: company.id,
             date: new Date(),
             event: "52 Week High Recorded",
             description: `Recorded at ${quote.fiftyTwoWeekHigh}`
           }
        });
      }

      // Fetch News
      try {
         const newsUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=3`;
         const newsRes = await fetch(newsUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
         if (newsRes.ok) {
           const newsData = await newsRes.json();
           const articles = newsData.news || [];
           for (const article of articles) {
             const existingNews = await prisma.companyNews.findFirst({ where: { companyId: company.id, title: article.title } });
             if (!existingNews) {
               await prisma.companyNews.create({
                 data: {
                   companyId: company.id,
                   title: article.title,
                   url: article.link,
                   source: article.publisher,
                   publishDate: new Date(article.providerPublishTime * 1000)
                 }
               });
             }
           }
         }
      } catch (e: any) {
         console.error("Failed to fetch news for " + symbol, e.message);
      }

      // Fetch Leadership/Profile
      try {
         const profileUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=assetProfile`;
         const profileRes = await fetch(profileUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
         if (profileRes.ok) {
           const profileData = await profileRes.json();
           const profile = profileData.quoteSummary?.result?.[0]?.assetProfile || {};
           const officers = profile.companyOfficers || [];
           
           if (profile.longBusinessSummary) {
             await prisma.company.update({ where: { id: company.id }, data: { businessOverview: profile.longBusinessSummary } });
           }

           for (const officer of officers) {
             if (officer.name && officer.title) {
               const existing = await prisma.companyExecutive.findFirst({ where: { companyId: company.id, name: officer.name } });
               if (!existing) {
                 await prisma.companyExecutive.create({
                   data: {
                     companyId: company.id,
                     name: officer.name,
                     title: officer.title
                   }
                 });
               }
             }
           }
         }
      } catch (e: any) {
         console.error("Failed to fetch profile for " + symbol, e.message);
      }

      return { success: true, payload: { symbol, marketCap: quote.marketCap } };
    } catch (e: any) {
      if (e instanceof IdentityMismatchError) {
        console.warn(`[Enrichment] Identity mismatch rejected for ${companyId}: ${e.message}`);
        return { success: true, message: e.message };
      }
      return { success: false, message: e.message };
    }
  }
}
