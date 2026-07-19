"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discovery_engine_1 = require("../services/discovery.engine");
const verification_engine_1 = require("../services/verification.engine");
const prisma_1 = require("../config/prisma");
async function verifyAcceptance() {
    const discovery = new discovery_engine_1.DiscoveryEngine();
    const verification = new verification_engine_1.VerificationEngine();
    // Seed test companies to prove logic
    await discovery.discover("Attitude Cosmetics", "Official Company Websites");
    await discovery.discover("Pfizer Inc", "SEC EDGAR");
    await discovery.discover("Military Army Supplies", "Wikidata");
    await discovery.discover("Food trading Co", "Wikipedia");
    // Fetch and verify all
    const discovered = await prisma_1.prisma.company.findMany({ where: { status: "DISCOVERED" } });
    for (const c of discovered) {
        await verification.verify(c.id);
    }
    console.log("\n==========================================================");
    console.log("ACCEPTANCE CRITERIA VERIFICATION");
    const searchFood = await prisma_1.prisma.company.count({ where: { name: { contains: "FOOD" }, status: "VERIFIED" } });
    console.log(`Search FOOD returns ${searchFood}`);
    const searchAttitude = await prisma_1.prisma.company.count({ where: { name: { contains: "ATTITUDE" }, status: "VERIFIED" } });
    console.log(`Search ATTITUDE returns ${searchAttitude}`);
    const searchMilitary = await prisma_1.prisma.company.count({ where: { name: { contains: "MILITARY" }, status: "VERIFIED" } });
    console.log(`Search MILITARY returns ${searchMilitary}`);
    const searchCosmetics = await prisma_1.prisma.company.count({ where: { name: { contains: "COSMETICS" }, status: "VERIFIED" } });
    console.log(`Search COSMETICS returns ${searchCosmetics}`);
    const searchPfizer = await prisma_1.prisma.company.count({ where: { name: { contains: "PFIZER" }, status: "VERIFIED" } });
    console.log(`Search PFIZER returns ${searchPfizer}`);
    console.log("==========================================================\n");
}
verifyAcceptance().catch(console.error).finally(() => prisma_1.prisma.$disconnect());
