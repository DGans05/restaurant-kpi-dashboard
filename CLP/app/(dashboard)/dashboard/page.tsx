import { z } from "zod";
import {
  getKPISummary,
  getChartData,
  getDeliverySummary,
  computePeriodComparison,
  getSparklineData,
  getWorkedHoursData,
  getMakeTimeData,
  getLongestWaitTimes,
} from "@/lib/services/kpi-service";
import { getAllRestaurants } from "@/lib/services/restaurant-service";
import { PeriodViewSchema, ISOWeekSchema, ISOMonthSchema } from "@/lib/schemas";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import {
  getCurrentWeek,
  getCurrentMonth,
  getPeriodDateRange,
  getPreviousPeriodKey,
} from "@/lib/utils/period-dates";
import type { PeriodView, DeliveryOrder } from "@/lib/types";
import { format } from "date-fns";

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

  // Compute previous period for comparison
  const prevPeriodKey = getPreviousPeriodKey(view, periodKey);
  const { start: prevStart, end: prevEnd } = getPeriodDateRange(view, prevPeriodKey);

  // Server-side data fetching (parallel)
  const [summary, chartData, deliverySummary, restaurants, prevSummary, sparklines, workedHoursData, makeTimeData, longestWaitTimes] =
    await Promise.all([
      getKPISummary(start, end, restaurantId),
      getChartData(start, end, restaurantId),
      getDeliverySummary(start, end, restaurantId),
      getAllRestaurants(),
      getKPISummary(prevStart, prevEnd, restaurantId),
      getSparklineData(end, restaurantId),
      getWorkedHoursData(start, end, restaurantId),
      getMakeTimeData(start, end, restaurantId),
      getLongestWaitTimes(end, restaurantId),
    ]);

  const comparison = computePeriodComparison(summary, prevSummary);

  // Serialize DeliveryOrder dates for client component boundary
  const serializedWaitTimes = longestWaitTimes.map((o) => ({
    ...o,
    orderPlaced: o.orderPlaced.toISOString(),
    completed: o.completed?.toISOString() ?? null,
  }));

  const currentMonth = format(end, "yyyy-MM");

  return (
    <DashboardClient
      summary={summary}
      chartData={chartData}
      deliverySummary={deliverySummary}
      view={view}
      periodKey={periodKey}
      restaurants={restaurants}
      currentRestaurantId={restaurantId}
      comparison={comparison}
      sparklines={sparklines}
      workedHoursData={workedHoursData}
      makeTimeData={makeTimeData}
      startDate={start.toISOString().split("T")[0]}
      endDate={end.toISOString().split("T")[0]}
      longestWaitTimes={serializedWaitTimes}
      currentMonth={currentMonth}
    />
  );
}
