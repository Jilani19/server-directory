# COMPANY CARD REPORT

## Intelligence Redesign (`CompanyGrid.tsx`)
The previous basic layout mapping crude product counts has been eradicated. The Company Card is now a dense, highly polished Business Intelligence component.

### Data Placements
1. **Dynamic Headers**: Features the full Legal Name, a prominent Geographic Location pinpoint (e.g. `Cambridge, MA, USA`), and a top-right `VERIFIED` status badge if `status === ACTIVE`.
2. **Core Info Grid**: A 3-column micro-grid cleanly displaying `Type (Public/Private)`, `Founded Year`, and `Stock (Exchange: Ticker)`.
3. **Tags & Badges**: Adjacent to the primary Category Pill, the system computes and renders an `AI Confidence Badge`. The badge dynamically colors itself (Green/High, Yellow/Medium, Red/Low) by analyzing the native `verificationScore` returned from the API database loop.
4. **Temporal Context**: The footer reads the `updatedAt` database timestamp and parses it through `date-fns` to produce a human-readable string (e.g., `Updated 2 days ago`).

### Primary & Secondary Actions
The card restricts clutter by isolating actions to specific zones:
- **Top Right Gradient Overlay**: Features minimalist, glassy icon buttons for `Compare` and `Bookmark` arrays.
- **Footer Row**: Hosts a prominent, hyper-branded `View Profile` Primary CTA, flanked by tertiary icon actions routing out to the company's external `Website` or triggering a native `Share` overlay hook.

### Visual Micro-Interactions
The cards employ a high-end CSS transition matrix (`CompanyGrid.module.css`). When hovered, the card physically lifts off the grid `translateY(-4px)`, generates a massive violet-tinted soft dropshadow, and subtly glows at the borders, creating an extremely tactile, premium interaction surface.
