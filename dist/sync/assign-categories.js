"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../config/prisma");
async function assignCategories() {
    const cat = await prisma_1.prisma.companyCategory.upsert({
        where: { slug: 'pharmaceuticals' },
        update: {},
        create: { name: 'Pharmaceuticals', slug: 'pharmaceuticals' }
    });
    const companies = await prisma_1.prisma.company.findMany();
    for (const c of companies) {
        await prisma_1.prisma.company.update({
            where: { id: c.id },
            data: {
                categories: { connect: { id: cat.id } }
            }
        });
    }
    console.log('Categories assigned.');
}
if (require.main === module) {
    assignCategories().then(() => process.exit(0));
}
