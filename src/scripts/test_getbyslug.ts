import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function run() {
  const company = await prisma.company.findFirst();
  if (!company) {
    console.log("No companies found.");
    return;
  }

  console.log("Found company:", company.slug);

  try {
    const data = await prisma.company.findUnique({
      where: { slug: company.slug },
      include: {
        facilities: { where: { type: "HQ" } },
        _count: {
          select: {
            drugs: true,
            clinicalTrials: true,
            facilities: true,
            executives: true,
            publications: true,
            patents: true,
            news: true,
            documents: true,
            regulatoryActions: true,
            relationships: true
          }
        }
      }
    });
    console.log("SUCCESS:", !!data);
  } catch (e: any) {
    console.error("PRISMA ERROR:", e.message);
  }
}

run()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
