# Next Steps - Post-Deployment

## ✅ What's Working Now

Your Restaurant KPI Dashboard is **live and functional** at https://nypkpi.com with:

- ✅ Authentication (Supabase Auth)
- ✅ Protected routes (middleware)
- ✅ User profiles with role-based access
- ✅ Database with RLS policies
- ✅ Cron job scheduled (6 AM daily)
- ✅ All API endpoints deployed
- ✅ Theme toggle (light/dark mode)

---

## 🔧 Remaining Work

### 1. Pipeline Verification & Testing

**Priority: HIGH** - Get the automation working

#### A. Store NYP Cookies in Database

The cron job needs valid NYP session cookies to download reports.

**Options:**

**Option 1: Manual cookie storage (Quick test)**
```sql
-- Get cookies from browser after logging into NYP portal
-- Store them in the database
INSERT INTO nyp_sessions (restaurant_id, cookies_json, last_validated, is_active)
VALUES (
  'rosmalen',
  '{"cookie1": "value1", "cookie2": "value2"}',  -- Replace with actual cookies
  now(),
  true
);
```

**Option 2: Use the download scripts** (Recommended)
```bash
# Test NYP login and capture cookies
npm run test-nyp-login

# Or download reports and store cookies
npm run download-reports
```

#### B. Test the Cron Job

Once cookies are stored:

```bash
# Manually trigger the cron job
curl -X POST https://nypkpi.com/api/cron/download-reports \
  -H "Authorization: Bearer nyp-kpi-cron-secret-2026"

# Check Vercel logs
vercel logs --follow
```

Expected behavior:
1. Downloads operational reports from NYP
2. Parses Excel files
3. Inserts KPI entries into database
4. Dashboard shows new data

#### C. Verify Parsers

Test with real Excel files from NYP:

```bash
# Test operational report parser
npm run test:parser:operational

# Test variance report parser (food costs)
npm run test:parser:variance
```

If parsers fail, check:
- Excel file format matches parser expectations
- Column headers are correct
- Data types are as expected

---

### 2. Add Test Coverage

**Priority: MEDIUM** - Essential for long-term maintainability

Currently: **0% test coverage**

**Setup testing:**
```bash
# Install testing dependencies
npm install -D jest @testing-library/react @testing-library/jest-dom vitest

# Create test config
# Add npm scripts: test, test:watch, test:coverage
```

**Tests to add:**
- Unit tests: Parsers, services, utilities, formatters
- Integration tests: API routes, repository layers
- E2E tests: Login flow, dashboard navigation, report upload

**Use agents:**
```bash
# TDD agent for new features
npm run everything-claude-code:tdd

# E2E agent for critical flows
npm run everything-claude-code:e2e
```

---

### 3. Data Seeding (Optional but helpful)

Add sample data to see the dashboard in action:

**Quick seed:**
```bash
# Run SQL in Supabase SQL Editor
# File: scripts/seed-test-data.sql
```

This will populate:
- 9 weeks of KPI data
- Charts will render
- Period comparison will work

---

### 4. Pipeline Enhancements

**A. Cookie Refresh Automation**

The NYP session cookies expire. Automate refresh:

```typescript
// app/api/cron/refresh-cookies/route.ts
// Scheduled: daily at 5 AM (before 6 AM download job)
```

**B. Error Monitoring**

Add error tracking:
```bash
# Sentry, LogRocket, or similar
npm install @sentry/nextjs
```

Configure in:
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`

**C. Notification System**

Alert on failures:
- Cron job failures
- Parser errors
- Threshold breaches

Channels:
- Email (SendGrid, Resend)
- Slack webhook
- Push notifications

---

### 5. Nice-to-Have Features

**A. Weekly Summary Email** (Phase 3.3 - not built)
- Scheduled: Monday morning
- Contains: Previous week KPI summary, comparisons, alerts
- Service: SendGrid or Resend

**B. Trend Sparklines** (Component exists, not wired)
- File: `components/dashboard/MetricSparkline.tsx`
- Wire into: KPI summary cards
- Shows: 8-week trend mini-chart

**C. Manager Leaderboard** (Phase 3.5 - not built)
- Multi-restaurant comparison
- Ranks by: Prime cost, revenue, productivity
- Gamification: Badges, achievements

**D. Mobile Improvements**
- Hamburger menu for sidebar
- Touch-friendly controls
- Responsive chart sizing

**E. Print Optimization**
- Print-friendly CSS
- Export to PDF
- Weekly report template

**F. In-App Notifications**
- Threshold breach alerts
- New report available
- System status

---

### 6. Security Hardening

**Run security review:**
```bash
# Security review agent
npm run everything-claude-code:security-review
```

**Check for:**
- Exposed secrets in logs
- SQL injection vulnerabilities
- XSS risks
- CSRF protection
- Rate limiting on API routes
- Input validation on all endpoints

---

### 7. Performance Optimization

**A. Database Indexes**
Check query performance:
```sql
-- Add indexes if missing
CREATE INDEX IF NOT EXISTS idx_kpi_entries_period ON kpi_entries(restaurant_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_reports_restaurant_period ON reports(restaurant_id, report_period);
```

**B. Caching**
- Add Redis for frequently accessed data
- Cache KPI summaries
- Cache chart data

**C. Image Optimization**
- Use Next.js Image component
- Optimize logos/assets

---

## 📋 Recommended Next Actions

**This Week:**
1. ✅ Store NYP cookies in database
2. ✅ Test cron job manually
3. ✅ Verify parsers work with real Excel files
4. ✅ Add test data for dashboard visualization

**Next Week:**
1. Set up automated testing (TDD agent)
2. Add error monitoring (Sentry)
3. Implement cookie refresh automation
4. Wire up trend sparklines

**Future:**
1. Weekly summary emails
2. Manager leaderboard
3. Mobile optimizations
4. Performance tuning

---

## 🆘 Troubleshooting

### Cron Job Not Running
- Check Vercel logs: `vercel logs --follow`
- Verify cron schedule: Vercel Dashboard → Settings → Cron Jobs
- Test manually: `curl -X POST https://nypkpi.com/api/cron/download-reports -H "Authorization: Bearer nyp-kpi-cron-secret-2026"`

### Parser Failures
- Check Excel file format
- Verify column headers match parser expectations
- Test with sample files: `npm run test:parser:operational`

### Dashboard Empty
- Check `kpi_entries` table has data
- Verify RLS policies allow access
- Check browser console for errors
- Seed test data: `scripts/seed-test-data.sql`

### Auth Issues
- Verify user exists in `auth.users`
- Check `user_profiles` entry exists
- Verify RLS policies: `SELECT * FROM pg_policies WHERE tablename = 'user_profiles';`

---

## 📊 Monitoring

**Vercel Dashboard:**
- Deployments: https://vercel.com/dgans-projects/restaurant-kpi-dashboard
- Logs: https://vercel.com/dgans-projects/restaurant-kpi-dashboard/logs
- Cron: https://vercel.com/dgans-projects/restaurant-kpi-dashboard/settings/cron-jobs

**Supabase Dashboard:**
- Auth: https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/auth/users
- Tables: https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/editor
- Logs: https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/logs/explorer

**Production Site:**
- Dashboard: https://nypkpi.com
- Login: https://nypkpi.com/login

---

**Need help with any of these? Just ask!** 🚀
