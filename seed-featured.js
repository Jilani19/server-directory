const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const featuredCompanies = [
  "AbbVie",
  "Pfizer",
  "Johnson & Johnson",
  "Merck",
  "Moderna",
  "Roche",
  "Novartis",
  "AstraZeneca",
  "Sanofi",
  "GSK",
  "Eli Lilly",
  "Amgen",
  "Bristol Myers Squibb",
  "Biogen",
  "Regeneron",
  "Vertex",
  "IQVIA",
  "Thermo Fisher Scientific",
  "Dr. Reddy's Laboratories",
  "Sun Pharma"
];

async function seedFeatured() {
  console.log("Seeding featured companies...");
  
  // First reset all to not featured
  await prisma.company.updateMany({
    where: { isFeatured: true },
    data: { isFeatured: false, displayPriority: 0 }
  });

  // Assign displayPriority such that index 0 gets highest priority
  let priority = featuredCompanies.length;

  for (const name of featuredCompanies) {
    const company = await prisma.company.findFirst({
      where: { name: { contains: name } }
    });

    if (company) {
      await prisma.company.update({
        where: { id: company.id },
        data: { 
          isFeatured: true,
          displayPriority: priority
        }
      });
      console.log(`Updated ${company.name} as featured.`);
    } else {
      console.log(`Company not found: ${name}`);
    }
    priority--;
  }

  console.log("Finished seeding featured companies.");
}

seedFeatured()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
