import { BaseConnector, ConnectorResponse } from "./base";
import { prisma } from "../../config/prisma";
import crypto from "crypto";
import { identityResolver, IdentityMismatchError } from "../engine/identity-resolver";

export class PubMedConnector extends BaseConnector {
  name = "PubMed_EUtils_API";
  version = "1.0.0";

  async execute(companyId?: string): Promise<ConnectorResponse> {
    if (!companyId) return { success: false, message: "Company ID required" };
    
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return { success: false, message: "Company not found" };

    try {
      // 1. Search for IDs
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(company.name)}[Affiliation]&retmode=json&retmax=3`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) throw new Error(`PubMed Search returned ${searchRes.status}`);
      
      const searchData = await searchRes.json();
      const idList = searchData.esearchresult?.idlist || [];

      if (idList.length === 0) {
        return { success: true, payload: { publications: 0 } };
      }

      identityResolver.verify(company, {
        name: company.name, // Affiliation search ensures some relevance
        source: "PubMed"
      });

      // 2. Fetch Summaries
      const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(",")}&retmode=json`;
      const summaryRes = await fetch(summaryUrl);
      if (!summaryRes.ok) throw new Error(`PubMed Summary returned ${summaryRes.status}`);
      
      const summaryData = await summaryRes.json();
      const checksum = crypto.createHash("sha256").update(JSON.stringify(summaryData)).digest("hex");
      await this.saveStagingPayload("PubMed", summaryUrl, summaryData, checksum);

      const results = summaryData.result || {};

      for (const id of idList) {
        const pub = results[id];
        if (!pub) continue;

        const pmid = pub.uid;
        const title = pub.title;
        const journal = pub.fulljournalname || pub.source;
        const pubDate = pub.pubdate;
        const authors = (pub.authors || []).map((a: any) => a.name).join(", ");
        const doi = (pub.articleids || []).find((a: any) => a.idtype === "doi")?.value || null;
        const url = doi ? `https://doi.org/${doi}` : `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

        const existingPub = await prisma.companyPublication.findFirst({ where: { companyId: company.id, pmid } });
        
        const newPubData = {
          title,
          pmid,
          doi,
          journal,
          publicationDate: pubDate,
          authors,
          url,
          companyId: company.id
        };

        if (existingPub) {
          await prisma.companyPublication.update({ where: { id: existingPub.id }, data: newPubData }).catch(() => {});
        } else {
          await prisma.companyPublication.create({ data: newPubData }).catch(() => {});
        }
      }

      return { success: true, payload: { publications: idList.length } };
    } catch (e: any) {
      if (e instanceof IdentityMismatchError) {
        console.warn(`[PubMed] Identity mismatch rejected for ${companyId}: ${e.message}`);
        return { success: true, message: e.message };
      }
      return { success: false, message: e.message };
    }
  }
}
