import type { KPIRepository, RestaurantRepository } from "./kpi-repository";
import {
  SeedKPIRepository,
  SeedRestaurantRepository,
} from "./seed-repository";
import {
  SupabaseKPIRepository,
  SupabaseRestaurantRepository,
} from "./supabase-repository";

/**
 * Factory function to get KPI repository instance
 * Returns Supabase repository in production if configured, otherwise seed repository
 */
export function getKPIRepository(): KPIRepository {
  const useSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NODE_ENV === "production";

  if (useSupabase) {
    return new SupabaseKPIRepository();
  }

  return new SeedKPIRepository();
}

/**
 * Factory function to get Restaurant repository instance
 * Returns Supabase repository in production if configured, otherwise seed repository
 */
export function getRestaurantRepository(): RestaurantRepository {
  const useSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NODE_ENV === "production";

  if (useSupabase) {
    return new SupabaseRestaurantRepository();
  }

  return new SeedRestaurantRepository();
}
