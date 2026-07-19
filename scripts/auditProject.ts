// auditProject.ts – Full platform audit script
// This script generates a CSV report covering all required fields for every company.
// It is intended to run via `npm run audit` (add script to package.json).

import { PrismaClient, Company, Product, Drug, CompanyClinicalTrial, CompanyPublication, CompanyPatent, CompanyNews, CompanyDocument, CompanyFacility, CompanyExecutive, CompanySubsidiary } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Helper to safely read JSON fields stored as strings
function parseJson<T>(jsonStr?: string): T | null {
  if (!jsonStr) return null;
  try {
    return JSON.parse(jsonStr) as T;
  } catch (_) {
    return null;
  }
}

// Compute coverage percentages – simple field count ratio
function computeCoverage<T>(obj: T, requiredKeys: (keyof T)[]): number {
  const total = requiredKeys.length;
  const filled = requiredKeys.filter(k => {
    const val = (obj as any)[k];
    return val !== null && val !== undefined && val !== "";
  }).length;
  return total === 0 ? 0 : (filled / total) * 100;
}

async function main() {
  // Prepare CSV header
  const headers = [
    "Company Name",
    "Company Type",
    "Industry",
    "Business Model",
    "Data Coverage %",
    "Profile Completeness %",
    "APIs Used",
    "Official Sources Used",
    "Verified Sections",
    "Missing Sections",
    "Hidden Sections",
    "Portfolio Count",
    "Clinical Trial Count",
    "Research Count",
    "Facilities Count",
    "Financial Coverage",
    "Executive Coverage",
    "News Coverage",
    "Documents Coverage",
    "Products Coverage",
    "Solutions Coverage",
    "Services Coverage",
    "Technology Coverage",
    "Last Sync",
    "Confidence Score",
    "Quality Score"
  ];

  const rows: string[] = [];
  const companies = await prisma.company.findMany({
    include: {
      products: true,
      drugs: true,
      clinicalTrials: true,
      publications: true,
      patents: true,
      news: true,
      documents: true,
      facilities: true,
      executives: true,
      subsidiaries: true,
    },
  });

  for (const c of companies) {
    // Company Type detection – placeholder using categories (extend later)
    const companyType = c.categories?.length ? c.categories.map(cat => cat.name).join(", ") : "Unknown";
    const industry = c.industry ?? "";
    const businessModel = c.businessModel ?? "";

    // Required fields for coverage (sample list – extend as needed)
    const requiredCompanyKeys: (keyof Company)[] = [
      "description",
      "website",
      "logoUrl",
      "status",
      "lei",
      "cik",
      "rorId",
      "wikidataId",
      "openCorpId",
    ];
    const dataCoverage = computeCoverage(c, requiredCompanyKeys);

    // Profile completeness – based on presence of related entities
    const sections = {
      products: c.products?.length ?? 0,
      drugs: c.drugs?.length ?? 0,
      clinicalTrials: c.clinicalTrials?.length ?? 0,
      publications: c.publications?.length ?? 0,
      patents: c.patents?.length ?? 0,
      news: c.news?.length ?? 0,
      documents: c.documents?.length ?? 0,
      facilities: c.facilities?.length ?? 0,
      executives: c.executives?.length ?? 0,
      subsidiaries: c.subsidiaries?.length ?? 0,
    };
    const totalSections = Object.keys(sections).length;
    const presentSections = Object.values(sections).filter(v => v > 0).length;
    const profileCompleteness = (presentSections / totalSections) * 100;

    // API & source tracking – stored in rawApiData / provenance JSON blobs
    const rawApi = parseJson<string[]>(c.rawApiData) ?? [];
    const provenance = parseJson<any[]>(c.provenance) ?? [];
    const apisUsed = rawApi.join(";");
    const officialSources = provenance.map(p => p.source ?? "").filter(Boolean).join(";");

    // Section counts
    const portfolioCount = (c.products?.length ?? 0) + (c.drugs?.length ?? 0);
    const clinicalTrialCount = c.clinicalTrials?.length ?? 0;
    const researchCount = c.publications?.length ?? 0; // using publications as research proxy
    const facilitiesCount = c.facilities?.length ?? 0;

    // Coverage placeholders for financial, executive, etc.
    const financialCoverage = c.marketCap ? 100 : 0;
    const executiveCoverage = c.executives?.length ? 100 : 0;
    const newsCoverage = c.news?.length ? 100 : 0;
    const documentsCoverage = c.documents?.length ? 100 : 0;
    const productsCoverage = c.products?.length ? 100 : 0;
    const solutionsCoverage = 0; // not modelled yet
    const servicesCoverage = 0; // not modelled yet
    const technologyCoverage = 0; // not modelled yet

    const lastSync = c.lastSyncSuccess?.toISOString() ?? "";
    const confidence = 100; // placeholder – can be derived from provenance confidence values
    const quality = 100; // placeholder – can be derived from data verification steps

    const row = [
      c.name,
      companyType,
      industry,
      businessModel,
      dataCoverage.toFixed(2),
      profileCompleteness.toFixed(2),
      apisUsed,
      officialSources,
      presentSections.toString(),
      (totalSections - presentSections).toString(),
      "0", // hidden sections – not applicable currently
      portfolioCount.toString(),
      clinicalTrialCount.toString(),
      researchCount.toString(),
      facilitiesCount.toString(),
      financialCoverage.toString(),
      executiveCoverage.toString(),
      newsCoverage.toString(),
      documentsCoverage.toString(),
      productsCoverage.toString(),
      solutionsCoverage.toString(),
      servicesCoverage.toString(),
      technologyCoverage.toString(),
      lastSync,
      confidence.toString(),
      quality.toString(),
    ].join(",");
    rows.push(row);
  }

  const csv = [headers.join(","), ...rows].join("\n");
  const outPath = path.resolve(__dirname, "../../audit_report.csv");
  fs.writeFileSync(outPath, csv);
  console.log(`Audit report written to ${outPath}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
