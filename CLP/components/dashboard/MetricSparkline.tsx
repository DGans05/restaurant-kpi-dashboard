"use client";

import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MetricSparklineProps {
  data: number[];
  color?: string;
  positive?: boolean; // If true, up is good; if false, down is good
}

/**
 * MetricSparkline - Tiny trend visualization for KPI cards
 * Shows last 7 data points with smooth line animation
 */
export function MetricSparkline({
  data,
  color = "#009a44",
  positive = true,
}: MetricSparklineProps) {
  if (!data || data.length === 0) {
    return null;
  }

  // Convert array to chart data format
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  // Determine if trend is positive or negative
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const isUp = lastValue > firstValue;
  const trendColor =
    positive === isUp
      ? "#009a44" // Good trend - green
      : isUp
        ? "#f3001d" // Up but bad - red
        : "#009a44"; // Down but good - green

  return (
    <div className="relative h-[30px] w-[60px] opacity-60 group-hover:opacity-100 transition-opacity">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color || trendColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={800}
            animationEasing="ease-in-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
