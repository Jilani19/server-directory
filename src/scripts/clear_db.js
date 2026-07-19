const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.provenance.deleteMany({});
  await prisma.facility.deleteMany({});
  await prisma.financial.deleteMany({});
  await prisma.drug.deleteMany({});
  await prisma.clinicalTrial.deleteMany({});
  await prisma.patent.deleteMany({});
  await prisma.publication.deleteMany({});
  await prisma.companyRelationship.deleteMany({});
  await prisma.company.deleteMany({});
  console.log("Database wiped clean.");
}
run().finally(() => prisma.$disconnect());
