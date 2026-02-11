import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseKpiCsv } from "@/lib/parsers/kpi-csv-parser";
import { format, getISOWeek } from "date-fns";
import { nl } from "date-fns/locale";
import { z } from "zod";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

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

    const buffer = Buffer.from(arrayBuffer);
    const entries = parseKpiCsv(buffer);

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No valid data rows found in the file" },
        { status: 400 }
      );
    }

    const rows = entries.map((entry) => {
      const dateObj = new Date(entry.date);
      const dayName = format(dateObj, "EEEE", { locale: nl });
      const capitalizedDayName =
        dayName.charAt(0).toUpperCase() + dayName.slice(1);

      return {
        restaurant_id: restaurantId,
        date: entry.date,
        day_name: capitalizedDayName,
        week_number: getISOWeek(dateObj),
        planned_revenue: entry.plannedRevenue,
        gross_revenue: entry.grossRevenue,
        net_revenue: entry.netRevenue,
        burger_kitchen_revenue: entry.burgerKitchenRevenue,
        planned_labour_cost: entry.plannedLabourCost,
        labour_cost: entry.labourCost,
        planned_labour_pct: entry.plannedLabourPct,
        labour_pct: entry.labourPct,
        worked_hours: entry.workedHours,
        labour_productivity: entry.labourProductivity,
        food_cost: entry.foodCost,
        food_cost_pct: entry.foodCostPct,
        delivery_rate_20min: entry.deliveryRate20min,
        delivery_rate_30min: entry.deliveryRate30min,
        on_time_delivery_mins: entry.onTimeDeliveryMins,
        make_time_mins: entry.makeTimeMins,
        drive_time_mins: entry.driveTimeMins,
        order_count: entry.orderCount,
        avg_order_value: entry.avgOrderValue,
        orders_per_run: entry.ordersPerRun,
        cash_difference: entry.cashDifference,
        manager: entry.manager,
      };
    });

    const { error } = await supabase
      .from("kpi_entries")
      .upsert(rows, { onConflict: "restaurant_id,date" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, imported: rows.length });
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process file",
      },
      { status: 500 }
    );
  }
}
