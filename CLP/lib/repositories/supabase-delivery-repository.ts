import { createClient } from "@/lib/supabase/server";
import type { DeliveryRepository } from "./delivery-repository";
import type { DeliveryOrder, DeliveryMonthSummary } from "@/lib/types";

/**
 * Supabase-backed implementation of DeliveryRepository.
 * Reads from the `delivery_orders` table.
 */
export class SupabaseDeliveryRepository implements DeliveryRepository {
  async getAvailableMonths(restaurantId?: string): Promise<string[]> {
    const supabase = await createClient();

    let query = supabase
      .from("delivery_orders")
      .select("date");

    if (restaurantId) {
      query = query.eq("restaurant_id", restaurantId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Failed to fetch available months:", error);
      return [];
    }

    // Extract unique months from dates
    const months = new Set<string>();
    for (const row of data) {
      const dateStr = String(row.date);
      months.add(dateStr.substring(0, 7));
    }

    return Array.from(months).sort();
  }

  async getMonthSummary(month: string, restaurantId?: string): Promise<DeliveryMonthSummary> {
    const orders = await this.getOrdersForMonth(month, restaurantId);

    if (orders.length === 0) {
      return {
        month,
        avgDeliveryRate30min: 0,
        avgOnTimeDeliveryMins: 0,
        avgMakeTimeMins: 0,
        avgDriveTimeMins: 0,
        totalOrders: 0,
        longestWaitTimes: [],
      };
    }

    const totalWaitingTime = orders.reduce((sum, o) => sum + o.waitingTimeMins, 0);
    const avgWaitingTime = totalWaitingTime / orders.length;
    const ordersWithin30min = orders.filter((o) => o.waitingTimeMins <= 30).length;
    const deliveryRate30min = (ordersWithin30min / orders.length) * 100;

    // Top 30 sorted by waiting time desc
    const longestWaitTimes = [...orders]
      .sort((a, b) => b.waitingTimeMins - a.waitingTimeMins)
      .slice(0, 30);

    return {
      month,
      avgDeliveryRate30min: Math.round(deliveryRate30min * 10) / 10,
      avgOnTimeDeliveryMins: Math.round(avgWaitingTime * 10) / 10,
      avgMakeTimeMins: 0,
      avgDriveTimeMins: 0,
      totalOrders: orders.length,
      longestWaitTimes,
    };
  }

  async getLongestWaitTimes(
    month: string,
    limit = 30,
    restaurantId?: string
  ): Promise<DeliveryOrder[]> {
    const supabase = await createClient();

    const startDate = `${month}-01`;
    // End of month: next month first day
    const [year, mon] = month.split("-").map(Number);
    const nextMonth = mon === 12 ? `${year + 1}-01-01` : `${year}-${String(mon + 1).padStart(2, "0")}-01`;

    let query = supabase
      .from("delivery_orders")
      .select("*")
      .gte("date", startDate)
      .lt("date", nextMonth)
      .order("waiting_time_mins", { ascending: false })
      .limit(limit);

    if (restaurantId) {
      query = query.eq("restaurant_id", restaurantId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Failed to fetch longest wait times:", error);
      return [];
    }

    return (data || []).map(mapRowToDeliveryOrder);
  }

  private async getOrdersForMonth(month: string, restaurantId?: string): Promise<DeliveryOrder[]> {
    const supabase = await createClient();

    const startDate = `${month}-01`;
    const [year, mon] = month.split("-").map(Number);
    const nextMonth = mon === 12 ? `${year + 1}-01-01` : `${year}-${String(mon + 1).padStart(2, "0")}-01`;

    let query = supabase
      .from("delivery_orders")
      .select("*")
      .gte("date", startDate)
      .lt("date", nextMonth);

    if (restaurantId) {
      query = query.eq("restaurant_id", restaurantId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Failed to fetch delivery orders:", error);
      return [];
    }

    return (data || []).map(mapRowToDeliveryOrder);
  }
}

function mapRowToDeliveryOrder(row: Record<string, unknown>): DeliveryOrder {
  return {
    orderNumber: String(row.order_number),
    phoneNumber: String(row.phone_number),
    waitingTimeMins: Number(row.waiting_time_mins),
    orderPlaced: row.order_placed ? new Date(String(row.order_placed)) : new Date(),
    completed: row.completed ? new Date(String(row.completed)) : null,
    driverName: row.driver_name ? String(row.driver_name) : null,
    address: row.address ? String(row.address) : null,
    date: String(row.date),
  };
}
