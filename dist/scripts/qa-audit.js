"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../config/prisma");
async function runAudit() {
    const targetCompanies = [
        'Pfizer', 'AbbVie', 'Novartis', 'Johnson & Johnson',
        'Merck', 'Roche', 'Sanofi', 'Takeda', 'IQVIA',
        'Cipla', 'Sun Pharma', "Dr. Reddy's", 'Lupin', 'Biocon', 'Zydus'
    ];
    console.log("== DATA COMPLETENESS AUDIT ==\n");
    for (const name of targetCompanies) {
        // fuzzy match name
        const company = await prisma_1.prisma.company.findFirst({
            where: { name: { contains: name } },
            include: {
                _count: {
                    select: {
                        executives: true,
                        products: true,
                        clinicalTrials: true,
                        facilities: true,
                        patents: true,
                        news: true,
                        documents: true
                    }
                }
            }
        });
        if (!company) {
            console.log(`[!] ${name} NOT FOUND in DB.`);
            continue;
        }
        // Calculate completeness
        let points = 0;
        const maxPoints = 11;
        const corp = !!(company.foundedYear && company.hqAddress && company.employees);
        if (corp)
            points++;
        const leadership = company._count.executives > 0;
        if (leadership)
            points++;
        const financial = !!(company.revenue || company.marketCap);
        if (financial)
            points++;
        const products = company._count.products > 0;
        if (products)
            points++;
        const clinical = company._count.clinicalTrials > 0;
        if (clinical)
            points++;
        const research = !!company.researchFocus;
        if (research)
            points++;
        const facilities = company._count.facilities > 0;
        if (facilities)
            points++;
        const regulatory = company._count.patents > 0;
        if (regulatory)
            points++;
        const news = company._count.news > 0;
        if (news)
            points++;
        const documents = company._count.documents > 0;
        if (documents)
            points++;
        const contacts = !!(company.website || company.phone || company.email);
        if (contacts)
            points++;
        console.log(`${company.name} (${company.slug}):`);
        console.log(` - Completeness: ${Math.round((points / maxPoints) * 100)}%`);
        console.log(` - Details: Corp: ${corp}, Lead: ${leadership}, Fin: ${financial}, Prod: ${products}, Clin: ${clinical}, Res: ${research}, Fac: ${facilities}, Reg: ${regulatory}, News: ${news}, Doc: ${documents}, Cont: ${contacts}`);
    }
}
runAudit().catch(console.error).finally(() => process.exit(0));
