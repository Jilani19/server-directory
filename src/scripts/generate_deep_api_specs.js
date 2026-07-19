const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751';

// 1. API_CONTRACTS.md
const ac = `# API CONTRACTS

## Core Standards
- **Authentication**: Bearer Token (JWT) required for /admin. Public endpoints use IP-based rate limiting.
- **Rate Limits**: 60 requests / minute / IP (Public), 300 requests / minute (Auth).
- **Caching**: \`Cache-Control: public, max-age=300\` for standard reads. \`s-maxage=3600\` for CDN edge.
- **Pagination**: Offset-based (\`page\`, \`limit\`) for UI grids. Cursor-based (\`cursor\`) for Infinite scroll endpoints.
- **Sorting**: \`sort=field:asc|desc\`
- **Response Shape**: \`{ success: boolean, data: any, meta: { timestamp, pagination? }, error?: { code, message } }\`

---

## 1. Directory (Index)
### \`GET /api/v1/companies\`
- **Purpose**: Fetch paginated grid of companies.
- **Request**: \`?page=1&limit=24&industry=Pharma&country=US&sort=marketCap:desc\`
- **Response**: Array of Company Summary objects + Pagination Meta.
- **Errors**: 400 (Invalid sort field).

## 2. Company Profile
### \`GET /api/v1/companies/:slug\`
- **Purpose**: Fetch core Identity and tear-sheet metrics.
- **Request**: Path param \`slug\`.
- **Response**: Company Object with nested \`_count\` for related entities.
- **Errors**: 404 (Not Found).

## 3. Products
### \`GET /api/v1/companies/:slug/products\`
- **Purpose**: Fetch approved drugs/devices.
- **Request**: \`?page=1&limit=100&status=APPROVED\`
- **Response**: Array of Drug objects.

## 4. Trials
### \`GET /api/v1/companies/:slug/trials\`
- **Purpose**: Fetch clinical trials.
- **Request**: \`?phase=Phase3&status=RECRUITING&sort=startDate:desc\`
- **Response**: Array of ClinicalTrial objects.

## 5. Patents
### \`GET /api/v1/companies/:slug/patents\`
- **Purpose**: Fetch IP portfolio.
- **Request**: \`?status=GRANTED\`
- **Response**: Array of Patent objects.

## 6. Publications
### \`GET /api/v1/companies/:slug/publications\`
- **Purpose**: Fetch peer-reviewed literature.
- **Request**: \`?year=2023&sort=citations:desc\`
- **Response**: Array of Publication objects.

## 7. Facilities
### \`GET /api/v1/companies/:slug/facilities\`
- **Purpose**: Fetch HQ and manufacturing sites.
- **Request**: None.
- **Response**: Array of Facility objects (with GeoJSON points if available).

## 8. Financials
### \`GET /api/v1/companies/:slug/financials\`
- **Purpose**: Fetch revenue and market cap history.
- **Request**: \`?years=5\`
- **Response**: Array of Financial objects sorted chronologically.

## 9. Search (Omnisearch)
### \`GET /api/v1/search\`
- **Purpose**: Global typeahead search.
- **Request**: \`?q=Tylenol&limit=5\`
- **Response**: Mixed array grouped by \`type\` (Company, Drug, Trial).
- **Latency Target**: < 100ms.

## 10. Filters
### \`GET /api/v1/filters/metadata\`
- **Purpose**: Fetch all possible filter enums and counts.
- **Request**: None.
- **Response**: Nested object of arrays (e.g. \`{ industries: [...], countries: [...] }\`).

## 11. Compare
### \`GET /api/v1/companies/compare\`
- **Purpose**: Fetch side-by-side metrics.
- **Request**: \`?slugs=jnj,pfe,mrk\`
- **Response**: Array of Aggregated Tear-Sheet objects.

## 12. Analytics
### \`GET /api/v1/analytics/directory\`
- **Purpose**: Fetch top-level dashboard metrics (Total companies by region, tech split).
- **Request**: None.
- **Response**: Object of pre-aggregated D3/ChartJS ready arrays.

## 13. Admin
### \`POST /api/v1/admin/hydrate/:slug\`
- **Purpose**: Trigger hydration orchestrator.
- **Authentication**: JWT Required (Role: ADMIN).
- **Request**: \`{ forceRefresh: boolean }\`
- **Response**: 202 Accepted (Background job queued).
- **Errors**: 401 (Unauthorized), 403 (Forbidden).
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'API_CONTRACTS.md'), ac);


// 2. OPENAPI_MAPPING.md
const om = `# OPENAPI 3.0 MAPPING

Every API contract outlined in \`API_CONTRACTS.md\` will be rigorously mapped to an OpenAPI 3.0 YAML specification.

## Core Schema Structure
\`\`\`yaml
openapi: 3.0.0
info:
  title: cGxP.Directory Platform API
  version: 1.0.0
servers:
  - url: /api/v1
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
  responses:
    400BadRequest:
      description: Invalid request parameters
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
    404NotFound:
      description: Resource not found
    429TooManyRequests:
      description: Rate limit exceeded
  schemas:
    BaseResponse:
      type: object
      properties:
        success:
          type: boolean
        meta:
          type: object
          properties:
            timestamp:
              type: string
              format: date-time
    ErrorResponse:
      type: object
      properties:
        success:
          type: boolean
          example: false
        error:
          type: object
          properties:
            code:
              type: string
            message:
              type: string
\`\`\`
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'OPENAPI_MAPPING.md'), om);


// 3. ERROR_STANDARD.md
const es = `# ERROR STANDARD

The platform will enforce a strict, unified error response schema. Applications must NEVER leak internal stack traces or Prisma exceptions to the client.

## Universal Error Schema
\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_ENUM_STRING",
    "message": "Human readable localized message."
  },
  "meta": {
    "timestamp": "2024-01-01T12:00:00Z",
    "requestId": "req-123-abc"
  }
}
\`\`\`

## HTTP Status to Error Code Mapping

### 400 Bad Request
- **code**: \`VALIDATION_ERROR\` (e.g., Zod parsing failed)
- **code**: \`MALFORMED_REQUEST\` (e.g., invalid JSON body)

### 401 Unauthorized
- **code**: \`AUTH_MISSING_TOKEN\`
- **code**: \`AUTH_INVALID_TOKEN\`

### 403 Forbidden
- **code**: \`AUTH_INSUFFICIENT_PERMISSIONS\` (Used for Admin endpoints)

### 404 Not Found
- **code**: \`ENTITY_NOT_FOUND\` (e.g., Invalid Company Slug)
- **code**: \`ROUTE_NOT_FOUND\` (Invalid API path)

### 429 Too Many Requests
- **code**: \`RATE_LIMIT_EXCEEDED\`
- **Behavior**: Client must back off. Server returns \`Retry-After\` header.

### 500 Internal Server Error
- **code**: \`INTERNAL_SERVER_ERROR\`
- **Behavior**: Generic fallback. Actual error is logged to Datadog/CloudWatch via Winston logger.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'ERROR_STANDARD.md'), es);

console.log("Deep API Specs Generated.");
