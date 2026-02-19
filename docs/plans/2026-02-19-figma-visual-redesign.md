# Figma Visual Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement the Figma designs for the Login page (split-screen) and Dashboard (sidebar logo lockup, header, KPI ribbon, charts panel, delivery strip) while strictly following the NYP Design System style guide.

**Architecture:** In-place reskin of existing component files — no structural refactoring, no new files except where noted. All colours, fonts and radii pulled from `globals.css` CSS custom properties. Responsive behaviour preserved (mobile hamburger stays).

**Tech Stack:** Next.js 16 App Router, Tailwind CSS 4, Inria Sans + Arvo (Google Fonts, already loaded), shadcn/ui Tabs, `public/pizza-slice.svg`

---

## Design System Rules (from `app/style-guide/page.tsx` — treat as law)

| Token | Value | Usage |
|---|---|---|
| Background | `#1F1F1F` → `#00272B` gradient | Canvas / page body |
| Card / Panel | `#FFF6E9` | All surface cards |
| Foreground (on light) | `#1D2532` | Body text on cream |
| FG on dark | `#FFF6E9` | Text on dark bg |
| Primary | `#009A44` | Brand / topbar / active elements |
| Active nav highlight | `#00311F` | Active sidebar link bg |
| Input fill | `#EDE8DF` | Standard inputs |
| Muted FG | `#6B6B6B` | Labels, captions, placeholders |
| Border | `rgba(29,37,50,0.12)` | All dividers |
| Radius large | `20px` | Cards, panels, sidebar |
| Radius standard | `8px` | Buttons, standard inputs |
| Radius small | `5px` | Login inputs, login button |

**Typography (strict):**
- Logo: `font-display` (Arvo) Bold, 50px, `#1D2532` on light / `#FFF6E9` on dark
- Chart titles: `font-display` (Arvo) Bold, 18px, `#1D2532`
- H1: `font-sans` (Inria Sans) Bold, 40px, -0.02em tracking
- H2: `font-sans` Bold, 28px
- H3: `font-sans` Bold, 20px
- Label/nav: `font-sans` Bold, 14px
- Caption/subtitle: `font-sans` Regular, 12px, `#6B6B6B`
- Metric value: `font-sans` Bold, tabular-nums
- KPI label: `font-sans` Bold, 10px, uppercase, 0.5px letter-spacing, `#6B6B6B`

**No Poppins** — style guide uses Inria Sans exclusively. Do not add a third font.

**Active nav:** `bg-[#00311F]` text-cream rounded-[5px] (style guide), NOT the green shadow variant shown in Figma. Style guide is strict law.

---

## Task 1: Auth Layout — Split-Screen Shell

**File:** `app/(auth)/layout.tsx`

**What:** Replace the centred `flex items-center justify-center` wrapper with a full-bleed two-column split. Left panel is the cream card; right side exposes the dark body gradient.

**Step 1: Update the layout**

Replace the entire file content with:

```tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left cream panel */}
      <div className="relative flex w-full flex-col justify-center overflow-hidden bg-[#FFF6E9] px-16 py-12 md:w-[45%] md:rounded-r-[40px]">
        {children}
      </div>
      {/* Right dark side — just exposes the body gradient */}
      <div className="hidden flex-1 md:block" />
    </div>
  );
}
```

**Step 2: Verify dev server renders two-column layout at ≥768px, single column on mobile**

Run: `npm run dev` and visit `http://localhost:3000/login`

**Step 3: Commit**

```bash
git add app/(auth)/layout.tsx
git commit -m "feat: split-screen auth layout for login page"
```

---

## Task 2: Login Page — Full Redesign

**File:** `app/(auth)/login/page.tsx`

**What:** Remove the centred card wrapper. Add pizza image top-right of panel, large Arvo logo, large Inria Sans form labels (28px H2 style), style guide inputs and dark submit button. All logic (useState, handleSubmit, Supabase call) stays identical — only JSX structure and classNames change.

**Step 1: Replace JSX, keep all logic**

The new return statement (logic above it is unchanged):

```tsx
  return (
    <>
      {/* Pizza image — top-right corner of the panel */}
      <div className="absolute right-0 top-0 h-48 w-48 opacity-10 pointer-events-none select-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pizza-slice.svg" alt="" className="h-full w-full object-contain" />
      </div>

      {/* Logo */}
      <div className="mb-10">
        <p className="font-display font-bold text-[50px] leading-none tracking-[-0.03em] text-[#1D2532]">
          NYP KPI
        </p>
        <p className="mt-2 text-xs font-sans font-normal uppercase tracking-[1.2px] text-[#6B6B6B]">
          Restaurant Dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-7 w-full max-w-[540px]">
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[28px] font-bold font-sans leading-tight tracking-[-0.08em] text-[#1D2532]">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="naam@restaurant.nl"
            className="w-full rounded-[5px] border border-[#E5E7EB] bg-[rgba(245,245,245,0.5)] px-4 py-2.5 text-sm font-sans text-[#1D2532] placeholder:text-[#6B6B6B] outline-none focus:border-[#009A44] focus:ring-2 focus:ring-[#009A44]/20 transition-all"
          />
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[28px] font-bold font-sans leading-tight tracking-[-0.08em] text-[#1D2532]">
            Wachtwoord
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full rounded-[5px] border border-[#E5E7EB] bg-[rgba(245,245,245,0.5)] px-4 py-2.5 text-sm font-sans text-[#1D2532] placeholder:text-[#6B6B6B] outline-none focus:border-[#009A44] focus:ring-2 focus:ring-[#009A44]/20 transition-all"
          />
        </div>

        {error && (
          <p className="text-sm text-[#F3001D]">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[5px] bg-[#1F1F1F] px-4 py-2.5 text-[24px] font-bold font-sans leading-tight tracking-[-0.08em] text-[#FFF6E9] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Bezig..." : "Inloggen"}
        </button>
      </form>
    </>
  );
```

**Step 2: Remove the Button import** (no longer used — replaced with native `<button>`)

Remove line: `import { Button } from "@/components/ui/button";`

Keep: `import { useState } from "react"`, `import { useRouter }`, `import { createClient }`, `import { Flame }` → actually remove `Flame` too since it's gone.

**Step 3: Verify in browser** — login page should show split-screen, large logo, big labels, dark submit button

**Step 4: Commit**

```bash
git add app/(auth)/login/page.tsx
git commit -m "feat: redesign login page to match Figma split-screen layout"
```

---

## Task 3: Sidebar — Logo Lockup

**File:** `components/layout/Sidebar.tsx`

**What:** Replace the brand area (Flame icon + small "NYP KPI" text) with the style-guide logo lockup: Arvo Bold "NYP KPI" + "Restaurant Dashboard" subtitle + pizza-slice.svg image. Keep all nav links, admin-gating, mobile hamburger, and logout button completely unchanged.

**Step 1: Remove unused import**

Remove `Flame` from the lucide-react import line (line 11).

**Step 2: Replace the brand `<div>` block**

Find the brand block (lines 112–137 in current file, from `{/* Brand */}` to the closing `</div>` of the brand section). Replace it with:

```tsx
        {/* Brand */}
        <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/pizza-slice.svg"
              alt="NYP KPI"
              width={40}
              height={40}
              className="shrink-0 object-contain"
            />
            <div>
              <p className="font-display font-bold text-[22px] leading-none tracking-[-0.03em] text-[#1D2532]">
                NYP KPI
              </p>
              <p className="mt-1 text-[10px] font-sans font-normal uppercase tracking-[0.12em] text-[#6B6B6B]">
                Restaurant Dashboard
              </p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="size-4" />
          </Button>
        </div>
```

**Step 3: Verify** — sidebar shows pizza icon + "NYP KPI" / "Restaurant Dashboard" on desktop and mobile

**Step 4: Commit**

```bash
git add components/layout/Sidebar.tsx
git commit -m "feat: update sidebar brand area with NYP logo lockup"
```

---

## Task 4: Header — Larger Arvo Title, Remove Search Bar

**File:** `components/layout/Header.tsx`

**What:** Remove the search bar entirely (not in Figma). Change page title from 24px Inria Sans to 32px Arvo Bold. Keep user initials + username + chevron unchanged.

**Step 1: Remove the Search import**

Remove `Search` from the lucide-react import line.

**Step 2: Remove the search bar block**

Delete the entire `{/* Center: Search bar */}` div (lines 67–76 in current file):

```tsx
      {/* Center: Search bar */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        ...
      </div>
```

**Step 3: Update the page title className**

Change line 63:
```tsx
// FROM:
<h1 className="text-2xl font-bold text-[#FFF6E9]">{getPageTitle(pathname)}</h1>

// TO:
<h1 className="font-display font-bold text-[32px] leading-none tracking-tight text-[#FFF6E9]">{getPageTitle(pathname)}</h1>
```

**Step 4: Verify** — header shows large Arvo title, no search bar, user profile still on right

**Step 5: Commit**

```bash
git add components/layout/Header.tsx
git commit -m "feat: update header title to Arvo 32px, remove search bar"
```

---

## Task 5: Charts Panel — Tab List Styling

**File:** `components/dashboard/unified/ChartsPanel.tsx`

**What:** The shadcn `<TabsList>` currently uses its default styling. Figma shows `bg-[#EDE8DF]` pill container with `bg-[#1F1F1F] text-white shadow` active trigger. Apply via Tailwind className overrides.

**Step 1: Add className overrides to TabsList and TabsTrigger**

There are two `<Tabs>` blocks in this file (lines ~34 and ~54). Apply to both:

```tsx
// TabsList — both instances:
<TabsList className="mb-4 bg-[#EDE8DF] rounded-[20px] p-1">

// TabsTrigger — active style via data-[state=active]:
<TabsTrigger
  value="revenue"
  className="rounded-[20px] text-[14px] font-sans font-normal data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-[#FFF6E9] data-[state=active]:shadow-sm text-[rgba(29,37,50,0.6)]"
>
  Omzet
</TabsTrigger>
<TabsTrigger
  value="hours"
  className="rounded-[20px] text-[14px] font-sans font-normal data-[state=active]:bg-[#1F1F1F] data-[state=active]:text-[#FFF6E9] data-[state=active]:shadow-sm text-[rgba(29,37,50,0.6)]"
>
  Uren
</TabsTrigger>
```

Apply identical className patterns to the Arbeid / Maaktijd tabs in the second `<Tabs>` block.

**Step 2: Verify** — tab pills show cream-sand background, active tab is dark with white text

**Step 3: Commit**

```bash
git add components/dashboard/unified/ChartsPanel.tsx
git commit -m "feat: style charts panel tabs to match Figma dark-active pill"
```

---

## Task 6: Chart Headings — Arvo Bold 18px

**Files:**
- `components/dashboard/RevenueChart.tsx` (lines 102–104, 115–116)
- `components/dashboard/LabourChart.tsx` (same pattern, "ARBEIDSKOSTEN")
- `components/dashboard/WorkedHoursChart.tsx` (same pattern)
- `components/dashboard/MakeTimeChart.tsx` (same pattern)

**What:** Chart titles inside panels should use Arvo Bold 18px per Figma (`font-display text-[18px]`). The subtitle caption should be 12px Inria Sans uppercase with 0.6px tracking.

**Step 1: Update RevenueChart embedded heading (line 102–104)**

```tsx
// FROM:
<h3 className="text-lg font-display text-foreground mb-1">OMZET</h3>
<p className="mb-4 text-xs uppercase tracking-wider text-muted-foreground font-medium">
  Dagelijkse bruto/netto omzet vs plan
</p>

// TO:
<h3 className="font-display font-bold text-[18px] text-[#1D2532] mb-1">OMZET</h3>
<p className="mb-4 text-[12px] font-sans uppercase tracking-[0.6px] text-[#6B6B6B]">
  Dagelijkse bruto/netto omzet vs plan
</p>
```

**Step 2: Update RevenueChart standalone heading (lines 115–116)** — same className changes.

**Step 3: Repeat for LabourChart** — title "ARBEIDSKOSTEN", subtitle "Dagelijkse arbeidskosten vs plan"

**Step 4: Repeat for WorkedHoursChart** — find the embedded/standalone heading and apply same classNames

**Step 5: Repeat for MakeTimeChart** — title "MAAK- & RIJTIJD"

**Step 6: Verify** — chart titles render in Arvo Bold at 18px inside the cream panels

**Step 7: Commit**

```bash
git add components/dashboard/RevenueChart.tsx components/dashboard/LabourChart.tsx components/dashboard/WorkedHoursChart.tsx components/dashboard/MakeTimeChart.tsx
git commit -m "feat: chart headings to Arvo Bold 18px per Figma/style guide"
```

---

## Task 7: KPI Ribbon Item — Typography Polish

**File:** `components/dashboard/unified/KPIRibbonItem.tsx`

**What:** Align label and value typography precisely to Figma + style guide. Label: 10px Bold uppercase 0.5px tracking. Value: 20px Bold tabular-nums. Minor gap/padding tightening.

**Step 1: Update the JSX**

```tsx
// FROM (line 31):
<div className={`flex flex-col gap-1 px-4 py-4 ${className ?? ""}`}>
  <div className="flex items-center gap-1.5">
    <span className="text-muted-foreground">{icon}</span>
    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </span>
  </div>
  <p className="text-xl font-semibold metric-value">{value}</p>

// TO:
<div className={`flex flex-col gap-1 px-4 py-4 ${className ?? ""}`}>
  <div className="flex items-center gap-1.5">
    <span className="text-[#6B6B6B]">{icon}</span>
    <span className="text-[10px] font-bold font-sans uppercase tracking-[0.5px] text-[#6B6B6B]">
      {label}
    </span>
  </div>
  <p className="text-[20px] font-bold font-sans metric-value text-foreground">{value}</p>
```

**Step 2: Verify** — KPI ribbon labels and values match style guide proportions

**Step 3: Commit**

```bash
git add components/dashboard/unified/KPIRibbonItem.tsx
git commit -m "feat: KPI ribbon item label/value typography to style guide spec"
```

---

## Task 8: Delivery Strip Item — Typography Polish

**File:** `components/dashboard/unified/DeliveryStripItem.tsx`

**What:** Same label/value treatment as KPI ribbon.

**Step 1: Update JSX**

```tsx
// FROM (line 19–27):
<div className="flex items-center gap-3 px-4 py-3">
  <span className="text-muted-foreground">{icon}</span>
  <div>
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </p>
    <p className="text-lg font-semibold metric-value">{value}</p>
    {children}
  </div>
</div>

// TO:
<div className="flex items-center gap-3 px-4 py-3">
  <span className="text-[#6B6B6B]">{icon}</span>
  <div>
    <p className="text-[10px] font-bold font-sans uppercase tracking-[0.5px] text-[#6B6B6B]">
      {label}
    </p>
    <p className="text-[18px] font-bold font-sans metric-value text-foreground">{value}</p>
    {children}
  </div>
</div>
```

**Step 2: Verify** — delivery strip shows correct label/value sizes

**Step 3: Commit**

```bash
git add components/dashboard/unified/DeliveryStripItem.tsx
git commit -m "feat: delivery strip item typography to style guide spec"
```

---

## Task 9: Final Visual QA

**What:** Walk through each screen and verify against the Figma CSS + style guide rules.

**Checklist:**
- [ ] `/login` — split-screen on desktop, stacked on mobile, large logo, dark submit button
- [ ] Sidebar — pizza + "NYP KPI" / "Restaurant Dashboard", active link `#00311F`, logout green
- [ ] Header — Arvo 32px title, no search bar, user profile right-aligned
- [ ] Dashboard KPI ribbon — 10px labels, 20px values, correct border dividers
- [ ] Charts panel — `#EDE8DF` tab container, `#1F1F1F` active tab, Arvo 18px chart titles
- [ ] Delivery strip — 10px labels, 18px values, icon colours match metric type
- [ ] No hardcoded colour values outside design system palette
- [ ] No `console.log` statements added
- [ ] Mobile sidebar hamburger still works

**Step 1: Run lint**

```bash
npm run lint
```

Expected: 0 errors

**Step 2: Run build**

```bash
npm run build
```

Expected: successful build, 0 type errors

**Step 3: Commit if any lint/type fixes were needed**

```bash
git add -A
git commit -m "fix: lint and type errors from visual redesign"
```
