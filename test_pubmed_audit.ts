import { runPubMed } from "./src/workers/pubmed.worker";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testWorker() {
  const company = await prisma.company.findUnique({
    where: { slug: "aro-biotherapeutics" }
  });
  
  if (!company) {
    console.log("Company not found");
    return;
  }
  
  // Clean up any old traces for this job
  await prisma.companySyncHistory.deleteMany({
    where: { companyId: company.id, jobName: "publications" }
  });

  const inserted = await runPubMed(company, [company.name, company.name + " Inc", company.name + " LLC"]);
  console.log(`PubMed Worker Finished. Inserted: ${inserted}`);

  const history = await prisma.companySyncHistory.findFirst({
    where: { companyId: company.id, jobName: "publications" },
    orderBy: { startedAt: "desc" }
  });

  console.log("Trace stored:", history?.logs);
}

testWorker().then(() => prisma.$disconnect()).catch(console.error);
