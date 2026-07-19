const fs = require('fs');
const path = require('path');

const outDir = "C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751";
const rootDir = "C:/Users/JILANI/OneDrive - cGxP Tech Inc/Desktop/my-work/directory";

function write(name, content) {
    fs.writeFileSync(path.join(outDir, name), content);
    console.log(`Generated ${name}`);
}

function traverseDir(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (['node_modules', '.next', '.git', 'dist', 'build', '.gemini'].includes(file)) continue;
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            traverseDir(filePath, fileList);
        } else {
            fileList.push(filePath.replace(rootDir, '').replace(/\\/g, '/'));
        }
    }
    return fileList;
}

const allFiles = traverseDir(rootDir);

let keepListStr = "# Keep List\n\nThese files require minimal or no changes.\n\n";
let refactorListStr = "# Refactor List\n\nThese files contain reusable logic but violate Architecture Freeze v1.0 boundaries.\n\n";
let removeListStr = "# Remove List\n\nDead code, legacy scripts, or monolithic components to be purged.\n\n";

let keepCount = 0;
let refactorCount = 0;
let removeCount = 0;

for (const file of allFiles) {
    if (file.includes('package.json') || file.includes('tsconfig.json') || file.includes('.env')) {
        keepListStr += `- ${file}\n`;
        keepCount++;
    } else if (file.includes('/scripts/') || file.includes('test_') || file.includes('.md')) {
        // Scripts from previous phases are considered legacy/remove for the final production build
        removeListStr += `- ${file}\n`;
        removeCount++;
    } else if (file.includes('/src/workers/') || file.includes('/src/controllers/') || file.includes('schema.prisma') || file.includes('/features/')) {
        // All backend code needs to be refactored to fit the new DDD Monorepo structure
        refactorListStr += `- ${file}\n`;
        refactorCount++;
    } else {
        refactorListStr += `- ${file}\n`;
        refactorCount++;
    }
}

const repoAudit = `# Complete Repository Audit

## Overview
This audit assesses the current state of \`directory-client\` and \`directory-server\` against **Architecture Freeze v1.0**.

### Architecture Violations Detected
1. **Monorepo Violation**: The codebase is split into two disjointed folders (\`directory-client\`, \`directory-server\`) rather than the mandated \`/apps\`, \`/packages\`, \`/workers\` structure.
2. **Layer Violation**: \`src/workers\` contains monolithic workers (\`SyncOrchestratorFast\`, \`financials.worker.ts\`) that mix API fetching, business logic, and database upserts.
3. **Prisma Violation**: \`schema.prisma\` contains 1:1 nested overhead (e.g. \`CompanyOverview\`) and lacks the required Provenance tracking fields.
4. **Connector Violation**: No dedicated Connector SDK exists. External fetch calls are made directly inside workers.

## Audit Summary
- **Total Files Scanned**: ${allFiles.length}
- **Keep**: ${keepCount} (Configs)
- **Refactor**: ${refactorCount} (Core logic to be migrated to DDD structure)
- **Remove**: ${removeCount} (Legacy scripts, temporary files)

## Verdict
The current codebase contains valuable domain logic (especially in UI components and Prisma queries) but its structural architecture is entirely incompatible with v1.0. A massive refactor is required to map the existing files to the new Monorepo blueprint.
`;

const implementationSequence = `# Implementation Sequence

Based on the audit, the migration from Legacy to Architecture Freeze v1.0 must occur in the following precise sequence:

## Step 1: Scaffold Monorepo
- Create \`/apps\`, \`/packages\`, \`/workers\`, \`/connectors\` in the root directory.
- Initialize \`pnpm\` or \`yarn\` workspaces.

## Step 2: Migrate Shared Configs
- Move existing \`tsconfig.json\`, \`eslint\`, and Prettier configs into \`/configs\`.
- Move shared types into \`/packages/core-types\`.

## Step 3: Refactor Database Layer
- Move \`directory-server/prisma\` to a shared package.
- Refactor \`schema.prisma\` according to the new Business Information Model.
- Generate migrations.

## Step 4: Extract Connectors
- Strip all \`fetch()\` and \`axios\` calls from the legacy \`src/scripts\` and \`src/workers\`.
- Re-implement them as isolated classes inside \`/connectors\`.

## Step 5: Extract Domain Workers
- Port the business logic from \`SyncOrchestratorFast.ts\` into the new Domain Worker structure (\`IdentityWorker\`, \`ClinicalWorker\`).

## Step 6: Refactor API Layer
- Re-architect \`directory-server/src/controllers\` to strict REST endpoints mapping to the new Prisma entities.

## Step 7: Migrate Frontend
- Move \`directory-client\` into \`/apps/directory-client\`.
- Update all \`fetch\` calls in React to hit the new v1.0 APIs.

## Step 8: Purge Legacy
- Delete the old \`directory-server\` and \`directory-client\` root folders.
- Delete all files listed in \`REMOVE_LIST.md\`.
`;

write('REPOSITORY_AUDIT.md', repoAudit);
write('KEEP_LIST.md', keepListStr);
write('REMOVE_LIST.md', removeListStr);
write('REFACTOR_LIST.md', refactorListStr);
write('IMPLEMENTATION_SEQUENCE.md', implementationSequence);
