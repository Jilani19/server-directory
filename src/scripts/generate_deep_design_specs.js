const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = 'C:/Users/JILANI/.gemini/antigravity-ide/brain/cdcdf833-10e5-4103-8430-a2650aa7b751';

// 1. DESIGN_SYSTEM.md
const ds = `# cGxP.Directory Definitive Design System

## Core Philosophy
The cGxP.Directory design language enforces **High-Density Intelligence**. Every page must use the identical visual language.
- Function over decoration.
- Legibility at scale.
- Predictable visual states.

## 1. Typography
- **Primary Typeface**: Inter (UI, labels, paragraphs).
- **Data Typeface**: Roboto Mono (Numbers, metrics, tabular data).
- **Hierarchy**:
  - H1: 24px, SemiBold
  - H2: 20px, Medium
  - H3: 16px, Medium
  - Body: 14px, Regular
  - Caption/Data: 12px, Regular/Mono

## 2. Colors
- **Brand/Primary**: Indigo (\`#4F46E5\`) to Slate (\`#0F172A\`).
- **Backgrounds**: Base (\`#F8FAFC\`), Cards (\`#FFFFFF\`), Hover (\`#F1F5F9\`).
- **Borders**: Subtle (\`#E2E8F0\`), Strong (\`#CBD5E1\`).
- **Semantic**:
  - Success (Emerald: \`#10B981\`)
  - Warning (Amber: \`#F59E0B\`)
  - Error (Rose: \`#E11D48\`)
  - Info (Blue: \`#3B82F6\`)

## 3. Spacing & Border Radius
- **Spacing Scale**: 4px base (4, 8, 12, 16, 24, 32).
- **Border Radius**: 6px for cards, 4px for buttons/inputs, 9999px for pills.

## 4. Elevation (Shadows)
- **Level 1 (Cards)**: \`0 1px 3px rgba(0,0,0,0.1)\`
- **Level 2 (Hover/Dropdowns)**: \`0 4px 6px -1px rgba(0,0,0,0.1)\`
- **Level 3 (Modals)**: \`0 10px 15px -3px rgba(0,0,0,0.1)\`

## 5. UI Elements
- **Cards**: Flat white background, Level 1 shadow, 6px radius, 16px padding.
- **Buttons**:
  - Primary: Indigo background, White text.
  - Secondary: White background, Slate border, Slate text.
  - Ghost: Transparent background, Slate text, Slate hover.
- **Badges/Tags**:
  - Status Badges: Solid colored dot + text.
  - Tags: Soft background (e.g. 10% opacity blue) + Blue text.
- **Tables/Data Grids**: Zebra striping off by default. Bottom border only per row. Sticky headers.
- **Forms/Inputs**: 40px height, 4px radius, subtle border. Focus ring: 2px Solid Indigo offset.
- **Metrics**: Massive, monospaced digits.
- **Charts/Maps**: Use the brand sequential palette (Indigo -> Blue -> Sky).
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'DESIGN_SYSTEM.md'), ds);

// 2. COMPONENT_LIBRARY.md
const cl = `# COMPONENT LIBRARY STANDARDS

## 1. Buttons
- **Purpose**: Trigger actions.
- **Variants**: Primary, Secondary, Ghost, Danger.
- **Sizes**: Sm (32px), Md (40px), Lg (48px).
- **States**: Default, Hover, Active, Disabled, Loading.
- **Usage Rules**: Max 1 Primary button per view.

## 2. Badges & Status Indicators
- **Purpose**: Instantly classify entities (e.g. APPROVED, REJECTED).
- **Variants**: Solid, Soft, Outline.
- **Accessibility**: Must include screen-reader only text if relying purely on color.

## 3. Data Grids
- **Purpose**: Display massive datasets (Clinical Trials, Products).
- **Features**: Sortable columns, resizable columns, sticky headers.
- **Spacing**: Dense (32px row height) or Standard (48px row height).

## 4. State Containers
- **Loading States**: Skeleton loaders mimicking the final content shape. No spinning circles for full pages.
- **Empty States**: Soft illustration + "No data found" + Clear action button.
- **Error States**: Red warning icon + Technical error string + "Retry" button.
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'COMPONENT_LIBRARY.md'), cl);

// 3. VISUAL_TOKENS.md
const vt = `# VISUAL TOKENS (CSS Variables)

\`\`\`css
:root {
  /* Colors */
  --clr-primary: #4F46E5;
  --clr-slate-900: #0F172A;
  --clr-slate-100: #F1F5F9;
  
  --clr-success: #10B981;
  --clr-error: #E11D48;
  --clr-warning: #F59E0B;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  
  /* Radii */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-pill: 9999px;

  /* Elevation */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}
\`\`\`
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'VISUAL_TOKENS.md'), vt);

// 4. ACCESSIBILITY_GUIDE.md
const ag = `# ACCESSIBILITY GUIDE (A11Y)

## Keyboard Navigation
- All interactive elements must be fully reachable via \`Tab\`.
- **Focus Rings**: Never use \`outline: none\` without a visible \`box-shadow\` replacement. Standardize on \`ring-2 ring-indigo-500 ring-offset-2\`.

## Screen Readers
- **ARIA Labels**: Use \`aria-label\` for icon-only buttons (e.g. Search, Close).
- **Live Regions**: When filters are applied, a visually hidden \`aria-live="polite"\` region must announce: "Updated results. 45 companies found."

## Color Contrast
- Standard text against backgrounds must exceed **4.5:1** contrast ratio (WCAG AA).
- Large text (KPIs) must exceed **3.0:1**.
- Do not use color as the sole indicator of status. Pair red with an "X" icon or the word "Error".
`;
fs.writeFileSync(path.join(OUTPUT_DIR, 'ACCESSIBILITY_GUIDE.md'), ag);

console.log("Deep Design System Specs Generated.");
