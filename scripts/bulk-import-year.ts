/**
 * Bulk Import Year Data
 *
 * Downloads all reports from a specified year for any restaurant.
 * Usage: npm run nyp:bulk-import-year <restaurantId> <year>
 * Example: npm run nyp:bulk-import-year hinthammerstraat 2025
 */

import 'dotenv/config';
import { createAdminClient } from '../lib/supabase/admin-client';
import { NYPApiClient } from '../lib/services/nyp-api-client';
import { parseOperationalReport } from '../lib/parsers/operational-report-parser';
import { format, eachDayOfInterval, startOfYear, endOfYear } from 'date-fns';
import type { NypCookies } from '../lib/types/nyp-types';

// Mapping of our restaurant IDs to NYP store IDs
const NYP_STORE_IDS: Record<string, number> = {
  'rosmalen': 197,
  'hinthammerstraat': 142,
  'boxtel': 287,
  'rompert': 41,
  'eindhoven-boschdijk': 307,
  'eindhoven-hoogstraat': 50,
};

// Get command line arguments
const restaurantId = process.argv[2];
const year = parseInt(process.argv[3] || new Date().getFullYear().toString());

if (!restaurantId) {
  console.error('❌ Error: Restaurant ID is required');
  console.error('Usage: npm run nyp:bulk-import-year <restaurantId> <year>');
  console.error('Example: npm run nyp:bulk-import-year hinthammerstraat 2025');
  process.exit(1);
}

const nypStoreId = NYP_STORE_IDS[restaurantId];
if (!nypStoreId) {
  console.error(`❌ Error: Unknown restaurant '${restaurantId}'`);
  console.error('Available restaurants:', Object.keys(NYP_STORE_IDS).join(', '));
  process.exit(1);
}

async function getCookies(): Promise<NypCookies> {
  const supabase = createAdminClient();

  // Try to get cookies from database (use rosmalen as primary session)
  const { data: session } = await supabase
    .from('nyp_sessions')
    .select('cookies_json')
    .eq('restaurant_id', 'rosmalen')
    .eq('is_active', true)
    .single();

  if (session?.cookies_json) {
    console.log('✅ Using cookies from database (rosmalen session)');
    return JSON.parse(session.cookies_json);
  }

  // Fallback to environment variable
  if (process.env.NYP_COOKIES_JSON) {
    console.log('✅ Using cookies from environment');
    return JSON.parse(process.env.NYP_COOKIES_JSON);
  }

  throw new Error('❌ No NYP cookies found. Run: npm run nyp:capture-cookies');
}

async function downloadReport(
  client: NYPApiClient,
  date: Date
): Promise<Buffer | null> {
  try {
    const reportMeta = {
      name: 'OPERATIONAL',
      reportNumber: 22,
      type: 'OPERATIONAL' as const,
    };

    const response = await client.generateReport(reportMeta, date, date);

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    return null;
  }
}

async function main() {
  console.log(`🚀 Bulk Import ${year} Data for ${restaurantId}`);
  console.log('========================\n');

  // Initialize
  const supabase = createAdminClient();
  const cookies = await getCookies();
  const client = new NYPApiClient(cookies);

  // Verify restaurant exists
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select('id, name')
    .eq('id', restaurantId)
    .single();

  if (restaurantError || !restaurant) {
    throw new Error(`❌ Restaurant '${restaurantId}' not found in database`);
  }

  console.log(`📍 Restaurant: ${restaurant.name} (${restaurant.id})\n`);

  // Verify session is valid
  console.log('🔐 Verifying NYP session...');
  const isValid = await client.isSessionValid();
  if (!isValid) {
    throw new Error('❌ NYP session expired. Run: npm run nyp:capture-cookies');
  }
  console.log('✅ Session valid\n');

  // Switch to the correct store
  console.log(`🔄 Switching to store ${nypStoreId} (${restaurant.name})...`);
  const switchSuccess = await client.switchStore(nypStoreId);
  if (!switchSuccess) {
    throw new Error(`❌ Failed to switch to store ${nypStoreId}`);
  }
  console.log('✅ Store switched\n');

  // Get all days in the year
  const startDate = startOfYear(new Date(year, 0, 1));
  const endDate = endOfYear(new Date(year, 11, 31));
  const allDates = eachDayOfInterval({ start: startDate, end: endDate });

  console.log(`📅 Processing ${allDates.length} days from ${year}\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  const errors: string[] = [];

  // Process each day
  for (let i = 0; i < allDates.length; i++) {
    const date = allDates[i];
    const dateStr = format(date, 'yyyy-MM-dd');
    const progress = `[${i + 1}/${allDates.length}]`;

    // Check if already exists
    const { data: existing } = await supabase
      .from('kpi_entries')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('date', dateStr)
      .single();

    if (existing) {
      console.log(`${progress} ⏭️  ${dateStr} - Already exists`);
      skipCount++;
      continue;
    }

    // Download report
    process.stdout.write(`${progress} 📥 ${dateStr} - Downloading...`);
    const buffer = await downloadReport(client, date);

    if (!buffer) {
      process.stdout.write(' ❌ No data\n');
      skipCount++;
      continue;
    }

    // Parse report
    try {
      const entries = parseOperationalReport(buffer);

      if (entries.length === 0) {
        process.stdout.write(' ⚠️  Empty report\n');
        skipCount++;
        continue;
      }

      // Store in database
      const kpiRows = entries.map((entry) => ({
        restaurant_id: restaurantId,
        date: entry.date,
        day_name: entry.dayName,
        week_number: entry.weekNumber,
        planned_revenue: entry.plannedRevenue,
        gross_revenue: entry.grossRevenue,
        net_revenue: entry.netRevenue,
        planned_labour_cost: entry.plannedLabourCost,
        labour_cost: entry.labourCost,
        planned_labour_pct: entry.plannedLabourPct,
        labour_pct: entry.labourPct,
        worked_hours: entry.workedHours,
        labour_productivity: entry.labourProductivity,
        food_cost: entry.foodCost,
        food_cost_pct: entry.foodCostPct,
        delivery_rate_30min: entry.deliveryRate30min,
        on_time_delivery_mins: entry.onTimeDeliveryMins,
        make_time_mins: entry.makeTimeMins,
        drive_time_mins: entry.driveTimeMins,
        order_count: entry.orderCount,
        avg_order_value: entry.avgOrderValue,
        orders_per_run: entry.ordersPerRun,
        cash_difference: entry.cashDifference,
        manager: entry.manager,
      }));

      const { error } = await supabase
        .from('kpi_entries')
        .insert(kpiRows);

      if (error) {
        process.stdout.write(` ❌ DB Error\n`);
        errors.push(`${dateStr}: ${error.message}`);
        errorCount++;
        continue;
      }

      process.stdout.write(` ✅ ${entries.length} entries\n`);
      successCount++;

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      process.stdout.write(` ❌ Parse error\n`);
      errors.push(`${dateStr}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      errorCount++;
    }
  }

  // Summary
  console.log('\n========================');
  console.log('📊 Import Summary');
  console.log('========================\n');
  console.log(`✅ Success: ${successCount} days`);
  console.log(`⏭️  Skipped: ${skipCount} days`);
  console.log(`❌ Errors: ${errorCount} days`);
  console.log(`📅 Total: ${allDates.length} days\n`);

  if (errors.length > 0) {
    console.log('Errors:');
    errors.forEach(err => console.log(`  - ${err}`));
    console.log();
  }

  console.log('🎉 Import complete!');
  console.log(`🔗 View dashboard: https://nypkpi.com/dashboard?restaurantId=${restaurantId}\n`);
}

main().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
