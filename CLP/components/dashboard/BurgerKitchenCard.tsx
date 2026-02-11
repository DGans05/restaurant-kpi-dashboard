"use client";

import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatEUR } from "@/lib/utils/formatters";
import { cardStyles } from "@/lib/utils/styles";
import type { KPISummary } from "@/lib/types";

interface BurgerKitchenCardProps {
  summary: KPISummary;
  animationDelay?: string;
}

export function BurgerKitchenCard({ summary, animationDelay = "stagger-6" }: BurgerKitchenCardProps) {
  const bkPct = summary.totalNetRevenue > 0
    ? (summary.totalBurgerKitchenRevenue / summary.totalNetRevenue) * 100
    : 0;

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
          BK Omzet
        </p>
        <div className="flex size-10 items-center justify-center rounded-lg bg-[#f3001d]/10 text-[#f3001d] dark:bg-[#f3001d]/20 dark:text-[#f3001d]">
          <Flame className="size-5" />
        </div>
      </div>

      <p className="metric-value text-3xl leading-none tracking-tight text-foreground mb-3">
        {formatEUR(summary.totalBurgerKitchenRevenue)}
      </p>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {bkPct.toFixed(1)}% van netto omzet
        </span>
      </div>
    </div>
  );
}
