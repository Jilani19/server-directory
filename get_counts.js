const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run(){
  const slug='amgen-1784395795531';
  const company = await prisma.company.findUnique({ where:{slug}});
  if(!company){ console.log('Company not found'); return; }
  const counts = {
    clinicalTrials: await prisma.companyClinicalTrial.count({where:{companyId:company.id}}),
    products: await prisma.product.count({where:{companyId:company.id}}),
    pipeline: await prisma.product.count({where:{companyId:company.id, approvalStatus:{not:'Approved'}}}),
    leadership: await prisma.companyExecutive.count({where:{companyId:company.id}}),
    patents: await prisma.companyPatent.count({where:{companyId:company.id}}),
    news: await prisma.companyNews.count({where:{companyId:company.id}}),
    regulatory: await prisma.companyRegulatory.count({where:{companyId:company.id}}),
    documents: await prisma.companyDocument.count({where:{companyId:company.id}}),
    relationships: await prisma.companyRelationship.count({where:{companyId:company.id}}),
    contacts: await prisma.companyContact.count({where:{companyId:company.id}}),
  };
  console.log(counts);
}
run().finally(()=>prisma.$disconnect());
