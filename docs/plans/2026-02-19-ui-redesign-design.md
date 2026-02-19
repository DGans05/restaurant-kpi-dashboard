# NYP KPI UI Redesign — Design Document
_Date: 2026-02-19_

## Context

The current dashboard uses a generic shadcn/ui aesthetic with Bebas Neue + Poppins fonts and a standard dark/light mode toggle. The goal is a full visual redesign that puts the New York Pizza brand front and centre: bold slab-serif branding, a sophisticated green-family dark palette, warm off-white cards, and the clean "floating card on dark canvas" feeling established by the login page mockup.

The redesign is design-system-first: all tokens are locked here, a `/style-guide` page is built to render them visually, and that page is captured and pushed into the Figma file as a new Style Guide page for ongoing design reference.

---

## Design Tokens

### Colors

| CSS Variable | Value | Role |
|---|---|---|
| `--nyp-green` | `#009A44` | Topbar background, brand accent |
| `--highlight` | `#00311F` | Active nav pill, selected states, deep green |
| `--background` | `#1F1F1F` | Primary canvas |
| `--background-alt` | `#00272B` | Secondary dark surface, gradient target |
| `--card` | `#FFF6E9` | Card / panel surfaces (warm off-white) |
| `--sidebar` | `#FFF6E9` | Sidebar surface |
| `--foreground` | `#1D2532` | Body text on light surfaces |
| `--foreground-on-dark` | `#FFF6E9` | Text / icons on dark surfaces |
| `--border` | `rgba(29,37,50,0.12)` | Subtle borders on light cards |
| `--input` | `#EDE8DF` | Input field fill (slightly darker warm-white) |
| `--muted-foreground` | `#6B6B6B` | Placeholder text, secondary labels |
| `--nyp-red` | `#F3001D` | Alerts, negative KPIs |
| `--nyp-yellow` | `#FFDA28` | Plan/target lines |
| `--nyp-orange` | `#FFA51D` | Labour / cost metrics |
| `--nyp-blue` | `#006DEC` | Info indicators |

**Background gradient:** `linear-gradient(135deg, #1F1F1F 0%, #00272B 100%)` applied to `<body>` — gives the canvas subtle green-tinted depth.

### Typography

| Role | Family | Weight | Size | Notes |
|---|---|---|---|---|
| Logo "NYP KPI" | Arvo | Bold 700 | 50px | Slab serif brand mark |
| H1 | Inria Sans | Bold 700 | 40px | Letter-spacing −8px |
| H2 | Inria Sans | Bold 700 | 28px | |
| H3 | Inria Sans | Bold 700 | 20px | |
| Body | Inria Sans | Regular 400 | 16px | |
| Label | Inria Sans | Bold 700 | 14px | Form labels, card labels |
| Caption | Inria Sans | Regular 400 | 12px | Secondary info |
| Metric value | Inria Sans | Bold 700 | 32–48px | tabular-nums |

Both fonts loaded via `next/font/google`.

### Spacing & Radius

| Token | Value |
|---|---|
| `--radius` | `20px` (cards, panels) |
| `--radius-sm` | `8px` (buttons, inputs) |
| `--radius-xs` | `5px` (nav pills) |
| Base grid | 8px |
| Card padding | 24px |
| Sidebar width | 220px |
| Topbar height | 112px |

---

## Components

### Layout Chrome
- **Sidebar**: `#FFF6E9` background, 220px wide, rounded top/bottom-right corners (20px), logo at top, nav items stacked, "uitloggen" pinned at bottom.
- **Topbar**: `#009A44` full-width green bar, 112px tall, action buttons + avatar on the right.
- **Canvas**: `linear-gradient(135deg, #1F1F1F → #00272B)` fills the remaining space.

### Navigation
- **Active nav pill**: `#00311F` fill, `#FFF6E9` text, Inria Sans Bold 14px, 5px radius.
- **Inactive nav item**: Transparent, `#1D2532` text, same font.
- **Logout button**: Same inactive style, sits at the bottom of the sidebar.

### Buttons
- **Primary**: `#1D2532` bg, `#FFF6E9` text, 8px radius, Inria Sans Bold 14px.
- **Accent**: `#009A44` bg, `#FFF6E9` text — used sparingly for CTAs.
- **Ghost**: Transparent, `#1D2532` text, `#1D2532` border.

### Cards (KPI widgets)
- Background: `#FFF6E9`
- Border: `1px solid rgba(29,37,50,0.12)`
- Border-radius: `20px`
- Padding: `24px`
- Text: `#1D2532`
- Metric values: Inria Sans Bold, tabular-nums

### Inputs
- Fill: `#EDE8DF` (slightly darker warm-white)
- Border: `1px solid rgba(29,37,50,0.15)`
- Radius: `8px`
- Placeholder: `#6B6B6B`, Inria Sans Regular 14px
- Focus ring: `#009A44`

### Avatar / User circle
- `#00272B` bg, `#FFF6E9` icon — sits in topbar right corner, circular.

---

## Style Guide Page (`/style-guide`)

A dedicated Next.js page that renders the full design system visually, structured as:

1. **Color Palette** — swatches for all 14 tokens with hex labels
2. **Typography Scale** — live text examples for each type role
3. **Spacing & Radius** — visual blocks showing the spacing and radius scale
4. **Buttons** — all variants side-by-side (primary / accent / ghost)
5. **Nav Items** — active + inactive states
6. **Inputs** — default / focus / error states
7. **Cards** — small KPI card, wide chart card, full examples on the dark gradient canvas
8. **Logo** — rendered at correct size on both `#FFF6E9` and dark backgrounds
9. **Full layout preview** — sidebar + topbar + a 3-card sample grid

The page renders against the `#1F1F1F → #00272B` gradient background so the light cards are seen in context.

---

## Files Changed

| File | Change |
|---|---|
| `app/layout.tsx` | Replace `next/font` imports: Bebas Neue + Poppins → **Arvo** + **Inria Sans** |
| `app/globals.css` | Rewrite all CSS variables with new palette; remove `.dark {}` block; update body gradient; update typography |
| `lib/utils/styles.ts` | Update `cardStyles` for warm off-white cards (`#FFF6E9`, 20px radius) |
| `components/providers/ThemeProvider.tsx` | Remove dark mode — set `forcedTheme="light"` or remove entirely |
| `components/layout/ThemeToggle.tsx` | Delete — no longer needed |
| `app/style-guide/page.tsx` | **New file** — full visual style guide |

---

## Figma Delivery

After the `/style-guide` page renders correctly:
1. Start dev server (`npm run dev`)
2. Use `generate_figma_design` MCP tool (existingFile mode) with file key `ThwKBGDNaBVM5i03FgKKyL`
3. Tool returns a JS capture snippet — run in browser on `localhost:3000/style-guide`
4. Re-call tool with captureId to push to Figma as a new page

---

## Verification

- [ ] `npm run dev` starts without errors
- [ ] `/style-guide` renders with correct colors, fonts, components
- [ ] Arvo Bold visible on logo; Inria Sans visible on all other text
- [ ] Background shows gradient (`#1F1F1F` → `#00272B`)
- [ ] Cards render in `#FFF6E9`
- [ ] Active nav uses `#00311F`
- [ ] No dark mode toggle visible in UI
- [ ] `npm run build` passes with no type errors
- [ ] Style guide page pushed successfully to Figma file
