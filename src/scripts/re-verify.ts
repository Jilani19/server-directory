import { prisma } from "../config/prisma";
import { VerificationEngine } from "../services/verification.engine";

async function reVerifyAll() {
  console.log("Starting Re-Verification of all companies...");
  const engine = new VerificationEngine();
  
  // Get all currently verified or discovered companies
  const companies = await prisma.company.findMany({
    where: { status: { in: ["VERIFIED", "DISCOVERED"] } }
  });
  
  console.log(`Found ${companies.length} companies to re-verify.`);
  
  let verifiedCount = 0;
  let rejectedCount = 0;
  
  for (const company of companies) {
    // Reset status to DISCOVERED so engine processes it
    await prisma.company.update({
      where: { id: company.id },
      data: { status: "DISCOVERED" }
    });
    
    const updated = await engine.verify(company.id);
    if (updated.status === "VERIFIED") verifiedCount++;
    else rejectedCount++;
  }
  
  console.log(`Re-verification complete. VERIFIED: ${verifiedCount} | REJECTED: ${rejectedCount}`);
}

reVerifyAll().catch(console.error);
