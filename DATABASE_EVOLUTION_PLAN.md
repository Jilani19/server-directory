# DATABASE EVOLUTION PLAN

## Objective
To expand the Prisma schema into a Global Life Sciences Intelligence Engine supporting rigorous history tracking, provenance, and broad entity coverage.

## Phase 1: Core Entity Expansion

### Company Model Expansion
- Add complete master data: `formerNames`, `mission`, `vision`, `industry`, `subIndustry`, `ownershipType`.
- Add stock and identifiers: `isin`, `naics`, `sic`.
- Add location and contact vectors: `address`, `state`, `postalCode`, `latitude`, `longitude`, `careersUrl`, `phone`, `corporateEmail`, `linkedin`, `twitter`, `youtube`.
- Add Sync tracking: `lastSynced`, `nextSync`, `syncStatus`, `syncDuration`, `lastError`.

### Core Intelligence Models (New)
1. **Leadership**: `id`, `companyId`, `name`, `role`, `appointmentDate`, `isCurrent`, `biography`.
2. **Regulatory Models**: `Inspection` (FDA Form 483), `SafetyAlert`, `Recall`.
3. **Event Models**: `InvestorEvent`, `Conference`, `NewsEvent`.
4. **Market & Strategy**: `MarketSegment`, `Competitor` (mapping to `CompanyRelationship`), `SupplyChainMetric`, `ESGMetric`.

## Phase 2: Historical Versioning Strategy
Every model must integrate a pattern to preserve historical states without overwriting.
- **Pattern**: A standard approach is appending an `EntityHistory` ledger table for critical fields (e.g., `Revenue`, `CEO`), storing `previousValue`, `newValue`, `timestamp`, and `provenanceId`.
- **Alternative**: Soft deletes (`isActive = false`) for entities like `Leadership` when an executive is replaced.
