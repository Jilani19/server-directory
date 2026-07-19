import { PrismaClient } from "@prisma/client";
import { YahooFinanceConnector } from "../sync/connectors/yahoo-finance";
import { CompanyEnrichmentConnector } from "../sync/connectors/company-enrichment";
import { ClinicalTrialsConnector } from "../sync/connectors/clinical-trials";
import { OpenFDAConnector } from "../sync/connectors/openfda";
import { PubMedConnector } from "../sync/connectors/pubmed";

const prisma = new PrismaClient();

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log("Running Targeted Data Refetch for Amgen...");
  
  const yf = new YahooFinanceConnector();
  const enrich = new CompanyEnrichmentConnector();
  const ct = new ClinicalTrialsConnector();
  const fda = new OpenFDAConnector();
  const pubmed = new PubMedConnector();

  // Test on Amgen specifically to prove it works
  const amgen = await prisma.company.findFirst({ where: { name: "Amgen" } });
  
  if (amgen) {
    console.log(`\nRe-fetching data for ${amgen.name} (ID: ${amgen.id})`);
    
    // 1. Yahoo Finance (Gets the Ticker)
    console.log("Fetching Yahoo Finance (Ticker & Website)");
    await yf.execute(amgen.id);
    await delay(1000);

    // 2. Company Enrichment (Gets News & Execs using Ticker)
    console.log("Fetching Enrichment Data (News & Execs)");
    await enrich.execute(amgen.id);
    await delay(1000);

    // 3. Clinical Trials
    console.log("Fetching Clinical Trials");
    await ct.execute(amgen.id);
    await delay(1000);

    // 4. OpenFDA
    console.log("Fetching Products");
    await fda.execute(amgen.id);
    await delay(1000);

    // 5. PubMed
    console.log("Fetching Publications");
    await pubmed.execute(amgen.id);
  }

  const { execSync } = require("child_process");
  console.log("\nGenerating Audit Report...");
  execSync("npx ts-node src/scripts/generate_identity_audit.ts", { stdio: 'inherit' });
  console.log("Data successfully re-fetched and audited.");
}

run().catch(console.error);
