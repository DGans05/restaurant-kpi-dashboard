import { cache } from "react";
import { subDays, addDays } from "date-fns";
import { getKPIRepository } from "@/lib/repositories";
import { DateRangeDaysSchema } from "@/lib/schemas";
import type {
  KPISummary,
  ChartDataPoint,
  DeliveryDataPoint,
  DateRangeDays,
} from "@/lib/types";

/** Dataset ends on 2025-02-28 — anchor all filters here */
const DATASET_END = new Date("2025-02-28T00:00:00.000Z");

/**
 * Get KPI summary for a date range
 * @param days - Number of days to look back (7, 14, or 28)
 * @param restaurantId - Optional restaurant filter
 * @returns Promise of aggregated KPI summary
 */
export const getKPISummary = cache(
  async (days: DateRangeDays, restaurantId?: string): Promise<KPISummary> => {
    // Validate input
    const validatedDays = DateRangeDaysSchema.parse(days);

    try {
      const repository = getKPIRepository();

      // Calculate date range (inclusive)
      const end = addDays(DATASET_END, 1); // exclusive upper bound
      const start = subDays(DATASET_END, validatedDays - 1);

      const entries = await repository.findByDateRange(
        start,
        end,
        restaurantId
      );

      // Aggregate metrics
      const totalNetRevenue = entries.reduce((sum, e) => sum + e.netRevenue, 0);
      const totalPlannedRevenue = entries.reduce(
        (sum, e) => sum + e.plannedRevenue,
        0
      );
      const totalLabourCost = entries.reduce((sum, e) => sum + e.labourCost, 0);
      const totalPlannedLabourCost = entries.reduce(
        (sum, e) => sum + e.plannedLabourCost,
        0
      );
      const totalOrders = entries.reduce((sum, e) => sum + e.orderCount, 0);
      const totalHours = entries.reduce((sum, e) => sum + e.workedHours, 0);

      const avgLabourPct =
        totalNetRevenue > 0 ? (totalLabourCost / totalNetRevenue) * 100 : 0;
      const avgPlannedLabourPct =
        totalPlannedRevenue > 0
          ? (totalPlannedLabourCost / totalPlannedRevenue) * 100
          : 0;
      const avgOrderValue =
        totalOrders > 0 ? totalNetRevenue / totalOrders : 0;
      const avgLabourProductivity =
        totalHours > 0 ? totalNetRevenue / totalHours : 0;

      const revenueVariance =
        totalPlannedRevenue > 0
          ? ((totalNetRevenue - totalPlannedRevenue) / totalPlannedRevenue) *
            100
          : 0;

      const labourVariance = avgLabourPct - avgPlannedLabourPct;

      return {
        totalNetRevenue,
        totalPlannedRevenue,
        revenueVariance,
        avgLabourPct,
        avgPlannedLabourPct,
        labourVariance,
        totalOrders,
        avgOrderValue,
        avgLabourProductivity,
      };
    } catch (error) {
      console.error("Failed to fetch KPI summary:", error);
      throw new Error("Unable to load KPI summary. Please try again.");
    }
  }
);

/**
 * Get chart data for a date range
 * @param days - Number of days to look back (7, 14, or 28)
 * @param restaurantId - Optional restaurant filter
 * @returns Promise of chart data points
 */
export const getChartData = cache(
  async (
    days: DateRangeDays,
    restaurantId?: string
  ): Promise<ChartDataPoint[]> => {
    // Validate input
    const validatedDays = DateRangeDaysSchema.parse(days);

    try {
      const repository = getKPIRepository();

      // Calculate date range (inclusive)
      const end = addDays(DATASET_END, 1); // exclusive upper bound
      const start = subDays(DATASET_END, validatedDays - 1);

      const entries = await repository.findByDateRange(
        start,
        end,
        restaurantId
      );

      // Map to chart data (immutable)
      return entries.map((e) => ({
        date: e.date,
        netRevenue: e.netRevenue,
        plannedRevenue: e.plannedRevenue,
        labourCost: e.labourCost,
        plannedLabourCost: e.plannedLabourCost,
        labourPct: e.labourPct,
      }));
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
      throw new Error("Unable to load chart data. Please try again.");
    }
  }
);

/**
 * Get delivery performance data for a date range
 * @param days - Number of days to look back (7, 14, or 28)
 * @param restaurantId - Optional restaurant filter
 * @returns Promise of delivery data points
 */
export const getDeliveryData = cache(
  async (
    days: DateRangeDays,
    restaurantId?: string
  ): Promise<DeliveryDataPoint[]> => {
    // Validate input
    const validatedDays = DateRangeDaysSchema.parse(days);

    try {
      const repository = getKPIRepository();

      // Calculate date range (inclusive)
      const end = addDays(DATASET_END, 1); // exclusive upper bound
      const start = subDays(DATASET_END, validatedDays - 1);

      const entries = await repository.findByDateRange(
        start,
        end,
        restaurantId
      );

      // Map to delivery data (immutable)
      return entries.map((e) => ({
        date: e.date,
        deliveryRate30min: e.deliveryRate30min,
        onTimeDeliveryMins: e.onTimeDeliveryMins,
        makeTimeMins: e.makeTimeMins,
        driveTimeMins: e.driveTimeMins,
      }));
    } catch (error) {
      console.error("Failed to fetch delivery data:", error);
      throw new Error("Unable to load delivery data. Please try again.");
    }
  }
);
