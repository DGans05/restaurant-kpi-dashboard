"use client";

import { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { KPISummaryCards } from "@/components/dashboard/KPISummaryCards";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { LabourChart } from "@/components/dashboard/LabourChart";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { RestaurantFilter } from "@/components/dashboard/RestaurantFilter";
import { DeliveryPerformance } from "@/components/dashboard/DeliveryPerformance";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { DashboardViewToggle } from "@/components/dashboard/DashboardViewToggle";
import { BurgerKitchenCard } from "@/components/dashboard/BurgerKitchenCard";
import { WorkedHoursChart } from "@/components/dashboard/WorkedHoursChart";
import { MakeTimeChart } from "@/components/dashboard/MakeTimeChart";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
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

  const hasBK = summary.totalBurgerKitchenRevenue > 0;

  const widgets = useMemo(() => {
    const items = [
      {
        id: "kpi-cards",
        colSpan: "xl:col-span-2",
        node: <KPISummaryCards summary={summary} comparison={comparison} sparklines={sparklines} />,
      },
      ...(hasBK
        ? [{
            id: "bk-card",
            node: <BurgerKitchenCard summary={summary} />,
          }]
        : []),
      {
        id: "revenue-chart",
        node: <RevenueChart data={chartData} />,
      },
      {
        id: "labour-chart",
        node: <LabourChart data={chartData} />,
      },
      ...(workedHoursData
        ? [{
            id: "hours-chart",
            node: <WorkedHoursChart data={workedHoursData} />,
          }]
        : []),
      ...(makeTimeData
        ? [{
            id: "maketime-chart",
            node: <MakeTimeChart data={makeTimeData} />,
          }]
        : []),
      {
        id: "delivery-perf",
        colSpan: "xl:col-span-2",
        node: (
          <DeliveryPerformance
            summary={deliverySummary}
            longestWaitTimes={longestWaitTimes}
            currentMonth={currentMonth}
          />
        ),
      },
    ];
    return items;
  }, [summary, comparison, sparklines, hasBK, chartData, workedHoursData, makeTimeData, deliverySummary, longestWaitTimes, currentMonth]);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <DashboardViewToggle
          active="kern"
          restaurantSuffix={
            currentRestaurantId
              ? restaurants.find((r) => r.id === currentRestaurantId)?.name || "Unknown"
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

      {/* Draggable Grid */}
      <DashboardGrid dashboardKey="kern" widgets={widgets} />
    </div>
  );
}
