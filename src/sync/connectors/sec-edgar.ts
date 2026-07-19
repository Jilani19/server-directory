import { BaseConnector, ConnectorResponse } from "./base";
import { prisma } from "../../config/prisma";
import crypto from "crypto";

export class SecEdgarConnector extends BaseConnector {
  name = "SEC_EDGAR_API";
  version = "1.0.0";

  async execute(companyId?: string): Promise<ConnectorResponse> {
    if (!companyId) return { success: false, message: "Company ID required" };
    
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return { success: false, message: "Company not found" };

    try {
      let cik = company.cik;

      if (!cik) {
        if (!company.ticker) {
            return { success: false, message: "No CIK or Ticker available to fetch SEC filings" };
        }
        
        // Fetch CIK from ticker
        const tickersResponse = await fetch("https://www.sec.gov/files/company_tickers.json", {
            headers: { 'User-Agent': 'CompanyIntelligence Platform admin@company.com' }
        });
        
        if (tickersResponse.ok) {
           const tickersObj = await tickersResponse.json();
           const entries = Object.values(tickersObj);
           const match = entries.find((e: any) => e.ticker.toUpperCase() === company.ticker?.toUpperCase());
           if (match) {
               cik = (match as any).cik_str.toString();
               await prisma.company.update({
                   where: { id: company.id },
                   data: { cik }
               });
           }
        }
      }

      if (!cik) {
         return { success: false, message: `Could not resolve CIK for ticker ${company.ticker}` };
      }

      const paddedCik = cik.padStart(10, "0");
      const url = `https://data.sec.gov/submissions/CIK${paddedCik}.json`;
      
      const response = await fetch(url, {
         headers: { 'User-Agent': 'CompanyIntelligence Platform admin@company.com' }
      });
      
      if (!response.ok) {
         throw new Error(`SEC API returned ${response.status}`);
      }
      
      const payload = await response.json();
      const checksum = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
      await this.saveStagingPayload("SEC_EDGAR", url, payload, checksum);

      const recentFilings = payload.filings?.recent || {};
      const forms = recentFilings.form || [];
      const accessionNumbers = recentFilings.accessionNumber || [];
      const primaryDocuments = recentFilings.primaryDocument || [];
      const filingDates = recentFilings.filingDate || [];

      let docsAdded = 0;

      for (let i = 0; i < forms.length; i++) {
         const form = forms[i];
         // Only care about 10-K, 10-Q, 8-K
         if (form === "10-K" || form === "10-Q" || form === "8-K") {
            const accNum = accessionNumbers[i];
            const accNumNoDashes = accNum.replace(/-/g, "");
            const doc = primaryDocuments[i];
            const date = filingDates[i];
            
            const docUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accNumNoDashes}/${doc}`;
            
            const title = `${form} Filing - ${date}`;
            
            const existingDoc = await prisma.companyDocument.findFirst({
                where: { companyId: company.id, title: title }
            });

            if (!existingDoc) {
                await prisma.companyDocument.create({
                    data: {
                        id: crypto.randomUUID(),
                        title,
                        type: "URL",
                        category: form,
                        url: docUrl,
                        companyId: company.id
                    }
                });
                docsAdded++;
            }
         }
      }

      return { success: true, payload: { docsAdded } };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
}
