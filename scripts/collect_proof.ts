import { prisma } from '../src/config/prisma';
import fetch from 'node-fetch';

async function countTables(){
  const drug = await prisma.drug.count();
  const drugRel = await prisma.companyDrugRelation.count();
  const trial = await prisma.companyClinicalTrial.count();
  const exec = await prisma.companyExecutive.count();
  const patent = await prisma.companyPatent.count();
  const news = await prisma.companyNews.count();
  const reg = await prisma.companyRegulatoryAction.count();
  const doc = await prisma.companyDocument.count();
  const rel = await prisma.companyRelationship.count();
  const contact = await prisma.companyContact?.count?.(); // may not exist
  console.log('TABLE_COUNTS', {drug, drugRel, trial, exec, patent, news, reg, doc, rel, contact});
}

async function fetchEndpoint(path:string){
  const res = await fetch(`http://localhost:5000/api/v1/profile/amgen/${path}`);
  const json = await res.json();
  console.log(`API_${path.toUpperCase()}`, JSON.stringify(json).substring(0,500));
}

async function main(){
  await countTables();
  await fetchEndpoint('products');
  await fetchEndpoint('trials');
  await fetchEndpoint('financials');
  await fetchEndpoint('leadership');
  await fetchEndpoint('patents');
  await fetchEndpoint('news');
  await fetchEndpoint('regulatory');
  await fetchEndpoint('documents');
  await fetchEndpoint('relationships');
  await fetchEndpoint('contacts');
  await prisma.$disconnect();
}

main().catch(e=>{console.error(e); process.exit(1);});
