# Bulk Import Historical Data

Import an entire year of historical KPI data from NYP into your dashboard.

---

## 🎯 Quick Start

### Import All of 2025
```bash
npm run nyp:bulk-import-2025
```

**Time:** ~10-15 minutes (365 days with rate limiting)
**Data:** Full year of KPI entries

---

## ✅ Prerequisites

### 1. Valid NYP Cookies
Run this first if your cookies are old or expired:
```bash
npm run nyp:capture-cookies
```

### 2. Environment Variables
Make sure you have:
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

---

## 📊 What It Does

The script will:
1. ✅ Verify NYP session is valid
2. 📅 Generate list of all days in 2025
3. 🔍 Check which days already exist (skips them)
4. 📥 Download each day's report from NYP
5. 🔄 Parse the Excel data
6. 💾 Store in Supabase database
7. 📈 Show progress for each day
8. 📊 Display final summary

---

## 🖥️ Example Output

```
🚀 Bulk Import 2025 Data
========================

✅ Using cookies from database
🔐 Verifying NYP session...
✅ Session valid

📅 Processing 365 days from 2025

[1/365] 📥 2025-01-01 - Downloading... ✅ 1 entries
[2/365] 📥 2025-01-02 - Downloading... ✅ 1 entries
[3/365] ⏭️  2025-01-03 - Already exists
[4/365] 📥 2025-01-04 - Downloading... ❌ No data
...
[365/365] 📥 2025-12-31 - Downloading... ✅ 1 entries

========================
📊 Import Summary
========================

✅ Success: 320 days
⏭️  Skipped: 40 days
❌ Errors: 5 days
📅 Total: 365 days

🎉 Import complete!
🔗 View dashboard: https://nypkpi.com
```

---

## 🔧 Troubleshooting

### "NYP session expired"
**Solution:**
```bash
npm run nyp:capture-cookies
```
Then run the import again.

### "Database connection failed"
**Check:**
1. Supabase credentials in `.env.local`
2. Service role key is correct
3. Database is accessible

### Rate Limited
The script includes 500ms delay between requests.
If you hit rate limits:
- Wait 10 minutes
- Run again (it skips already imported days)

### Script Crashes Mid-Way
**No problem!** Run it again:
- Already imported days will be skipped
- It picks up where it left off
- Progress is saved to database

---

## 📅 Import Specific Date Ranges

### Modify the Script
Edit `scripts/bulk-import-2025.ts`:

```typescript
// Import only January 2025
const startDate = new Date(2025, 0, 1);  // Jan 1
const endDate = new Date(2025, 0, 31);   // Jan 31

// Import Q1 2025
const startDate = new Date(2025, 0, 1);   // Jan 1
const endDate = new Date(2025, 2, 31);    // Mar 31

// Import specific month
const startDate = new Date(2025, 5, 1);   // June 1
const endDate = new Date(2025, 5, 30);    // June 30
```

---

## 📈 After Import

### View Data
1. Open: https://nypkpi.com
2. Login
3. Use period selector to browse 2025 data

### Verify Import
Check database:
```bash
# Count total entries
supabase db query "SELECT COUNT(*) FROM kpi_entries WHERE date >= '2025-01-01' AND date <= '2025-12-31'"
```

### Export to CSV
Use the dashboard CSV export feature:
1. Select date range: 2025-01-01 to 2025-12-31
2. Click Export
3. Opens in Excel

---

## ⚠️ Important Notes

### Missing Days
Some days won't have data:
- NYP might not have reports for certain days
- Stores might have been closed
- System downtime
- **This is normal**

### Data Validation
The parser validates:
- Required fields exist
- Numbers are within expected ranges
- Dates are valid
- **Invalid data is skipped**

### Duplicate Prevention
- Script checks if day already exists
- Skips if found
- Safe to run multiple times
- No duplicates created

### Performance
- ~365 API calls (one per day)
- ~500ms delay between calls
- Total time: ~10-15 minutes
- Database writes are batch optimized

---

## 🔄 Re-Import Specific Days

If you need to re-import specific days:

### Option 1: Delete First
```sql
-- Delete January 2025
DELETE FROM kpi_entries
WHERE restaurant_id = 'rosmalen'
  AND date >= '2025-01-01'
  AND date <= '2025-01-31';
```
Then run the import script.

### Option 2: Force Update
Modify the script to use `.upsert()` instead of `.insert()`:
```typescript
const { error } = await supabase
  .from('kpi_entries')
  .upsert(kpiRows, { onConflict: 'restaurant_id,date' });
```

---

## 💡 Tips

### Run in Background
```bash
# Run in tmux or screen for long imports
tmux new -s import
npm run nyp:bulk-import-2025
# Ctrl+B, then D to detach
```

### Check Progress
```bash
# Count imported days
supabase db query "SELECT COUNT(*) FROM kpi_entries WHERE date >= '2025-01-01'"
```

### Monitor Logs
The script shows real-time progress:
- ✅ = Successfully imported
- ⏭️  = Already exists (skipped)
- ❌ = No data or error

---

## 📊 Expected Results

For a full year (2025):
- **Total days:** 365
- **Expected success:** 300-350 days
- **Expected skips/errors:** 15-65 days
- **Reasons for skips:**
  - Weekends (if store closed)
  - Holidays
  - Missing reports in NYP system
  - Future dates (if running before year end)

---

## 🆘 Need Help?

### Check Logs
All errors are logged to console with details

### Verify Database
```bash
# Check latest entries
supabase db query "SELECT date, manager FROM kpi_entries ORDER BY date DESC LIMIT 10"
```

### Test Single Day
Modify script to test one day:
```typescript
const allDates = [new Date(2025, 0, 15)]; // Jan 15 only
```

---

## 🎉 Success!

After import completes:
1. ✅ All 2025 data in database
2. 📊 Charts show full year trends
3. 📈 Period comparisons work
4. 🎯 Analytics are complete

**Your dashboard now has a full year of historical data!** 🚀
