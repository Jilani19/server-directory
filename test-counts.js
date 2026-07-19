const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const companySlug = 'abbvie';
  const c = await prisma.company.findUnique({
    where: { slug: companySlug },
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

  const apiRes = await axios.get(`http://localhost:5000/api/v1/companies/${companySlug}`);
  const a = apiRes.data.data;

  console.log("Section      | DB Count | API Count");
  console.log("-----------------------------------");
  console.log(`Products     | ${c.drugs.length.toString().padEnd(8)} | ${a.drugs?.length || 0}`);
  console.log(`Trials       | ${c.clinicalTrials.length.toString().padEnd(8)} | ${a.clinicalTrials?.length || 0}`);
  console.log(`Facilities   | ${c.facilities.length.toString().padEnd(8)} | ${a.facilities?.length || 0}`);
  console.log(`Executives   | ${c.executives.length.toString().padEnd(8)} | ${a.executives?.length || 0}`);
  console.log(`Patents      | ${c.patents.length.toString().padEnd(8)} | ${a.patents?.length || 0}`);
  console.log(`Publications | ${c.publications.length.toString().padEnd(8)} | ${a.publications?.length || 0}`);
  console.log(`News         | ${c.news.length.toString().padEnd(8)} | ${a.news?.length || 0}`);
  console.log(`Documents    | ${c.documents.length.toString().padEnd(8)} | ${a.documents?.length || 0}`);
}

run().catch(e => console.log(e.message)).finally(() => process.exit(0));
