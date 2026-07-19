const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const TARGET_COMPANIES = [
    "AbbVie", "Pfizer", "Johnson & Johnson", "Merck", "Moderna", 
    "Novartis", "Roche", "Sanofi", "GSK", "Eli Lilly", 
    "IQVIA", "Dr. Reddy's", "Sun Pharma", "Amgen", "Thermo Fisher Scientific", "AstraZeneca"
  ];
  
  const companies = await prisma.company.findMany({
    where: { name: { in: TARGET_COMPANIES } },
    include: {
      _count: {
        select: {
          drugRelations: true,
          trialRelations: true,
          facilities: true
        }
      }
    }
  });

  console.log("Company | Employees | Products | Active Trials | Facilities | Revenue | Headquarters | Source | Last Sync");
  console.log("---------------------------------------------------------------------------------------------");
  for (const c of companies) {
    let source = "Unknown";
    try {
        if(c.provenance) {
            const p = JSON.parse(c.provenance);
            source = Object.values(p).filter(Boolean).join(", ");
        }
    } catch(e) {}

    console.log(`${c.name} | ${c.employees || '-'} | ${c._count.drugRelations} | ${c.activeTrialsCount || 0} | ${c._count.facilities} | ${c.revenue || '-'} | ${c.hqAddress || '-'} | ${source} | ${c.lastSyncSuccess ? new Date(c.lastSyncSuccess).toISOString().substring(0, 10) : 'None'}`);
  }
}

check().then(() => process.exit(0)).catch(console.error);
