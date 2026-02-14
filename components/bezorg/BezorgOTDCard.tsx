"use client";

import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardStyles } from "@/lib/utils/styles";
import { LongestWaitTimesModal } from "@/components/dashboard/LongestWaitTimesModal";
import type { BezorgSummary, DeliveryOrder } from "@/lib/types";

interface BezorgOTDCardProps {
  summary: BezorgSummary;
  longestWaitTimes?: DeliveryOrder[];
  currentMonth?: string;
}

export function BezorgOTDCard({ summary, longestWaitTimes, currentMonth }: BezorgOTDCardProps) {
  const hasWaitTimeData = (longestWaitTimes ?? []).length > 0;

  if (hasWaitTimeData && currentMonth) {
    return (
      <LongestWaitTimesModal
        orders={longestWaitTimes!}
        month={currentMonth}
        trigger={
          <div className={cn(cardStyles, "animate-fade-up animate-lift stagger-3 cursor-pointer")}>
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
    <div className={cn(cardStyles, "animate-fade-up animate-lift stagger-3")}>
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
