# Quick Deployment Guide

## Step 1: Run Database Migrations ✅

1. Open Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/sql/new
   ```

2. Copy and paste the contents of:
   ```
   scripts/migrations-005-006-007.sql
   ```

3. Click "Run" to execute all migrations

4. Verify success by checking the verification queries at the bottom of the SQL file

## Step 2: Create First User 👤

Run the interactive script:
```bash
npm run db:create-user
```

Or manually via Supabase Dashboard:
1. Go to: https://supabase.com/dashboard/project/apvamphntjpbgoydsluc/auth/users
2. Click "Add user" → "Create new user"
3. Email: `damian.gans@outlook.com`
4. Password: (set secure password)
5. Auto-confirm: ✅

Then link to restaurant via SQL Editor:
```sql
-- Replace USER_ID with the actual UUID from auth.users
INSERT INTO user_profiles (user_id, restaurant_id, role, display_name)
VALUES (
  'USER_ID_HERE',
  'rosmalen',
  'owner',
  'Damian Gans'
);
```

## Step 3: Deploy to Vercel 🚀

```bash
# 1. Install Vercel CLI (if needed)
npm i -g vercel

# 2. Set environment variables
npm run deploy:env

# 3. Deploy to production
npm run deploy
```

Or manually:
```bash
# Link project
vercel link

# Set env vars (one by one)
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add CRON_SECRET production
vercel env add NYP_STORE_USERNAME_ROSMALEN production
vercel env add NYP_STORE_PASSWORD_ROSMALEN production

# Deploy
vercel --prod
```

## Step 4: Verify Deployment ✓

1. Visit production URL (from Vercel output)
2. Should redirect to `/login`
3. Login with credentials from Step 2
4. Should see dashboard with KPI cards

## Step 5: Test Cron Job 🕐

Manually trigger the cron endpoint:
```bash
curl -X POST https://YOUR_DOMAIN.vercel.app/api/cron/download-reports \
  -H "Authorization: Bearer nyp-kpi-cron-secret-2026"
```

Check Vercel logs:
```bash
vercel logs --follow
```

## Troubleshooting

### Build fails
- Check `vercel logs`
- Ensure all env vars are set: `vercel env ls`

### Login redirect loop
- Check RLS policies are applied
- Verify user_profiles entry exists

### Cron job not running
- Check Vercel Dashboard → Settings → Cron Jobs
- Verify `CRON_SECRET` is set
- Check `vercel.json` has correct cron config

### Data not showing
- Check Supabase `kpi_entries` table has data
- Run `npm run seed:supabase` to add test data
- Check browser console for errors

## Next Steps

See `scripts/deploy-checklist.md` for:
- Pipeline verification (NYP cookie storage)
- Parser testing with real Excel files
- Weekly summary email setup
- Additional features

## Rollback

If something goes wrong:
```bash
vercel rollback
```
