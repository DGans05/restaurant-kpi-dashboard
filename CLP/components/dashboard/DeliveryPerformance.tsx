"use client";

import { format, parseISO } from "date-fns";
import { nl } from "date-fns/locale/nl";
import { Truck, Clock, ChefHat, Route } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import type { DeliveryDataPoint } from "@/lib/types";

interface DeliveryPerformanceProps {
  data: DeliveryDataPoint[];
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  animationDelay: string;
}

function MetricCard({ title, value, icon, bgColor, animationDelay }: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-border animate-fade-up",
        animationDelay
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
        </div>
        <div className={cn("rounded-lg p-3", bgColor)}>{icon}</div>
      </div>
    </div>
  );
}

export function DeliveryPerformance({ data }: DeliveryPerformanceProps) {
  if (!data || data.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-lg font-semibold">Bezorgprestaties</h2>
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    );
  }

  // Calculate averages
  const avgDeliveryRate30min =
    data.reduce((sum, point) => sum + point.deliveryRate30min, 0) / data.length;
  const avgOnTimeDeliveryMins =
    data.reduce((sum, point) => sum + point.onTimeDeliveryMins, 0) / data.length;
  const avgMakeTimeMins =
    data.reduce((sum, point) => sum + point.makeTimeMins, 0) / data.length;
  const avgDriveTimeMins =
    data.reduce((sum, point) => sum + point.driveTimeMins, 0) / data.length;

  // Format chart data
  const chartData = data.map((point) => ({
    ...point,
    formattedDate: format(parseISO(point.date), "d MMM"),
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Bezorgprestaties</h2>

      {/* Metric Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Bezorgd < 30 min"
          value={`${avgDeliveryRate30min.toFixed(1)}%`}
          icon={<Truck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
          bgColor="bg-emerald-100 dark:bg-emerald-950"
          animationDelay="stagger-7"
        />
        <MetricCard
          title="OTD"
          value={`${avgOnTimeDeliveryMins.toFixed(1)} min`}
          icon={<Clock className="h-6 w-6 text-sky-600 dark:text-sky-400" />}
          bgColor="bg-sky-100 dark:bg-sky-950"
          animationDelay="stagger-7"
        />
        <MetricCard
          title="Maaktijd"
          value={`${avgMakeTimeMins.toFixed(1)} min`}
          icon={<ChefHat className="h-6 w-6 text-violet-600 dark:text-violet-400" />}
          bgColor="bg-violet-100 dark:bg-violet-950"
          animationDelay="stagger-7"
        />
        <MetricCard
          title="Rijtijd"
          value={`${avgDriveTimeMins.toFixed(1)} min`}
          icon={<Route className="h-6 w-6 text-rose-600 dark:text-rose-400" />}
          bgColor="bg-rose-100 dark:bg-rose-950"
          animationDelay="stagger-7"
        />
      </div>

      {/* Line Chart */}
      <div className="rounded-xl bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-border animate-fade-up stagger-8">
        <h3 className="mb-4 text-base font-semibold">Dagelijkse Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="formattedDate"
              className="text-xs"
              tick={{ fill: "var(--muted-foreground)" }}
            />
            <YAxis
              yAxisId="left"
              className="text-xs"
              tick={{ fill: "var(--muted-foreground)" }}
              label={{
                value: "Percentage (%)",
                angle: -90,
                position: "insideLeft",
                style: { fill: "var(--muted-foreground)", fontSize: 12 },
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fill: "var(--muted-foreground)" }}
              label={{
                value: "Minuten",
                angle: 90,
                position: "insideRight",
                style: { fill: "var(--muted-foreground)", fontSize: 12 },
              }}
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
              labelFormatter={(value) => {
                const dataPoint = chartData.find((d) => d.formattedDate === value);
                if (dataPoint) {
                  return format(parseISO(dataPoint.date), "EEEE d MMM", { locale: nl });
                }
                return String(value);
              }}
              formatter={(value) => `${Number(value).toFixed(1)}`}
            />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="deliveryRate30min"
              stroke="rgb(16, 185, 129)"
              strokeWidth={2}
              name="Bezorgd < 30 min (%)"
              dot={{ fill: "rgb(16, 185, 129)", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="makeTimeMins"
              stroke="rgb(139, 92, 246)"
              strokeWidth={2}
              name="Maaktijd (min)"
              dot={{ fill: "rgb(139, 92, 246)", r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="driveTimeMins"
              stroke="rgb(244, 63, 94)"
              strokeWidth={2}
              name="Rijtijd (min)"
              dot={{ fill: "rgb(244, 63, 94)", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
