import * as XLSX from "xlsx";

/**
 * Monthly aggregated metrics from a SERVICE report.
 *
 * SERVICE reports from NYP contain one month of orders across three sheets
 * (Delivery, Pickup, Take Away) without per-day date columns. Orders only
 * have HH:MM timestamps, not full dates.
 */
export interface MonthlyServiceMetrics {
  grossRevenue: number;
  netRevenue: number;
  totalOrders: number;
  deliveryOrders: number;
  pickupOrders: number;
  takeAwayOrders: number;
  deliveryRate30min: number;
  avgWaitingTimeMins: number;
  avgMakeTimeMins: number;
  avgDriveTimeMins: number;
  avgOrdersPerRun: number;
}

/**
 * Parse a SERVICE report Excel buffer into monthly aggregated metrics.
 *
 * SERVICE reports are monthly files. Each sheet (Delivery, Pickup, Take Away)
 * contains orders for the entire month with only HH:MM timestamps (no dates).
 * We aggregate at the monthly level and distribute across days later.
 */
export function parseServiceReport(buffer: Buffer): MonthlyServiceMetrics {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  let grossRevenue = 0;
  let netRevenue = 0;
  let deliveryOrders = 0;
  let pickupOrders = 0;
  let takeAwayOrders = 0;

  // Delivery-specific accumulators
  let waitTimeSum = 0;
  let waitTimeCount = 0;
  let makeTimeSum = 0;
  let makeTimeCount = 0;
  let driveTimeSum = 0;
  let driveTimeCount = 0;
  let ordersPerRunSum = 0;
  let ordersPerRunCount = 0;
  let deliveredWithin30 = 0;

  for (const sheetType of ["Delivery", "Pickup", "Take Away"] as const) {
    if (!workbook.SheetNames.includes(sheetType)) {
      continue;
    }

    const worksheet = workbook.Sheets[sheetType];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      { defval: null }
    );

    for (const row of rawRows) {
      // Skip summary rows
      const orderNum = String(row["Order number"] ?? "").trim();
      if (
        !orderNum ||
        orderNum.toLowerCase() === "averages" ||
        orderNum.toLowerCase() === "gemiddelden"
      ) {
        continue;
      }

      const orderAmount = parseNumeric(
        row["Order amount (incl VAT)"] ??
          row["Order amount"] ??
          row["Bedrag incl. BTW"]
      );
      if (orderAmount === null || orderAmount <= 0) {
        continue;
      }

      const nettoRaw = row["Netto"] ?? row["Net amount"] ?? row["Netto bedrag"];
      const nettoAmount = parseNumeric(nettoRaw) ?? orderAmount / 1.09;

      grossRevenue += orderAmount;
      netRevenue += nettoAmount;

      if (sheetType === "Delivery") {
        deliveryOrders++;

        const waitTime = parseNumeric(
          row["Waiting time"] ?? row["Wachttijd"]
        );
        if (waitTime !== null) {
          waitTimeSum += waitTime;
          waitTimeCount++;
          if (waitTime <= 30) {
            deliveredWithin30++;
          }
        }

        const makeTime = parseNumeric(
          row["Minutes"] ?? row["Make time"] ?? row["Bereidtijd"]
        );
        if (makeTime !== null) {
          makeTimeSum += makeTime;
          makeTimeCount++;
        }

        const driveTime = parseNumeric(
          row["Driving time"] ?? row["Rijtijd"] ?? row["Drive time"]
        );
        if (driveTime !== null) {
          driveTimeSum += driveTime;
          driveTimeCount++;
        }

        const ordersPerRun = parseNumeric(
          row["Orders per run"] ?? row["Orders per rit"]
        );
        if (ordersPerRun !== null) {
          ordersPerRunSum += ordersPerRun;
          ordersPerRunCount++;
        }
      } else if (sheetType === "Pickup") {
        pickupOrders++;
      } else {
        takeAwayOrders++;
      }
    }
  }

  return {
    grossRevenue: round2(grossRevenue),
    netRevenue: round2(netRevenue),
    totalOrders: deliveryOrders + pickupOrders + takeAwayOrders,
    deliveryOrders,
    pickupOrders,
    takeAwayOrders,
    deliveryRate30min:
      waitTimeCount > 0
        ? round2((deliveredWithin30 / waitTimeCount) * 100)
        : 0,
    avgWaitingTimeMins:
      waitTimeCount > 0 ? round2(waitTimeSum / waitTimeCount) : 0,
    avgMakeTimeMins:
      makeTimeCount > 0 ? round2(makeTimeSum / makeTimeCount) : 0,
    avgDriveTimeMins:
      driveTimeCount > 0 ? round2(driveTimeSum / driveTimeCount) : 0,
    avgOrdersPerRun:
      ordersPerRunCount > 0
        ? round2(ordersPerRunSum / ordersPerRunCount)
        : 1.0,
  };
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
