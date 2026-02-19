"use client";

import type { ReactNode } from "react";
import { MetricSparkline } from "@/components/dashboard/MetricSparkline";
import { ComparisonBadge } from "@/components/dashboard/VarianceBadge";

interface KPIRibbonItemProps {
  label: string;
  value: string;
  icon: ReactNode;
  sparklineData?: number[];
  sparklinePositive?: boolean;
  comparisonValue?: number;
  comparisonSuffix?: string;
  comparisonInvert?: boolean;
  className?: string;
}

export function KPIRibbonItem({
  label,
  value,
  icon,
  sparklineData,
  sparklinePositive = true,
  comparisonValue,
  comparisonSuffix = "%",
  comparisonInvert = false,
  className,
}: KPIRibbonItemProps) {
  return (
    <div className={`flex flex-col gap-1 px-4 py-4 ${className ?? ""}`}>
      <div className="flex items-center gap-1.5">
        <span className="text-[#6B6B6B]">{icon}</span>
        <span className="text-[10px] font-bold font-sans uppercase tracking-[0.5px] text-[#6B6B6B]">
          {label}
        </span>
      </div>
      <p className="text-[20px] font-bold font-sans metric-value text-foreground">{value}</p>
      <div className="flex items-center gap-2">
        {sparklineData && sparklineData.length > 0 && (
          <MetricSparkline data={sparklineData} positive={sparklinePositive} />
        )}
        {comparisonValue !== undefined && (
          <ComparisonBadge
            value={comparisonValue}
            suffix={comparisonSuffix}
            invert={comparisonInvert}
          />
        )}
      </div>
    </div>
  );
}
