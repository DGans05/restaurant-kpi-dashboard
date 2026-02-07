import { DeliveryOrder, DeliveryMonthSummary } from "@/lib/types";

/**
 * Repository interface for delivery data
 */
export interface DeliveryRepository {
  /**
   * Get available months with delivery data
   * @returns Array of month strings in YYYY-MM format, sorted chronologically
   */
  getAvailableMonths(): Promise<string[]>;

  /**
   * Get monthly summary for delivery metrics
   * @param month Month string in YYYY-MM format
   * @returns Aggregated delivery summary for the month
   */
  getMonthSummary(month: string): Promise<DeliveryMonthSummary>;

  /**
   * Get longest wait times for a specific month
   * @param month Month string in YYYY-MM format
   * @param limit Maximum number of orders to return (default 30)
   * @returns Array of delivery orders sorted by waiting time (descending)
   */
  getLongestWaitTimes(
    month: string,
    limit?: number
  ): Promise<DeliveryOrder[]>;
}
