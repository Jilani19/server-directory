# CONNECTOR ARCHITECTURE

## Objective
Build a fault-tolerant, independent connector framework capable of pulling data from global Life Sciences repositories.

## Connector Interface Design
Every connector implements a strict TypeScript interface ensuring uniform execution:
```typescript
interface IntelligenceConnector {
  connectorId: string;
  version: string;
  authenticate(): Promise<void>;
  fetchTarget(entityId: string, cursor?: string): Promise<RawPayload[]>;
  handleRateLimit(response: HttpResponse): Promise<void>;
}
```

## Supported Connectors (Phase 1)
1. **SECConnector**: Connects to SEC EDGAR API for 10-K, 10-Q (Financials, Leadership, Risk Factors).
2. **FDAConnector**: OpenFDA (Orange Book for Drugs, Adverse Events, Recalls, Warning Letters).
3. **ClinicalTrialsConnector**: ARES API for NCT IDs, trial phases, and enrollment.
4. **PubMedConnector**: NCBI E-utilities for peer-reviewed publications.
5. **GLEIFConnector**: Global LEI Index for corporate entity resolution and parent-subsidiary mapping.
6. **USPTOConnector**: PatentsView for intellectual property portfolios.

## Resilience Protocols
- **Rate Limiting**: Integrated leaky bucket algorithms specific to each API (e.g., NCBI allows 3 requests/sec without API key).
- **Exponential Backoff**: Automatic retry on HTTP 429/50x errors.
- **Pagination**: Cursors/Offsets are managed internally and saved to state to resume upon failure.
