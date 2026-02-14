import { cache } from "react";
import { addDays } from "date-fns";
import { getKPIRepository } from "@/lib/repositories";
import type { KPIEntry, BezorgSummary, BezorgChartDataPoint } from "@/lib/types";

const getBezorgEntries = cache(
  async (startISO: string, endISO: string, restaurantId?: string): Promise<KPIEntry[]> => {
    const repository = getKPIRepository();
    const exclusiveEnd = addDays(new Date(endISO), 1);
    return repository.findByDateRange(new Date(startISO), exclusiveEnd, restaurantId);
  }
);

export const getBezorgSummary = cache(
  async (start: Date, end: Date, restaurantId?: string): Promise<BezorgSummary> => {
    try {
      const entries = await getBezorgEntries(start.toISOString(), end.toISOString(), restaurantId);

      const count = entries.length;
      if (count === 0) {
        return {
          avgDeliveryRate30min: 0,
          avgDeliveryRate20min: 0,
          avgOnTimeDeliveryMins: 0,
          avgMakeTimeMins: 0,
          avgDriveTimeMins: 0,
          avgOrdersPerRun: 0,
          totalOrders: 0,
        };
      }

      return {
        avgDeliveryRate30min:
          entries.reduce((sum, e) => sum + e.deliveryRate30min, 0) / count,
        avgDeliveryRate20min:
          entries.reduce((sum, e) => sum + e.deliveryRate20min, 0) / count,
        avgOnTimeDeliveryMins:
          entries.reduce((sum, e) => sum + e.onTimeDeliveryMins, 0) / count,
        avgMakeTimeMins:
          entries.reduce((sum, e) => sum + e.makeTimeMins, 0) / count,
        avgDriveTimeMins:
          entries.reduce((sum, e) => sum + e.driveTimeMins, 0) / count,
        avgOrdersPerRun:
          entries.reduce((sum, e) => sum + e.ordersPerRun, 0) / count,
        totalOrders: entries.reduce((sum, e) => sum + e.orderCount, 0),
      };
    } catch (error) {
      console.error("Failed to fetch bezorg summary:", error);
      throw new Error("Unable to load bezorg summary. Please try again.");
    }
  }
);

export const getBezorgChartData = cache(
  async (start: Date, end: Date, restaurantId?: string): Promise<BezorgChartDataPoint[]> => {
    try {
      const entries = await getBezorgEntries(start.toISOString(), end.toISOString(), restaurantId);

      return entries.map((e) => ({
        date: e.date,
        deliveryRate30min: e.deliveryRate30min,
        deliveryRate20min: e.deliveryRate20min,
        onTimeDeliveryMins: e.onTimeDeliveryMins,
        makeTimeMins: e.makeTimeMins,
        driveTimeMins: e.driveTimeMins,
        ordersPerRun: e.ordersPerRun,
      }));
    } catch (error) {
      console.error("Failed to fetch bezorg chart data:", error);
      throw new Error("Unable to load bezorg chart data. Please try again.");
    }
  }
);
