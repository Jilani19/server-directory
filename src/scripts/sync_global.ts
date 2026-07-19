import { PrismaClient } from "@prisma/client";
import { ClinicalTrialsConnector } from "../sync/connectors/clinical-trials";
import { CompanyEnrichmentConnector } from "../sync/connectors/company-enrichment";
import { OpenFDAConnector } from "../sync/connectors/openfda";
import { PubMedConnector } from "../sync/connectors/pubmed";

const prisma = new PrismaClient();

const COMPANIES = [
  // Global Pharma
  "Pfizer", "Merck", "AbbVie", "Roche", "Novartis", "Sanofi", "GSK", "AstraZeneca", "Johnson & Johnson", "Amgen", 
  "Biogen", "Regeneron", "Vertex", "Moderna", "BioNTech", "Novo Nordisk", "Takeda", "Bayer", "Boehringer Ingelheim", 
  "Eli Lilly", "Bristol Myers Squibb", "Gilead Sciences", "Viatris", "Teva Pharmaceutical", "Otsuka", "Astellas", "Daiichi Sankyo",

  // Medical Devices & Diagnostics
  "Thermo Fisher Scientific", "Danaher", "Agilent", "Waters", "Illumina", "Bio-Rad", "QIAGEN", "PerkinElmer", "Bruker",
  "Medtronic", "Abbott", "Stryker", "Boston Scientific", "Becton Dickinson", "Siemens Healthineers", "GE Healthcare",
  "Philips Healthcare", "Zimmer Biomet", "Align Technology", "ResMed", "Hologic", "Intuitive Surgical", "Edwards Lifesciences",

  // CROs, CDMOs, and Services
  "IQVIA", "ICON", "Syneos Health", "Parexel", "Labcorp Drug Development", "Medpace", "Charles River Laboratories", "PPD",
  "Lonza", "Catalent", "Samsung Biologics", "WuXi AppTec", "Recipharm", "Siegfried", "Famar", "Vetter", "Patheon",

  // Generics & India Pharma
  "Dr. Reddy's", "Sun Pharma", "Cipla", "Lupin", "Aurobindo Pharma", "Divi's Laboratories", "Biocon", "Syngene", 
  "Torrent Pharmaceuticals", "Zydus Lifesciences", "Alkem Laboratories", "Glenmark", "Mankind Pharma", "Natco Pharma", 
  "Ajanta Pharma", "Granules India", "Strides Pharma", "Alembic Pharmaceuticals", "Jubilant Pharmova", "Wockhardt",

  // Health Tech & Software
  "Veeva Systems", "Cerner", "Epic Systems", "Medidata", "Phreesia", "Definitive Healthcare", "Doximity", "Teladoc Health",
  "Certara", "Schrödinger", "Tempus", "Flatiron Health", "Komodo Health", "Sema4", "Invitae", "Natera", "Guardant Health"
];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

async function run() {
  console.log(`Starting Phase 2 Global Sync for ${COMPANIES.length} companies...`);

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

  let count = 0;
  for (const name of COMPANIES) {
    count++;
    console.log(`\n[${count}/${COMPANIES.length}] Processing: ${name}`);
    
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

  console.log("\nPhase 2 Global Sync completed successfully.");
}

run()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
