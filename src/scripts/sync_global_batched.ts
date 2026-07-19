import { PrismaClient } from "@prisma/client";
import { ClinicalTrialsConnector } from "../sync/connectors/clinical-trials";
import { CompanyEnrichmentConnector } from "../sync/connectors/company-enrichment";
import { OpenFDAConnector } from "../sync/connectors/openfda";
import { PubMedConnector } from "../sync/connectors/pubmed";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const COMPANIES = [
  // Global Pharma
  "Pfizer", "Merck", "AbbVie", "Roche", "Novartis", "Sanofi", "GSK", "AstraZeneca", "Johnson & Johnson", "Amgen", 
  "Biogen", "Regeneron", "Vertex", "Moderna", "BioNTech", "Novo Nordisk", "Takeda", "Bayer", "Boehringer Ingelheim", 
  "Eli Lilly", "Bristol Myers Squibb", "Gilead Sciences", "Viatris", "Teva Pharmaceutical", "Otsuka", "Astellas", "Daiichi Sankyo",
  "CSL Behring", "Grifols", "Eisai", "Shionogi", "Jazz Pharmaceuticals", "Alnylam Pharmaceuticals", "Ipsen", "UCB",
  
  // Medical Devices & Diagnostics
  "Thermo Fisher Scientific", "Danaher", "Agilent", "Waters", "Illumina", "Bio-Rad", "QIAGEN", "PerkinElmer", "Bruker",
  "Medtronic", "Abbott", "Stryker", "Boston Scientific", "Becton Dickinson", "Siemens Healthineers", "GE Healthcare",
  "Philips Healthcare", "Zimmer Biomet", "Align Technology", "ResMed", "Hologic", "Intuitive Surgical", "Edwards Lifesciences",
  "Smith & Nephew", "Dentsply Sirona", "Baxter International", "Fresenius Medical Care", "Terumo", "Olympus",
  "Sysmex", "Mindray", "Konica Minolta Healthcare", "Varian Medical Systems", "Elekta", "Cochlear",

  // CROs, CDMOs, and Services
  "IQVIA", "ICON", "Syneos Health", "Parexel", "Labcorp Drug Development", "Medpace", "Charles River Laboratories", "PPD",
  "Lonza", "Catalent", "Samsung Biologics", "WuXi AppTec", "Recipharm", "Siegfried", "Famar", "Vetter", "Patheon",
  "Evotec", "Piramal Pharma Solutions", "Aenova", "Delpharm", "Fareva", "Bora Pharmaceuticals", "CordenPharma",

  // Generics & India Pharma
  "Dr. Reddy's", "Sun Pharma", "Cipla", "Lupin", "Aurobindo Pharma", "Divi's Laboratories", "Biocon", "Syngene", 
  "Torrent Pharmaceuticals", "Zydus Lifesciences", "Alkem Laboratories", "Glenmark", "Mankind Pharma", "Natco Pharma", 
  "Ajanta Pharma", "Granules India", "Strides Pharma", "Alembic Pharmaceuticals", "Jubilant Pharmova", "Wockhardt",
  "Hikma Pharmaceuticals", "Krka", "Richter Gedeon", "Perrigo", "Endo International", "Amneal Pharmaceuticals",

  // Health Tech, Genomics & Software
  "Veeva Systems", "Cerner", "Epic Systems", "Medidata", "Phreesia", "Definitive Healthcare", "Doximity", "Teladoc Health",
  "Certara", "Schrödinger", "Tempus", "Flatiron Health", "Komodo Health", "Sema4", "Invitae", "Natera", "Guardant Health",
  "10x Genomics", "Pacific Biosciences", "Oxford Nanopore", "Bionano Genomics", "Twist Bioscience", "Ginkgo Bioworks",
  "Exact Sciences", "Myriad Genetics", "Neogen", "Adaptive Biotechnologies", "Quanterix", "Olink Proteomics"
]; // ~162 Companies

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const BATCH_SIZE = 30;
const STATE_FILE = path.join(__dirname, "sync_state.json");

async function run() {
  console.log(`Starting Phase 2 Batched Global Sync for ${COMPANIES.length} companies...`);

  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: `system-global-${Date.now()}@example.com`,
        passwordHash: "hash",
        role: { create: { name: `Admin-Global-${Date.now()}` } }
      }
    });
  }

  const ctConnector = new ClinicalTrialsConnector();
  const enrichConnector = new CompanyEnrichmentConnector();
  const fdaConnector = new OpenFDAConnector();
  const pubMedConnector = new PubMedConnector();

  let startIndex = 0;
  if (fs.existsSync(STATE_FILE)) {
    const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    startIndex = state.lastIndex || 0;
    console.log(`Resuming from index ${startIndex}`);
  }

  while (startIndex < COMPANIES.length) {
    const endIndex = Math.min(startIndex + BATCH_SIZE, COMPANIES.length);
    const batch = COMPANIES.slice(startIndex, endIndex);

    console.log(`\n==============================================`);
    console.log(`Processing Batch: ${startIndex} to ${endIndex}`);
    console.log(`==============================================`);

    for (let i = 0; i < batch.length; i++) {
      const name = batch[i];
      const overallIndex = startIndex + i + 1;
      console.log(`\n[${overallIndex}/${COMPANIES.length}] Processing: ${name}`);
      
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
        }

        await enrichConnector.execute(company.id);
        await delay(800); 
        await ctConnector.execute(company.id);
        await delay(800);
        await fdaConnector.execute(company.id);
        await delay(800);
        await pubMedConnector.execute(company.id);
        await delay(1200);
        
      } catch (e: any) {
         console.error(`Failed to process ${name}: ${e.message}`);
      }
    }

    startIndex = endIndex;
    fs.writeFileSync(STATE_FILE, JSON.stringify({ lastIndex: startIndex }));
    console.log(`Batch complete. Saved state. Taking a short breather...`);
    await delay(3000); 
  }

  console.log("\nPhase 2 Global Sync fully completed!");
  
  // Run the coverage report automatically
  const { execSync } = require("child_process");
  console.log("Generating final global coverage report...");
  execSync("npx ts-node src/scripts/generate_global_coverage_report.ts", { stdio: 'inherit' });
}

run()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
