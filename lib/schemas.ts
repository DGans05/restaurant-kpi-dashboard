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
  burgerKitchenRevenue: z.number().nonnegative(),

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

  // Food Cost (COGS)
  foodCost: z.number().nonnegative(),
  foodCostPct: z.number().nonnegative(),

  // Orders
  orderCount: z.number().int().nonnegative(),
  avgOrderValue: z.number().nonnegative(),
  ordersPerRun: z.number().nonnegative(),

  // Meta
  cashDifference: z.number().nullable(),
  manager: z.string().min(1),
});

export const PeriodViewSchema = z.enum(["week", "month"]);

export const ISOWeekSchema = z.string().regex(/^\d{4}-W\d{2}$/);

export const ISOMonthSchema = z.string().regex(/^\d{4}-\d{2}$/);

export const KPISummarySchema = z.object({
  totalNetRevenue: z.number().nonnegative(),
  totalPlannedRevenue: z.number().nonnegative(),
  revenueVariance: z.number(),
  avgLabourPct: z.number().nonnegative(),
  avgPlannedLabourPct: z.number().nonnegative(),
  labourVariance: z.number(),
  avgFoodCostPct: z.number().nonnegative(),
  totalFoodCost: z.number().nonnegative(),
  avgPrimeCostPct: z.number().nonnegative(),
  totalPrimeCost: z.number().nonnegative(),
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

export const DeliveryOrderSchema = z.object({
  orderNumber: z.string().min(1),
  phoneNumber: z.string().min(1),
  waitingTimeMins: z.number().nonnegative(),
  orderPlaced: z.date(),
  completed: z.date().nullable(),
  driverName: z.string().nullable(),
  address: z.string().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const MonthFilterSchema = z.string().regex(/^\d{4}-\d{2}$/);

export const ReportTypeSchema = z.enum([
  'OPERATIONAL',
  'TIME_KEEPING',
  'MANUAL_DISCOUNT',
  'CANCELLED_ORDERS',
  'LABOUR',
  'TIMEKEEPING_SUMMARY',
  'ZIPCODE_AREA_DELIVERY',
  'ORDER_BY_HOURS',
  'COUPON_DISCOUNT',
  'USER_COMMENTS',
  'LABOUR_EMPLOYEE',
  'LOCAL_CUSTOMER_DATA',
  'VARIANCE',
  'STORE_ITEMS_SOLD',
  'INVENTORY_IDEAL_USAGE',
  'TIP',
  'ISSUED_CLIENT_CREDIT',
  'ISSUED_CLIENT_BALANCE',
  'EXPENSES',
  'INVENTORY_DELIVERY',
  'INVENTORY_LOSS',
  'INVENTORY_RETURNS',
  'CASH_DRAWER_AUDIT',
  'INVENTORY_DAILY_COUNT',
  'SERVICE',
  'DAILY_SALES',
  'COUPON_ANALYSIS',
  'VARIANCE_PER_STOCK_PRODUCT',
  'DRIVER_REPORT',
  'PAYMENT_METHOD',
]);

export const UploadStatusSchema = z.enum(['uploaded', 'parsing', 'parsed', 'error']);

export const ReportSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string(),
  reportType: ReportTypeSchema,
  reportName: z.string(),
  reportPeriod: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  filePath: z.string().nullable(),
  fileSizeBytes: z.number().int().positive().nullable(),
  uploadStatus: UploadStatusSchema,
  uploadError: z.string().nullable(),
  uploadedAt: z.date(),
  parsedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CreateReportDtoSchema = z.object({
  restaurantId: z.string(),
  reportType: ReportTypeSchema,
  reportName: z.string(),
  reportPeriod: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  filePath: z.string().optional(),
  fileSizeBytes: z.number().int().positive().optional(),
});

export const TargetSchema = z.object({
  id: z.string().uuid(),
  restaurantId: z.string(),
  metric: z.string(),
  targetValue: z.number(),
  warningThreshold: z.number().nullable(),
  dangerThreshold: z.number().nullable(),
  periodType: z.enum(['daily', 'weekly', 'monthly']),
});

export const UserRoleSchema = z.enum(['owner', 'manager', 'viewer'])

export const LoginSchema = z.object({
  email: z.string().email('Ongeldig e-mailadres'),
  password: z.string().min(6, 'Wachtwoord moet minimaal 6 tekens bevatten'),
})

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  restaurantId: z.string(),
  role: UserRoleSchema,
  displayName: z.string().nullable(),
  isAdmin: z.boolean(),
  deletedAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const BulkPlannedValuesEntrySchema = z.object({
  restaurantId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  plannedRevenue: z.number().positive(),
  plannedLabourCost: z.number().positive(),
});

export const BulkPlannedValuesSchema = z.object({
  restaurantId: z.string().min(1),
  entries: z.array(BulkPlannedValuesEntrySchema).min(1).max(31),
})

// Admin Management Schemas

export const AuditLogActionSchema = z.enum(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS'])

export const AuditLogSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  userEmail: z.string().nullable(),
  action: AuditLogActionSchema,
  resourceType: z.string(),
  resourceId: z.string().nullable(),
  oldValues: z.record(z.string(), z.unknown()).nullable(),
  newValues: z.record(z.string(), z.unknown()).nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.coerce.date(),
})

export const SystemSettingCategorySchema = z.enum(['general', 'email', 'security', 'features'])

export const SystemSettingSchema = z.object({
  id: z.string().uuid(),
  key: z.string().min(1),
  value: z.unknown(),
  category: SystemSettingCategorySchema,
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export const AuditLogFiltersSchema = z.object({
  userId: z.string().uuid().optional(),
  resourceType: z.string().optional(),
  action: AuditLogActionSchema.optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  limit: z.number().int().positive().max(1000).optional(),
  offset: z.number().int().nonnegative().optional(),
})

export const CreateUserProfileDtoSchema = z.object({
  restaurantId: z.string().min(1),
  role: UserRoleSchema,
  displayName: z.string().nullable(),
  isAdmin: z.boolean().optional(),
})

export const UpdateUserProfileDtoSchema = z.object({
  role: UserRoleSchema.optional(),
  displayName: z.string().nullable().optional(),
  isAdmin: z.boolean().optional(),
  restaurantId: z.string().min(1).optional(),
})

export const CreateRestaurantDtoSchema = z.object({
  name: z.string().min(1).max(100),
})

export const UpdateRestaurantDtoSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

export const UpsertSystemSettingSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
  category: SystemSettingCategorySchema,
  description: z.string().nullable().optional(),
})
