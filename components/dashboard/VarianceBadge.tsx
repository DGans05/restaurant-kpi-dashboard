"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export function ComparisonBadge({
  value,
  suffix = "%",
  invert = false,
  label = "vs vorig",
}: {
  value: number;
  suffix?: string;
  invert?: boolean;
  label?: string;
}) {
  if (Math.abs(value) < 0.1) return null;
  const isPositive = value > 0;
  const isGood = invert ? !isPositive : isPositive;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-medium",
        isGood ? "text-[#009a44]" : "text-[#f3001d]"
      )}
    >
      <Icon className="size-2.5" />
      {isPositive ? "+" : ""}
      {value.toFixed(1)}
      {suffix} {label}
    </span>
  );
}

export function VarianceBadge({
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

  let status: "good" | "warning" | "danger";
  if (absValue < 2) {
    status = "good";
  } else if (absValue < 5) {
    status = "warning";
  } else {
    status = "danger";
  }

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
