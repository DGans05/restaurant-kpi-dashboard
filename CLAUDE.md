# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Restaurant KPI Dashboard — a Next.js 16 (App Router) TypeScript application for tracking restaurant performance metrics (revenue, labour costs, food costs, prime cost, delivery times, order counts). Uses Supabase as the production database with a seed data fallback for local development. Supports multi-restaurant views with weekly/monthly period selection.

## Commands

```bash
# Development
npm run dev       # Start Next.js dev server (port 3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint

# Testing
npm test          # Run Vitest unit tests
npm run test:ui   # Run Vitest with UI
npm run test:coverage  # Run tests with coverage report
npm run test:run  # Run tests once (no watch)
npm run test:e2e  # Run Playwright E2E tests
npm run test:e2e:ui     # Run E2E tests with Playwright UI
npm run test:e2e:headed # Run E2E tests in headed mode
npm run test:e2e:debug  # Debug E2E tests

# Database
npm run seed:supabase     # Seed Supabase with sample data
npm run db:migrate        # Run production migrations
npm run db:create-user    # Create first user

# NYP Integration (Restaurant data sync)
npm run nyp:capture-cookies     # Capture NYP session cookies
npm run nyp:refresh-cookies     # Refresh cookies via API
npm run nyp:bulk-import-year    # Bulk import year data (usage: npm run nyp:bulk-import-year <restaurantId> <year>)
npm run download-reports        # Download NYP reports
npm run test-nyp-login         # Test NYP authentication

# Deployment
npm run deploy         # Deploy to Vercel production
npm run deploy:env     # Set Vercel environment variables
npm run sentry:setup   # Configure Sentry monitoring
```

Scripts in `scripts/` are excluded from `tsconfig.json` and run independently via `tsx`.

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
- **`lib/services/nyp-api-client.ts`** — HTTP client for New York Pizza Store Portal. Handles authentication via cookies (stored in `nyp_sessions` table), report generation, store switching, and session management. Cookies expire after ~11 hours of inactivity.

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
- **`lib/supabase/admin-client.ts`** — Admin Supabase client (service role key, server-side only)
- **`lib/supabase/migrations/`** — SQL migrations (001–009)
  - 001: Initial schema (restaurants, kpi_entries)
  - 002-003: Reports schema + Storage
  - 004: Food cost columns
  - 005: User profiles + RLS policies
  - 006: NYP sessions (cookie storage)
  - 007: Targets table
  - 008: Performance indexes
  - 009: KPI entries write policies (INSERT/UPDATE/DELETE)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL. If unset, seed data is used. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Supabase service role key (admin operations, server-side only) |
| `EXCEL_DATA_PATH` | No | Path to Excel delivery data directory (default: `./data/rapportage`) |
| `NYP_COOKIES_JSON` | No | New York Pizza session cookies (JSON format) |
| `CRON_SECRET` | No | Secret for authenticating cron job endpoints |

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
- Testing: Vitest for unit tests, Playwright for E2E tests
- Parser pattern for extracting KPI data from Excel/PDF reports (`lib/parsers/`)

## Expandability

| Feature | What changes |
|---------|-------------|
| **Add new KPI metric** | Add field to `KPIEntry` + `KPISummary` in `lib/types.ts`, update `KPIEntrySchema`/`KPISummarySchema` in `lib/schemas.ts`, update `kpi-service.ts` computation, add card in dashboard components |
| **Add auth** | Add `middleware.ts`, `app/(auth)/login/`, update `(dashboard)/layout.tsx` |
| **Add new page** | Add route under `app/(dashboard)/`, add item to Sidebar `menuItems` array |
| **Add new report type** | Add to `ReportType` union in `lib/types.ts`, `ReportTypeSchema` in `lib/schemas.ts`, and `lib/config/report-types.ts` |
| **Add new repository** | Implement interface from `lib/repositories/`, add to factory in `lib/repositories/index.ts` |
| **Add new migration** | Create `lib/supabase/migrations/XXX_description.sql`, update migration count in this doc, create script in `scripts/apply-migration-XXX.ts` if needed |
| **Add new parser** | Create parser in `lib/parsers/`, implement parsing logic for new report format, add to type registry if needed |

## NYP Integration

The system integrates with New York Pizza's Store Portal to automatically download operational reports:

- **Authentication**: Cookie-based sessions stored in `nyp_sessions` table. Cookies expire after ~11 hours of inactivity.
- **Store Mapping**: Restaurant IDs map to NYP store IDs (e.g., `hinthammerstraat` → 142, `rosmalen` → 197)
- **Report Types**: Operational reports contain KPI data (revenue, costs, delivery metrics, etc.)
- **Bulk Import**: Scripts in `scripts/` can import historical data for entire years
- **Parsers**: Excel/PDF reports are parsed using dedicated parsers in `lib/parsers/`

To refresh cookies:
1. Login to NYP Store Portal in browser
2. Open DevTools → Application → Cookies
3. Run `npm run nyp:capture-cookies` (or manually update `nyp_sessions` table)

## Testing Strategy

- **Unit Tests**: Vitest for utilities, services, and components
  - Config: `vitest.config.ts`
  - Setup: `vitest.setup.ts`
  - Run: `npm test`
- **E2E Tests**: Playwright for end-to-end user flows
  - Config: `playwright.config.ts`
  - Tests: `__tests__/e2e/`
  - Run: `npm run test:e2e`
- **Coverage Target**: Aim for 80%+ coverage (see `~/.claude/rules/testing.md`)

## Migration Workflow

1. Create migration SQL file in `lib/supabase/migrations/`
2. Number sequentially (e.g., `010_description.sql`)
3. Create apply script in `scripts/apply-migration-XXX.ts` if needed
4. Test locally first
5. Run `npm run db:migrate` for production
6. Update migration count in this doc
