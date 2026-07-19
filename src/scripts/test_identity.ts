import { PrismaClient } from "@prisma/client";
import { CompanyEnrichmentConnector } from "../sync/connectors/company-enrichment";
import { YahooFinanceConnector } from "../sync/connectors/yahoo-finance";
import { ClinicalTrialsConnector } from "../sync/connectors/clinical-trials";

const prisma = new PrismaClient();

async function run() {
  console.log("Running Identity Resolution Test...");
  const enrich = new CompanyEnrichmentConnector();
  const yahoo = new YahooFinanceConnector();
  const ct = new ClinicalTrialsConnector();

  const testCompanies = ["Pfizer", "Amgen"];
  
  for (const name of testCompanies) {
    let company = await prisma.company.findFirst({ where: { name } });
    if (company) {
      console.log(`\nTesting ${name} (ID: ${company.id})`);
      await enrich.execute(company.id);
      await yahoo.execute(company.id);
      await ct.execute(company.id);
    }
  }

  const { execSync } = require("child_process");
  console.log("Generating Audit Report...");
  execSync("npx ts-node src/scripts/generate_identity_audit.ts", { stdio: 'inherit' });
}

run().catch(console.error);
