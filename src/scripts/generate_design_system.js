const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751';

// --- DESIGN SYSTEM ---
const ds = `# DESIGN SYSTEM

## Core Philosophy
The cGxP.Directory Design System enforces strict visual consistency, prioritizing extremely high data density, legibility, and premium aesthetics over whitespace.

## Typography
- **Primary Font**: Inter (Clean, modern sans-serif).
- **Monospace Font**: Roboto Mono (For all numerical KPIs, financial data, and identifiers).
- **Scale**: Base 14px (Dense), 16px (Standard).

## Colors
- **Primary**: Deep Slate (#0F172A) & Emerald Green (#10B981) for actions.
- **Background**: Soft Gray (#F8FAFC) to distinct White (#FFFFFF) cards.
- **Semantic**: Success (Green), Warning (Amber), Error (Red), Info (Blue).

## Spacing & Border Radius
- **Spacing**: 4px base scale.
- **Border Radius**: 6px for cards (sharp, professional), 99px for pills/badges.

## Elevation
- Flat by default. Subtle drop shadows (0 4px 6px -1px rgb(0 0 0 / 0.1)) only on hover states and modals.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'DESIGN_SYSTEM.md'), ds);

const cl = `# COMPONENT LIBRARY

## Purpose
A centralized repository of reusable React components.

## Components
- **DataGrid**: Highly virtualized table for Products/Trials.
  - Variants: Dense, Standard, Spaced.
- **StatCard**: For KPIs.
  - States: Loading (Skeleton), Error, Success.
- **StatusBadge**: Pill-shaped indicator for Approval/Trial phases.
  - Variants: Solid, Outline, Soft.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'COMPONENT_LIBRARY.md'), cl);

const vt = `# VISUAL TOKENS
- \`--color-primary-500\`: #3b82f6
- \`--spacing-4\`: 16px
- \`--font-size-sm\`: 0.875rem
- \`--shadow-md\`: 0 4px 6px -1px rgba(0,0,0,0.1)
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'VISUAL_TOKENS.md'), vt);

const ag = `# ACCESSIBILITY GUIDE
- **Contrast**: All text must pass WCAG AA (4.5:1).
- **Focus**: Visible \`outline-2\` on all interactive elements.
- **ARIA**: \`aria-live="polite"\` for filter updates.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'ACCESSIBILITY_GUIDE.md'), ag);

// --- API CONTRACTS ---
const ac = `# API CONTRACTS

## GET /api/v1/companies
- **Request**: \`?page=1&limit=20&q=text&industry=Pharma\`
- **Response**: \`{ success: true, data: { items: [...], pagination: {...} }, meta: {...} }\`
- **Errors**: 400 (Bad Request), 429 (Rate Limit).

## GET /api/v1/companies/:slug
- **Response**: Full aggregated Company object.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'API_CONTRACTS.md'), ac);

const om = `# OPENAPI MAPPING
- Standard OpenAPI 3.0 specification maps for all V1 endpoints.
- Base path: \`/api/v1\`
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'OPENAPI_MAPPING.md'), om);

const es = `# ERROR STANDARD
- **400**: \`{ success: false, error: { code: "VALIDATION_FAILED", message: "..." } }\`
- **404**: \`{ success: false, error: { code: "NOT_FOUND", message: "Entity not found." } }\`
- **429**: Rate limiting enforced by IP.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'ERROR_STANDARD.md'), es);

// --- DATABASE RULES ---
const dvr = `# DATABASE VALIDATION RULES
- **Company**: \`legalName\` and \`slug\` are REQUIRED. \`slug\` must be UNIQUE.
- **Drug**: \`rxNormId\` must be UNIQUE.
- **ClinicalTrial**: \`nctId\` must be UNIQUE.
- **Financial**: \`companyId\` + \`fiscalYear\` must be UNIQUE constraint.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'DATABASE_VALIDATION_RULES.md'), dvr);

const ev = `# ENTITY VALIDATION
- **Duplicate Detection**: Upsert logic blocks identical NCT IDs or CIKs.
- **Deletion Rules**: Soft delete ( \`status: 'DELETED'\` ) for Companies. Hard delete for orphaned relationship rows.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'ENTITY_VALIDATION.md'), ev);

// --- AGILE EXECUTION ---
const ib = `# IMPLEMENTATION BACKLOG

## Epics
1. **Design System Engine**: Build out \`VisualTokens\` and \`ComponentLibrary\`.
2. **Directory Omnisearch**: Implement the <100ms global search bar.
3. **Company Tear Sheet**: Overhaul the Profile UI.
4. **Data Grid Subsystem**: Build the Ag-Grid style tables for Trials/Products.
5. **Real-time Filters**: Faceted navigation.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'IMPLEMENTATION_BACKLOG.md'), ib);

const sep = `# SPRINT EXECUTION PLAN

- **Sprint 1 (Foundation)**: Core API Contracts, Database Validation, Visual Tokens CSS setup.
- **Sprint 2 (Components)**: Build all atomic React components (Badges, Buttons, Cards).
- **Sprint 3 (Directory Engine)**: Omnisearch, Infinite Scroll/Load More, Faceted Filters.
- **Sprint 4 (Company Intelligence)**: Profile Layouts, Tear Sheet, Relationship Graphs.
- **Sprint 5 (Polish & QA)**: E2E testing, Accessibility sweeps, Performance tuning.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'SPRINT_EXECUTION_PLAN.md'), sep);

const tm = `# TASK MATRIX
| Task | Epic | Dependency | Estimate | Priority | Risk |
|---|---|---|---|---|---|
| Configure CSS Tokens | 1 | None | 1d | High | Low |
| Build DataGrid Component | 1 | Tokens | 3d | High | Medium |
| Implement Search API | 2 | None | 2d | High | High (Latency) |
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'TASK_MATRIX.md'), tm);

console.log("Design System & Agile Docs Generated.");
