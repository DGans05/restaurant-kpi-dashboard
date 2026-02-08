# GitHub Actions Workflows

Automated tasks that run on GitHub's servers (completely free).

## 📋 Active Workflows

### 1. Download Daily Reports
**File:** `download-daily-reports.yml`
**Schedule:** Every day at 6 AM UTC (7 AM CET / 8 AM CEST)
**Purpose:** Automatically downloads yesterday's KPI data from NYP

**What it does:**
- Calls `/api/cron/download-reports` endpoint
- Downloads yesterday's operational report
- Parses and stores data in database
- Alerts if cookies have expired

**Manual trigger:**
- Go to: https://github.com/DGans05/restaurant-kpi-dashboard/actions
- Select "Download Daily Reports"
- Click "Run workflow"

---

### 2. Weekly Health Check
**File:** `weekly-health-check.yml`
**Schedule:** Every Monday at 8 AM UTC
**Purpose:** Checks if everything is working

**What it does:**
- Tests if production site is accessible
- Tests if API endpoints are working
- Alerts if cookies need refreshing
- Provides weekly status summary

**Manual trigger:**
- Go to: https://github.com/DGans05/restaurant-kpi-dashboard/actions
- Select "Weekly Health Check"
- Click "Run workflow"

---

## 🔐 Required Secrets

These workflows need a GitHub secret called `CRON_SECRET`.

### Add the Secret (One-time setup):

1. Go to: https://github.com/DGans05/restaurant-kpi-dashboard/settings/secrets/actions

2. Click **"New repository secret"**

3. Add:
   ```
   Name: CRON_SECRET
   Value: 9c0e9af56791699af387ff904365f2e57a8c90997486c61d92b710a9558f7ef5
   ```

4. Click **"Add secret"**

---

## 📊 Monitoring

### View Workflow Runs
https://github.com/DGans05/restaurant-kpi-dashboard/actions

### Check Last Run
- Green checkmark ✅ = Success
- Red X ❌ = Failed (check logs for details)
- Yellow dot 🟡 = Running

### Email Notifications
GitHub will email you if a workflow fails (can be configured in GitHub settings)

---

## 🔧 Troubleshooting

### "Cookies expired" error
**Solution:** Run cookie refresh locally:
```bash
npm run nyp:capture-cookies
```

### Workflow not running
**Check:**
1. Secret is added correctly (CRON_SECRET)
2. Workflows are enabled: Settings → Actions → General → "Allow all actions"
3. Repository has recent activity (GitHub may disable workflows on inactive repos)

### Want to disable?
1. Go to Actions tab
2. Select the workflow
3. Click "..." menu
4. Select "Disable workflow"

---

## 💡 Benefits

✅ **Free** - No cost, runs on GitHub infrastructure
✅ **Reliable** - GitHub's servers, not your computer
✅ **Automatic** - Set it and forget it
✅ **Transparent** - All logs visible in Actions tab
✅ **Manual control** - Can trigger anytime from UI

---

## 🎯 What You Need to Do

### Initial Setup (5 minutes):
1. ✅ Add CRON_SECRET to GitHub secrets (see above)
2. ✅ Push workflows to GitHub (done when you commit)
3. ✅ Wait for first scheduled run

### Ongoing (once per month):
1. If you get a "cookies expired" alert
2. Run: `npm run nyp:capture-cookies`
3. Done!

---

## 📅 Schedule Summary

| Workflow | Frequency | Time (UTC) | Time (CET/CEST) |
|----------|-----------|------------|-----------------|
| Download Reports | Daily | 6:00 AM | 7:00 AM / 8:00 AM |
| Health Check | Weekly (Mon) | 8:00 AM | 9:00 AM / 10:00 AM |

---

## 🔄 How It Works

```
GitHub Actions (Free)
        ↓
Runs on schedule
        ↓
Calls your API endpoint
        ↓
Your API downloads from NYP
        ↓
Stores in Supabase
        ↓
Data appears in dashboard
```

No Vercel cron jobs needed!
No paid plan required!
All running for free on GitHub!

---

## 📞 Support

**View logs:** https://github.com/DGans05/restaurant-kpi-dashboard/actions
**Disable workflow:** Actions tab → Select workflow → "..." → Disable
**Manual trigger:** Actions tab → Select workflow → "Run workflow"
