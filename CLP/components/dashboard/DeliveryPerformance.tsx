"use client";

import { Truck, Clock, ChefHat, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardStyles } from "@/lib/utils/styles";
import type { DeliverySummary } from "@/lib/types";

interface DeliveryPerformanceProps {
  summary: DeliverySummary;
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  animationDelay: string;
}

function MetricCard({ title, value, icon, bgColor, animationDelay }: MetricCardProps) {
  return (
    <div
      className={cn(
        cardStyles,
        "animate-fade-up animate-lift",
        animationDelay
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl metric-value">{value}</p>
        </div>
        <div className={cn("rounded-xl p-3", bgColor)}>{icon}</div>
      </div>
    </div>
  );
}

export function DeliveryPerformance({ summary }: DeliveryPerformanceProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display">BEZORGPRESTATIES</h2>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Bezorgd < 30 min"
          value={`${summary.avgDeliveryRate30min.toFixed(1)}%`}
          icon={<Truck className="h-6 w-6 text-[#009a44]" />}
          bgColor="bg-[#009a44]/10 dark:bg-[#009a44]/20"
          animationDelay="stagger-7"
        />
        <MetricCard
          title="OTD"
          value={`${summary.avgOnTimeDeliveryMins.toFixed(1)} min`}
          icon={<Clock className="h-6 w-6 text-[#006dec]" />}
          bgColor="bg-[#006dec]/10 dark:bg-[#006dec]/20"
          animationDelay="stagger-7"
        />
        <MetricCard
          title="Maaktijd"
          value={`${summary.avgMakeTimeMins.toFixed(1)} min`}
          icon={<ChefHat className="h-6 w-6 text-[#ffa51d]" />}
          bgColor="bg-[#ffa51d]/10 dark:bg-[#ffa51d]/20"
          animationDelay="stagger-7"
        />
        <MetricCard
          title="Rijtijd"
          value={`${summary.avgDriveTimeMins.toFixed(1)} min`}
          icon={<Route className="h-6 w-6 text-[#f3001d]" />}
          bgColor="bg-[#f3001d]/10 dark:bg-[#f3001d]/20"
          animationDelay="stagger-7"
        />
      </div>
    </div>
  );
}
