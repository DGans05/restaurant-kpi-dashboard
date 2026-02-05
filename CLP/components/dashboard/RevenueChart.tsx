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

interface RevenueChartProps {
  data: ChartDataPoint[];
}

function formatEuroAxis(value: number): string {
  return `€${(value / 1000).toFixed(1)}k`;
}

function formatEuroTooltip(value: number): string {
  return value.toLocaleString("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function RevenueChart({ data }: RevenueChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-border">
        <h3 className="text-lg font-semibold">Omzet</h3>
        <p className="mt-2 text-sm text-muted-foreground">Geen data beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up stagger-5 rounded-xl bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-border">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Omzet
          </h3>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
            Dagelijkse netto omzet vs plan
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            strokeOpacity={0.3}
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
            contentStyle={{
              backgroundColor: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              color: "var(--foreground)",
              fontSize: "12px",
              padding: "8px 12px",
            }}
            labelFormatter={(d) => format(parseISO(String(d)), "EEEE d MMM", { locale: nl })}
            formatter={(value, name) => {
              const label = name === "netRevenue" ? "Netto Omzet" : "Plan";
              return [formatEuroTooltip(Number(value)), label];
            }}
            cursor={{ fill: "var(--primary)", opacity: 0.1 }}
          />
          <Bar
            dataKey="netRevenue"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Line
            dataKey="plannedRevenue"
            stroke="#9ca3af"
            strokeDasharray="5 5"
            dot={false}
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
