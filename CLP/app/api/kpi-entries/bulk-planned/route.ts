import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BulkPlannedValuesSchema } from "@/lib/schemas";
import { format, getISOWeek, parseISO } from "date-fns";
import { nl } from "date-fns/locale";
import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate input
    const validated = BulkPlannedValuesSchema.parse(body);

    // Build KPI entries from the per-day entries
    const dbEntries = validated.entries.map((entry) => {
      const date = parseISO(entry.date);
      const dayName = format(date, "EEEE", { locale: nl });
      const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      const weekNumber = getISOWeek(date);

      // Calculate planned labour percentage for this specific day
      const plannedLabourPct =
        entry.plannedRevenue > 0 && entry.plannedLabourCost > 0
          ? (entry.plannedLabourCost / entry.plannedRevenue) * 100
          : null;

      return {
        restaurant_id: validated.restaurantId,
        date: entry.date,
        day_name: capitalizedDayName,
        week_number: weekNumber,
        // Planned values from request (per day)
        planned_revenue: entry.plannedRevenue,
        planned_labour_cost: entry.plannedLabourCost,
        planned_labour_pct: plannedLabourPct,
        // Default zeros for required actual fields (for new entries)
        gross_revenue: 0,
        net_revenue: 0,
        labour_cost: 0,
        labour_pct: 0,
        worked_hours: 0,
        labour_productivity: 0,
        delivery_rate_30min: 0,
        on_time_delivery_mins: 0,
        make_time_mins: 0,
        drive_time_mins: 0,
        food_cost: 0,
        food_cost_pct: 0,
        order_count: 0,
        avg_order_value: 0,
        orders_per_run: 0,
        cash_difference: null,
        manager: "",
      };
    });

    // Upsert all entries
    const { error } = await supabase
      .from("kpi_entries")
      .upsert(dbEntries, { onConflict: "restaurant_id,date" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      daysUpdated: dbEntries.length,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Onbekende fout",
      },
      { status: 500 }
    );
  }
}
