import { prisma } from './src/config/prisma';

async function checkCompany(slug: string) {
  const company = await prisma.company.findUnique({ where: { slug } });
  console.log('=== Company lookup ===');
  console.log('Slug:', slug);
  console.log('Result:', company);
  await prisma.$disconnect();
}

checkCompany('amgen-1784395795531').catch(e => {
  console.error('Error:', e);
  process.exit(1);
});
