import { runOpenFDA } from "./src/workers/openfda.worker";
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
  
  await prisma.companySyncHistory.deleteMany({
    where: { companyId: company.id, jobName: "products" }
  });

  const inserted = await runOpenFDA(company, [company.name, company.name + " Inc", company.name + " LLC"]);
  console.log(`OpenFDA Worker Finished. Inserted: ${inserted}`);

  const history = await prisma.companySyncHistory.findFirst({
    where: { companyId: company.id, jobName: "products" },
    orderBy: { startedAt: "desc" }
  });

  console.log("Trace stored:", history?.logs);
}

testWorker().then(() => prisma.$disconnect()).catch(console.error);
