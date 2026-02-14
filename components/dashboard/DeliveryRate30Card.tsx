"use client";

import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardStyles } from "@/lib/utils/styles";
import type { DeliverySummary } from "@/lib/types";

interface DeliveryRate30CardProps {
  summary: DeliverySummary;
}

export function DeliveryRate30Card({ summary }: DeliveryRate30CardProps) {
  return (
    <div className={cn(cardStyles, "animate-fade-up animate-lift stagger-7")}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Bezorgd &lt; 30 min
          </p>
          <p className="mt-2 text-3xl metric-value">
            {summary.avgDeliveryRate30min.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl p-3 bg-[#009a44]/10 dark:bg-[#009a44]/20">
          <Truck className="h-6 w-6 text-[#009a44]" />
        </div>
      </div>
    </div>
  );
}
