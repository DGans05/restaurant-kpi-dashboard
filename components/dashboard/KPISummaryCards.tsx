"use client";

import type { KPISummary, PeriodComparison, KPISparklines } from "@/lib/types";
import { RevenueCard } from "./RevenueCard";
import { LabourCostCard } from "./LabourCostCard";
import { OrdersCard } from "./OrdersCard";
import { ProductivityCard } from "./ProductivityCard";
import { PrimeCostCard } from "./PrimeCostCard";

interface KPISummaryCardsProps {
  summary: KPISummary;
  comparison?: PeriodComparison;
  sparklines?: KPISparklines;
}

export function KPISummaryCards({ summary, comparison, sparklines }: KPISummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <RevenueCard
        summary={summary}
        comparison={comparison}
        sparklineData={sparklines?.revenue}
        animationDelay="stagger-1"
      />
      <LabourCostCard
        summary={summary}
        comparison={comparison}
        sparklineData={sparklines?.labourPct}
        animationDelay="stagger-2"
      />
      <OrdersCard
        summary={summary}
        comparison={comparison}
        sparklineData={sparklines?.orders}
        animationDelay="stagger-3"
      />
      <ProductivityCard
        summary={summary}
        comparison={comparison}
        sparklineData={sparklines?.productivity}
        animationDelay="stagger-4"
      />
      <PrimeCostCard
        summary={summary}
        comparison={comparison}
        animationDelay="stagger-5"
      />
    </div>
  );
}
