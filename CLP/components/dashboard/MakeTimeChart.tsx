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
import type { MakeTimeDataPoint } from "@/lib/types";
import { cardStyles, tooltipContentStyle } from "@/lib/utils/styles";

interface MakeTimeChartProps {
  data: MakeTimeDataPoint[];
}

export function MakeTimeChart({ data }: MakeTimeChartProps) {
  if (data.length === 0) {
    return (
      <div className={cardStyles}>
        <h3 className="text-2xl font-display">MAAK- & RIJTIJD</h3>
        <p className="mt-2 text-sm text-muted-foreground">Geen data beschikbaar</p>
      </div>
    );
  }

  return (
    <div className={`animate-fade-up animate-lift stagger-8 ${cardStyles}`}>
      <div className="mb-6 flex items-baseline justify-between">
        <div>
          <h3 className="text-2xl font-display text-foreground">
            MAAK- &amp; RIJTIJD
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Dagelijkse maaktijd, rijtijd &amp; OTD (minuten)
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
            tickFormatter={(v: number) => `${v.toFixed(0)}m`}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            contentStyle={tooltipContentStyle}
            labelFormatter={(d) => format(parseISO(String(d)), "EEEE d MMM", { locale: nl })}
            formatter={(value, name) => {
              const labels: Record<string, string> = {
                makeTimeMins: "Maaktijd",
                driveTimeMins: "Rijtijd",
                onTimeDeliveryMins: "OTD",
              };
              return [`${Number(value).toFixed(1)} min`, labels[String(name)] || String(name)];
            }}
            cursor={{ fill: "#f3001d", opacity: 0.08 }}
          />
          <Bar
            dataKey="makeTimeMins"
            name="makeTimeMins"
            fill="#f3001d"
            radius={[6, 6, 0, 0]}
            barSize={12}
            stackId="times"
          />
          <Bar
            dataKey="driveTimeMins"
            name="driveTimeMins"
            fill="#ffa51d"
            radius={[6, 6, 0, 0]}
            barSize={12}
            stackId="times"
          />
          <Line
            dataKey="onTimeDeliveryMins"
            name="onTimeDeliveryMins"
            stroke="#006dec"
            dot={false}
            strokeWidth={2.5}
            strokeDasharray="5 5"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
