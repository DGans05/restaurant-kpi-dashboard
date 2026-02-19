"use client";

import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale/nl";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ChartDataPoint } from "@/lib/types";
import { formatEUR } from "@/lib/utils/formatters";
import { cardStyles, tooltipContentStyle } from "@/lib/utils/styles";
import { ThresholdZone } from "./ThresholdZone";

interface LabourChartProps {
  data: ChartDataPoint[];
  embedded?: boolean;
}

function formatCurrencyAxis(value: number): string {
  return `€${value.toFixed(0)}`;
}

export function LabourChart({ data, embedded = false }: LabourChartProps) {
  if (data.length === 0) {
    if (embedded) {
      return <p className="text-sm text-muted-foreground">Geen data beschikbaar</p>;
    }
    return (
      <div className={cardStyles}>
        <h3 className="text-2xl font-display">ARBEIDSKOSTEN</h3>
        <p className="mt-2 text-sm text-muted-foreground">Geen data beschikbaar</p>
      </div>
    );
  }

  const chart = (
    <ResponsiveContainer width="100%" height={embedded ? 260 : 280} className="touch-manipulation">
        <ComposedChart data={data}>
          {/* Threshold zones for labour % */}
          <ThresholdZone
            yAxisId="left"
            type="labour"
            dataMin={0}
            dataMax={data.reduce((max, d) => d.labourPct > max ? d.labourPct : max, 0) * 1.1}
          />
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            strokeOpacity={0.5}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => format(parseISO(d), "d MMM")}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatCurrencyAxis}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelFormatter={(d) => format(parseISO(String(d)), "EEEE d MMM", { locale: nl })}
            formatter={(value, name) => {
              const label = String(name) === "labourCost" ? "Arbeidskosten" : "Plan";
              return [formatEUR(Number(value)), label];
            }}
            cursor={{ fill: "#ffa51d", opacity: 0.08 }}
          />
          <Bar
            dataKey="labourCost"
            name="labourCost"
            fill="#ffa51d"
            radius={[6, 6, 0, 0]}
            barSize={24}
          />
          <Line
            dataKey="plannedLabourCost"
            name="plannedLabourCost"
            stroke="#ffda28"
            strokeDasharray="5 5"
            dot={false}
            strokeWidth={2.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
  );

  if (embedded) {
    return (
      <div>
        <h3 className="font-display font-bold text-[18px] text-[#1D2532] mb-1">ARBEIDSKOSTEN</h3>
        <p className="mb-4 text-[12px] font-sans uppercase tracking-[0.6px] text-[#6B6B6B]">
          Dagelijkse arbeidskosten vs plan
        </p>
        {chart}
      </div>
    );
  }

  return (
    <div className={`animate-fade-up animate-lift stagger-6 ${cardStyles}`}>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h3 className="font-display font-bold text-[18px] text-[#1D2532]">ARBEIDSKOSTEN</h3>
          <p className="mt-1 text-[12px] font-sans uppercase tracking-[0.6px] text-[#6B6B6B]">
            Dagelijkse arbeidskosten vs plan
          </p>
        </div>
      </div>
      {chart}
    </div>
  );
}
