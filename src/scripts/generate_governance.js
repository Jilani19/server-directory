const fs = require('fs');
const path = require('path');

const outDir = "C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751";

function write(name, content) {
    fs.writeFileSync(path.join(outDir, name), content);
    console.log(`Generated ${name}`);
}

const governanceGuide = `# Governance Guide

This document establishes the strict lifecycle boundaries for all development tasks.

## 1. Definition of Ready (DoR)
Before a developer can move a task from \`BACKLOG\` to \`IN PROGRESS\`, the following MUST be true:
- **Business requirement approved**: Signed off by Product Owner.
- **Architecture reference identified**: Linked to the Architecture Freeze v1.0 docs.
- **Acceptance criteria defined**: Explicit pass/fail conditions.
- **Data source identified**: SOT mappings attached if applicable.
- **Test cases identified**: Edge cases explicitly documented.
- **API contract available**: Input/Output schema agreed upon.
- **UI reference available**: Figma / Wireframes attached for frontend tasks.

## 2. Definition of Done (DoD)
A task is NOT complete until all of the following are satisfied:
- **Code complete**: No \`TODO\` or \`FIXME\` comments remain.
- **Unit tests pass**: 80%+ coverage for new logic.
- **Integration tests pass**: Pipeline successfully builds.
- **API contract validated**: No breaking changes to existing clients.
- **No mock data**: Hardcoded values completely removed.
- **Provenance implemented**: Any new DB write includes the required Provenance Object.
- **Documentation updated**: \`README.md\` and Architecture docs sync with the changes.
- **Security reviewed**: No exposed secrets or vulnerable dependencies.
- **Performance checked**: N+1 query problems resolved.
- **Code review approved**: At least 1 approving review from a Lead Developer.
`;

const qualityGates = `# Quality Gates

Implementation progresses through 8 strict quality gates. A failure at any gate halts the release.

## Gate 1: Architecture
- **Required Evidence**: Link to Architecture Freeze v1.0 compliance.
- **Exit Criteria**: No domain boundaries violated.
- **Approval Authority**: Lead Architect.

## Gate 2: Schema
- **Required Evidence**: Prisma migration script.
- **Exit Criteria**: All foreign keys enforced; Composite indexes applied; Backwards compatibility maintained.
- **Approval Authority**: Database Admin / Tech Lead.

## Gate 3: Connectors
- **Required Evidence**: Successful mock-run of API responses.
- **Exit Criteria**: Rate limiter functioning; Circuit breaker triggering on 500s.
- **Approval Authority**: Integration Lead.

## Gate 4: Workers
- **Required Evidence**: Worker logs demonstrating DLQ routing on failure.
- **Exit Criteria**: Domain Logic correctly normalizes raw payloads.
- **Approval Authority**: Domain Lead.

## Gate 5: API
- **Required Evidence**: Postman/Jest contract tests passing.
- **Exit Criteria**: Endpoints strictly protected by RBAC; Sub-100ms latency.
- **Approval Authority**: API Lead.

## Gate 6: Frontend
- **Required Evidence**: Lighthouse score > 90.
- **Exit Criteria**: Zero mock arrays; graceful degradation on empty \`[]\` states.
- **Approval Authority**: Frontend Lead.

## Gate 7: Pilot Validation
- **Required Evidence**: 10 Golden Dataset companies processed.
- **Exit Criteria**: 100% match against expected Golden Database State.
- **Approval Authority**: Product Owner.

## Gate 8: Production Approval
- **Required Evidence**: Go-Live Checklist fully ticked.
- **Exit Criteria**: Infrastructure scaled to support 50,000 active syncs.
- **Approval Authority**: Engineering Director.
`;

const codeReviewChecklist = `# Code Review Checklist

Reviewers MUST check the following before hitting "Approve".

- [ ] **Architecture**: Does this change violate the Domain Boundaries?
- [ ] **Naming**: Are variables declarative? (e.g., \`fetchClinicalTrials\`, not \`getData\`).
- [ ] **Layer Violations**: Is there SQL/Prisma logic inside the API Controller? (Fail immediately if yes).
- [ ] **SOLID**: Does the class have a single responsibility?
- [ ] **DDD**: Do the entities match the Business Information Model?
- [ ] **Performance**: Are we fetching 10,000 rows into memory instead of paginating?
- [ ] **Security**: Are inputs sanitized via Zod? Are secrets hardcoded?
- [ ] **Logging**: Are errors swallowed? Or are they passed to the central Pino logger?
- [ ] **Error Handling**: Do custom errors (\`ApiError\`) extend the \`BaseError\`?
- [ ] **Testing**: Did the developer provide tests for the happy AND unhappy paths?
- [ ] **Documentation**: Are complex algorithms commented? Are JSDocs applied to public methods?
`;

const codingStandards = `# Coding Standards

## General Conventions
- **Naming Conventions**: \`camelCase\` for variables/functions, \`PascalCase\` for Classes/Types/Interfaces, \`UPPER_SNAKE_CASE\` for constants.
- **Folder Conventions**: Grouped by Feature/Domain (e.g., \`src/domains/clinical\`), NOT by technical type (\`src/controllers\`).

## Layer Rules
- **DTO Rules**: All inputs from the Frontend or External APIs MUST pass through a Zod DTO schema before reaching the Service layer.
- **Entity Rules**: Entities are plain TS objects representing the domain, decoupled from Prisma.
- **Repository Rules**: The ONLY place where \`prisma.\$query\` is allowed. Returns standard Entities, not Prisma-specific types.
- **Service Rules**: Where business logic lives. Cannot directly import Prisma. Injects Repositories.
- **Controller Rules**: Maps HTTP Requests to Service inputs. Maps Service outputs to HTTP Responses. Maximum 10 lines of code.
- **Worker Rules**: Abstracted from HTTP. Reads from Queue, calls Services, returns Ack/Nack.
- **Connector Rules**: "Dumb Pipes". Handles fetch and auth. Cannot perform alias resolution or domain logic.

## Performance Standards
- **API Latency**: Standard APIs < 100ms. Search APIs < 50ms.
- **Worker Throughput**: Minimum 500 records processed per minute per node.
- **Database Response**: All queries indexed. Longest query < 200ms.
- **Memory/CPU**: Workers capped at 512MB RAM; horizontal scaling preferred over vertical scaling.
`;

const documentationStandard = `# Documentation Standard

Every domain module (e.g., \`src/domains/clinical\`) MUST contain a \`README.md\` detailing:

1. **Architecture**: How the module interacts with other domains.
2. **Data Sources**: Which external connectors it relies on (e.g., ClinicalTrials.gov).
3. **Events**: The list of Kafka/Redis events this module Emits and Consumes.
4. **Examples**: Code snippets demonstrating how to instantiate the Service.
5. **API Docs**: Swagger/OpenAPI links for its exposed endpoints.
6. **Testing Notes**: Specifics on how to mock the module's dependencies.
7. **Known Limitations**: E.g., "The API rate limit restricts this module to 1 sync per second."
`;

const releaseProcess = `# Release Process

## Branch Strategy
- **Git Flow**: Strictly enforced.
- **Feature Branches**: \`feature/TICKET-123-description\`
- **Hotfix Branches**: \`hotfix/TICKET-911-crash\`
- **Release Branches**: \`release/v1.2.0\`

## Tagging & Versioning
- Semantic Versioning (SemVer: \`MAJOR.MINOR.PATCH\`).
- Tags generated automatically upon merge to \`main\`.

## Release Governance
1. **Alpha**: Merged to \`develop\`. Nightly builds. Ephemeral DB.
2. **Beta**: Promoted to \`qa\`. Tested against the Golden Dataset.
3. **Release Candidate (RC)**: Promoted to \`staging\`. Product Owner sign-off.
4. **General Availability (GA)**: Promoted to \`production\`. Blue/Green flip.

## Rollback Policy
If error rates spike >2% post-deployment, the Load Balancer instantly reverts traffic to the Blue (previous) environment. Database migrations must be backwards compatible to support this.
`;

const implementationPolicy = `# Implementation Policy

This policy is the ultimate law of the codebase. Violations will result in immediate PR rejection.

## The 4 Immutable Laws
1. **No developer may bypass provenance**: Every single piece of data written to the database MUST carry its source, confidence score, and timestamp.
2. **No developer may bypass validation**: All data entering the system (from UI or APIs) MUST pass through strict schema validation (Zod).
3. **No developer may bypass module ownership**: Module A cannot directly update a database row owned by Module B. It must use an Event or Module B's Service API.
4. **No developer may bypass architecture boundaries**: The UI cannot call the Database. Controllers cannot hold business logic.

## Architecture Impact Review
Any proposed change that modifies the Prisma schema, adds a new external API, or changes the Event Catalog requires a formal Architecture Impact Review (AIR) signed off by the Lead Architect.
`;

const projectPlaybook = `# Project Playbook

The overarching guide linking the Governance, Security, and Observability of the platform.

## Security Standards
- **Secrets**: Managed via HashiCorp Vault / AWS Secrets Manager.
- **Authentication (JWT)**: Asymmetric signing (RS256). 15-minute expiry.
- **RBAC**: Strict role enforcement via middleware.
- **Audit Logs**: Every mutation recorded immutably.
- **Encryption**: AES-256 for data at rest. TLS 1.3 for data in transit.
- **Dependency Scanning**: Snyk/Dependabot runs on every PR.
- **SAST / DAST**: Static and Dynamic security testing integrated into the CI/CD pipeline.

## Observability Standards
- **Metrics**: Prometheus pulling custom worker metrics (Queue Depth, Sync Velocity).
- **Tracing**: OpenTelemetry (Jaeger/Zipkin) spanning requests from UI -> API -> Worker -> DB.
- **Logging**: Pino JSON structured logging with Correlation IDs.
- **Alerts**: PagerDuty routed for 5xx spikes or DLQ overflows.
- **Health Checks**: \`/healthz\` endpoints on every microservice verifying DB and Redis connectivity.

## Conclusion
This Governance Framework, combined with the Architecture Freeze v1.0, serves as the complete, uncompromising blueprint for the execution of the Life Sciences Company Intelligence Platform. 

**SPRINT 1 MAY NOW COMMENCE.**
`;

write('GOVERNANCE_GUIDE.md', governanceGuide);
write('QUALITY_GATES.md', qualityGates);
write('CODE_REVIEW_CHECKLIST.md', codeReviewChecklist);
write('CODING_STANDARDS.md', codingStandards);
write('DOCUMENTATION_STANDARD.md', documentationStandard);
write('RELEASE_PROCESS.md', releaseProcess);
write('IMPLEMENTATION_POLICY.md', implementationPolicy);
write('PROJECT_PLAYBOOK.md', projectPlaybook);
