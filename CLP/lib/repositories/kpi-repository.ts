import type { KPIEntry, Restaurant } from "@/lib/types";

/**
 * Repository interface for KPI data access
 * Abstracts the data source (seed data, Supabase, etc.)
 */
export interface KPIRepository {
  /**
   * Find KPI entries within a date range
   * @param start - Start date (inclusive)
   * @param end - End date (inclusive)
   * @param restaurantId - Optional restaurant filter
   * @returns Promise of KPI entries
   */
  findByDateRange(
    start: Date,
    end: Date,
    restaurantId?: string
  ): Promise<KPIEntry[]>;
}

/**
 * Repository interface for Restaurant data access
 */
export interface RestaurantRepository {
  /**
   * Find all restaurants
   * @returns Promise of all restaurants
   */
  findAll(): Promise<Restaurant[]>;

  /**
   * Find restaurant by ID
   * @param id - Restaurant ID
   * @returns Promise of restaurant or null if not found
   */
  findById(id: string): Promise<Restaurant | null>;
}
