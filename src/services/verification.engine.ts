import { prisma } from "../config/prisma";
import { Company } from "@prisma/client";

export class VerificationEngine {
  private readonly ALLOWED_COMPANY_TYPES = [
    "PHARMACEUTICAL",
    "BIOTECHNOLOGY",
    "MEDICAL DEVICES",
    "DIAGNOSTICS",
    "CRO",
    "CDMO",
    "LIFE SCIENCES SOFTWARE",
    "API MANUFACTURERS",
    "BIOLOGICS",
    "GENE THERAPY",
    "CELL THERAPY",
    "VACCINES",
    "GENOMICS",
    "LABORATORY SERVICES",
    "DRUG DISCOVERY",
    "RESEARCH ORGANIZATIONS",
    "BIOINFORMATICS"
  ];

  private readonly BLACKLIST = [
    "RETAIL",
    "BEAUTY",
    "COSMETICS",
    "FASHION",
    "FOOD",
    "RESTAURANT",
    "TRADING",
    "MILITARY",
    "ARMY",
    "EXCHANGE SERVICES",
    "CONSUMER GOODS",
    "ALCOHOL",
    "TOBACCO",
    "AUTOMOTIVE",
    "CONSTRUCTION",
    "GENERAL MANUFACTURING",
    "IMPORTERS",
    "PRIVATE LABEL",
    "DISTRIBUTORS"
  ];

  // Specific strict logic for the explicit list
  private readonly TARGET_COMPANIES = [
    "PFIZER", "ABBVIE", "MERCK", "NOVARTIS", "DR. REDDY'S", 
    "SUN PHARMA", "CIPLA", "BIOCON", "AMGEN", "REGENERON"
  ];

  async verify(id: string): Promise<Company> {
    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) throw new Error("Company not found");

    if (company.status !== "DISCOVERED") {
      return company; 
    }

    const uppercaseName = company.name.toUpperCase();
    const uppercaseIndustry = (company.description || "").toUpperCase();

    const isTarget = this.TARGET_COMPANIES.some(t => uppercaseName.includes(t.replace(/[^A-Z]/g, '')));
    const hasBlacklistKeyword = this.BLACKLIST.some(b => uppercaseName.includes(b) || uppercaseIndustry.includes(b));
    const hasWhitelistKeyword = this.ALLOWED_COMPANY_TYPES.some(w => uppercaseName.includes(w) || uppercaseIndustry.includes(w));

    let newStatus = "DISCOVERED";

    if (isTarget) {
      newStatus = "VERIFIED";
      console.log(`[VERIFICATION ENGINE] Automatically verified TARGET COMPANY: ${company.name}`);
    } else if (hasBlacklistKeyword && !isTarget) {
      newStatus = "REJECTED";
      console.log(`[VERIFICATION ENGINE] REJECTED (Blacklist): ${company.name}`);
    } else if (hasWhitelistKeyword) {
      newStatus = "VERIFIED";
      console.log(`[VERIFICATION ENGINE] Verified (Whitelist): ${company.name}`);
    } else {
      newStatus = "REJECTED"; // Strict rejection unless independently verified
      console.log(`[VERIFICATION ENGINE] REJECTED (Unclassified): ${company.name}`);
    }

    return prisma.company.update({
      where: { id },
      data: {
        status: newStatus,
        lastVerified: new Date()
      }
    });
  }
}
