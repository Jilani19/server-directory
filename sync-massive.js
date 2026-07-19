const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

const TARGET_COMPANIES = [
  "AbbVie", "Pfizer", "Merck", "Novartis", "Roche", "Johnson & Johnson"
];

async function fetchAllFDA(companyName) {
  let allDrugs = [];
  try {
    const encoded = encodeURIComponent(`openfda.manufacturer_name:"${companyName}"`);
    // FDA API limit is max 1000 per request
    let skip = 0;
    let limit = 1000;
    while (true) {
      const url = `https://api.fda.gov/drug/drugsfda.json?search=${encoded}&limit=${limit}&skip=${skip}`;
      const res = await axios.get(url).catch(e => null);
      if (!res || !res.data || !res.data.results || res.data.results.length === 0) {
        break; // No more data
      }
      const pageResults = res.data.results.map(r => ({
        name: r.products?.[0]?.brand_name || r.openfda?.brand_name?.[0] || 'Unknown',
        activeIngredient: r.products?.[0]?.active_ingredients?.[0]?.name || 'Unknown',
        status: r.openfda?.product_type?.[0] || 'PRESCRIPTION',
      })).filter(d => d.name !== 'Unknown');
      
      allDrugs = allDrugs.concat(pageResults);
      if (res.data.results.length < limit) break; // Last page
      skip += limit;
      if (skip >= 25000) break; // FDA hard limit
    }
  } catch (e) {
    console.error(`Error fetching FDA for ${companyName}:`, e.message);
  }
  // Deduplicate by name
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
    let pageToken = null;
    let count = 0;
    while (true) {
      let url = `https://clinicaltrials.gov/api/v2/studies?query.term=${encodeURIComponent(companyName)}&pageSize=1000`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      
      const res = await axios.get(url).catch(e => null);
      if (!res || !res.data || !res.data.studies || res.data.studies.length === 0) {
        break;
      }
      
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
  } catch (e) {
    console.error(`Error fetching Trials for ${companyName}:`, e.message);
  }
  return allTrials;
}

async function syncMassive() {
  for (const name of TARGET_COMPANIES) {
    console.log(`\n============================`);
    console.log(`Massive Syncing: ${name}`);
    
    const company = await prisma.company.findFirst({
      where: { name: { contains: name } }
    });

    if (!company) {
      console.log(`-> Not found in DB, skipping.`);
      continue;
    }

    // Clear old relations to prevent stale counts and dupes
    await prisma.companyDrugRelation.deleteMany({ where: { companyId: company.id } });
    await prisma.companyTrialRelation.deleteMany({ where: { companyId: company.id } });

    // 1. FDA Drugs
    console.log(`-> Fetching ALL FDA Drugs...`);
    const fdaDrugs = await fetchAllFDA(name);
    console.log(`   Found ${fdaDrugs.length} unique drugs.`);

    // Batched Drug inserts
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

    // 2. Clinical Trials
    console.log(`-> Fetching ALL Clinical Trials...`);
    let trials = await fetchAllTrials(name);
    
    // Deduplicate trials by nctId
    const seenTrials = new Set();
    trials = trials.filter(t => {
      if (seenTrials.has(t.nctId)) return false;
      seenTrials.add(t.nctId);
      return true;
    });
    
    console.log(`   Found ${trials.length} unique trials.`);

    let activeCount = 0, totalCount = 0, completedCount = 0, registeredCount = trials.length, withdrawnCount = 0, recruitingCount = 0;
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;

    // Batched Trial inserts
    for (let i = 0; i < trials.length; i += 100) {
      const batch = trials.slice(i, i + 100);
      
      batch.forEach(t => {
         const st = t.status.toUpperCase();
         const ph = t.phase.toUpperCase();
         
         if (st === 'RECRUITING') recruitingCount++;
         if (st === 'COMPLETED') completedCount++;
         if (st === 'WITHDRAWN') withdrawnCount++;
         if (st === 'RECRUITING' || st === 'ACTIVE_NOT_RECRUITING' || st === 'ENROLLING_BY_INVITATION') activeCount++;
         
         if (ph.includes('PHASE1') || ph.includes('EARLY_PHASE1')) p1++;
         if (ph.includes('PHASE2')) p2++;
         if (ph.includes('PHASE3')) p3++;
         if (ph.includes('PHASE4')) p4++;
      });
      
      await Promise.all(batch.map(async t => {
        const globalTrial = await prisma.globalClinicalTrial.upsert({
          where: { nctId: t.nctId },
          update: { title: t.title.substring(0, 255), phase: t.phase.substring(0, 50), status: t.status.substring(0, 50) },
          create: { nctId: t.nctId, title: t.title.substring(0, 255), phase: t.phase.substring(0, 50), status: t.status.substring(0, 50) }
        });

        await prisma.companyTrialRelation.create({
           data: { companyId: company.id, trialId: globalTrial.id, role: "SPONSORS" }
        });
      }));
    }

    // Update Company with all counts
    await prisma.company.update({
      where: { id: company.id },
      data: {
        activeTrialsCount: activeCount,
        totalTrialsCount: registeredCount,
        completedTrialsCount: completedCount,
        registeredTrialsCount: registeredCount,
        withdrawnTrialsCount: withdrawnCount,
        recruitingTrialsCount: recruitingCount,
        phase1TrialsCount: p1,
        phase2TrialsCount: p2,
        phase3TrialsCount: p3,
        phase4TrialsCount: p4,
      }
    });

    console.log(`-> Completed massive sync for ${name}. Active: ${activeCount}`);
  }
}

syncMassive().then(() => {
  console.log("All massive syncs finished.");
  process.exit(0);
}).catch(console.error);
