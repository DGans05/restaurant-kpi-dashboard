"use client";

import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardStyles } from "@/lib/utils/styles";
import type { BezorgSummary } from "@/lib/types";

interface BezorgRate20CardProps {
  summary: BezorgSummary;
}

export function BezorgRate20Card({ summary }: BezorgRate20CardProps) {
  return (
    <div className={cn(cardStyles, "animate-fade-up animate-lift stagger-2")}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Bezorgd &lt; 20 min
          </p>
          <p className="mt-2 text-3xl metric-value">
            {summary.avgDeliveryRate20min.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl p-3 bg-[#0d9488]/10 dark:bg-[#0d9488]/20">
          <Timer className="h-6 w-6 text-[#0d9488]" />
        </div>
      </div>
    </div>
  );
}
