"use client";

import {
  Euro,
  Users,
  ShoppingCart,
  Timer,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEUR, formatEURWithCents, formatPct, formatNumber } from "@/lib/utils/formatters";
import { cardStyles } from "@/lib/utils/styles";
import type { KPISummary } from "@/lib/types";
import { PrimeCostCard } from "./PrimeCostCard";

/**
 * VarianceBadge shows plan-vs-actual variance with threshold-based coloring
 * For revenue: negative = bad (red), positive = good (green)
 * For labour: positive = bad (higher costs = red), negative = good (green) → use invert=true
 *
 * Thresholds:
 * - Excellent (green): < 2% variance
 * - Warning (yellow): 2-5% variance
 * - Danger (red): > 5% variance
 */
function VarianceBadge({
  value,
  invert = false,
  suffix = "%",
}: {
  value: number;
  invert?: boolean;
  suffix?: string;
}) {
  const isPositive = value > 0;
  const absValue = Math.abs(value);
  const isNeutral = absValue < 0.1;
  const isGood = invert ? !isPositive : isPositive;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  // Determine status based on absolute variance magnitude
  let status: "good" | "warning" | "danger";
  if (absValue < 2) {
    status = "good";
  } else if (absValue < 5) {
    status = "warning";
  } else {
    status = "danger";
  }

  // If it's a "bad" direction (e.g., negative revenue), show red regardless of magnitude
  if (!isNeutral && !isGood) {
    status = "danger";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        isNeutral
          ? "bg-muted text-muted-foreground"
          : status === "good"
            ? "bg-[#009a44]/10 text-[#009a44] dark:bg-[#009a44]/20 dark:text-[#009a44]"
            : status === "warning"
              ? "bg-[#ffda28]/10 text-[#ffc814] dark:bg-[#ffda28]/20 dark:text-[#ffda28]"
              : "bg-[#f3001d]/10 text-[#f3001d] dark:bg-[#f3001d]/20 dark:text-[#ff5050]"
      )}
    >
      <Icon className="size-3" />
      {isPositive ? "+" : ""}
      {value.toFixed(1)}
      {suffix}
    </span>
  );
}

interface KPISummaryCardsProps {
  summary: KPISummary;
}

const cardMeta = [
  {
    key: "revenue",
    title: "Netto Omzet",
    icon: Euro,
    iconBg:
      "bg-[#009a44]/10 text-[#009a44] dark:bg-[#009a44]/20 dark:text-[#009a44]",
  },
  {
    key: "labour",
    title: "Arbeidskosten",
    icon: Users,
    iconBg: "bg-[#ffa51d]/10 text-[#ffa51d] dark:bg-[#ffa51d]/20 dark:text-[#ffa51d]",
  },
  {
    key: "orders",
    title: "Bestellingen",
    icon: ShoppingCart,
    iconBg: "bg-[#006dec]/10 text-[#006dec] dark:bg-[#006dec]/20 dark:text-[#006dec]",
  },
  {
    key: "productivity",
    title: "Productiviteit",
    icon: Timer,
    iconBg:
      "bg-[#ffda28]/10 text-[#ffc814] dark:bg-[#ffda28]/20 dark:text-[#ffda28]",
  },
] as const;

export function KPISummaryCards({ summary }: KPISummaryCardsProps) {
  const cards = [
    {
      ...cardMeta[0],
      value: formatEUR(summary.totalNetRevenue),
      variance: <VarianceBadge value={summary.revenueVariance} suffix="%" />,
      note: `Plan: ${formatEUR(summary.totalPlannedRevenue)}`,
    },
    {
      ...cardMeta[1],
      value: formatPct(summary.avgLabourPct),
      variance: (
        <VarianceBadge
          value={summary.labourVariance}
          invert
          suffix=" pp"
        />
      ),
      note: `Plan: ${formatPct(summary.avgPlannedLabourPct)}`,
    },
    {
      ...cardMeta[2],
      value: formatNumber(summary.totalOrders),
      variance: null,
      note: `Gem. ${formatEURWithCents(summary.avgOrderValue)}/bestelling`,
    },
    {
      ...cardMeta[3],
      value: formatEURWithCents(summary.avgLabourProductivity),
      variance: null,
      note: "Netto omzet per uur",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, i) => (
        <div
          key={card.key}
          className={cn(
            "animate-fade-up animate-lift group relative",
            cardStyles,
            `stagger-${i + 1}`
          )}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {card.title}
            </p>
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-lg",
                card.iconBg
              )}
            >
              <card.icon className="size-5" />
            </div>
          </div>

          <p className="metric-value text-3xl leading-none tracking-tight text-foreground mb-3">
            {card.value}
          </p>

          <div className="flex items-center gap-2">
            {card.variance}
            <span className="text-xs text-muted-foreground">{card.note}</span>
          </div>
        </div>
      ))}

      {/* Prime Cost Card - 5th KPI */}
      <PrimeCostCard summary={summary} animationDelay="stagger-5" />
    </div>
  );
}
