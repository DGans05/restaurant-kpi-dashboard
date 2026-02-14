import { ReferenceArea } from "recharts";

interface ThresholdZoneProps {
  yAxisId?: string;
  type: "revenue" | "labour" | "percentage";
  dataMin: number;
  dataMax: number;
}

/**
 * ThresholdZone - Visual threshold overlays for Recharts
 * Shows green (good), yellow (warning), red (danger) zones
 */
export function ThresholdZone({
  yAxisId = "left",
  type,
  dataMin,
  dataMax,
}: ThresholdZoneProps) {
  // Calculate appropriate thresholds based on data range
  const range = dataMax - dataMin;

  switch (type) {
    case "labour":
      // Labour cost % thresholds: < 30% (good), 30-35% (warning), > 35% (danger)
      return (
        <>
          {/* Green zone: 0-30% */}
          <ReferenceArea
            yAxisId={yAxisId}
            y1={0}
            y2={30}
            fill="#009a44"
            fillOpacity={0.05}
          />
          {/* Yellow zone: 30-35% */}
          <ReferenceArea
            yAxisId={yAxisId}
            y1={30}
            y2={35}
            fill="#ffda28"
            fillOpacity={0.08}
          />
          {/* Red zone: > 35% */}
          <ReferenceArea
            yAxisId={yAxisId}
            y1={35}
            y2={dataMax * 1.1}
            fill="#f3001d"
            fillOpacity={0.05}
          />
        </>
      );

    case "percentage":
      // Generic percentage thresholds (e.g., for delivery rate)
      return (
        <>
          {/* Red zone: < 70% */}
          <ReferenceArea
            yAxisId={yAxisId}
            y1={0}
            y2={70}
            fill="#f3001d"
            fillOpacity={0.05}
          />
          {/* Yellow zone: 70-85% */}
          <ReferenceArea
            yAxisId={yAxisId}
            y1={70}
            y2={85}
            fill="#ffda28"
            fillOpacity={0.08}
          />
          {/* Green zone: > 85% */}
          <ReferenceArea
            yAxisId={yAxisId}
            y1={85}
            y2={100}
            fill="#009a44"
            fillOpacity={0.05}
          />
        </>
      );

    case "revenue":
    default:
      // Revenue thresholds based on data range
      // Bottom 20% = red, middle 30% = yellow, top 50% = green
      const redThreshold = dataMin + range * 0.2;
      const yellowThreshold = dataMin + range * 0.5;

      return (
        <>
          {/* Red zone: bottom 20% */}
          <ReferenceArea
            yAxisId={yAxisId}
            y1={dataMin * 0.9}
            y2={redThreshold}
            fill="#f3001d"
            fillOpacity={0.05}
          />
          {/* Yellow zone: 20-50% */}
          <ReferenceArea
            yAxisId={yAxisId}
            y1={redThreshold}
            y2={yellowThreshold}
            fill="#ffda28"
            fillOpacity={0.08}
          />
          {/* Green zone: top 50% */}
          <ReferenceArea
            yAxisId={yAxisId}
            y1={yellowThreshold}
            y2={dataMax * 1.1}
            fill="#009a44"
            fillOpacity={0.05}
          />
        </>
      );
  }
}
