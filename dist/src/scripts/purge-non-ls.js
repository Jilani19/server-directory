"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../config/prisma");
const verification_engine_1 = require("../services/verification.engine");
async function purge() {
    console.log("Starting massive DB cleanup for non-Life Sciences companies...");
    const engine = new verification_engine_1.VerificationEngine();
    // 1. Reset the artificial 'industry' field that the SEC worker injected.
    // We want to force the engine to verify based purely on the company NAME or explicit whitelist.
    await prisma_1.prisma.company.updateMany({
        data: { industry: null }
    });
    console.log("Cleared artificial industry fields.");
    // 2. Fetch all companies
    const companies = await prisma_1.prisma.company.findMany();
    console.log(`Found ${companies.length} total companies to evaluate.`);
    let lifeSciencesCount = 0;
    let rejectedCount = 0;
    for (const company of companies) {
        // Force status to DISCOVERED
        await prisma_1.prisma.company.update({
            where: { id: company.id },
            data: { status: "DISCOVERED" }
        });
        // Re-verify strictly
        const updated = await engine.verify(company.id);
        if (updated.status === "VERIFIED") {
            lifeSciencesCount++;
        }
        else {
            rejectedCount++;
        }
    }
    console.log(`Strict Verification Complete. Authentic Life Sciences: ${lifeSciencesCount} | Junk: ${rejectedCount}`);
    // 3. Hard delete all REJECTED companies to clean the database completely
    console.log("Deleting all REJECTED companies from the database...");
    const deleted = await prisma_1.prisma.company.deleteMany({
        where: { status: "REJECTED" }
    });
    console.log(`Successfully purged ${deleted.count} non-life-sciences companies from the database.`);
}
purge().catch(console.error);
