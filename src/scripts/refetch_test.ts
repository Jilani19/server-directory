import { PrismaClient } from "@prisma/client";
import { YahooFinanceConnector } from "../sync/connectors/yahoo-finance";
import { CompanyEnrichmentConnector } from "../sync/connectors/company-enrichment";

const prisma = new PrismaClient();

async function run() {
  const yf = new YahooFinanceConnector();
  const enrich = new CompanyEnrichmentConnector();

  const amgen = await prisma.company.findFirst({ where: { name: "Amgen" } });
  
  if (amgen) {
    console.log(`\nRe-fetching data for ${amgen.name} (ID: ${amgen.id})`);
    
    console.log("Fetching Yahoo Finance (Ticker & Website)");
    const yfRes = await yf.execute(amgen.id);
    console.log("Yahoo Finance Result:", yfRes);

    console.log("Fetching Enrichment Data (News & Execs)");
    const enRes = await enrich.execute(amgen.id);
    console.log("Enrichment Result:", enRes);
  }
}

run().catch(console.error);
