"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const count = await prisma.company.count();
    console.log("Total Companies:", count);
}
main().finally(() => prisma.$disconnect());
