import * as XLSX from "xlsx";
import { format } from "date-fns";

/**
 * Daily aggregated labour metrics from a TIME_KEEPING report
 */
export interface DailyLabourMetrics {
  date: string; // YYYY-MM-DD
  totalHours: number;
  employeeCount: number;
}

/**
 * Hourly rate info from TIMEKEEPING_SUMMARY report
 */
export interface HourlyRateInfo {
  avgHourlyRate: number;
  totalCost: number;
  totalHours: number;
}

/**
 * Parse a TIME_KEEPING report Excel buffer into daily labour metrics.
 *
 * Expected columns: Vestiging, Naam, Code, Datum, Start, Einde, Pauzetijd, Totaal uren
 */
export function parseTimekeepingReport(buffer: Buffer): DailyLabourMetrics[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  // Use the first sheet
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return [];
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    worksheet,
    { defval: null }
  );

  // Group by date
  const byDate = new Map<string, { hours: number; employees: Set<string> }>();

  for (const row of rawRows) {
    const dateStr = extractDate(row);
    if (!dateStr) {
      continue;
    }

    const hours = parseHours(row);
    if (hours === null || hours <= 0) {
      continue;
    }

    const employeeName = String(
      row["Naam"] ?? row["Name"] ?? row["Employee"] ?? "unknown"
    ).trim();

    const existing = byDate.get(dateStr) ?? {
      hours: 0,
      employees: new Set<string>(),
    };

    byDate.set(dateStr, {
      hours: existing.hours + hours,
      employees: new Set([...existing.employees, employeeName]),
    });
  }

  const results: DailyLabourMetrics[] = [];

  for (const [dateKey, data] of byDate) {
    results.push({
      date: dateKey,
      totalHours: round2(data.hours),
      employeeCount: data.employees.size,
    });
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Parse a TIMEKEEPING_SUMMARY report to extract hourly rate information.
 * Returns average hourly rate across all employees.
 */
export function parseTimekeepingSummary(buffer: Buffer): HourlyRateInfo | null {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return null;
  }

  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    worksheet,
    { defval: null }
  );

  let totalCost = 0;
  let totalHours = 0;

  for (const row of rawRows) {
    const hours = parseNumeric(
      row["Totaal uren"] ?? row["Total hours"] ?? row["Hours"]
    );
    const cost = parseNumeric(
      row["Kosten"] ?? row["Cost"] ?? row["Total cost"] ?? row["Totaal kosten"]
    );

    if (hours !== null && hours > 0) {
      totalHours += hours;
    }
    if (cost !== null && cost > 0) {
      totalCost += cost;
    }
  }

  if (totalHours === 0) {
    return null;
  }

  return {
    avgHourlyRate: round2(totalCost / totalHours),
    totalCost: round2(totalCost),
    totalHours: round2(totalHours),
  };
}

/**
 * Extract date from a timekeeping row.
 * Tries "Datum", "Date" columns.
 */
function extractDate(row: Record<string, unknown>): string | null {
  const dateRaw = row["Datum"] ?? row["Date"];

  if (dateRaw === null || dateRaw === undefined) {
    return null;
  }

  // Excel serial date number
  if (typeof dateRaw === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    const msPerDay = 86400000;
    const date = new Date(excelEpoch.getTime() + dateRaw * msPerDay);
    return format(date, "yyyy-MM-dd");
  }

  if (dateRaw instanceof Date) {
    return format(dateRaw, "yyyy-MM-dd");
  }

  const dateStr = String(dateRaw).trim();

  // DD-MM-YYYY
  const ddmmyyyy = dateStr.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return format(d, "yyyy-MM-dd");
  }

  // YYYY-MM-DD
  const yyyymmdd = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmdd) {
    return dateStr;
  }

  // Try Date.parse
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return format(parsed, "yyyy-MM-dd");
  }

  return null;
}

/**
 * Parse hours from a timekeeping row.
 * Handles "Totaal uren" in HH:MM format or decimal.
 */
function parseHours(row: Record<string, unknown>): number | null {
  const hoursRaw = row["Totaal uren"] ?? row["Total hours"] ?? row["Hours"];

  if (hoursRaw === null || hoursRaw === undefined) {
    return null;
  }

  // Already a number (decimal hours)
  if (typeof hoursRaw === "number") {
    return isNaN(hoursRaw) ? null : hoursRaw;
  }

  const str = String(hoursRaw).trim();

  // HH:MM format → convert to decimal hours
  const timeMatch = str.match(/^(\d{1,2}):(\d{2})$/);
  if (timeMatch) {
    const [, hours, minutes] = timeMatch;
    return Number(hours) + Number(minutes) / 60;
  }

  // Decimal with comma (Dutch format)
  const num = parseFloat(str.replace(",", "."));
  return isNaN(num) ? null : num;
}

function parseNumeric(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return isNaN(value) ? null : value;
  }
  const str = String(value).replace(",", ".").trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
