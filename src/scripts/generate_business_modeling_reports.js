const fs = require('fs');
const path = require('path');

const outDir = "C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751";

function write(name, content) {
    fs.writeFileSync(path.join(outDir, name), content);
    console.log(`Generated ${name}`);
}

const businessCatalog = `# Business Data Point Catalog (Baseline)

*Note: This catalog represents the baseline extracted from the current UI/schema structure. Awaiting the final definitive list from the user to complete this catalog.*

## Overview
- History
- Business Model
- Mission
- Vision

## Corporate
- Legal Name
- Brand Name
- Short Name
- Former Name
- Company Type
- Founded Year
- Employees
- Ownership Type
- Incorporation Date
- Company Number
- Headquarters (Address, City, State, Country)
- Website
- Email
- Phone
- Stock Exchange
- Ticker
- CIK
- LEI
- DUNS
- ISIN
- Parent Company
- Subsidiaries

## Leadership
- Name
- Title
- Type (Executive vs Board)
- Bio

## Products
- Name
- Generic Name
- Description
- Type
- Approval Status

## Pipeline
- Program Name
- Indication
- Phase
- Mechanism

## Clinical Trials
- NCT ID
- Title
- Phase
- Status
- Conditions

## Manufacturing
- Capability
- Capacity
- Certifications

## Facilities
- Name
- Type
- Country

## Offices
- Type
- Address
- City
- Country

## Research
- Focus Area
- Description

## Regulatory
- Agency
- Document Type
- Date
- Summary

## Financials
- Fiscal Year
- Revenue
- Net Income
- Market Cap

## Patents
- Patent Number
- Title
- Status
- Expiry Date

## Publications
- Title
- DOI
- Journal
- Publish Date

## Technology
- Name
- Description

## Therapeutic Areas
- Name

## Partners & Acquisitions
- Partner Name
- Partnership Type
- Acquired Company
- Amount
- Date

## Contacts
- Type
- Email
- Phone

## News
- Title
- Date

## AI Insights
- Insight Type
- Content
`;

const sectionMapping = `# Section Mapping

| Section | Description | Mapped Entities |
|---|---|---|
| Overview | Core narrative and mission. | CompanyOverview |
| Corporate | Legal and financial identifiers. | CompanyCorporate |
| Leadership | Key personnel and governance. | CompanyLeadership |
| Products | Marketed drugs, devices, biologicals. | CompanyProduct |
| Pipeline | R&D assets not yet approved. | CompanyPipeline |
| Clinical Trials | Investigational studies. | CompanyClinicalTrial |
| Facilities | Physical footprint. | CompanyFacility, CompanyOffice |
| Manufacturing | Supply chain and production capabilities. | CompanyManufacturing |
| Research | Scientific focus areas. | CompanyResearch |
| Publications | Scientific literature authorship. | CompanyPublication |
| Patents | Intellectual property. | CompanyPatent |
| Financials | Fiscal metrics. | CompanyFinancial |
| Regulatory | Filings and inspections. | CompanyRegulatory |
| News | Press releases and media coverage. | CompanyNews |
| Contacts | Key communication lines. | CompanyContact |
| Partners/Acquisitions | Corporate development. | CompanyPartner, CompanyAcquisition |
| Technology | Core platforms. | CompanyTechnology |
| Competitors | Market landscape. | CompanyCompetitor |
| AI Insights | Generated summaries. | CompanyAIInsight |
`;

const fieldClassification = `# Field Classification (Baseline)

## Corporate
- Legal Name: Required, External API (SEC/OpenFDA)
- Brand Name: Computed, Internal Source
- Founded Year: Optional, External API
- Company Type: Optional, External API
- Headquarters (City, State, Country): Required, External API
- Website: Required, Official Website
- Ticker: Optional, External API
- LEI: Optional, External API

## Clinical Trials
- NCT ID: Required, External API (ClinicalTrials.gov)
- Title: Required, External API
- Phase: Optional, External API
- Status: Required, External API

## Products
- Name: Required, External API (OpenFDA)
- Generic Name: Optional, External API
- Approval Status: Computed, External API

*Note: A full classification matrix will be built once the final data points are provided by the user.*
`;

const requirementGaps = `# Requirement Gaps & Conflicts

## Detected Duplicates & Conflicts
1. **Website**: Found in \`Corporate\` and \`Contacts\`.
   - *Conflict*: Which is canonical for the company profile?
2. **Email & Phone**: Found in \`Corporate\` and \`Contacts\`.
   - *Conflict*: Corporate likely means general (info@), while Contacts may contain specific departmental or PR contacts.
3. **Country/City**: Found in \`Corporate\` (Headquarters), \`Facilities\`, and \`Offices\`.
   - *Conflict*: Are offices and facilities the same entity? Corporate HQ is just an office type?
4. **Description**: Found in \`Overview\` (History/Business Model), \`Products\`, \`Research\`, \`Technology\`.
   - *Ambiguity*: Too generic. Needs explicit bounding (e.g. Product Description vs Company Narrative).

## Missing Business Entities (Identified for Schema Prep)
- Drug / Molecule (Distinct from "Product")
- Brand
- Press Release (Distinct from general "News")
- Investor
- ESG Metrics
- Disease / Target (Missing global taxonomy)
`;

write('BUSINESS_DATA_POINT_CATALOG.md', businessCatalog);
write('SECTION_MAPPING.md', sectionMapping);
write('FIELD_CLASSIFICATION.md', fieldClassification);
write('REQUIREMENT_GAPS.md', requirementGaps);
