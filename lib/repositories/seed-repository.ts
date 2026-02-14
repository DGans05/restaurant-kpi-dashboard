import { parseISO, isAfter, isBefore, isEqual } from "date-fns";
import { getRosmalenData, RESTAURANTS } from "@/lib/data/rosmalen-data";
import type { KPIEntry, Restaurant } from "@/lib/types";
import type { KPIRepository, RestaurantRepository } from "./kpi-repository";

/**
 * Seed data implementation of KPIRepository
 * Uses in-memory data for development/testing
 */
export class SeedKPIRepository implements KPIRepository {
  async findByDateRange(
    start: Date,
    end: Date,
    restaurantId?: string
  ): Promise<KPIEntry[]> {
    const entries = getRosmalenData();

    return entries.filter((entry) => {
      const entryDate = parseISO(entry.date);

      // Check date range (inclusive)
      const isInRange =
        (isAfter(entryDate, start) || isEqual(entryDate, start)) &&
        (isBefore(entryDate, end) || isEqual(entryDate, end));

      // Check restaurant filter if provided
      const matchesRestaurant = restaurantId
        ? entry.restaurantId === restaurantId
        : true;

      return isInRange && matchesRestaurant;
    });
  }
}

/**
 * Seed data implementation of RestaurantRepository
 */
export class SeedRestaurantRepository implements RestaurantRepository {
  async findAll(): Promise<Restaurant[]> {
    return [...RESTAURANTS];
  }

  async findById(id: string): Promise<Restaurant | null> {
    const restaurant = RESTAURANTS.find((r) => r.id === id);
    return restaurant ? { ...restaurant } : null;
  }
}
