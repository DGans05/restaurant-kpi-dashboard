# Production Deployment Checklist

## Pre-Deployment

### 1. Database Setup ✅ (Ready to execute)

Run migrations on production Supabase:

```bash
cd /Users/damian/dev/CLP
./scripts/run-production-migrations.sh
```

This will:
- ✅ Create `user_profiles` table with RLS policies (005)
- ✅ Create `nyp_sessions` table for cookie storage (006)
- ✅ Create `targets` table with default Rosmalen targets (007)

### 2. Create First User

**Option A: Via Supabase Dashboard (Recommended)**

1. Go to: https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/auth/users
2. Click "Add user" → "Create new user"
3. Email: `damian.gans@outlook.com`
4. Password: (set a secure password)
5. Auto-confirm user: ✅ Yes

**Option B: Via SQL Editor**

```sql
-- Create auth user (Supabase will hash password automatically)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'damian.gans@outlook.com',
  crypt('YOUR_SECURE_PASSWORD', gen_salt('bf')),  -- Requires pgcrypto extension
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);
```

### 3. Link User to Restaurant

```sql
-- Get the user_id from step 2
INSERT INTO user_profiles (user_id, restaurant_id, role, display_name)
VALUES (
  'USER_ID_FROM_STEP_2',
  'rosmalen',
  'owner',
  'Damian Gans'
);
```

**Or use the helper script:**

```bash
npm run db:create-user
```

### 4. Verify Database Setup

Run verification queries:

```sql
-- Check migrations ran successfully
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_profiles', 'nyp_sessions', 'targets');

-- Check default targets inserted
SELECT * FROM targets WHERE restaurant_id = 'rosmalen';

-- Check user profile created
SELECT * FROM user_profiles;

-- Check RLS policies exist
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('user_profiles', 'nyp_sessions', 'targets', 'kpi_entries', 'restaurants', 'reports');
```

## Deployment to Vercel

### 1. Install Vercel CLI (if not already)

```bash
npm i -g vercel
```

### 2. Link Project

```bash
vercel link
```

Follow prompts:
- Set up and deploy? **Y**
- Scope: (select your account)
- Link to existing project? **N** (first time) or **Y** (if already exists)
- Project name: `nyp-kpi-dashboard`
- Directory: `./`

### 3. Set Environment Variables

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://apvamphntjpbgoydsluc.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

vercel env add CRON_SECRET
# Paste: nyp-kpi-cron-secret-2026

vercel env add NYP_STORE_USERNAME_ROSMALEN
# Paste: damian.gans@outlook.com

vercel env add NYP_STORE_PASSWORD_ROSMALEN
# Paste: Hoflaan01!
```

**Or use the helper script:**

```bash
./scripts/set-vercel-env.sh
```

### 4. Deploy

```bash
vercel --prod
```

This will:
- Build the Next.js app
- Deploy to production
- Register the cron job from `vercel.json`

### 5. Verify Deployment

**Check deployment succeeded:**
```bash
vercel ls
```

**Visit the site:**
- Production URL: `https://nyp-kpi-dashboard.vercel.app` (or custom domain)

**Check environment variables:**
```bash
vercel env ls
```

**Check cron job registered:**
- Go to: Vercel Dashboard → Project → Settings → Cron Jobs
- Should see: `0 6 * * *` → `/api/cron/download-reports`

## Post-Deployment Verification

### 1. Test Login Flow

1. Visit production URL
2. Should redirect to `/login`
3. Enter credentials from step 2
4. Should redirect to `/dashboard`
5. Header should show user email + logout button
6. Sidebar should show role-based menu items

### 2. Test Dashboard

1. Select "Week" view
2. Should see KPI cards with data (if seed data exists) or empty state
3. Charts should render without errors
4. Period selector should work
5. Theme toggle should work

### 3. Test Cron Job (Manual Trigger)

```bash
# Trigger the cron endpoint manually
curl -X POST https://YOUR_DOMAIN.vercel.app/api/cron/download-reports \
  -H "Authorization: Bearer nyp-kpi-cron-secret-2026"
```

Check response:
- Should return `200 OK`
- Check Supabase `kpi_entries` table for new data
- Check Vercel logs for execution details

### 4. Store NYP Cookies

**Option A: Via Supabase SQL Editor**

```sql
INSERT INTO nyp_sessions (restaurant_id, cookies_json, last_validated, is_active)
VALUES (
  'rosmalen',
  '{"cookie_name": "cookie_value"}',  -- Replace with actual cookie JSON
  now(),
  true
);
```

**Option B: Via Script (Recommended)**

```bash
npm run nyp:store-cookies
```

This will:
- Login to NYP using credentials from env vars
- Capture session cookies
- Store in `nyp_sessions` table
- Validate the session

### 5. Verify Parsers

Test with real Excel files:

```bash
# Test operational report parser
npm run test:parser:operational

# Test variance report parser
npm run test:parser:variance
```

## Monitoring

### Vercel Logs

```bash
vercel logs --follow
```

Or visit: Vercel Dashboard → Project → Logs

### Supabase Logs

Go to: https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/logs/explorer

Filter by:
- `level = "error"`
- `msg like "%kpi%"`

### Cron Job Execution

Check: Vercel Dashboard → Project → Settings → Cron Jobs → Logs

## Rollback Plan

If deployment fails:

```bash
# Rollback to previous deployment
vercel rollback

# Or redeploy specific commit
vercel --prod --force
```

## Next Steps

- [ ] Set up weekly summary email (Phase 3.3)
- [ ] Add trend sparklines to KPI cards
- [ ] Implement manager leaderboard
- [ ] Add mobile hamburger menu
- [ ] Set up monitoring/alerting
- [ ] Configure custom domain
- [ ] Set up staging environment
