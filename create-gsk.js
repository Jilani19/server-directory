const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function r() {
  await prisma.company.create({
    data: {
      name: "GSK",
      legalName: "GlaxoSmithKline plc",
      slug: "gsk",
      description: "GSK is a global biopharma company.",
      status: "ACTIVE",
      isFeatured: true,
      displayPriority: 10,
      industry: "Pharmaceuticals",
      employees: "70,000",
      hqAddress: "London, UK",
      lastSyncSuccess: new Date(),
    }
  });
}
r().catch(console.error).finally(()=>process.exit(0));
