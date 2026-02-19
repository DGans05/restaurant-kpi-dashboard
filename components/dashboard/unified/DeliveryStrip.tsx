"use client";

import { Truck, Clock, ChefHat, Route } from "lucide-react";
import { panelStyles } from "@/lib/utils/styles";
import { LongestWaitTimesModal } from "@/components/dashboard/LongestWaitTimesModal";
import { DeliveryStripItem } from "./DeliveryStripItem";
import type { DeliverySummary, DeliveryOrder } from "@/lib/types";
import type { SerializedDeliveryOrder } from "@/components/dashboard/DashboardClient";

interface DeliveryStripProps {
  summary: DeliverySummary;
  longestWaitTimes?: SerializedDeliveryOrder[];
  currentMonth?: string;
}

export function DeliveryStrip({
  summary,
  longestWaitTimes,
  currentMonth,
}: DeliveryStripProps) {
  const modalOrders: DeliveryOrder[] = (longestWaitTimes ?? []).map((o) => ({
    ...o,
    orderPlaced: new Date(o.orderPlaced),
    completed: o.completed ? new Date(o.completed) : null,
  }));
  const hasWaitTimeData = modalOrders.length > 0 && currentMonth;

  return (
    <div className={`${panelStyles} animate-fade-up`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0">
        <DeliveryStripItem
          label="Bezorgd < 30 min"
          value={`${summary.avgDeliveryRate30min.toFixed(1)}%`}
          icon={<Truck className="size-4 text-[#009a44]" />}
        />

        {hasWaitTimeData ? (
          <LongestWaitTimesModal
            orders={modalOrders}
            month={currentMonth}
            trigger={
              <div className="cursor-pointer">
                <DeliveryStripItem
                  label="OTD"
                  value={`${summary.avgOnTimeDeliveryMins.toFixed(1)} min`}
                  icon={<Clock className="size-4 text-[#006dec]" />}
                >
                  <p className="text-[10px] text-primary font-medium">
                    Klik voor details
                  </p>
                </DeliveryStripItem>
              </div>
            }
          />
        ) : (
          <DeliveryStripItem
            label="OTD"
            value={`${summary.avgOnTimeDeliveryMins.toFixed(1)} min`}
            icon={<Clock className="size-4 text-[#006dec]" />}
          />
        )}

        <DeliveryStripItem
          label="Maaktijd"
          value={`${summary.avgMakeTimeMins.toFixed(1)} min`}
          icon={<ChefHat className="size-4 text-[#ffa51d]" />}
        />

        <DeliveryStripItem
          label="Rijtijd"
          value={`${summary.avgDriveTimeMins.toFixed(1)} min`}
          icon={<Route className="size-4 text-[#f3001d]" />}
        />
      </div>
    </div>
  );
}
