# How to Add Cron Jobs in Vercel Dashboard

## 📍 Step-by-Step Guide

### Step 1: Go to Vercel Dashboard
Visit: https://vercel.com/dgans-projects/restaurant-kpi-dashboard

### Step 2: Click on "Settings"
- Look at the top navigation bar
- Click on **"Settings"** (it's next to "Deployments")

### Step 3: Find "Cron Jobs" in Sidebar
- On the left sidebar, scroll down
- Click on **"Cron Jobs"** (under "Integrations" section)
- Or go directly to: https://vercel.com/dgans-projects/restaurant-kpi-dashboard/settings/cron

### Step 4: Add First Cron Job (Cookie Refresh)

Click the **"Create"** or **"Add Cron Job"** button

Fill in the form:
```
Name: Cookie Refresh
Path: /api/cron/refresh-cookies
Schedule: 0 1 * * *
Description: Automated NYP session refresh
```

Click **"Create"** or **"Save"**

### Step 5: Add Second Cron Job (Download Reports)

Click **"Add Cron Job"** again

Fill in the form:
```
Name: Download Reports
Path: /api/cron/download-reports
Schedule: 0 2 * * *
Description: Automated daily KPI data ingestion
```

Click **"Create"** or **"Save"**

---

## ✅ Verification

After adding both cron jobs, you should see:

```
✓ Cookie Refresh
  /api/cron/refresh-cookies
  0 1 * * * (Runs daily at 1:00 AM UTC)

✓ Download Reports
  /api/cron/download-reports
  0 2 * * * (Runs daily at 2:00 AM UTC)
```

---

## 🔍 Troubleshooting

### "I don't see a Cron Jobs option"
- Make sure you're on a **Pro** or **Enterprise** plan
- Free/Hobby plans don't support cron jobs
- Check: https://vercel.com/dgans-projects/restaurant-kpi-dashboard/settings/general

### "I can't find the Settings tab"
1. Go to: https://vercel.com
2. Click on your project: **restaurant-kpi-dashboard**
3. Top nav bar should show: Overview | Deployments | Analytics | Settings | etc.

### "The form looks different"
Vercel sometimes updates their UI. Look for these fields:
- **Endpoint/Path** (where you put `/api/cron/...`)
- **Schedule** (where you put `0 1 * * *`)

---

## 📱 Alternative: Contact Vercel Support

If you still can't find it:
1. Go to: https://vercel.com/help
2. Search for "cron jobs"
3. Or contact support with: "How do I add cron jobs to my project?"

---

## 🎯 What Each Field Means

### Path
The API endpoint to call
- Must start with `/`
- Points to your API route files

### Schedule (Cron Expression)
```
0 1 * * *
│ │ │ │ │
│ │ │ │ └─ Day of week (0-7)
│ │ │ └─── Month (1-12)
│ │ └───── Day of month (1-31)
│ └─────── Hour (0-23)
└───────── Minute (0-59)
```

Examples:
- `0 1 * * *` = Every day at 1:00 AM
- `0 */6 * * *` = Every 6 hours
- `0 9 * * 1` = Every Monday at 9:00 AM

---

## ⚠️ Important Notes

1. **Timezone**: All times are in UTC
   - 1 AM UTC = 2 AM CET (winter) or 3 AM CEST (summer)
   - 2 AM UTC = 3 AM CET (winter) or 4 AM CEST (summer)

2. **Authentication**: The cron jobs will automatically include Vercel's authentication
   - Your endpoints check for CRON_SECRET
   - Vercel provides this automatically when calling cron jobs

3. **First Run**: Cron jobs will start running on the next scheduled time
   - Not immediately after creation
   - Check logs to verify they ran successfully

---

## 📊 Monitoring

After cron jobs are set up, monitor them:

### Check Logs
```bash
vercel logs --scope dgans-projects
```

### Check Cron Execution History
1. Go to: https://vercel.com/dgans-projects/restaurant-kpi-dashboard/settings/cron
2. Each cron job will show recent executions
3. Click on a cron job to see detailed logs

---

## 🆘 Still Stuck?

Share a screenshot of what you're seeing:
1. Take screenshot of the Vercel dashboard
2. Show me where you're stuck
3. I'll guide you through it

Or we can use the Vercel CLI to configure them instead.
