import { cache } from "react";
import { getDeliveryRepository } from "@/lib/repositories";
import { DeliveryMonthSummary, DeliveryOrder, MonthOption } from "@/lib/types";
import { MonthFilterSchema } from "@/lib/schemas";
import { format, parse } from "date-fns";

/**
 * Get available months with delivery data
 * Cached to avoid repeated repository calls
 */
export const getAvailableMonths = cache(
  async (): Promise<MonthOption[]> => {
    try {
      const repository = getDeliveryRepository();
      const months = await repository.getAvailableMonths();

      // Convert YYYY-MM to formatted month options
      return months.map((month) => {
        const date = parse(month, "yyyy-MM", new Date());
        return {
          label: format(date, "MMM yyyy"), // "Feb 2026"
          value: month, // "2026-02"
        };
      });
    } catch (error) {
      console.error("Failed to get available months:", error);
      return [];
    }
  }
);

/**
 * Get monthly summary for delivery metrics
 * Cached to avoid repeated calculations
 * @param month Month string in YYYY-MM format
 */
export const getDeliveryMonthSummary = cache(
  async (month: string): Promise<DeliveryMonthSummary> => {
    try {
      // Validate month format
      const validatedMonth = MonthFilterSchema.parse(month);

      const repository = getDeliveryRepository();
      return await repository.getMonthSummary(validatedMonth);
    } catch (error) {
      console.error(`Failed to get delivery summary for month ${month}:`, error);

      // Return empty summary on error
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
  }
);

/**
 * Get longest wait times for a specific month
 * Cached to avoid repeated queries
 * @param month Month string in YYYY-MM format
 * @param limit Maximum number of orders to return (default 30)
 */
export const getLongestWaitTimes = cache(
  async (month: string, limit = 30): Promise<DeliveryOrder[]> => {
    try {
      // Validate month format
      const validatedMonth = MonthFilterSchema.parse(month);

      const repository = getDeliveryRepository();
      return await repository.getLongestWaitTimes(validatedMonth, limit);
    } catch (error) {
      console.error(
        `Failed to get longest wait times for month ${month}:`,
        error
      );
      return [];
    }
  }
);
