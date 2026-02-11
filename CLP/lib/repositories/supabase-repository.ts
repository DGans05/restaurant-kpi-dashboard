import { createClient } from "@/lib/supabase/server";
import type { KPIEntry, Restaurant } from "@/lib/types";
import type { KPIRepository, RestaurantRepository } from "./kpi-repository";

/**
 * Supabase implementation of KPIRepository
 * Maps between database schema (snake_case) and application types (camelCase)
 */
export class SupabaseKPIRepository implements KPIRepository {
  async findByDateRange(
    start: Date,
    end: Date,
    restaurantId?: string
  ): Promise<KPIEntry[]> {
    const supabase = await createClient();

    let query = supabase
      .from("kpi_entries")
      .select("*")
      .gte("date", start.toISOString().split("T")[0])
      .lte("date", end.toISOString().split("T")[0])
      .order("date", { ascending: true });

    if (restaurantId) {
      query = query.eq("restaurant_id", restaurantId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch KPI entries: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    // Map database rows to KPIEntry type
    return data.map((row) => ({
      restaurantId: row.restaurant_id,
      date: row.date,
      dayName: row.day_name,
      weekNumber: row.week_number,
      plannedRevenue: Number(row.planned_revenue),
      grossRevenue: Number(row.gross_revenue),
      netRevenue: Number(row.net_revenue),
      plannedLabourCost: Number(row.planned_labour_cost),
      labourCost: Number(row.labour_cost),
      plannedLabourPct: row.planned_labour_pct
        ? Number(row.planned_labour_pct)
        : null,
      labourPct: Number(row.labour_pct),
      workedHours: Number(row.worked_hours),
      labourProductivity: Number(row.labour_productivity),
      foodCost: Number(row.food_cost || 0),
      foodCostPct: Number(row.food_cost_pct || 0),
      deliveryRate30min: Number(row.delivery_rate_30min),
      deliveryRate20min: Number(row.delivery_rate_20min || 0),
      onTimeDeliveryMins: Number(row.on_time_delivery_mins),
      makeTimeMins: Number(row.make_time_mins),
      driveTimeMins: Number(row.drive_time_mins),
      orderCount: row.order_count,
      avgOrderValue: Number(row.avg_order_value),
      ordersPerRun: Number(row.orders_per_run),
      burgerKitchenRevenue: Number(row.burger_kitchen_revenue || 0),
      cashDifference: row.cash_difference ? Number(row.cash_difference) : null,
      manager: row.manager,
    }));
  }
}

/**
 * Supabase implementation of RestaurantRepository
 */
export class SupabaseRestaurantRepository implements RestaurantRepository {
  async findAll(): Promise<Restaurant[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch restaurants: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  async findById(id: string): Promise<Restaurant | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw new Error(`Failed to fetch restaurant: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
