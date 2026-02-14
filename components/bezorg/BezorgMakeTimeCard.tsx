"use client";

import { ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardStyles } from "@/lib/utils/styles";
import type { BezorgSummary } from "@/lib/types";

interface BezorgMakeTimeCardProps {
  summary: BezorgSummary;
}

export function BezorgMakeTimeCard({ summary }: BezorgMakeTimeCardProps) {
  return (
    <div className={cn(cardStyles, "animate-fade-up animate-lift stagger-4")}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Maaktijd
          </p>
          <p className="mt-2 text-3xl metric-value">
            {summary.avgMakeTimeMins.toFixed(1)} min
          </p>
        </div>
        <div className="rounded-xl p-3 bg-[#ffa51d]/10 dark:bg-[#ffa51d]/20">
          <ChefHat className="h-6 w-6 text-[#ffa51d]" />
        </div>
      </div>
    </div>
  );
}
