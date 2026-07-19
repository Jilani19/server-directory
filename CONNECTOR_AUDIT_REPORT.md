# CONNECTOR_AUDIT_REPORT.md

**Generated:** 2026-07-19
**Scope:** Initial Audit of All Connectors

## Executive Summary
The platform currently contains two sets of connector implementations:
1. `src/connectors/`: Basic Axios wrappers (ClinicalTrials, CrossRef, Gleif, OpenFda, PubMed, SecEdgar, WebsiteSpider). These are foundational but lack database integration.
2. `src/sync/connectors/`: More developed sync engines (clinical-trials, company-enrichment, openfda, product, pubmed, yahoo-finance) that write to Prisma.

**Current Status**: Despite the presence of these connectors, the `MODULE_DATA_RICHNESS_REPORT` reveals that most tables (`Drug`, `CompanyExecutive`, `CompanyPatent`, `CompanyNews`, `CompanyDocument`, `CompanyRegulatoryAction`) are completely empty, indicating that the connectors are either not running, failing, or writing to the wrong legacy tables (e.g., `Product` instead of `Drug`).

## Detailed Connector Audit

| Connector | Status | Source | API | Current Records | Expected Records | Failure Reason | Priority |
|---|---|---|---|---|---|---|---|
| **Company Enrichment** | Partially Working | Web/Wikipedia | Scraper | 81 companies | 100+ | Syncs basic info, fails to sync `aboutDescription`, `businessOverview`. Does not map subsidiaries/competitors. | High |
| **Yahoo Finance** | Partially Working | Yahoo Finance | YF API | 74 financials | 100+ | Syncs Revenue/MarketCap. Fails to sync `rdSpend`, `netIncome`, `EPS`, etc. | High |
| **ClinicalTrials.gov** | Partially Working | ClinicalTrials | ARES API (v2) | 373 trials | 10,000+ | Linked 395 trial relations. Missing Phase, Status, Enrollment, Outcomes, Sites. | High |
| **OpenFDA Products** | Broken / Wrong Table | OpenFDA | FDA API | 182 (Legacy `Product`) | 1,000+ | Writes to legacy `Product` table instead of `Drug`. `Drug` table is empty. Missing rich product fields. | Critical |
| **OpenFDA Regulatory** | Not Running | OpenFDA | FDA API | 0 | 500+ | Connector exists but is not scheduled/running. | High |
| **PubMed** | Working (Basic) | PubMed | E-Utils | 226 | 5,000+ | Works, but strict limits per company. Missing Abstracts and full metadata. | Medium |
| **Patent Connector** | Not Running / Missing | USPTO/PatentsView | Patents API | 0 | 10,000+ | Code for patent sync is either missing or entirely unexecuted. | High |
| **SEC EDGAR** | Not Running | SEC | EDGAR API | 0 | 2,000+ | Basic `SecEdgarConnector` wrapper exists, but no sync engine implemented. | High |
| **News Connector** | Not Running / Missing | RSS/YF | RSS/API | 0 | 5,000+ | Basic `RssConnector` wrapper exists, but no sync engine implemented. | High |
| **Executive Connector** | Broken / Missing | LinkedIn/Web | Scraper/API | 0 | 500+ | No functional executive sync engine found. | Critical |
| **Contacts Connector** | Not Running | Web | Spider | 0 | 200+ | Basic `WebsiteSpiderConnector` exists, but contact extraction is missing. | Medium |
| **Facility Connector** | Partially Working | FDA Establishments | API/Web | 72 (HQ only) | 1,000+ | Only captures HQ. Misses Manufacturing, R&D, and Distribution sites. | High |
| **Relationship Connector**| Not Running | GLEIF / Web | GLEIF API | 7 | 500+ | Basic `GleifConnector` wrapper exists, but no sync engine populates `CompanyRelationship`. | Medium |
| **Pipeline Connector** | Not Running | ClinicalTrials/Web | Various | 0 | 1,000+ | No functional pipeline asset sync engine found. | High |
