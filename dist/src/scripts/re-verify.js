"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../config/prisma");
const verification_engine_1 = require("../services/verification.engine");
async function reVerifyAll() {
    console.log("Starting Re-Verification of all companies...");
    const engine = new verification_engine_1.VerificationEngine();
    // Get all currently verified or discovered companies
    const companies = await prisma_1.prisma.company.findMany({
        where: { status: { in: ["VERIFIED", "DISCOVERED"] } }
    });
    console.log(`Found ${companies.length} companies to re-verify.`);
    let verifiedCount = 0;
    let rejectedCount = 0;
    for (const company of companies) {
        // Reset status to DISCOVERED so engine processes it
        await prisma_1.prisma.company.update({
            where: { id: company.id },
            data: { status: "DISCOVERED" }
        });
        const updated = await engine.verify(company.id);
        if (updated.status === "VERIFIED")
            verifiedCount++;
        else
            rejectedCount++;
    }
    console.log(`Re-verification complete. VERIFIED: ${verifiedCount} | REJECTED: ${rejectedCount}`);
}
reVerifyAll().catch(console.error);
