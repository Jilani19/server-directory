import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const amgen = await prisma.company.findFirst({ where: { name: "Amgen" } });
  console.log("Amgen Name:", amgen?.name);
  console.log("Amgen Ticker:", amgen?.ticker);
  console.log("Amgen Website:", amgen?.website);
  console.log("Amgen Official URL:", amgen?.officialUrl);
  console.log("Amgen Market Cap:", amgen?.marketCap);
}
run().catch(console.error);
