const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const prisma = new PrismaClient();

async function run() {
  const amgen = await prisma.company.findFirst({ where: { name: "Amgen" } });
  if (!amgen) {
    console.log("Amgen not found.");
    return;
  }
  
  const allCompanies = await prisma.company.findMany();
  let contaminated = [];
  
  for (const c of allCompanies) {
    if (c.website && c.website.toLowerCase().includes("pfizer.com") && !c.name.toLowerCase().includes("pfizer")) {
      contaminated.push({ name: c.name, website: c.website, ticker: c.ticker });
    }
    if (c.ticker && c.ticker.includes("PFE") && !c.name.toLowerCase().includes("pfizer")) {
      contaminated.push({ name: c.name, website: c.website, ticker: c.ticker });
    }
  }

  console.log("Contaminated with Pfizer data:", contaminated);
  
  // Let's also check for JNJ
  let contaminatedJnj = [];
  for (const c of allCompanies) {
    if (c.officialUrl && c.officialUrl.includes("JNJ") && !c.name.toLowerCase().includes("johnson")) {
      contaminatedJnj.push({ name: c.name, officialUrl: c.officialUrl, ticker: c.ticker });
    }
  }
  console.log("Contaminated with JNJ data:", contaminatedJnj);
}
run().catch(console.error);
