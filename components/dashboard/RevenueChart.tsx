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
  embedded?: boolean;
}

export function RevenueChart({ data, embedded = false }: RevenueChartProps) {
  if (data.length === 0) {
    if (embedded) {
      return <p className="text-sm text-muted-foreground">Geen data beschikbaar</p>;
    }
    return (
      <div className={cardStyles}>
        <h3 className="text-2xl font-display">OMZET</h3>
        <p className="mt-2 text-sm text-muted-foreground">Geen data beschikbaar</p>
      </div>
    );
  }

  const chart = (
    <ResponsiveContainer width="100%" height={embedded ? 260 : 280} className="touch-manipulation">
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
  );

  if (embedded) {
    return (
      <div>
        <h3 className="font-display font-bold text-[18px] text-[#1D2532] mb-1">OMZET</h3>
        <p className="mb-4 text-[12px] font-sans uppercase tracking-[0.6px] text-[#6B6B6B]">
          Dagelijkse bruto/netto omzet vs plan
        </p>
        {chart}
      </div>
    );
  }

  return (
    <div className={`animate-fade-up animate-lift stagger-5 ${cardStyles}`}>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h3 className="font-display font-bold text-[18px] text-[#1D2532]">OMZET</h3>
          <p className="mt-1 text-[12px] font-sans uppercase tracking-[0.6px] text-[#6B6B6B]">
            Dagelijkse bruto/netto omzet vs plan
          </p>
        </div>
      </div>
      {chart}
    </div>
  );
}
