"use client";

import { TrendingDown, TrendingUp, CircleDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPct } from "@/lib/utils/formatters";
import { cardStyles } from "@/lib/utils/styles";
import type { KPISummary, PeriodComparison } from "@/lib/types";
import { ComparisonBadge } from "./VarianceBadge";

interface PrimeCostCardProps {
  summary: KPISummary;
  comparison?: PeriodComparison;
  animationDelay: string;
}

function getPrimeStatus(pct: number): {
  status: "good" | "warning" | "danger";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
} {
  if (pct < 60) {
    return {
      status: "good",
      label: "Excellent",
      icon: TrendingDown,
    };
  } else if (pct < 65) {
    return {
      status: "warning",
      label: "Target",
      icon: TrendingUp,
    };
  } else {
    return {
      status: "danger",
      label: "High",
      icon: TrendingUp,
    };
  }
}

export function PrimeCostCard({ summary, comparison, animationDelay }: PrimeCostCardProps) {
  const { avgPrimeCostPct, avgFoodCostPct, avgLabourPct } = summary;
  const { status, label, icon: Icon } = getPrimeStatus(avgPrimeCostPct);

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
          Prime Cost
        </p>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            "bg-[#ffc814]/10 dark:bg-[#ffc814]/20"
          )}
        >
          <CircleDollarSign className="size-5 text-[#ffc814]" />
        </div>
      </div>

      <p className="metric-value text-3xl leading-none tracking-tight text-foreground mb-3">
        {formatPct(avgPrimeCostPct)}
      </p>

      <div className="flex items-center gap-2 mb-3">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            status === "good"
              ? "bg-[#009a44]/10 text-[#009a44] dark:bg-[#009a44]/20 dark:text-[#009a44]"
              : status === "warning"
                ? "bg-[#ffda28]/10 text-[#ffc814] dark:bg-[#ffda28]/20 dark:text-[#ffda28]"
                : "bg-[#f3001d]/10 text-[#f3001d] dark:bg-[#f3001d]/20 dark:text-[#ff5050]"
          )}
        >
          <Icon className="size-3" />
          {label}
        </span>
        <span className="text-xs text-muted-foreground">
          Target: &lt; 60%
        </span>
      </div>

      {comparison && comparison.primeCostChange !== undefined && (
        <div className="mt-1 mb-3">
          <ComparisonBadge value={comparison.primeCostChange} suffix=" pp" invert />
        </div>
      )}

      {/* Breakdown */}
      <div className="space-y-2 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Food Cost:</span>
            {comparison && comparison.foodCostChange !== undefined && (
              <ComparisonBadge value={comparison.foodCostChange} suffix=" pp" invert />
            )}
          </div>
          <span className="font-semibold tabular-nums">
            {formatPct(avgFoodCostPct)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Arbeidskosten:</span>
            {comparison && comparison.labourChange !== undefined && (
              <ComparisonBadge value={comparison.labourChange} suffix=" pp" invert />
            )}
          </div>
          <span className="font-semibold tabular-nums">
            {formatPct(avgLabourPct)}
          </span>
        </div>
      </div>
    </div>
  );
}
