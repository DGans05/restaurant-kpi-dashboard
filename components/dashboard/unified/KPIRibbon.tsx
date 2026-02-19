"use client";

import {
  DollarSign,
  Users,
  UtensilsCrossed,
  PieChart,
  ShoppingCart,
  Gauge,
} from "lucide-react";
import { panelStyles } from "@/lib/utils/styles";
import { formatEUR, formatPct, formatNumber, formatEURWithCents } from "@/lib/utils/formatters";
import { KPIRibbonItem } from "./KPIRibbonItem";
import type { KPISummary, PeriodComparison, KPISparklines } from "@/lib/types";

interface KPIRibbonProps {
  summary: KPISummary;
  comparison?: PeriodComparison;
  sparklines?: KPISparklines;
}

export function KPIRibbon({ summary, comparison, sparklines }: KPIRibbonProps) {
  return (
    <div className={`${panelStyles} animate-fade-up`}>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-y sm:divide-y-0 lg:divide-y-0">
        {/* Row dividers handled via border-r on non-last items per row */}
        <KPIRibbonItem
          label="Netto Omzet"
          value={formatEUR(summary.totalNetRevenue)}
          icon={<DollarSign className="size-3.5" />}
          sparklineData={sparklines?.revenue}
          sparklinePositive={true}
          comparisonValue={comparison?.revenueChange}
          comparisonSuffix="%"
          className="border-r border-border"
        />
        <KPIRibbonItem
          label="Arbeid %"
          value={formatPct(summary.avgLabourPct)}
          icon={<Users className="size-3.5" />}
          sparklineData={sparklines?.labourPct}
          sparklinePositive={false}
          comparisonValue={comparison?.labourChange}
          comparisonSuffix="pp"
          comparisonInvert={true}
          className="lg:border-r lg:border-border"
        />
        <KPIRibbonItem
          label="Voedsel %"
          value={formatPct(summary.avgFoodCostPct)}
          icon={<UtensilsCrossed className="size-3.5" />}
          comparisonValue={comparison?.foodCostChange}
          comparisonSuffix="pp"
          comparisonInvert={true}
          className="border-r border-border"
        />
        <KPIRibbonItem
          label="Prime Cost"
          value={formatPct(summary.avgPrimeCostPct)}
          icon={<PieChart className="size-3.5" />}
          comparisonValue={comparison?.primeCostChange}
          comparisonSuffix="pp"
          comparisonInvert={true}
          className="lg:border-r lg:border-border"
        />
        <KPIRibbonItem
          label="Bestellingen"
          value={formatNumber(summary.totalOrders)}
          icon={<ShoppingCart className="size-3.5" />}
          sparklineData={sparklines?.orders}
          sparklinePositive={true}
          comparisonValue={comparison?.ordersChange}
          comparisonSuffix="%"
          className="border-r border-border"
        />
        <KPIRibbonItem
          label="Productiviteit"
          value={`${formatEURWithCents(summary.avgLabourProductivity)}/u`}
          icon={<Gauge className="size-3.5" />}
          sparklineData={sparklines?.productivity}
          sparklinePositive={true}
          comparisonValue={comparison?.productivityChange}
          comparisonSuffix="%"
        />
      </div>
    </div>
  );
}
