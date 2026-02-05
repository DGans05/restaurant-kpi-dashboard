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

interface LabourChartProps {
  data: ChartDataPoint[];
}

function formatCurrency(value: number): string {
  return `€${value.toFixed(0)}`;
}

export function LabourChart({ data }: LabourChartProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-border">
        <h3 className="text-lg font-semibold">Arbeidskosten</h3>
        <p className="mt-2 text-sm text-muted-foreground">Geen data beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-up stagger-6 rounded-xl bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-border">
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Arbeidskosten
          </h3>
          <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
            Dagelijkse arbeidskosten vs plan
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
            tickFormatter={formatCurrency}
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
              const amount = Number(value).toLocaleString("nl-NL", {
                style: "currency",
                currency: "EUR",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              });
              const label = String(name) === "labourCost" ? "Arbeidskosten" : "Plan";
              return [amount, label];
            }}
            cursor={{ fill: "var(--muted)", opacity: 0.2 }}
          />
          <Bar
            dataKey="labourCost"
            name="labourCost"
            fill="#f43f5e"
            radius={[4, 4, 0, 0]}
            barSize={20}
          />
          <Line
            dataKey="plannedLabourCost"
            name="plannedLabourCost"
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
