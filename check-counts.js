const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCounts() {
  const models = [
    'Company', 'Drug', 'CompanyExecutive', 'CompanyPublication',
    'CompanyPatent', 'CompanyNews', 'CompanyDocument', 'CompanyClinicalTrial',
    'GlobalClinicalTrial', 'GlobalPatent', 'GlobalDisease', 'GlobalTarget',
    'CompanyTrialRelation', 'CompanyDrugRelation'
  ];
  
  console.log("Model | Records");
  console.log("-----------------------");
  for (const m of models) {
    const prismaKey = m.charAt(0).toLowerCase() + m.slice(1);
    if (prisma[prismaKey]) {
      const c = await prisma[prismaKey].count();
      console.log(`${m.padEnd(20)} | ${c}`);
    } else {
      console.log(`${m.padEnd(20)} | NOT IN SCHEMA`);
    }
  }
}

checkCounts().then(() => process.exit(0));
