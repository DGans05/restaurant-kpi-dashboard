import * as XLSX from "xlsx";
import { format, getISOWeek } from "date-fns";
import { KPIEntry } from "@/lib/types";

export type ParsedKPIEntry = Omit<KPIEntry, "restaurantId">;

const SUMMARY_KEYWORDS = [
  "totaal", "total", "gemiddeld", "average", "gemiddelde", "subtotaal",
  "weektotaal", "maandtotaal",
];

const HEADER_KEYWORDS = ["datum", "date", "dag", "day", "omzet", "revenue", "arbeidskosten"];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parse a KPI CSV/Excel buffer into daily KPI entries.
 * Reads ALL sheets and merges results (deduplicates by date).
 */
export function parseKpiCsv(buffer: Buffer): ParsedKPIEntry[] {
  const isCSV = isLikelyCSV(buffer);

  if (isCSV) {
    const text = buffer.toString("utf8");
    return parseCSVText(text);
  }

  // Excel file — use XLSX for all sheets
  const workbook = XLSX.read(buffer, { type: "buffer" });
  if (workbook.SheetNames.length === 0) return [];

  const allEntries = new Map<string, ParsedKPIEntry>();
  for (const sheetName of workbook.SheetNames) {
    for (const entry of parseExcelSheet(workbook.Sheets[sheetName])) {
      allEntries.set(entry.date, entry);
    }
  }
  return Array.from(allEntries.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// ─── CSV parsing (manual, to avoid XLSX mangling Dutch formats) ───────────────

function isLikelyCSV(buffer: Buffer): boolean {
  // Check first bytes — Excel files start with PK (zip) or D0 CF (OLE)
  if (buffer.length < 4) return true;
  const head = buffer.subarray(0, 4);
  if (head[0] === 0x50 && head[1] === 0x4b) return false; // PK = zip = xlsx
  if (head[0] === 0xd0 && head[1] === 0xcf) return false; // OLE = xls
  return true;
}

function parseCSVText(text: string): ParsedKPIEntry[] {
  const lines = text.split(/\r?\n/);
  const rows = lines.map(parseCSVLine).filter((r) => r.length > 0);

  // Find header row
  let headerIdx = -1;
  for (let i = 0; i < Math.min(20, rows.length); i++) {
    if (rows[i].some((cell) => {
      const lower = cell.toLowerCase().trim();
      return HEADER_KEYWORDS.some((kw) => lower.includes(kw));
    })) {
      headerIdx = i;
      break;
    }
  }
  if (headerIdx === -1) return [];

  const headers = rows[headerIdx];

  // Find date column index — look for "Datum"/"Date" header, else scan data rows
  let dateColIdx = headers.findIndex((h) => /^(datum|date)$/i.test(h.trim()));
  if (dateColIdx === -1) {
    for (let r = headerIdx + 1; r < Math.min(headerIdx + 10, rows.length); r++) {
      for (let c = 0; c < rows[r].length; c++) {
        if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(rows[r][c].trim())) {
          dateColIdx = c;
          break;
        }
      }
      if (dateColIdx !== -1) break;
    }
  }

  const results: ParsedKPIEntry[] = [];

  for (let r = headerIdx + 1; r < rows.length; r++) {
    const cells = rows[r];
    if (cells.length < 3) continue;

    // Build named row from headers
    const row: Record<string, string> = {};
    for (let c = 0; c < headers.length; c++) {
      const key = headers[c].trim() || `__col_${c}`;
      row[key] = (cells[c] ?? "").trim();
    }
    // Also store by index for the date column
    if (dateColIdx >= 0) {
      row["__date__"] = (cells[dateColIdx] ?? "").trim();
    }

    if (isSummaryRow(row)) continue;

    const dateStr = parseDateString(row["__date__"] ?? row["Datum"] ?? row["Date"] ?? "");
    if (!dateStr) continue;

    const date = new Date(dateStr);

    results.push({
      date: dateStr,
      dayName: format(date, "EEEE"),
      weekNumber: getISOWeek(date),
      plannedRevenue: findNum(row, "Gepland Netto", "Gepland Omzet", "Omzet Begroot", "Planned Revenue") ?? 0,
      grossRevenue: findNum(row, "Bruto Omzet", "Omzet Bruto", "Gross Revenue") ?? 0,
      netRevenue: findNum(row, "Netto Omzet", "Omzet Netto", "Net Revenue") ?? 0,
      burgerKitchenRevenue: findNum(row, "Bruto BK =TB+Uber", "BK Omzet", "Burger Kitchen Omzet") ?? 0,
      plannedLabourCost: findNum(row, "Gepland AK", "Arbeidskosten Begroot", "Planned Labour") ?? 0,
      labourCost: findNum(row, "€ Arbeidskosten", "Arbeidskosten", "Labour Cost") ?? 0,
      plannedLabourPct: findPct(row, "Gepland AK%", "Gepland % Arbeidskosten", "Begroot Arbeids%"),
      labourPct: findPct(row, "% Arbeidskosten", "Arbeids%", "Labour %"),
      workedHours: findNum(row, "Gewerte Uren", "Gewerkte uren", "Worked Hours", "Uren") ?? 0,
      labourProductivity: findNum(row, "Productiviteit", "Arbeidsproduc", "Arbeidsproductiviteit") ?? 0,
      foodCost: findNum(row, "Food Cost", "Voedselkosten", "COGS") ?? 0,
      foodCostPct: findPct(row, "Food Cost %", "Voedselkosten %", "COGS %"),
      deliveryRate20min: findPct(row, "20 min", "20 min bezorgd", "Bezorgd binnen 20 min %"),
      deliveryRate30min: findPct(row, "30 min", "30 min bezorgd", "Bezorgd binnen 30 min %"),
      onTimeDeliveryMins: findNum(row, "OTD", "Bezorgtijd", "On Time Delivery") ?? 0,
      makeTimeMins: findNum(row, "MT", "Maaktijd", "Bereidtijd", "Make Time") ?? 0,
      driveTimeMins: findNum(row, "DT", "Rijdtijd", "Rijtijd", "Drive Time") ?? 0,
      orderCount: findNum(row, "Orders", "Bestellingen", "Aantal bestellingen") ?? 0,
      avgOrderValue: findNum(row, "Gem. ow", "Gemiddelde OW", "Gem. bestelbedrag", "Avg Order Value") ?? 0,
      ordersPerRun: findNum(row, "OPR", "Bestellingen per rit", "Orders per run") ?? 0,
      cashDifference: findNum(row, "Kasverschil", "Cash Difference"),
      manager: findStr(row, "Verantwoordelijk", "Manager", "Vestigingsmanager"),
    });
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Parse a single CSV line, handling quoted fields with commas inside.
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++; // skip escaped quote
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === "," || ch === ";") {
        fields.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

// ─── Excel parsing (XLSX-based, for .xlsx/.xls) ──────────────────────────────

function parseExcelSheet(worksheet: XLSX.WorkSheet): ParsedKPIEntry[] {
  const rawRowsArray = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1, defval: null,
  });

  let headerRowIndex = -1;
  for (let i = 0; i < Math.min(20, rawRowsArray.length); i++) {
    const row = rawRowsArray[i];
    if (!row || !Array.isArray(row)) continue;
    if (row.some((cell) => {
      if (typeof cell !== "string") return false;
      return HEADER_KEYWORDS.some((kw) => cell.toLowerCase().trim().includes(kw));
    })) {
      headerRowIndex = i;
      break;
    }
  }
  if (headerRowIndex === -1) return [];

  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: null, range: headerRowIndex,
  });

  const results: ParsedKPIEntry[] = [];

  for (const row of rawRows) {
    const dateStr = extractExcelDate(row);
    if (!dateStr) continue;
    if (isSummaryRowExcel(row)) continue;

    const date = new Date(dateStr);

    results.push({
      date: dateStr,
      dayName: format(date, "EEEE"),
      weekNumber: getISOWeek(date),
      plannedRevenue: findNumExcel(row, "Gepland Netto", "Gepland Omzet", "Omzet Begroot", "Planned Revenue") ?? 0,
      grossRevenue: findNumExcel(row, "Bruto Omzet", "Omzet Bruto", "Gross Revenue") ?? 0,
      netRevenue: findNumExcel(row, "Netto Omzet", "Omzet Netto", "Net Revenue") ?? 0,
      burgerKitchenRevenue: findNumExcel(row, "Bruto BK =TB+Uber", "BK Omzet", "Burger Kitchen Omzet") ?? 0,
      plannedLabourCost: findNumExcel(row, "Gepland AK", "Arbeidskosten Begroot", "Planned Labour") ?? 0,
      labourCost: findNumExcel(row, "Arbeidskosten", "Labour Cost") ?? 0,
      plannedLabourPct: findPctExcel(row, "Gepland % Arbeidskosten", "Begroot Arbeids%"),
      labourPct: findPctExcel(row, "% Arbeidskosten", "Arbeids%"),
      workedHours: findNumExcel(row, "Gewerte Uren", "Gewerkte uren", "Worked Hours", "Uren") ?? 0,
      labourProductivity: findNumExcel(row, "Arbeidsproduc", "Arbeidsproductiviteit", "Productiviteit", "Productivity") ?? 0,
      foodCost: findNumExcel(row, "Food Cost", "Voedselkosten", "COGS") ?? 0,
      foodCostPct: findPctExcel(row, "Food Cost %", "Voedselkosten %"),
      deliveryRate20min: findPctExcel(row, "20 min bezorgd", "Bezorgd binnen 20 min %", "% binnen 20 min", "20 min %", "20 min"),
      deliveryRate30min: findPctExcel(row, "30 min bezorgd", "Bezorgd binnen 30 min %", "% binnen 30 min", "30 min %", "30 min"),
      onTimeDeliveryMins: findNumExcel(row, "OTD", "Bezorgtijd", "On Time Delivery") ?? 0,
      makeTimeMins: findNumExcel(row, "Maaktijd", "Bereidtijd", "Make Time", "MT") ?? 0,
      driveTimeMins: findNumExcel(row, "Rijdtijd", "Rijtijd", "Drive Time", "DT") ?? 0,
      orderCount: findNumExcel(row, "Orders", "Bestellingen", "Aantal bestellingen") ?? 0,
      avgOrderValue: findNumExcel(row, "Gemiddelde OW", "Gem. bestelbedrag", "Gem. ow", "Avg Order Value") ?? 0,
      ordersPerRun: findNumExcel(row, "OPR", "Bestellingen per rit", "Orders per run") ?? 0,
      cashDifference: findNumExcel(row, "Kasverschil", "Cash Difference"),
      manager: findStrExcel(row, "Verantwoordelijk", "Manager", "Vestigingsmanager"),
    });
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

// ─── CSV helpers ──────────────────────────────────────────────────────────────

function findCol(row: Record<string, string>, ...names: string[]): string | undefined {
  for (const name of names) {
    const val = row[name];
    if (val !== undefined && val !== "") return val;
  }
  return undefined;
}

function findNum(row: Record<string, string>, ...names: string[]): number | null {
  return parseDutchNumber(findCol(row, ...names));
}

function findPct(row: Record<string, string>, ...names: string[]): number {
  const raw = findCol(row, ...names);
  if (!raw) return 0;
  const num = parseDutchNumber(raw);
  return num ?? 0;
}

function findStr(row: Record<string, string>, ...names: string[]): string {
  return findCol(row, ...names) ?? "";
}

/**
 * Parse a Dutch-formatted number string.
 * "€ 1.545,78" → 1545.78
 * "29,11" → 29.11
 * "21,92%" → 21.92
 * "13%" → 13
 */
function parseDutchNumber(value: string | undefined): number | null {
  if (!value || value.trim() === "") return null;

  let str = value
    .trim()
    .replace(/^€\s*/, "")
    .replace(/%$/, "")
    .trim();

  if (str === "" || str.startsWith("#")) return null;

  // Dutch format: dot is thousands separator, comma is decimal
  if (str.includes(".") && str.includes(",")) {
    str = str.replace(/\./g, "").replace(",", ".");
  } else if (str.includes(",")) {
    str = str.replace(",", ".");
  }

  const num = parseFloat(str);
  return isNaN(num) ? null : round2(num);
}

function parseDateString(value: string): string | null {
  if (!value) return null;
  const str = value.trim();

  // DD-MM-YYYY (Dutch format)
  const ddmmyyyy = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return format(new Date(Number(year), Number(month) - 1, Number(day)), "yyyy-MM-dd");
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return format(parsed, "yyyy-MM-dd");

  return null;
}

function isSummaryRow(row: Record<string, string>): boolean {
  for (const val of Object.values(row)) {
    const lower = val.toLowerCase().trim();
    if (SUMMARY_KEYWORDS.some((kw) => lower.includes(kw))) return true;
  }
  return false;
}

// ─── Excel helpers ────────────────────────────────────────────────────────────

function findColExcel(row: Record<string, unknown>, ...names: string[]): unknown | undefined {
  for (const name of names) {
    if (row[name] !== null && row[name] !== undefined) return row[name];
  }
  return undefined;
}

function findNumExcel(row: Record<string, unknown>, ...names: string[]): number | null {
  return parseNumericExcel(findColExcel(row, ...names));
}

function findPctExcel(row: Record<string, unknown>, ...names: string[]): number {
  const val = findColExcel(row, ...names);
  const num = parseNumericExcel(val);
  if (num === null) return 0;
  if (num > 0 && num < 1) return round2(num * 100);
  return num;
}

function findStrExcel(row: Record<string, unknown>, ...names: string[]): string {
  const val = findColExcel(row, ...names);
  return val != null ? String(val).trim() : "";
}

function parseNumericExcel(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return isNaN(value) ? null : round2(value);
  const str = String(value).replace(/^€\s*/, "").replace(/%$/, "").trim();
  if (str === "" || str.startsWith("#")) return null;
  if (str.includes(".") && str.includes(",")) {
    return round2(parseFloat(str.replace(/\./g, "").replace(",", ".")));
  }
  if (str.includes(",")) return round2(parseFloat(str.replace(",", ".")));
  const num = parseFloat(str);
  return isNaN(num) ? null : round2(num);
}

function extractExcelDate(row: Record<string, unknown>): string | null {
  // Try named columns first
  const named = row["Datum"] ?? row["Date"];
  if (named != null) {
    const d = parseDateValueExcel(named);
    if (d) return d;
  }
  // Scan all values for date-like values
  for (const val of Object.values(row)) {
    if (val === null || val === undefined) continue;
    if (typeof val === "number" && val > 40000 && val < 60000) {
      return parseDateValueExcel(val);
    }
    if (typeof val === "string" && /^\d{1,2}-\d{1,2}-\d{4}$/.test(val.trim())) {
      return parseDateString(val);
    }
  }
  return null;
}

function parseDateValueExcel(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") {
    const excelEpoch = new Date(1899, 11, 30);
    return format(new Date(excelEpoch.getTime() + raw * 86400000), "yyyy-MM-dd");
  }
  if (raw instanceof Date) return format(raw, "yyyy-MM-dd");
  return parseDateString(String(raw));
}

function isSummaryRowExcel(row: Record<string, unknown>): boolean {
  for (const val of Object.values(row)) {
    if (typeof val === "string") {
      const lower = val.toLowerCase().trim();
      if (SUMMARY_KEYWORDS.some((kw) => lower.includes(kw))) return true;
    }
  }
  return false;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
