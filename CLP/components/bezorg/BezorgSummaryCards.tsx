"use client";

import { Truck, Timer, Clock, ChefHat, Route, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardStyles } from "@/lib/utils/styles";
import { LongestWaitTimesModal } from "@/components/dashboard/LongestWaitTimesModal";
import type { BezorgSummary, DeliveryOrder } from "@/lib/types";

interface BezorgSummaryCardsProps {
  summary: BezorgSummary;
  longestWaitTimes?: DeliveryOrder[];
  currentMonth?: string;
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  delay: string;
  children?: React.ReactNode;
}

function MetricCard({ title, value, icon, bgColor, delay, children }: MetricCardProps) {
  return (
    <div className={cn(cardStyles, "animate-fade-up animate-lift", delay)}>
      {children ?? (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 text-3xl metric-value">{value}</p>
          </div>
          <div className={cn("rounded-xl p-3", bgColor)}>{icon}</div>
        </div>
      )}
    </div>
  );
}

export function BezorgSummaryCards({
  summary,
  longestWaitTimes,
  currentMonth,
}: BezorgSummaryCardsProps) {
  const hasWaitTimeData = (longestWaitTimes ?? []).length > 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard
        title="Bezorgd < 30 min"
        value={`${summary.avgDeliveryRate30min.toFixed(1)}%`}
        icon={<Truck className="h-6 w-6 text-[#009a44]" />}
        bgColor="bg-[#009a44]/10 dark:bg-[#009a44]/20"
        delay="stagger-1"
      />
      <MetricCard
        title="Bezorgd < 20 min"
        value={`${summary.avgDeliveryRate20min.toFixed(1)}%`}
        icon={<Timer className="h-6 w-6 text-[#0d9488]" />}
        bgColor="bg-[#0d9488]/10 dark:bg-[#0d9488]/20"
        delay="stagger-2"
      />

      {hasWaitTimeData && currentMonth ? (
        <LongestWaitTimesModal
          orders={longestWaitTimes!}
          month={currentMonth}
          trigger={
            <MetricCard
              title="OTD"
              value={`${summary.avgOnTimeDeliveryMins.toFixed(1)} min`}
              icon={<Clock className="h-6 w-6 text-[#006dec]" />}
              bgColor="bg-[#006dec]/10 dark:bg-[#006dec]/20"
              delay="stagger-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    OTD
                  </p>
                  <p className="mt-2 text-3xl metric-value">
                    {summary.avgOnTimeDeliveryMins.toFixed(1)} min
                  </p>
                  <p className="mt-1 text-[10px] text-primary font-medium">
                    Klik voor langste wachttijden
                  </p>
                </div>
                <div className={cn("rounded-xl p-3", "bg-[#006dec]/10 dark:bg-[#006dec]/20")}>
                  <Clock className="h-6 w-6 text-[#006dec]" />
                </div>
              </div>
            </MetricCard>
          }
        />
      ) : (
        <MetricCard
          title="OTD"
          value={`${summary.avgOnTimeDeliveryMins.toFixed(1)} min`}
          icon={<Clock className="h-6 w-6 text-[#006dec]" />}
          bgColor="bg-[#006dec]/10 dark:bg-[#006dec]/20"
          delay="stagger-3"
        />
      )}

      <MetricCard
        title="Maaktijd"
        value={`${summary.avgMakeTimeMins.toFixed(1)} min`}
        icon={<ChefHat className="h-6 w-6 text-[#ffa51d]" />}
        bgColor="bg-[#ffa51d]/10 dark:bg-[#ffa51d]/20"
        delay="stagger-4"
      />
      <MetricCard
        title="Rijtijd"
        value={`${summary.avgDriveTimeMins.toFixed(1)} min`}
        icon={<Route className="h-6 w-6 text-[#f3001d]" />}
        bgColor="bg-[#f3001d]/10 dark:bg-[#f3001d]/20"
        delay="stagger-5"
      />
      <MetricCard
        title="Orders / rit"
        value={summary.avgOrdersPerRun.toFixed(2)}
        icon={<PackageCheck className="h-6 w-6 text-[#8b5cf6]" />}
        bgColor="bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20"
        delay="stagger-6"
      />
    </div>
  );
}
