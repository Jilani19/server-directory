"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const companies = [
    "Pfizer",
    "Roche",
    "Novartis",
    "Johnson & Johnson",
    "Merck",
    "AbbVie",
    "Thermo Fisher",
    "IQVIA",
    "Lonza",
    "Catalent",
    "Sun Pharma",
    "Dr. Reddy's",
    "Cipla",
    "Biocon",
    "Aurobindo",
    "Lupin",
    "Zydus"
];
async function seed() {
    let user = await prisma.user.findFirst();
    if (!user) {
        const role = await prisma.role.create({ data: { name: 'Admin' } });
        user = await prisma.user.create({
            data: { email: 'admin@cgxp.com', passwordHash: 'hash', roleId: role.id }
        });
    }
    for (const name of companies) {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // Check if company exists
        const existing = await prisma.company.findUnique({ where: { slug } });
        if (!existing) {
            await prisma.company.create({
                data: {
                    name,
                    slug,
                    userId: user.id
                }
            });
            console.log(`Created ${name}`);
        }
        else {
            console.log(`Skipped ${name}`);
        }
    }
}
seed().catch(e => console.error(e)).finally(() => prisma.$disconnect());
