const fs = require('fs');
const path = require('path');

const outDir = "C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751";

function write(name, content) {
    fs.writeFileSync(path.join(outDir, name), content);
    console.log(`Generated ${name}`);
}

const executionBlueprint = `# Execution Blueprint

## Architecture Principles
1. **Design Principles**: Domain-Driven Design (DDD). The business domain dictates the software architecture, not the database.
2. **Coding Principles**: SOLID, DRY, and strict typings across all interfaces.
3. **Layer Responsibilities**:
   - *API/Transport Layer*: Handles HTTP routing, rate limiting, and input validation.
   - *Service Layer*: Contains core business logic and cross-module orchestration.
   - *Data Access Layer (Repository)*: Abstracts Prisma/PostgreSQL specifics.
4. **Separation of Concerns**: Connectors fetch data, Workers process data, Orchestrators schedule jobs, Services serve the frontend.
5. **Dependency Rules**: Inner layers (Business Logic) NEVER depend on outer layers (HTTP Transport, Database ORM). Dependencies always point inwards.
6. **Domain Boundaries**: Hard boundaries. A module cannot directly update a table owned by another module.

## Monorepo Structure
\`\`\`
/apps
  /directory-client  (Next.js React Frontend)
  /directory-server  (Express.js Backend API)
/packages
  /core-types        (Shared TS definitions)
  /ontology          (Standardized dictionaries)
/workers             (Background Sync Workers)
/connectors          (External API integrations)
/shared              (Utilities, Logging, Config)
/configs             (Docker, CI/CD, ESLint)
/docs                (System Architecture Blueprints)
/scripts             (CLI tooling, DB hydration)
/tests               (Unit, E2E, Contract)
/deployment          (K8s manifests, Terraform)
\`\`\`
`;

const moduleBoundaryGuide = `# Module Boundary Guide

Strict domain responsibilities to prevent monolithic coupling.

- **Identity**: Root entity management. Owns LEI, CIK, Company UUIDs.
- **Corporate**: Legal structures, parent/subsidiary hierarchies.
- **Leadership**: Board members, executives, governance structures.
- **Products**: Commercialized assets, NDC/RxNorm mapping.
- **Pipeline**: Investigational assets, clinical phase transitions.
- **Clinical**: Trial registries (NCT), endpoints, statuses.
- **Research**: R&D focus areas, therapeutic priorities.
- **Publication**: Literature authorship, DOIs.
- **Patent**: IP, patent families, expiry tracking.
- **Manufacturing**: Supply chain, capabilities, facility certifications.
- **Facilities**: Physical geography, sites, coordinates.
- **Financial**: Revenue, market cap, funding rounds.
- **Regulatory**: FDA/EMA approvals, warning letters, enforcement actions.
- **News**: Press releases, RSS ingestion, media mentions.
- **Contacts**: Corporate communication, key personnel emails/phones.
- **Digital Presence**: Websites, social media, career portals.
- **AI**: NLP synthesis, SWOT generation, insight extraction.
- **Search**: Elasticsearch/Typesense indexing and query parsing.
- **Analytics**: Aggregated metrics, completeness scoring.
- **Administration**: User management, RBAC, platform configurations.
`;

const serviceContracts = `# Service Contracts

Every module defines a strict input/output contract.

## Example: Clinical Module Contract

- **Owned Entities**: \`ClinicalTrial\`, \`TrialSite\`, \`TrialInvestigator\`
- **Dependencies**: \`Identity Module\` (for Company ID validation), \`Ontology Module\` (for Disease/Drug mapping).
- **Inputs**: \`TrialId\`, \`SponsorId\`, \`StatusUpdatePayload\`
- **Outputs**: \`NormalizedTrialObject\`
- **Events Emitted**: \`ClinicalTrialUpdated\`, \`ClinicalTrialCompleted\`
- **Events Consumed**: \`CompanyCreated\`, \`OntologyTermDeprecated\`

## Example: Products Module Contract

- **Owned Entities**: \`Product\`, \`Approval\`, \`Package\`
- **Dependencies**: \`Identity Module\`, \`Ontology Module\`
- **Inputs**: \`ProductId\`, \`ApprovalPayload\`
- **Outputs**: \`NormalizedProductObject\`
- **Events Emitted**: \`ProductApproved\`, \`ProductRecalled\`
- **Events Consumed**: \`CompanyAcquired\`
`;

const eventCatalog = `# Event Catalog

The nervous system of the platform. Modules communicate asynchronously via an Event Bus (e.g., Kafka / Redis PubSub).

## Core Entity Events
- \`CompanyCreated\`: Fired when a new baseline company identity is established.
- \`CompanyUpdated\`: Fired when core identity fields mutate.
- \`CompanyMerged\`: Fired during M&A alias resolution.

## Domain Events
- \`ProductAdded\`: Triggers Search indexing.
- \`ProductStatusChanged\`: Triggers AI Insight recalculation.
- \`ClinicalTrialUpdated\`: Triggers notification engines.
- \`PatentExpired\`: Triggers Risk Intelligence flag.
- \`NewsPublished\`: Triggers AI summarization.
- \`FacilityUpdated\`: Triggers Map coordinate refresh.

## Orchestration Events
- \`SyncStarted\`: Marks the beginning of a worker batch.
- \`SyncCompleted\`: Marks the end, triggering Completeness Score recalculation.
- \`SyncFailed\`: Routes failure logs to the Dead Letter Queue.
- \`RateLimitBreached\`: Instructs Orchestrator to pause specific connectors.
`;

const apiStrategy = `# API Strategy

## 1. REST (Core System)
Strict, resource-based JSON APIs over HTTPS. The backbone of the frontend-backend communication. Versioned at \`/api/v1/\`.

## 2. GraphQL (Future-Proofing)
Planned for complex, deep-relational client queries where a user wants a Company, its 50 Products, and those Products' associated Clinical Trials in a single network roundtrip without over-fetching.

## 3. Search API
Dedicated high-performance endpoint proxying directly to the Search Engine (Elasticsearch/Typesense). Optimized for sub-50ms autocomplete and faceting.

## 4. Bulk API
Optimized for data export. Bypasses standard JSON serialization in favor of NDJSON or streaming CSVs for data scientists extracting 50k rows.

## 5. Internal APIs
Worker-to-Server communication. Bypasses public rate limits. Secured via VPC peering and internal JWT tokens.

## 6. Public APIs
External-facing API for commercial partners. Strictly rate-limited, strictly monitored, tiered access based on API Keys.

## 7. Admin APIs
Restricted endpoints for triggering Manual Syncs, managing DLQs, and overriding data confidence scores.

## 8. Sync APIs
Webhook receivers to accept pushed events from external platforms (e.g., RSS, automated government dumps).
`;

const databaseOwnership = `# Database Ownership Matrix

To prevent data corruption, every database table is exclusively owned by a single domain module.

## Ownership Rules
1. A module has **Write/Update/Delete** authority over its owned tables.
2. If Module A needs to update a table owned by Module B, it MUST call Module B's Service Contract API or emit an Event. Module A cannot write directly to Module B's table.

## Alignments
- **Identity Module** -> \`Company\`, \`CompanyAlias\`
- **Clinical Module** -> \`ClinicalTrial\`, \`TrialEndpoint\`
- **Products Module** -> \`Drug\`, \`Device\`, \`Approval\`
- **Regulatory Module** -> \`WarningLetter\`, \`Inspection\`
- **Financial Module** -> \`Revenue\`, \`FundingRound\`
- **Search Module** -> (No transactional tables. Owns the ES Index)
- **AI Module** -> \`CompanyInsight\`, \`RiskScore\`
`;

const securityArchitecture = `# Security Architecture

## 1. Authentication
- **User Facing**: OAuth 2.0 / OpenID Connect (e.g., Auth0 / Clerk).
- **Service Facing**: Short-lived, asymmetric JWTs for inter-worker communication.

## 2. Authorization & RBAC
- Role-Based Access Control enforced at the API Gateway and Controller levels.
- Roles: \`Guest\`, \`Subscriber\`, \`DataScientist\`, \`Admin\`, \`SuperAdmin\`.

## 3. Audit Logs
- Every mutation (Create, Update, Delete) is logged to an immutable Audit Table tracking \`UserId\`, \`Timestamp\`, \`Action\`, \`OldState\`, \`NewState\`.

## 4. Secrets Management
- All API keys (SEC, OpenFDA, Commercial APIs) stored in AWS Secrets Manager / HashiCorp Vault. Never in \`.env\` files on disk.

## 5. Rate Limiting
- Public API: IP-based sliding window (100 req/min).
- Private API: Token-based leaky bucket.

## 6. Data Validation & Sanitization
- Strict Zod/Joi schemas on ALL incoming HTTP payloads.
- HTML sanitization (DOMPurify) on all user-submitted text to prevent XSS.
- Parameterized SQL (via Prisma) to prevent SQL Injection.
`;

const testingStrategy = `# Testing Strategy

## 1. Unit Testing (Jest/Vitest)
Testing pure functions, parsers, and isolated business logic. No database connections. High coverage mandate (80%+).

## 2. Integration Testing
Testing Service layer against an ephemeral test database (Testcontainers). Validating Prisma queries and cascading deletes.

## 3. End-to-End (E2E) Testing (Playwright/Cypress)
Testing user journeys from the browser, through the API, to the database. (e.g., Search -> Click Company -> View Products).

## 4. Contract Testing
Ensuring that changes to the Internal API do not break the specific Connectors or Workers consuming it.

## 5. Sync Validation
Mocking the external FDA/SEC APIs using \`nock\` or \`msw\`, running the Sync Orchestrator, and validating that the database is populated correctly without touching the real internet.

## 6. Golden Dataset Validation
A static, mathematically perfect snapshot of 5 companies. After any major refactor, the platform must process these 5 companies and produce a database state completely identical (checksummed) to the "Golden" state.

## 7. Performance & Load (k6)
Simulating 1,000 concurrent users hitting the Search and Directory endpoints to validate caching and index speed.
`;

const deploymentGuide = `# Deployment Strategy

## 1. Environments
- **Development**: Ephemeral environments per PR.
- **QA**: Integration environment for automated tests and Golden Dataset Validation.
- **Staging**: Production mirror. Golden DB replica. Final sign-off.
- **Production**: Live cluster.

## 2. CI/CD Pipeline
- GitHub Actions orchestrates Lint -> Test -> Build -> Docker Push -> Helm Upgrade.

## 3. Rollout Strategy
- **Blue/Green Deployment**: Zero-downtime routing. New version spins up alongside old. Traffic flips instantly at the Load Balancer layer.
- **Rollback**: Instant traffic routing back to Blue if Green fails health checks.

## 4. Database Migration Strategy
- Prisma migrations are strictly versioned.
- Migrations MUST be backwards compatible. (e.g., Do not rename a column in one step. Add new column -> Sync -> Remove old column).
- Migrations run automatically during the CI/CD pipeline prior to the Blue/Green flip.

## 5. Feature Flags
- New UI components or massive Sync Architectures are deployed behind Feature Flags (e.g., LaunchDarkly), allowing code to merge to \`main\` immediately without exposing unfinished work to end-users.
`;

const architectureFreeze = `# ARCHITECTURE FREEZE MANIFEST v1.0

Date: ${new Date().toISOString()}

By issuance of this document, the System Architecture, Information Models, Data Provenance Strategies, and Execution Blueprints are officially **FROZEN at Version 1.0**.

## Included in this Freeze:

1. **Business Blueprint**
   - COMPANY_INFORMATION_ARCHITECTURE.md
   - BUSINESS_INFORMATION_MODEL.md
   - SECTION_DEFINITION_GUIDE.md
   - MASTER_FIELD_CATALOG.md

2. **Source of Truth Rules**
   - DATA_SOURCE_CATALOG.md
   - SOURCE_PRIORITY_MATRIX.md
   - CONFLICT_RESOLUTION_POLICY.md
   - PROVENANCE_STANDARD.md

3. **Synchronization Engineering**
   - SYNC_ARCHITECTURE.md
   - WORKER_ARCHITECTURE.md
   - CONNECTOR_ARCHITECTURE.md

4. **Execution Parameters**
   - EXECUTION_BLUEPRINT.md
   - DATABASE_OWNERSHIP.md
   - API_STRATEGY.md
   - SECURITY_ARCHITECTURE.md

## Post-Freeze Protocol
1. Implementation of v1.0 may now commence exactly as specified.
2. Any deviation, new requirement, or modification to the schemas, event catalogs, or domain boundaries requires a formal v1.1 Architecture Upgrade Proposal.
3. No rogue tables, orphaned cron jobs, or undocumented APIs are permitted.

**Status: READY FOR IMPLEMENTATION**
`;

write('EXECUTION_BLUEPRINT.md', executionBlueprint);
write('MODULE_BOUNDARY_GUIDE.md', moduleBoundaryGuide);
write('SERVICE_CONTRACTS.md', serviceContracts);
write('EVENT_CATALOG.md', eventCatalog);
write('API_STRATEGY.md', apiStrategy);
write('DATABASE_OWNERSHIP.md', databaseOwnership);
write('SECURITY_ARCHITECTURE.md', securityArchitecture);
write('TESTING_STRATEGY.md', testingStrategy);
write('DEPLOYMENT_GUIDE.md', deploymentGuide);
write('ARCHITECTURE_FREEZE_v1.0.md', architectureFreeze);
