import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  console.log("Running Database Repair Script...");

  const allCompanies = await prisma.company.findMany();
  let wipedCount = 0;

  for (const c of allCompanies) {
    let isContaminated = false;

    // We check if officialUrl has JNJ, MRNA, PFE but name does not match
    if (c.officialUrl) {
      if (c.officialUrl.includes("JNJ") && !c.name.toLowerCase().includes("johnson")) isContaminated = true;
      if (c.officialUrl.includes("PFE") && !c.name.toLowerCase().includes("pfizer")) isContaminated = true;
      if (c.officialUrl.includes("MRNA") && !c.name.toLowerCase().includes("moderna")) isContaminated = true;
    }

    if (isContaminated) {
      console.log(`Wiping contaminated records for: ${c.name}`);
      wipedCount++;

      // Delete contaminated relationships
      await prisma.companyTimeline.deleteMany({ where: { companyId: c.id } });
      await prisma.companyNews.deleteMany({ where: { companyId: c.id } });
      await prisma.companyExecutive.deleteMany({ where: { companyId: c.id } });

      // Reset company scalar fields
      await prisma.company.update({
        where: { id: c.id },
        data: {
          officialUrl: null,
          marketCap: null,
          currency: "USD",
          businessOverview: null,
          ticker: null,
          website: null,
          lastSyncSuccess: null
        }
      });
    }
  }

  console.log(`Successfully repaired ${wipedCount} contaminated companies.`);
}

run().catch(console.error);
