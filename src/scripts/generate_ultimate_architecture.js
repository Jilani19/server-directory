const fs = require('fs');
const path = require('path');

const outDir = "C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751";

function write(name, content) {
    fs.writeFileSync(path.join(outDir, name), content);
    console.log(`Generated ${name}`);
}

const companyInfoArch = `# Company Information Architecture

## Vision
The Ultimate Life Sciences Company Intelligence Platform. A completely unified, graph-oriented, highly scalable ontology mapping every facet of a life science organization—from corporate identity to molecular targets, from financial health to clinical pipeline velocity.

## Core Pillars of the Architecture
1. **Entity-First Design**: A company is not just a row in a table; it is a node in a vast industry graph. Drugs, Diseases, Patents, and People are all distinct nodes with relationships to the Company.
2. **Infinite Scalability**: Built to scale from 500 to 50,000+ companies without degradation.
3. **Multi-Source Provenance**: Every data point retains an immutable origin trail (Verified, AI-Generated, Public, Official).
4. **Graph Traversability**: Enabling complex queries (e.g., "Find all companies manufacturing solid dosage forms for oncology with a market cap under $1B that have active phase III trials targeting HER2").

## Macro Modules
- **Foundation**: Identity, Corporate Structure, Locations, Digital Presence
- **Science & IP**: Research, Publications, Patents, Technology Platforms, Targets
- **Clinical & Regulatory**: Pipeline, Clinical Trials, Regulatory Affairs, Quality
- **Commercial**: Products, Manufacturing, Supply Chain
- **Ecosystem**: Competitors, Partnerships, M&A, Investors
- **Market & Risk**: Financials, ESG, Risk Intelligence, News, AI Insights
`;

const sectionDefinition = `# Section Definition Guide

## 1. Identity & Corporate Overview
- **Purpose**: Establishes the canonical identity and high-level narrative.
- **Description**: Official names, identifiers, mission, and historical background.
- **Why it exists**: To uniquely identify the entity globally across all datasets.
- **User value**: Immediate recognition and high-level understanding of the company.
- **Business value**: Deduplication core; anchor for all billing and CRM operations.

## 2. Leadership & Governance
- **Purpose**: Maps the human capital steering the company.
- **Description**: Board members, C-suite executives, and key decision-makers.
- **Why it exists**: Corporate direction is heavily influenced by leadership pedigree.
- **User value**: Assessing management quality and finding networking vectors.
- **Business value**: Essential for sales targeting and executive search firms.

## 3. Marketed Products
- **Purpose**: Catalogs commercialized assets.
- **Description**: Approved drugs, biologicals, devices, and digital therapeutics currently generating revenue.
- **Why it exists**: Products are the primary valuation driver.
- **User value**: Understanding the current market footprint and portfolio diversification.
- **Business value**: Competitive intelligence and market share analysis.

## 4. R&D Pipeline
- **Purpose**: Tracks future revenue potential.
- **Description**: Investigational assets progressing through preclinical and clinical phases.
- **Why it exists**: The pipeline represents the company's future value.
- **User value**: Identifying investment opportunities or partnership gaps.
- **Business value**: Drives M&A targeting and licensing deals.

## 5. Clinical Trials
- **Purpose**: Details human testing operations.
- **Description**: Ongoing, completed, and terminated clinical studies.
- **Why it exists**: Clinical validation is the ultimate hurdle in life sciences.
- **User value**: Tracking specific trial statuses, enrollment, and endpoints.
- **Business value**: CRO targeting, site selection, and risk assessment.

## 6. Manufacturing & Supply Chain
- **Purpose**: Maps production capabilities.
- **Description**: API manufacturing, fill/finish, packaging, and logistics.
- **Why it exists**: Supply chain resilience is a critical operational metric.
- **User value**: Finding CDMO partners or assessing supply risks.
- **Business value**: CDMO lead generation, vendor qualification.

## 7. Intellectual Property (Patents)
- **Purpose**: Defines the moat.
- **Description**: Patent families, filings, grants, and expiries.
- **Why it exists**: IP monopolies dictate drug pricing and exclusivity timelines.
- **User value**: Predicting patent cliffs and generic entry timelines.
- **Business value**: IP litigation tracking, generic strategy planning.

## 8. Regulatory & Quality
- **Purpose**: Monitors compliance health.
- **Description**: FDA warnings, inspections (483s), EMA approvals, recalls.
- **Why it exists**: Regulatory actions can halt operations overnight.
- **User value**: Assessing compliance risk before partnerships.
- **Business value**: Risk intelligence and insurance underwriting.

## 9. Financial Health & Investors
- **Purpose**: Tracks capital and valuation.
- **Description**: Revenue, funding rounds, cap tables, public market metrics.
- **Why it exists**: Capital dictates operational runway.
- **User value**: Investment analysis and financial stability checks.
- **Business value**: VC/PE deal sourcing.

## 10. AI Insights & Risk Intelligence
- **Purpose**: Synthesizes structured data into actionable intelligence.
- **Description**: Automated SWOT, sentiment analysis, predictive risk scores.
- **Why it exists**: Humans cannot manually process millions of data points.
- **User value**: Immediate answers to complex strategic questions.
- **Business value**: Premium tier differentiator.
`;

const fieldCatalog = `# Master Field Catalog

*Classification Key: [REQ] Required, [OPT] Optional, [CMP] Computed, [AI] AI Generated, [VER] Verified, [EXT] External API, [MAN] Manual*

## Identity & Corporate
- Legal Name [REQ][VER][EXT]
- Doing Business As (DBA) [OPT][EXT]
- Former Names [OPT][EXT]
- Legal Entity Identifier (LEI) [OPT][EXT]
- CIK Number [OPT][EXT]
- DUNS Number [OPT][EXT]
- Global Location Number (GLN) [OPT][EXT]
- Year Founded [OPT][VER]
- Company Status (Active, Defunct, Acquired) [REQ][CMP]
- Business Model (B2B, B2C, Hybrid) [OPT][AI]
- Primary Industry Segment [REQ][CMP]
- Short Description [REQ][AI]
- Long Description [OPT][EXT]

## Marketed Products
- Product Name (Trade Name) [REQ][VER]
- Generic/Scientific Name [REQ][EXT]
- Active Pharmaceutical Ingredient (API) [REQ][EXT]
- Molecule Structure/Sequence [OPT][EXT]
- Drug Class/Pharmacologic Class [REQ][CMP]
- Route of Administration [REQ][EXT]
- Dosage Form (Tablet, Injection, etc.) [REQ][EXT]
- Strength/Concentration [REQ][EXT]
- ATC Code [OPT][EXT]
- RxNorm Concept Unique Identifier (RXCUI) [OPT][EXT]
- National Drug Code (NDC) [OPT][EXT]
- Regulatory Application Number (NDA/ANDA/BLA) [OPT][EXT]
- Initial Approval Date [REQ][VER]
- Approval Agency (FDA, EMA, etc.) [REQ][EXT]
- Orphan Drug Designation [OPT][EXT]
- Biosimilar Status [OPT][EXT]
- Black Box Warnings [OPT][EXT]
- Primary Indication [REQ][CMP]
- Marketing Status (Prescription, OTC) [REQ][EXT]
- Patent Expiration Target [OPT][CMP]

## Clinical Trials
- Trial Identifier (NCT ID, EudraCT) [REQ][EXT]
- Official Title [REQ][EXT]
- Brief Title [OPT][EXT]
- Phase (I, II, III, IV, N/A) [REQ][EXT]
- Study Type (Interventional, Observational) [REQ][EXT]
- Overall Status (Recruiting, Completed, Terminated) [REQ][EXT]
- Study Design (Allocation, Intervention Model, Masking) [OPT][EXT]
- Primary Endpoint [OPT][EXT]
- Target Enrollment [OPT][EXT]
- Actual Enrollment [OPT][EXT]
- Start Date [REQ][EXT]
- Primary Completion Date [OPT][EXT]
- Investigational Asset (Linked Product/Molecule) [REQ][CMP]
- Target Indication/Disease [REQ][EXT]

## Manufacturing & Facilities
- Facility Name [REQ][VER]
- Facility Type (R&D, HQ, API Mfg, Fill/Finish) [REQ][CMP]
- Address Line 1 [REQ][EXT]
- City [REQ][EXT]
- State/Region [OPT][EXT]
- Country [REQ][EXT]
- Postal Code [OPT][EXT]
- GPS Coordinates (Lat/Long) [OPT][CMP]
- GMP Certification Status [OPT][EXT]
- FDA Establishment Identifier (FEI) [OPT][EXT]
- Production Capacity [OPT][EXT]

## Patents & IP
- Patent Family ID [REQ][EXT]
- Publication Number [REQ][EXT]
- Grant Number [OPT][EXT]
- Title [REQ][EXT]
- Abstract [OPT][EXT]
- Inventor(s) [OPT][EXT]
- Filing Date [REQ][EXT]
- Priority Date [OPT][EXT]
- Expiry Date (Calculated) [OPT][CMP]
- Legal Status (Active, Expired, Revoked) [REQ][EXT]
- Covered Asset (Linked Product) [OPT][CMP]

## Financials & Investment
- Fiscal Year [REQ][EXT]
- Market Capitalization [OPT][EXT]
- Annual Revenue [OPT][EXT]
- R&D Spend [OPT][EXT]
- Net Income [OPT][EXT]
- Total Funding Raised [OPT][EXT]
- Latest Funding Round Stage [OPT][EXT]
- Notable Investors [OPT][EXT]
`;

const relationshipMap = `# Relationship Map & Knowledge Graph

The architecture transitions from flat tables to a multidimensional graph.

## Information Flow

### The Molecule Journey
\`Target\` <-(acts upon)- \`Molecule\` -(developed as)-> \`Pipeline Asset\` -(tested in)-> \`Clinical Trial\` -(approved as)-> \`Marketed Product\`

### The Corporate Flow
\`Company\` -(employs)-> \`Leadership\`
\`Company\` -(operates)-> \`Facility\` -(manufactures)-> \`Marketed Product\`
\`Company\` -(owns)-> \`Patent\` -(protects)-> \`Marketed Product\`
\`Company\` -(acquires)-> \`Company\`

## Cross-Entity Linkages
- **Disease/Indication**: Links \`Clinical Trial\` to \`Pipeline Asset\` to \`Marketed Product\` to \`Therapeutic Area\`.
- **Competitor**: Inferred dynamically by finding Companies sharing the same \`Target\` or \`Indication\` within the same \`Phase\` or \`Market\`.
- **People**: An \`Author\` on a \`Publication\` may also be a \`Principal Investigator\` on a \`Clinical Trial\` and a \`Founder\` of a \`Company\`.

## Scalability Implications
Graph-oriented mapping allows us to query complex intersections:
"Show me all Companies that hold Patents protecting Molecules targeting TNF-alpha with active Phase III Clinical Trials in the US."
`;

const infoHierarchy = `# Information Hierarchy

## Level 1: Global Entities (The Taxonomy)
These are independent of any single company and form the universal vocabulary of the platform.
- Diseases (MeSH/ICD)
- Biological Targets (Genes/Proteins)
- Mechanisms of Action
- Geographies (Countries, States, Cities)
- Technologies (e.g., mRNA, CRISPR)

## Level 2: The Core Node
- The Company (The central gravitational body)

## Level 3: First-Degree Connections (Direct Ownership)
- Subsidiaries
- Facilities & Locations
- Personnel (Leadership, Contacts)
- Intellectual Property (Patents)
- Financial Data

## Level 4: Operational Artifacts (Activities)
- Marketed Products
- Pipeline Assets
- Clinical Trials
- Press Releases / News
- Regulatory Filings / Warning Letters

## Level 5: Synthesis & Abstraction
- Market Position (Competitor graphs)
- AI Generated Insights (SWOT, Risk factors)
- Completeness Scores
`;

const businessModel = `# Business Information Model

## Philosophy
Data is useless without context. The Business Information Model transforms raw attributes into commercially valuable intelligence.

### 1. Verification Layer
Every piece of information possesses a \`Provenance Vector\`:
- Source Node (e.g., ClinicalTrials.gov)
- Extraction Method (e.g., AI Parser vs Official API)
- Timestamp
- Confidence Score (0.0 to 1.0)
*Value: Users trust platforms that prove where their data came from.*

### 2. Standardization Layer
Different sources call things different names (e.g., "Breast Cancer" vs "Malignant Neoplasm of Breast").
All inputs pass through an Ontology Mapper to normalize against standard vocabularies (RxNorm, MeSH, LEI).
*Value: Search and filtering work perfectly because data is strictly standardized.*

### 3. Synthesis Layer (AI)
Raw data is aggregated and passed to LLMs to generate high-level insights:
- "What is this company's primary strategy based on their pipeline?"
- "What are the impending patent cliffs for this portfolio?"
*Value: Time-saving executive summaries that competitors cannot match.*
`;

const futureExpansion = `# Future Expansion Guide

## Preparing for 50,000+ Companies

### 1. Streaming Ingestion
The architecture separates the *Platform* from the *Ingestion Engine*. As we scale, background workers must transition to an event-driven stream (e.g., Kafka) that constantly monitors external sources for changes (e.g., RSS, SEC filings) and updates the graph in real-time.

### 2. Time-Series Tracking
Currently, a company's data is a static snapshot. Future expansion requires tracking *change over time*:
- When did Phase II transition to Phase III?
- How has revenue grown over 10 years?
*Implementation strategy: Append-only ledger for all core metrics.*

### 3. Advanced Graph Analytics
With 50k companies, the value lies in network effects.
- **Supply Chain Mapping**: Identifying if a single API manufacturer's failure cascades to 50 pharma companies.
- **Talent Migration**: Tracking executives moving between competitors to predict strategy shifts.

### 4. Custom Dashboards & Exports
Architect the API to support GraphQL, allowing clients to build dynamic reports and export highly customized CSV/Excel matrices comparing specific subsets of the 50,000 companies.
`;

write('COMPANY_INFORMATION_ARCHITECTURE.md', companyInfoArch);
write('SECTION_DEFINITION_GUIDE.md', sectionDefinition);
write('MASTER_FIELD_CATALOG.md', fieldCatalog);
write('RELATIONSHIP_MAP.md', relationshipMap);
write('INFORMATION_HIERARCHY.md', infoHierarchy);
write('BUSINESS_INFORMATION_MODEL.md', businessModel);
write('FUTURE_EXPANSION_GUIDE.md', futureExpansion);
