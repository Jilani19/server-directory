const fs = require('fs');
const path = require('path');

const outDir = "C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751";

function write(name, content) {
    fs.writeFileSync(path.join(outDir, name), content);
    console.log(`Generated ${name}`);
}

const dataSourceCatalog = `# Data Source Catalog

## SECTION: Corporate & Identity

### Field: Legal Name
- **Primary Source**: SEC EDGAR (Official API)
- **Secondary Source**: Global Legal Entity Identifier Foundation (GLEIF) (Official API)
- **Third Source**: Official Website (Website Crawl)
- **Verification**: Name must match at least one official government/registry source.
- **Refresh**: Monthly
- **Confidence**: 100% if SEC/GLEIF, 85% if Website.
- **Source Classification**: Official Government Source, Official Company Source

### Field: Headquarters
- **Primary Source**: SEC EDGAR (Official API)
- **Secondary Source**: Official Website (Website Crawl)
- **Verification**: Physical address cross-referenced via Google Maps API (Commercial API).
- **Refresh**: Quarterly
- **Confidence**: 100% if SEC, 90% if Website.
- **Source Classification**: Official Government Source, Official Company Source

## SECTION: Products

### Field: Product Name
- **Primary Source**: OpenFDA (Official API)
- **Secondary Source**: DailyMed (Structured Data / XML)
- **Third Source**: Official Website (Website Crawl)
- **Verification**: Product names must match at least one official source.
- **Refresh**: Weekly
- **Confidence**: 100% if OpenFDA, 95% if Official Website.
- **Source Classification**: Official Government Source, Official Company Source

### Field: Generic Name
- **Primary Source**: RxNorm (Official API)
- **Secondary Source**: OpenFDA (Official API)
- **Verification**: Must be canonicalized against RxNorm CUI.
- **Refresh**: Weekly
- **Confidence**: 100% if RxNorm, 90% if DailyMed.
- **Source Classification**: Official Government Source

## SECTION: Clinical Trials

### Field: NCT ID
- **Primary Source**: ClinicalTrials.gov (Official API)
- **Secondary Source**: EudraCT (Official API)
- **Verification**: Must return 200 OK from source API.
- **Refresh**: Daily
- **Confidence**: 100% if ClinicalTrials.gov.
- **Source Classification**: Official Government Source

### Field: Overall Status
- **Primary Source**: ClinicalTrials.gov (Official API)
- **Verification**: Enum match strictly enforced.
- **Refresh**: Daily
- **Confidence**: 100%
- **Source Classification**: Official Government Source

## SECTION: Financials

### Field: Revenue
- **Primary Source**: SEC 10-K/10-Q (Official API / XBRL)
- **Secondary Source**: Official Investor Relations Website (Website Crawl / PDF)
- **Third Source**: Commercial Financial API (Commercial API)
- **Verification**: Must match audited filings.
- **Refresh**: Quarterly
- **Confidence**: 100% SEC, 95% IR Website, 80% Commercial API.
- **Source Classification**: Official Government Source, Official Company Source, Commercial Source
`;

const sourcePriorityMatrix = `# Source Priority Matrix

When multiple sources claim the same data point, the system applies this priority hierarchy:

## 1. Official Government Source (Tier 1)
*Highest Authority. Overrides all other sources.*
- SEC EDGAR (Financials, Corporate)
- OpenFDA (Products, Regulatory)
- ClinicalTrials.gov (Trials)
- USPTO / WIPO / EPO (Patents)

## 2. Scientific Source (Tier 2)
*Authoritative for R&D and Academic claims.*
- PubMed / NIH (Publications)
- Crossref / EuropePMC

## 3. Official Company Source (Tier 3)
*Authoritative for brand, non-regulated locations, and PR.*
- Official Website
- Official RSS Feeds
- Investor Relations PDF Filings

## 4. Commercial Source (Tier 4)
*Used only when Tier 1-3 are unavailable.*
- ZoomInfo (Contacts)
- PitchBook (Private Funding)

## 5. Public Source (Tier 5)
*Low confidence. Requires AI verification.*
- Wikipedia
- Public News aggregators

## 6. AI Generated (Tier 6)
*Lowest authority for hard facts. Highest authority for synthesis/summarization.*
- Inferred Competitors
- SWOT Analysis
- NLP extracted entities from unstructured PDFs
`;

const fieldOwnershipMatrix = `# Field Ownership Matrix

This defines which ingestion worker or manual process "owns" the right to write to a specific field.

| Entity | Field | Owner System | Classification |
|---|---|---|---|
| Corporate | Legal Name | \`sec_edgar_worker\` | External API |
| Corporate | Founded Year | \`website_crawler\` | External API |
| Corporate | Description | \`ai_synthesis_engine\` | AI Generated |
| Clinical | Phase | \`ct_gov_worker\` | External API |
| Products | Approval Status| \`openfda_worker\` | External API |
| Publications | DOI | \`pubmed_worker\` | External API |
| Contacts | Email | \`commercial_data_worker\` | Commercial Source |
| Financials | Market Cap | \`market_data_worker\` | External API |
| News | Title | \`rss_ingestion_worker\` | External API |
`;

const verificationPolicy = `# Verification Policy

## Verification Methods

1. **Cryptographic / Direct API Verification**
   - The data is pulled directly via HTTPS from an official government endpoint (e.g., \`api.fda.gov\`).
   - *Status Applied*: \`Verified (Official)\`

2. **Cross-Referencing (Consensus)**
   - The data is scraped from an unstructured source (e.g., Website) but matches data found on a secondary public source (e.g., LinkedIn).
   - *Status Applied*: \`Verified (Consensus)\`

3. **Heuristic / Format Validation**
   - e.g., A CIK must be exactly 10 digits. An NCT ID must match \`^NCT[0-9]{8}$\`.
   - *Status Applied*: \`Format Verified\`

4. **Human Review**
   - Ambiguous data flagged by the AI engine that required manual intervention.
   - *Status Applied*: \`Verified (Manual)\`

## Missing Data Rules
If a field is completely unavailable after exhausting all configured sources, the system MUST NOT invent data. The system will mark the field with one of the following exact enum values:

- \`VERIFIED_NOT_PUBLICLY_AVAILABLE\`: The company is private, and regulations do not require this data (e.g., Revenue for a private stealth biotech).
- \`SOURCE_NOT_AVAILABLE\`: The API endpoint was down or the website blocked crawlers (Retry scheduled).
- \`COMMERCIAL_DATA_REQUIRED\`: Data exists but is paywalled (e.g., specific executive emails).
`;

const dataRefreshPolicy = `# Data Refresh Policy

Every field is bound to a Time-To-Live (TTL) which dictates the background refresh frequency.

## Real-time (Event-Driven)
- **Stock Price / Market Cap**: Websocket/Commercial API.
- **News**: Webhook/RSS immediate trigger.

## Daily
- **Clinical Trial Status**: Trials change statuses frequently. (\`ct_gov_worker\`)
- **FDA Approvals**: New drug approvals or warning letters. (\`openfda_worker\`)

## Weekly
- **Publications**: PubMed updates. (\`pubmed_worker\`)
- **Patents**: USPTO grants. (\`uspto_worker\`)

## Monthly
- **Leadership / Contacts**: Executive turnover is slow. (\`website_crawler\`)
- **Facilities / Locations**: (\`website_crawler\`)

## Quarterly
- **Financials**: Bound to SEC 10-Q filing dates. (\`sec_worker\`)

## Yearly
- **Founded Year**, **Legal Name**: Highly static. (\`sec_worker\`)

## Manual
- **AI Overrides**, **Bespoke Research**: Only updated when explicitly triggered by a user/admin.
`;

const conflictResolutionPolicy = `# Conflict Resolution Policy

## Rule 1: The Government Trumps The Corporation
**Scenario**: SEC reports Revenue as $1.2B. The Official Website PR reports $1.3B (adjusted).
**Resolution**: SEC wins. Official Government Sources ALWAYS override Official Company Sources. 
**Explanation**: Regulatory filings are legally bound and standardized. PR materials are often manipulated.

## Rule 2: The Source of Truth Owns its Domain
**Scenario**: ClinicalTrials.gov says Phase III. OpenFDA says Phase II.
**Resolution**: ClinicalTrials.gov wins. 
**Explanation**: CT.gov is the domain owner for trial statuses. FDA is the domain owner for *approvals*.

## Rule 3: Most Recent Verified Trumps Stale Verified
**Scenario**: Website Crawl (today) says CEO is John Doe. SEC Filing (6 months ago) says CEO is Jane Smith.
**Resolution**: Website wins.
**Explanation**: For highly volatile fields (personnel), chronological proximity combined with Tier 3 (Company Source) overrides a stale Tier 1 (Gov Source).

## Rule 4: Structural Integrity Trumps Text
**Scenario**: PubMed XML returns author \`Smith, J.\`. CrossRef JSON returns \`John Smith\`.
**Resolution**: CrossRef JSON wins.
**Explanation**: Sources providing structured, strongly-typed data (JSON APIs) override sources requiring string parsing (XML/HTML).
`;

const provenanceStandard = `# Provenance Standard

Every data point inserted into the final database MUST be wrapped in a Provenance Object. 

## Provenance Schema
\`\`\`json
{
  "sourceUrl": "https://clinicaltrials.gov/api/v2/studies/NCT00000000",
  "sourceName": "ClinicalTrials.gov",
  "sourceClassification": "Official Government Source",
  "lastUpdated": "2023-10-01T12:00:00Z",
  "retrievedAt": "2023-11-05T08:30:00Z",
  "verificationStatus": "Verified (Official)",
  "confidenceScore": 1.0,
  "licenseRestrictions": "Public Domain (CC0)",
  "ingestionJobId": "job_987654321"
}
\`\`\`

## Strict Enforcement
If a worker attempts to write to a field without providing this Provenance Object, the database layer will REJECT the transaction. Data without provenance is considered contaminated.
`;

const licenseUsageMatrix = `# License and Usage Matrix

To ensure the platform operates within legal and commercial boundaries, every data source is tagged with a license type dictating how the data can be exposed to end-users.

| Source | API Classification | License Type | Usage Restriction |
|---|---|---|---|
| OpenFDA | Official API | Public Domain | Unrestricted display and commercial resale. |
| ClinicalTrials.gov | Official API | Public Domain | Unrestricted display. |
| SEC EDGAR | Official API | Public Domain | Unrestricted display. |
| PubMed | Official API | NLM License | Unrestricted metadata display; abstract copyright varies. |
| Official Website | Website Crawl | Copyrighted | Fair use snippets only. Must link back to source. Cannot wholesale copy layouts. |
| ZoomInfo (Hypothetical) | Commercial API | Commercial Restricted | Can display to authenticated users. Cannot resell raw data via our API. |
| RSS Feeds | RSS | Copyrighted | Headline + URL only. Body text must not be stored long-term. |
`;

write('DATA_SOURCE_CATALOG.md', dataSourceCatalog);
write('SOURCE_PRIORITY_MATRIX.md', sourcePriorityMatrix);
write('FIELD_OWNERSHIP_MATRIX.md', fieldOwnershipMatrix);
write('VERIFICATION_POLICY.md', verificationPolicy);
write('DATA_REFRESH_POLICY.md', dataRefreshPolicy);
write('CONFLICT_RESOLUTION_POLICY.md', conflictResolutionPolicy);
write('PROVENANCE_STANDARD.md', provenanceStandard);
write('LICENSE_AND_USAGE_MATRIX.md', licenseUsageMatrix);
