"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function run() {
    const companies = await prisma.company.findMany({
        include: { _count: { select: { products: true, clinicalTrials: true } } },
        orderBy: { clinicalTrials: { _count: 'desc' } },
        take: 6
    });
    console.log("==================================================");
    console.log("🧬 FINAL ARCHITECTURE KPI VERIFICATION");
    console.log("==================================================");
    for (const c of companies) {
        console.log(`[${c.name}] (${c.slug})`);
        console.log(`  - Products Count      : ${c._count.products}`);
        console.log(`  - Clinical Trials     : ${c._count.clinicalTrials}`);
        console.log("--------------------------------------------------");
    }
}
run().then(() => prisma.$disconnect()).catch(console.error);
