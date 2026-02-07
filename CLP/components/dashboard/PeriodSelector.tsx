"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPeriodLabel,
  canGoPrev,
  canGoNext,
  getPrevPeriod,
  getNextPeriod,
  convertPeriodKey,
} from "@/lib/utils/period-dates";
import type { PeriodView } from "@/lib/types";

const viewOptions: { label: string; value: PeriodView }[] = [
  { label: "Week", value: "week" },
  { label: "Maand", value: "month" },
];

interface PeriodSelectorProps {
  view: PeriodView;
  periodKey: string; // "2026-W06" or "2026-01"
  onChange: (view: PeriodView, periodKey: string) => void;
}

export function PeriodSelector({
  view,
  periodKey,
  onChange,
}: PeriodSelectorProps) {
  const label = getPeriodLabel(view, periodKey);
  const prevDisabled = !canGoPrev(view, periodKey);
  const nextDisabled = !canGoNext(view, periodKey);

  const handleViewChange = (newView: PeriodView) => {
    if (newView === view) return;
    const newKey = convertPeriodKey(view, newView, periodKey);
    onChange(newView, newKey);
  };

  return (
    <div className="flex flex-col items-end gap-2">
      {/* View toggle */}
      <div className="inline-flex items-center gap-1 rounded-2xl border border-border bg-card p-1">
        {viewOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleViewChange(opt.value)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 touch-manipulation",
              view === opt.value
                ? "bg-primary text-white shadow-[0_4px_8px_rgba(0,154,68,0.2)]"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Period navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(view, getPrevPeriod(view, periodKey))}
          disabled={prevDisabled}
          className={cn(
            "flex items-center justify-center rounded-lg min-w-[44px] min-h-[44px] p-2.5 transition-colors touch-manipulation",
            prevDisabled
              ? "cursor-not-allowed text-muted-foreground/40"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          aria-label="Vorige periode"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <span className="min-w-[140px] text-center text-sm font-medium text-foreground">
          {label}
        </span>

        <button
          onClick={() => onChange(view, getNextPeriod(view, periodKey))}
          disabled={nextDisabled}
          className={cn(
            "flex items-center justify-center rounded-lg min-w-[44px] min-h-[44px] p-2.5 transition-colors touch-manipulation",
            nextDisabled
              ? "cursor-not-allowed text-muted-foreground/40"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          aria-label="Volgende periode"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
