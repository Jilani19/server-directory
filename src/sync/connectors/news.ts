import { BaseConnector, ConnectorResponse } from "./base";
import { prisma } from "../../config/prisma";
import crypto from "crypto";
import YahooFinance2 from "yahoo-finance2";
const yahooFinance = new (YahooFinance2 as any)();

export class NewsConnector extends BaseConnector {
  name = "Yahoo_Finance_News";
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
         return { success: false, message: `Could not resolve ticker for ${company.name}` };
      }

      const searchResult: any = await yahooFinance.search(ticker);
      const newsItems = searchResult.news || [];
      
      let added = 0;

      for (const item of newsItems) {
         if (!item.title) continue;
         
         const existingNews = await prisma.companyNews.findFirst({
             where: { companyId: company.id, title: item.title }
         });
         
         // Try to parse the date safely
          let publishDate: Date | null = null;
          if (item.providerPublishTime) {
              const candidate = new Date(item.providerPublishTime * 1000);
              // Guard against invalid dates (e.g., year > 9999)
              if (!isNaN(candidate.getTime()) && candidate.getFullYear() < 9999) {
                  publishDate = candidate;
              }
          }

          const newsData = {
              title: item.title,
              url: item.link,
              source: item.publisher || "Yahoo Finance",
              summary: item.type === "STORY" ? "News Article" : item.type,
              type: "Corporate News",
              // If publishDate is null we omit the field so Prisma can use default or nullable
              ...(publishDate ? { publishDate } : {})
          };

         if (existingNews) {
             await prisma.companyNews.update({
                 where: { id: existingNews.id },
                 data: newsData
             });
         } else {
             await prisma.companyNews.create({
                 data: {
                     id: crypto.randomUUID(),
                     ...newsData,
                     companyId: company.id
                 }
             });
         }
         added++;
      }

      return { success: true, payload: { added } };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
}
