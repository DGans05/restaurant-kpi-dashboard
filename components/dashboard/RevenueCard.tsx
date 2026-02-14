"use client";

import { Euro } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEUR } from "@/lib/utils/formatters";
import { cardStyles } from "@/lib/utils/styles";
import type { KPISummary, PeriodComparison } from "@/lib/types";
import { MetricSparkline } from "./MetricSparkline";
import { VarianceBadge, ComparisonBadge } from "./VarianceBadge";

interface RevenueCardProps {
  summary: KPISummary;
  comparison?: PeriodComparison;
  sparklineData?: number[];
  animationDelay: string;
}

export function RevenueCard({ summary, comparison, sparklineData, animationDelay }: RevenueCardProps) {
  return (
    <div
      className={cn(
        "animate-fade-up animate-lift group relative",
        cardStyles,
        animationDelay
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Netto Omzet
        </p>
        <div className="flex size-10 items-center justify-center rounded-lg bg-[#009a44]/10 text-[#009a44] dark:bg-[#009a44]/20 dark:text-[#009a44]">
          <Euro className="size-5" />
        </div>
      </div>

      <p className="metric-value text-3xl leading-none tracking-tight text-foreground mb-3">
        {formatEUR(summary.totalNetRevenue)}
      </p>

      {sparklineData && sparklineData.length > 1 && (
        <div className="mb-2">
          <MetricSparkline data={sparklineData} color="#009a44" positive />
        </div>
      )}

      <div className="flex items-center gap-2">
        <VarianceBadge value={summary.revenueVariance} suffix="%" />
        <span className="text-xs text-muted-foreground">
          Plan: {formatEUR(summary.totalPlannedRevenue)}
        </span>
      </div>

      {comparison && comparison.revenueChange !== undefined && (
        <div className="mt-1">
          <ComparisonBadge value={comparison.revenueChange} suffix="%" />
        </div>
      )}
    </div>
  );
}
