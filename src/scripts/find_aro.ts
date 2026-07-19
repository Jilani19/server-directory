import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const c = await prisma.company.findUnique({ where: { slug: "aro-biotherapeutics" } });
  console.log("aro-biotherapeutics:", c);
}
main().finally(() => prisma.$disconnect());
