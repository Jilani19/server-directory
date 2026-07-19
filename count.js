const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.company.count();
  console.log('COMPANY_COUNT:', count);
}
main().finally(() => prisma.$disconnect());
