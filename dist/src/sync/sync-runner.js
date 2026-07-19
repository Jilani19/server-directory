"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../config/prisma");
const clinical_trials_1 = require("./connectors/clinical-trials");
const yahoo_finance_1 = require("./connectors/yahoo-finance");
const queue_1 = require("./engine/queue");
async function run() {
    console.log("🚀 Starting Master Background Sync Engine...");
    const ctConnector = new clinical_trials_1.ClinicalTrialsConnector();
    const yfConnector = new yahoo_finance_1.YahooFinanceConnector();
    const syncRun = await (0, queue_1.createSyncRun)("Master_Sync");
    console.log(`✅ Created Master Sync Run: ${syncRun.id}`);
    // Fetch top 10 companies to sync
    const companies = await prisma_1.prisma.company.findMany({ take: 10, select: { id: true, name: true } });
    for (const company of companies) {
        console.log(`\n⏳ Syncing ${company.name}...`);
        // Yahoo Finance Sync
        const yfJob = await (0, queue_1.createSyncJob)(syncRun.id, "Company", company.id);
        await (0, queue_1.logSync)(yfJob.id, "INFO", `Extracting Yahoo Finance data for ${company.name}`);
        const yfResponse = await yfConnector.execute(company.id);
        if (yfResponse.success) {
            await (0, queue_1.logSync)(yfJob.id, "INFO", `Successfully extracted Financials. Ticker: ${yfResponse.payload?.ticker}`);
            await prisma_1.prisma.syncJob.update({ where: { id: yfJob.id }, data: { status: "SUCCESS", completedAt: new Date() } });
        }
        else {
            await (0, queue_1.logSync)(yfJob.id, "ERROR", `Failed Yahoo Finance: ${yfResponse.message}`);
            await prisma_1.prisma.syncJob.update({ where: { id: yfJob.id }, data: { status: "ERROR", completedAt: new Date() } });
        }
        // Clinical Trials Sync
        const ctJob = await (0, queue_1.createSyncJob)(syncRun.id, "Company", company.id);
        await (0, queue_1.logSync)(ctJob.id, "INFO", `Extracting ARES Clinical Trials for ${company.name}`);
        const ctResponse = await ctConnector.execute(company.id);
        if (ctResponse.success) {
            await (0, queue_1.logSync)(ctJob.id, "INFO", `Successfully extracted Trial: ${ctResponse.payload?.nctId}`);
            await prisma_1.prisma.syncJob.update({ where: { id: ctJob.id }, data: { status: "SUCCESS", completedAt: new Date() } });
        }
        else {
            await (0, queue_1.logSync)(ctJob.id, "ERROR", `Failed Clinical Trials: ${ctResponse.message}`);
            await prisma_1.prisma.syncJob.update({ where: { id: ctJob.id }, data: { status: "ERROR", completedAt: new Date() } });
        }
    }
    await prisma_1.prisma.syncRun.update({
        where: { id: syncRun.id },
        data: { status: "COMPLETED", completedAt: new Date() }
    });
    console.log("\n🏁 Master Background Sync Engine Run Completed!");
}
run().catch(console.error).finally(() => prisma_1.prisma.$disconnect());
