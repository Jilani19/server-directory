const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const targetCompanies = [
    'abbvie', 'pfizer', 'merck', 'moderna', 'roche', 'novartis', 'johnson-johnson'
  ];
  
  const results = [];
  
  for (const slug of targetCompanies) {
    const c = await prisma.company.findUnique({
      where: { slug },
      include: {
        drugs: true,
        clinicalTrials: true,
        facilities: true,
        executives: true,
        patents: true,
        publications: true,
        news: true,
        documents: true
      }
    });

    const singleRes = await axios.get(`http://localhost:5000/api/v1/companies/${slug}`);
    const a = singleRes.data.data;
    
    const listRes = await axios.get(`http://localhost:5000/api/v1/companies?search=${slug}`);
    const d = listRes.data.data.find(x => x.slug === slug);
    
    // Check if lengths match across DB -> Single API -> Directory API
    const match = {
       slug: slug,
       products: { db: c.drugs.length, api: a.drugs?.length, dir: d?.drugs?.length },
       trials: { db: c.clinicalTrials.length, api: a.clinicalTrials?.length, dir: d?.clinicalTrials?.length },
       facilities: { db: c.facilities.length, api: a.facilities?.length, dir: d?.facilities?.length },
       executives: { db: c.executives.length, api: a.executives?.length, dir: d?.executives?.length },
       patents: { db: c.patents.length, api: a.patents?.length, dir: d?.patents?.length },
       publications: { db: c.publications.length, api: a.publications?.length, dir: d?.publications?.length },
    }
    
    results.push(match);
  }
  
  console.log(JSON.stringify(results, null, 2));
}

run().catch(e => console.log(e.message)).finally(() => process.exit(0));
