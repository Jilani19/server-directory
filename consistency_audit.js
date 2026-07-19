/**
 * CONSISTENCY AUDIT
 * Verifies every metric shown on the Company Profile against the real DB count.
 * Slug: amgen-1784395795531
 */
const { PrismaClient } = require('@prisma/client');
const http = require('http');
const prisma = new PrismaClient();
const SLUG = 'amgen-1784395795531';

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch(e) { resolve({ _error: d.slice(0, 200) }); }
      });
    }).on('error', reject);
  });
}

async function main() {
  // ── DB counts ──────────────────────────────────────────────────────────────
  const company = await prisma.company.findUnique({
    where: { slug: SLUG },
    include: {
      facilities: true,
      executives: true,
      _count: {
        select: {
          drugRelations: true, trialRelations: true, products: true,
          facilities: true, executives: true, publications: true,
          patents: true, news: true, documents: true,
          regulatoryActions: true, relationships: true
        }
      }
    }
  });

  const db = {
    products:      await prisma.product.count({ where: { companyId: company.id } }),
    clinicalTrials:await prisma.companyClinicalTrial.count({ where: { companyId: company.id } }),
    pipeline:      await prisma.companyPipelineAsset.count({ where: { companyId: company.id } }),
    leadership:    await prisma.companyExecutive.count({ where: { companyId: company.id } }),
    facilities:    await prisma.companyFacility.count({ where: { companyId: company.id } }),
    publications:  await prisma.companyPublication.count({ where: { companyId: company.id } }),
    patents:       await prisma.companyPatent.count({ where: { companyId: company.id } }),
    news:          await prisma.companyNews.count({ where: { companyId: company.id } }),
    documents:     await prisma.companyDocument.count({ where: { companyId: company.id } }),
    regulatory:    await prisma.companyRegulatoryAction.count({ where: { companyId: company.id } }),
    relationships: await prisma.companyRelationship.count({ where: { companyId: company.id } }),
    contacts:      await prisma.companyContact.count({ where: { companyId: company.id } }),
    revenue:       company.revenue,
    employees:     company.employees,
    countries:     new Set(company.facilities.map(f => f.country).filter(Boolean)).size,
  };

  // ── API counts from /companies/:slug ──────────────────────────────────────
  const apiSlug = await get(`http://localhost:5000/api/v1/companies/${SLUG}`);
  const apiCo   = apiSlug?.data || {};
  const apiCount = apiCo._count || {};

  // ── Header/layout metrics (what layout.tsx renders) ──────────────────────
  const layoutMetrics = {
    revenue:       company.revenue,
    employees:     company.employees
                     ? `${Math.round(+company.employees/1000)}k+`
                     : '"83,000+" (HARDCODED)',
    countries:     new Set((apiCo.facilities||[]).map(f=>f.country).filter(Boolean)).size
                     || '"125+" (HARDCODED)',
    clinicalTrials:apiCo.totalTrialsCount || apiCo.clinicalTrials?.length
                     || '"1,245+" (HARDCODED)',
    products:      apiCo.drugs?.length || '"450+" (HARDCODED)',
  };

  // ── Sidebar _count keys ───────────────────────────────────────────────────
  const sidebarCounts = {
    drugs:           apiCount.drugRelations,   // sidebar badge key "drugs"
    clinicalTrials:  apiCount.trialRelations,  // sidebar badge key "clinicalTrials"
    executives:      apiCount.executives,
    facilities:      apiCount.facilities,
    publications:    apiCount.publications,
    patents:         apiCount.patents,
    regulatoryActions: apiCount.regulatoryActions,
    documents:       apiCount.documents,
    news:            apiCount.news,
    relationships:   apiCount.relationships,
  };

  // ── Print audit ───────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║           CONSISTENCY AUDIT — ' + SLUG);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  const rows = [
    ['METRIC',          'DB (source-of-truth)', 'API _count', 'Layout/Header',      'MATCH?'],
    ['─'.repeat(20),    '─'.repeat(22),          '─'.repeat(12), '─'.repeat(22),    '─'.repeat(8)],
    ['Revenue',         String(db.revenue),       '—',            String(layoutMetrics.revenue), db.revenue == apiCo.revenue ? '✅' : '❌'],
    ['Employees',       String(db.employees),     '—',            String(layoutMetrics.employees), String(db.employees) === String(apiCo.employees) ? '✅' : '❌'],
    ['Countries (fac)', String(db.countries),     String(apiCo.facilities?.length||0)+' fac', String(layoutMetrics.countries), '⚠️ needs check'],
    ['ClinTrials(total)',String(db.clinicalTrials),String(apiCount.trialRelations),  String(layoutMetrics.clinicalTrials), db.clinicalTrials === apiCount.trialRelations ? '⚠️' : '❌'],
    ['Products',        String(db.products),      String(apiCount.products),         String(layoutMetrics.products),      db.products === apiCount.products ? '⚠️ header wrong' : '❌'],
    ['Pipeline',        String(db.pipeline),      '—',            'no header',       db.pipeline === 0 ? '⚠️ empty' : '✅'],
    ['Leadership',      String(db.leadership),    String(apiCount.executives),       'no header',       db.leadership === apiCount.executives ? '✅' : '❌'],
    ['Facilities',      String(db.facilities),    String(apiCount.facilities),       'no header',       db.facilities === apiCount.facilities ? '✅' : '❌'],
    ['Publications',    String(db.publications),  String(apiCount.publications),     'no header',       db.publications === apiCount.publications ? '✅' : '❌'],
    ['Patents',         String(db.patents),        String(apiCount.patents),          'no header',       db.patents === apiCount.patents ? '✅' : '❌'],
    ['News',            String(db.news),           String(apiCount.news),             'no header',       db.news === apiCount.news ? '✅' : '❌'],
    ['Documents',       String(db.documents),      String(apiCount.documents),        'no header',       db.documents === apiCount.documents ? '✅' : '❌'],
    ['Regulatory',      String(db.regulatory),     String(apiCount.regulatoryActions),'no header',      db.regulatory === apiCount.regulatoryActions ? '✅' : '❌'],
    ['Relationships',   String(db.relationships),  String(apiCount.relationships),    'no header',       db.relationships === apiCount.relationships ? '✅' : '❌'],
    ['Contacts',        String(db.contacts),       '—',            'no header',       db.contacts === 0 ? '⚠️ empty' : '✅'],
  ];

  for (const r of rows) {
    console.log(
      r[0].padEnd(20) + r[1].padEnd(24) + r[2].padEnd(14) + r[3].padEnd(24) + r[4]
    );
  }

  console.log('\n─── SIDEBAR BADGE KEY AUDIT ────────────────────────────────\n');
  console.log('Sidebar key "drugs"          → _count.drugRelations =', apiCount.drugRelations, '  (but DB products =', db.products, ')');
  console.log('Sidebar key "clinicalTrials" → _count.trialRelations =', apiCount.trialRelations, '  (but DB trials =', db.clinicalTrials, ')');
  console.log('Sidebar key "executives"     → _count.executives =', apiCount.executives, '  DB =', db.leadership);
  console.log('Sidebar key "facilities"     → _count.facilities =', apiCount.facilities, '  DB =', db.facilities);
  console.log('Sidebar key "publications"   → _count.publications =', apiCount.publications, '  DB =', db.publications);
  console.log('Sidebar key "patents"        → _count.patents =', apiCount.patents, '  DB =', db.patents);
  console.log('Sidebar key "regulatoryActions" → _count.regulatoryActions =', apiCount.regulatoryActions, '  DB =', db.regulatory);
  console.log('Sidebar key "documents"      → _count.documents =', apiCount.documents, '  DB =', db.documents);
  console.log('Sidebar key "news"           → _count.news =', apiCount.news, '  DB =', db.news);
  console.log('Sidebar key "relationships"  → _count.relationships =', apiCount.relationships, '  DB =', db.relationships);

  console.log('\n─── LAYOUT.TSX HARDCODED FALLBACKS ────────────────────────\n');
  console.log('Line 51: company.revenue || "$58.5B"  ← DB revenue =', company.revenue);
  console.log('Line 58: employees/1000 + "k+" || "83,000+"  ← DB employees =', company.employees);
  console.log('Line 65: facilities.country Set || "125+"  ← DB facilities =', db.facilities, ' countries =', db.countries);
  console.log('Line 72: totalTrialsCount || length || "1,245+"  ← DB trials =', db.clinicalTrials, ' totalTrialsCount =', company.totalTrialsCount);
  console.log('Line 79: drugs.length || "450+"  ← company.drugs is undefined in /companies/:slug response, DB products =', db.products);

  console.log('\n─── OVERVIEW AI SUMMARY INCONSISTENCY ──────────────────────\n');
  console.log('Line 55: company._count.products =', apiCount.products, '(drugRelation count, not product table)');
  console.log('Line 55: company._count.trialRelations =', apiCount.trialRelations, '(relation table, not companyClinicalTrial)');

  console.log('\n─── COMPLETENESS SCORE (Overview sidebar) ──────────────────\n');
  console.log('Uses: executives.length, facilities.length, _count.products, _count.trialRelations, _count.patents, _count.publications, _count.news, _count.documents, revenue');
  console.log('_count.products (drugRelations):', apiCount.drugRelations, '  real products:', db.products);
  console.log('_count.trialRelations:', apiCount.trialRelations, '  real trials:', db.clinicalTrials);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); }).finally(() => prisma.$disconnect());
