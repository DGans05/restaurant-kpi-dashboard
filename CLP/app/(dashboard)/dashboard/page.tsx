import { z } from "zod";
import {
  getKPISummary,
  getChartData,
  getDeliverySummary,
} from "@/lib/services/kpi-service";
import { getAllRestaurants } from "@/lib/services/restaurant-service";
import { PeriodViewSchema, ISOWeekSchema, ISOMonthSchema } from "@/lib/schemas";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import {
  getCurrentWeek,
  getCurrentMonth,
  getPeriodDateRange,
} from "@/lib/utils/period-dates";
import type { PeriodView } from "@/lib/types";

export const dynamic = "force-dynamic";

interface DashboardPageProps {
  searchParams: Promise<{
    view?: string;
    week?: string;
    month?: string;
    restaurantId?: string;
  }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;

  // Parse view (default: week)
  const view: PeriodView = PeriodViewSchema.catch("week").parse(
    params.view || "week"
  );

  // Parse period key based on view
  const periodKey =
    view === "week"
      ? ISOWeekSchema.catch(getCurrentWeek()).parse(params.week || getCurrentWeek())
      : ISOMonthSchema.catch(getCurrentMonth()).parse(params.month || getCurrentMonth());

  // Compute date range from period
  const { start, end } = getPeriodDateRange(view, periodKey);

  const restaurantId = z.string().min(1).optional().parse(params.restaurantId || undefined);

  // Server-side data fetching (parallel)
  const [summary, chartData, deliverySummary, restaurants] =
    await Promise.all([
      getKPISummary(start, end, restaurantId),
      getChartData(start, end, restaurantId),
      getDeliverySummary(start, end, restaurantId),
      getAllRestaurants(),
    ]);

  return (
    <DashboardClient
      summary={summary}
      chartData={chartData}
      deliverySummary={deliverySummary}
      view={view}
      periodKey={periodKey}
      restaurants={restaurants}
      currentRestaurantId={restaurantId}
    />
  );
}
