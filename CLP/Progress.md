# Restaurant KPI Dashboard — Deployment Progress

## ✅ DEPLOYED TO PRODUCTION

**Live Site:** https://nypkpi.com
**Date:** 2026-02-07

---

## Today's Accomplishments

### 1. Database Setup ✅
- Ran migrations 005-007
- Created: `user_profiles`, `nyp_sessions`, `targets`
- Applied auth-based RLS policies
- Inserted default Rosmalen targets

### 2. User Setup ✅
- Created admin user: `damian.gans@outlook.com`
- User ID: `9d4b271e-ab6b-4379-bff5-e8db899756e1`
- Role: Owner at Rosmalen restaurant

### 3. Production Deployment ✅
- Deployed to Vercel
- Environment variables configured
- Cron job registered (6 AM UTC daily)
- Build status: ✅ Passing

### 4. Authentication ✅
- Login flow tested and working
- Middleware redirect functional
- Dashboard accessible after login

### 5. NYP Cookie Automation ✅
- Created `scripts/capture-nyp-cookies.ts`
- Automated login with 2FA support
- Stored 8 cookies in database
- Command: `npm run nyp:capture-cookies`

### 6. Cron Job Testing ✅
- Manual trigger successful
- Cookie retrieval from DB working
- Report download working
- Parser returned "no entries" (needs investigation)

---

## ✅ Testing Infrastructure Complete!

### Test Setup ✅
- ✅ Installed Vitest + Testing Library + jsdom
- ✅ Created vitest.config.ts with coverage setup
- ✅ Added test scripts to package.json
- ✅ Set up test directory structure

### Test Coverage: 59.74%
- **Formatters: 100%** ✅ (15 tests, all passing)
- **Operational Parser: 72.72%** ✅ (9 tests, all passing)
- **Period Dates: 25.53%** ⚠️ (9 tests, needs more coverage)

### Tests Created
- `__tests__/lib/utils/formatters.test.ts` - 15 tests
- `__tests__/lib/parsers/operational-report-parser.test.ts` - 9 tests
- `__tests__/lib/utils/period-dates.test.ts` - 9 tests

**Total: 33 tests, all passing** ✅

---

## ✅ Error Monitoring Setup Complete!

### Sentry Integration ✅
- ✅ Installed @sentry/nextjs package
- ✅ Created Sentry configuration files:
  - `sentry.client.config.ts` — Client-side error tracking
  - `sentry.server.config.ts` — Server-side error tracking
  - `sentry.edge.config.ts` — Edge runtime (middleware)
- ✅ Updated `next.config.ts` with Sentry webpack plugin
- ✅ Added `.sentryclirc` for CLI authentication
- ✅ Updated `.gitignore` to exclude sensitive Sentry files
- ✅ Created setup script: `scripts/setup-sentry.sh`
- ✅ Added error tracking to cron job endpoint
- ✅ Created documentation: `docs/SENTRY_SETUP.md`

### Features Enabled
- **Source Maps:** Automatically uploaded during build
- **Session Replay:** 10% of sessions + 100% of error sessions
- **Performance Monitoring:** 10% transaction sampling
- **Vercel Cron Monitoring:** Automatic cron job tracking
- **Privacy:** Text masking and media blocking enabled

### Next Steps
1. Create Sentry account at https://sentry.io
2. Get DSN and Auth Token
3. Run: `npm run sentry:setup` to configure Vercel
4. Deploy and verify error tracking works

See `docs/SENTRY_SETUP.md` for detailed instructions.

---

## ✅ Cookie Refresh Automation Complete!

### Automated Cookie Refresh ✅
- ✅ Created `/api/cron/refresh-cookies` endpoint
- ✅ Integrated Playwright for automated NYP login
- ✅ Added Sentry error tracking for failures
- ✅ Scheduled cron: Daily at 1 AM UTC (before 6 AM report download)
- ✅ Handles session expiration gracefully
- ✅ Stores refreshed cookies in `nyp_sessions` table
- ✅ 2FA detection with fallback to manual refresh

### Features
- **Headless Browser:** Uses Playwright chromium
- **Smart Detection:** Detects and warns about 2FA requirement
- **Error Capture:** All failures sent to Sentry
- **Timeout Protection:** 2-minute max duration with proper cleanup
- **Database Storage:** Automatically updates `nyp_sessions`

### Cron Schedule
- **1 AM UTC:** Cookie refresh (`/api/cron/refresh-cookies`)
- **2 AM UTC:** Report download (`/api/cron/download-reports`)

### Testing
```bash
# Test locally (requires dev server running)
npm run nyp:refresh-cookies

# Test in production
curl -X GET https://nypkpi.com/api/cron/refresh-cookies \
  -H "Authorization: Bearer nyp-kpi-cron-secret-2026"
```

### Fallback
If 2FA is required or automation fails:
```bash
npm run nyp:capture-cookies  # Manual cookie capture with 2FA support
```

---

## ✅ Trend Sparklines Feature Verified!

### Status: Already Implemented ✅

The trend sparklines feature is **fully functional** and just needs data:

**Implementation Chain:**
1. ✅ `getSparklineData()` in `lib/services/kpi-service.ts`
   - Fetches last 7 days of data ending at selected period
   - Returns: revenue, labourPct, orders, productivity arrays

2. ✅ Dashboard page (`app/(dashboard)/dashboard/page.tsx`)
   - Calls `getSparklineData(end, restaurantId)` in parallel
   - Passes sparklines to DashboardClient

3. ✅ DashboardClient component
   - Receives sparklines prop
   - Passes to KPISummaryCards

4. ✅ KPISummaryCards component
   - Renders MetricSparkline for each card
   - Shows only if `sparklineData.length > 1`

5. ✅ MetricSparkline component
   - 7-day trend visualization
   - Color-coded (green/red based on direction)
   - Smooth line animation (800ms ease-in-out)
   - 30px height, 60px width
   - Opacity transition on hover

**Requirements:**
- Minimum 2 data points to display
- Will automatically appear once cron job populates KPI data

**Colors by Metric:**
- Revenue: `#009a44` (green, up is good)
- Labour %: `#ffa51d` (orange, down is good)
- Orders: `#006dec` (blue, up is good)
- Productivity: `#ffc814` (yellow, up is good)

## ✅ Parser Verified and Fixed!

### Parser Updates
- ✅ Added header row detection (handles empty Row 0)
- ✅ Fixed percentage conversion (Excel decimals → percentages)
- ✅ Updated Dutch column name mappings
- ✅ Tested with real NYP Excel file: 28 entries parsed correctly

### Test Results
- File: `5_New_Einde_Dag_Rapportage_update_ROS_30072025.xlsx`
- Entries: 28 days parsed (Feb 1 - May 24, 2025)
- Labour %: 25.9% (correct - was 0.3% before fix)
- Delivery Rate: 80.6% (correct)
- Revenue: €38,986.37 total

### Note on Cron Job
- Cron job downloads "yesterday's report" which may be metadata-only
- Parser works correctly with multi-day reports
- Need real daily operational reports from NYP to verify live automation

See `NEXT_STEPS.md` for detailed roadmap.

---

## 🛠️ New Commands

```bash
npm run nyp:capture-cookies  # Capture NYP cookies
npm run db:create-user       # Create auth user
npm run deploy              # Deploy to production
```

---

## ✅ E2E Testing Infrastructure Complete!

### Playwright E2E Tests ✅
- ✅ Installed @playwright/test framework
- ✅ Created `playwright.config.ts` configuration
- ✅ Set up test directory: `__tests__/e2e/`
- ✅ Created comprehensive dashboard test suite
- ✅ Added test scripts to package.json
- ✅ Updated .gitignore for Playwright artifacts
- ✅ Created .env.example for test credentials

### Test Suites Created
**`__tests__/e2e/dashboard.spec.ts`** — 11 test cases:

1. **Authentication Flow**
   - Redirect to login when not authenticated
   - Login and navigate to dashboard

2. **KPI Cards**
   - Display all 5 KPI cards
   - Show metric values

3. **Period Selector**
   - Toggle between week/month views
   - Navigate to previous period
   - Navigate to next period

4. **Charts**
   - Display revenue chart
   - Display cost breakdown chart

5. **Theme Toggle**
   - Toggle between light/dark modes

### Running E2E Tests
```bash
# Run all E2E tests (headless)
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run with browser visible
npm run test:e2e:headed

# Run with debugger
npm run test:e2e:debug
```

### Configuration
- **Base URL:** http://localhost:3000 (dev server)
- **Browsers:** Chromium, Firefox, WebKit
- **Parallel:** Tests run in parallel
- **Retry:** 2 retries on CI
- **Reporter:** HTML report (playwright-report/)

### Test Credentials
Set in `.env.local`:
```bash
TEST_USER_EMAIL=damian.gans@outlook.com
TEST_USER_PASSWORD=your-password-here
```
