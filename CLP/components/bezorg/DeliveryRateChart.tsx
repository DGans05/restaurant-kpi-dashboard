"use client";

import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale/nl";
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { BezorgChartDataPoint } from "@/lib/types";
import { cardStyles, tooltipContentStyle } from "@/lib/utils/styles";

interface DeliveryRateChartProps {
  data: BezorgChartDataPoint[];
}

export function DeliveryRateChart({ data }: DeliveryRateChartProps) {
  if (data.length === 0) {
    return (
      <div className={cardStyles}>
        <h3 className="text-2xl font-display">BEZORGPERCENTAGE</h3>
        <p className="mt-2 text-sm text-muted-foreground">Geen data beschikbaar</p>
      </div>
    );
  }

  return (
    <div className={`animate-fade-up animate-lift stagger-7 ${cardStyles}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-display text-foreground">BEZORGPERCENTAGE</h3>
        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Dagelijks % bezorgd binnen 30 &amp; 20 minuten
        </p>
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
            tickFormatter={(v: number) => `${v.toFixed(0)}%`}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelFormatter={(d) =>
              format(parseISO(String(d)), "EEEE d MMM", { locale: nl })
            }
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                deliveryRate30min: "< 30 min",
                deliveryRate20min: "< 20 min",
              };
              return [
                `${Number(value).toFixed(1)}%`,
                labels[String(name)] || String(name),
              ];
            }}
            cursor={{ fill: "#009a44", opacity: 0.08 }}
          />
          <Legend
            formatter={(value) => {
              const labels: Record<string, string> = {
                deliveryRate30min: "< 30 min",
                deliveryRate20min: "< 20 min",
              };
              return labels[String(value)] || String(value);
            }}
          />
          <Bar
            dataKey="deliveryRate30min"
            name="deliveryRate30min"
            fill="#009a44"
            radius={[6, 6, 0, 0]}
            barSize={14}
          />
          <Bar
            dataKey="deliveryRate20min"
            name="deliveryRate20min"
            fill="#0d9488"
            radius={[6, 6, 0, 0]}
            barSize={14}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
