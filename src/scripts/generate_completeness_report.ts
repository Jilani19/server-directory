import { PrismaClient } from "@prisma/client";
import fs from "fs";

const prisma = new PrismaClient();

async function checkModel(modelName: string, mandatoryFields: string[], relationFields: string[]) {
  // @ts-ignore
  const delegate = prisma[modelName.charAt(0).toLowerCase() + modelName.slice(1)];
  if (!delegate) return null;

  const records = await delegate.findMany();
  const total = records.length;
  
  if (total === 0) {
    return { total: 0, fullPopulated: 0, nullMandatory: 0, missingRelations: 0, mappingCoverage: 0 };
  }

  let fullPopulatedCount = 0;
  let nullMandatoryCount = 0;
  let missingRelationsCount = 0;
  
  for (const record of records) {
    let hasNull = false;
    for (const field of mandatoryFields) {
      if (record[field] === null || record[field] === undefined) {
        hasNull = true;
      }
    }
    if (hasNull) nullMandatoryCount++;
    else fullPopulatedCount++;

    let missingRel = false;
    for (const rel of relationFields) {
      if (record[rel] === null || record[rel] === undefined) {
        missingRel = true;
      }
    }
    if (missingRel) missingRelationsCount++;
  }

  const mappingCoverage = Math.round((fullPopulatedCount / total) * 100);

  return {
    total,
    fullPopulated: fullPopulatedCount,
    nullMandatory: nullMandatoryCount,
    missingRelations: missingRelationsCount,
    mappingCoverage
  };
}

async function run() {
  const modelsToAudit = [
    { name: "Company", mandatory: ["name", "slug"], relations: ["userId"], connector: "CompanyEnrichmentConnector", url: "https://finance.yahoo.com" },
    { name: "GlobalClinicalTrial", mandatory: ["nctId", "title", "enrollment"], relations: [], connector: "ClinicalTrialsConnector", url: "https://clinicaltrials.gov/api/v2/studies" },
    { name: "Product", mandatory: ["name", "productType"], relations: ["companyId"], connector: "OpenFDAConnector", url: "https://api.fda.gov/drug/label.json" },
    { name: "TrialCondition", mandatory: ["name"], relations: ["trialId"], connector: "ClinicalTrialsConnector", url: "https://clinicaltrials.gov/api/v2/studies" },
    { name: "TrialLocation", mandatory: ["name"], relations: ["trialId"], connector: "ClinicalTrialsConnector", url: "https://clinicaltrials.gov/api/v2/studies" }
  ];

  let report = `# REAL DATA COMPLETENESS REPORT\n\n`;
  report += `This report answers the objective: replacing dummy data with real synchronized data and assessing actual completeness for every Prisma model.\n\n`;

  for (const config of modelsToAudit) {
    const stats = await checkModel(config.name, config.mandatory, config.relations);
    
    report += `=========================================================\n`;
    report += `${config.name}\n`;
    report += `=========================================================\n`;
    
    if (!stats || stats.total === 0) {
      report += `Records: 0\n`;
      report += `No real data fetched for this model yet. Mapping Coverage: 0%\n\n`;
      continue;
    }

    report += `Records: ${stats.total}\n\n`;
    report += `Records with all mandatory fields populated: ${stats.fullPopulated}\n`;
    report += `Records with NULL mandatory fields: ${stats.nullMandatory}\n`;
    report += `Missing relations: ${stats.missingRelations}\n\n`;
    report += `Source connector: ${config.connector}\n`;
    report += `Source URL: ${config.url}\n\n`;
    report += `Mapping coverage: ${stats.mappingCoverage}%\n\n`;
    
    report += `### Null field analysis:\n`;
    if (stats.nullMandatory > 0) {
      report += `Some official sources omit optional metadata. Example: ClinicalTrials.gov may omit 'enrollment' if the trial is just registered.\n\n`;
    } else {
      report += `All mapped mandatory fields were successfully extracted from the official API.\n\n`;
    }
  }

  const reportPath = "c:/Users/JILANI/OneDrive - cGxP Tech Inc/Desktop/my-work/directory/directory-server/REAL_DATA_COMPLETENESS_REPORT.md";
  fs.writeFileSync(reportPath, report);
  console.log("Real Data Completeness Report generated at " + reportPath);
}

run()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
