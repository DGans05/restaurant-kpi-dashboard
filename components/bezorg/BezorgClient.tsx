"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { RestaurantFilter } from "@/components/dashboard/RestaurantFilter";
import { DashboardViewToggle } from "@/components/dashboard/DashboardViewToggle";
import { BezorgSummaryCards } from "@/components/bezorg/BezorgSummaryCards";
import { DeliveryRateChart } from "@/components/bezorg/DeliveryRateChart";
import { TimeBreakdownChart } from "@/components/bezorg/TimeBreakdownChart";
import { PostcodeTable } from "@/components/bezorg/PostcodeTable";
import { PostcodeMap } from "@/components/bezorg/PostcodeMap";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { CustomizeToolbar } from "@/components/dashboard/CustomizeToolbar";
import { useDashboardLayout } from "@/lib/hooks/useDashboardLayout";
import { getWidgetMeta } from "@/components/dashboard/grid-defaults";
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
  const [isEditMode, setIsEditMode] = useState(false);

  const { layouts, hidden, isLoading, onLayoutChange, toggleWidget, resetLayout } =
    useDashboardLayout("service");
  const widgetMeta = getWidgetMeta("service");

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

  const widgets = useMemo(
    () => [
      {
        id: "bezorg-cards",
        label: "Bezorg Cards",
        node: (
          <BezorgSummaryCards
            summary={summary}
            longestWaitTimes={modalOrders}
            currentMonth={currentMonth}
          />
        ),
      },
      {
        id: "delivery-rate-chart",
        label: "Delivery Rate",
        node: <DeliveryRateChart data={chartData} />,
      },
      {
        id: "time-breakdown-chart",
        label: "Time Breakdown",
        node: <TimeBreakdownChart data={chartData} />,
      },
      {
        id: "postcode-map",
        label: "Postcode Map",
        node: <PostcodeMap />,
      },
      {
        id: "postcode-table",
        label: "Postcode Table",
        node: <PostcodeTable data={[]} />,
      },
    ],
    [summary, modalOrders, currentMonth, chartData]
  );

  const availableWidgetIds = widgets.map((w) => w.id);
  const visibleWidgets = widgets.filter((w) => !hidden.includes(w.id));

  const handleToggleEditMode = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header */}
      <div className="animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <DashboardViewToggle
          active="service"
          restaurantSuffix={
            currentRestaurantId
              ? restaurants.find((r) => r.id === currentRestaurantId)?.name ||
                "Unknown"
              : undefined
          }
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <CustomizeToolbar
            isEditMode={isEditMode}
            onToggleEditMode={handleToggleEditMode}
            widgetMeta={widgetMeta}
            hiddenWidgets={hidden}
            availableWidgetIds={availableWidgetIds}
            onToggleWidget={toggleWidget}
            onReset={resetLayout}
          />
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

      {/* Grid Layout */}
      {isLoading ? (
        <div className="min-h-[400px]" />
      ) : (
        <DashboardGrid
          widgets={visibleWidgets}
          layouts={layouts}
          isEditMode={isEditMode}
          onLayoutChange={onLayoutChange}
        />
      )}
    </div>
  );
}
