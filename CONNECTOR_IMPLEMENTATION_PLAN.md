# CONNECTOR IMPLEMENTATION PLAN

## Rollout Strategy

### Phase 1: Identity & Financials
**Connectors**: `OpenCorporates Connector`, `SEC Connector`
**Goal**: Establish absolute identity verification. Extract LEI, CIK, Tickers. Map multi-year fiscal revenue, net income, cash, debt, and employee counts.

### Phase 2: Pipeline & Products
**Connectors**: `OpenFDA Connector`
**Goal**: Query Orange Book and FAERS. Extract approved drugs, active ingredients, dosage forms, and patent expiries.

### Phase 3: Clinical & Innovation
**Connectors**: `ClinicalTrials Connector`, `USPTO Connector`
**Goal**: Pull ARES API for trial velocities, endpoints, and statuses. Extract active patent portfolios.

### Phase 4: Regulatory Compliance
**Connectors**: `FDA RSS Connector`
**Goal**: Scrape Warning Letters, 483 Observations, and Import Alerts. Map them strictly to the `Company` entity via entity resolution matching.
