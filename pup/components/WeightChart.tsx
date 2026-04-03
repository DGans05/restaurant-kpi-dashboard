"use client";

import { useState } from "react";
import type { WeightLog } from "@/lib/types";

interface TooltipState {
  x: number;
  y: number;
  label: string;
}

interface WeightChartProps {
  entries: WeightLog[];
}

const PAD = { top: 24, right: 24, bottom: 44, left: 54 };
const VIEW_W = 600;
const VIEW_H = 280;
const CHART_W = VIEW_W - PAD.left - PAD.right;
const CHART_H = VIEW_H - PAD.top - PAD.bottom;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("nl-NL", { day: "numeric", month: "short" });
}

function yTicks(min: number, max: number): number[] {
  const step = 0.5;
  const ticks: number[] = [];
  const start = Math.floor(min / step) * step;
  for (let v = start; v <= max + 0.01; v = Math.round((v + step) * 100) / 100) {
    ticks.push(v);
  }
  return ticks;
}

export default function WeightChart({ entries }: WeightChartProps) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  if (entries.length === 0) {
    return (
      <div className="chart-empty">
        <span className="chart-empty-icon">⚖️</span>
        <span>Nog geen metingen — voeg de eerste toe!</span>
      </div>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );

  const weights = sorted.map((e) => e.weight_kg);
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  const minW = rawMin - 0.5;
  const maxW = rawMax + 0.5;
  const range = maxW - minW || 1;

  const n = sorted.length;

  const xScale = (i: number) => PAD.left + (n === 1 ? CHART_W / 2 : (i / (n - 1)) * CHART_W);
  const yScale = (w: number) => PAD.top + CHART_H - ((w - minW) / range) * CHART_H;

  const points = sorted.map((e, i) => ({ x: xScale(i), y: yScale(e.weight_kg), entry: e }));
  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Area fill polygon: line points + bottom-right + bottom-left
  const areaPoints = [
    ...points.map((p) => `${p.x},${p.y}`),
    `${points[points.length - 1].x},${PAD.top + CHART_H}`,
    `${points[0].x},${PAD.top + CHART_H}`
  ].join(" ");

  const ticks = yTicks(minW, maxW);

  // X-axis: show at most 6 labels to avoid crowding
  const xLabelIndices: number[] = [];
  if (n <= 6) {
    for (let i = 0; i < n; i++) xLabelIndices.push(i);
  } else {
    const step = Math.ceil(n / 6);
    for (let i = 0; i < n; i += step) xLabelIndices.push(i);
    if (xLabelIndices[xLabelIndices.length - 1] !== n - 1) xLabelIndices.push(n - 1);
  }

  return (
    <div className="chart-wrapper" style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        style={{ width: "100%", minWidth: "320px", overflow: "visible" }}
        aria-label="Gewichtsverloop grafiek"
        role="img"
      >
        {/* Grid lines */}
        {ticks.map((t) => (
          <line
            key={t}
            x1={PAD.left}
            x2={PAD.left + CHART_W}
            y1={yScale(t)}
            y2={yScale(t)}
            stroke="var(--border-light)"
            strokeWidth="1"
          />
        ))}

        {/* Area fill */}
        {n > 1 && (
          <polygon
            points={areaPoints}
            fill="var(--golden)"
            fillOpacity="0.12"
          />
        )}

        {/* Line */}
        {n > 1 && (
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="var(--berner-brown)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Y-axis labels */}
        {ticks.map((t) => (
          <text
            key={t}
            x={PAD.left - 8}
            y={yScale(t) + 4}
            textAnchor="end"
            className="chart-axis-text"
          >
            {t.toFixed(1)}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabelIndices.map((i) => (
          <text
            key={i}
            x={xScale(i)}
            y={PAD.top + CHART_H + 20}
            textAnchor="middle"
            className="chart-axis-text"
          >
            {formatDate(sorted[i].logged_at)}
          </text>
        ))}

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <title>{`${formatDate(p.entry.logged_at)}: ${p.entry.weight_kg} kg`}</title>
            <circle
              cx={p.x}
              cy={p.y}
              r="7"
              fill="var(--soft-white)"
              stroke="var(--berner-brown)"
              strokeWidth="2.5"
              style={{ cursor: "pointer" }}
              onMouseEnter={() =>
                setTooltip({ x: p.x, y: p.y, label: `${formatDate(p.entry.logged_at)}: ${p.entry.weight_kg} kg` })
              }
              onMouseLeave={() => setTooltip(null)}
            />
          </g>
        ))}
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="chart-tooltip"
          style={{
            left: `${(tooltip.x / VIEW_W) * 100}%`,
            top: `${(tooltip.y / VIEW_H) * 100}%`
          }}
        >
          {tooltip.label}
        </div>
      )}
    </div>
  );
}
