const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751';

// 1. COMPANY_PROFILE_UX_v2.md
const ux = `# COMPANY PROFILE UX V2
## Core Philosophy
Transition from a basic "directory listing" to a high-density, action-oriented **Company Intelligence Platform**. Inspired by Bloomberg, PitchBook, and IQVIA.
- **Data Density over Whitespace**: Reduce dead space. Surface critical KPIs immediately.
- **Progressive Disclosure**: High-level metrics in the Hero and Overview, deep-dive data tables in specific tabs.
- **Analytical Over Informational**: Use sparklines, trend charts, and relationship graphs instead of flat text lists.

## Section Audit
- **Hero/Header**: KEEP & REDESIGN. Needs to instantly convey scale (Market Cap, Revenue, Employee count) rather than just location and name.
- **Overview**: KEEP & REDESIGN. Needs a "Tear Sheet" approach. 
- **Corporate/Leadership**: MERGE into "Corporate Governance".
- **Products & Clinical Trials**: KEEP. Needs specialized data-grid layouts.
- **Facilities & Manufacturing**: MERGE into "Global Footprint" with a Map visualization.
- **Research, Publications, Patents**: MERGE into "Innovation & IP".
- **Regulatory**: KEEP. Needs high-priority alert badges (e.g. Warning Letters).
- **Competitors & Related**: REDESIGN into a visual "Relationship Graph".
- **News**: REMOVE (Requires continuous scraping, low trust without high-tier API).
- **Documents**: MERGE into "Financials & Filings".
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'COMPANY_PROFILE_UX_v2.md'), ux);

// 2. COMPANY_PROFILE_INFORMATION_HIERARCHY.md
const ih = `# INFORMATION HIERARCHY

## 1. Global Navigation (Top)
- Search Bar, Breadcrumbs, Export to PDF/Excel.

## 2. Intelligence Header (Hero)
- **Primary**: Legal Name, Logo, Ticker, Verification Badge.
- **Secondary KPIs**: Market Cap, TTM Revenue, Employee Count, Year Founded.
- **Actions**: Track Company, Export Tear Sheet.

## 3. Left Navigation Rail (Sticky)
- Overview, Financials & Filings, Products & Pipeline, Innovation & IP, Global Footprint, Corporate Governance, Regulatory.

## 4. Main Content Area (Tear Sheet - Overview Tab)
- **Column 1 (60%)**: Description, Recent Key Events (Timeline), Top Products (Table preview).
- **Column 2 (40%)**: Stock Chart (Sparkline), Financial Summary, HQ Location (Mini-map), Top Executives.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'COMPANY_PROFILE_INFORMATION_HIERARCHY.md'), ih);

// 3. SECTION_REDESIGN_GUIDE.md
const rg = `# SECTION REDESIGN GUIDE

## Products & Pipeline (Clinical Trials + Products)
- **Purpose**: Show the commercial and experimental engine of the company.
- **Business Value**: Extremely high for investors and competitors tracking R&D.
- **Ideal Layout (Desktop)**: A combined Data Grid (Ag-Grid style). Column filters for Phase (I, II, III), Status, Therapeutic Area. 
- **Ideal Layout (Mobile)**: Stacked cards with Phase badges.

## Innovation & IP (Patents + Publications)
- **Purpose**: Quantify R&D output.
- **Ideal Layout**: A dual-axis line chart showing Patents Granted vs Publications over the last 10 years, followed by a searchable table of recent filings.

## Global Footprint (Facilities)
- **Purpose**: Visualizing manufacturing and operational scale.
- **Ideal Layout**: Interactive WebGL Map (Mapbox/Deck.gl) showing HQ, Manufacturing Sites, and R&D Centers as distinct pin colors.

## Identification of Weaknesses in V1
- **Visual Imbalance**: The V1 Hero is too tall and wastes vertical space.
- **Empty Cards**: V1 Sidebar shows empty "0" badges for unimplemented features.
- **Poor Typography**: Too much reliance on large, bold fonts rather than dense, readable data fonts (e.g., Inter/Roboto Mono for numbers).
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'SECTION_REDESIGN_GUIDE.md'), rg);

// 4. RESPONSIVE_LAYOUT_GUIDE.md
const rlg = `# RESPONSIVE LAYOUT GUIDE

## Desktop (> 1024px)
- **Structure**: 3-Column layout for Overview. Left Rail (250px) + Main Content (Fluid) + Contextual Right Rail (300px for KPIs/Peers).
- **Components**: Complex Data Grids (horizontal scrolling allowed within the grid), massive relationship graphs.

## Tablet (768px - 1024px)
- **Structure**: 2-Column. Left Rail collapses to Icons-only (80px). Contextual Right Rail drops below Main Content.
- **Components**: Data Grids reduce visible columns (hide lesser metadata like exact dates, keep years). 

## Mobile (< 768px)
- **Structure**: 1-Column. Sidebar becomes a horizontal swipeable tab bar at the top or a hamburger menu.
- **Components**: All tables convert to Card Lists. Maps become static images or hide behind a "Tap to interact" overlay to prevent scroll trapping.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'RESPONSIVE_LAYOUT_GUIDE.md'), rlg);

// 5. VISUAL_PRIORITY_GUIDE.md
const vpg = `# VISUAL PRIORITY GUIDE

## 1. High Priority (First 3 seconds of eye-tracking)
- **Company Name & Ticker**: The absolute anchor.
- **Verification Status**: Builds instant platform trust.
- **Top 3 KPIs**: Revenue, Market Cap, Pipeline Size. (Use large, semi-bold typography, monospace for digits).

## 2. Medium Priority (Exploration)
- **Data Grids (Products, Trials, Patents)**: Users will spend 90% of their time here. Must have zebra striping, sticky headers, and clear visual hierarchy (e.g., Phase III badges in bright green, Phase I in gray).
- **Charts & Visualizations**: Use a restrained, premium color palette (e.g., Slate, Indigo, Emerald). Avoid default charting library colors.

## 3. Low Priority (Reference)
- **Raw Identifiers**: CIK, LEI, DUNS. Push to the bottom of the Corporate profile or a small metadata footer card.
- **Extensive Descriptions**: Truncate after 3 lines with a "Read More" expander to save vertical real estate.

## Metrics & Badges
- **Badges**: Use pill-shaped badges for Statuses (e.g., \`[APPROVED]\`, \`[RECRUITING]\`, \`[WARNING LETTER]\`).
- **Data Quality Alerts**: Show a subtle "!" icon next to estimated or outdated data.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'VISUAL_PRIORITY_GUIDE.md'), vpg);

console.log("UX Specifications Generated.");
