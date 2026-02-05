import { z } from "zod";

/**
 * Runtime validation schemas for data types
 */

export const RestaurantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const KPIEntrySchema = z.object({
  restaurantId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dayName: z.string().min(1),
  weekNumber: z.number().int().positive(),

  // Revenue
  plannedRevenue: z.number().nonnegative(),
  grossRevenue: z.number().nonnegative(),
  netRevenue: z.number().nonnegative(),

  // Labour
  plannedLabourCost: z.number().nonnegative(),
  labourCost: z.number().nonnegative(),
  plannedLabourPct: z.number().nonnegative().nullable(),
  labourPct: z.number().nonnegative(),
  workedHours: z.number().nonnegative(),
  labourProductivity: z.number().nonnegative(),

  // Delivery
  deliveryRate30min: z.number().min(0).max(100),
  onTimeDeliveryMins: z.number().nonnegative(),
  makeTimeMins: z.number().nonnegative(),
  driveTimeMins: z.number().nonnegative(),

  // Orders
  orderCount: z.number().int().nonnegative(),
  avgOrderValue: z.number().nonnegative(),
  ordersPerRun: z.number().nonnegative(),

  // Meta
  cashDifference: z.number().nullable(),
  manager: z.string().min(1),
});

export const DateRangeDaysSchema = z.union([
  z.literal(7),
  z.literal(14),
  z.literal(28),
]);

export const KPISummarySchema = z.object({
  totalNetRevenue: z.number().nonnegative(),
  totalPlannedRevenue: z.number().nonnegative(),
  revenueVariance: z.number(),
  avgLabourPct: z.number().nonnegative(),
  avgPlannedLabourPct: z.number().nonnegative(),
  labourVariance: z.number(),
  totalOrders: z.number().int().nonnegative(),
  avgOrderValue: z.number().nonnegative(),
  avgLabourProductivity: z.number().nonnegative(),
});

export const ChartDataPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  netRevenue: z.number().nonnegative(),
  plannedRevenue: z.number().nonnegative(),
  labourCost: z.number().nonnegative(),
  plannedLabourCost: z.number().nonnegative(),
  labourPct: z.number().nonnegative(),
});

export const DeliveryDataPointSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deliveryRate30min: z.number().min(0).max(100),
  onTimeDeliveryMins: z.number().nonnegative(),
  makeTimeMins: z.number().nonnegative(),
  driveTimeMins: z.number().nonnegative(),
});
