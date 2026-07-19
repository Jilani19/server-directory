const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const [
    companies,
    drugs,
    companyDrugLinks,
    trials,
    companyTrialLinks,
    patents,
    publications,
    facilities,
    executives,
    news,
    documents,
    regulatoryActions,
    relationships,
    contacts,
  ] = await Promise.all([
    prisma.company.count(),
    prisma.drug.count(),
    prisma.companyDrug.count(),
    prisma.clinicalTrial.count(),
    prisma.companyTrial.count(),
    prisma.patent.count(),
    prisma.publication.count(),
    prisma.facility.count(),
    prisma.executive.count(),
    prisma.news.count(),
    prisma.document.count(),
    prisma.regulatoryAction.count(),
    prisma.relationship.count(),
    prisma.contact.count(),
  ]);

  console.log(JSON.stringify({
    companies, drugs, companyDrugLinks, trials, companyTrialLinks,
    patents, publications, facilities, executives, news,
    documents, regulatoryActions, relationships, contacts,
  }, null, 2));

  // Sample Amgen data richness
  const amgen = await prisma.company.findFirst({
    where: { name: { contains: 'Amgen', mode: 'insensitive' } },
    include: {
      _count: {
        select: {
          drugs: true,
          trialRelations: true,
          patents: true,
          publications: true,
          facilities: true,
          executives: true,
          news: true,
          documents: true,
          regulatoryActions: true,
          relationships: true,
          contacts: true,
        }
      },
      drugs: { take: 2 },
      trialRelations: { take: 2, include: { trial: { select: { nctId: true, title: true, phase: true, status: true } } } },
      executives: { take: 2 },
      facilities: { take: 2 },
      patents: { take: 2 },
      publications: { take: 2 },
      news: { take: 2 },
    }
  });

  if (amgen) {
    console.log('\n=== AMGEN DATA RICHNESS ===');
    console.log('Counts:', JSON.stringify(amgen._count, null, 2));
    console.log('Sample drug:', JSON.stringify(amgen.drugs[0] || null, null, 2));
    console.log('Sample trial:', JSON.stringify(amgen.trialRelations[0]?.trial || null, null, 2));
    console.log('Revenue:', amgen.revenue, '| MarketCap:', amgen.marketCap, '| Employees:', amgen.employees);
    console.log('Website:', amgen.website, '| Ticker:', amgen.ticker, '| Industry:', amgen.industry);
  }

  // Check how many companies have enriched data
  const withRevenue = await prisma.company.count({ where: { revenue: { not: null } } });
  const withEmployees = await prisma.company.count({ where: { employees: { not: null } } });
  const withWebsite = await prisma.company.count({ where: { website: { not: null } } });
  const withMarketCap = await prisma.company.count({ where: { marketCap: { not: null } } });
  const withExecutives = await prisma.company.count({ where: { executives: { some: {} } } });
  const withFacilities = await prisma.company.count({ where: { facilities: { some: {} } } });
  const withDrugs = await prisma.company.count({ where: { drugs: { some: {} } } });
  const withTrials = await prisma.company.count({ where: { trialRelations: { some: {} } } });
  const withPatents = await prisma.company.count({ where: { patents: { some: {} } } });
  const withPublications = await prisma.company.count({ where: { publications: { some: {} } } });
  const withNews = await prisma.company.count({ where: { news: { some: {} } } });
  const withDocuments = await prisma.company.count({ where: { documents: { some: {} } } });

  console.log('\n=== ENRICHMENT COVERAGE (of', companies, 'companies) ===');
  console.log(JSON.stringify({
    withRevenue, withEmployees, withWebsite, withMarketCap,
    withExecutives, withFacilities, withDrugs, withTrials,
    withPatents, withPublications, withNews, withDocuments,
  }, null, 2));

  // Check drug field coverage
  const drugsWithBrandName = await prisma.drug.count({ where: { brandName: { not: null } } });
  const drugsWithGenericName = await prisma.drug.count({ where: { genericName: { not: null } } });
  const drugsWithApprovalStatus = await prisma.drug.count({ where: { approvalStatus: { not: null } } });
  const drugsWithTherapeuticArea = await prisma.drug.count({ where: { therapeuticArea: { not: null } } });
  const drugsWithManufacturer = await prisma.drug.count({ where: { manufacturer: { not: null } } });
  const drugsWithApprovalYear = await prisma.drug.count({ where: { approvalYear: { not: null } } });

  console.log('\n=== DRUG FIELD COVERAGE ===');
  console.log(JSON.stringify({ drugs, drugsWithBrandName, drugsWithGenericName, drugsWithApprovalStatus, drugsWithTherapeuticArea, drugsWithManufacturer, drugsWithApprovalYear }, null, 2));

  // Check trial field coverage
  const trialsWithPhase = await prisma.clinicalTrial.count({ where: { phase: { not: null } } });
  const trialsWithStatus = await prisma.clinicalTrial.count({ where: { status: { not: null } } });
  const trialsWithEnrollment = await prisma.clinicalTrial.count({ where: { enrollment: { not: null } } });
  const trialsWithTitle = await prisma.clinicalTrial.count({ where: { title: { not: null } } });

  console.log('\n=== TRIAL FIELD COVERAGE ===');
  console.log(JSON.stringify({ trials, trialsWithPhase, trialsWithStatus, trialsWithEnrollment, trialsWithTitle }, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
