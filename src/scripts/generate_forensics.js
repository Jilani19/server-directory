const fs = require('fs');
const path = require('path');

const outDir = 'C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751/';

const write = (file, content) => fs.writeFileSync(path.join(outDir, file), content.trim());

write('ROOT_CAUSE_ANALYSIS.md', `
# Root Cause Analysis

## Fundamental Disconnect
The inconsistencies are caused by a fundamental disconnect between database state and UI bindings. The database lacks data for several core tables (CompanyCorporate, CompanyContact, CompanyFacility), but the frontend masks this through hardcoded UI components, missing Prisma relation joins, and leftover mocked logic.

## Categorized Causes
- **DATABASE**: \`CompanyCorporate\`, \`CompanyContact\`, and \`CompanyFacility\` are completely empty (0 rows).
- **FRONTEND / MOCK DATA**: The \`CompanyFeatureCard.tsx\` reads from a frontend structure that mirrors products into the \`employees\` property.
- **PRISMA / CONTROLLER**: \`getCompanies\` drops \`city\` and \`country\` relations, leaving them \`undefined\`.
- **PARSER / DUPLICATE INSERT**: OpenFDA worker iterates over aliases and inserts products indiscriminately without an upsert constraint.
- **NOT IMPLEMENTED**: The \`CompanyIdentifier\` table and its associated identifiers logic literally do not exist in the Prisma schema.
`);

write('DATABASE_VERIFICATION.md', `
# Database Verification

Executed via Prisma raw count queries.

- \`Company\`: 500 rows
- \`CompanyCorporate\`: 0 rows (100% NULL)
- \`CompanyIdentifier\`: NOT IMPLEMENTED (Model does not exist in schema)
- \`CompanyProduct\`: 4471 rows
- \`CompanyClinicalTrial\`: 136777 rows
- \`CompanyPublication\`: 0 rows
- \`CompanyPatent\`: 0 rows
- \`CompanyFacility\`: 0 rows
- \`CompanyNews\`: 0 rows
- \`CompanyContact\`: 0 rows
- \`CompanyLeadership\`: 0 rows
- \`CompanyCompetitor\`: 0 rows
- \`CompanyRelatedCompany\`: 0 rows
- \`CompanyRegulatory\`: 0 rows
- \`CompanyResearch\`: 0 rows

**Conclusion**: The database is massively underpopulated. Most auxiliary tables are 100% empty, proving that synchronization is incomplete for all non-clinical/product domains.
`);

write('FIELD_MAPPING_REPORT.md', `
# Field Mapping Report

- **Employees**: Bound to \`company.employees\` / \`corporate.employees\`. DB column is empty. UI is erroneously fed by a legacy structure that duplicates product counts.
- **Headquarters/Phone/Email**: Bound to \`company.city.name\`, \`company.contacts[0].phone\`. DB is empty. UI renders fallback \`-\`.
- **Location data pending**: Bound to \`company.city.name\`. Controller drops the Prisma relation.
- **7**: Bound to nothing. Hardcoded JSX.
- **Identifiers**: Bound to nothing. Not implemented.
`);

write('DATABASE_TO_UI_TRACE.md', `
# Database to UI Trace

### Employees Widget
UI Component → Props (\`corporate.employees\`) → API JSON → Controller (\`getCompany\`) → Prisma (\`include: { corporate: true }\`) → DB (\`CompanyCorporate\`). DB is empty (0 rows). Thus, rendering 93 is a **MOCK DATA** leak in the UI.

### Location Grid
UI Component → Props (\`company.city\`) → API JSON → Controller (\`getCompanies\`) → Prisma (DROPPED RELATION) → DB (\`City\`).

### Ratings
UI Component → Hardcoded \`7\` → No Binding.

### Identifiers
UI Component → Hardcoded "No verified identifiers available" → No Schema Model.
`);

write('CONTROLLER_AUDIT.md', `
# Controller Audit

### \`GET /api/v1/company\` (getCompanies)
- **Prisma Include**: \`include: { corporate: true }\`
- **Dropped Fields**: \`city\`, \`country\`, \`contacts\`, \`products\`
- **Missing Relations**: Causes the grid to show "Location data pending".

### \`GET /api/v1/company/:slug\` (getCompany)
- **Prisma Include**: \`overview, corporate, financials, city, country, contacts, sources, products...\`
- **Returned JSON**: Returns full company object.
- **Missing Relations**: Missing \`identifiers\` because it is not implemented.
`);

write('PRISMA_QUERY_AUDIT.md', `
# Prisma Query Audit

- **Grid Fetch**: Omits heavily nested relations to save bytes, but inadvertently breaks the Location UI requirement.
- **Upserts**: Prisma lacks \`@@unique([companyId, name])\` on \`CompanyProduct\`, causing the duplicates in Roche.
- **Aggregations**: \`_count.products\` is mapped properly but exposes the data inconsistency when compared to the \`corporate.employees\` mismatch.
`);

write('FRONTEND_BINDING_AUDIT.md', `
# Frontend Binding Audit

- \`CompanyGrid.tsx\`: Binds to \`company.city.name\` (which is undefined). Hardcodes \`<span style={{fontWeight: 800}}>7</span>\`.
- \`CompanyHero.tsx\`: Binds \`corporate.employees || "-"\`.
- \`CompanyFeatureCard.tsx\`: Binds \`company.employees\`. This component is the source of the AbbVie "93 Employees" anomaly, as it was built to read from a legacy mock object.
`);

write('HARDCODED_VALUES_REPORT.md', `
# Hardcoded Values Report

- \`CompanyGrid.tsx:94\`: \`7\` (Rating)
- \`CompanyGrid.tsx:98\`: Hardcoded SVG Stars
- \`ProfileSidebar.tsx:84\`: \`No verified identifiers available.\`
- \`CompanyGrid.tsx:29\`: \`Location data pending\`
`);

write('MOCK_DATA_REPORT.md', `
# Mock Data Report

- \`CompanyFeatureCard.tsx\`: Still operates on expected legacy mock structures where \`company.employees\` was statically mapped to equal the product count for aesthetic density. 
- **Recommendation**: This component must be refactored to read safely from the Prisma API payload.
`);

write('DUPLICATE_RECORD_ANALYSIS.md', `
# Duplicate Record Analysis

- **Table**: \`CompanyProduct\`
- **Symptom**: "Valium" appears 3 times for Roche.
- **Cause**: **PARSER / DUPLICATE INSERT**. The \`openfda.worker.ts\` loops over the aliases \`Roche\`, \`Roche Inc\`, \`Roche LLC\`. For each alias, it runs \`prisma.companyProduct.create\`.
- **Missing Constraint**: There is no database constraint (\`@@unique\`) nor code logic to prevent the same generic drug from inserting 3 times.
`);

write('P0_BUG_LIST.md', `
# P0 Bug List

1. **Prisma Missing Joins**: \`company.controller.ts\` drops \`city\`/\`country\` in list views.
2. **Missing Deduplication**: \`CompanyProduct\` allows duplicate names per company.
3. **Ghost Tables**: \`CompanyCorporate\`, \`CompanyContact\`, \`CompanyFacility\` are 100% empty.
4. **Hardcoded UI**: Grid displays fake ratings ("7") and Identifiers are completely unmodeled.
5. **Mock Field Bleed**: \`CompanyFeatureCard.tsx\` displays product counts under "Employees" due to legacy structural expectations.
`);

write('FIX_ORDER.md', `
# Recommended Fix Order

Do not start fixing until instructed.

1. **Schema Layer**: Add \`@@unique\` to \`CompanyProduct\` and create \`CompanyIdentifier\` model.
2. **Database Layer**: Run Prisma migration and generate client.
3. **Controller Layer**: Update \`getCompanies\` to include \`city\` and \`country\`.
4. **Worker Layer**: Refactor API crawlers to use \`upsert\` instead of \`create\`.
5. **Frontend Layer**: Remove hardcoded "7" from \`CompanyGrid.tsx\` and refactor \`CompanyFeatureCard.tsx\` bindings.
6. **Data Acquisition**: Deploy crawlers to populate the 0-row tables (Corporate, Facilities, Contacts).
`);
