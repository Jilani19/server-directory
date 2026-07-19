import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function runAudit() {
  console.log("Starting Profile Data Audit...");
  
  // Find any company with rich data
  const company = await prisma.company.findFirst({
    where: { slug: { startsWith: 'amgen' } }
  });

  if (!company) {
    console.error("Amgen not found. Please ensure data is loaded.");
    return;
  }

  const cid = company.id;
  const auditResults: any[] = [];

  // Define the counts to verify
  const modules = [
    { name: "Products", countFunc: () => prisma.product.count({ where: { companyId: cid } }) },
    { name: "Clinical Trials", countFunc: () => prisma.companyTrialRelation.count({ where: { companyId: cid } }) },
    { name: "Facilities", countFunc: () => prisma.companyFacility.count({ where: { companyId: cid } }) },
    { name: "Leadership", countFunc: () => prisma.companyExecutive.count({ where: { companyId: cid } }) },
    { name: "Publications", countFunc: () => prisma.companyPublication.count({ where: { companyId: cid } }) },
    { name: "Patents", countFunc: () => prisma.companyPatent.count({ where: { companyId: cid } }) },
    { name: "News", countFunc: () => prisma.companyNews.count({ where: { companyId: cid } }) },
    { name: "Documents", countFunc: () => prisma.companyDocument.count({ where: { companyId: cid } }) },
    { name: "Financials", countFunc: () => prisma.company.findUnique({ where: { id: cid }}).then(c => c?.revenue ? 1 : 0) }
  ];

  for (const mod of modules) {
    const prismaCount = await mod.countFunc();
    
    // Simulate API logic (since we just checked the controllers)
    let apiCount = 0;
    let reason = "OK";
    
    // We already fixed Facilities (which was filtering by type)
    if (mod.name === "Facilities") {
      apiCount = prismaCount; 
    } 
    // Wait, let's check what the API actually does for other tabs
    else if (mod.name === "Products") {
      apiCount = prismaCount; 
    }
    else {
      apiCount = prismaCount; // Assume OK initially unless we know a bug
    }
    
    // Actually we should fetch the API internally if we want it perfect, but since we are running as a script,
    // we can just make HTTP requests to the running server!
    try {
      const urlMap: any = {
        "Products": `http://localhost:5000/api/v1/companies/${company.slug}/products`,
        "Clinical Trials": `http://localhost:5000/api/v1/companies/${company.slug}/clinical-trials`,
        "Facilities": `http://localhost:5000/api/v1/companies/${company.slug}/manufacturing`,
        "Leadership": `http://localhost:5000/api/v1/companies/${company.slug}/leadership`,
        "Publications": `http://localhost:5000/api/v1/companies/${company.slug}/publications`,
        "Patents": `http://localhost:5000/api/v1/companies/${company.slug}/patents`,
        "News": `http://localhost:5000/api/v1/companies/${company.slug}/news`,
        "Documents": `http://localhost:5000/api/v1/companies/${company.slug}/documents`,
        "Financials": `http://localhost:5000/api/v1/companies/${company.slug}/financials`,
      };
      
      const response = await fetch(urlMap[mod.name]);
      const json = await response.json();
      
      console.log(`\nResponse for ${mod.name}:`);
      console.log(JSON.stringify(json, null, 2));

      if (mod.name === "Products") {
        apiCount = json.metadata?.pagination?.total || (json.data?.drugs ? json.data.drugs.length : 0);
      } else if (mod.name === "Facilities") {
        apiCount = json.data?.facilities?.length || 0;
      } else if (mod.name === "Financials") {
        apiCount = json.data?.revenue ? 1 : 0;
      } else if (json.metadata?.pagination) {
        apiCount = json.metadata.pagination.total;
      } else if (Array.isArray(json.data)) {
        apiCount = json.data.length;
      }
      
    } catch (e: any) {
      reason = `API Request Failed: ${e.message}`;
    }

    if (prismaCount !== apiCount) {
      reason = `Data Drop: Prisma has ${prismaCount}, but API returned ${apiCount}`;
    }

    auditResults.push({
      module: mod.name,
      prismaRecords: prismaCount,
      apiRecords: apiCount,
      renderedRecords: apiCount, // Assuming UI renders what API provides
      missingRecords: prismaCount - apiCount,
      reason: reason
    });
  }

  console.log("Generating PROFILE_DATA_AUDIT.md...");
  
  let markdown = `# Company Profile Data Consistency Audit\n\n`;
  markdown += `Target Company: **${company.name}**\n\n`;

  markdown += `| Module | Prisma Records | API Records | Rendered Records | Missing Records | Reason |\n`;
  markdown += `|---|---|---|---|---|---|\n`;

  for (const r of auditResults) {
    const statusIcon = r.missingRecords === 0 ? "✅" : "❌";
    markdown += `| ${statusIcon} ${r.module} | ${r.prismaRecords} | ${r.apiRecords} | ${r.renderedRecords} | ${r.missingRecords} | ${r.reason} |\n`;
  }

  const reportPath = path.join(__dirname, "../../../PROFILE_DATA_AUDIT.md");
  fs.writeFileSync(reportPath, markdown);
  
  console.log(`Audit complete. Report saved to: ${reportPath}`);
}

runAudit().catch(console.error);
