# BACKGROUND WORKER PLAN

## Architecture Selection
We will implement a Node.js-based worker architecture utilizing **BullMQ** (backed by **Redis**). This provides robust queue management, exponential backoff, and strict concurrency controls necessary for interacting with rate-limited global APIs.

## Queue Definitions
1. `CompanySyncQueue`: The master queue. Nightly CRON jobs push 100+ company IDs into this queue.
2. `ConnectorQueue`: Sub-queues tailored per API (e.g., `SECQueue`, `FDAQueue`). The worker processes these respecting the strict API rate limit policies (e.g., max 3 jobs per second for NCBI).

## Job Lifecycle
1. **Enqueued**: Scheduled based on `Company.nextSync`.
2. **Processing**: Worker selects connector, extracts payload.
3. **Normalization**: Zod validation parses the payload into Prisma entities.
4. **Transaction**: Data is upserted into SQLite alongside `Provenance` metadata.
5. **Completion**: Job marked Successful. `syncDuration` and `lastSynced` updated.

## Error Handling
If an external API throws a `429 Too Many Requests` or a `502 Bad Gateway`, the worker throws a `ConnectorRateLimitError`. BullMQ intercepts this and automatically reschedules the job with exponential backoff (e.g., retry in 2 mins, then 10 mins, then 1 hr). After 3 failures, the job moves to the Dead Letter Queue for admin review.
