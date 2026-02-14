"use client";

import { PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardStyles } from "@/lib/utils/styles";
import type { BezorgSummary } from "@/lib/types";

interface BezorgOrdersPerRunCardProps {
  summary: BezorgSummary;
}

export function BezorgOrdersPerRunCard({ summary }: BezorgOrdersPerRunCardProps) {
  return (
    <div className={cn(cardStyles, "animate-fade-up animate-lift stagger-6")}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Orders / rit
          </p>
          <p className="mt-2 text-3xl metric-value">
            {summary.avgOrdersPerRun.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl p-3 bg-[#8b5cf6]/10 dark:bg-[#8b5cf6]/20">
          <PackageCheck className="h-6 w-6 text-[#8b5cf6]" />
        </div>
      </div>
    </div>
  );
}
