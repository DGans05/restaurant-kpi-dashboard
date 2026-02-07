"use client";

import { useRouter, usePathname } from "next/navigation";
import { KPISummaryCards } from "@/components/dashboard/KPISummaryCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { LabourChart } from "@/components/dashboard/CostBreakdownChart";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { RestaurantFilter } from "@/components/dashboard/RestaurantFilter";
import { DeliveryPerformance } from "@/components/dashboard/DeliveryPerformance";
import type {
  KPISummary,
  ChartDataPoint,
  DeliverySummary,
  PeriodView,
  Restaurant,
} from "@/lib/types";

interface DashboardClientProps {
  summary: KPISummary;
  chartData: ChartDataPoint[];
  deliverySummary: DeliverySummary;
  view: PeriodView;
  periodKey: string;
  restaurants: Restaurant[];
  currentRestaurantId?: string;
}

export function DashboardClient({
  summary,
  chartData,
  deliverySummary,
  view,
  periodKey,
  restaurants,
  currentRestaurantId,
}: DashboardClientProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handlePeriodChange = (newView: PeriodView, newKey: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set("view", newView);
    if (newView === "week") {
      params.set("week", newKey);
      params.delete("month");
    } else {
      params.set("month", newKey);
      params.delete("week");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Dashboard{" "}
            {currentRestaurantId
              ? `— ${restaurants.find((r) => r.id === currentRestaurantId)?.name || "Unknown"}`
              : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Einde Dag Rapportage
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <RestaurantFilter
            restaurants={restaurants}
            currentRestaurantId={currentRestaurantId}
          />
          <PeriodSelector
            view={view}
            periodKey={periodKey}
            onChange={handlePeriodChange}
          />
        </div>
      </div>

      {/* KPI Cards */}
      <KPISummaryCards summary={summary} />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RevenueChart data={chartData} />
        <LabourChart data={chartData} />
      </div>

      {/* Delivery Performance */}
      <DeliveryPerformance summary={deliverySummary} />
    </div>
  );
}
