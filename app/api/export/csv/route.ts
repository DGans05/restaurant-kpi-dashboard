import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { rateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit";

const ExportParamsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  restaurantId: z.string().min(1).optional(),
});

/**
 * Sanitize CSV values to prevent CSV injection attacks.
 * Prefixes dangerous characters with a single quote.
 */
function sanitizeCSVValue(value: unknown): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const str = String(value);

  // Check if value starts with dangerous characters
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`; // Prefix with single quote to prevent formula execution
  }

  return str;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 10 exports per minute per user
    const rateLimitResult = rateLimit({
      identifier: `csv-export:${user.id}`,
      limit: 10,
      windowMs: 60_000, // 1 minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: "Too many export requests",
          resetAt: rateLimitResult.resetAt,
        },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
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
      console.error("CSV export database error:", error);
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
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
      sanitizeCSVValue(row.date),
      sanitizeCSVValue(row.day_name),
      sanitizeCSVValue(row.week_number),
      sanitizeCSVValue(row.restaurant_id),
      sanitizeCSVValue(row.planned_revenue),
      sanitizeCSVValue(row.gross_revenue),
      sanitizeCSVValue(row.net_revenue),
      sanitizeCSVValue(row.planned_labour_cost),
      sanitizeCSVValue(row.labour_cost),
      sanitizeCSVValue(row.planned_labour_pct ?? ""),
      sanitizeCSVValue(row.labour_pct),
      sanitizeCSVValue(row.worked_hours),
      sanitizeCSVValue(row.labour_productivity),
      sanitizeCSVValue(row.food_cost),
      sanitizeCSVValue(row.food_cost_pct),
      sanitizeCSVValue(row.delivery_rate_30min),
      sanitizeCSVValue(row.on_time_delivery_mins),
      sanitizeCSVValue(row.make_time_mins),
      sanitizeCSVValue(row.drive_time_mins),
      sanitizeCSVValue(row.order_count),
      sanitizeCSVValue(row.avg_order_value),
      sanitizeCSVValue(row.orders_per_run),
      sanitizeCSVValue(row.cash_difference ?? ""),
      sanitizeCSVValue(row.manager),
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

    // Capture unexpected errors in Sentry (without sensitive URL params)
    Sentry.captureException(error, {
      tags: {
        component: "csv-export",
      },
    });

    console.error("CSV export error:", error);
    return NextResponse.json({
      error: "Internal server error"
    }, { status: 500 });
  }
}
