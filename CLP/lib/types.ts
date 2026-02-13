export interface Restaurant {
  id: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface KPIEntry {
  restaurantId: string; // FK to Restaurant
  date: string; // ISO date string YYYY-MM-DD
  dayName: string; // Dutch day name (Maandag, Dinsdag, etc.)
  weekNumber: number;

  // Revenue
  plannedRevenue: number;
  grossRevenue: number;
  netRevenue: number;
  burgerKitchenRevenue: number;

  // Labour
  plannedLabourCost: number;
  labourCost: number;
  plannedLabourPct: number | null; // null for first 2 days (missing in Excel)
  labourPct: number;
  workedHours: number;
  labourProductivity: number; // net revenue per hour

  // Food Cost (COGS)
  foodCost: number;
  foodCostPct: number; // % of net revenue

  // Delivery
  deliveryRate30min: number; // % delivered within 30 min
  deliveryRate20min: number; // % delivered within 20 min
  onTimeDeliveryMins: number; // OTD in minutes
  makeTimeMins: number;
  driveTimeMins: number;

  // Orders
  orderCount: number;
  avgOrderValue: number;
  ordersPerRun: number;

  // Meta
  cashDifference: number | null;
  manager: string;
}

export interface KPISummary {
  // Revenue (plan vs actual)
  totalNetRevenue: number;
  totalPlannedRevenue: number;
  revenueVariance: number; // % difference
  totalBurgerKitchenRevenue: number;

  // Labour (plan vs actual)
  avgLabourPct: number;
  avgPlannedLabourPct: number;
  labourVariance: number; // percentage point difference

  // Food Cost (COGS)
  avgFoodCostPct: number;
  totalFoodCost: number;

  // Prime Cost (COGS + Labour)
  avgPrimeCostPct: number;
  totalPrimeCost: number;

  // Orders
  totalOrders: number;
  avgOrderValue: number;

  // Productivity
  avgLabourProductivity: number;
}

export interface ChartDataPoint {
  date: string;
  netRevenue: number;
  grossRevenue: number;
  plannedRevenue: number;
  labourCost: number;
  plannedLabourCost: number;
  labourPct: number;
}

export interface WorkedHoursDataPoint {
  date: string;
  workedHours: number;
  labourProductivity: number;
}

export interface MakeTimeDataPoint {
  date: string;
  makeTimeMins: number;
  driveTimeMins: number;
  onTimeDeliveryMins: number;
}

export interface DeliveryDataPoint {
  date: string;
  deliveryRate30min: number;
  onTimeDeliveryMins: number;
  makeTimeMins: number;
  driveTimeMins: number;
}

export type PeriodView = "week" | "month";

export type DashboardKey = "kern" | "service";

// Individual delivery order (for modal)
export interface DeliveryOrder {
  orderNumber: string;
  phoneNumber: string;
  waitingTimeMins: number;
  orderPlaced: Date;
  completed: Date | null;
  driverName: string | null;
  address: string | null;
  date: string; // ISO YYYY-MM-DD
}

// Monthly aggregated delivery summary
export interface DeliveryMonthSummary {
  month: string; // YYYY-MM
  avgDeliveryRate30min: number;
  avgOnTimeDeliveryMins: number;
  avgMakeTimeMins: number;
  avgDriveTimeMins: number;
  totalOrders: number;
  longestWaitTimes: DeliveryOrder[]; // Top 30
}

// Aggregated delivery summary from KPI entries (period-aligned)
export interface DeliverySummary {
  avgDeliveryRate30min: number;
  avgOnTimeDeliveryMins: number;
  avgMakeTimeMins: number;
  avgDriveTimeMins: number;
  totalOrders: number;
}

export type MonthOption = {
  label: string; // "Feb 2026"
  value: string; // "2026-02"
};

// Report Types
export type ReportType =
  | 'OPERATIONAL'
  | 'TIME_KEEPING'
  | 'MANUAL_DISCOUNT'
  | 'CANCELLED_ORDERS'
  | 'LABOUR'
  | 'TIMEKEEPING_SUMMARY'
  | 'ZIPCODE_AREA_DELIVERY'
  | 'ORDER_BY_HOURS'
  | 'COUPON_DISCOUNT'
  | 'USER_COMMENTS'
  | 'LABOUR_EMPLOYEE'
  | 'LOCAL_CUSTOMER_DATA'
  | 'VARIANCE'
  | 'STORE_ITEMS_SOLD'
  | 'INVENTORY_IDEAL_USAGE'
  | 'TIP'
  | 'ISSUED_CLIENT_CREDIT'
  | 'ISSUED_CLIENT_BALANCE'
  | 'EXPENSES'
  | 'INVENTORY_DELIVERY'
  | 'INVENTORY_LOSS'
  | 'INVENTORY_RETURNS'
  | 'CASH_DRAWER_AUDIT'
  | 'INVENTORY_DAILY_COUNT'
  | 'SERVICE'
  | 'DAILY_SALES'
  | 'COUPON_ANALYSIS'
  | 'VARIANCE_PER_STOCK_PRODUCT'
  | 'DRIVER_REPORT'
  | 'PAYMENT_METHOD';

export type UploadStatus = 'uploaded' | 'parsing' | 'parsed' | 'error';

export interface Report {
  id: string;
  restaurantId: string;
  reportType: ReportType;
  reportName: string;
  reportPeriod: string; // YYYY-MM-DD
  filePath: string | null;
  fileSizeBytes: number | null;
  uploadStatus: UploadStatus;
  uploadError: string | null;
  uploadedAt: Date;
  parsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportTypeMetadata {
  type: ReportType;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'inventory' | 'delivery';
  fileType: 'excel' | 'pdf' | 'both';
  nypUrl?: string;
}

export interface KPISparklines {
  revenue: number[];
  labourPct: number[];
  orders: number[];
  productivity: number[];
}

export interface PeriodComparison {
  revenueChange: number;
  labourChange: number;
  ordersChange: number;
  productivityChange: number;
  foodCostChange: number;
  primeCostChange: number;
}

export interface Target {
  id: string;
  restaurantId: string;
  metric: string;
  targetValue: number;
  warningThreshold: number | null;
  dangerThreshold: number | null;
  periodType: 'daily' | 'weekly' | 'monthly';
}

export type UserRole = 'owner' | 'manager' | 'viewer'

export interface UserProfile {
  id: string
  userId: string
  restaurantId: string
  role: UserRole
  displayName: string | null
  isAdmin: boolean
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// Admin Management Types

export interface AuditLog {
  id: string
  userId: string | null
  userEmail: string | null
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'ACCESS'
  resourceType: string
  resourceId: string | null
  oldValues: Record<string, unknown> | null
  newValues: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: Date
}

export interface SystemSetting {
  id: string
  key: string
  value: unknown
  category: 'general' | 'email' | 'security' | 'features'
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface AuditLogFilters {
  userId?: string
  resourceType?: string
  action?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export interface CreateUserProfileDto {
  restaurantId: string
  role: UserRole
  displayName: string | null
  isAdmin?: boolean
}

export interface UpdateUserProfileDto {
  role?: UserRole
  displayName?: string | null
  isAdmin?: boolean
  restaurantId?: string
}

export interface CreateRestaurantDto {
  name: string
}

export interface UpdateRestaurantDto {
  name?: string
}

// Bezorg Service Dashboard types

export interface BezorgSummary {
  avgDeliveryRate30min: number;
  avgDeliveryRate20min: number;
  avgOnTimeDeliveryMins: number;
  avgMakeTimeMins: number;
  avgDriveTimeMins: number;
  avgOrdersPerRun: number;
  totalOrders: number;
}

export interface BezorgChartDataPoint {
  date: string;
  deliveryRate30min: number;
  deliveryRate20min: number;
  onTimeDeliveryMins: number;
  makeTimeMins: number;
  driveTimeMins: number;
  ordersPerRun: number;
}

export interface PostcodeDeliveryData {
  postcode: string;
  avgDeliveryMins: number;
  orderCount: number;
  deliveryRate30min: number;
}
