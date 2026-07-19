const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET_COMPANIES = [
  "AbbVie", "Pfizer", "Johnson & Johnson", "Merck", "Moderna", 
  "Roche", "Novartis", "AstraZeneca", "Sanofi", "GSK", 
  "Eli Lilly", "Amgen", "IQVIA", "Dr. Reddy's", "Sun Pharma", 
  "Thermo Fisher Scientific"
];

async function run() {
  console.log(`| Company | Employees | Approved Products | Registered Trials | Active Trials | Connector Used | Last Verified | Source URL |`);
  console.log(`| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |`);

  for (const name of TARGET_COMPANIES) {
    const company = await prisma.company.findFirst({
      where: { name: { contains: name.replace("'", "") } },
      include: {
        drugs: true,
        clinicalTrials: true
      }
    });

    if (company) {
      console.log(`| **${name}** | ${company.employees || "Unknown"} | ${company.drugs.length} | ${company.clinicalTrials.length} | ${company.activeTrialsCount} | OpenFDA + ClinicalTrials.gov | ${company.lastSyncSuccess ? company.lastSyncSuccess.toISOString() : "Unknown"} | api.fda.gov / clinicaltrials.gov |`);
    } else {
      console.log(`| **${name}** | N/A | N/A | N/A | N/A | N/A | N/A | N/A |`);
    }
  }
}

run().catch(e => console.log(e)).finally(() => process.exit(0));
