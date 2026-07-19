# COMPLETE DATABASE AUDIT

## Overview
The current SQLite Prisma schema serves as a basic proof-of-concept directory but fails to capture the complexity required for a global Life Sciences Intelligence Platform.

## Model Audits

### 1. `Company`
- **Purpose**: Core entity.
- **Current Fields**: `legalName`, `slug`, `formerName`, `description`, `foundedYear`, `companyType`, `status`, identifiers (`lei`, `cik`, `duns`, `ticker`), `website`, and quality scores.
- **Missing Fields**: Full address hierarchy, complex ownership trees, extensive social media / contact links, business segments, mission/vision.
- **Wrong/Future Limitations**: Relying on scalar quality scores (`completenessScore`) instead of computing them dynamically based on relationships. No history tracking for changes like name changes.

### 2. `Facility`
- **Purpose**: Tracks physical footprint.
- **Current Fields**: `name`, `type`, `address`, `city`, `countryId`.
- **Missing Fields**: `latitude`, `longitude`, `postalCode`, `operationalStatus`, `capacity`.
- **Normalization Problems**: Addresses are stored as raw strings rather than normalized location entities.

### 3. `Financial`
- **Purpose**: Tracks fiscal performance.
- **Current Fields**: `fiscalYear`, `revenue`, `marketCap`.
- **Missing Fields**: `netIncome`, `operatingIncome`, `ebitda`, `cash`, `debt`, `assets`, `liabilities`, `rdSpend`, `capex`, `employees`, `currency`.

### 4. `Drug`
- **Purpose**: Tracks pharmaceutical products.
- **Current Fields**: `tradeName`, `genericName`, `activeIngredient`, `approvalStatus`, `routeOfAdmin`.
- **Missing Fields**: `mechanismOfAction`, `atcCode`, `dosageForm`, `strength`, `commercialStatus`, `patentExpiry`, `countriesApproved`.
- **Normalization Problems**: Relies on scalar strings instead of linking to standardized dictionaries (e.g., ATC tables).

### 5. `ClinicalTrial`
- **Purpose**: Tracks R&D trials.
- **Current Fields**: `nctId`, `title`, `phase`, `status`, `startDate`.
- **Missing Fields**: `collaborators`, `enrollment`, `studyDesign`, `primaryEndpoint`, `completionDate`, `locations`.

### 6. `Provenance`
- **Purpose**: Tracks data origins.
- **Current Fields**: `sourceUrl`, `sourceName`, `retrievedAt`, `confidenceScore`.
- **Limitations**: Currently only linked to `Company` globally, rather than being attached to every individual record (e.g., every `Drug` or `Facility` must have a specific provenance trace).

## Conclusion
The schema must be entirely redesigned in 3NF, utilizing comprehensive many-to-many relationships, centralized address dictionaries, and strict historical versioning.
