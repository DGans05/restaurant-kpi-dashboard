import * as XLSX from "xlsx";
import { format, getISOWeek } from "date-fns";

export interface ParsedOperationalEntry {
  date: string;
  dayName: string;
  weekNumber: number;
  plannedRevenue: number;
  grossRevenue: number;
  netRevenue: number;
  plannedLabourCost: number;
  labourCost: number;
  plannedLabourPct: number | null;
  labourPct: number;
  workedHours: number;
  labourProductivity: number;
  foodCost: number;
  foodCostPct: number;
  deliveryRate30min: number;
  onTimeDeliveryMins: number;
  makeTimeMins: number;
  driveTimeMins: number;
  orderCount: number;
  avgOrderValue: number;
  ordersPerRun: number;
  cashDifference: number | null;
  manager: string;
}

const SUMMARY_KEYWORDS = [
  "totaal",
  "total",
  "gemiddeld",
  "average",
  "gemiddelde",
  "subtotaal",
];

/**
 * Parse an Operational report Excel buffer into daily KPI entries.
 */
export function parseOperationalReport(
  buffer: Buffer
): ParsedOperationalEntry[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return [];
  }

  const worksheet = workbook.Sheets[sheetName];

  // Get raw rows to find header row
  const rawRowsArray = XLSX.utils.sheet_to_json<any[]>(worksheet, {
    header: 1,
    defval: null,
  });

  // Find the header row (contains "Datum" or "Date")
  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(10, rawRowsArray.length); i++) {
    const row = rawRowsArray[i];
    if (row && row.some((cell: any) =>
      typeof cell === 'string' && (cell.includes('Datum') || cell.includes('Date'))
    )) {
      headerRowIndex = i;
      break;
    }
  }

  if (headerRowIndex === -1) {
    // Fallback to original behavior
    return parseWithoutHeaderDetection(worksheet);
  }

  // Parse from the header row onwards
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    worksheet,
    { defval: null, range: headerRowIndex }
  );

  const results: ParsedOperationalEntry[] = [];

  for (const row of rawRows) {
    const dateStr = extractDate(row);
    if (!dateStr) {
      continue;
    }

    if (isSummaryRow(row)) {
      continue;
    }

    const date = new Date(dateStr);

    results.push({
      date: dateStr,
      dayName: format(date, "EEEE"),
      weekNumber: getISOWeek(date),
      plannedRevenue: findNumeric(row, "Gepland Omzet", "Omzet Begroot", "Planned Revenue", "Begroot omzet") ?? 0,
      grossRevenue: findNumeric(row, "Bruto Omzet", "Omzet Bruto", "Gross Revenue") ?? 0,
      netRevenue: findNumeric(row, "Netto Omzet", "Omzet Netto", "Net Revenue") ?? 0,
      plannedLabourCost: findNumeric(row, "Gepland AK", "Arbeidskosten Begroot", "Planned Labour") ?? 0,
      labourCost: findNumeric(row, "Arbeidskosten", "Labour Cost") ?? 0,
      plannedLabourPct: findPercentage(row, "Gepland \n% Arbeidskosten", "Begroot Arbeids%", "Planned Labour %"),
      labourPct: findPercentage(row, "% Arbeidskosten", "Arbeids%", "Labour %"),
      workedHours: findNumeric(row, "Gewerte Uren", "Gewerkte uren", "Worked Hours", "Uren") ?? 0,
      labourProductivity: findNumeric(row, "Arbeidsproduc", "Arbeidsproductiviteit", "Productivity") ?? 0,
      foodCost: findNumeric(row, "Food Cost", "Voedselkosten", "COGS") ?? 0,
      foodCostPct: findPercentage(row, "Food Cost %", "Voedselkosten %", "COGS %"),
      deliveryRate30min: findPercentage(row, "30 min bezorgd", "Bezorgd binnen 30 min %", "% binnen 30 min", "30 min %"),
      onTimeDeliveryMins: findNumeric(row, "OTD", "Bezorgtijd", "On Time Delivery") ?? 0,
      makeTimeMins: findNumeric(row, "Maaktijd", "Bereidtijd", "Make Time", "Minutes") ?? 0,
      driveTimeMins: findNumeric(row, "Rijdtijd", "Rijtijd", "Drive Time", "Driving Time") ?? 0,
      orderCount: findNumeric(row, "Orders", "Bestellingen", "Aantal bestellingen") ?? 0,
      avgOrderValue: findNumeric(row, "Gemiddelde OW", "Gem. bestelbedrag", "Avg Order Value") ?? 0,
      ordersPerRun: findNumeric(row, "OPR", "Bestellingen per rit", "Orders per run") ?? 0,
      cashDifference: findNumeric(row, "Kasverschil", "Cash Difference"),
      manager: findString(row, "Verantwoordelijk", "Manager", "Vestigingsmanager"),
    });
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Fallback parser without header detection
 */
function parseWithoutHeaderDetection(
  worksheet: XLSX.WorkSheet
): ParsedOperationalEntry[] {
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    worksheet,
    { defval: null }
  );

  const results: ParsedOperationalEntry[] = [];

  for (const row of rawRows) {
    const dateStr = extractDate(row);
    if (!dateStr) {
      continue;
    }

    if (isSummaryRow(row)) {
      continue;
    }

    const date = new Date(dateStr);

    results.push({
      date: dateStr,
      dayName: format(date, "EEEE"),
      weekNumber: getISOWeek(date),
      plannedRevenue: findNumeric(row, "Gepland Omzet", "Omzet Begroot", "Planned Revenue") ?? 0,
      grossRevenue: findNumeric(row, "Bruto Omzet", "Omzet Bruto", "Gross Revenue") ?? 0,
      netRevenue: findNumeric(row, "Netto Omzet", "Omzet Netto", "Net Revenue") ?? 0,
      plannedLabourCost: findNumeric(row, "Gepland AK", "Arbeidskosten Begroot", "Planned Labour") ?? 0,
      labourCost: findNumeric(row, "Arbeidskosten", "Labour Cost") ?? 0,
      plannedLabourPct: findPercentage(row, "Gepland \n% Arbeidskosten", "Begroot Arbeids%", "Planned Labour %"),
      labourPct: findPercentage(row, "% Arbeidskosten", "Arbeids%", "Labour %"),
      workedHours: findNumeric(row, "Gewerte Uren", "Gewerkte uren", "Worked Hours") ?? 0,
      labourProductivity: findNumeric(row, "Arbeidsproduc", "Arbeidsproductiviteit", "Productivity") ?? 0,
      foodCost: findNumeric(row, "Food Cost", "Voedselkosten", "COGS") ?? 0,
      foodCostPct: findPercentage(row, "Food Cost %", "Voedselkosten %", "COGS %"),
      deliveryRate30min: findPercentage(row, "30 min bezorgd", "Bezorgd binnen 30 min %", "% binnen 30 min"),
      onTimeDeliveryMins: findNumeric(row, "OTD", "Bezorgtijd", "On Time Delivery") ?? 0,
      makeTimeMins: findNumeric(row, "Maaktijd", "Bereidtijd", "Make Time") ?? 0,
      driveTimeMins: findNumeric(row, "Rijdtijd", "Rijtijd", "Drive Time") ?? 0,
      orderCount: findNumeric(row, "Orders", "Bestellingen", "Aantal bestellingen") ?? 0,
      avgOrderValue: findNumeric(row, "Gemiddelde OW", "Gem. bestelbedrag", "Avg Order Value") ?? 0,
      ordersPerRun: findNumeric(row, "OPR", "Bestellingen per rit", "Orders per run") ?? 0,
      cashDifference: findNumeric(row, "Kasverschil", "Cash Difference"),
      manager: findString(row, "Verantwoordelijk", "Manager", "Vestigingsmanager"),
    });
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

function findColumn(
  row: Record<string, unknown>,
  ...names: string[]
): unknown | undefined {
  for (const name of names) {
    if (row[name] !== null && row[name] !== undefined) {
      return row[name];
    }
  }
  return undefined;
}

function findNumeric(
  row: Record<string, unknown>,
  ...names: string[]
): number | null {
  const value = findColumn(row, ...names);
  return parseNumeric(value);
}

function findPercentage(
  row: Record<string, unknown>,
  ...names: string[]
): number {
  const value = findColumn(row, ...names);
  return parsePercentage(value);
}

function findString(
  row: Record<string, unknown>,
  ...names: string[]
): string {
  const value = findColumn(row, ...names);
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function isSummaryRow(row: Record<string, unknown>): boolean {
  const dateRaw = row["Datum"] ?? row["Date"];
  const firstCol = Object.values(row)[0];

  for (const val of [dateRaw, firstCol]) {
    if (typeof val === "string") {
      const lower = val.toLowerCase().trim();
      if (SUMMARY_KEYWORDS.some((kw) => lower.includes(kw))) {
        return true;
      }
    }
  }

  return false;
}

function extractDate(row: Record<string, unknown>): string | null {
  const dateRaw = row["Datum"] ?? row["Date"];

  if (dateRaw === null || dateRaw === undefined) {
    return null;
  }

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

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return format(parsed, "yyyy-MM-dd");
  }

  return null;
}

function parseNumeric(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  if (typeof value === "number") {
    return isNaN(value) ? null : value;
  }
  const str = String(value).replace(",", ".").replace("%", "").trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : round2(num);
}

/**
 * Parse a percentage field - handles both decimal (0.25 = 25%) and already-converted (25) formats
 */
function parsePercentage(value: unknown): number {
  const num = parseNumeric(value);
  if (num === null) {
    return 0;
  }
  // If value is between 0-1, assume it's a decimal percentage (Excel format)
  // Convert to percentage by multiplying by 100
  if (num > 0 && num < 1) {
    return round2(num * 100);
  }
  // Otherwise assume it's already in percentage format
  return num;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
