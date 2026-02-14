"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPct } from "@/lib/utils/formatters";
import { cardStyles } from "@/lib/utils/styles";
import type { KPISummary, PeriodComparison } from "@/lib/types";
import { MetricSparkline } from "./MetricSparkline";
import { VarianceBadge, ComparisonBadge } from "./VarianceBadge";

interface LabourCostCardProps {
  summary: KPISummary;
  comparison?: PeriodComparison;
  sparklineData?: number[];
  animationDelay: string;
}

export function LabourCostCard({ summary, comparison, sparklineData, animationDelay }: LabourCostCardProps) {
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
          Arbeidskosten
        </p>
        <div className="flex size-10 items-center justify-center rounded-lg bg-[#ffa51d]/10 text-[#ffa51d] dark:bg-[#ffa51d]/20 dark:text-[#ffa51d]">
          <Users className="size-5" />
        </div>
      </div>

      <p className="metric-value text-3xl leading-none tracking-tight text-foreground mb-3">
        {formatPct(summary.avgLabourPct)}
      </p>

      {sparklineData && sparklineData.length > 1 && (
        <div className="mb-2">
          <MetricSparkline data={sparklineData} color="#ffa51d" positive={false} />
        </div>
      )}

      <div className="flex items-center gap-2">
        <VarianceBadge value={summary.labourVariance} invert suffix=" pp" />
        <span className="text-xs text-muted-foreground">
          Plan: {formatPct(summary.avgPlannedLabourPct)}
        </span>
      </div>

      {comparison && comparison.labourChange !== undefined && (
        <div className="mt-1">
          <ComparisonBadge value={comparison.labourChange} suffix=" pp" invert />
        </div>
      )}
    </div>
  );
}
