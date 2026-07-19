# DATA QUALITY REPORT

## Data Quality Engine (Phase 17)

The DQE computes absolute completeness percentages natively inside the SQLite backend.

### Scoring Algorithm
A utility script will map the presence of required schema fields into a unified JSON object attached to `Company.completenessScore` (or a dedicated `DataQuality` JSON field).

**Example Output:**
```json
{
  "Identity": 100,
  "Financials": 50,
  "Facilities": 10,
  "Leadership": 0,
  "Products": 45,
  "Trials": 25,
  "Patents": 0,
  "News": 0,
  "Contacts": 0,
  "Overall": 25
}
```

### Action Items
- Write a Prisma middleware or CRON script that evaluates `null` and `[]` values across all 18 domains post-synchronization.
- Push this computed JSON matrix to the Next.js frontend to dynamically render the `Completeness Score` UI without calculating it locally on the client.
