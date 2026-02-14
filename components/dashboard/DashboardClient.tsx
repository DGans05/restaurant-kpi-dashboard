"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { RevenueCard } from "@/components/dashboard/RevenueCard";
import { LabourCostCard } from "@/components/dashboard/LabourCostCard";
import { OrdersCard } from "@/components/dashboard/OrdersCard";
import { ProductivityCard } from "@/components/dashboard/ProductivityCard";
import { PrimeCostCard } from "@/components/dashboard/PrimeCostCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { LabourChart } from "@/components/dashboard/LabourChart";
import { PeriodSelector } from "@/components/dashboard/PeriodSelector";
import { RestaurantFilter } from "@/components/dashboard/RestaurantFilter";
import { DeliveryRate30Card } from "@/components/dashboard/DeliveryRate30Card";
import { OTDCard } from "@/components/dashboard/OTDCard";
import { MakeTimeCard } from "@/components/dashboard/MakeTimeCard";
import { DriveTimeCard } from "@/components/dashboard/DriveTimeCard";
import { ExportButton } from "@/components/dashboard/ExportButton";
import { DashboardViewToggle } from "@/components/dashboard/DashboardViewToggle";
import { BurgerKitchenCard } from "@/components/dashboard/BurgerKitchenCard";
import { WorkedHoursChart } from "@/components/dashboard/WorkedHoursChart";
import { MakeTimeChart } from "@/components/dashboard/MakeTimeChart";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { CustomizeToolbar } from "@/components/dashboard/CustomizeToolbar";
import { useDashboardLayout } from "@/lib/hooks/useDashboardLayout";
import { getWidgetMeta } from "@/components/dashboard/grid-defaults";
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
  const [isEditMode, setIsEditMode] = useState(false);

  const { layouts, hidden, isLoading, onLayoutChange, toggleWidget, resetLayout } =
    useDashboardLayout("kern");
  const widgetMeta = getWidgetMeta("kern");

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
        id: "revenue-card",
        label: "Netto Omzet",
        node: (
          <RevenueCard
            summary={summary}
            comparison={comparison}
            sparklineData={sparklines?.revenue}
            animationDelay="stagger-1"
          />
        ),
      },
      {
        id: "labour-card",
        label: "Arbeidskosten",
        node: (
          <LabourCostCard
            summary={summary}
            comparison={comparison}
            sparklineData={sparklines?.labourPct}
            animationDelay="stagger-2"
          />
        ),
      },
      {
        id: "orders-card",
        label: "Bestellingen",
        node: (
          <OrdersCard
            summary={summary}
            comparison={comparison}
            sparklineData={sparklines?.orders}
            animationDelay="stagger-3"
          />
        ),
      },
      {
        id: "productivity-card",
        label: "Productiviteit",
        node: (
          <ProductivityCard
            summary={summary}
            comparison={comparison}
            sparklineData={sparklines?.productivity}
            animationDelay="stagger-4"
          />
        ),
      },
      {
        id: "prime-cost-card",
        label: "Prime Cost",
        node: (
          <PrimeCostCard
            summary={summary}
            comparison={comparison}
            animationDelay="stagger-5"
          />
        ),
      },
      ...(hasBK
        ? [
            {
              id: "bk-card",
              label: "Burger Kitchen",
              node: <BurgerKitchenCard summary={summary} />,
            },
          ]
        : []),
      {
        id: "revenue-chart",
        label: "Revenue Chart",
        node: <RevenueChart data={chartData} />,
      },
      {
        id: "labour-chart",
        label: "Labour Cost Chart",
        node: <LabourChart data={chartData} />,
      },
      ...(workedHoursData
        ? [
            {
              id: "hours-chart",
              label: "Worked Hours",
              node: <WorkedHoursChart data={workedHoursData} />,
            },
          ]
        : []),
      ...(makeTimeData
        ? [
            {
              id: "maketime-chart",
              label: "Make Time",
              node: <MakeTimeChart data={makeTimeData} />,
            },
          ]
        : []),
      {
        id: "delivery-rate30-card",
        label: "Bezorgd < 30 min",
        node: <DeliveryRate30Card summary={deliverySummary} />,
      },
      {
        id: "otd-card",
        label: "OTD",
        node: (
          <OTDCard
            summary={deliverySummary}
            longestWaitTimes={longestWaitTimes}
            currentMonth={currentMonth}
          />
        ),
      },
      {
        id: "maketime-card",
        label: "Maaktijd",
        node: <MakeTimeCard summary={deliverySummary} />,
      },
      {
        id: "drivetime-card",
        label: "Rijtijd",
        node: <DriveTimeCard summary={deliverySummary} />,
      },
    ];
    return items;
  }, [
    summary,
    comparison,
    sparklines,
    hasBK,
    chartData,
    workedHoursData,
    makeTimeData,
    deliverySummary,
    longestWaitTimes,
    currentMonth,
  ]);

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
          active="kern"
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
