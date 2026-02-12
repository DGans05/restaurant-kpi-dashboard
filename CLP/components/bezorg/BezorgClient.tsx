"use client";

import { useRouter, usePathname } from "next/navigation";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { RestaurantFilter } from "@/components/dashboard/RestaurantFilter";
import { DashboardViewToggle } from "@/components/dashboard/DashboardViewToggle";
import { BezorgSummaryCards } from "@/components/bezorg/BezorgSummaryCards";
import { DeliveryRateChart } from "@/components/bezorg/DeliveryRateChart";
import { TimeBreakdownChart } from "@/components/bezorg/TimeBreakdownChart";
import { PostcodeTable } from "@/components/bezorg/PostcodeTable";
import { PostcodeMap } from "@/components/bezorg/PostcodeMap";
import type {
  BezorgSummary,
  BezorgChartDataPoint,
  PeriodView,
  Restaurant,
  DeliveryOrder,
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

interface BezorgClientProps {
  summary: BezorgSummary;
  chartData: BezorgChartDataPoint[];
  view: PeriodView;
  periodKey: string;
  restaurants: Restaurant[];
  currentRestaurantId?: string;
  longestWaitTimes?: SerializedDeliveryOrder[];
  currentMonth?: string;
}

export function BezorgClient({
  summary,
  chartData,
  view,
  periodKey,
  restaurants,
  currentRestaurantId,
  longestWaitTimes,
  currentMonth,
}: BezorgClientProps) {
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

  const modalOrders: DeliveryOrder[] = (longestWaitTimes ?? []).map((o) => ({
    ...o,
    orderPlaced: new Date(o.orderPlaced),
    completed: o.completed ? new Date(o.completed) : null,
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <DashboardViewToggle
          active="service"
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
          <PeriodSelector
            view={view}
            periodKey={periodKey}
            onChange={handlePeriodChange}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <BezorgSummaryCards
        summary={summary}
        longestWaitTimes={modalOrders}
        currentMonth={currentMonth}
      />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DeliveryRateChart data={chartData} />
        <TimeBreakdownChart data={chartData} />
      </div>

      {/* Postcode Map */}
      <PostcodeMap />

      {/* Postcode Table */}
      <PostcodeTable data={[]} />
    </div>
  );
}
