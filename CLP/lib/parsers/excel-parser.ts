import * as XLSX from "xlsx";
import { DeliveryOrder } from "@/lib/types";
import { format, parse } from "date-fns";
import { readdirSync, existsSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Parse a single Excel file and extract delivery orders
 * @param filePath Absolute path to the Excel file
 * @returns Array of delivery orders
 */
export function parseExcelFile(filePath: string): DeliveryOrder[] {
  try {
    // Read the Excel file using fs.readFileSync for Node.js environment
    const fileBuffer = readFileSync(filePath);
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });

    // Check if "Delivery" sheet exists
    if (!workbook.SheetNames.includes("Delivery")) {
      console.warn(`No "Delivery" sheet found in ${filePath}`);
      return [];
    }

    const worksheet = workbook.Sheets["Delivery"];
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      {
        defval: null,
      }
    );

    // Extract date from filename: Service_report_06-02-2026_12_49.xlsx
    const fileDate = extractDateFromFilename(filePath);

    // Parse each row
    const orders: DeliveryOrder[] = [];
    for (const row of rawData) {
      try {
        const order = parseRow(row, fileDate);
        if (order) {
          orders.push(order);
        }
      } catch (error) {
        console.warn(`Failed to parse row in ${filePath}:`, error);
        // Skip invalid rows
      }
    }

    return orders;
  } catch (error) {
    console.error(`Failed to parse Excel file ${filePath}:`, error);
    return [];
  }
}

/**
 * Parse all Excel files in a directory
 * @param dirPath Absolute path to directory containing Excel files
 * @returns Array of all delivery orders from all files
 */
export function parseAllExcelFiles(dirPath: string): DeliveryOrder[] {
  if (!existsSync(dirPath)) {
    console.warn(`Directory not found: ${dirPath}`);
    return [];
  }

  try {
    const files = readdirSync(dirPath);
    const excelFiles = files.filter(
      (file) => file.endsWith(".xlsx") && file.startsWith("Service_report_")
    );

    console.log(`Found ${excelFiles.length} Excel files in ${dirPath}`);

    const allOrders: DeliveryOrder[] = [];
    for (const file of excelFiles) {
      const filePath = join(dirPath, file);
      const orders = parseExcelFile(filePath);
      allOrders.push(...orders);
    }

    console.log(
      `Parsed ${allOrders.length} total orders from ${excelFiles.length} files`
    );

    return allOrders;
  } catch (error) {
    console.error(`Failed to read directory ${dirPath}:`, error);
    return [];
  }
}

/**
 * Group orders by month (YYYY-MM)
 * @param orders Array of delivery orders
 * @returns Map of month strings to order arrays
 */
export function groupOrdersByMonth(
  orders: DeliveryOrder[]
): Map<string, DeliveryOrder[]> {
  const grouped = new Map<string, DeliveryOrder[]>();

  for (const order of orders) {
    // Extract month from date field (YYYY-MM-DD → YYYY-MM)
    const month = order.date.substring(0, 7);

    if (!grouped.has(month)) {
      grouped.set(month, []);
    }
    grouped.get(month)!.push(order);
  }

  // Sort orders within each month by waiting time (descending)
  for (const [month, monthOrders] of grouped.entries()) {
    monthOrders.sort((a, b) => b.waitingTimeMins - a.waitingTimeMins);
  }

  return grouped;
}

/**
 * Parse a single row from the Excel sheet
 */
function parseRow(
  row: Record<string, unknown>,
  fileDate: Date
): DeliveryOrder | null {
  // Excel column mappings (0-indexed)
  // A: Order number
  // B: Phone number
  // C: Address
  // E: Order placed (HH:MM)
  // J: Completed (HH:MM)
  // L: Driver
  // M: Waiting time (minutes)

  const orderNumber = String(row["Order number"] || "").trim();
  const phoneNumber = String(row["Phone number"] || "").trim();
  const address = String(row["Adres"] || row["Address"] || "").trim();
  const orderPlacedStr = String(row["Order placed"] || "").trim();
  const completedStr = String(row["Completed"] || "").trim();
  const driverName = String(row["Driver"] || "").trim();
  const waitingTimeStr = String(row["Waiting time"] || "").trim();

  // Validate required fields
  if (!orderNumber || !phoneNumber) {
    return null;
  }

  // Parse waiting time
  const waitingTimeMins = parseFloat(waitingTimeStr);
  if (isNaN(waitingTimeMins) || waitingTimeMins < 0) {
    return null;
  }

  // Parse timestamps
  const orderPlaced = parseTimeString(orderPlacedStr, fileDate);
  const completed = completedStr
    ? parseTimeString(completedStr, fileDate)
    : null;

  // Format date as ISO string (YYYY-MM-DD)
  const date = format(fileDate, "yyyy-MM-dd");

  return {
    orderNumber,
    phoneNumber,
    waitingTimeMins,
    orderPlaced,
    completed,
    driverName: driverName || null,
    address: address || null,
    date,
  };
}

/**
 * Extract date from filename: Service_report_06-02-2026_12_49.xlsx
 */
function extractDateFromFilename(filePath: string): Date {
  const filename = filePath.split("/").pop() || "";
  const match = filename.match(/Service_report_(\d{2})-(\d{2})-(\d{4})/);

  if (match) {
    const [, day, month, year] = match;
    // Parse as DD-MM-YYYY
    return parse(`${day}-${month}-${year}`, "dd-MM-yyyy", new Date());
  }

  // Fallback to current date if parsing fails
  console.warn(`Could not extract date from filename: ${filename}`);
  return new Date();
}

/**
 * Parse time string (HH:MM) into a Date object
 * @param timeStr Time string in HH:MM format
 * @param baseDate Base date to use for the timestamp
 */
function parseTimeString(timeStr: string, baseDate: Date): Date {
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) {
      throw new Error("Invalid time format");
    }

    const result = new Date(baseDate);
    result.setHours(hours, minutes, 0, 0);
    return result;
  } catch (error) {
    console.warn(`Failed to parse time string: ${timeStr}`);
    return baseDate;
  }
}
