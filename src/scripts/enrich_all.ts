import { PrismaClient } from "@prisma/client";
import { YahooFinanceConnector } from "../sync/connectors/yahoo-finance";
import { CompanyEnrichmentConnector } from "../sync/connectors/company-enrichment";
import { ClinicalTrialsConnector } from "../sync/connectors/clinical-trials";
import { OpenFDAConnector } from "../sync/connectors/openfda";
import { PubMedConnector } from "../sync/connectors/pubmed";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log("Starting Full Database Enrichment Pipeline...");
  
  const yf = new YahooFinanceConnector();
  const enrich = new CompanyEnrichmentConnector();
  const ct = new ClinicalTrialsConnector();
  const fda = new OpenFDAConnector();
  const pubmed = new PubMedConnector();

  const allCompanies = await prisma.company.findMany({
    orderBy: { name: 'asc' }
  });

  console.log(`Found ${allCompanies.length} companies to process.`);

  const reportData = [];

  for (let i = 0; i < allCompanies.length; i++) {
    const company = allCompanies[i];
    console.log(`\n[${i+1}/${allCompanies.length}] Processing ${company.name} (${company.id})`);
    
    let errors = [];

    // 1. Yahoo Finance
    try {
      const res = await yf.execute(company.id);
      if (!res.success) errors.push(`YF: ${res.message}`);
    } catch (e: any) {
      errors.push(`YF Error: ${e.message}`);
    }
    await delay(1000);

    // 2. Company Enrichment
    try {
      const res = await enrich.execute(company.id);
      if (!res.success) errors.push(`Enrich: ${res.message}`);
    } catch (e: any) {
      errors.push(`Enrich Error: ${e.message}`);
    }
    await delay(1000);

    // 3. Clinical Trials
    try {
      const res = await ct.execute(company.id);
      if (!res.success) errors.push(`Trials: ${res.message}`);
    } catch (e: any) {
      errors.push(`Trials Error: ${e.message}`);
    }
    await delay(1000);

    // 4. OpenFDA
    try {
      const res = await fda.execute(company.id);
      if (!res.success) errors.push(`FDA: ${res.message}`);
    } catch (e: any) {
      errors.push(`FDA Error: ${e.message}`);
    }
    await delay(1000);

    // 5. PubMed
    try {
      const res = await pubmed.execute(company.id);
      if (!res.success) errors.push(`PubMed: ${res.message}`);
    } catch (e: any) {
      errors.push(`PubMed Error: ${e.message}`);
    }
    await delay(1000);

    // Fetch updated stats
    const updatedCompany = await prisma.company.findUnique({
      where: { id: company.id },
      include: {
        _count: {
          select: {
            drugRelations: true,
            trialRelations: true,
            facilities: true,
            publications: true,
            patents: true,
            news: true
          }
        }
      }
    });

    if (updatedCompany) {
      reportData.push({
        name: updatedCompany.name,
        identityStatus: errors.length === 0 ? "SUCCESS" : "PARTIAL",
        website: updatedCompany.website || "null",
        ticker: updatedCompany.ticker || "null",
        employees: updatedCompany.employees || "null",
        revenue: updatedCompany.revenue || "null",
        products: updatedCompany._count.drugRelations,
        trials: updatedCompany._count.trialRelations,
        facilities: updatedCompany._count.facilities,
        publications: updatedCompany._count.publications,
        patents: updatedCompany._count.patents,
        news: updatedCompany._count.news,
        overview: updatedCompany.businessOverview ? "Yes" : "No",
        completeness: updatedCompany.completenessScore ? `${updatedCompany.completenessScore}%` : "0%",
        errors: errors.join(" | ")
      });
    }
  }

  console.log("\nGenerating ENRICHMENT_REPORT.md...");
  
  let markdown = `# Global Data Enrichment Report\n\n`;
  markdown += `Total Companies Processed: **${allCompanies.length}**\n\n`;

  markdown += `| Company Name | Identity Status | Website | Ticker | Employees | Revenue | Products | Trials | Facilities | Pubs | Patents | News | Overview | Completeness | Errors |\n`;
  markdown += `|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|\n`;

  for (const r of reportData) {
    markdown += `| ${r.name} | ${r.identityStatus} | ${r.website} | ${r.ticker} | ${r.employees} | ${r.revenue} | ${r.products} | ${r.trials} | ${r.facilities} | ${r.publications} | ${r.patents} | ${r.news} | ${r.overview} | ${r.completeness} | ${r.errors || "-"} |\n`;
  }

  const reportPath = path.join(__dirname, "../../../ENRICHMENT_REPORT.md");
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`Enrichment complete. Report saved to: ${reportPath}`);
}

run().catch(console.error);
