import { NextResponse } from "next/server";
import { NYPApiClient } from "@/lib/services/nyp-api-client";
import { createAdminClient } from "@/lib/supabase/admin-client";
import type { NypCookies } from "@/lib/types/nyp-types";

export const dynamic = "force-dynamic";

/**
 * GET — Check if NYP session is still valid
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const restaurantId = "rosmalen";

    // Try DB first, fall back to env
    const { data: session } = await supabase
      .from("nyp_sessions")
      .select("cookies_json, last_validated, is_active")
      .eq("restaurant_id", restaurantId)
      .single();

    let cookies: NypCookies | null = null;

    if (session?.cookies_json) {
      cookies = JSON.parse(session.cookies_json);
    } else if (process.env.NYP_COOKIES_JSON) {
      cookies = JSON.parse(process.env.NYP_COOKIES_JSON);
    }

    if (!cookies) {
      return NextResponse.json({
        status: "not_configured",
        message: "No NYP cookies configured",
      }, { status: 404 });
    }

    const client = new NYPApiClient(cookies);
    const isValid = await client.isSessionValid();

    if (isValid) {
      await client.keepAlive();

      // Update last_validated
      if (session) {
        await supabase
          .from("nyp_sessions")
          .update({ last_validated: new Date().toISOString(), is_active: true })
          .eq("restaurant_id", restaurantId);
      }

      return NextResponse.json({
        status: "active",
        lastValidated: new Date().toISOString(),
      });
    }

    // Mark as inactive
    if (session) {
      await supabase
        .from("nyp_sessions")
        .update({ is_active: false })
        .eq("restaurant_id", restaurantId);
    }

    return NextResponse.json({
      status: "expired",
      message: "NYP session expired. POST new cookies to refresh.",
    }, { status: 401 });
  } catch (error) {
    console.error("NYP session check error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}

/**
 * POST — Store new NYP cookies after manual browser login
 * Body: { cookies: { ".AspNet.ApplicationCookie-S4D.Web.Store": "...", ... } }
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { cookies, restaurantId = "rosmalen" } = body;

    if (!cookies || typeof cookies !== "object") {
      return NextResponse.json({ error: "Missing cookies object in body" }, { status: 400 });
    }

    // Validate by testing session
    const client = new NYPApiClient(cookies as NypCookies);
    const isValid = await client.isSessionValid();

    if (!isValid) {
      return NextResponse.json({
        error: "Provided cookies are invalid or expired",
      }, { status: 400 });
    }

    // Store in DB
    const supabase = createAdminClient();
    const { error } = await supabase.from("nyp_sessions").upsert(
      {
        restaurant_id: restaurantId,
        cookies_json: JSON.stringify(cookies),
        last_validated: new Date().toISOString(),
        is_active: true,
      },
      { onConflict: "restaurant_id" }
    );

    if (error) {
      return NextResponse.json({ error: `DB error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({
      status: "stored",
      message: "Cookies validated and stored successfully",
    });
  } catch (error) {
    console.error("NYP session refresh error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
