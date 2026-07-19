const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const SLUG = 'amgen-1784395795531';

async function main() {
  const company = await prisma.company.findUnique({ where: { slug: SLUG } });
  if (!company) { console.log('COMPANY NOT FOUND'); return; }
  console.log('Company ID:', company.id);
  console.log('Company Name:', company.name);
  console.log('');

  // Products
  const productsTotal = await prisma.product.count({ where: { companyId: company.id } });
  const products = await prisma.product.findMany({ where: { companyId: company.id }, take: 2 });
  console.log('=== PRODUCTS ===', 'Count:', productsTotal);
  console.log('First 2:', JSON.stringify(products.slice(0,2).map(p => ({ id: p.id, name: p.name, status: p.status, ndcCode: p.ndcCode })), null, 2));
  console.log('');

  // Clinical Trials
  const trialsTotal = await prisma.companyClinicalTrial.count({ where: { companyId: company.id } });
  const trials = await prisma.companyClinicalTrial.findMany({ where: { companyId: company.id }, take: 2 });
  console.log('=== CLINICAL TRIALS ===', 'Count:', trialsTotal);
  console.log('First 2:', JSON.stringify(trials.map(t => ({ id: t.id, title: t.title, phase: t.phase, status: t.status })), null, 2));
  console.log('');

  // Leadership (companyExecutive)
  const execsTotal = await prisma.companyExecutive.count({ where: { companyId: company.id } });
  const execs = await prisma.companyExecutive.findMany({ where: { companyId: company.id }, take: 2 });
  console.log('=== LEADERSHIP ===', 'Count:', execsTotal);
  console.log('First 2:', JSON.stringify(execs.map(e => ({ id: e.id, name: e.name, title: e.title })), null, 2));
  console.log('');

  // Financials (companyFinancialPeriod)
  const finTotal = await prisma.companyFinancialPeriod.count({ where: { companyId: company.id } });
  const fins = await prisma.companyFinancialPeriod.findMany({ where: { companyId: company.id }, take: 2 });
  console.log('=== FINANCIALS (companyFinancialPeriod) ===', 'Count:', finTotal);
  console.log('First 2:', JSON.stringify(fins, null, 2));
  console.log('');
  // Also inline financials on company record
  console.log('Inline company financials: revenue=', company.revenue, 'marketCap=', company.marketCap, 'netIncome=', company.netIncome);
  console.log('');

  // News
  const newsTotal = await prisma.companyNews.count({ where: { companyId: company.id } });
  const news = await prisma.companyNews.findMany({ where: { companyId: company.id }, take: 2 });
  console.log('=== NEWS ===', 'Count:', newsTotal);
  console.log('First 2:', JSON.stringify(news.map(n => ({ id: n.id, title: n.title, source: n.source })), null, 2));
  console.log('');

  // Documents
  const docsTotal = await prisma.companyDocument.count({ where: { companyId: company.id } });
  const docs = await prisma.companyDocument.findMany({ where: { companyId: company.id }, take: 2 });
  console.log('=== DOCUMENTS ===', 'Count:', docsTotal);
  console.log('First 2:', JSON.stringify(docs.map(d => ({ id: d.id, title: d.title, category: d.category })), null, 2));
  console.log('');

  // Regulatory (companyRegulatoryAction)
  const regTotal = await prisma.companyRegulatoryAction.count({ where: { companyId: company.id } });
  const reg = await prisma.companyRegulatoryAction.findMany({ where: { companyId: company.id }, take: 2 });
  console.log('=== REGULATORY (companyRegulatoryAction) ===', 'Count:', regTotal);
  console.log('First 2:', JSON.stringify(reg.slice(0,2), null, 2));
  console.log('');

  // Pipeline (companyPipelineAsset)
  const pipeTotal = await prisma.companyPipelineAsset.count({ where: { companyId: company.id } });
  const pipe = await prisma.companyPipelineAsset.findMany({ where: { companyId: company.id }, take: 2 });
  console.log('=== PIPELINE (companyPipelineAsset) ===', 'Count:', pipeTotal);
  console.log('First 2:', JSON.stringify(pipe.slice(0,2), null, 2));
  console.log('');

  // Relationships (companyRelationship)
  const relsTotal = await prisma.companyRelationship.count({ where: { OR: [{ sourceCompanyId: company.id }, { targetCompanyId: company.id }] } });
  console.log('=== RELATIONSHIPS (companyRelationship) ===', 'Count:', relsTotal);
  console.log('');

  // Contacts (companyContact)
  const contactsTotal = await prisma.companyContact.count({ where: { companyId: company.id } });
  const contacts = await prisma.companyContact.findMany({ where: { companyId: company.id }, take: 2 });
  console.log('=== CONTACTS (companyContact) ===', 'Count:', contactsTotal);
  console.log('First 2:', JSON.stringify(contacts.slice(0,2), null, 2));
  console.log('');

  // Patents
  const patentsTotal = await prisma.companyPatent.count({ where: { companyId: company.id } });
  const patents = await prisma.companyPatent.findMany({ where: { companyId: company.id }, take: 2 });
  console.log('=== PATENTS ===', 'Count:', patentsTotal);
  console.log('First 2:', JSON.stringify(patents.map(p => ({ id: p.id, title: p.title, status: p.status })), null, 2));
  console.log('');

  // Publications
  const pubTotal = await prisma.companyPublication.count({ where: { companyId: company.id } });
  const pub = await prisma.companyPublication.findMany({ where: { companyId: company.id }, take: 2 });
  console.log('=== PUBLICATIONS ===', 'Count:', pubTotal);
  console.log('First 2:', JSON.stringify(pub.map(p => ({ id: p.id, title: p.title })), null, 2));
  console.log('');

  // Facilities
  const facTotal = await prisma.companyFacility.count({ where: { companyId: company.id } });
  console.log('=== FACILITIES (companyFacility) ===', 'Count:', facTotal);
  console.log('');

  // Drug Relations
  const drTotal = await prisma.companyDrugRelation.count({ where: { companyId: company.id } });
  console.log('=== DRUG RELATIONS ===', 'Count:', drTotal);
  console.log('');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
