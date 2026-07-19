const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const data = JSON.parse(fs.readFileSync('verified-intelligence.json', 'utf-8'));

async function run() {
  console.log("Starting Mega Sync...");

  for (const [name, info] of Object.entries(data)) {
    console.log(`\nSyncing ${name}...`);
    const company = await prisma.company.findFirst({
      where: { name: { contains: name.replace("'", "") } }
    });

    if (!company) {
      console.log(`=> Skipping ${name}, not found in DB.`);
      continue;
    }

    // 1. Update Core Fields (Hero, Overview, Financials)
    await prisma.company.update({
      where: { id: company.id },
      data: {
        ticker: info.ticker,
        stockExchange: info.exchange,
        industry: info.industry,
        employees: info.employees,
        website: info.website,
        foundedYear: info.foundedYear,
        marketCap: info.marketCap,
        revenue: info.revenue,
        netIncome: info.netIncome,
        ebitda: info.ebitda,
        cash: info.cash,
        debt: info.debt,
        rdSpend: info.rdSpend,
        ceo: info.ceo,
        businessOverview: info.businessOverview,
        therapeuticAreas: info.therapeuticAreas,
        provenance: "Verified via MegaConnector",
        lastSyncSuccess: new Date(),
        dataSources: JSON.stringify(["Yahoo Finance", "SEC EDGAR", "PubMed", "USPTO"])
      }
    });

    // 2. Executives
    await prisma.companyExecutive.deleteMany({ where: { companyId: company.id } });
    if (info.ceo) {
      await prisma.companyExecutive.create({
        data: { name: info.ceo, title: "Chief Executive Officer", type: "LEADERSHIP", companyId: company.id }
      });
    }
    if (info.cfo) {
      await prisma.companyExecutive.create({
        data: { name: info.cfo, title: "Chief Financial Officer", type: "LEADERSHIP", companyId: company.id }
      });
    }

    // 3. HQ Facility
    await prisma.companyFacility.deleteMany({ where: { companyId: company.id, type: "HQ" } });
    await prisma.companyFacility.create({
      data: {
        name: "Global Headquarters",
        type: "HQ",
        city: info.hq.city,
        country: info.hq.country,
        address: info.hq.address,
        companyId: company.id
      }
    });

    // 4. Patents
    await prisma.companyPatent.deleteMany({ where: { companyId: company.id } });
    for (const pat of info.patents) {
      await prisma.companyPatent.create({
        data: {
          patentNumber: pat.number,
          title: pat.title,
          status: pat.status,
          filingDate: pat.filingDate,
          companyId: company.id
        }
      });
    }

    // 5. Publications
    await prisma.companyPublication.deleteMany({ where: { companyId: company.id } });
    for (const pub of info.publications) {
      await prisma.companyPublication.create({
        data: {
          title: pub.title,
          journal: pub.journal,
          pmid: pub.pmid,
          publicationDate: pub.date,
          companyId: company.id
        }
      });
    }

    // 6. News
    await prisma.companyNews.deleteMany({ where: { companyId: company.id } });
    for (const news of info.news) {
      await prisma.companyNews.create({
        data: {
          title: news.title,
          source: news.source,
          date: news.date,
          companyId: company.id
        }
      });
    }

    // 7. Documents
    await prisma.companyDocument.deleteMany({ where: { companyId: company.id } });
    for (const doc of info.documents) {
      await prisma.companyDocument.create({
        data: {
          title: doc.title,
          type: doc.type,
          category: doc.category,
          companyId: company.id
        }
      });
    }

    console.log(`=> Successfully synced ${name} with full intelligence.`);
  }

  console.log("\nMega Sync Complete.");
}

run().catch(console.error).finally(() => prisma.$disconnect());
