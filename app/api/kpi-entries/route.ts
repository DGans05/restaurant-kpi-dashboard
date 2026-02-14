import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { format, getISOWeek } from "date-fns";
import { nl } from "date-fns/locale";

const KPIEntryInputSchema = z.object({
  restaurantId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  plannedRevenue: z.number().min(0),
  grossRevenue: z.number().min(0),
  netRevenue: z.number().min(0),
  plannedLabourCost: z.number().min(0),
  labourCost: z.number().min(0),
  plannedLabourPct: z.number().nullable(),
  labourPct: z.number().min(0),
  workedHours: z.number().min(0),
  labourProductivity: z.number().min(0),
  foodCost: z.number().min(0),
  foodCostPct: z.number().min(0),
  deliveryRate30min: z.number().min(0).max(100),
  onTimeDeliveryMins: z.number().min(0),
  makeTimeMins: z.number().min(0),
  driveTimeMins: z.number().min(0),
  orderCount: z.number().int().min(0),
  avgOrderValue: z.number().min(0),
  ordersPerRun: z.number().min(0),
  cashDifference: z.number().nullable(),
  manager: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = KPIEntryInputSchema.parse(body);

    const dateObj = new Date(validated.date);
    const dayName = format(dateObj, "EEEE", { locale: nl });
    const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

    const { error } = await supabase.from("kpi_entries").upsert({
      restaurant_id: validated.restaurantId,
      date: validated.date,
      day_name: capitalizedDayName,
      week_number: getISOWeek(dateObj),
      planned_revenue: validated.plannedRevenue,
      gross_revenue: validated.grossRevenue,
      net_revenue: validated.netRevenue,
      planned_labour_cost: validated.plannedLabourCost,
      labour_cost: validated.labourCost,
      planned_labour_pct: validated.plannedLabourPct,
      labour_pct: validated.labourPct,
      worked_hours: validated.workedHours,
      labour_productivity: validated.labourProductivity,
      food_cost: validated.foodCost,
      food_cost_pct: validated.foodCostPct,
      delivery_rate_30min: validated.deliveryRate30min,
      on_time_delivery_mins: validated.onTimeDeliveryMins,
      make_time_mins: validated.makeTimeMins,
      drive_time_mins: validated.driveTimeMins,
      order_count: validated.orderCount,
      avg_order_value: validated.avgOrderValue,
      orders_per_run: validated.ordersPerRun,
      cash_difference: validated.cashDifference,
      manager: validated.manager,
    }, { onConflict: "restaurant_id,date" });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("KPI entry error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
