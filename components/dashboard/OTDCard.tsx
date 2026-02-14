"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardStyles } from "@/lib/utils/styles";
import { LongestWaitTimesModal } from "@/components/dashboard/LongestWaitTimesModal";
import type { DeliverySummary, DeliveryOrder } from "@/lib/types";
import type { SerializedDeliveryOrder } from "@/components/dashboard/DashboardClient";

interface OTDCardProps {
  summary: DeliverySummary;
  longestWaitTimes?: SerializedDeliveryOrder[];
  currentMonth?: string;
}

export function OTDCard({ summary, longestWaitTimes, currentMonth }: OTDCardProps) {
  const modalOrders: DeliveryOrder[] = (longestWaitTimes ?? []).map((o) => ({
    ...o,
    orderPlaced: new Date(o.orderPlaced),
    completed: o.completed ? new Date(o.completed) : null,
  }));

  const hasWaitTimeData = modalOrders.length > 0;

  if (hasWaitTimeData && currentMonth) {
    return (
      <LongestWaitTimesModal
        orders={modalOrders}
        month={currentMonth}
        trigger={
          <div className={cn(cardStyles, "animate-fade-up animate-lift stagger-7 cursor-pointer")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">OTD</p>
                <p className="mt-2 text-3xl metric-value">{summary.avgOnTimeDeliveryMins.toFixed(1)} min</p>
                <p className="mt-1 text-[10px] text-primary font-medium">Klik voor langste wachttijden</p>
              </div>
              <div className="rounded-xl p-3 bg-[#006dec]/10 dark:bg-[#006dec]/20">
                <Clock className="h-6 w-6 text-[#006dec]" />
              </div>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className={cn(cardStyles, "animate-fade-up animate-lift stagger-7")}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">OTD</p>
          <p className="mt-2 text-3xl metric-value">{summary.avgOnTimeDeliveryMins.toFixed(1)} min</p>
        </div>
        <div className="rounded-xl p-3 bg-[#006dec]/10 dark:bg-[#006dec]/20">
          <Clock className="h-6 w-6 text-[#006dec]" />
        </div>
      </div>
    </div>
  );
}
