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
}

function formatCurrencyAxis(value: number): string {
  return `€${value.toFixed(0)}`;
}

export function LabourChart({ data }: LabourChartProps) {
  if (data.length === 0) {
    return (
      <div className={cardStyles}>
        <h3 className="text-2xl font-display">ARBEIDSKOSTEN</h3>
        <p className="mt-2 text-sm text-muted-foreground">Geen data beschikbaar</p>
      </div>
    );
  }

  return (
    <div className={`animate-fade-up animate-lift stagger-6 ${cardStyles}`}>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h3 className="text-2xl font-display text-foreground">
            ARBEIDSKOSTEN
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Dagelijkse arbeidskosten vs plan
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280} className="touch-manipulation">
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
    </div>
  );
}
