import { BaseConnector, ConnectorResponse } from "./base";
import { prisma } from "../../config/prisma";
import crypto from "crypto";

export class RelationshipsConnector extends BaseConnector {
  name = "GLEIF_Relationships";
  version = "1.0.0";

  async execute(companyId?: string): Promise<ConnectorResponse> {
    if (!companyId) return { success: false, message: "Company ID required" };
    
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return { success: false, message: "Company not found" };

    try {
      let lei = company.lei;

      // 1. Search for LEI if missing
      if (!lei) {
         const searchUrl = `https://api.gleif.org/api/v1/lei-records?filter[entity.legalName]=${encodeURIComponent(company.name)}`;
         const searchRes = await fetch(searchUrl);
         if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (searchData.data && searchData.data.length > 0) {
                lei = searchData.data[0].attributes.lei;
                await prisma.company.update({
                    where: { id: company.id },
                    data: { lei }
                });
            }
         }
      }

      if (!lei) {
          return { success: false, message: `Could not resolve LEI for ${company.name}` };
      }

      // 2. Fetch children (subsidiaries)
      const childrenUrl = `https://api.gleif.org/api/v1/lei-records?filter[entity.parent.lei]=${lei}`;
      const response = await fetch(childrenUrl);
      
      let added = 0;

      if (response.ok) {
          const payload = await response.json();
          const checksum = crypto.createHash("sha256").update(JSON.stringify(payload)).digest("hex");
          await this.saveStagingPayload("GLEIF", childrenUrl, payload, checksum);

          const subsidiaries = payload.data || [];
          
          for (const sub of subsidiaries) {
              const name = sub.attributes.entity.legalName.name;
              
              const existing = await prisma.companyRelationship.findFirst({
                  where: { companyId: company.id, relatedName: name }
              });

              if (!existing) {
                  await prisma.companyRelationship.create({
                      data: {
                          id: crypto.randomUUID(),
                          companyId: company.id,
                          type: "Subsidiary",
                          relatedName: name,
                          description: `LEI: ${sub.attributes.lei}`
                      }
                  });
                  added++;
              }
          }
      }

      return { success: true, payload: { added } };
    } catch (e: any) {
      return { success: false, message: e.message };
    }
  }
}
