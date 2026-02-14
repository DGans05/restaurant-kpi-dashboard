import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import * as XLSX from "xlsx";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const DeliveryRowSchema = z.object({
  orderNumber: z.string().min(1),
  phoneNumber: z.string().min(1),
  waitingTimeMins: z.number().nonnegative(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  orderPlaced: z.string().nullable(),
  completed: z.string().nullable(),
  driverName: z.string().nullable(),
  address: z.string().nullable(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const restaurantId = formData.get("restaurantId");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!restaurantId || typeof restaurantId !== "string") {
      return NextResponse.json(
        { error: "restaurantId is required" },
        { status: 400 }
      );
    }

    const restaurantIdParsed = z.string().min(1).safeParse(restaurantId);
    if (!restaurantIdParsed.success) {
      return NextResponse.json(
        { error: "Invalid restaurantId" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 400 }
      );
    }

    // Parse Excel file
    const buffer = Buffer.from(arrayBuffer);
    const workbook = XLSX.read(buffer, { type: "buffer" });

    if (!workbook.SheetNames.includes("Delivery")) {
      return NextResponse.json(
        { error: 'No "Delivery" sheet found in this file' },
        { status: 400 }
      );
    }

    const worksheet = workbook.Sheets["Delivery"];
    const rawData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      worksheet,
      { defval: null }
    );

    // Extract date from filename
    const fileName = file.name || "";
    const dateMatch = fileName.match(/Service_report_(\d{2})-(\d{2})-(\d{4})/);
    let fileDate: string;
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      fileDate = `${year}-${month}-${day}`;
    } else {
      return NextResponse.json(
        { error: "Could not extract date from filename. Expected format: Service_report_DD-MM-YYYY_*.xlsx" },
        { status: 400 }
      );
    }

    // Parse rows
    const orders: z.infer<typeof DeliveryRowSchema>[] = [];
    for (const row of rawData) {
      const orderNumber = String(row["Order number"] || "").trim();
      const phoneNumber = String(row["Phone number"] || "").trim();
      const waitingTimeStr = String(row["Waiting time"] || "").trim();
      const address = String(row["Adres"] || row["Address"] || "").trim();
      const orderPlacedStr = String(row["Order placed"] || "").trim();
      const completedStr = String(row["Completed"] || "").trim();
      const driverName = String(row["Driver"] || "").trim();

      if (!orderNumber || !phoneNumber) continue;

      const waitingTimeMins = parseFloat(waitingTimeStr);
      if (isNaN(waitingTimeMins) || waitingTimeMins < 0) continue;

      orders.push({
        orderNumber,
        phoneNumber,
        waitingTimeMins,
        date: fileDate,
        orderPlaced: orderPlacedStr || null,
        completed: completedStr || null,
        driverName: driverName || null,
        address: address || null,
      });
    }

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "No valid delivery orders found in the file" },
        { status: 400 }
      );
    }

    // Build timestamp from time strings
    const rows = orders.map((o) => ({
      restaurant_id: restaurantId,
      date: o.date,
      order_number: o.orderNumber,
      phone_number: o.phoneNumber,
      waiting_time_mins: o.waitingTimeMins,
      order_placed: o.orderPlaced ? buildTimestamp(o.date, o.orderPlaced) : null,
      completed: o.completed ? buildTimestamp(o.date, o.completed) : null,
      driver_name: o.driverName,
      address: o.address,
    }));

    const { error } = await supabase
      .from("delivery_orders")
      .upsert(rows, { onConflict: "restaurant_id,order_number,date" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, imported: rows.length });
  } catch (error) {
    console.error("Delivery orders import error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process file",
      },
      { status: 500 }
    );
  }
}

function buildTimestamp(dateStr: string, timeStr: string): string | null {
  try {
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  } catch {
    return null;
  }
}
