import { cache } from "react";
import { addDays } from "date-fns";
import { getKPIRepository } from "@/lib/repositories";
import type {
  KPIEntry,
  KPISummary,
  ChartDataPoint,
  DeliveryDataPoint,
  DeliverySummary,
} from "@/lib/types";

/**
 * Shared cached entry fetcher — all service functions delegate here
 */
const getKPIEntriesInternal = async (start: Date, end: Date, restaurantId?: string): Promise<KPIEntry[]> => {
  const repository = getKPIRepository();
  const exclusiveEnd = addDays(end, 1);
  return repository.findByDateRange(start, exclusiveEnd, restaurantId);
};

/**
 * Cached entry fetcher keyed by ISO strings for proper deduplication.
 * React cache() uses referential equality — Date objects never match,
 * so we convert to strings for the cache key layer.
 */
const getKPIEntriesByKey = cache(
  async (startISO: string, endISO: string, restaurantId?: string): Promise<KPIEntry[]> => {
    return getKPIEntriesInternal(new Date(startISO), new Date(endISO), restaurantId);
  }
);

const getKPIEntries = (start: Date, end: Date, restaurantId?: string): Promise<KPIEntry[]> => {
  return getKPIEntriesByKey(start.toISOString(), end.toISOString(), restaurantId);
};

/**
 * Get KPI summary for a date range
 */
export const getKPISummary = cache(
  async (start: Date, end: Date, restaurantId?: string): Promise<KPISummary> => {
    try {
      const entries = await getKPIEntries(start, end, restaurantId);

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
      const totalFoodCost = entries.reduce((sum, e) => sum + e.foodCost, 0);
      const totalOrders = entries.reduce((sum, e) => sum + e.orderCount, 0);
      const totalHours = entries.reduce((sum, e) => sum + e.workedHours, 0);

      const avgLabourPct =
        totalNetRevenue > 0 ? (totalLabourCost / totalNetRevenue) * 100 : 0;
      const avgPlannedLabourPct =
        totalPlannedRevenue > 0
          ? (totalPlannedLabourCost / totalPlannedRevenue) * 100
          : 0;
      const avgFoodCostPct =
        totalNetRevenue > 0 ? (totalFoodCost / totalNetRevenue) * 100 : 0;

      const totalPrimeCost = totalFoodCost + totalLabourCost;
      const avgPrimeCostPct =
        totalNetRevenue > 0 ? (totalPrimeCost / totalNetRevenue) * 100 : 0;

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
        avgFoodCostPct,
        totalFoodCost,
        avgPrimeCostPct,
        totalPrimeCost,
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
 */
export const getChartData = cache(
  async (
    start: Date,
    end: Date,
    restaurantId?: string
  ): Promise<ChartDataPoint[]> => {
    try {
      const entries = await getKPIEntries(start, end, restaurantId);

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
 */
export const getDeliveryData = cache(
  async (
    start: Date,
    end: Date,
    restaurantId?: string
  ): Promise<DeliveryDataPoint[]> => {
    try {
      const entries = await getKPIEntries(start, end, restaurantId);

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

/**
 * Get aggregated delivery summary for a date range
 */
export const getDeliverySummary = cache(
  async (
    start: Date,
    end: Date,
    restaurantId?: string
  ): Promise<DeliverySummary> => {
    try {
      const entries = await getKPIEntries(start, end, restaurantId);

      const count = entries.length;
      if (count === 0) {
        return {
          avgDeliveryRate30min: 0,
          avgOnTimeDeliveryMins: 0,
          avgMakeTimeMins: 0,
          avgDriveTimeMins: 0,
          totalOrders: 0,
        };
      }

      const totalOrders = entries.reduce((sum, e) => sum + e.orderCount, 0);

      return {
        avgDeliveryRate30min:
          entries.reduce((sum, e) => sum + e.deliveryRate30min, 0) / count,
        avgOnTimeDeliveryMins:
          entries.reduce((sum, e) => sum + e.onTimeDeliveryMins, 0) / count,
        avgMakeTimeMins:
          entries.reduce((sum, e) => sum + e.makeTimeMins, 0) / count,
        avgDriveTimeMins:
          entries.reduce((sum, e) => sum + e.driveTimeMins, 0) / count,
        totalOrders,
      };
    } catch (error) {
      console.error("Failed to fetch delivery summary:", error);
      throw new Error("Unable to load delivery summary. Please try again.");
    }
  }
);
