"use client";

import { useRouter, usePathname } from "next/navigation";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { RestaurantFilter } from "@/components/dashboard/RestaurantFilter";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { DashboardViewToggle } from "@/components/dashboard/DashboardViewToggle";
import { KPIRibbon } from "@/components/dashboard/unified/KPIRibbon";
import { ChartsPanel } from "@/components/dashboard/unified/ChartsPanel";
import { DeliveryStrip } from "@/components/dashboard/unified/DeliveryStrip";
import type {
  KPISummary,
  ChartDataPoint,
  DeliverySummary,
  PeriodView,
  Restaurant,
  PeriodComparison,
  KPISparklines,
  WorkedHoursDataPoint,
  MakeTimeDataPoint,
} from "@/lib/types";

export interface SerializedDeliveryOrder {
  orderNumber: string;
  phoneNumber: string;
  waitingTimeMins: number;
  orderPlaced: string;
  completed: string | null;
  driverName: string | null;
  address: string | null;
  date: string;
}

interface DashboardClientProps {
  summary: KPISummary;
  chartData: ChartDataPoint[];
  deliverySummary: DeliverySummary;
  view: PeriodView;
  periodKey: string;
  restaurants: Restaurant[];
  currentRestaurantId?: string;
  comparison?: PeriodComparison;
  sparklines?: KPISparklines;
  workedHoursData?: WorkedHoursDataPoint[];
  makeTimeData?: MakeTimeDataPoint[];
  startDate: string;
  endDate: string;
  longestWaitTimes?: SerializedDeliveryOrder[];
  currentMonth?: string;
}

export function DashboardClient({
  summary,
  chartData,
  deliverySummary,
  view,
  periodKey,
  restaurants,
  currentRestaurantId,
  comparison,
  sparklines,
  workedHoursData,
  makeTimeData,
  startDate,
  endDate,
  longestWaitTimes,
  currentMonth,
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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <DashboardViewToggle
          active="kern"
          restaurantSuffix={
            currentRestaurantId
              ? restaurants.find((r) => r.id === currentRestaurantId)?.name ||
                "Unknown"
              : undefined
          }
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <RestaurantFilter
            restaurants={restaurants}
            currentRestaurantId={currentRestaurantId}
          />
          <ExportButton
            startDate={startDate}
            endDate={endDate}
            restaurantId={currentRestaurantId}
          />
          <PeriodSelector
            view={view}
            periodKey={periodKey}
            onChange={handlePeriodChange}
          />
        </div>
      </div>

      {/* KPI Ribbon */}
      <KPIRibbon
        summary={summary}
        comparison={comparison}
        sparklines={sparklines}
      />

      {/* Charts Panel */}
      <ChartsPanel
        chartData={chartData}
        workedHoursData={workedHoursData}
        makeTimeData={makeTimeData}
      />

      {/* Delivery Strip */}
      <DeliveryStrip
        summary={deliverySummary}
        longestWaitTimes={longestWaitTimes}
        currentMonth={currentMonth}
      />
    </div>
  );
}
