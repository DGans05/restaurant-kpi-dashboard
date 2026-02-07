# Production Deployment Checklist

## ✅ Work Completed (Ready for Deployment)

### Security Hardening
- [x] **Sentry Error Monitoring** — Full client/server/edge runtime tracking
  - Session replay with privacy masking
  - Performance tracing configured
  - Error tracking for all routes
  - See: `docs/SENTRY_SETUP.md`

- [x] **Security Review** — 11 vulnerabilities fixed
  - ✅ CRITICAL: Hardcoded CRON_SECRET removed
  - ✅ HIGH: Timing-safe authentication (crypto.timingSafeEqual)
  - ✅ HIGH: Generic error messages (no data leakage)
  - ✅ HIGH: CSV injection protection (sanitizeCSVValue)
  - ✅ MEDIUM: CRON_SECRET validation
  - ✅ All console.log statements removed
  - See: `SECURITY_NOTICE.md`

- [x] **Security Headers** (middleware.ts)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Content-Security-Policy with Sentry/Supabase allowlist
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy: camera/microphone/geolocation restricted

- [x] **Rate Limiting** (lib/utils/rate-limit.ts)
  - CSV export: 10 requests/minute per user
  - Download reports cron: 5 requests/minute
  - Cookie refresh cron: 3 requests/hour
  - X-RateLimit-* response headers

### Performance Optimization
- [x] **Database Indexes** — 11 strategic indexes
  - 10-100x query speedup (dashboard 150-300ms → 2-10ms)
  - Migration: `008_performance_indexes.sql`
  - See: `docs/PERFORMANCE.md`

### Testing
- [x] **Unit Tests** — 82.46% coverage
  - 80 tests passing
  - period-dates.ts: 100% coverage
  - parsers: edge case coverage
  - API routes: comprehensive tests

- [x] **E2E Tests** — 11 Playwright tests
  - Auth flow testing
  - KPI card rendering
  - Period selector navigation
  - Charts and theme toggle
  - Configuration: `playwright.config.ts`

### Automation
- [x] **Cookie Refresh Cron** — Automated NYP session management
  - Route: `/api/cron/refresh-cookies`
  - Schedule: Daily at 1 AM UTC (before 6 AM report download)
  - 2FA detection with graceful fallback
  - Playwright automation with headless browser
  - Rate limited: 3 requests/hour

- [x] **Report Download Cron** — Daily KPI data ingestion
  - Route: `/api/cron/download-reports`
  - Schedule: Daily at 6 AM UTC
  - Session validation with automatic deactivation
  - Parser integration with database upserts
  - Rate limited: 5 requests/minute

---

## 🚨 Required Actions Before Production Deployment

### 1. Environment Variables

**Rotate CRON_SECRET:**
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update in Vercel
vercel env add CRON_SECRET production
```

**Add Sentry DSN:**
```bash
vercel env add NEXT_PUBLIC_SENTRY_DSN production
vercel env add SENTRY_AUTH_TOKEN production  # For sourcemaps
vercel env add SENTRY_ORG production
vercel env add SENTRY_PROJECT production
```

**Verify existing env vars:**
```bash
# Should already be set from previous deployment:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - NYP_USERNAME
# - NYP_PASSWORD
# - NYP_COOKIES_JSON (if not using database storage)
```

### 2. Database Migration

**Run performance indexes migration:**
```sql
-- In Supabase SQL Editor
-- File: lib/supabase/migrations/008_performance_indexes.sql

-- Creates 11 indexes:
-- - idx_kpi_entries_restaurant_date
-- - idx_kpi_entries_week
-- - idx_kpi_entries_manager
-- - idx_reports_restaurant_type_period
-- - idx_reports_upload_status
-- - idx_reports_created_at
-- - idx_reports_restaurant_created
-- - idx_nyp_sessions_active
-- - idx_nyp_sessions_last_validated
-- - idx_user_profiles_restaurant
-- - idx_targets_restaurant_active
```

### 3. Sentry Setup

**Create Sentry project:**
1. Visit https://sentry.io/organizations/[your-org]/projects/new/
2. Select "Next.js" platform
3. Name: "restaurant-kpi-dashboard"
4. Copy DSN and add to Vercel env vars
5. Create auth token for sourcemap uploads
6. Add token to Vercel env vars

**Test Sentry integration:**
```bash
# Locally first
npm run dev
# Trigger test error at /sentry-example-page
# Verify error appears in Sentry dashboard

# Then on production after deployment
# Visit https://nypkpi.com/sentry-example-page
```

### 4. Cookie Storage

**Store NYP cookies in database (recommended):**
```bash
# Option A: Use automated cookie refresh
# Will store cookies automatically on first run

# Option B: Manual capture
npm run nyp:capture-cookies
# Cookies will be stored in nyp_sessions table
```

### 5. Cron Job Verification

**Update vercel.json cron schedule:**
```json
{
  "crons": [
    {
      "path": "/api/cron/refresh-cookies",
      "schedule": "0 1 * * *"
    },
    {
      "path": "/api/cron/download-reports",
      "schedule": "0 6 * * *"
    }
  ]
}
```

**Verify cron jobs are registered:**
1. Deploy to Vercel
2. Visit: https://vercel.com/[team]/[project]/settings/cron-jobs
3. Confirm both cron jobs appear
4. Manually trigger first run to test

---

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Deploy to Vercel
```bash
# Option A: Automatic (GitHub integration)
# Vercel will automatically deploy on push

# Option B: Manual
vercel --prod
```

### 3. Run Database Migration
```bash
# Open Supabase SQL Editor
open https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/sql/new

# Copy and run: lib/supabase/migrations/008_performance_indexes.sql
```

### 4. Test Production Deployment

**Authentication:**
- [ ] Visit https://nypkpi.com
- [ ] Should redirect to /login
- [ ] Login with credentials
- [ ] Should redirect to /dashboard

**Dashboard Functionality:**
- [ ] KPI cards render correctly
- [ ] Period selector works (week/month toggle)
- [ ] Charts display data
- [ ] Theme toggle works
- [ ] No console errors

**Security Headers:**
```bash
curl -I https://nypkpi.com | grep -E "X-Frame-Options|X-Content-Type|CSP"
```

**Rate Limiting:**
```bash
# Test CSV export rate limit (10/min)
for i in {1..12}; do
  curl -H "Authorization: Bearer [token]" \
    "https://nypkpi.com/api/export/csv?startDate=2025-01-01&endDate=2025-01-31"
done
# Should see 429 Too Many Requests after 10 requests
```

**Cron Jobs:**
- [ ] Manually trigger `/api/cron/refresh-cookies`
  ```bash
  curl -X GET "https://nypkpi.com/api/cron/refresh-cookies" \
    -H "Authorization: Bearer [CRON_SECRET]"
  ```
- [ ] Manually trigger `/api/cron/download-reports`
  ```bash
  curl -X GET "https://nypkpi.com/api/cron/download-reports" \
    -H "Authorization: Bearer [CRON_SECRET]"
  ```
- [ ] Verify data appears in database
- [ ] Check Vercel cron logs for automatic runs

**Sentry Integration:**
- [ ] Visit /sentry-example-page
- [ ] Trigger test error
- [ ] Verify error appears in Sentry dashboard
- [ ] Check session replay is captured

---

## 📊 Monitoring & Verification

### Daily Monitoring (First Week)

**Cron Job Health:**
- Check Vercel cron logs daily
- Verify refresh-cookies runs at 1 AM UTC
- Verify download-reports runs at 6 AM UTC
- Check for 2FA blocks or session expiration

**Database Performance:**
```sql
-- Check query performance
EXPLAIN ANALYZE
SELECT * FROM kpi_entries
WHERE restaurant_id = 'rosmalen'
  AND date >= '2025-01-01'
  AND date <= '2025-01-31'
ORDER BY date DESC;
-- Should use idx_kpi_entries_restaurant_date
```

**Error Tracking:**
- Monitor Sentry dashboard for unexpected errors
- Review error patterns and frequencies
- Set up Sentry alerts for critical errors

**Rate Limiting:**
- Monitor rate limit violations in logs
- Adjust limits if legitimate traffic is blocked
- Consider upgrading to @upstash/ratelimit with Redis for multi-instance

### Weekly Verification

- [ ] Test CSV export with various date ranges
- [ ] Verify KPI calculations match source reports
- [ ] Check for missing days in dashboard
- [ ] Review Sentry performance metrics
- [ ] Verify no security headers warnings in browser console

---

## ⚠️ Known Limitations & Future Improvements

### Rate Limiting
- **Current:** In-memory rate limiter (resets on server restart)
- **Production:** Consider @upstash/ratelimit with Redis for multi-instance deployments
- **Why:** Vercel serverless functions are stateless; in-memory store only works for single-instance

### Cookie Refresh
- **2FA Dependency:** Manual intervention required if NYP triggers 2FA
- **Future:** Implement automated 2FA handling or TOTP integration

### Testing
- **Coverage:** 82.46% (target: 80%+ ✅)
- **E2E:** 11 tests (covers critical flows)
- **Future:** Add E2E tests for reports upload and CSV export

### Monitoring
- **Current:** Sentry error tracking
- **Future:** Add uptime monitoring (BetterStack, UptimeRobot)
- **Future:** Add performance monitoring (Vercel Analytics)

---

## 📝 Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Verify first automated cookie refresh (1 AM UTC)
- [ ] Verify first automated report download (6 AM UTC)
- [ ] Check Sentry dashboard for deployment errors
- [ ] Test all user-facing features

### Short-term (Week 1)
- [ ] Monitor cron job success rates
- [ ] Review Sentry error patterns
- [ ] Adjust rate limits if needed
- [ ] Document any production issues

### Long-term (Month 1)
- [ ] Consider upgrading to distributed rate limiter
- [ ] Evaluate Sentry performance metrics
- [ ] Review and optimize database indexes based on query patterns
- [ ] Plan for multi-restaurant support expansion

---

## 🆘 Troubleshooting

### Cron Job Fails
1. Check Vercel logs for error messages
2. Verify CRON_SECRET environment variable
3. Test endpoint manually with curl
4. Check NYP session validity in database
5. Review Sentry for detailed error traces

### Rate Limiting Too Aggressive
1. Check X-RateLimit-Reset header for reset time
2. Adjust limits in route files
3. Consider user feedback and usage patterns
4. Plan Redis upgrade for production

### Security Headers Break Functionality
1. Review browser console for CSP violations
2. Adjust CSP directives in middleware.ts
3. Test with different browsers (Chrome, Firefox, Safari)
4. Check Sentry for security header errors

### Database Performance Degradation
1. Run EXPLAIN ANALYZE on slow queries
2. Verify indexes are being used
3. Consider additional indexes for new query patterns
4. Review Supabase dashboard for slow queries

---

## ✅ Deployment Complete Checklist

- [ ] All env vars configured on Vercel
- [ ] CRON_SECRET rotated
- [ ] Database migration 008 applied
- [ ] Sentry project created and configured
- [ ] NYP cookies stored in database
- [ ] Cron jobs verified in Vercel dashboard
- [ ] Authentication tested on production
- [ ] Dashboard renders correctly
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Cron jobs manually triggered and working
- [ ] Sentry error tracking verified
- [ ] No console errors in browser
- [ ] Production monitoring dashboard bookmarked

**Once all items are checked, deployment is complete! 🎉**
