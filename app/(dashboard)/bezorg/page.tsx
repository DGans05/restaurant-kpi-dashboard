import { z } from "zod";
import { getBezorgSummary, getBezorgChartData } from "@/lib/services/bezorg-service";
import { getLongestWaitTimes } from "@/lib/services/kpi-service";
import { getAllRestaurants } from "@/lib/services/restaurant-service";
import { PeriodViewSchema, ISOWeekSchema, ISOMonthSchema } from "@/lib/schemas";
import { BezorgClient } from "@/components/bezorg/BezorgClient";
import {
  getCurrentWeek,
  getCurrentMonth,
  getPeriodDateRange,
} from "@/lib/utils/period-dates";
import type { PeriodView } from "@/lib/types";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

interface BezorgPageProps {
  searchParams: Promise<{
    view?: string;
    week?: string;
    month?: string;
    restaurantId?: string;
  }>;
}

export default async function BezorgPage({ searchParams }: BezorgPageProps) {
  const params = await searchParams;

  const view: PeriodView = PeriodViewSchema.catch("week").parse(
    params.view || "week"
  );

  const periodKey =
    view === "week"
      ? ISOWeekSchema.catch(getCurrentWeek()).parse(params.week || getCurrentWeek())
      : ISOMonthSchema.catch(getCurrentMonth()).parse(params.month || getCurrentMonth());

  const { start, end } = getPeriodDateRange(view, periodKey);
  const restaurantId = z.string().min(1).optional().parse(params.restaurantId || undefined);

  const [summary, chartData, restaurants, longestWaitTimes] = await Promise.all([
    getBezorgSummary(start, end, restaurantId),
    getBezorgChartData(start, end, restaurantId),
    getAllRestaurants(),
    getLongestWaitTimes(end, restaurantId),
  ]);

  const serializedWaitTimes = longestWaitTimes.map((o) => ({
    ...o,
    orderPlaced: o.orderPlaced.toISOString(),
    completed: o.completed?.toISOString() ?? null,
  }));

  const currentMonth = format(end, "yyyy-MM");

  return (
    <BezorgClient
      summary={summary}
      chartData={chartData}
      view={view}
      periodKey={periodKey}
      restaurants={restaurants}
      currentRestaurantId={restaurantId}
      longestWaitTimes={serializedWaitTimes}
      currentMonth={currentMonth}
    />
  );
}
