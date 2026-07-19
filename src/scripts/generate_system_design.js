const fs = require('fs');
const path = require('path');

const outDir = "C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751";

function write(name, content) {
    fs.writeFileSync(path.join(outDir, name), content);
    console.log(`Generated ${name}`);
}

const syncArchitecture = `# Master Synchronization Architecture

## Core Philosophy
The platform must support 500 companies today and 50,000 tomorrow. To achieve this, the synchronization architecture is fully decoupled, event-driven, and highly resilient.

## Master Sync Engine
The Master Orchestrator acts as the central brain. It does not parse or fetch data; it routes traffic and manages state.

### Core Components
1. **Scheduler**: Triggers cron-based jobs (Hourly, Daily, Weekly) based on the Data Refresh Policy.
2. **Company Queue**: The list of companies targeted for synchronization in the current batch.
3. **Job Queue**: The active list of tasks dispatched to workers (e.g., "Fetch Clinical Trials for Company ID: 123").
4. **Retry Queue**: Temporary hold for jobs that failed due to transient errors (e.g., 429 Too Many Requests). Applies exponential backoff.
5. **Dead Letter Queue (DLQ)**: Final destination for jobs that exhausted all retries or failed due to fatal errors (e.g., 404, Bad JSON).
6. **Priority Queue**: Fast-lane queue for Manual Sync requests triggered by users/admins via the UI.

## Sync Modes
- **Full Sync**: Evaluates the entire Company Graph from zero. Exhaustive, high compute.
- **Incremental Sync**: Fetches only endpoints that support \`since\` parameters, or only fields with expired TTLs.
- **Manual Sync**: High-priority override triggered by humans. Ignores TTLs and bypasses standard limits.

## The State Machine
A Company Sync Job transitions through:
\`QUEUED\` -> \`DISPATCHED\` -> \`PROCESSING\` -> \`VALIDATING\` -> \`RESOLVING\` -> \`COMPLETED\` / \`FAILED\`
`;

const workerArchitecture = `# Domain Worker Architecture

## Principle
Workers are designed by BUSINESS DOMAIN, not by database table or API source. A worker's job is to fulfill a complete business narrative for a company by orchestrating multiple connectors.

## Domain Worker Roster

1. **Identity Worker**: Responsible for Name, CIK, LEI, Founded Year. Uses SEC, GLEIF, Website.
2. **Corporate Worker**: Responsible for M&A, Subsidiaries, Headquarters. 
3. **Leadership Worker**: Responsible for Executives, Board. Uses Website, SEC, Commercial APIs.
4. **Products Worker**: Responsible for Marketed Assets. Uses OpenFDA, RxNorm, DailyMed.
5. **Pipeline Worker**: Responsible for Investigational Assets.
6. **Clinical Worker**: Responsible for Human Trials. Uses ClinicalTrials.gov, EudraCT.
7. **Research Worker**: Responsible for Focus Areas.
8. **Publication Worker**: Responsible for Literature. Uses PubMed, CrossRef, EuropePMC.
9. **Patent Worker**: Responsible for IP. Uses USPTO, WIPO, EPO.
10. **Facility Worker**: Responsible for Footprint.
11. **Financial Worker**: Responsible for Revenue, Market Cap.
12. **News Worker**: Responsible for PR, RSS.
13. **Regulatory Worker**: Responsible for Warning Letters, Approvals. Uses FDA, EMA, MHRA.
14. **AI Insight Worker**: Responsible for NLP generation.
15. **Contact Worker**: Responsible for Emails, Phones.
16. **Digital Presence Worker**: Responsible for Socials, Careers.

## Contract
Every Domain Worker MUST output an array of standard \`NormalizedObjects\` wrapped in \`ProvenanceObjects\`, passing them back to the Master Orchestrator, completely agnostic of how the database saves them.
`;

const connectorArchitecture = `# Source Connector Architecture

## Principle
A Connector is a dumb pipe. It knows exactly one external source. It handles authentication, rate limiting, and raw fetching. It does NOT understand "Companies" or "Products". It understands URLs, Headers, and JSON.

## Core Capabilities
- **Authentication**: Managing API keys, OAuth tokens, cookies.
- **Rate Limiting**: Native throttling (e.g., 2 requests per second). Halts gracefully to avoid IP bans.
- **Circuit Breaking**: If an API returns >50% 5xx errors, the connector opens the circuit and alerts the Orchestrator to route traffic to secondary sources.
- **Pagination Handling**: Abstracting \`nextPage\` tokens into a continuous stream.

## Connector Inventory
### Government
- \`openfda_connector\`
- \`clinicaltrials_connector\`
- \`sec_edgar_connector\`
- \`uspto_connector\`
- \`fda_connector\` (Manual/Scrape)
- \`ema_connector\`
- \`mhra_connector\`
- \`pmda_connector\`
- \`cdsco_connector\`

### Scientific
- \`pubmed_connector\`
- \`crossref_connector\`
- \`europepmc_connector\`

### Commercial & Public
- \`gleif_connector\`
- \`rss_connector\`
- \`website_spider_connector\`

## Example Flow
\`Products Worker\` calls \`openfda_connector.fetch(companyAlias)\`
The connector manages the HTTP request, handles the 429 backoff, and returns a raw JSON payload to the worker.
`;

const pipelineDesign = `# Storage Pipeline Design

The journey from a raw HTTP response to a visible pixel on the frontend.

## The Pipeline

### 1. Raw Response
The \`Connector\` receives raw JSON, XML, or HTML.

### 2. Parser
The \`Domain Worker\` parses the raw data into flat variables.

### 3. Normalization (Ontology Layer)
- **Alias Resolution**: "J&J" -> "Johnson & Johnson".
- **Canonical IDs**: Mapping custom IDs to standard CUI / NCT IDs.
- **Country Normalization**: "United States", "USA", "U.S." -> "US".
- **Scientific Normalization**: Mapping Drugs, Diseases, Targets to universal taxonomies.

### 4. Validation
Testing against schema rules (e.g., is Phase a valid Enum?).

### 5. Conflict Resolution
Comparing the new Normalized Object against the database using the \`SOURCE_PRIORITY_MATRIX.md\`.

### 6. Provenance
Wrapping the surviving data point in the mandatory Provenance JSON schema.

### 7. Storage
Upserting the clean data into the transactional Database (Prisma/PostgreSQL).

### 8. Search Index
Emitting an event to update the Elasticsearch / Typesense cluster.

### 9. Delivery
Frontend requests data via the optimized API layer, retrieving a fully resolved, conflict-free, highly structured graph.
`;

const validationArchitecture = `# Validation & Scoring Architecture

Before storage, all data passes through a stringent validation and scoring gateway.

## Validation Gates

1. **Field Validation**: Type safety. Ensure Dates are ISO8601, URLs are valid, Arrays are well-formed.
2. **Relationship Validation**: Ensuring Foreign Keys exist. You cannot insert a \`Clinical Trial\` pointing to a \`Disease\` if the \`Disease\` node does not exist in the Global Taxonomy.
3. **Duplicate Detection**: Fuzzy matching titles, checking exact ID overlap (NCT ID, Patent Number).

## Scoring Engine

After validation, the system calculates metrics:

1. **Completeness Score**: Percentage of [REQ] fields populated for the Company.
   - *Example*: 80/100 required fields = 80%.
2. **Confidence Score**: The weighted average of the Provenance Confidence across all populated fields.
   - *Example*: 90% derived from Tier 1 sources = High Confidence.
3. **Quality Score**: Completeness * Confidence.

## The Rejection Protocol
If data fails Field or Relationship validation, the payload is dumped to the Dead Letter Queue, an Alert is fired, and the database transaction is rolled back.
`;

const observabilityArchitecture = `# Observability & Monitoring Architecture

Operating 50,000 companies requires deep visibility into the synchronization engine.

## 1. Metrics & Telemetry
Collected via Prometheus/Datadog:
- **API Usage**: Requests per minute, per connector.
- **Success Rate**: 200 OK vs 4xx vs 5xx counts.
- **Sync Velocity**: Companies processed per hour.
- **Coverage Metrics**: Average Completeness Score across the platform.

## 2. Structured Logging
JSON-formatted logs capturing:
- Correlation IDs (to trace a single sync job across Orchestrator -> Worker -> Connector).
- Error Stack Traces.
- Warning outputs for AI-overrides.

## 3. Dashboards
### Worker Dashboard
- Queue depth (Active, Waiting, Delayed).
- Dead Letter Queue size.
- Worker memory/CPU utilization.

### Sync Dashboard
- Company-by-company progression tracking (e.g., AbbVie: 85% Complete).
- Global API rate limit consumption.

## 4. Alerting
Slack / PagerDuty triggers for:
- Dead Letter Queue > 100 items.
- Connector Failure Rate > 5%.
- Sync Engine Stalled.
`;

const scalabilityPlan = `# Scalability & Expansion Plan

Designing for the transition from 500 to 50,000+ companies.

## 1. Distributed Workers
The architecture transitions from an in-memory Node.js loop to distributed microservices. Workers will be deployed as containerized pods (Kubernetes) capable of scaling horizontally based on Queue Depth.

## 2. Robust Message Brokers
The current \`SyncOrchestratorFast\` will be replaced by an enterprise message broker:
- **RabbitMQ / Kafka** or **AWS SQS / BullMQ** (Redis).
- Guarantees message delivery, enables massive parallelization, and provides persistent queues.

## 3. Incremental Event-Driven Architecture
Polling 50,000 companies daily is inefficient. 
Future states will heavily rely on:
- Webhooks from SEC / FDA (where available).
- RSS stream parsing.
- Database trigger alerts.
The Orchestrator will fire single-field updates rather than full-company syncs.

## 4. Rate Limit Pooling
For highly restricted APIs, the platform will utilize rotating proxy pools and distributed API keys managed by a central \`RateLimitController\` to maximize throughput without breaching Terms of Service.
`;

write('SYNC_ARCHITECTURE.md', syncArchitecture);
write('WORKER_ARCHITECTURE.md', workerArchitecture);
write('CONNECTOR_ARCHITECTURE.md', connectorArchitecture);
write('PIPELINE_DESIGN.md', pipelineDesign);
write('VALIDATION_ARCHITECTURE.md', validationArchitecture);
write('OBSERVABILITY_ARCHITECTURE.md', observabilityArchitecture);
write('SCALABILITY_PLAN.md', scalabilityPlan);
