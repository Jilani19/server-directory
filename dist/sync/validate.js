"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function runValidation() {
    const targetCompanies = [
        'Pfizer',
        'Roche',
        'Novartis',
        'Merck',
        'Johnson & Johnson',
        'Dr. Reddy\'s',
        'Sun Pharma'
    ];
    console.log('\n================================================');
    console.log('       FINAL VALIDATION REPORT                 ');
    console.log('================================================\n');
    for (const name of targetCompanies) {
        const dbCompany = await prisma.company.findFirst({
            where: {
                OR: [
                    { name: { contains: name } },
                    { slug: { contains: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') } }
                ],
                isDeleted: false
            },
            include: {
                executives: true,
                subsidiaries: true,
                clinicalTrials: true,
                products: true,
                publications: true,
                patents: true,
                competitorsAsSource: true
            }
        });
        if (!dbCompany) {
            console.log(`[${name}] NOT FOUND in DB.`);
            continue;
        }
        console.log(`------------------------------------------------`);
        console.log(`Company: ${dbCompany.name} (ID: ${dbCompany.id})`);
        console.log(`Executives:   ${dbCompany.executives.length}`);
        console.log(`Subsidiaries: ${dbCompany.subsidiaries.length}`);
        console.log(`Products:     ${dbCompany.products.length}`);
        console.log(`Clinical:     ${dbCompany.clinicalTrials.length}`);
        console.log(`Research:     ${dbCompany.publications.length}`);
        console.log(`Patents:      ${dbCompany.patents.length}`);
        console.log(`Competitors:  ${dbCompany.competitorsAsSource.length}`);
        console.log(`Fields Set:`);
        console.log(` - Revenue: ${!!dbCompany.revenue}`);
        console.log(` - Employees: ${!!dbCompany.employees}`);
        console.log(` - HQ: ${!!dbCompany.hqAddress}`);
        console.log(` - Legal Name: ${!!dbCompany.legalName}`);
        console.log(` - Overview: ${!!dbCompany.businessOverview}`);
    }
    console.log('\n================================================\n');
}
runValidation().catch(console.error).finally(() => prisma.$disconnect());
