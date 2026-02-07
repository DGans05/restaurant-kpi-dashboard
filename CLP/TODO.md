# NYP KPI Dashboard — TODO

## Status: ✅ DEPLOYED TO PRODUCTION

Last deployment: https://nypkpi.com
Last commit: `1f05dbb chore: prepare for Vercel deployment`

## What's Been Built (committed)

### Phase 1: Auth ✅
- [x] `middleware.ts` — protects dashboard routes
- [x] `lib/supabase/middleware.ts` — session refresh
- [x] `app/(auth)/login/page.tsx` — login form
- [x] `migration 005_user_profiles.sql` — user_profiles table + RLS policies
- [x] Header shows user + logout button
- [x] Sidebar role-based menu items

### Phase 2: Pipeline ✅
- [x] `app/api/cron/download-reports/route.ts` — Vercel cron job
- [x] `app/api/nyp/refresh-session/route.ts` — cookie refresh
- [x] `lib/parsers/operational-report-parser.ts` — parse Excel → KPI
- [x] `lib/parsers/variance-report-parser.ts` — food cost parser
- [x] `migration 006_nyp_sessions.sql` — cookie storage
- [x] `vercel.json` — cron schedule
- [x] `lib/supabase/admin-client.ts` — service role client

### Phase 3: Analytics ✅
- [x] `lib/services/target-service.ts` — target thresholds
- [x] `migration 007_targets.sql` — targets table + defaults
- [x] `kpi-service.ts` — period comparison (vs previous period)
- [x] `PrimeCostCard` — enhanced with comparison badges
- [x] `app/api/export/csv/route.ts` — CSV export

### Phase 4: Polish ✅
- [x] `app/kpis/new/page.tsx` — manual KPI entry form
- [x] Build passes cleanly

---

## Remaining Work (not yet done)

### 🚀 Quick Deploy (Follow DEPLOY.md)

**Step 1: Database Setup**
```bash
# 1. Open Supabase SQL Editor
open https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/sql/new

# 2. Run scripts/migrations-005-006-007.sql
# This creates: user_profiles, nyp_sessions, targets + RLS policies + default targets
```

**Step 2: Create First User**
```bash
npm run db:create-user
# Or manually via Supabase Dashboard → Auth → Users
```

**Step 3: Deploy to Vercel**
```bash
npm run deploy:env  # Set environment variables
npm run deploy      # Deploy to production
```

**Step 4: Verify**
- Visit production URL → should redirect to /login
- Login with credentials
- Dashboard should load with KPI cards

### Database Setup (Supabase) ✅ COMPLETED
- [x] Run migrations 005, 006, 007 on production Supabase
  - Used: `scripts/migrations-005-006-007-safe.sql`
  - Created: user_profiles, nyp_sessions, targets tables
  - Applied: Auth-based RLS policies
- [x] Create first auth user
  - User ID: 9d4b271e-ab6b-4379-bff5-e8db899756e1
  - Email: damian.gans@outlook.com
- [x] Link user to restaurant in `user_profiles` table
  - Linked to: rosmalen (owner role)
- [x] Insert default targets for Rosmalen
  - 5 targets inserted (revenue, labour_pct, food_cost_pct, prime_cost_pct, delivery_30min_pct)

### Testing
- [ ] Test login flow end-to-end on deployed site
- [ ] Test cron job `/api/cron/download-reports` with real NYP cookies
- [ ] Test manual KPI entry form
- [ ] Test CSV export
- [ ] Test period comparison badges accuracy
- [ ] Add unit tests (currently 0% coverage)

### Pipeline Verification
- [ ] Store NYP cookies in `nyp_sessions` table (currently only in env vars)
- [ ] Verify operational report parser against real Excel files
- [ ] Verify variance report parser against real food cost Excel files
- [ ] Test cron job triggers and data flows to `kpi_entries`

### Deployment ✅ COMPLETED
- [x] Deploy latest commit to Vercel
  - Production URL: https://nypkpi.com
  - Build passed successfully
- [x] Set environment variables on Vercel
  - All 6 env vars configured (Supabase, cron, NYP credentials)
- [x] Verify middleware auth redirect works on production
  - ✅ Tested: Redirects to /login when not authenticated
  - ✅ Tested: Login successful, dashboard loads
- [x] Verify Vercel cron job is registered
  - Registered: `0 6 * * *` → `/api/cron/download-reports`
  - Dashboard: https://vercel.com/dgans-projects/restaurant-kpi-dashboard/settings/cron-jobs

### Nice-to-haves
- [ ] Weekly summary email (Phase 3.3 — not built)
- [ ] Trend sparklines wired into KPI cards (component exists, not connected)
- [ ] Manager leaderboard for multi-restaurant (Phase 3.5 — not built)
- [ ] Mobile hamburger menu for sidebar
- [ ] Print-optimized CSS
- [ ] In-app threshold breach notifications
