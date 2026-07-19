const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

const TARGET_COMPANIES = [
  "Dr. Reddy's", "Thermo Fisher Scientific"
];

const FDA_ALIASES = {
  "GSK": "GlaxoSmithKline",
  "Dr. Reddy's": "Dr. Reddy",
  "Eli Lilly": "Eli Lilly"
};

const HARDCODED_FALLBACKS = {
  "IQVIA": { drugs: 0, emp: "86,000" },
  "Thermo Fisher Scientific": { drugs: 0, emp: "122,000" },
  "Sanofi": { drugs: 0, emp: "91,000" },
  "GSK": { drugs: 0, emp: "70,000" },
  "Eli Lilly": { drugs: 0, emp: "39,000" },
  "Amgen": { drugs: 0, emp: "25,000" },
  "Dr. Reddy's": { drugs: 0, emp: "24,000" },
  "Sun Pharma": { drugs: 0, emp: "38,000" }
};

async function fetchAllFDA(companyName) {
  let allDrugs = [];
  try {
    const queryName = FDA_ALIASES[companyName] || companyName;
    const encoded = encodeURIComponent(`openfda.manufacturer_name:"${queryName}"`);
    let skip = 0;
    let limit = 1000;
    while (true) {
      const url = `https://api.fda.gov/drug/drugsfda.json?search=${encoded}&limit=${limit}&skip=${skip}`;
      const res = await axios.get(url).catch(e => null);
      if (!res || !res.data || !res.data.results || res.data.results.length === 0) break;
      const pageResults = res.data.results.map(r => ({
        name: r.products?.[0]?.brand_name || r.openfda?.brand_name?.[0] || 'Unknown',
        activeIngredient: r.products?.[0]?.active_ingredients?.[0]?.name || 'Unknown',
        status: r.openfda?.product_type?.[0] || 'PRESCRIPTION',
      })).filter(d => d.name !== 'Unknown');
      
      allDrugs = allDrugs.concat(pageResults);
      if (res.data.results.length < limit) break;
      skip += limit;
      if (skip >= 25000) break;
    }
  } catch (e) {
    console.error(`Error FDA: ${companyName}`, e.message);
  }
  const seen = new Set();
  return allDrugs.filter(d => {
    if (seen.has(d.name)) return false;
    seen.add(d.name);
    return true;
  });
}

async function fetchAllTrials(companyName) {
  let allTrials = [];
  try {
    const queryName = companyName === "GSK" ? "GlaxoSmithKline" : companyName;
    let pageToken = null;
    let count = 0;
    while (true) {
      let url = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(queryName)}&pageSize=1000`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      const res = await axios.get(url).catch(e => null);
      if (!res || !res.data || !res.data.studies || res.data.studies.length === 0) break;
      
      const pageResults = res.data.studies.map(s => ({
        nctId: s.protocolSection?.identificationModule?.nctId,
        title: s.protocolSection?.identificationModule?.briefTitle || 'Unknown Title',
        phase: s.protocolSection?.designModule?.phases?.[0] || 'Unknown Phase',
        status: s.protocolSection?.statusModule?.overallStatus || 'Unknown',
      })).filter(t => t.nctId);
      
      allTrials = allTrials.concat(pageResults);
      count += pageResults.length;
      console.log(`...fetched ${count} trials for ${companyName}`);
      
      pageToken = res.data.nextPageToken;
      if (!pageToken) break;
    }
  } catch (e) {}
  return allTrials;
}

async function run() {
  for (const name of TARGET_COMPANIES) {
    console.log(`\n============================`);
    console.log(`Sync Fast: ${name}`);
    let company = await prisma.company.findFirst({
      where: { name: { contains: name.replace("'", "") } }
    });
    
    if (!company) {
      console.log(`-> Not found in DB, creating ${name}.`);
      company = await prisma.company.create({
        data: {
          name: name,
          legalName: name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: `${name} is a global biopharma company.`,
          status: "ACTIVE",
          isFeatured: true,
          displayPriority: 10,
          user: { connect: { id: "system" } }
        }
      });
    }

    let fdaDrugs = await fetchAllFDA(name);
    if (fdaDrugs.length > 0) {
      await prisma.companyDrugRelation.deleteMany({ where: { companyId: company.id } });
      await prisma.drug.deleteMany({ where: { companyId: company.id } });
      for (let i = 0; i < fdaDrugs.length; i += 50) {
        const batch = fdaDrugs.slice(i, i + 50);
        await Promise.all(batch.map(async d => {
          const drug = await prisma.drug.create({
            data: {
              name: d.name.substring(0, 255),
              slug: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 100) + '-' + Math.random().toString(36).substr(2, 5),
              activeIngredient: d.activeIngredient.substring(0, 255),
              companyId: company.id,
              status: d.status.substring(0, 100)
            }
          });
          await prisma.companyDrugRelation.create({
            data: { companyId: company.id, drugId: drug.id, role: "DEVELOPS" }
          });
        }));
      }
    }

    let trials = await fetchAllTrials(name);
    const seenTrials = new Set();
    trials = trials.filter(t => {
      if (seenTrials.has(t.nctId)) return false;
      seenTrials.add(t.nctId);
      return true;
    });
    
    let activeCount = 0;
    if (trials.length > 0) {
      await prisma.companyTrialRelation.deleteMany({ where: { companyId: company.id } });
      for (let i = 0; i < trials.length; i += 100) {
        const batch = trials.slice(i, i + 100);
        batch.forEach(t => {
           const st = t.status.toUpperCase();
           if (st === 'RECRUITING' || st === 'ACTIVE_NOT_RECRUITING' || st === 'ENROLLING_BY_INVITATION') activeCount++;
        });
        const existing = await prisma.companyClinicalTrial.findMany({
          where: { nctId: { in: batch.map(t => t.nctId) } },
          select: { nctId: true }
        });
        const existingIds = new Set(existing.map(x => x.nctId));
        const toInsert = batch.filter(t => !existingIds.has(t.nctId));
        if (toInsert.length > 0) {
          await prisma.companyClinicalTrial.createMany({
             data: toInsert.map(t => ({
               nctId: t.nctId,
               title: t.title.substring(0, 255),
               phase: t.phase.substring(0, 50),
               status: t.status.substring(0, 50),
               companyId: company.id
             }))
          });
        }
      }
    }

    const employees = HARDCODED_FALLBACKS[name]?.emp || company.employees || "10,000+";
    await prisma.company.update({
      where: { id: company.id },
      data: {
        activeTrialsCount: activeCount,
        totalTrialsCount: trials.length > 0 ? trials.length : company.totalTrialsCount,
        employees: employees,
        lastSyncSuccess: new Date()
      }
    });
  }
}
run().then(() => process.exit(0));
