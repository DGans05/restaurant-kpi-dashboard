import type { KPIRepository, RestaurantRepository } from "./kpi-repository";
import type { DeliveryRepository } from "./delivery-repository";
import {
  SeedKPIRepository,
  SeedRestaurantRepository,
} from "./seed-repository";
import {
  SupabaseKPIRepository,
  SupabaseRestaurantRepository,
} from "./supabase-repository";
import { ExcelDeliveryRepository } from "./excel-delivery-repository";

export * from './report-repository';
export * from './supabase-report-repository';

let kpiRepo: KPIRepository | null = null;
let restaurantRepo: RestaurantRepository | null = null;
let deliveryRepo: DeliveryRepository | null = null;

/**
 * Get KPI repository instance (lazy singleton)
 * Returns Supabase repository in production if configured, otherwise seed repository
 */
export function getKPIRepository(): KPIRepository {
  if (!kpiRepo) {
    kpiRepo = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new SupabaseKPIRepository()
      : new SeedKPIRepository();
  }
  return kpiRepo;
}

/**
 * Get Restaurant repository instance (lazy singleton)
 */
export function getRestaurantRepository(): RestaurantRepository {
  if (!restaurantRepo) {
    restaurantRepo = process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new SupabaseRestaurantRepository()
      : new SeedRestaurantRepository();
  }
  return restaurantRepo;
}

/**
 * Get Delivery repository instance (lazy singleton)
 */
export function getDeliveryRepository(): DeliveryRepository {
  if (!deliveryRepo) {
    const dataPath = process.env.EXCEL_DATA_PATH ?? "./data/rapportage";
    deliveryRepo = new ExcelDeliveryRepository(dataPath);
  }
  return deliveryRepo;
}
