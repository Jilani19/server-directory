# DATA GAP REPORT

## Architectural Deficiencies

To support the V2 Life Sciences Intelligence Platform, the SQLite Prisma schema requires a massive overhaul.

### 1. Master Data Expansion
The `Company` model requires:
`formerNames`, `brandNames`, `mission`, `vision`, `subIndustry`, `ownershipType`, `isin`, `naics`, `sic`, `founders`, `state`, `postalCode`, `latitude`, `longitude`, `careersUrl`, `phone`, `corporateEmail`, `linkedin`, `twitter`, `youtube`.

### 2. Leadership Intelligence
**New Model required**: `Leadership`
Fields: `companyId`, `role` (CEO, CFO), `name`, `appointmentDate`, `biography`.

### 3. Financial Intelligence
Expand `Financial` model:
`netIncome`, `operatingIncome`, `ebitda`, `enterpriseValue`, `cash`, `debt`, `assets`, `liabilities`, `rdSpend`, `capex`, `employees`.

### 4. Product & Pipeline Intelligence
Expand `Drug` model:
`scientificName`, `diseaseArea`, `mechanismOfAction`, `atcCode`, `dosageForm`, `strength`, `routeOfAdministration`, `commercialStatus`, `patentExpiry`, `countriesApproved`.

### 5. Clinical Intelligence
Expand `ClinicalTrial` model:
`collaborators`, `enrollment`, `studyDesign`, `primaryEndpoint`, `secondaryEndpoint`, `completionDate`, `clinicalTrialsUrl`.

### 6. Regulatory Intelligence
Expand `WarningLetter` into generic `RegulatoryAction`:
`actionType` (Warning Letter, 483, Import Alert, Safety Alert, Recall), `agency` (FDA, EMA, MHRA).

### 7. Facility Intelligence
Expand `Facility` model:
`latitude`, `longitude`, `operationalStatus`.

### 8. Scientific & Market Intelligence
**New Models required**: `ScientificAward`, `TechnologyPlatform`, `MarketSegment`.

### 9. News & Events
**New Model required**: `NewsEvent`
Fields: `type` (Press Release, M&A), `title`, `url`, `publishDate`.
