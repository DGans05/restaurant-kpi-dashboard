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

  // Labour
  plannedLabourCost: number;
  labourCost: number;
  plannedLabourPct: number | null; // null for first 2 days (missing in Excel)
  labourPct: number;
  workedHours: number;
  labourProductivity: number; // net revenue per hour

  // Delivery
  deliveryRate30min: number; // % delivered within 30 min
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

  // Labour (plan vs actual)
  avgLabourPct: number;
  avgPlannedLabourPct: number;
  labourVariance: number; // percentage point difference

  // Orders
  totalOrders: number;
  avgOrderValue: number;

  // Productivity
  avgLabourProductivity: number;
}

export interface ChartDataPoint {
  date: string;
  netRevenue: number;
  plannedRevenue: number;
  labourCost: number;
  plannedLabourCost: number;
  labourPct: number;
}

export interface DeliveryDataPoint {
  date: string;
  deliveryRate30min: number;
  onTimeDeliveryMins: number;
  makeTimeMins: number;
  driveTimeMins: number;
}

export type DateRangeDays = 7 | 14 | 28;
