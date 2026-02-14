"use client";

import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber, formatEURWithCents } from "@/lib/utils/formatters";
import { cardStyles } from "@/lib/utils/styles";
import type { KPISummary, PeriodComparison } from "@/lib/types";
import { MetricSparkline } from "./MetricSparkline";
import { ComparisonBadge } from "./VarianceBadge";

interface OrdersCardProps {
  summary: KPISummary;
  comparison?: PeriodComparison;
  sparklineData?: number[];
  animationDelay: string;
}

export function OrdersCard({ summary, comparison, sparklineData, animationDelay }: OrdersCardProps) {
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
          Bestellingen
        </p>
        <div className="flex size-10 items-center justify-center rounded-lg bg-[#006dec]/10 text-[#006dec] dark:bg-[#006dec]/20 dark:text-[#006dec]">
          <ShoppingCart className="size-5" />
        </div>
      </div>

      <p className="metric-value text-3xl leading-none tracking-tight text-foreground mb-3">
        {formatNumber(summary.totalOrders)}
      </p>

      {sparklineData && sparklineData.length > 1 && (
        <div className="mb-2">
          <MetricSparkline data={sparklineData} color="#006dec" positive />
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          Gem. {formatEURWithCents(summary.avgOrderValue)}/bestelling
        </span>
      </div>

      {comparison && comparison.ordersChange !== undefined && (
        <div className="mt-1">
          <ComparisonBadge value={comparison.ordersChange} suffix="%" />
        </div>
      )}
    </div>
  );
}
