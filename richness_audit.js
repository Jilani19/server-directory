const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function safeCount(fn) {
  try { return await fn(); } catch(e) { return 'ERR:' + e.message.split('\n')[0]; }
}

async function main() {
  const companies = await prisma.company.count();
  const drugs     = await prisma.drug.count();
  const execs     = await prisma.companyExecutive.count();
  const facilities = await prisma.companyFacility.count();
  const pubs      = await prisma.companyPublication.count();
  const patents   = await prisma.companyPatent.count();
  const news      = await prisma.companyNews.count();
  const docs      = await prisma.companyDocument.count();
  const regulatory = await prisma.companyRegulatoryAction.count();
  const relationships = await prisma.companyRelationship.count();
  const contacts  = await prisma.companyContact.count();
  const trials    = await prisma.companyClinicalTrial.count();
  const financials = await prisma.companyFinancialPeriod.count();
  const pipeline  = await prisma.companyPipelineAsset.count();

  console.log('=== RECORD COUNTS ===');
  console.log(JSON.stringify({ companies, drugs, execs, facilities, pubs, patents, news, docs, regulatory, relationships, contacts, trials, financials, pipeline }, null, 2));

  // Company enrichment - use only known valid fields
  const [withRevenue, withEmployees, withWebsite, withMarketCap, withTicker, withDescription] = await Promise.all([
    prisma.company.count({ where: { revenue: { not: null } } }),
    prisma.company.count({ where: { employees: { not: null } } }),
    prisma.company.count({ where: { website: { not: null } } }),
    prisma.company.count({ where: { marketCap: { not: null } } }),
    prisma.company.count({ where: { ticker: { not: null } } }),
    prisma.company.count({ where: { aboutDescription: { not: null } } }),
  ]);

  const [withExecs, withFacils, withDrugs, withTrials, withPatents, withPubs, withNews, withDocs, withReg] = await Promise.all([
    prisma.company.count({ where: { executives: { some: {} } } }),
    prisma.company.count({ where: { facilities: { some: {} } } }),
    prisma.company.count({ where: { drugs: { some: {} } } }),
    prisma.company.count({ where: { clinicalTrials: { some: {} } } }),
    prisma.company.count({ where: { patents: { some: {} } } }),
    prisma.company.count({ where: { publications: { some: {} } } }),
    prisma.company.count({ where: { news: { some: {} } } }),
    prisma.company.count({ where: { documents: { some: {} } } }),
    prisma.company.count({ where: { regulatoryActions: { some: {} } } }),
  ]);

  console.log('\n=== ENRICHMENT COVERAGE (of', companies, 'companies) ===');
  console.log(JSON.stringify({ withRevenue, withEmployees, withWebsite, withMarketCap, withTicker, withDescription, withExecs, withFacils, withDrugs, withTrials, withPatents, withPubs, withNews, withDocs, withReg }, null, 2));

  // Drug field coverage
  if (drugs > 0) {
    const sample = await prisma.drug.findFirst();
    console.log('\n=== DRUG FIELDS AVAILABLE ===');
    console.log(Object.keys(sample).join(', '));
    const [withBrand, withGeneric, withStatus, withTherapeutic, withManufacturer] = await Promise.all([
      prisma.drug.count({ where: { brandName: { not: null } } }),
      prisma.drug.count({ where: { genericName: { not: null } } }),
      prisma.drug.count({ where: { approvalStatus: { not: null } } }),
      prisma.drug.count({ where: { therapeuticArea: { not: null } } }),
      safeCount(() => prisma.drug.count({ where: { manufacturer: { not: null } } })),
    ]);
    console.log('Drug coverage:', JSON.stringify({ drugs, withBrand, withGeneric, withStatus, withTherapeutic, withManufacturer }, null, 2));
  }

  // Exec field check
  if (execs > 0) {
    const sample = await prisma.companyExecutive.findFirst();
    console.log('\n=== EXEC FIELDS AVAILABLE ===');
    console.log(Object.keys(sample).join(', '));
    console.log('Sample:', JSON.stringify(sample, null, 2));
  }

  // Trial field check
  if (trials > 0) {
    const sample = await prisma.companyClinicalTrial.findFirst();
    console.log('\n=== TRIAL FIELDS AVAILABLE ===');
    console.log(Object.keys(sample).join(', '));
  }

  // Facility check
  if (facilities > 0) {
    const sample = await prisma.companyFacility.findFirst();
    console.log('\n=== FACILITY FIELDS AVAILABLE ===');
    console.log(Object.keys(sample).join(', '));
    console.log('Sample:', JSON.stringify(sample, null, 2));
  }

  // Patent check
  if (patents > 0) {
    const sample = await prisma.companyPatent.findFirst();
    console.log('\n=== PATENT FIELDS AVAILABLE ===');
    console.log(Object.keys(sample).join(', '));
  }

  // Publication check
  if (pubs > 0) {
    const sample = await prisma.companyPublication.findFirst();
    console.log('\n=== PUBLICATION FIELDS AVAILABLE ===');
    console.log(Object.keys(sample).join(', '));
  }

  // News check
  if (news > 0) {
    const sample = await prisma.companyNews.findFirst();
    console.log('\n=== NEWS FIELDS AVAILABLE ===');
    console.log(Object.keys(sample).join(', '));
  }

  // Best enriched company
  const best = await prisma.company.findFirst({
    where: { revenue: { not: null } },
    orderBy: { updatedAt: 'desc' },
    select: {
      name: true, revenue: true, marketCap: true, employees: true, ticker: true,
      website: true, rdSpend: true, stockPrice: true, aboutDescription: true,
      _count: {
        select: {
          drugs: true, clinicalTrials: true, patents: true, publications: true,
          facilities: true, executives: true, news: true, documents: true, regulatoryActions: true,
        }
      }
    }
  });
  console.log('\n=== BEST ENRICHED COMPANY ===');
  console.log(JSON.stringify(best, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
