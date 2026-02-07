# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Restaurant KPI Dashboard — a Next.js 16 (App Router) TypeScript application for tracking restaurant performance metrics (revenue, labour costs, food costs, prime cost, delivery times, order counts). Uses Supabase as the production database with a seed data fallback for local development. Supports multi-restaurant views with weekly/monthly period selection.

## Commands

```bash
npm run dev       # Start Next.js dev server (port 3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
```

No test runner is configured yet. Scripts in `scripts/` are excluded from `tsconfig.json` and run independently via `ts-node`/`tsx`.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router) with TypeScript 5+ (strict mode)
- **Database**: Supabase (PostgreSQL + Storage) — falls back to seed data when `NEXT_PUBLIC_SUPABASE_URL` is not set
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Charts**: Recharts (ComposedChart with Bar + Line, threshold zones)
- **Validation**: Zod schemas for runtime validation (`lib/schemas.ts`)
- **Theming**: next-themes (light/dark)
- **Date utils**: date-fns
- **Deployment**: Vercel

### Path Alias
`@/*` maps to the project root (e.g., `import { cn } from '@/lib/utils'`).

### Data Layer (Repository Pattern)

```
Dashboard Page (server component)
  → lib/services/kpi-service.ts (React cache + business logic)
    → lib/repositories/index.ts (lazy singleton factory)
      → SupabaseKPIRepository | SeedKPIRepository
```

- **`lib/types.ts`** — Core types: `KPIEntry`, `KPISummary`, `ChartDataPoint`, `DeliveryDataPoint`, `DeliverySummary`, `Report`, `ReportType`
- **`lib/schemas.ts`** — Zod schemas mirroring types for runtime validation
- **`lib/repositories/index.ts`** — Factory with lazy singletons: `getKPIRepository()`, `getRestaurantRepository()`, `getDeliveryRepository()`
- **`lib/repositories/kpi-repository.ts`** — `KPIRepository` and `RestaurantRepository` interfaces
- **`lib/repositories/supabase-repository.ts`** — Supabase implementations
- **`lib/repositories/seed-repository.ts`** — Seed data implementations (local dev)
- **`lib/repositories/report-repository.ts`** — `ReportRepository` interface
- **`lib/repositories/supabase-report-repository.ts`** — Report CRUD via Supabase
- **`lib/repositories/excel-delivery-repository.ts`** — Delivery data from Excel files (path: `EXCEL_DATA_PATH` env var)
- **`lib/services/kpi-service.ts`** — Exports `getKPISummary`, `getChartData`, `getDeliveryData`, `getDeliverySummary`. Uses shared `getKPIEntries` cache to deduplicate repository calls within a render pass. Cache keys use ISO strings (not Date objects) for proper React `cache()` deduplication.
- **`lib/services/storage-service.ts`** — Supabase Storage upload/download with path sanitization and extension whitelist

### Route Groups & Pages

- **`app/page.tsx`** — Redirects to `/dashboard`
- **`app/(dashboard)/layout.tsx`** — Sidebar + Header layout
- **`app/(dashboard)/dashboard/page.tsx`** — Main KPI dashboard (server component, `force-dynamic`). Accepts `?view=week|month`, `?week=YYYY-WNN`, `?month=YYYY-MM`, `?restaurantId=` search params. All validated with Zod.
- **`app/(dashboard)/reports/page.tsx`** — Report management page
- **`app/(dashboard)/restaurants/page.tsx`** — Restaurant listing

### API Routes

- **`app/api/reports/upload/route.ts`** — File upload with validation: 10MB size limit, MIME type allowlist (xlsx/xls/csv/pdf), `restaurantId` format validation, `reportPeriod` date format validation
- **`app/api/reports/[id]/data/route.ts`** — Report data endpoint
- **`app/api/reports/[id]/download/route.ts`** — Report file download

### Key Directories

- **`components/ui/`** — shadcn/ui primitives (button, card, dialog, select)
- **`components/dashboard/`** — Dashboard components:
  - `DashboardClient` — Client orchestrator with period selector
  - `KPISummaryCards` — 4 KPI cards (revenue, labour, orders, productivity)
  - `PrimeCostCard` — 5th card showing food + labour cost combined
  - `RevenueChart` — Bar+Line chart (actual vs plan)
  - `CostBreakdownChart` (LabourChart) — Labour cost chart with threshold zones
  - `DeliveryPerformance` — 4 delivery metric cards
  - `PeriodSelector` — Week/month toggle with navigation
  - `ThresholdZone` — Recharts reference area for good/warning/danger zones
  - `MetricSparkline` — Small inline sparkline charts
  - `LongestWaitTimesModal` — Modal showing longest delivery wait times
- **`components/reports/`** — Report management: `ReportsClient`, `ReportGrid`, `ReportCard`, `UploadDialog`, `ReportViewDialog`, `YearFilter`, `MonthTabs`
- **`components/layout/`** — `Header`, `Sidebar`, `ThemeToggle`
- **`components/providers/`** — `ThemeProvider` (next-themes wrapper)

### Shared Utilities

- **`lib/utils.ts`** — `cn()` (clsx + tailwind-merge)
- **`lib/utils/formatters.ts`** — Shared formatters with module-level `Intl.NumberFormat` singletons: `formatEUR`, `formatEURWithCents`, `formatPct`, `formatNumber`, `formatEuroAxis`
- **`lib/utils/styles.ts`** — Shared style constants: `cardStyles` (shadow + border), `tooltipContentStyle` (Recharts tooltip)
- **`lib/utils/period-dates.ts`** — Period date range computation (`getCurrentWeek`, `getCurrentMonth`, `getPeriodDateRange`)
- **`lib/config/report-types.ts`** — Report type metadata registry

### Database

- **`lib/supabase/client.ts`** — Browser Supabase client
- **`lib/supabase/server.ts`** — Server Supabase client (cookies-based)
- **`lib/supabase/migrations/`** — SQL migrations (001–004)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL. If unset, seed data is used. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `EXCEL_DATA_PATH` | No | Path to Excel delivery data directory (default: `./data/rapportage`) |

## Design Conventions

- Components: PascalCase `.tsx` files
- TypeScript strict mode — avoid `any` types
- Functional components with hooks; `"use client"` only when needed
- Layouts remain server components when possible
- Shared formatting via `@/lib/utils/formatters` (never inline `new Intl.NumberFormat`)
- Shared card/tooltip styles via `@/lib/utils/styles` (never duplicate the shadow string)
- Repository pattern with lazy singletons for data access
- Zod validation on all API inputs and search params
- `console.error` only in catch blocks; no `console.log`

## Expandability

| Feature | What changes |
|---------|-------------|
| **Add new KPI metric** | Add field to `KPIEntry` + `KPISummary` in `lib/types.ts`, update `KPIEntrySchema`/`KPISummarySchema` in `lib/schemas.ts`, update `kpi-service.ts` computation, add card in dashboard components |
| **Add auth** | Add `middleware.ts`, `app/(auth)/login/`, update `(dashboard)/layout.tsx` |
| **Add new page** | Add route under `app/(dashboard)/`, add item to Sidebar `menuItems` array |
| **Add new report type** | Add to `ReportType` union in `lib/types.ts`, `ReportTypeSchema` in `lib/schemas.ts`, and `lib/config/report-types.ts` |
| **Add new repository** | Implement interface from `lib/repositories/`, add to factory in `lib/repositories/index.ts` |
