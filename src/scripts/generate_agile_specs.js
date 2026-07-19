const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751';

// 1. IMPLEMENTATION_BACKLOG.md
const ib = `# IMPLEMENTATION BACKLOG

## EPIC 1: Foundational Intelligence Architecture
**Feature**: Robust Database & API Standard
- **Story**: As a backend engineer, I need to enforce database validation rules so that no mock data can be inserted.
  - **Task 1**: Implement Zod validation schemas for all inbound payloads.
  - **Task 2**: Add composite unique constraints to Prisma (e.g. \`companyId_fiscalYear\` in Financials).
- **Story**: As a frontend engineer, I need centralized Visual Tokens so that all UI components share the exact same spacing and color scales.
  - **Task 1**: Port \`VISUAL_TOKENS.md\` into a global CSS module.

## EPIC 2: Omnisearch Engine
**Feature**: High-Speed Universal Search
- **Story**: As a user, I need to search by CIK, LEI, NCT, or Drug Name instantly.
  - **Task 1**: Build the \`GET /api/v1/search\` endpoint with fuzzy matching.
  - **Task 2**: Build the frontend Autocomplete Dropdown component with keyboard navigation.

## EPIC 3: Directory Discovery (Index Page)
**Feature**: Tear-Sheet Filtering Grid
- **Story**: As an analyst, I want to filter by Therapeutic Area and Market Cap using faceted filters.
  - **Task 1**: Build the Left Sidebar accordion filter component.
  - **Task 2**: Implement the "Load More" cursor pagination API logic.

## EPIC 4: Company Profile (Tear Sheet)
**Feature**: High-Density Data Grids
- **Story**: As an investor, I want to view a dense list of Clinical Trials with Phase badges.
  - **Task 1**: Build the reusable DataGrid component.
  - **Task 2**: Implement the \`ClinicalTrials\` tab pulling paginated trial data.

## EPIC 5: Production Hydration
**Feature**: Real API Connectors
- **Story**: As the system administrator, I need a scheduled worker to hit SEC EDGAR and OpenFDA automatically.
  - **Task 1**: Write the SEC EDGAR XBRL extraction script.
  - **Task 2**: Write the OpenFDA manufacturer query script with 404 catching.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'IMPLEMENTATION_BACKLOG.md'), ib);

// 2. SPRINT_EXECUTION_PLAN.md
const sep = `# SPRINT EXECUTION PLAN

## Sprint 1: Foundation & APIs
- **Goal**: Lock in the Prisma schema updates, Error schemas, and CSS Visual Tokens.
- **Deliverables**: All backend CRUD routes established with strict Zod validation. Global CSS variables initialized.

## Sprint 2: Core Components & Hydration
- **Goal**: Build the Atomic React component library and implement real API connectors.
- **Deliverables**: DataGrid, StatusBadge, Button, and StatCard components. The \`production_hydration.ts\` engine successfully hits SEC EDGAR and ClinicalTrials.gov.

## Sprint 3: Discovery Engine (Directory)
- **Goal**: Complete the global Directory page.
- **Deliverables**: Omnisearch Bar, Faceted Filters (Sidebar), and Company Grid Cards with "Load More" pagination.

## Sprint 4: Intelligence Tear Sheet (Profile)
- **Goal**: Complete the high-density Company Profile experience.
- **Deliverables**: Overview Hero (KPIs), Products Tab, Clinical Trials Tab, and Financials Tab.

## Sprint 5: Hardening & Performance
- **Goal**: QA, Accessibility, and Latency tuning.
- **Deliverables**: ARIA live regions implemented, Lighthouse score > 90, sub-300ms latency on search.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'SPRINT_EXECUTION_PLAN.md'), sep);

// 3. TASK_MATRIX.md
const tm = `# TASK MATRIX

| Epic | Task Name | Dependencies | Priority | Estimate | Risk | Acceptance Criteria |
|---|---|---|---|---|---|---|
| 1 | Zod Payload Validation | None | P0 | 3 days | Low | All POST/PUT endpoints reject malformed data with standard 400 JSON. |
| 1 | Global CSS Tokens | None | P0 | 1 day | Low | All hardcoded Tailwind hex codes replaced by \`var(--clr-primary)\`. |
| 2 | Omnisearch Endpoint | Epic 1 | P1 | 5 days | High | Endpoint searches 5 distinct tables simultaneously within 200ms. |
| 3 | Faceted Sidebar UI | Epic 1 | P1 | 4 days | Med | Filter toggles instantly update the URL query params and trigger grid refresh. |
| 4 | Profile DataGrid UI | Epic 1 | P1 | 5 days | Med | Table supports sticky headers, column sorting, and custom badge rendering. |
| 5 | SEC EDGAR Connector | Epic 1 | P0 | 4 days | High | Successfully parses XBRL JSON and handles 429 Rate Limits automatically. |
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'TASK_MATRIX.md'), tm);

console.log("Deep Agile Execution Specs Generated.");
