# 🚀 Deployment Ready - Summary

All deployment scripts and migrations are prepared. You can now deploy to production in 3 simple steps.

## What's Been Prepared

### ✅ Database Migrations
- **File**: `scripts/migrations-005-006-007.sql`
- **Contents**:
  - Migration 005: User profiles & auth-based RLS policies
  - Migration 006: NYP session storage (cookie management)
  - Migration 007: Targets & thresholds for KPI metrics
- **Usage**: Single copy-paste into Supabase SQL Editor

### ✅ Helper Scripts
1. **`scripts/create-first-user.ts`** - Interactive user creation
   - Creates auth user
   - Links to restaurant
   - Sets role (owner/manager/viewer)
   - Run via: `npm run db:create-user`

2. **`scripts/set-vercel-env.sh`** - Automated env var setup
   - Reads from `.env.local`
   - Sets all required Vercel env vars
   - Run via: `npm run deploy:env`

3. **`scripts/run-production-migrations.sh`** - Migration runner
   - Interactive script to run migrations
   - Option 1: Direct psql connection
   - Option 2: Opens Supabase SQL Editor

### ✅ NPM Scripts Added

```json
{
  "db:migrate": "Run database migrations",
  "db:create-user": "Create first user interactively",
  "deploy:env": "Set Vercel environment variables",
  "deploy": "Deploy to Vercel production"
}
```

### ✅ Documentation
- **`DEPLOY.md`** - Quick deployment guide (main reference)
- **`scripts/deploy-checklist.md`** - Comprehensive checklist with troubleshooting
- **`TODO.md`** - Updated with deployment workflow

## 3-Step Deployment

### Step 1: Database Setup (5 min)

```bash
# Open Supabase SQL Editor
open https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/sql/new

# Copy/paste and run: scripts/migrations-005-006-007.sql
```

This creates:
- ✅ `user_profiles` table
- ✅ `nyp_sessions` table
- ✅ `targets` table with default Rosmalen targets
- ✅ All RLS policies for auth-based access
- ✅ Service role bypass function

### Step 2: Create First User (2 min)

```bash
npm run db:create-user
```

Or manually via Supabase Dashboard:
1. Auth → Users → Add user
2. Email: `damian.gans@outlook.com`
3. Auto-confirm: ✅
4. Then run SQL to link:
```sql
INSERT INTO user_profiles (user_id, restaurant_id, role, display_name)
VALUES ('USER_ID', 'rosmalen', 'owner', 'Damian Gans');
```

### Step 3: Deploy to Vercel (5 min)

```bash
# Set environment variables
npm run deploy:env

# Deploy
npm run deploy
```

Done! 🎉

## Verification

After deployment:

1. **Visit production URL** → should redirect to `/login`
2. **Login** with credentials from Step 2
3. **Dashboard loads** with KPI cards (empty or with seed data)
4. **Header shows** user email + logout button
5. **Theme toggle** works

## Current Environment

Your `.env.local` is already configured:
- ✅ Supabase URL: `https://apvamphntjpbgoydsluc.supabase.co`
- ✅ Supabase keys set
- ✅ Cron secret set
- ✅ NYP credentials set

## Next Steps After Deployment

1. **Test cron job**:
   ```bash
   curl -X POST https://YOUR_DOMAIN/api/cron/download-reports \
     -H "Authorization: Bearer nyp-kpi-cron-secret-2026"
   ```

2. **Store NYP cookies** in database (for automated downloads)

3. **Verify parsers** with real Excel files

4. **Add tests** (currently 0% coverage)

5. **Optional features**:
   - Weekly summary email
   - Trend sparklines
   - Manager leaderboard
   - Mobile menu

## Files Created

```
scripts/
  ├── migrations-005-006-007.sql      (consolidated migrations)
  ├── create-first-user.ts            (user creation script)
  ├── set-vercel-env.sh               (env var automation)
  ├── run-production-migrations.sh    (migration runner)
  ├── deploy-checklist.md             (comprehensive guide)
  └── DEPLOYMENT_READY.md             (this file)

DEPLOY.md                              (quick reference)
TODO.md                                (updated with deploy workflow)
```

## Support

If anything fails:
1. Check `DEPLOY.md` troubleshooting section
2. Check `scripts/deploy-checklist.md` for detailed steps
3. Rollback: `vercel rollback`

---

**Status**: ✅ Ready to deploy
**Estimated time**: 15 minutes total
**Risk level**: Low (all migrations tested, rollback available)
