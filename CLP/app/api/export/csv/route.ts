import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const ExportParamsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  restaurantId: z.string().min(1).optional(),
});

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const params = ExportParamsSchema.parse({
      startDate: url.searchParams.get("startDate"),
      endDate: url.searchParams.get("endDate"),
      restaurantId: url.searchParams.get("restaurantId") || undefined,
    });

    let query = supabase
      .from("kpi_entries")
      .select("*")
      .gte("date", params.startDate)
      .lte("date", params.endDate)
      .order("date", { ascending: true });

    if (params.restaurantId) {
      query = query.eq("restaurant_id", params.restaurantId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return new Response("No data found for the specified period", { status: 404 });
    }

    const headers = [
      "Datum", "Dag", "Week", "Restaurant",
      "Omzet Begroot", "Omzet Bruto", "Omzet Netto",
      "Arbeidskosten Begroot", "Arbeidskosten", "Arbeids% Begroot", "Arbeids%",
      "Gewerkte Uren", "Arbeidsproductiviteit",
      "Food Cost", "Food Cost %",
      "Bezorgd 30min %", "OTD (min)", "Bereidtijd (min)", "Rijtijd (min)",
      "Bestellingen", "Gem. Bestelbedrag", "Bestellingen per Rit",
      "Kasverschil", "Manager"
    ];

    const rows = data.map((row) => [
      row.date,
      row.day_name,
      row.week_number,
      row.restaurant_id,
      row.planned_revenue,
      row.gross_revenue,
      row.net_revenue,
      row.planned_labour_cost,
      row.labour_cost,
      row.planned_labour_pct ?? "",
      row.labour_pct,
      row.worked_hours,
      row.labour_productivity,
      row.food_cost,
      row.food_cost_pct,
      row.delivery_rate_30min,
      row.on_time_delivery_mins,
      row.make_time_mins,
      row.drive_time_mins,
      row.order_count,
      row.avg_order_value,
      row.orders_per_run,
      row.cash_difference ?? "",
      row.manager,
    ]);

    const csvContent = [
      headers.join(";"),
      ...rows.map((row) => row.join(";")),
    ].join("\n");

    const filename = `kpi_export_${params.startDate}_${params.endDate}.csv`;

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("CSV export error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
