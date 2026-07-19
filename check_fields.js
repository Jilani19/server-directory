const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const r = await prisma.companyRelationship.findFirst();
  console.log('Fields:', JSON.stringify(r));
  const c = await prisma.companyContact.findFirst();
  console.log('Contact fields:', JSON.stringify(c));
  const pipe = await prisma.companyPipelineAsset.findFirst();
  console.log('Pipeline fields:', JSON.stringify(pipe));
}
main().catch(e => console.log('ERROR:', e.message)).finally(() => prisma.$disconnect());
