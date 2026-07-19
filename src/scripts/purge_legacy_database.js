const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function purgeDatabase() {
  console.log('Initiating Full Legacy Database Purge...');
  
  // Disable foreign key constraints during purge
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');

  // Delete all rows from core tables
  const deletes = [
    prisma.auditLog.deleteMany(),
    prisma.companyRelationship.deleteMany(),
    prisma.publication.deleteMany(),
    prisma.warningLetter.deleteMany(),
    prisma.patent.deleteMany(),
    prisma.clinicalTrial.deleteMany(),
    prisma.drug.deleteMany(),
    prisma.financial.deleteMany(),
    prisma.facility.deleteMany(),
    prisma.provenance.deleteMany(),
    prisma.company.deleteMany()
  ];

  await prisma.$transaction(deletes);

  // Re-enable foreign key constraints
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');

  console.log('Legacy Data Purged.');

  // Verify
  const count = await prisma.company.count();
  if (count !== 0) {
    throw new Error('Database purge failed, count is ' + count);
  }

  const report = `# DATABASE CLEANUP REPORT\\n\\n## Result\\n- **Action**: Full Table Purge\\n- **Target**: Legacy Synthetic Entities, Dummy Articles, Mock Stats\\n- **Status**: SUCCESS\\n- **Remaining Companies**: ${count}\\n\\nThe database is now fully sanitized and ready for the 100-company Hydration Phase.`;
  
  const outPath = path.join("C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751", "DATABASE_CLEANUP_REPORT.md");
  fs.writeFileSync(outPath, report.replace(/\\n/g, '\n'));

  console.log('DATABASE_CLEANUP_REPORT.md generated.');
}

purgeDatabase()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
