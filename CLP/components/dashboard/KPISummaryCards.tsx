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
import type { KPISummary } from "@/lib/types";

/**
 * Format value as EUR with nl-NL locale
 * Usage: formatEUR(42000) => "€ 42.000"
 */
function formatEUR(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format value as EUR with decimals for avg order value
 * Usage: formatEURWithCents(42.50) => "€ 42,50"
 */
function formatEURWithCents(value: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage with 1 decimal
 * Usage: formatPct(23.4567) => "23.5%"
 */
function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Format number with nl-NL locale
 * Usage: formatNumber(1234) => "1.234"
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat("nl-NL").format(value);
}

/**
 * VarianceBadge shows plan-vs-actual variance
 * For revenue: negative = bad (red), positive = good (green)
 * For labour: positive = bad (higher costs = red), negative = good (green) → use invert=true
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
  const isNeutral = Math.abs(value) < 0.1;
  const isGood = invert ? !isPositive : isPositive;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        isNeutral
          ? "bg-muted text-muted-foreground"
          : isGood
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
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
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
  },
  {
    key: "labour",
    title: "Arbeidskosten",
    icon: Users,
    iconBg: "bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400",
  },
  {
    key: "orders",
    title: "Bestellingen",
    icon: ShoppingCart,
    iconBg: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
  },
  {
    key: "productivity",
    title: "Productiviteit",
    icon: Timer,
    iconBg:
      "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <div
          key={card.key}
          className={cn(
            "animate-fade-up group relative rounded-xl bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] dark:shadow-none dark:border dark:border-border",
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

          <p className="text-3xl font-semibold leading-none tracking-tight text-foreground mb-3">
            {card.value}
          </p>

          <div className="flex items-center gap-2">
            {card.variance}
            <span className="text-xs text-muted-foreground">{card.note}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
