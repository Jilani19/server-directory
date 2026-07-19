import { PrismaClient } from "@prisma/client";
import { ClinicalTrialsConnector } from "../sync/connectors/clinical-trials";
import { CompanyEnrichmentConnector } from "../sync/connectors/company-enrichment";
import { OpenFDAConnector } from "../sync/connectors/openfda";
import { PubMedConnector } from "../sync/connectors/pubmed";

const prisma = new PrismaClient();

const COMPANIES = [
  "Pfizer", "AbbVie", "Merck", "Novartis", "Roche",
  "Sanofi", "GSK", "Johnson & Johnson", "Amgen", "AstraZeneca",
  "Bristol Myers Squibb", "Eli Lilly", "Novo Nordisk", "Bayer", "Takeda",
  "Biogen", "Regeneron", "Vertex", "Thermo Fisher", "IQVIA",
  "Lonza", "Catalent", "WuXi", "Samsung Biologics", "Dr. Reddy's",
  "Sun Pharma", "Cipla", "Lupin", "Aurobindo", "Divi's", "Syngene"
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log("Starting massive life sciences data ingestion pipeline...");

  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: `system-${Date.now()}@example.com`,
        passwordHash: "hash",
        role: { create: { name: `Admin-${Date.now()}` } }
      }
    });
  }

  const ctConnector = new ClinicalTrialsConnector();
  const enrichConnector = new CompanyEnrichmentConnector();
  const fdaConnector = new OpenFDAConnector();
  const pubMedConnector = new PubMedConnector();

  for (const name of COMPANIES) {
    console.log(`\n========================================`);
    console.log(`Processing: ${name}`);
    console.log(`========================================`);
    
    try {
      let company = await prisma.company.findFirst({ where: { name } });
      if (!company) {
        company = await prisma.company.create({
          data: {
            name,
            slug: encodeURIComponent(name.toLowerCase().replace(/ /g, "-")) + "-" + Date.now(),
            userId: user.id
          }
        });
        console.log(`Created base record for ${name}`);
      }

      console.log(`-> Fetching Financials & News (Yahoo)`);
      await enrichConnector.execute(company.id);
      await delay(1000); // rate limiting

      console.log(`-> Fetching Clinical Trials (ARES API)`);
      await ctConnector.execute(company.id);
      await delay(1000);

      console.log(`-> Fetching Approved Drugs (OpenFDA)`);
      await fdaConnector.execute(company.id);
      await delay(1000);
      
      console.log(`-> Fetching Publications (PubMed)`);
      await pubMedConnector.execute(company.id);
      await delay(1500);
      
    } catch (e: any) {
       console.error(`Failed to completely process ${name}: ${e.message}`);
    }
  }

  console.log("\nMassive data sync completed successfully.");
}

run()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
