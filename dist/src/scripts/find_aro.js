"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const c = await prisma.company.findUnique({ where: { slug: "aro-biotherapeutics" } });
    console.log("aro-biotherapeutics:", c);
}
main().finally(() => prisma.$disconnect());
