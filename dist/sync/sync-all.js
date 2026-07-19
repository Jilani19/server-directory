"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const sync_wikidata_1 = require("./sync-wikidata");
const sync_sec_1 = require("./sync-sec");
const sync_clinicaltrials_1 = require("./sync-clinicaltrials");
const sync_wikipedia_1 = require("./sync-wikipedia");
const sync_europepmc_1 = require("./sync-europepmc");
const sync_openfda_1 = require("./sync-openfda");
const sync_competitors_1 = require("./sync-competitors");
async function runAllSyncs() {
    console.log('================================================');
    console.log('       BACKGROUND DATA COLLECTION ENGINE       ');
    console.log('================================================');
    try {
        console.log('\n[0/7] Running Initial Aggregation (OpenFDA & Wikidata)...');
        require('child_process').execSync('tsx src/scripts/aggregate.ts', { stdio: 'inherit' });
        console.log('\n[1/7] Running Wikidata Sync...');
        await (0, sync_wikidata_1.syncWikidata)();
        console.log('\n[2/7] Running SEC Sync...');
        await (0, sync_sec_1.syncSec)();
        console.log('\n[3/7] Running Wikipedia Sync...');
        await (0, sync_wikipedia_1.syncWikipedia)();
        console.log('\n[4/7] Running Europe PMC Sync...');
        await (0, sync_europepmc_1.syncEuropePMC)();
        console.log('\n[5/7] Running OpenFDA Sync...');
        await (0, sync_openfda_1.syncOpenFDA)();
        console.log('\n[6/7] Running Clinical Trials Sync...');
        await (0, sync_clinicaltrials_1.syncClinicalTrials)();
        console.log('\n[7/7] Running Competitors Sync...');
        await (0, sync_competitors_1.syncCompetitors)();
        console.log('\n================================================');
        console.log('       ALL SYNCHRONIZERS COMPLETED             ');
        console.log('================================================');
    }
    catch (error) {
        console.error('Fatal error during full synchronization:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    runAllSyncs().then(() => process.exit(0)).catch(e => {
        console.error(e);
        process.exit(1);
    });
}
