import { cache } from "react";
import { getRestaurantRepository } from "@/lib/repositories";
import type { Restaurant } from "@/lib/types";

/**
 * Get all restaurants
 * @returns Promise of all restaurants
 */
export const getAllRestaurants = cache(async (): Promise<Restaurant[]> => {
  try {
    const repository = getRestaurantRepository();
    return await repository.findAll();
  } catch (error) {
    console.error("Failed to fetch restaurants:", error);
    throw new Error("Unable to load restaurants. Please try again.");
  }
});

/**
 * Get restaurant by ID
 * @param id - Restaurant ID
 * @returns Promise of restaurant or null if not found
 */
export const getRestaurantById = cache(
  async (id: string): Promise<Restaurant | null> => {
  try {
    const repository = getRestaurantRepository();
    return await repository.findById(id);
  } catch (error) {
    console.error("Failed to fetch restaurant:", error);
    throw new Error("Unable to load restaurant. Please try again.");
  }
});
