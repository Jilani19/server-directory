# SYNC STATUS REPORT

## Background Synchronization Engine

### State of the Sync
- **Current Status**: OFFLINE. The application is entirely dependent on a static SQLite seed file.
- **Live APIs**: Correctly disabled on the frontend to prevent Next.js latency and rate-limiting.

### Required Sync Architecture
To implement Phase 16, a background task runner (e.g., BullMQ with Redis) must be installed.

### Sync Tracking Schema
The `Company` model must be updated to track background sync states:
```prisma
model Company {
  ...
  lastSyncedAt     DateTime?
  nextSyncAt       DateTime?
  syncStatus       String    @default("PENDING") // PENDING, SYNCING, SUCCESS, FAILED
  connectorVersion String?
}
```

### Execution Strategy
1. **Cron Trigger**: Nightly trigger at 02:00 UTC.
2. **Queueing**: Dispatch 100 job tokens to the `SyncQueue`.
3. **Execution**: Worker processes pick up tokens, query SEC EDGAR and OpenFDA, parse JSON, and perform `upsert` transactions on SQLite.
