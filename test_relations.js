const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Test each relation name individually
  const tests = [
    'clinicalTrials', 'pipelineAssets', 'contacts', 'products', 
    'executives', 'facilities', 'publications', 'patents', 
    'news', 'documents', 'regulatoryActions', 'relationships'
  ];
  
  for (const rel of tests) {
    try {
      const r = await p.company.findFirst({
        where: { slug: 'amgen-1784395795531' },
        include: { _count: { select: { [rel]: true } } }
      });
      console.log(`✅ ${rel}: ${r?._count?.[rel]}`);
    } catch(e) {
      console.log(`❌ ${rel}: ${e.message.slice(0, 100)}`);
    }
  }
}

main().finally(() => p.$disconnect());
