import { DeliveryRepository } from "./delivery-repository";
import { DeliveryOrder, DeliveryMonthSummary } from "@/lib/types";
import {
  parseAllExcelFiles,
  groupOrdersByMonth,
} from "@/lib/parsers/excel-parser";

/**
 * Excel-based implementation of DeliveryRepository
 * Parses Excel files once at initialization and caches data in memory
 */
export class ExcelDeliveryRepository implements DeliveryRepository {
  private ordersByMonth: Map<string, DeliveryOrder[]>;
  private summariesByMonth: Map<string, DeliveryMonthSummary>;

  constructor(excelDirectoryPath: string) {
    // Parse all Excel files once
    const allOrders = parseAllExcelFiles(excelDirectoryPath);

    // Group by month
    this.ordersByMonth = groupOrdersByMonth(allOrders);

    // Pre-calculate monthly summaries
    this.summariesByMonth = new Map();
    for (const [month, orders] of this.ordersByMonth.entries()) {
      this.summariesByMonth.set(month, this.calculateMonthSummary(month, orders));
    }

    console.log(
      `ExcelDeliveryRepository initialized with ${allOrders.length} orders across ${this.ordersByMonth.size} months`
    );
  }

  async getAvailableMonths(): Promise<string[]> {
    // Return months sorted chronologically
    return Array.from(this.ordersByMonth.keys()).sort();
  }

  async getMonthSummary(month: string): Promise<DeliveryMonthSummary> {
    const summary = this.summariesByMonth.get(month);
    if (!summary) {
      // Return empty summary for months with no data
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
    return { ...summary }; // Return copy for immutability
  }

  async getLongestWaitTimes(
    month: string,
    limit = 30
  ): Promise<DeliveryOrder[]> {
    const orders = this.ordersByMonth.get(month) || [];
    // Orders are already sorted by waiting time (descending) in groupOrdersByMonth
    return orders.slice(0, limit).map((order) => ({ ...order })); // Return copies
  }

  /**
   * Calculate aggregated metrics for a month
   * Note: Excel data doesn't have all the metrics we need (deliveryRate30min, makeTime, driveTime)
   * For now, we'll use waiting time as a proxy and set others to 0
   * This can be enhanced later when we have more detailed data
   */
  private calculateMonthSummary(
    month: string,
    orders: DeliveryOrder[]
  ): DeliveryMonthSummary {
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

    // Calculate average waiting time (use as OTD proxy)
    const totalWaitingTime = orders.reduce(
      (sum, order) => sum + order.waitingTimeMins,
      0
    );
    const avgWaitingTime = totalWaitingTime / orders.length;

    // Calculate percentage delivered within 30 minutes
    const ordersWithin30min = orders.filter(
      (order) => order.waitingTimeMins <= 30
    ).length;
    const deliveryRate30min = (ordersWithin30min / orders.length) * 100;

    // Get top 30 longest wait times
    const longestWaitTimes = orders.slice(0, 30);

    return {
      month,
      avgDeliveryRate30min: Math.round(deliveryRate30min * 10) / 10, // Round to 1 decimal
      avgOnTimeDeliveryMins: Math.round(avgWaitingTime * 10) / 10,
      avgMakeTimeMins: 0, // Not available in Excel data
      avgDriveTimeMins: 0, // Not available in Excel data
      totalOrders: orders.length,
      longestWaitTimes,
    };
  }
}
