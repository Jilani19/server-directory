# DATA QUALITY ENGINE

## Objective
Automatically compute Completeness, Freshness, Reliability, and Coverage metrics continuously.

## DQE Workflow
Following a Background Sync iteration, the DQE middleware evaluates the updated entity graph.

### 1. Completeness Score
Iterates across the schema mapping defined fields vs. `null` counts.
Example: Identity is 100% complete if `ticker`, `cik`, `lei`, `foundedYear` exist.

### 2. Freshness Score
Evaluates the delta between `now()` and `lastSynced` against the entity's volatility profile. (e.g., Financials decay quarterly; Leadership decays slowly).

### 3. Reliability & Confidence
Aggregated from the underlying `Provenance` engine. Primary sources (SEC, FDA) yield 100% confidence. Secondary aggregators (Yahoo Finance) yield < 80% confidence.

## Persistent Reports
The DQE pushes these metrics to a `DataQuality` JSON field attached to the `Company` record, which the frontend consumes to render dynamic Quality Dashboards.
