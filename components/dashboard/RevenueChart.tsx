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
import { formatEUR, formatEuroAxis } from "@/lib/utils/formatters";
import { cardStyles, tooltipContentStyle } from "@/lib/utils/styles";

interface RevenueChartProps {
  data: ChartDataPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className={cardStyles}>
        <h3 className="text-2xl font-display">OMZET</h3>
        <p className="mt-2 text-sm text-muted-foreground">Geen data beschikbaar</p>
      </div>
    );
  }

  return (
    <div className={`animate-fade-up animate-lift stagger-5 ${cardStyles}`}>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h3 className="text-2xl font-display text-foreground">
            OMZET
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Dagelijkse bruto/netto omzet vs plan
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280} className="touch-manipulation">
        <ComposedChart data={data}>
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
            tickFormatter={formatEuroAxis}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelFormatter={(d) => format(parseISO(String(d)), "EEEE d MMM", { locale: nl })}
            formatter={(value, name) => {
              const labels: { [key: string]: string } = {
                netRevenue: "Netto Omzet",
                grossRevenue: "Bruto Omzet",
                plannedRevenue: "Plan"
              };
              return [formatEUR(Number(value)), labels[name as string] || name];
            }}
            cursor={{ fill: "#009a44", opacity: 0.08 }}
          />
          <Bar
            dataKey="grossRevenue"
            fill="#a3e6b4"
            radius={[6, 6, 0, 0]}
            barSize={24}
            stackId="a"
          />
          <Bar
            dataKey="netRevenue"
            fill="#009a44"
            radius={[6, 6, 0, 0]}
            barSize={24}
            stackId="a"
          />
          <Line
            dataKey="plannedRevenue"
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
