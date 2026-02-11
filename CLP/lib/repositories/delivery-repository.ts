import { DeliveryOrder, DeliveryMonthSummary } from "@/lib/types";

/**
 * Repository interface for delivery data
 */
export interface DeliveryRepository {
  getAvailableMonths(restaurantId?: string): Promise<string[]>;
  getMonthSummary(month: string, restaurantId?: string): Promise<DeliveryMonthSummary>;
  getLongestWaitTimes(month: string, limit?: number, restaurantId?: string): Promise<DeliveryOrder[]>;
}
