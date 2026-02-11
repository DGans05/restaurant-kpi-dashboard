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
import type { WorkedHoursDataPoint } from "@/lib/types";
import { formatEURWithCents } from "@/lib/utils/formatters";
import { cardStyles, tooltipContentStyle } from "@/lib/utils/styles";

interface WorkedHoursChartProps {
  data: WorkedHoursDataPoint[];
}

export function WorkedHoursChart({ data }: WorkedHoursChartProps) {
  if (data.length === 0) {
    return (
      <div className={cardStyles}>
        <h3 className="text-2xl font-display">GEWERKTE UREN</h3>
        <p className="mt-2 text-sm text-muted-foreground">Geen data beschikbaar</p>
      </div>
    );
  }

  return (
    <div className={`animate-fade-up animate-lift stagger-7 ${cardStyles}`}>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h3 className="text-2xl font-display text-foreground">
            GEWERKTE UREN
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Dagelijkse uren &amp; productiviteit (€/uur)
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
            yAxisId="left"
            tickFormatter={(v: number) => `${v.toFixed(0)}u`}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={(v: number) => `€${v.toFixed(0)}`}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelFormatter={(d) => format(parseISO(String(d)), "EEEE d MMM", { locale: nl })}
            formatter={(value, name) => {
              if (String(name) === "workedHours") {
                return [`${Number(value).toFixed(1)} uur`, "Gewerkte uren"];
              }
              return [formatEURWithCents(Number(value)), "Productiviteit"];
            }}
            cursor={{ fill: "#006dec", opacity: 0.08 }}
          />
          <Bar
            yAxisId="left"
            dataKey="workedHours"
            name="workedHours"
            fill="#006dec"
            radius={[6, 6, 0, 0]}
            barSize={24}
          />
          <Line
            yAxisId="right"
            dataKey="labourProductivity"
            name="labourProductivity"
            stroke="#009a44"
            dot={false}
            strokeWidth={2.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
