"use client";

import { Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardStyles } from "@/lib/utils/styles";
import type { BezorgSummary } from "@/lib/types";

interface BezorgDriveTimeCardProps {
  summary: BezorgSummary;
}

export function BezorgDriveTimeCard({ summary }: BezorgDriveTimeCardProps) {
  return (
    <div className={cn(cardStyles, "animate-fade-up animate-lift stagger-5")}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Rijtijd
          </p>
          <p className="mt-2 text-3xl metric-value">
            {summary.avgDriveTimeMins.toFixed(1)} min
          </p>
        </div>
        <div className="rounded-xl p-3 bg-[#f3001d]/10 dark:bg-[#f3001d]/20">
          <Route className="h-6 w-6 text-[#f3001d]" />
        </div>
      </div>
    </div>
  );
}
