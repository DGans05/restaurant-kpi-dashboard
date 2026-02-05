import { Suspense } from "react";
import {
  getKPISummary,
  getChartData,
  getDeliveryData,
} from "@/lib/services/kpi-service";
import { getAllRestaurants } from "@/lib/services/restaurant-service";
import { DateRangeDaysSchema } from "@/lib/schemas";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";

interface DashboardPageProps {
  searchParams: Promise<{ days?: string; restaurantId?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;

  // Validate and parse days parameter, default to 28
  const days = DateRangeDaysSchema.catch(28).parse(
    params.days ? Number(params.days) : 28
  );

  const restaurantId = params.restaurantId;

  // Server-side data fetching (parallel)
  const [summary, chartData, deliveryData, restaurants] = await Promise.all([
    getKPISummary(days, restaurantId),
    getChartData(days, restaurantId),
    getDeliveryData(days, restaurantId),
    getAllRestaurants(),
  ]);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient
        summary={summary}
        chartData={chartData}
        deliveryData={deliveryData}
        days={days}
        restaurants={restaurants}
        currentRestaurantId={restaurantId}
      />
    </Suspense>
  );
}
