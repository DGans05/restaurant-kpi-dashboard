"use client";

import { cn } from "@/lib/utils";
import type { DateRangeDays } from "@/lib/types";

const options: { label: string; value: DateRangeDays }[] = [
  { label: "7D", value: 7 },
  { label: "14D", value: 14 },
  { label: "28D", value: 28 },
];

interface DateRangeFilterProps {
  value: DateRangeDays;
  onChange: (days: DateRangeDays) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
            value === opt.value
              ? "bg-primary text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
