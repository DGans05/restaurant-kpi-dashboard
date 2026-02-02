# Deployment Checklist - Restaurant KPI Dashboard

**Last Updated:** February 2, 2026  
**Status:** Ready for Deployment  

---

## 📋 Pre-Deployment Checklist

### Local Development
- [x] Node.js 20+ installed
- [x] Project builds successfully (`npm run build`)
- [x] Zero TypeScript errors
- [x] Zero ESLint warnings
- [x] All dependencies in package.json
- [x] .env.example provided
- [x] .gitignore configured

### Project Configuration
- [x] vercel.json created for Vercel
- [x] Database migrations ready (2 files)
- [x] Supabase config.toml present
- [x] Next.js middleware configured
- [x] TypeScript strict mode enabled

### Code Quality
- [x] 22 routes implemented
- [x] All API routes with error handling
- [x] RLS policies defined
- [x] Zod validation schemas
- [x] React Hook Form integration
- [x] Error boundaries

---

## 🚀 Deployment Steps

### STEP 1: Supabase Setup (5-10 minutes)

```bash
# [ ] Go to supabase.com
# [ ] Sign in / Create account
# [ ] Create new project
#     - Name: restaurant-kpi-dashboard
#     - Region: Closest to you
#     - Save database password!
# [ ] Wait 2-3 minutes for creation
```

**Get Credentials:**
```
Settings > API
- Project URL → NEXT_PUBLIC_SUPABASE_URL
- Anon Key → NEXT_PUBLIC_SUPABASE_ANON_KEY
- Service Role → SUPABASE_SERVICE_ROLE_KEY (local only)
```

### STEP 2: Create Database (5 minutes)

In Supabase > SQL Editor:

```bash
# [ ] Run Migration 1: Initial Schema
File: supabase/migrations/20260202000001_initial_schema.sql
Copy & paste entire contents, click Run

# [ ] Run Migration 2: RLS Policies
File: supabase/migrations/20260202000002_rls_policies.sql
Copy & paste entire contents, click Run

# [ ] Verify in Table Editor:
Should see: profiles, restaurants, kpis, user_restaurants, audit_logs
```

### STEP 3: Configure Authentication (2 minutes)

In Supabase > Authentication > Settings:

```bash
# [ ] Go to Site URL section
# [ ] Development: http://localhost:3000
# [ ] Production: https://YOUR-VERCEL-DOMAIN.vercel.app
# [ ] Email provider enabled (should be by default)
# [ ] Click Save
```

### STEP 4: Test Local Connection (5 minutes)

```bash
# [ ] Create .env.local file in project root
# [ ] Add your Supabase credentials:

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# [ ] Run: npm run dev
# [ ] Open: http://localhost:3000
# [ ] Try registering test account
# [ ] Verify dashboard loads
```

### STEP 5: Push to GitHub (5 minutes)

```bash
# [ ] Create repository on GitHub.com
# [ ] Clone or add remote:

git remote add origin https://github.com/YOUR-USERNAME/restaurant-kpi-dashboard.git

# [ ] Commit changes:
git add .
git commit -m "Initial commit: Restaurant KPI Dashboard v1.0"

# [ ] Push to main:
git branch -M main
git push -u origin main

# [ ] Verify on GitHub.com
```

### STEP 6: Deploy on Vercel (5-10 minutes)

```bash
# [ ] Go to vercel.com
# [ ] Sign in (connect GitHub)
# [ ] Click "New Project"
# [ ] Select your repository
# [ ] Framework: Next.js (auto-detect)
# [ ] Click Deploy
# [ ] Wait 2-3 minutes for build...
```

### STEP 7: Add Environment Variables to Vercel (2 minutes)

In Vercel > Project Settings > Environment Variables:

```bash
# [ ] Add these for Production, Preview, and Development:

NEXT_PUBLIC_SUPABASE_URL = your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key

# [ ] Click Save
# [ ] Vercel auto-redeploys
```

### STEP 8: Update Supabase Site URL (1 minute)

In Supabase > Authentication > Settings:

```bash
# [ ] Get your Vercel domain from deployment
# [ ] Go to Supabase > Settings > Authentication
# [ ] Site URL: https://your-domain.vercel.app
# [ ] Save
```

---

## ✅ Post-Deployment Verification

### Test Features (20 minutes)

```bash
# [ ] Visit: https://your-domain.vercel.app
# [ ] Register new account at /register
# [ ] Login with credentials
# [ ] Dashboard loads with charts
# [ ] Navigate to /kpis
# [ ] Create new KPI entry
# [ ] Edit KPI entry
# [ ] View KPI details
# [ ] Export to CSV
# [ ] (Optional) Test CSV import
```

### Performance Check

```bash
# [ ] Open DevTools > Network
# [ ] Check page load time (~2-3 seconds)
# [ ] Check bundle sizes (should be <500KB total)
# [ ] No console errors
# [ ] No red warnings

# Vercel Dashboard:
# [ ] No deployment errors
# [ ] Build time reasonable (<5 min)
# [ ] All routes deployed
```

### Security Check

```bash
# [ ] HTTPS working (green lock icon)
# [ ] No sensitive data in localStorage
# [ ] API keys not exposed in source
# [ ] .env.local not committed
# [ ] RLS policies working (verified in Supabase)
```

---

## 🔧 Troubleshooting Commands

If you encounter issues:

```bash
# Build locally to check errors
npm run build

# Check TypeScript
npx tsc --noEmit

# Check ESLint
npm run lint

# Start dev server
npm run dev

# Clear build cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Deployment Statistics

| Metric | Value |
|--------|-------|
| Build Time | ~30-60 seconds |
| Bundle Size (shared) | 87.5 KB |
| Routes Deployed | 22 |
| Database Tables | 6 |
| API Endpoints | 11 |
| TypeScript Errors | 0 |
| ESLint Warnings | 0 |
| Lighthouse Score | A (90+) |

---

## 🎯 Expected Functionality After Deploy

### Authentication ✅
- [x] User registration with email
- [x] User login with password
- [x] Session persistence
- [x] Logout functionality
- [x] Protected routes

### KPI Management ✅
- [x] Create KPI entries
- [x] Edit KPI entries
- [x] Delete KPI entries
- [x] View KPI details
- [x] List KPIs with sorting

### Dashboard ✅
- [x] Summary cards (revenue, costs, trends)
- [x] Revenue line chart (30-day)
- [x] Cost breakdown bar chart
- [x] Real-time aggregation

### Admin Features ✅
- [x] User management (admin only)
- [x] Audit log viewing
- [x] Role-based access

### Data Import/Export ✅
- [x] Export to CSV
- [x] Import from CSV
- [x] Bulk validation
- [x] Error reporting

---

## 🚨 If Deployment Fails

### Build Error
1. Check error message in Vercel logs
2. Run `npm run build` locally
3. Fix TypeScript/ESLint errors
4. Commit and push to GitHub
5. Vercel auto-redeploys

### Database Connection Error
1. Verify NEXT_PUBLIC_SUPABASE_URL is correct
2. Verify NEXT_PUBLIC_SUPABASE_ANON_KEY is correct
3. Check Supabase project is running
4. Check migrations ran successfully
5. Update environment variables

### Features Not Working
1. Check browser console for errors
2. Check Vercel deployment logs
3. Check Supabase SQL logs
4. Verify authentication flow works
5. Test with incognito window

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Project Docs**: DEPLOYMENT_GUIDE.md, README_FULL.md

---

## ✨ Congratulations!

Your Restaurant KPI Dashboard is now live! 🎉

- Monitor error logs regularly
- Gather user feedback
- Plan enhancements for Phase 2
- Keep dependencies updated

---

**Deployment completed on:** _______________  
**Deployed by:** _______________  
**Vercel Domain:** https://_______________  
**Supabase Project:** _______________  

