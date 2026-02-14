#!/usr/bin/env tsx
/**
 * Seed Supabase database with initial data
 * Usage: tsx scripts/seed-supabase.ts
 */

import { createClient } from "@supabase/supabase-js";
import { getRosmalenData, RESTAURANTS } from "../lib/data/rosmalen-data";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Missing Supabase environment variables");
  console.error("Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🌱 Starting Supabase seed...\n");

  // 1. Seed restaurants
  console.log("📍 Seeding restaurants...");
  const { error: restaurantsError } = await supabase
    .from("restaurants")
    .upsert(
      RESTAURANTS.map((r) => ({
        id: r.id,
        name: r.name,
      })),
      { onConflict: "id" }
    );

  if (restaurantsError) {
    console.error("❌ Failed to seed restaurants:", restaurantsError);
    process.exit(1);
  }
  console.log(`✅ Seeded ${RESTAURANTS.length} restaurants\n`);

  // 2. Seed KPI entries
  console.log("📊 Seeding KPI entries...");
  const entries = getRosmalenData();

  // Insert in batches of 100 to avoid payload limits
  const batchSize = 100;
  for (let i = 0; i < entries.length; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);

    const { error: kpiError } = await supabase.from("kpi_entries").upsert(
      batch.map((e) => ({
        restaurant_id: e.restaurantId,
        date: e.date,
        day_name: e.dayName,
        week_number: e.weekNumber,
        planned_revenue: e.plannedRevenue,
        gross_revenue: e.grossRevenue,
        net_revenue: e.netRevenue,
        planned_labour_cost: e.plannedLabourCost,
        labour_cost: e.labourCost,
        planned_labour_pct: e.plannedLabourPct,
        labour_pct: e.labourPct,
        worked_hours: e.workedHours,
        labour_productivity: e.labourProductivity,
        delivery_rate_30min: e.deliveryRate30min,
        on_time_delivery_mins: e.onTimeDeliveryMins,
        make_time_mins: e.makeTimeMins,
        drive_time_mins: e.driveTimeMins,
        order_count: e.orderCount,
        avg_order_value: e.avgOrderValue,
        orders_per_run: e.ordersPerRun,
        cash_difference: e.cashDifference,
        manager: e.manager,
      })),
      { onConflict: "restaurant_id,date" }
    );

    if (kpiError) {
      console.error(`❌ Failed to seed KPI entries (batch ${i / batchSize + 1}):`, kpiError);
      process.exit(1);
    }

    console.log(`  ✓ Seeded batch ${i / batchSize + 1} (${batch.length} entries)`);
  }

  console.log(`\n✅ Seeded ${entries.length} KPI entries\n`);

  // 3. Verify counts
  console.log("🔍 Verifying data...");
  const { count: restaurantCount } = await supabase
    .from("restaurants")
    .select("*", { count: "exact", head: true });

  const { count: kpiCount } = await supabase
    .from("kpi_entries")
    .select("*", { count: "exact", head: true });

  console.log(`📊 Restaurants: ${restaurantCount}`);
  console.log(`📊 KPI Entries: ${kpiCount}`);

  console.log("\n✨ Seed complete!");
}

seed().catch((error) => {
  console.error("❌ Seed failed:", error);
  process.exit(1);
});
