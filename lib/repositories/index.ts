import type { KPIRepository, RestaurantRepository } from "./kpi-repository";
import type { DeliveryRepository } from "./delivery-repository";
import type {
  UserManagementRepository,
  RestaurantManagementRepository,
  AuditLogRepository,
  SystemSettingsRepository,
} from "./admin-repository";
import {
  SeedKPIRepository,
  SeedRestaurantRepository,
} from "./seed-repository";
import {
  SupabaseKPIRepository,
  SupabaseRestaurantRepository,
} from "./supabase-repository";
import { ExcelDeliveryRepository } from "./excel-delivery-repository";
import { SupabaseDeliveryRepository } from "./supabase-delivery-repository";
import {
  SupabaseUserManagementRepository,
  SupabaseRestaurantManagementRepository,
  SupabaseAuditLogRepository,
  SupabaseSystemSettingsRepository,
} from "./supabase-admin-repository";

export * from './report-repository';
export * from './supabase-report-repository';
export * from './admin-repository';

let kpiRepo: KPIRepository | null = null;
let restaurantRepo: RestaurantRepository | null = null;
let deliveryRepo: DeliveryRepository | null = null;
let userManagementRepo: UserManagementRepository | null = null;
let restaurantManagementRepo: RestaurantManagementRepository | null = null;
let auditLogRepo: AuditLogRepository | null = null;
let systemSettingsRepo: SystemSettingsRepository | null = null;

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
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      deliveryRepo = new SupabaseDeliveryRepository();
    } else {
      const dataPath = process.env.EXCEL_DATA_PATH ?? "./data/rapportage";
      deliveryRepo = new ExcelDeliveryRepository(dataPath);
    }
  }
  return deliveryRepo;
}

/**
 * Get User Management repository instance (lazy singleton)
 * Always uses Supabase (admin operations require database)
 */
export function getUserManagementRepository(): UserManagementRepository {
  if (!userManagementRepo) {
    userManagementRepo = new SupabaseUserManagementRepository();
  }
  return userManagementRepo;
}

/**
 * Get Restaurant Management repository instance (lazy singleton)
 * Always uses Supabase (admin operations require database)
 */
export function getRestaurantManagementRepository(): RestaurantManagementRepository {
  if (!restaurantManagementRepo) {
    restaurantManagementRepo = new SupabaseRestaurantManagementRepository();
  }
  return restaurantManagementRepo;
}

/**
 * Get Audit Log repository instance (lazy singleton)
 * Always uses Supabase (admin operations require database)
 */
export function getAuditLogRepository(): AuditLogRepository {
  if (!auditLogRepo) {
    auditLogRepo = new SupabaseAuditLogRepository();
  }
  return auditLogRepo;
}

/**
 * Get System Settings repository instance (lazy singleton)
 * Always uses Supabase (admin operations require database)
 */
export function getSystemSettingsRepository(): SystemSettingsRepository {
  if (!systemSettingsRepo) {
    systemSettingsRepo = new SupabaseSystemSettingsRepository();
  }
  return systemSettingsRepo;
}
