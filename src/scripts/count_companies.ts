import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.company.count();
  console.log("Total Companies:", count);
}
main().finally(() => prisma.$disconnect());
