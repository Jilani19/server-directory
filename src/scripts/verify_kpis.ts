import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const companies = await prisma.company.findMany({
    include: { _count: { select: { products: true, clinicalTrials: true } } },
    orderBy: { clinicalTrials: { _count: 'desc' } },
    take: 6
  });

  console.log("==================================================");
  console.log("🧬 FINAL ARCHITECTURE KPI VERIFICATION");
  console.log("==================================================");
  
  for (const c of companies) {
    console.log(`[${c.name}] (${c.slug})`);
    console.log(`  - Products Count      : ${c._count.products}`);
    console.log(`  - Clinical Trials     : ${c._count.clinicalTrials}`);
    console.log("--------------------------------------------------");
  }
}

run().then(() => prisma.$disconnect()).catch(console.error);
