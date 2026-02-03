# Post-Deployment Testing Checklist

Use this checklist to verify your Restaurant KPI Dashboard deployment is working correctly.

## Prerequisites

Before testing, ensure:
- ✅ Vercel deployment is complete and accessible
- ✅ Environment variables are set in Vercel
- ✅ Supabase Site URL is updated to your Vercel domain
- ✅ Database migrations have been run in Supabase

## Test 1: Frontend Loading

**Objective**: Verify the application loads correctly

1. Visit your Vercel deployment URL: `https://your-project.vercel.app`
2. **Expected**: Homepage loads with "Restaurant KPI Dashboard" title
3. **Check**:
   - [ ] Page loads without errors
   - [ ] No console errors (open DevTools F12)
   - [ ] Styling is correct (Tailwind CSS loaded)
   - [ ] Dark mode toggle works (if visible)

**Navigation Test**:
- [ ] Click "Login" → Should navigate to `/login`
- [ ] Click "Register" → Should navigate to `/register`
- [ ] Browser back button works correctly

**If issues**:
- Check browser console for errors
- Verify environment variables in Vercel
- Check Vercel deployment logs

---

## Test 2: Authentication - Registration

**Objective**: Verify user registration works

1. Navigate to `/register`
2. Fill in the registration form:
   - **Email**: `test@example.com` (use a real email you can access)
   - **Password**: `TestPassword123!` (must meet requirements)
   - **Full Name**: `Test User`
3. Click **"Register"** or **"Create Account"**

**Expected Results**:
- [ ] Form submits successfully
- [ ] Redirects to `/dashboard` after registration
- [ ] No error messages displayed
- [ ] User profile created in Supabase

**Verify in Supabase**:
1. Go to Supabase → **Authentication** → **Users**
2. [ ] New user appears in the list
3. Go to **Table Editor** → **profiles**
4. [ ] Profile record created with correct email and name
5. [ ] Role defaults to `viewer`

**If issues**:
- Check Supabase authentication logs
- Verify Email provider is enabled
- Check Site URL matches Vercel domain
- Verify environment variables are correct

---

## Test 3: Authentication - Login

**Objective**: Verify login functionality

1. Log out if currently logged in (click logout button)
2. Navigate to `/login`
3. Enter credentials:
   - **Email**: `test@example.com`
   - **Password**: `TestPassword123!`
4. Click **"Login"**

**Expected Results**:
- [ ] Login succeeds
- [ ] Redirects to `/dashboard`
- [ ] User session persists on page refresh
- [ ] Can navigate between pages while logged in

**Session Test**:
- [ ] Refresh page → Still logged in
- [ ] Close and reopen browser → Still logged in (if "Remember me" was checked)
- [ ] Logout → Redirects to home/login

**If issues**:
- Check browser cookies (DevTools → Application → Cookies)
- Should see `sb-*-auth-token` cookie
- Verify Supabase authentication settings

---

## Test 4: Dashboard Display

**Objective**: Verify dashboard loads and displays data

1. Navigate to `/dashboard` (should be automatic after login)
2. **Expected**: Dashboard page with charts and summary cards

**Check Components**:
- [ ] **Summary Cards**: Display metrics (may show zeros if no data)
  - Total Revenue
  - Average Daily Revenue
  - Total Orders
  - Profit Margin
- [ ] **Revenue Chart**: Displays (may be empty if no data)
- [ ] **Cost Breakdown Chart**: Displays (may be empty if no data)
- [ ] **Sidebar Navigation**: Visible and functional
- [ ] **Header**: Shows user info/logout button

**If no data**:
- This is expected if you haven't created KPI entries yet
- Charts should still render (empty state)
- Continue to Test 5 to add data

**If issues**:
- Check browser console for API errors
- Verify Supabase connection
- Check Vercel function logs

---

## Test 5: KPI Management - Create Entry

**Objective**: Verify KPI entry creation

**Prerequisites**: You need at least one restaurant in the database

### Step 5a: Create Restaurant (if needed)

1. Go to Supabase → **Table Editor** → **restaurants**
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   - **name**: `Test Restaurant`
   - **location**: `Test City`
   - **is_active**: `true`
4. Click **"Save"**
5. Copy the restaurant `id` (UUID)

### Step 5b: Assign Restaurant to User

1. Go to **Table Editor** → **user_restaurants**
2. Click **"Insert"** → **"Insert row"**
3. Fill in:
   - **user_id**: Your test user's UUID (from profiles table)
   - **restaurant_id**: Restaurant UUID from Step 5a
4. Click **"Save"**

### Step 5c: Create KPI Entry

1. In the app, navigate to `/kpis/new`
2. Fill in the form:
   - **Restaurant**: Select "Test Restaurant"
   - **Date**: Today's date
   - **Revenue**: `5000`
   - **Labour Cost**: `1000`
   - **Food Cost**: `800`
   - **Order Count**: `50`
3. Click **"Create Entry"** or **"Submit"**

**Expected Results**:
- [ ] Form submits successfully
- [ ] Redirects to `/kpis` list page
- [ ] New entry appears in the list
- [ ] No error messages

**Verify in Supabase**:
1. Go to **Table Editor** → **kpi_entries**
2. [ ] New entry exists with correct data
3. [ ] `created_by` matches your user ID
4. [ ] `created_at` timestamp is set

**If issues**:
- Check form validation errors
- Verify user has `manager` or `admin` role
- Check restaurant assignment in `user_restaurants`
- Review Vercel API logs

---

## Test 6: KPI Management - Edit Entry

**Objective**: Verify KPI entry editing

1. Navigate to `/kpis`
2. Find the entry you just created
3. Click **"Edit"** button (or navigate to `/kpis/[id]/edit`)
4. Change **Revenue** to `5500`
5. Click **"Update Entry"** or **"Save"**

**Expected Results**:
- [ ] Form submits successfully
- [ ] Redirects to KPI list or detail page
- [ ] Updated value appears in the list
- [ ] `updated_at` timestamp changes

**Verify in Supabase**:
1. Go to **Table Editor** → **kpi_entries**
2. [ ] Revenue value is `5500`
3. [ ] `updated_at` timestamp is recent

**If issues**:
- Verify user has edit permissions (manager/admin role)
- Check restaurant assignment
- Review API route logs

---

## Test 7: KPI Management - View Details

**Objective**: Verify KPI detail page

1. Navigate to `/kpis`
2. Click on a KPI entry (or click "View" button)
3. Should navigate to `/kpis/[id]`

**Expected Results**:
- [ ] Detail page loads
- [ ] Shows all KPI data:
  - Restaurant name
  - Date
  - Revenue, Labour Cost, Food Cost, Order Count
- [ ] Shows calculated metrics:
  - Cost percentages
  - Profit margin
  - Profit amount
- [ ] Edit button is visible (if user has permissions)

**If issues**:
- Check API route `/api/kpis/[id]`
- Verify data exists in database
- Check browser console for errors

---

## Test 8: Dashboard with Data

**Objective**: Verify dashboard updates with real data

1. After creating KPI entries, navigate to `/dashboard`
2. Refresh the page

**Expected Results**:
- [ ] Summary cards show actual numbers (not zeros)
- [ ] Revenue chart displays data points
- [ ] Cost breakdown chart shows segments
- [ ] Numbers match your KPI entries

**Create Multiple Entries**:
- Create entries for different dates (past 30 days)
- Verify charts update with multiple data points
- Check trend indicators (up/down arrows)

**If issues**:
- Verify KPI entries exist in database
- Check date ranges (dashboard shows last 30 days)
- Review API responses in browser Network tab

---

## Test 9: Admin Features

**Objective**: Verify admin-only features work

**Prerequisites**: Create an admin user

### Step 9a: Create Admin User

1. Go to Supabase → **Table Editor** → **profiles**
2. Find your test user
3. Edit the row:
   - Change **role** to `admin`
4. Click **"Save"**

### Step 9b: Test Admin Pages

1. Log out and log back in (to refresh role)
2. Navigate to `/admin/users`

**Expected Results**:
- [ ] User list page loads
- [ ] Shows all users in the system
- [ ] Can see user details (email, name, role)
- [ ] Edit/delete buttons visible (if implemented)

3. Navigate to `/admin/audit-logs`

**Expected Results**:
- [ ] Audit logs page loads
- [ ] Shows log entries (may be empty if no actions logged)
- [ ] Logs display after performing actions (create/edit KPI)

**If issues**:
- Verify user role is `admin` in database
- Check middleware/auth checks
- Verify RLS policies allow admin access

---

## Test 10: Import/Export

**Objective**: Verify CSV import/export functionality

### Test 10a: Export CSV

1. Navigate to `/data`
2. Click **"Export to CSV"** or **"Download CSV"**

**Expected Results**:
- [ ] CSV file downloads
- [ ] Filename includes date: `kpi-export-YYYY-MM-DD.csv`
- [ ] File contains data:
  - Headers: restaurant_id, date, revenue, labour_cost, food_cost, order_count
  - Data rows match your KPI entries

**Open CSV**:
- [ ] Opens correctly in Excel/Google Sheets
- [ ] Data is formatted correctly
- [ ] All entries are included

### Test 10b: Import CSV

1. Create a test CSV file with headers:
   ```csv
   restaurant_id,date,revenue,labour_cost,food_cost,order_count
   ```
2. Add a sample row (use a restaurant UUID from your database):
   ```csv
   [uuid-here],2026-02-03,6000,1200,900,60
   ```
3. Navigate to `/data`
4. Click **"Choose File"** or **"Upload CSV"**
5. Select your test CSV file
6. Click **"Import"** or **"Upload"**

**Expected Results**:
- [ ] File uploads successfully
- [ ] Shows success message
- [ ] Validation errors displayed if data is invalid
- [ ] New entries appear in `/kpis` list

**Verify in Database**:
- [ ] New entries created in `kpi_entries` table
- [ ] Data matches CSV file

**If issues**:
- Check CSV format matches expected schema
- Verify restaurant_id exists in database
- Check file size limits (5MB default)
- Review import API logs

---

## Test 11: Error Handling

**Objective**: Verify error handling works correctly

### Test Invalid Login

1. Navigate to `/login`
2. Enter incorrect credentials
3. Click **"Login"**

**Expected**:
- [ ] Error message displayed
- [ ] Does not redirect to dashboard
- [ ] Form remains on login page

### Test Unauthorized Access

1. Log out
2. Try to access `/dashboard` directly (type URL)

**Expected**:
- [ ] Redirects to `/login`
- [ ] Cannot access protected routes

### Test Invalid Form Data

1. Navigate to `/kpis/new`
2. Submit form with invalid data (e.g., negative revenue)

**Expected**:
- [ ] Validation errors displayed
- [ ] Form does not submit
- [ ] Helpful error messages

---

## Test 12: Performance & Responsiveness

**Objective**: Verify app performs well

1. **Page Load Speed**:
   - [ ] Pages load in < 3 seconds
   - [ ] No long loading spinners
   - [ ] Charts render smoothly

2. **Mobile Responsiveness**:
   - [ ] Open on mobile device or resize browser
   - [ ] Layout adapts correctly
   - [ ] Forms are usable on mobile
   - [ ] Navigation works on mobile

3. **Browser Compatibility**:
   - [ ] Test in Chrome
   - [ ] Test in Firefox
   - [ ] Test in Safari
   - [ ] Test in Edge

---

## Final Verification

After completing all tests:

- [ ] All critical features working
- [ ] No console errors
- [ ] No broken links
- [ ] Data persists correctly
- [ ] Authentication secure
- [ ] Admin features accessible only to admins
- [ ] Performance acceptable

## Common Issues & Solutions

### "Unable to connect to database"
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel
- Check Supabase project is not paused
- Verify network connectivity

### "Authentication failed"
- Check Supabase Site URL matches Vercel domain
- Verify Email provider is enabled
- Check redirect URLs in Supabase

### "Permission denied" errors
- Verify user role in database
- Check restaurant assignments in `user_restaurants`
- Review RLS policies

### Charts not displaying
- Verify KPI entries exist
- Check date ranges (last 30 days)
- Review API responses in Network tab

---

## Next Steps

After successful testing:

1. ✅ Create production admin account
2. ✅ Add real restaurant data
3. ✅ Import historical data (if available)
4. ✅ Set up monitoring/alerts
5. ✅ Document any custom configurations
6. ✅ Share access with team members

## Support

If you encounter issues not covered here:
- Check Vercel deployment logs
- Check Supabase logs
- Review browser console errors
- See DEPLOYMENT_GUIDE.md troubleshooting section
