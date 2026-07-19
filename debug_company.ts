import { prisma } from './src/config/prisma';

async function debugCompany(slug: string) {
  const company = await prisma.company.findUnique({ where: { slug } });
  if (!company) {
    console.log('Company not found');
    return;
  }
  console.log('--- Company ---');
  console.log(company);

  // Clinical Trials
  const trials = await prisma.companyClinicalTrial.findMany({ where: { companyId: company.id } });
  console.log('\n--- Clinical Trials count:", trials.length);');
  console.log(trials.slice(0, 2)); // show first 2

  // Products (drugs)
  const products = await prisma.product.findMany({ where: { companyId: company.id } });
  console.log('\n--- Products count:', products.length);
  console.log(products.slice(0, 2));

  // Executives
  const execs = await prisma.companyExecutive.findMany({ where: { companyId: company.id } });
  console.log('\n--- Executives count:', execs.length);
  console.log(execs.slice(0, 2));

  // Patents
  const patents = await prisma.companyPatent.findMany({ where: { companyId: company.id } });
  console.log('\n--- Patents count:', patents.length);
  console.log(patents.slice(0, 2));

  // News
  const news = await prisma.companyNews.findMany({ where: { companyId: company.id } });
  console.log('\n--- News count:', news.length);
  console.log(news.slice(0, 2));

  // Regulatory (footprint only)
  const regulatory = await prisma.company.findUnique({ where: { slug }, select: { regulatoryFootprint: true } });
  console.log('\n--- Regulatory footprint:', regulatory?.regulatoryFootprint);

  // Documents
  const documents = await prisma.companyDocument.findMany({ where: { companyId: company.id } });
  console.log('\n--- Documents count:', documents.length);
  console.log(documents.slice(0, 2));

  // Relationships (companyRelationship)
  const relationships = await prisma.companyRelationship.findMany({ where: { companyId: company.id } });
  console.log('\n--- Relationships count:', relationships.length);
  console.log(relationships.slice(0, 2));

  // Contacts
  const contacts = await prisma.companyContact.findMany({ where: { companyId: company.id } });
  console.log('\n--- Contacts count:', contacts.length);
  console.log(contacts.slice(0, 2));
}

debugCompany('amgen-1784395795531')
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
