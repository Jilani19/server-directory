const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751';

// 1. DIRECTORY_UX_v2.md
const d_ux = `# DIRECTORY UX V2

## Core Philosophy
Transform the directory from a basic grid of logos into a highly functional **Discovery Engine**. It must facilitate rapid intelligence gathering, supporting both targeted searches and exploratory filtering.

## Section Audit
- **Hero**: REDESIGN. Minimize height. Move stats to a dense metadata bar. Add "Trending Companies" or "Market Movers" sparklines.
- **Search**: KEEP & SUPERCHARGE. Must become a universal omnibar (cmd+k style).
- **Categories (Cards)**: MERGE into left sidebar. The top horizontal cards push results below the fold.
- **Filters (Sidebar)**: KEEP & REDESIGN. Needs accordion groups with live match counts.
- **Company Cards**: REDESIGN. Must show more than logo/name. Add metrics (Market Cap, Pipeline size).
- **Pagination**: REDESIGN. Move from standard paginator to infinite scroll or hybrid "Load More".
- **Toolbar**: REDESIGN. Add robust sorting and view toggles (Grid vs. Dense Table).
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'DIRECTORY_UX_v2.md'), d_ux);


// 2. DIRECTORY_INFORMATION_ARCHITECTURE.md
const d_ia = `# DIRECTORY INFORMATION ARCHITECTURE

## 1. Global Header
Omnisearch Bar, Saved Searches, Export Data, Compare Tray.

## 2. Directory Toolbar (Sticky)
- **Left**: Live result count (e.g. "Showing 1,204 Verified Entities")
- **Right**: Sort Dropdown, View Toggles (Cards | Dense List | Table), Export.

## 3. Left Filter Rail (Expandable)
- **Sectors**: Category, Sub-category, Company Type.
- **Geography**: Country, Region.
- **Financials**: Revenue Range, Market Cap, Public/Private.
- **R&D Pipeline**: Therapeutic Areas, Clinical Trial Count, Patents.
- **Regulatory**: FDA Approvals, Warning Letters.

## 4. Main Results Area
- Grid of intelligently spaced Company Cards.
- Skeleton loaders during transitions.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'DIRECTORY_INFORMATION_ARCHITECTURE.md'), d_ia);


// 3. DIRECTORY_CARD_SPECIFICATION.md
const d_cs = `# DIRECTORY CARD SPECIFICATION

## Card Anatomy
- **Height**: Max 280px (Grid) / 80px (Dense List).
- **Header**: High-res Logo (left), Verification Badge (right), Bookmark Icon.
- **Identity**: Legal Name (bold, truncate 2 lines), Ticker/Exchange.
- **Tags**: Primary Industry, Country Flag.
- **Quick Metrics Bar**:
  - Rev: $XX.X B
  - Pipeline: XX Trials
  - Products: XX FDA
- **Quick Actions (Hover State)**: "Quick Preview" (opens right drawer), "Add to Compare".

## Visual Hierarchy
- The Logo and Company Name are dominant.
- Metrics must use monospace fonts for easy scanning.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'DIRECTORY_CARD_SPECIFICATION.md'), d_cs);


// 4. FILTER_ARCHITECTURE.md
const fa = `# FILTER ARCHITECTURE

## Faceted Navigation
Every filter interaction must instantly update the grid and sibling filter counts without a full page reload.

## Required Filters
1. **Corporate**: Public vs Private, Employee Band, Revenue Band, Market Cap Band.
2. **Clinical**: Phase I/II/III Presence, Therapeutic Area.
3. **Products**: Number of Approved Drugs, Modality (Biologics, Small Molecules).
4. **Geography**: HQ Country, HQ State.
5. **Quality**: Verification Status (Verified vs Unverified).

## Interaction Design
- Display \`(Count)\` next to every filter option.
- Allow multi-select checkboxes.
- Collapse/Expand accordions to manage vertical height.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'FILTER_ARCHITECTURE.md'), fa);


// 5. SEARCH_EXPERIENCE.md
const se = `# SEARCH EXPERIENCE

## Omnisearch Capabilities
The search bar must evaluate:
- Company Names & Aliases
- Tickers, LEIs, CIKs
- Drug Names (Brand & Generic)
- Clinical Trial IDs (NCTs)
- Therapeutic Areas & Diseases
- Executives & Key Personnel

## Autocomplete / Typeahead
- Opens a dropdown instantly on keypress.
- **Sections**:
  - *Companies*: [Logo] Johnson & Johnson (JNJ)
  - *Drugs*: Tylenol (Linked to JNJ)
  - *Recent Searches*

## Search Latency Target
< 100ms for Autocomplete suggestions.
< 300ms for full grid hydration.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'SEARCH_EXPERIENCE.md'), se);


// 6. PERFORMANCE_GUIDE.md
const pg = `# PERFORMANCE GUIDE

## Pagination: Infinite Scroll vs Server Pagination
**Recommendation**: Hybrid "Load More" (Cursor-based Server Pagination).
Infinite scroll breaks footer access and URL sharing. Traditional pagination is slow. A "Load More" button with URL updating (\`?cursor=XYZ\`) provides the best UX.

## Targets
- **Time to Interactive (TTI)**: < 1.5s
- **Search/Filter Latency**: < 300ms (debounced).
- **API Response**: < 200ms.

## Rendering Strategy
- **Partial Hydration**: Render the skeleton layout statically via Next.js SSR. Fetch real company data client-side (SWR / React Query) to ensure stale-while-revalidate caching.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'PERFORMANCE_GUIDE.md'), pg);


// 7. RESPONSIVE_GUIDE.md
const rg = `# RESPONSIVE GUIDE

## Desktop (> 1200px)
- **Layout**: 4-Column Grid for Cards.
- **Sidebar**: Persistent left filter rail (300px wide).

## Tablet (768px - 1199px)
- **Layout**: 2 or 3-Column Grid.
- **Sidebar**: Collapsible to a side drawer, triggered by a floating "Filters" button.

## Mobile (< 768px)
- **Layout**: 1-Column List (Cards stack vertically).
- **Search**: Takes over the entire screen on focus.
- **Filters**: Full-screen modal overlay.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'RESPONSIVE_GUIDE.md'), rg);

console.log("Directory Specs Generated.");
