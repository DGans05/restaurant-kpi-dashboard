# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Restaurant KPI Dashboard — a Next.js 16 (App Router) TypeScript application for tracking restaurant metrics (revenue, labour costs, food costs, order counts). Currently uses static seed data with a service layer designed for easy database swap.

## Commands

```bash
npm run dev       # Start Next.js dev server (port 3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint
```

No test runner is configured yet.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 (App Router) with TypeScript 5+ (strict mode)
- **Styling**: Tailwind CSS 4 with shadcn/ui components
- **Charts**: Recharts
- **Theming**: next-themes (light/dark)
- **Date utils**: date-fns
- **Deployment**: Vercel (zero-config, no env vars needed)

### Path Alias
`@/*` maps to the project root (e.g., `import { cn } from '@/lib/utils'`).

### Data Layer
- `lib/types.ts` — `KPIEntry`, `KPISummary`, `ChartDataPoint`, `DateRangeDays` types
- `lib/data/seed.ts` — Deterministic seed data generator (91 days x 2 restaurants)
- `lib/services/kpi-service.ts` — `getKPISummary(days)` and `getChartData(days)`. **This is the expandability seam** — swap internals for Supabase later, keep the same exports.

### Route Groups
- `app/(dashboard)/` — Dashboard pages with sidebar + header layout
- `app/page.tsx` — Redirects to `/dashboard`

### Key Directories
- `components/ui/` — shadcn/ui primitives (button, card)
- `components/dashboard/` — KPISummaryCards, RevenueChart, CostBreakdownChart, DateRangeFilter
- `components/layout/` — Header, Sidebar, ThemeToggle
- `components/providers/` — ThemeProvider (next-themes wrapper)

## Conventions

- Components: PascalCase `.tsx` files
- TypeScript strict mode — avoid `any` types
- Functional components with hooks; use `"use client"` directive only when needed
- Layouts remain server components when possible

## Expandability

| Feature | What changes |
|---------|-------------|
| **Add database** | Replace internals of `lib/services/kpi-service.ts`, add `lib/supabase/client.ts` + `server.ts` |
| **Add auth** | Add `middleware.ts`, `app/(auth)/login/`, update `(dashboard)/layout.tsx` |
| **Add KPI entry** | Add `app/(dashboard)/kpis/`, `components/kpis/KPIForm.tsx`, Zod schemas |
| **Add new page** | Add route under `app/(dashboard)/`, add item to Sidebar `menuItems` array |
