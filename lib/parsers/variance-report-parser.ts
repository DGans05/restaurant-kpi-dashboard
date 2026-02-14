import * as XLSX from "xlsx";

export interface FoodCostData {
  period: string;
  totalFoodCost: number;
  foodCostPct: number;
  idealUsageCost: number;
  varianceCost: number;
  variancePct: number;
}

export interface DailyFoodCostAllocation {
  date: string;
  foodCost: number;
  foodCostPct: number;
}

const TOTAL_ROW_MARKERS = [
  "totaal",
  "total",
  "totalen",
  "grand total",
  "eindtotaal",
];

const CATEGORY_COL_NAMES = [
  "Categorie",
  "Category",
  "Product",
  "Productgroep",
  "Groep",
];

const IDEAL_COL_NAMES = [
  "Ideaal",
  "Ideal",
  "Ideaal gebruik",
  "Ideal usage",
  "Ideaal kosten",
];

const ACTUAL_COL_NAMES = [
  "Werkelijk",
  "Actual",
  "Werkelijk gebruik",
  "Actual usage",
  "Werkelijke kosten",
];

const VARIANCE_COL_NAMES = [
  "Verschil",
  "Variance",
  "Afwijking",
  "Difference",
];

const VARIANCE_PCT_COL_NAMES = [
  "Verschil %",
  "Variance %",
  "Afwijking %",
  "Verschil%",
  "Variance%",
];

const COST_COL_NAMES = [
  "Kosten",
  "Cost",
  "Totaal kosten",
  "Total cost",
  "Bedrag",
  "Amount",
];

const FOOD_COST_PCT_COL_NAMES = [
  "Food cost %",
  "Food cost%",
  "Foodcost %",
  "Foodcost%",
  "FC %",
  "FC%",
  "Kosten %",
];

/**
 * Parse a VARIANCE report Excel buffer into food cost data.
 */
export function parseVarianceReport(buffer: Buffer): FoodCostData | null {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });

    if (workbook.SheetNames.length === 0) {
      return null;
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      { defval: null }
    );

    if (rawRows.length === 0) {
      return null;
    }

    const keys = Object.keys(rawRows[0]);
    const categoryCol = findColumn(keys, CATEGORY_COL_NAMES);
    const idealCol = findColumn(keys, IDEAL_COL_NAMES);
    const actualCol = findColumn(keys, ACTUAL_COL_NAMES);
    const varianceCol = findColumn(keys, VARIANCE_COL_NAMES);
    const variancePctCol = findColumn(keys, VARIANCE_PCT_COL_NAMES);
    const costCol = findColumn(keys, COST_COL_NAMES);
    const foodCostPctCol = findColumn(keys, FOOD_COST_PCT_COL_NAMES);

    // Try to find the total row
    const totalRow = findTotalRow(rawRows, categoryCol);

    let totalFoodCost = 0;
    let idealUsageCost = 0;
    let varianceCost = 0;
    let variancePct = 0;
    let foodCostPct = 0;

    if (totalRow) {
      totalFoodCost =
        parseNumeric(totalRow[costCol ?? ""] ?? totalRow[actualCol ?? ""]) ?? 0;
      idealUsageCost = parseNumeric(totalRow[idealCol ?? ""]) ?? 0;
      varianceCost = parseNumeric(totalRow[varianceCol ?? ""]) ?? 0;
      variancePct = parseNumeric(totalRow[variancePctCol ?? ""]) ?? 0;
      foodCostPct = parseNumeric(totalRow[foodCostPctCol ?? ""]) ?? 0;
    } else {
      // Sum all rows
      for (const row of rawRows) {
        const cost = parseNumeric(
          row[costCol ?? ""] ?? row[actualCol ?? ""]
        );
        if (cost !== null) {
          totalFoodCost += cost;
        }

        const ideal = parseNumeric(row[idealCol ?? ""]);
        if (ideal !== null) {
          idealUsageCost += ideal;
        }
      }

      varianceCost = round2(totalFoodCost - idealUsageCost);
      variancePct =
        idealUsageCost > 0
          ? round2(((totalFoodCost - idealUsageCost) / idealUsageCost) * 100)
          : 0;
    }

    if (totalFoodCost === 0) {
      return null;
    }

    // Extract period from sheet name or workbook properties
    const period = extractPeriod(workbook);

    return {
      period,
      totalFoodCost: round2(totalFoodCost),
      foodCostPct: round2(foodCostPct),
      idealUsageCost: round2(idealUsageCost),
      varianceCost: round2(varianceCost),
      variancePct: round2(variancePct),
    };
  } catch (error) {
    console.error("Failed to parse variance report:", error);
    return null;
  }
}

/**
 * Distribute monthly food cost across daily entries proportionally by revenue.
 */
export function distributeFoodCostByRevenue(
  monthlyFoodCost: number,
  dailyRevenues: Map<string, number>
): DailyFoodCostAllocation[] {
  const totalRevenue = Array.from(dailyRevenues.values()).reduce(
    (sum, rev) => sum + rev,
    0
  );

  if (totalRevenue <= 0 || dailyRevenues.size === 0) {
    return Array.from(dailyRevenues.keys()).map((date) => ({
      date,
      foodCost: round2(monthlyFoodCost / Math.max(dailyRevenues.size, 1)),
      foodCostPct: 0,
    }));
  }

  const monthlyPct = round2((monthlyFoodCost / totalRevenue) * 100);

  return Array.from(dailyRevenues.entries()).map(([date, revenue]) => ({
    date,
    foodCost: round2((revenue / totalRevenue) * monthlyFoodCost),
    foodCostPct: monthlyPct,
  }));
}

function findColumn(
  keys: string[],
  candidates: string[]
): string | undefined {
  const lowerKeys = keys.map((k) => k.toLowerCase().trim());
  for (const candidate of candidates) {
    const idx = lowerKeys.indexOf(candidate.toLowerCase());
    if (idx !== -1) {
      return keys[idx];
    }
  }
  return undefined;
}

function findTotalRow(
  rows: Record<string, unknown>[],
  categoryCol: string | undefined
): Record<string, unknown> | undefined {
  for (const row of rows) {
    const values = categoryCol
      ? [row[categoryCol]]
      : Object.values(row).slice(0, 2);

    for (const val of values) {
      if (val === null || val === undefined) {
        continue;
      }
      const str = String(val).toLowerCase().trim();
      if (TOTAL_ROW_MARKERS.some((marker) => str.includes(marker))) {
        return row;
      }
    }
  }
  return undefined;
}

function extractPeriod(workbook: XLSX.WorkBook): string {
  // Try sheet names for month/year patterns
  for (const name of workbook.SheetNames) {
    const match = name.match(/(\d{4})-(\d{2})/);
    if (match) {
      return `${match[1]}-${match[2]}`;
    }
  }

  // Try workbook properties
  const props = workbook.Props;
  if (props?.CreatedDate) {
    const d = new Date(props.CreatedDate);
    if (!isNaN(d.getTime())) {
      const month = String(d.getMonth() + 1).padStart(2, "0");
      return `${d.getFullYear()}-${month}`;
    }
  }

  // Fallback: current month
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${month}`;
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
