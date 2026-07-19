"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function run() {
    const companies = await prisma.company.findMany({
        include: { products: true, _count: { select: { products: true } } },
        orderBy: { products: { _count: 'desc' } },
        take: 5
    });
    for (const c of companies) {
        console.log(`${c.name} Products Count: ${c._count?.products}`);
        console.log(`First 3:`, c.products.slice(0, 3).map(p => p.name));
        console.log('---');
    }
}
run().then(() => prisma.$disconnect()).catch(console.error);
