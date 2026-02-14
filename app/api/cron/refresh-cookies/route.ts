import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import * as Sentry from "@sentry/nextjs";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { chromium } from "playwright";
import { rateLimit, getRateLimitHeaders } from "@/lib/utils/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // 2 minutes for Playwright automation

/**
 * Automated NYP cookie refresh cron job
 * Runs daily at 5 AM (before 6 AM report download)
 *
 * Process:
 * 1. Launch headless browser
 * 2. Navigate to NYP login
 * 3. Fill credentials and submit
 * 4. Handle 2FA if required
 * 5. Extract session cookies
 * 6. Store in database
 */
export async function GET(request: Request) {
  const startTime = Date.now();

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

    // Rate limiting: 3 requests per hour (expensive operation with Playwright)
    const rateLimitResult = rateLimit({
      identifier: "cron:refresh-cookies",
      limit: 3,
      windowMs: 60 * 60_000, // 1 hour
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

    // Verify credentials are configured
    const { NYP_USERNAME, NYP_PASSWORD } = process.env;
    if (!NYP_USERNAME || !NYP_PASSWORD) {
      Sentry.captureMessage("NYP credentials not configured", {
        level: "error",
        tags: { component: "cookie-refresh" },
      });
      return NextResponse.json(
        { error: "NYP credentials not configured" },
        { status: 500 }
      );
    }

    // Removed: console.log("🔄 Starting cookie refresh...");

    // Launch Playwright browser
    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      viewport: { width: 1280, height: 720 },
    });

    const page = await context.newPage();

    try {
      // Navigate to NYP login page
      // Removed: console.log("   Navigating to NYP login...");
      await page.goto("https://service.newyorkpizza.nl/Account/SignIn", {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      // Fill login form
      // Removed: console.log("   Finding login form...");
      const emailInput = page.locator('input[type="text"]:visible, input[type="email"]:visible').first();
      const passwordInput = page.locator('input[type="password"]:visible').first();
      const submitButton = page.locator('button:has-text("Inloggen"), input[type="submit"][value*="Log"]').first();

      await emailInput.fill(NYP_USERNAME);
      await passwordInput.fill(NYP_PASSWORD);

      // Removed: console.log("   Submitting login form...");

      // Click submit and handle potential 2FA redirect
      await submitButton.click({ timeout: 5000 }).catch(() => {
        // Removed: console.log("   Click initiated (navigation pending)...");
      });

      // Wait for navigation
      await page.waitForLoadState("networkidle", { timeout: 10000 });
      const url = page.url();

      // Check if 2FA is required
      if (url.includes("VerifyLogin") || url.includes("verify") || url.includes("2fa")) {
        // Removed: console.log("⚠️  2FA detected - cookie refresh requires manual intervention");

        Sentry.captureMessage("Cookie refresh blocked by 2FA", {
          level: "warning",
          tags: { component: "cookie-refresh" },
          extra: { url },
        });

        await browser.close();
        return NextResponse.json({
          warning: "2FA required - cookies not refreshed",
          action: "Please manually refresh via npm run nyp:capture-cookies",
        });
      }

      // Check if login succeeded
      if (url.includes("SignIn") || url.includes("Login")) {
        throw new Error("Login failed - still on login page");
      }

      // Removed: console.log("   ✓ Login successful");

      // Extract session cookies
      const cookies = await context.cookies();
      const nypCookies = cookies.filter(
        (c) =>
          c.domain.includes("newyorkpizza.nl") ||
          c.name.includes("session") ||
          c.name.includes("auth") ||
          c.name.startsWith(".")
      );

      if (nypCookies.length === 0) {
        throw new Error("No session cookies found after login");
      }

      // Removed: console.log(`   ✓ Captured ${nypCookies.length} cookies`);

      // Convert to storage format
      const cookiesJson: Record<string, string> = {};
      nypCookies.forEach((cookie) => {
        cookiesJson[cookie.name] = cookie.value;
      });

      // Store in database
      const supabase = createAdminClient();
      const { error: upsertError } = await supabase
        .from("nyp_sessions")
        .upsert(
          {
            restaurant_id: "rosmalen",
            cookies_json: JSON.stringify(cookiesJson),
            last_validated: new Date().toISOString(),
            is_active: true,
          },
          { onConflict: "restaurant_id" }
        );

      if (upsertError) {
        throw new Error(`Failed to store cookies: ${upsertError.message}`);
      }

      // Removed: console.log("   ✓ Cookies stored in database");

      await browser.close();

      const duration = Date.now() - startTime;

      return NextResponse.json({
        success: true,
        cookiesRefreshed: nypCookies.length,
        durationMs: duration,
        timestamp: new Date().toISOString(),
      });
    } catch (pageError) {
      await browser.close();
      throw pageError;
    }
  } catch (error) {
    const duration = Date.now() - startTime;

    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        component: "cookie-refresh",
        restaurant_id: "rosmalen",
      },
      extra: {
        durationMs: duration,
      },
    });

    console.error("Cookie refresh error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        durationMs: duration,
      },
      { status: 500 }
    );
  }
}
