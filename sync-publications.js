const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const TARGET_COMPANIES = [
  "AbbVie", "Pfizer", "Johnson & Johnson", "Merck", "Moderna", 
  "Novartis", "Roche", "Sanofi", "GSK", "Eli Lilly", 
  "Amgen", "IQVIA", "Dr. Reddy's", "Sun Pharma", "Thermo Fisher Scientific"
];

async function syncPublications() {
  console.log("Starting Publications Sync from PubMed...");
  
  for (const name of TARGET_COMPANIES) {
    console.log(`\n============================`);
    console.log(`Fetching Publications for: ${name}`);
    
    const company = await prisma.company.findFirst({
      where: { name: { contains: name } }
    });

    if (!company) {
      console.log(`-> Not found in DB, skipping.`);
      continue;
    }

    try {
      const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(name)}[Affiliation]&retmode=json&retmax=50`;
      const res = await axios.get(searchUrl);
      const idList = res.data?.esearchresult?.idlist || [];
      
      console.log(`Found ${idList.length} recent publications for ${name}.`);

      if (idList.length > 0) {
        // Clear old publications for this company to avoid dupes
        await prisma.companyPublication.deleteMany({ where: { companyId: company.id } });

        // Fetch details for these IDs
        const summaryUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${idList.join(',')}&retmode=json`;
        const sumRes = await axios.get(summaryUrl);
        const resultDict = sumRes.data?.result || {};

        const pubInserts = [];
        for (const id of idList) {
          const pub = resultDict[id];
          if (pub) {
            pubInserts.push({
              pmid: pub.uid,
              title: pub.title || 'Untitled',
              journal: pub.fulljournalname || pub.source || 'Unknown Journal',
              publicationDate: pub.pubdate || '',
              authors: (pub.authors || []).map(a => a.name).join(', '),
              url: `https://pubmed.ncbi.nlm.nih.gov/${pub.uid}/`,
              companyId: company.id
            });
          }
        }

        // Insert
        for (const p of pubInserts) {
          await prisma.companyPublication.upsert({
            where: { pmid: p.pmid },
            update: { title: p.title, journal: p.journal, publicationDate: p.publicationDate, authors: p.authors },
            create: p
          });
        }
      }
      
      // Update Provenance
      let currentProv = {};
      try { currentProv = JSON.parse(company.provenance || "{}"); } catch(e){}
      currentProv.publications = { source: "PubMed API (NLM)", lastVerified: new Date().toISOString() };
      
      await prisma.company.update({
        where: { id: company.id },
        data: { provenance: JSON.stringify(currentProv) }
      });
      console.log(`-> Synced ${idList.length} publications for ${name}.`);
      
    } catch (e) {
      console.error(`Error syncing publications for ${name}:`, e.message);
    }
  }
}

syncPublications().then(() => {
  console.log("Finished syncing publications.");
  process.exit(0);
}).catch(console.error);
