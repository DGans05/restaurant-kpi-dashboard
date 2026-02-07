# NYP Report Download Automation

## Overview

Automated script to download all 30+ report types from the New York Pizza store (https://store.newyorkpizza.nl/Reporting) for the last 6 months and upload them to our Reports webapp.

## Features

✅ **Semi-Automated Downloads**: Downloads all 30+ report types with minimal user input (2FA only)
✅ **2FA Support**: Handles email verification code authentication
✅ **Multi-Restaurant Support**: Configure multiple restaurants with different credentials
✅ **Time Validation**: Prevents downloads during restricted hours (16:00-20:00)
✅ **Idempotent**: Skips reports that already exist, safe to re-run
✅ **Batch Processing**: Downloads 5 reports in parallel to optimize speed
✅ **Error Recovery**: Graceful failure handling, continues on errors
✅ **Progress Tracking**: Real-time console output with statistics

## Prerequisites

1. **Node.js v18+** (current: v25)
2. **Chromium browser** (installed via Playwright)
3. **NYP Store Credentials** (username and password)
4. **Email Access** (for 2FA verification codes)
5. **Supabase Configuration** (URL and anon key)

## Two-Factor Authentication (2FA)

⚠️ **IMPORTANT**: The NYP store uses **email-based 2FA** authentication. When you run the script:

1. **Initial login** will send a verification code to your registered email
2. The script will **pause and prompt you** to enter the code
3. You have **5 minutes** to check your email and enter the code
4. After entering the code, the script **continues automatically**

### 2FA Process Flow

```
1. Script starts → Fills username/password → Submits
2. NYP sends code to your email
3. Script displays: "📧 2FA verification required!"
4. Script prompts: "Enter verification code: "
5. You check email and enter code
6. Script submits code and continues downloading
```

### Important Notes

- ✅ Keep your email open and ready before running the script
- ✅ The code is typically 6 digits
- ✅ Code expires after a few minutes
- ⚠️ If you enter wrong code, the script will fail (re-run to try again)
- ⚠️ 2FA is required **once per restaurant** at the start
- ⚠️ Session usually lasts for the entire download process

## Installation

Dependencies are already installed via `npm install`. If needed:

```bash
npm install playwright uuid dotenv
npm install --save-dev @types/uuid
npx playwright install chromium
```

## Configuration

### 1. Environment Variables

Add your NYP store credentials to `.env.local`:

```bash
# NYP Store Credentials
NYP_STORE_USERNAME_ROSMALEN=your-username@example.com
NYP_STORE_PASSWORD_ROSMALEN=your-secure-password
```

### 2. Multiple Restaurants

To add more restaurants, edit `lib/config/nyp-restaurants.ts`:

```typescript
export const NYP_RESTAURANT_CONFIGS: NypRestaurantConfig[] = [
  {
    restaurantId: 'rosmalen',
    nypUsername: 'NYP_STORE_USERNAME_ROSMALEN',
    nypPassword: 'NYP_STORE_PASSWORD_ROSMALEN',
  },
  {
    restaurantId: 'amsterdam',
    nypUsername: 'NYP_STORE_USERNAME_AMSTERDAM',
    nypPassword: 'NYP_STORE_PASSWORD_AMSTERDAM',
  },
];
```

Then add corresponding environment variables to `.env.local`.

## Usage

### Before Running

⚠️ **Important**: Have your **email open and ready** - you'll need to enter a 2FA verification code during login.

### Basic Command

```bash
npm run download-reports
```

The script will:
1. Validate time restrictions
2. Launch browser
3. Login to NYP store
4. **Pause and ask for 2FA code** (check your email)
5. Download all reports for last 6 months
6. Upload to Supabase
7. Clean up and show statistics

### Expected Output

```
🚀 NYP Report Download Automation

⚠️  IMPORTANT: This script requires 2FA authentication
   The NYP store sends a verification code to your email.
   You will be prompted to enter the code during login.
   Please have access to your email ready.

⏰ Time check: ✅ OK

📅 Downloading reports for 6 months (Aug 2025 to Jan 2026)

📁 Temporary directory: /tmp/nyp-reports/{sessionId}

🌐 Browser launched

============================================================
🏪 Processing restaurant: ROSMALEN
============================================================
🔐 Authenticating...
  🔑 Filling login credentials...

  📧 2FA verification required!
  ℹ️  An authentication code has been sent to your email.
  ℹ️  Please check your email and enter the code below.
  ℹ️  (You have 5 minutes to enter the code)

  Enter verification code: ______  ← You type the code here

  ✅ 2FA verification successful
  ✅ Authentication successful

📊 Downloading reports for Aug 2025...
  ✅ Operationeel rapport (1/30)
  ⏭️  Urenregistratie rapport - Already exists (2/30)
  ✅ Handmatige kortingen (3/30)
  ...

  📈 Summary for Aug 2025:
     Total: 30 | Successful: 25 | Skipped: 3 | Failed: 2

[... continues for each month ...]

============================================================
✨ All downloads complete!
============================================================
📊 Final Statistics:
   Total reports: 180
   ✅ Successful: 150
   ⏭️  Skipped: 25
   ❌ Failed: 5
============================================================
```

## Time Restrictions

The NYP store disables report generation between **16:00-20:00**. The script will:

1. Check current time before starting
2. Exit with error if within restricted hours
3. Show next available time

Example error:

```
❌ Report downloads are disabled between 16:00-20:00.
Next available time: Thu Feb 06 2026 20:00:00
Please run this script outside these hours.
```

## Architecture

### File Structure

```
lib/
├── config/
│   ├── nyp-restaurants.ts       # Restaurant credentials config
│   └── report-types.ts          # Report type metadata (existing)
├── services/
│   ├── nyp-auth-service.ts      # Authentication logic
│   ├── nyp-downloader-service.ts # Download orchestration
│   ├── storage-service.ts       # Supabase storage (existing)
│   └── report-service.ts        # Report management (existing)
├── repositories/
│   └── supabase-report-repository.ts # Database operations (existing)
├── supabase/
│   └── script-client.ts         # Supabase client for scripts
├── types/
│   └── nyp-types.ts            # NYP-specific types
└── utils/
    ├── date-formatter.ts        # Date conversion utilities
    └── time-validator.ts        # Time restriction checks

scripts/
└── download-nyp-reports.ts      # Main script
```

### Flow Diagram

```
1. Time Validation
   ↓
2. Environment Validation
   ↓
3. Generate Date Ranges (last 6 months)
   ↓
4. Launch Browser (headless Chromium)
   ↓
5. For each restaurant:
   ├─ Login to NYP store
   │  ├─ Fill username/password
   │  ├─ Submit login form
   │  ├─ Check for 2FA page
   │  ├─ If 2FA required:
   │  │  ├─ Prompt user for code (pause script)
   │  │  ├─ User checks email and enters code
   │  │  ├─ Submit verification code
   │  │  └─ Continue after verification
   │  └─ Verify authentication success
   ├─ For each month:
   │  ├─ Check existing reports (idempotency)
   │  ├─ Download missing reports (5 at a time)
   │  └─ Upload to Supabase Storage
   └─ Close browser
   ↓
6. Cleanup & Summary
```

### Key Components

#### 1. **Time Validator** (`lib/utils/time-validator.ts`)
- `isWithinRestrictedHours()`: Check if current time is 16:00-20:00
- `validateDownloadTime()`: Throws error if restricted
- `getNextAvailableTime()`: Returns next available time

#### 2. **Date Formatter** (`lib/utils/date-formatter.ts`)
- `formatForNyp(date)`: Convert to "D-M-YYYY" format for NYP forms
- `formatForOurSystem(date)`: Convert to "YYYY-MM-DD" for database
- `generateMonthRange(year, month)`: Get start/end dates for month

#### 3. **Auth Service** (`lib/services/nyp-auth-service.ts`)
- `login(page, username, password)`: Login to NYP store with 2FA support
- `handle2FA(page)`: Detect 2FA page and prompt user for code
- `isAuthenticated(page)`: Check if session is valid
- `reAuthenticate(page, username, password)`: Re-login if expired
- Uses Node.js `readline` for terminal input

#### 4. **Downloader Service** (`lib/services/nyp-downloader-service.ts`)
- `downloadReport(reportMetadata, startDate, endDate)`: Download single report
- `downloadReportsForMonth(year, month)`: Download all reports for month
- Batch processing (5 concurrent downloads)
- Automatic retry and error handling

#### 5. **Main Script** (`scripts/download-nyp-reports.ts`)
- Orchestrates entire process
- Progress tracking and statistics
- Error recovery and cleanup

## Idempotency

The script is **idempotent** and safe to re-run:

1. **Before downloading** each report, checks database for existing records
2. **Skips** reports that already exist for that restaurant + period
3. **No duplicates** are created

This means:
- ✅ Can re-run after failures to fill gaps
- ✅ Can run incrementally for new months
- ✅ Safe to run multiple times

## Error Handling

### Authentication Failure
- Logs error message
- Skips that restaurant
- Continues with remaining restaurants

### Download Timeout
- Logs error message
- Continues with next report
- 30-second timeout per report

### Upload Failure
- Logs error message
- Continues with next report
- Retry logic in storage service

### Fatal Errors
- Cleans up temporary files
- Closes browser
- Exits with code 1

## Performance

### Estimated Runtime
- **2FA authentication**: 1-2 minutes (manual user input)
- **Single month**: 2-4 minutes (30 reports)
- **6 months**: 12-24 minutes (180 reports)
- **Total for first run**: 15-30 minutes (including 2FA)
- Depends on network speed and NYP server response time

### Rate Limiting
- **Batch size**: 5 reports concurrently
- **Delay between batches**: 2 seconds
- **Timeout per report**: 30 seconds

### Temporary Storage
- Downloads to `/tmp/nyp-reports/{sessionId}/`
- Files uploaded then immediately deleted
- Directory cleaned up at end

## Troubleshooting

### "Missing environment variable"
- Check `.env.local` has all required variables
- Verify variable names match config

### "Login failed"
- Verify NYP store credentials are correct
- Check if account has access to reports
- Try logging in manually first

### "2FA verification timed out"
- You took longer than 5 minutes to enter the code
- Re-run the script to get a new code
- Have your email open and ready next time

### "2FA verification failed"
- Code was entered incorrectly
- Code may have expired (they expire after a few minutes)
- Re-run the script to get a new code
- Make sure to copy the code exactly as shown in email

### "No verification code in email"
- Check spam/junk folder
- Wait a few seconds for email to arrive
- Verify email address in NYP account settings
- Contact NYP support if codes don't arrive

### "Download timeout"
- NYP server may be slow or unavailable
- Re-run script to retry failed reports
- Check network connection

### "Upload failed"
- Verify Supabase credentials are correct
- Check Supabase storage bucket exists ('reports')
- Verify storage policies allow uploads

### "Restricted hours"
- Wait until 20:00 or run before 16:00
- Script shows next available time

## Verification

After running the script:

1. **Check console output** for statistics
2. **Navigate to `/reports`** in webapp
3. **Select different months** from last 6 months
4. **Verify report cards** show as uploaded (white, not dark gray)
5. **Click a report** to verify it opens

## Future Enhancements

Not currently implemented, but possible:

- ⏱️ Scheduled automation (cron job)
- 📧 Email/Slack notifications on completion
- 📈 Incremental downloads (only new months)
- 📄 PDF format support
- 🤖 Automatic report parsing
- 🌐 UI integration (trigger from webapp)
- ♻️ Retry queue for failed downloads

## Support

For issues or questions:
1. Check this documentation
2. Review console error messages
3. Check Supabase logs
4. Verify environment variables
5. Test with single restaurant/month first

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    download-nyp-reports.ts                   │
│                     (Main Orchestrator)                      │
└─────────────┬───────────────────────────────────────────────┘
              │
              ├─► Time Validator (check 16:00-20:00)
              │
              ├─► Environment Validator (check env vars)
              │
              ├─► Date Range Generator (last 6 months)
              │
              ├─► Browser (Playwright Chromium)
              │   │
              │   └─► For each restaurant:
              │       │
              │       ├─► NYP Auth Service
              │       │   ├─► Fill credentials
              │       │   ├─► Check for 2FA
              │       │   ├─► Prompt user for code (pause)
              │       │   ├─► Submit code
              │       │   └─► Verify authentication
              │       │
              │       └─► For each month:
              │           │
              │           ├─► Check existing reports (Supabase)
              │           │
              │           ├─► NYP Downloader Service
              │           │   ├─► Navigate to report page
              │           │   ├─► Fill date form
              │           │   ├─► Download Excel file
              │           │   └─► Save to /tmp
              │           │
              │           └─► Upload to Supabase
              │               ├─► Storage (Excel file)
              │               └─► Database (metadata)
              │
              └─► Cleanup (delete temp files, close browser)
```

## Report Types

All 30 report types are configured in `lib/config/report-types.ts`:

- Operational (Operationeel rapport)
- Time Keeping (Urenregistratie)
- Manual Discounts (Handmatige kortingen)
- Cancelled Orders (Geannuleerde bestellingen)
- Labour (Arbeidsrapport)
- Timekeeping Summary (Urenregistratie samenvatting)
- Zipcode Area Delivery (Postcode gebied bezorging)
- Order by Hours (Bestellingen per uur)
- Coupon Discount (Coupon kortingen)
- User Comments (Klant opmerkingen)
- Labour Employee (Arbeidsrapport per medewerker)
- Local Customer Data (Lokale klantgegevens)
- Variance (Variantie rapport)
- Store Items Sold (Verkochte artikelen)
- Inventory Ideal Usage (Ideaal voorraadgebruik)
- Tips (Fooien rapport)
- Issued Client Credit (Uitgegeven klanttegoed)
- Client Balance (Klantsaldo rapport)
- Expenses (Uitgaven rapport)
- Inventory Delivery (Voorraad levering)
- Inventory Loss (Voorraad verlies)
- Inventory Returns (Voorraad retouren)
- Cash Drawer Audit (Kaslade controle)
- Inventory Daily Count (Dagelijkse voorraadtelling)
- Service (Service rapport)
- Daily Sales (Dagelijkse verkoop)
- Coupon Analysis (Coupon analyse)
- Variance per Stock Product (Variantie per voorraadproduct)
- Driver Report (Bezorger rapport)
- Payment Method (Betaalmethode rapport)

## License

Internal tool for Restaurant KPI Dashboard project.
