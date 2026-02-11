import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

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

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large (max 10 MB)" },
        { status: 400 }
      );
    }

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

    const orders: Array<{
      orderNumber: string;
      phoneNumber: string;
      waitingTimeMins: number;
      address: string | null;
      driverName: string | null;
      date: string;
    }> = [];

    for (const row of rawData) {
      const orderNumber = String(row["Order number"] || "").trim();
      const phoneNumber = String(row["Phone number"] || "").trim();
      const waitingTimeStr = String(row["Waiting time"] || "").trim();
      const address = String(row["Adres"] || row["Address"] || "").trim();
      const driverName = String(row["Driver"] || "").trim();

      if (!orderNumber || !phoneNumber) continue;

      const waitingTimeMins = parseFloat(waitingTimeStr);
      if (isNaN(waitingTimeMins) || waitingTimeMins < 0) continue;

      orders.push({
        orderNumber,
        phoneNumber,
        waitingTimeMins,
        address: address || null,
        driverName: driverName || null,
        date: fileDate,
      });
    }

    return NextResponse.json({ orders, date: fileDate });
  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process file",
      },
      { status: 500 }
    );
  }
}
