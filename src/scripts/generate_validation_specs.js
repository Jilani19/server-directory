const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751';

// 1. DATABASE_VALIDATION_RULES.md
const dvr = `# DATABASE VALIDATION RULES

This document defines the strict relational integrity and required fields for every database entity.

## 1. Company
- **Required Fields**: \`id\`, \`legalName\`, \`slug\`, \`status\`.
- **Unique Constraints**: \`slug\`, \`lei\` (Optional but unique), \`cik\` (Optional but unique), \`duns\` (Optional but unique).
- **Referential Integrity**: 1:N with Provenance, Facilities, Financials, Drugs, ClinicalTrials, Patents, Publications.

## 2. Provenance
- **Required Fields**: \`id\`, \`companyId\`, \`sourceName\`, \`sourceUrl\`, \`sourceClassification\`, \`verificationStatus\`, \`confidenceScore\`, \`retrievedAt\`.
- **Business Rules**: Cannot be deleted if linked to active Company data. A single Company must have at least one Provenance record of \`confidenceScore >= 90\` to be "Verified".

## 3. Financial
- **Required Fields**: \`id\`, \`companyId\`, \`fiscalYear\`.
- **Unique Constraints**: Composite constraint: \`[companyId, fiscalYear]\`.
- **Business Rules**: \`fiscalYear\` must be <= current calendar year. \`revenue\` must be >= 0.

## 4. Facility
- **Required Fields**: \`id\`, \`companyId\`, \`name\`, \`type\`.
- **Business Rules**: \`type\` must be an enum (HQ, MANUFACTURING, R_AND_D, OFFICE).

## 5. Drug (Products)
- **Required Fields**: \`id\`, \`companyId\`, \`tradeName\`, \`approvalStatus\`.
- **Unique Constraints**: \`rxNormId\` (if present).
- **Business Rules**: \`approvalStatus\` must be enum (APPROVED, REJECTED, WITHDRAWN, INVESTIGATIONAL).

## 6. ClinicalTrial
- **Required Fields**: \`id\`, \`companyId\`, \`nctId\`, \`title\`, \`phase\`, \`status\`.
- **Unique Constraints**: \`nctId\`.
- **Business Rules**: \`nctId\` must match regex \`^NCT\\d{8}$\`.

## 7. Patent
- **Required Fields**: \`id\`, \`companyId\`, \`patentNumber\`, \`status\`.
- **Unique Constraints**: \`patentNumber\`.
- **Business Rules**: \`status\` must be enum (GRANTED, PENDING, EXPIRED, ABANDONED).

## 8. Publication
- **Required Fields**: \`id\`, \`companyId\`, \`title\`, \`journal\`.
- **Unique Constraints**: \`doi\` (if present).

## 9. CompanyRelationship
- **Required Fields**: \`id\`, \`sourceCompanyId\`, \`targetCompanyId\`, \`relationshipType\`.
- **Unique Constraints**: Composite constraint: \`[sourceCompanyId, targetCompanyId, relationshipType]\`.
- **Business Rules**: A company cannot have a relationship with itself.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'DATABASE_VALIDATION_RULES.md'), dvr);


// 2. ENTITY_VALIDATION.md
const ev = `# ENTITY VALIDATION

This document defines the application-level validation, conflict resolution, and data lifecycle rules.

## 1. Duplicate Detection
- **Identity (Company)**: Evaluated on incoming CIK, LEI, or DUNS. If an exact match is found, trigger the Merge Rule. If no identifiers exist, perform Levenshtein distance matching on \`legalName\` and \`brandName\` (distance <= 2 triggers manual review queue).
- **Children (Trials, Drugs)**: Exact match on standard identifiers (NCT ID, RxNorm, DOI).

## 2. Merge Rules
- **Rule 1 (Confidence Overwrite)**: If an incoming payload contains a field (e.g., \`revenue\`) from a source with a higher confidence score (e.g., SEC = 100) than the existing source (e.g., Website Scrape = 40), the existing field is overwritten.
- **Rule 2 (Null Fill)**: If an existing field is \`null\`, any incoming payload with a confidence > 50 may populate it.
- **Rule 3 (Array Appends)**: Entities like Facilities and Contacts are always appended, never overwritten, unless exact \`name\` + \`city\` match occurs.

## 3. Quality Rules (DQE)
Data Quality Engine (DQE) scores are dynamically calculated:
- **Completeness**: Evaluates presence of CIK, LEI, HQ Address, Financials.
- **Freshness**: Score decays by 5% every 30 days since the last Provenance \`retrievedAt\`.
- **Verification**: Score is an average of all related Provenance \`confidenceScore\` fields.

## 4. Deletion Rules
- **Soft Deletes**: Deleting a \`Company\` sets \`status: 'DELETED'\`. It cascades to hide all related entities from public API views.
- **Hard Deletes**: Only permitted for orphaned relation rows (e.g., a \`Facility\` mistakenly attached to the wrong company, corrected via Admin).
- **Provenance Retention**: Provenance records are NEVER hard deleted for compliance auditing.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'ENTITY_VALIDATION.md'), ev);

console.log("Deep Entity Validation Specs Generated.");
