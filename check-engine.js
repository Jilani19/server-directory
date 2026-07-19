const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const companies = await prisma.company.findMany({
    orderBy: { isFeatured: 'desc' },
    take: 15,
    include: {
      _count: {
        select: {
          executives: true,
          facilities: true,
          publications: true,
          drugRelations: true,
          trialRelations: true
        }
      }
    }
  });

  console.log("Company | Revenue | Execs | Facs | Pubs | Drugs | Active Trials");
  console.log("------------------------------------------------------------------");
  for (const c of companies) {
    console.log(`${c.name.substring(0, 15).padEnd(15)} | ${String(c.revenue).padEnd(8)} | ${String(c._count.executives).padEnd(5)} | ${String(c._count.facilities).padEnd(4)} | ${String(c._count.publications).padEnd(4)} | ${String(c._count.drugRelations).padEnd(5)} | ${c.activeTrialsCount}`);
  }
}

check().then(() => process.exit(0));
