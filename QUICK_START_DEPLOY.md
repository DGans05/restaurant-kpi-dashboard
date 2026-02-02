# 5-Minute Quick Start - Deploy to Vercel & Supabase

**Time Required:** ~25 minutes total  
**Difficulty:** Easy  
**Prerequisites:** GitHub account, Supabase account, Vercel account (all free)

---

## 🎯 TL;DR Timeline

| Step | Time | Action |
|------|------|--------|
| 1 | 5 min | Create Supabase project, get API keys |
| 2 | 5 min | Run database migrations in Supabase |
| 3 | 5 min | Push code to GitHub |
| 4 | 5 min | Deploy on Vercel & add env vars |
| 5 | 5 min | Test in production |

**Total: ~25 minutes**

---

## 1️⃣ Create Supabase Project (5 min)

### Sign Up / Login
```
Go to: https://supabase.com
Click: "Start your project for free"
Sign in with GitHub or Email
```

### Create Project
```
Click: "New Project"
Fill:
  Project Name: restaurant-kpi-dashboard
  Password: [Create strong password - SAVE THIS]
  Region: Choose closest region
Click: "Create new project"
Wait: 2-3 minutes...
```

### Get API Credentials
```
Go to: Settings > API (left sidebar)
Copy these values to notepad:
  - Project URL → NEXT_PUBLIC_SUPABASE_URL
  - anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Example:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abc123def456.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2️⃣ Run Database Migrations (5 min)

### Migration 1: Create Tables

```
In Supabase:
1. Click: "SQL Editor" (left sidebar)
2. Click: "+ New Query"
3. Paste: supabase/migrations/20260202000001_initial_schema.sql
   (Copy entire file from your project)
4. Click: "Run"
5. Wait for success message
```

### Migration 2: Add Security Policies

```
1. Click: "+ New Query"
2. Paste: supabase/migrations/20260202000002_rls_policies.sql
   (Copy entire file from your project)
3. Click: "Run"
4. Wait for success message
```

### Verify Tables Created
```
Go to: "Table Editor" (left sidebar)
Should see tables:
  ✓ profiles
  ✓ restaurants  
  ✓ kpis
  ✓ user_restaurants
  ✓ audit_logs
```

---

## 3️⃣ Push to GitHub (5 min)

### Create Repository
```
Go to: https://github.com/new
Fill:
  Repository name: restaurant-kpi-dashboard
  Description: Restaurant KPI tracking dashboard
  Visibility: Public
Click: "Create repository"
```

### Push Code
```bash
# In your terminal, in the project folder:

git remote add origin https://github.com/YOUR-USERNAME/restaurant-kpi-dashboard.git
git add .
git commit -m "Initial commit: Restaurant KPI Dashboard v1.0"
git branch -M main
git push -u origin main
```

### Verify
```
Go to your repo on GitHub.com
Should see all project files
```

---

## 4️⃣ Deploy on Vercel (5 min)

### Create Vercel Project
```
Go to: https://vercel.com
Sign in with GitHub
Click: "Add New..." → "Project"
Select: restaurant-kpi-dashboard
Framework: Next.js (auto-detected)
Click: "Deploy"
Wait: 2-3 minutes for build...
```

### Add Environment Variables
```
While deploying, click: "Settings" in Vercel dashboard
Click: "Environment Variables"
Add these (for Production, Preview, Development):

Key: NEXT_PUBLIC_SUPABASE_URL
Value: [Paste your Supabase URL]

Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: [Paste your Supabase anon key]

Click: "Save"
Vercel auto-redeploys
```

### Copy Your Domain
```
After deployment:
Go to: Deployments tab
Copy: your-domain.vercel.app
Example: restaurant-kpi-dashboard-abc123.vercel.app
```

### Update Supabase Auth
```
In Supabase:
Settings > Authentication > Auth Configuration
Site URL (Production): https://your-domain.vercel.app
Click: "Save"
```

---

## 5️⃣ Test Production (5 min)

### Test Registration
```
Open: https://your-domain.vercel.app/register
Register account:
  Email: test@example.com
  Password: TestPassword123!
  Full Name: Test User
Click: "Sign Up"
Should redirect to dashboard
```

### Test Dashboard
```
Should see:
  ✓ Summary cards with metrics
  ✓ Revenue chart
  ✓ Cost breakdown chart
✓ All charts loading
```

### Test KPI Creation
```
Go to: /kpis
Click: "New Entry"
Fill form:
  Restaurant: [Select any]
  Date: Today
  Revenue: 5000
  Labour Cost: 1000
  Food Cost: 800
  Order Count: 50
Click: "Create Entry"
Should redirect to /kpis list
```

### Test CSV Export
```
Go to: /data (top navigation)
Click: "Export to CSV"
Should download file: kpi-export-YYYY-MM-DD.csv
✓ Download successful
```

---

## ✅ You're Done!

Your app is now live! 🎉

**Share your URL:**
```
https://your-domain.vercel.app
```

**Features working:**
- ✅ User authentication
- ✅ KPI tracking
- ✅ Dashboard analytics
- ✅ CSV import/export
- ✅ Admin tools
- ✅ Audit logging

---

## 🆘 Common Issues & Fixes

### Page shows "Cannot find module"
```
Issue: Environment variables not set
Fix: 
1. Go to Vercel > Settings > Environment Variables
2. Make sure NEXT_PUBLIC_SUPABASE_URL is set
3. Make sure NEXT_PUBLIC_SUPABASE_ANON_KEY is set
4. Click "Save" and wait for redeploy
```

### Registration page shows error
```
Issue: Supabase Auth not configured
Fix:
1. In Supabase > Settings > Authentication
2. Set Site URL to: https://your-domain.vercel.app
3. Click Save
4. Go back to /register and try again
```

### Dashboard shows "Network Error"
```
Issue: Database connection issue
Fix:
1. Check Supabase project is running
2. Verify API keys are correct
3. Check RLS policies allow access
4. Refresh page in incognito window
```

### Build failed on Vercel
```
Issue: TypeScript or ESLint error
Fix:
1. Run locally: npm run build
2. Fix errors
3. git add . && git commit && git push
4. Vercel auto-redeploys
```

---

## 📊 What You're Getting

| Feature | Status |
|---------|--------|
| User Authentication | ✅ Live |
| KPI CRUD Operations | ✅ Live |
| Dashboard Analytics | ✅ Live |
| CSV Import/Export | ✅ Live |
| Admin User Management | ✅ Live |
| Audit Logging | ✅ Live |
| Role-Based Access | ✅ Live |
| Error Handling | ✅ Live |
| Dark Mode | ✅ Live |

---

## 🚀 Next Steps

1. **Add more test data**
   - Create multiple restaurants
   - Import sample CSV
   - Create various user roles

2. **Invite team members**
   - Share your domain
   - Create accounts for them
   - Assign roles

3. **Monitor usage**
   - Check Vercel analytics
   - Review Supabase logs
   - Gather feedback

4. **Plan Phase 2**
   - Mobile app
   - Advanced analytics
   - Team collaboration features
   - Custom reports

---

## 📞 Need Help?

- **Supabase Issues**: https://supabase.com/docs
- **Vercel Issues**: https://vercel.com/docs
- **Next.js Issues**: https://nextjs.org/docs
- **Check Project Docs**: DEPLOYMENT_GUIDE.md

---

**🎉 Congratulations on your live application!**
