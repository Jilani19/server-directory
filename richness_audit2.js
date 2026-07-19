const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const drugRels    = await prisma.companyDrugRelation.count();
  const trialRels   = await prisma.companyTrialRelation.count();
  const patentRels  = await prisma.companyPatentRelation.count();
  const globalTrials = await prisma.globalClinicalTrial.count();
  const globalPatents = await prisma.globalPatent.count();
  const products    = await prisma.product.count();
  const pipeline    = await prisma.companyPipelineAsset.count();
  const workforce   = await prisma.companyWorkforce.count();
  const esg         = await prisma.companyESG.count();
  const digitalAssets = await prisma.companyDigitalAsset.count();

  console.log(JSON.stringify({ drugRels, trialRels, patentRels, globalTrials, globalPatents, products, pipeline, workforce, esg, digitalAssets }, null, 2));

  // Check if drugRelations on company (direct many-to-many via Company.drugRelations)
  const amgen = await prisma.company.findFirst({
    where: { name: { contains: 'Amgen', mode: 'insensitive' } },
    select: {
      name: true, revenue: true, marketCap: true, employees: true, ticker: true,
      stockPrice: true, rdSpend: true, aboutDescription: true, description: true,
      businessOverview: true, researchFocus: true, therapeuticAreas: true,
      _count: {
        select: {
          drugs: true, clinicalTrials: true, drugRelations: true, trialRelations: true,
          patentRelations: true, patents: true, publications: true, facilities: true,
          executives: true, news: true, documents: true, regulatoryActions: true, relationships: true, contacts: true,
        }
      }
    }
  });
  console.log('\n=== AMGEN DETAIL ===');
  console.log(JSON.stringify(amgen, null, 2));

  // Check connectors
  const connectors = await prisma.connector.findMany({ select: { name: true, status: true, lastRunAt: true } });
  console.log('\n=== CONNECTORS ===');
  console.log(JSON.stringify(connectors, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
