"use client";

import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEURWithCents } from "@/lib/utils/formatters";
import { cardStyles } from "@/lib/utils/styles";
import type { KPISummary, PeriodComparison } from "@/lib/types";
import { MetricSparkline } from "./MetricSparkline";
import { ComparisonBadge } from "./VarianceBadge";

interface ProductivityCardProps {
  summary: KPISummary;
  comparison?: PeriodComparison;
  sparklineData?: number[];
  animationDelay: string;
}

export function ProductivityCard({ summary, comparison, sparklineData, animationDelay }: ProductivityCardProps) {
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
          Productiviteit
        </p>
        <div className="flex size-10 items-center justify-center rounded-lg bg-[#ffda28]/10 text-[#ffc814] dark:bg-[#ffda28]/20 dark:text-[#ffda28]">
          <Timer className="size-5" />
        </div>
      </div>

      <p className="metric-value text-3xl leading-none tracking-tight text-foreground mb-3">
        {formatEURWithCents(summary.avgLabourProductivity)}
      </p>

      {sparklineData && sparklineData.length > 1 && (
        <div className="mb-2">
          <MetricSparkline data={sparklineData} color="#ffc814" positive />
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Netto omzet per uur</span>
      </div>

      {comparison && comparison.productivityChange !== undefined && (
        <div className="mt-1">
          <ComparisonBadge value={comparison.productivityChange} suffix="%" />
        </div>
      )}
    </div>
  );
}
