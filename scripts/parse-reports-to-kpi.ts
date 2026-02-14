/**
 * Parse uploaded reports (SERVICE, TIME_KEEPING) from Supabase Storage
 * and write daily kpi_entries rows to the database.
 *
 * Strategy:
 * - TIME_KEEPING reports provide daily hours (the day axis)
 * - SERVICE reports provide monthly totals (orders, revenue, delivery metrics)
 * - Monthly SERVICE totals are distributed proportionally across days using
 *   worked hours as the weight (busier days = more revenue)
 *
 * Usage: npx tsx scripts/parse-reports-to-kpi.ts
 *
 * Options:
 *   --dry-run    Parse and show results without writing to DB
 *   --force      Re-parse reports even if already parsed
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as path from "path";
import * as dotenv from "dotenv";
import { format, getISOWeek } from "date-fns";
import { nl } from "date-fns/locale";
import {
  parseServiceReport,
  MonthlyServiceMetrics,
} from "../lib/parsers/service-report-parser";
import {
  parseTimekeepingReport,
  parseTimekeepingSummary,
  DailyLabourMetrics,
  HourlyRateInfo,
} from "../lib/parsers/timekeeping-parser";

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const RESTAURANT_ID = "rosmalen";
const BUCKET_NAME = "reports";
const DEFAULT_HOURLY_RATE = 14.5; // fallback if no TIMEKEEPING_SUMMARY

interface ReportRow {
  id: string;
  restaurant_id: string;
  report_type: string;
  report_name: string;
  report_period: string;
  file_path: string | null;
  upload_status: string;
}

interface KPIEntryRow {
  restaurant_id: string;
  date: string;
  day_name: string;
  week_number: number;
  planned_revenue: number;
  gross_revenue: number;
  net_revenue: number;
  planned_labour_cost: number;
  labour_cost: number;
  planned_labour_pct: number | null;
  labour_pct: number;
  worked_hours: number;
  labour_productivity: number;
  food_cost: number;
  food_cost_pct: number;
  delivery_rate_30min: number;
  on_time_delivery_mins: number;
  make_time_mins: number;
  drive_time_mins: number;
  order_count: number;
  avg_order_value: number;
  orders_per_run: number;
  cash_difference: number | null;
  manager: string;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Fetching reports from Supabase...");

  const statusFilter = force
    ? ["uploaded", "parsed", "error"]
    : ["uploaded"];

  const { data: reports, error: reportsError } = await supabase
    .from("reports")
    .select("*")
    .eq("restaurant_id", RESTAURANT_ID)
    .in("report_type", ["SERVICE", "TIME_KEEPING", "TIMEKEEPING_SUMMARY"])
    .in("upload_status", statusFilter)
    .order("report_period", { ascending: true });

  if (reportsError) {
    throw new Error(`Failed to fetch reports: ${reportsError.message}`);
  }

  if (!reports || reports.length === 0) {
    console.log("No reports found to parse. Use --force to re-parse.");
    return;
  }

  console.log(`Found ${reports.length} reports to process`);

  // Group reports by period (month)
  const reportsByPeriod = groupReportsByMonth(reports as ReportRow[]);

  let totalKpiEntries = 0;

  for (const [period, periodReports] of reportsByPeriod) {
    console.log(`\nProcessing period: ${period}`);

    const serviceReports = periodReports.filter(
      (r) => r.report_type === "SERVICE"
    );
    const timekeepingReports = periodReports.filter(
      (r) => r.report_type === "TIME_KEEPING"
    );
    const summaryReports = periodReports.filter(
      (r) => r.report_type === "TIMEKEEPING_SUMMARY"
    );

    // Parse SERVICE reports → monthly totals
    let monthlyService: MonthlyServiceMetrics | null = null;
    for (const report of serviceReports) {
      if (!report.file_path) {
        console.warn(`  Skipping SERVICE report ${report.id}: no file_path`);
        continue;
      }
      const buffer = await downloadReport(supabase, report.file_path);
      if (!buffer) {
        continue;
      }
      monthlyService = parseServiceReport(buffer);
      console.log(
        `  SERVICE ${report.report_name}: ${monthlyService.totalOrders} orders, €${monthlyService.grossRevenue} gross`
      );
    }

    // Parse TIME_KEEPING reports → daily hours
    const allLabourMetrics: DailyLabourMetrics[] = [];
    for (const report of timekeepingReports) {
      if (!report.file_path) {
        console.warn(
          `  Skipping TIME_KEEPING report ${report.id}: no file_path`
        );
        continue;
      }
      const buffer = await downloadReport(supabase, report.file_path);
      if (!buffer) {
        continue;
      }
      const metrics = parseTimekeepingReport(buffer);
      console.log(
        `  TIME_KEEPING ${report.report_name}: ${metrics.length} daily entries`
      );
      allLabourMetrics.push(...metrics);
    }

    // Parse TIMEKEEPING_SUMMARY for hourly rates
    let hourlyRateInfo: HourlyRateInfo | null = null;
    for (const report of summaryReports) {
      if (!report.file_path) {
        continue;
      }
      const buffer = await downloadReport(supabase, report.file_path);
      if (buffer) {
        hourlyRateInfo = parseTimekeepingSummary(buffer);
        if (hourlyRateInfo) {
          console.log(
            `  TIMEKEEPING_SUMMARY: avg hourly rate = €${hourlyRateInfo.avgHourlyRate}`
          );
        }
      }
    }

    const hourlyRate = hourlyRateInfo?.avgHourlyRate ?? DEFAULT_HOURLY_RATE;

    // Filter labour metrics to the current period's month
    const periodLabour = allLabourMetrics.filter(
      (lm) => lm.date.startsWith(period)
    );

    if (periodLabour.length === 0) {
      console.log("  No labour data for this period, skipping");
      continue;
    }

    // Merge: distribute monthly SERVICE totals across days with labour data
    const kpiEntries = distributeAndMerge(
      monthlyService,
      periodLabour,
      hourlyRate
    );

    console.log(`  Merged into ${kpiEntries.length} KPI entries`);
    totalKpiEntries += kpiEntries.length;

    if (dryRun) {
      for (const entry of kpiEntries.slice(0, 3)) {
        console.log(
          `    ${entry.date} | orders=${entry.order_count} | revenue=€${entry.net_revenue} | hours=${entry.worked_hours} | labour=€${entry.labour_cost}`
        );
      }
      if (kpiEntries.length > 3) {
        console.log(`    ... and ${kpiEntries.length - 3} more`);
      }
    } else {
      await upsertKPIEntries(supabase, kpiEntries);
      const reportIds = periodReports.map((r) => r.id);
      await markReportsParsed(supabase, reportIds);
    }
  }

  console.log(
    `\nDone! ${totalKpiEntries} KPI entries ${dryRun ? "would be upserted" : "upserted"}.`
  );
}

/**
 * Distribute monthly SERVICE totals across daily TIME_KEEPING entries.
 *
 * Revenue and orders are distributed proportionally to worked hours:
 * a day with 10 hours out of 100 total gets 10% of the monthly revenue.
 *
 * Delivery metrics (rate, times) are the same for all days (monthly averages).
 */
function distributeAndMerge(
  monthlyService: MonthlyServiceMetrics | null,
  dailyLabour: DailyLabourMetrics[],
  hourlyRate: number
): KPIEntryRow[] {
  const totalMonthHours = dailyLabour.reduce(
    (sum, dl) => sum + dl.totalHours,
    0
  );

  if (totalMonthHours === 0) {
    return [];
  }

  return dailyLabour.map((dl) => {
    const date = new Date(dl.date);
    const dayName = format(date, "EEEE", { locale: nl });
    const capitalizedDayName =
      dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const weekNumber = getISOWeek(date);

    // Proportion of monthly totals for this day
    const dayWeight = dl.totalHours / totalMonthHours;

    // Distribute service metrics proportionally
    const grossRevenue = monthlyService
      ? round2(monthlyService.grossRevenue * dayWeight)
      : 0;
    const netRevenue = monthlyService
      ? round2(monthlyService.netRevenue * dayWeight)
      : 0;
    const orderCount = monthlyService
      ? Math.round(monthlyService.totalOrders * dayWeight)
      : 0;
    const avgOrderValue =
      orderCount > 0 ? round2(netRevenue / orderCount) : 0;

    const labourCost = round2(dl.totalHours * hourlyRate);
    const labourPct =
      netRevenue > 0 ? round2((labourCost / netRevenue) * 100) : 0;
    const labourProductivity =
      dl.totalHours > 0 ? round2(netRevenue / dl.totalHours) : 0;

    return {
      restaurant_id: RESTAURANT_ID,
      date: dl.date,
      day_name: capitalizedDayName,
      week_number: weekNumber,
      planned_revenue: 0,
      gross_revenue: grossRevenue,
      net_revenue: netRevenue,
      planned_labour_cost: 0,
      labour_cost: labourCost,
      planned_labour_pct: null,
      labour_pct: labourPct,
      worked_hours: dl.totalHours,
      labour_productivity: labourProductivity,
      food_cost: 0,
      food_cost_pct: 0,
      // Delivery metrics are monthly averages (same for all days)
      delivery_rate_30min: monthlyService?.deliveryRate30min ?? 0,
      on_time_delivery_mins: monthlyService?.avgWaitingTimeMins ?? 0,
      make_time_mins: monthlyService?.avgMakeTimeMins ?? 0,
      drive_time_mins: monthlyService?.avgDriveTimeMins ?? 0,
      order_count: orderCount,
      avg_order_value: avgOrderValue,
      orders_per_run: monthlyService?.avgOrdersPerRun ?? 1.0,
      cash_difference: null,
      manager: "N/A",
    };
  });
}

/**
 * Download a report file from Supabase Storage
 */
async function downloadReport(
  supabase: SupabaseClient,
  filePath: string
): Promise<Buffer | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(filePath);

  if (error) {
    console.error(`  Failed to download ${filePath}: ${error.message}`);
    return null;
  }

  if (!data) {
    console.error(`  No data returned for ${filePath}`);
    return null;
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Group reports by their month period (YYYY-MM)
 */
function groupReportsByMonth(
  reports: ReportRow[]
): Map<string, ReportRow[]> {
  const grouped = new Map<string, ReportRow[]>();

  for (const report of reports) {
    const month = report.report_period.substring(0, 7);
    const existing = grouped.get(month) ?? [];
    grouped.set(month, [...existing, report]);
  }

  return grouped;
}

/**
 * Upsert KPI entries into the database.
 */
async function upsertKPIEntries(
  supabase: SupabaseClient,
  entries: KPIEntryRow[]
): Promise<void> {
  if (entries.length === 0) {
    return;
  }

  const BATCH_SIZE = 50;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    const { error } = await supabase.from("kpi_entries").upsert(batch, {
      onConflict: "restaurant_id,date",
      ignoreDuplicates: false,
    });

    if (error) {
      throw new Error(
        `Failed to upsert KPI entries (batch ${Math.floor(i / BATCH_SIZE) + 1}): ${error.message}`
      );
    }

    console.log(
      `  Upserted batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batch.length} entries`
    );
  }
}

/**
 * Mark reports as parsed in the database
 */
async function markReportsParsed(
  supabase: SupabaseClient,
  reportIds: string[]
): Promise<void> {
  const { error } = await supabase
    .from("reports")
    .update({
      upload_status: "parsed",
      parsed_at: new Date().toISOString(),
    })
    .in("id", reportIds);

  if (error) {
    console.error(`  Failed to mark reports as parsed: ${error.message}`);
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
