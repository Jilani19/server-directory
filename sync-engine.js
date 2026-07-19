const { execSync } = require('child_process');

function runSync(scriptName) {
  console.log(`\n\nStarting ${scriptName}...`);
  try {
    execSync(`node ${scriptName}`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`${scriptName} failed.`);
  }
}

async function startEngine() {
  console.log("=== STARTING INTELLIGENCE ENGINE ===");
  runSync('sync-massive.js'); // Clinical Trials & FDA Products
  runSync('sync-publications.js'); // PubMed Publications
  runSync('sync-financials-leadership.js'); // Leadership, Facilities, Financials
  // runSync('sync-patents.js'); // PatentsView (Too slow/unreliable for massive run, skipping in automated loop)
  console.log("=== ENGINE FINISHED ===");
}

startEngine();
