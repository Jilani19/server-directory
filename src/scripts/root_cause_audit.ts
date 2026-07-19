import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function runAudit() {
  const slugs = ['abbvie', 'pfizer', 'merck', 'novartis', 'roche', 'sanofi'];
  const companies = await prisma.company.findMany({
    where: { slug: { in: slugs } },
    include: {
      _count: {
        select: {
          products: true,
          clinicalTrials: true,
          publications: true,
          patents: true,
          news: true,
          facilities: true,
          financials: true,
          leaderships: true,
          contacts: true,
          regulatory: true
        }
      }
    }
  });

  console.log("=== ROOT CAUSE AUDIT ===");
  for (const c of companies) {
    console.log(`[${c.name}]`);
    console.log(c._count);
  }
}

runAudit().then(() => prisma.$disconnect()).catch(console.error);
