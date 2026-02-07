import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import * as Sentry from "@sentry/nextjs";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { NYPApiClient, SessionExpiredError } from "@/lib/services/nyp-api-client";
import { getReportTypeConfig } from "@/lib/config/report-types";
import { parseOperationalReport } from "@/lib/parsers/operational-report-parser";
import { subDays, format } from "date-fns";
import { rateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit";
import type { NypCookies } from "@/lib/types/nyp-types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  try {
    // Validate CRON_SECRET is configured
    if (!process.env.CRON_SECRET) {
      Sentry.captureMessage("CRON_SECRET not configured", { level: "error" });
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    // Timing-safe comparison to prevent timing attacks
    const authHeader = request.headers.get("authorization") || "";
    const expected = Buffer.from(`Bearer ${process.env.CRON_SECRET}`);
    const actual = Buffer.from(authHeader);

    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting: 5 requests per minute (prevents abuse if secret is compromised)
    const rateLimitResult = rateLimit({
      identifier: "cron:download-reports",
      limit: 5,
      windowMs: 60_000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: getRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const supabase = createAdminClient();
    const restaurantId = "rosmalen";

    let cookies: NypCookies;
    const { data: session } = await supabase
      .from("nyp_sessions")
      .select("cookies_json")
      .eq("restaurant_id", restaurantId)
      .eq("is_active", true)
      .single();

    if (session?.cookies_json) {
      cookies = JSON.parse(session.cookies_json);
    } else if (process.env.NYP_COOKIES_JSON) {
      cookies = JSON.parse(process.env.NYP_COOKIES_JSON);
    } else {
      return NextResponse.json(
        { error: "No NYP cookies configured" },
        { status: 500 }
      );
    }

    const client = new NYPApiClient(cookies);
    const isValid = await client.isSessionValid();

    if (!isValid) {
      if (session) {
        await supabase
          .from("nyp_sessions")
          .update({ is_active: false })
          .eq("restaurant_id", restaurantId);
      }
      return NextResponse.json(
        {
          error: "NYP session expired",
          action: "Please refresh cookies via /api/nyp/refresh-session",
        },
        { status: 401 }
      );
    }

    const yesterday = subDays(new Date(), 1);
    const reportMeta = getReportTypeConfig("OPERATIONAL");

    const response = await client.generateReport(
      reportMeta,
      yesterday,
      yesterday
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to download report: HTTP ${response.status}` },
        { status: 502 }
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const entries = parseOperationalReport(buffer);

    if (entries.length === 0) {
      return NextResponse.json({
        warning: "No entries parsed from report",
        date: format(yesterday, "yyyy-MM-dd"),
      });
    }

    const kpiRows = entries.map((entry) => ({
      restaurant_id: restaurantId,
      date: entry.date,
      day_name: entry.dayName,
      week_number: entry.weekNumber,
      planned_revenue: entry.plannedRevenue,
      gross_revenue: entry.grossRevenue,
      net_revenue: entry.netRevenue,
      planned_labour_cost: entry.plannedLabourCost,
      labour_cost: entry.labourCost,
      planned_labour_pct: entry.plannedLabourPct,
      labour_pct: entry.labourPct,
      worked_hours: entry.workedHours,
      labour_productivity: entry.labourProductivity,
      food_cost: entry.foodCost,
      food_cost_pct: entry.foodCostPct,
      delivery_rate_30min: entry.deliveryRate30min,
      on_time_delivery_mins: entry.onTimeDeliveryMins,
      make_time_mins: entry.makeTimeMins,
      drive_time_mins: entry.driveTimeMins,
      order_count: entry.orderCount,
      avg_order_value: entry.avgOrderValue,
      orders_per_run: entry.ordersPerRun,
      cash_difference: entry.cashDifference,
      manager: entry.manager,
    }));

    const { error: upsertError } = await supabase
      .from("kpi_entries")
      .upsert(kpiRows, { onConflict: "restaurant_id,date" });

    if (upsertError) {
      console.error("Failed to upsert KPI entries:", upsertError);
      return NextResponse.json(
        { error: "Failed to save KPI data" },
        { status: 500 }
      );
    }

    const dateStr = format(yesterday, "yyyy-MM-dd");
    const storagePath = `${restaurantId}/OPERATIONAL/${format(yesterday, "yyyy")}/${format(yesterday, "MM")}/OPERATIONAL_${dateStr}.xlsx`;

    await supabase.storage.from("reports").upload(storagePath, buffer, {
      contentType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      upsert: true,
    });

    await supabase.from("reports").upsert(
      {
        restaurant_id: restaurantId,
        report_type: "OPERATIONAL",
        report_name: reportMeta.name,
        report_period: dateStr,
        file_path: storagePath,
        file_size_bytes: buffer.length,
        upload_status: "parsed",
        parsed_at: new Date().toISOString(),
      },
      { onConflict: "restaurant_id,report_type,report_period" }
    );

    return NextResponse.json({
      success: true,
      date: dateStr,
      entriesUpserted: entries.length,
      storagePath,
    });
  } catch (error) {
    if (error instanceof SessionExpiredError) {
      // Don't send session expired to Sentry (expected error)
      return NextResponse.json(
        { error: "NYP session expired" },
        { status: 401 }
      );
    }

    // Capture unexpected errors in Sentry
    Sentry.captureException(error, {
      tags: {
        component: "cron-download-reports",
        restaurant_id: "rosmalen",
      },
      extra: {
        date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      },
    });

    console.error("Cron download-reports error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
