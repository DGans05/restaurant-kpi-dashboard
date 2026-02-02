# Deployment Guide - Restaurant KPI Dashboard

**Date:** February 2, 2026  
**Version:** 1.0  
**Status:** Ready for Production

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Post-Deployment Testing](#post-deployment-testing)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, you'll need:

### Required Accounts
- [ ] GitHub account (to push code)
- [ ] Supabase account (free tier available at supabase.com)
- [ ] Vercel account (free tier available at vercel.com)

### Required Software
- [ ] Node.js 20+ and npm 10+
- [ ] Git installed locally
- [ ] Git configured with GitHub credentials

### Project Ready
- [ ] Code is on local machine
- [ ] All dependencies installed (`npm install`)
- [ ] Build passes locally (`npm run build`)
- [ ] No uncommitted changes

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in project details:
   - **Name**: `restaurant-kpi-dashboard` (or your choice)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Select closest to your users
   - **Pricing Plan**: Free tier is fine for testing

4. Wait 2-3 minutes for project creation
5. Go to Project Settings > API to get credentials

### Step 2: Get API Credentials

In Supabase dashboard:

1. **Get your URL and Keys:**
   - Go to Settings > API
   - Copy `Project URL` → Save as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → Save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role secret` key → Save as `SUPABASE_SERVICE_ROLE_KEY`

2. **Example values:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### Step 3: Run Database Migrations

1. In Supabase dashboard, go to **SQL Editor**

2. **Create migration 1 - Initial Schema:**
   - Click "+ New Query"
   - Copy contents from `supabase/migrations/20260202000001_initial_schema.sql`
   - Run the query
   - Wait for completion

3. **Create migration 2 - RLS Policies:**
   - Click "+ New Query"
   - Copy contents from `supabase/migrations/20260202000002_rls_policies.sql`
   - Run the query
   - Wait for completion

4. **Verify tables created:**
   - Go to Table Editor
   - You should see: `profiles`, `restaurants`, `kpis`, `user_restaurants`, `audit_logs`

### Step 4: Enable Authentication

1. Go to **Authentication > Providers**
2. Ensure **Email** provider is enabled
3. Go to **Authentication > Settings**
4. Under "Site URL", set to:
   - Development: `http://localhost:3000`
   - Production: `https://your-vercel-domain.vercel.app`

### Step 5: Test Supabase Connection

```bash
# Set environment variables locally
export NEXT_PUBLIC_SUPABASE_URL="your-url"
export NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key"

# Start dev server
npm run dev

# Try to register a test account at http://localhost:3000/register
```

---

## Vercel Deployment

### Step 1: Push Code to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: Restaurant KPI Dashboard v1.0"

# Create repository on GitHub.com
# Then push:
git remote add origin https://github.com/YOUR-USERNAME/restaurant-kpi-dashboard.git
git branch -M main
git push -u origin main
```

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Select your GitHub repository (`restaurant-kpi-dashboard`)
4. Configure project:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `./` (default)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. Click "Deploy"

**Vercel will start building. This takes 2-3 minutes on first deploy.**

### Step 3: Set Environment Variables

While deployment is running:

1. Go to project settings in Vercel
2. Click "Environment Variables"
3. Add these variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key | Production, Preview, Development |

4. **Do NOT add `SUPABASE_SERVICE_ROLE_KEY` to Vercel** - Only use in local .env.local

5. Click "Save" and wait for redeploy

### Step 4: Configure Custom Domain (Optional)

1. Go to Settings > Domains in Vercel
2. Add your custom domain
3. Follow DNS configuration instructions
4. Wait for SSL certificate (10-30 minutes)

---

## Post-Deployment Testing

### Step 1: Test Frontend

```bash
# Visit your Vercel deployment URL (shown after deploy)
# Should see: Restaurant KPI Dashboard

# Test features:
- [ ] Homepage loads
- [ ] Can navigate to /login
- [ ] Can access /register
- [ ] Page styling looks correct
- [ ] Dark mode toggle works
```

### Step 2: Test Authentication

```bash
# On /register page:
1. Create test account:
   - Email: test@example.com
   - Password: TestPassword123!
   - Full Name: Test User

2. Should redirect to /dashboard
3. Should see dashboard with charts
4. Sidebar should be visible
```

### Step 3: Test API Routes

```bash
# After logging in, try these:

# Create KPI entry:
- Go to /kpis → New Entry
- Select restaurant
- Enter today's date
- Revenue: 5000
- Labour Cost: 1000
- Food Cost: 800
- Orders: 50
- Click "Create Entry"
- Should redirect to /kpis list

# Edit KPI entry:
- Click edit on any entry
- Change revenue to 5500
- Click "Update Entry"
- Should show updated value

# View KPI details:
- Click on any KPI entry
- Should show cost analysis and profitability
```

### Step 4: Test Dashboard

```bash
# On /dashboard page:
- [ ] Summary cards show metrics
- [ ] Revenue chart displays
- [ ] Cost breakdown chart displays
- [ ] Numbers update in real-time
```

### Step 5: Test Admin Features

```bash
# Create admin account first (manual in Supabase):
1. In Supabase > Table Editor > profiles
2. Create new row:
   - id: (auto)
   - email: admin@example.com
   - full_name: Admin User
   - role: admin
3. Create auth user via Supabase Auth

# Then test:
- [ ] Can access /admin/users
- [ ] Can see user list
- [ ] Can access /admin/audit-logs
- [ ] Can see audit log entries
```

### Step 6: Test Import/Export

```bash
# Go to /data page:

# Test export:
1. Click "Export to CSV"
2. Should download file: kpi-export-YYYY-MM-DD.csv
3. Open file - should have data

# Test import:
1. Create test CSV file with headers:
   restaurant_id,date,revenue,labour_cost,food_cost,order_count
   
2. Add sample row:
   [uuid],2026-02-02,5000,1000,800,50
   
3. Upload file
4. Should show success message
5. Check /kpis - should have new entries
```

---

## Production Checklist

- [ ] Supabase project created
- [ ] Migrations run successfully
- [ ] All tables visible in Supabase
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project connected
- [ ] Environment variables set
- [ ] First deployment succeeded
- [ ] Custom domain configured (if needed)
- [ ] Test account created and working
- [ ] Admin account created
- [ ] All features tested
- [ ] No console errors in browser
- [ ] Performance acceptable
- [ ] No security warnings

---

## Troubleshooting

### Deployment Failed

**Error: "Build failed"**
```bash
# Check build locally
npm run build

# If error, check:
1. All imports are correct
2. TypeScript errors: npx tsc --noEmit
3. ESLint errors: npm run lint
```

**Solution**: Fix local errors, push to GitHub, Vercel auto-redeploys

### Database Connection Issues

**Error: "Unable to connect to database"**

1. Verify environment variables in Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL = exactly matches Supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY = correct key
   ```

2. Check Supabase project is running (not paused)

3. Verify migrations ran without errors

### Authentication Not Working

**Error: "Email/password authentication failed"**

1. Check Supabase Email provider is enabled
2. Verify Site URL in Supabase is set to your Vercel domain
3. Check auth cookies:
   - Open DevTools > Application > Cookies
   - Should see `sb-*-auth-token`

### Pages Not Loading

**Error: 404 on production, works locally**

1. Check file paths are lowercase
2. Verify dynamic routes use `[param]` not `{param}`
3. Check middleware is deployed:
   - Should have `middleware.ts` in root
   - Check Vercel logs for middleware errors

### CSS Not Loading

**Error: Unstyled page, no Tailwind CSS**

1. Verify `tailwind.config.ts` exists
2. Check `globals.css` is imported in layout
3. Rebuild locally: `npm run build`
4. Push changes to GitHub

---

## Monitoring & Maintenance

### Check Deployment Status
- Vercel Dashboard > Deployments tab
- Shows all deployment history
- Can rollback to previous version

### View Logs
```bash
# Vercel logs:
1. Dashboard > Deployments
2. Click latest deployment
3. Click "View Logs"

# Supabase logs:
1. Dashboard > Logs
2. Filter by function/table
3. See execution details
```

### Monitor Performance
```bash
# Vercel Analytics:
1. Go to project settings
2. Click "Analytics"
3. View performance metrics

# Supabase Performance:
1. Dashboard > Logs tab
2. See query performance
3. Identify slow queries
```

### Database Backups
- Supabase auto-backups daily
- Manual backup available in Settings
- Restore from backup if needed

---

## Post-Launch Steps

1. **Add more test data**
   - Create multiple restaurants
   - Import CSV with sample data
   - Create various users with different roles

2. **Monitor first week**
   - Check error logs daily
   - Monitor database usage
   - Verify all features working

3. **Plan enhancements**
   - Gather user feedback
   - Prioritize feature requests
   - Plan Phase 2 improvements

4. **Security review**
   - Run security audit
   - Review RLS policies
   - Check for vulnerabilities
   - Update dependencies

---

## Support & Help

### Supabase Issues
- [Supabase Docs](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com)
- Email support for paid plans

### Vercel Issues
- [Vercel Docs](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/support)
- Email support available

### Next.js Issues
- [Next.js Docs](https://nextjs.org/docs)
- [Next.js Discord](https://discord.gg/bUG7V6D)

---

## Rollback Instructions

If deployment has issues:

### Rollback on Vercel
1. Go to Deployments tab
2. Find previous successful deployment
3. Click → Redeploy
4. Automatic rollback in ~1 minute

### Rollback on Supabase
1. Go to Settings > Database backups
2. Select date to restore
3. Click "Restore"
4. Confirm restoration

---

**You're ready to deploy! 🚀**

Follow these steps carefully and your Restaurant KPI Dashboard will be live in minutes.
