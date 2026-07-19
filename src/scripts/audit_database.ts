import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const prisma = new PrismaClient();

async function run() {
  const companies = await prisma.company.findMany();
  let contaminatedCount = 0;
  let report = `# 🛡️ IDENTITY AUDIT REPORT (Contamination)\n\n`;

  for (const comp of companies) {
    let isContaminated = false;
    let issues = [];

    // Check if the officialUrl (set by company-enrichment) mismatches the company name
    if (comp.officialUrl) {
      if (comp.officialUrl.includes("JNJ") && !comp.name.toLowerCase().includes("johnson")) {
        isContaminated = true;
        issues.push("Has JNJ Yahoo Finance URL");
      }
      if (comp.officialUrl.includes("PFE") && !comp.name.toLowerCase().includes("pfizer")) {
        isContaminated = true;
        issues.push("Has PFE Yahoo Finance URL");
      }
      if (comp.officialUrl.includes("MRNA") && !comp.name.toLowerCase().includes("moderna")) {
        isContaminated = true;
        issues.push("Has MRNA Yahoo Finance URL");
      }
    }

    if (isContaminated) {
      contaminatedCount++;
      report += `### ${comp.name}\n`;
      report += `- **Issues**: ${issues.join(", ")}\n`;
      report += `- **Official URL**: ${comp.officialUrl}\n\n`;
    }
  }

  report = `**Total Contaminated Companies:** ${contaminatedCount}\n\n` + report;
  fs.writeFileSync("CONTAMINATED_REPORT.md", report);
  console.log(`Found ${contaminatedCount} contaminated companies. Report generated.`);
}

run().catch(console.error);
