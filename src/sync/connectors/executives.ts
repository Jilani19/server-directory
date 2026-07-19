import { BaseConnector, ConnectorResponse } from "./base";
import { prisma } from "../../config/prisma";
import crypto from "crypto";
import YahooFinance2 from "yahoo-finance2";
const yahooFinance = new (YahooFinance2 as any)();

export class ExecutivesConnector extends BaseConnector {
  name = "Yahoo_Finance_Executives";
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

      const quote: any = await yahooFinance.quoteSummary(ticker, { modules: ["assetProfile"] });
      
      const officers = quote.assetProfile?.companyOfficers || [];
      let added = 0;

      for (const officer of officers) {
         if (!officer.name) continue;
         
         const existingExec = await prisma.companyExecutive.findFirst({
             where: { companyId: company.id, name: officer.name }
         });

         const title = officer.title || "Executive";
         let type = "LEADERSHIP";
         if (title.toLowerCase().includes("board") || title.toLowerCase().includes("director")) {
             type = "BOARD";
         }

         const execData = {
             name: officer.name,
             title: title,
             type: type,
             // yearBorn: officer.yearBorn, age: officer.age can be mapped if needed, but not in schema
         };

         if (existingExec) {
             await prisma.companyExecutive.update({
                 where: { id: existingExec.id },
                 data: execData
             });
         } else {
             await prisma.companyExecutive.create({
                 data: {
                     id: crypto.randomUUID(),
                     ...execData,
                     companyId: company.id
                 }
             });
         }
         added++;
         
         // If CEO, update Company
         if (title.toLowerCase().includes("chief executive officer") || title.toLowerCase() === "ceo") {
             await prisma.company.update({
                 where: { id: company.id },
                 data: { ceo: officer.name }
             });
         }
      }

      return { success: true, payload: { added } };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
}
