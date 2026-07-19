const fs = require('fs');
const path = require('path');

const outDir = "C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751";

function write(name, content) {
    fs.writeFileSync(path.join(outDir, name), content);
    console.log(`Generated ${name}`);
}

const companyDataModel = `# Company Data Model

## Core Entity: Company
The single source of truth for the organization.
- **Merge Action**: Merge \`CompanyOverview\` and \`CompanyCorporate\` directly into \`Company\`. A 1:1 relation for core descriptive attributes is unnecessary overhead and causes joining issues in list views.

### Fields
- \`id\` (UUID, PK)
- \`legalName\` (String)
- \`brandName\` (String)
- \`formerName\` (String, Optional)
- \`slug\` (String, Unique)
- \`description\` (Text)
- \`mission\` (Text, Optional)
- \`vision\` (Text, Optional)
- \`foundedYear\` (Int)
- \`companyType\` (Enum: PUBLIC, PRIVATE, GOV, NON_PROFIT)
- \`status\` (Enum: DISCOVERED, VERIFIED)

### Identifiers
- \`lei\` (String, Unique)
- \`cik\` (String, Unique, Optional)
- \`duns\` (String, Unique, Optional)
- \`isin\` (String, Unique, Optional)
- \`ticker\` (String, Optional)
- \`exchange\` (String, Optional)

## Location & Contact
- \`website\` (String)
- \`phone\` (String, Optional)
- \`email\` (String, Optional)
- \`headquartersId\` (FK -> Location)
- \`parentCompanyId\` (FK -> Company, Optional)

## Abstraction: SourceAttribution
Instead of copying 8 source tracking fields (source, sourceUrl, confidenceScore, etc.) into every single model (25+ times), create a polymorphic or central \`DataProvenance\` model.
`;

const entityRelationship = `# Entity Relationship Design

## Global Taxonomy (Independent Entities)
Instead of tying everything directly to a \`Company\` string, we introduce global entities that many companies can link to.

- **Disease / Indication**: Global taxonomy (e.g., ICD-10, MeSH).
- **Target**: Biological targets (e.g., HER2, TNF-alpha).
- **Mechanism of Action**: Global definitions.
- **Technology Platform**: Reusable tech paradigms (e.g., mRNA, CRISPR).

## Core Relations

### Company -> Products
- \`Company\` (1) - (N) \`Drug/Molecule\`
- \`Company\` (1) - (N) \`MedicalDevice\`

### Company -> Clinical
- \`Company\` (1) - (N) \`ClinicalTrial\` (Sponsor/Collaborator)
- \`ClinicalTrial\` (M) - (N) \`Disease\`
- \`ClinicalTrial\` (M) - (N) \`Drug/Molecule\`

### Company -> IP & Science
- \`Company\` (1) - (N) \`PatentFamily\`
- \`Company\` (M) - (N) \`Publication\` (Authorship affiliation)

### Company -> Corporate Structure
- \`Company\` (1) - (N) \`Facility\` (Manufacturing, R&D)
- \`Company\` (1) - (N) \`Contact\` (Key Personnel)
- \`Company\` (1) - (N) \`Leadership\` (Executives, Board)
- \`Company\` (1) - (N) \`Acquisition\` (Target companies)
- \`Company\` (M) - (N) \`Competitor\`
`;

const fieldCatalog = `# Field Catalog

## Section: Corporate / Overview
| Field | Type | Classification | Source |
|---|---|---|---|
| Legal Name | String | Required | External (SEC/LEI) |
| Brand Name | String | Computed | Internal (Normalization) |
| Founded | Int | Optional | External (Website/SEC) |
| Company Type | Enum | Required | External (SEC/LEI) |
| Website | URL | Required | External |
| Ticker | String | Optional | External (SEC/Markets) |

## Section: Products (Drug)
| Field | Type | Classification | Source |
|---|---|---|---|
| Generic Name | String | Required | External (OpenFDA/RxNorm) |
| Brand Name | String | Optional | External (OpenFDA) |
| Active Ingredient | String | Required | External (OpenFDA) |
| Approval Status | Enum | Computed | External (FDA/EMA) |
| Route of Admin | String | Optional | External |

## Section: Clinical Trials
| Field | Type | Classification | Source |
|---|---|---|---|
| NCT ID | String | Required | External (ClinicalTrials.gov) |
| Title | Text | Required | External |
| Phase | Enum | Optional | External |
| Status | Enum | Required | External |
| Enrollment | Int | Optional | External |
`;

const sectionCatalog = `# Section Catalog

The following is an inventory of all visible UI sections on the Company Profile and their mapping to the data model.

1. **Overview**: Core description, mission, vision. (Mapped to: \`Company\` core table)
2. **Corporate**: Legal entities, identifiers (LEI, CIK), founded year, ownership. (Mapped to: \`Company\` core table)
3. **Leadership**: Executives, Board of Directors. (Mapped to: \`Leadership\` table)
4. **Products**: Drugs, Biologics, Devices currently in market. (Mapped to: \`Drug\`, \`Device\` entities)
5. **Pipeline**: Assets in development phase. (Mapped to: \`Drug\` with status != Approved)
6. **Clinical Trials**: Ongoing and past trials (NCTs). (Mapped to: \`ClinicalTrial\`)
7. **Manufacturing**: API, Packaging, Fill/Finish capabilities. (Mapped to: \`Facility\` with type = Manufacturing)
8. **Facilities**: Physical footprint, offices, labs. (Mapped to: \`Facility\`)
9. **Patents**: IP portfolio. (Mapped to: \`PatentFamily\`)
10. **Publications**: Scientific literature. (Mapped to: \`Publication\`)
11. **Financials**: Revenue, Market Cap, SEC filings. (Mapped to: \`Financial\`)
12. **News / Press**: RSS feeds, PRs. (Mapped to: \`News\`)
13. **Competitors**: Market rivals. (Mapped to: \`Competitor\` M:N)
`;

const normalizationReport = `# Normalization Report

## 1. Eliminate 1:1 Core Bloat
**Issue**: \`Company\`, \`CompanyOverview\`, and \`CompanyCorporate\` are separated.
**Resolution**: Merge into a single \`Company\` table. One fact (the company's core identity) in one place.

## 2. Globalize Taxonomy
**Issue**: \`country\` and \`city\` exist as raw strings in \`CompanyOffice\` and \`CompanyFacility\`, but as foreign keys in \`Company\`.
**Resolution**: All geographic fields must point to \`City\` -> \`State\` -> \`Country\` tables. 

## 3. Abstract Source Provenance
**Issue**: 8 fields (\`source\`, \`sourceUrl\`, \`confidenceScore\`, etc.) are duplicated across 25+ tables.
**Resolution**: Create a single \`DataProvenance\` table or JSONB metadata column. The business entities should hold business data, not crawler metadata.

## 4. Deduplicate Website
**Issue**: \`website\` exists in \`Company\`, \`CompanyCorporate\`, and \`CompanyContact\`.
**Resolution**: Canonical \`website\` lives in \`Company\`. Specific contacts can have distinct \`email\` or \`linkedin\`, but not the global corporate URL.
`;

const schemaImprovement = `# Schema Improvement Report

## Prisma Schema Verdicts

### Keep
- \`Role\`, \`User\` (Auth)
- \`Country\`, \`State\`, \`City\` (Geo taxonomy)
- \`CompanyCategory\` (Industry taxonomy)
- \`CompanyCompetitor\`, \`CompanyRelatedCompany\` (Network graphs)

### Modify
- \`Company\`: Expand to include fields currently trapped in Overview/Corporate.
- \`CompanyClinicalTrial\`: Needs relations to \`Disease\` and \`Drug\`, rather than raw strings.
- \`CompanyProduct\`: Rename to \`Drug\` or \`Device\` to support distinct schemas (Drugs have MOAs, Devices have Classes).

### Merge
- \`CompanyOverview\` -> \`Company\`
- \`CompanyCorporate\` -> \`Company\`
- \`CompanyOffice\` -> Merge into \`CompanyFacility\` with \`type="OFFICE"\`.

### Remove
- The 8 repeated tracking fields on every model.

### Missing (To be added)
- \`Disease\` / \`Indication\`
- \`Target\` / \`Pathway\`
- \`PatentFamily\` (Replaces raw \`CompanyPatent\`)
- \`Publication\` (Global authorship)
- \`Job\` / \`Career\`
`;

write('COMPANY_DATA_MODEL.md', companyDataModel);
write('ENTITY_RELATIONSHIP.md', entityRelationship);
write('FIELD_CATALOG.md', fieldCatalog);
write('SECTION_CATALOG.md', sectionCatalog);
write('NORMALIZATION_REPORT.md', normalizationReport);
write('SCHEMA_IMPROVEMENT_REPORT.md', schemaImprovement);
