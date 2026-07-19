import { BaseConnector, ConnectorResponse } from "./base";
import { prisma } from "../../config/prisma";
import crypto from "crypto";

export class PatentsConnector extends BaseConnector {
  name = "PatentsView_API";
  version = "1.0.0";

  async execute(companyId?: string): Promise<ConnectorResponse> {
    if (!companyId) return { success: false, message: "Company ID required" };
    
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return { success: false, message: "Company not found" };

    try {
      // Use PatentsView API to fetch patents by assignee
      const url = `https://api.patentsview.org/patents/query?q={"_text_phrase":{"assignee_organization":"${encodeURIComponent(company.name)}" }}&f=["patent_number","patent_title","patent_date","patent_type","inventor_first_name","inventor_last_name","assignee_organization","app_date"]&o={"per_page":100}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
         throw new Error(`PatentsView API returned ${response.status}`);
      }
      
      const payload = await response.json();
      const checksum = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
      await this.saveStagingPayload("PatentsView", url, payload, checksum);

      const patents = payload.patents || [];

      let added = 0;

      for (const patent of patents) {
         const patentNumber = patent.patent_number;
         if (!patentNumber) continue;
         
         const title = patent.patent_title || "Unknown Title";
         const filingDate = patent.applications?.[0]?.app_date ? new Date(patent.applications[0].app_date).toISOString() : null;
         const grantDate = patent.patent_date ? new Date(patent.patent_date).toISOString() : null;
         
         const inventorsList = patent.inventors?.map((i: any) => `${i.inventor_first_name} ${i.inventor_last_name}`).join(", ") || "";
         const patentUrl = `https://patents.google.com/patent/US${patentNumber}`;
         
         const newPatentData = {
             title,
             status: "GRANTED", // PatentsView returns granted patents usually
             filingDate,
             grantDate,
             inventors: inventorsList,
             url: patentUrl,
             office: "USPTO"
         };

         const existingCompanyPatent = await prisma.companyPatent.findUnique({
             where: { patentNumber }
         });

         if (existingCompanyPatent) {
             await prisma.companyPatent.update({
                 where: { patentNumber },
                 data: newPatentData
             });
         } else {
             await prisma.companyPatent.create({
                 data: {
                     id: crypto.randomUUID(),
                     patentNumber,
                     ...newPatentData,
                     companyId: company.id
                 }
             });
         }
         
         // Update GlobalPatent
         await prisma.globalPatent.upsert({
            where: { patentNumber },
            update: { title },
            create: { patentNumber, title }
         });
         
         const globalPatent = await prisma.globalPatent.findUnique({ where: { patentNumber } });
         if (globalPatent) {
             const existingRel = await prisma.companyPatentRelation.findFirst({
                 where: { companyId: company.id, patentId: globalPatent.id }
             });
             if (!existingRel) {
                 await prisma.companyPatentRelation.create({
                     data: { companyId: company.id, patentId: globalPatent.id, role: "ASSIGNEE" }
                 });
             }
         }
         added++;
      }

      return { success: true, payload: { added } };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
}
