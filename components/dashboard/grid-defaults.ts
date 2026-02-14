export type DashboardKey = "kern" | "service";

export interface WidgetLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
}

export interface WidgetMeta {
  id: string;
  label: string;
}

// ── Kern (main) dashboard ────────────────────────────────────

export const kernWidgetOrder = [
  "kpi-cards",
  "bk-card",
  "revenue-chart",
  "labour-chart",
  "hours-chart",
  "maketime-chart",
  "delivery-perf",
];

export const kernWidgetMeta: WidgetMeta[] = [
  { id: "kpi-cards", label: "KPI Summary Cards" },
  { id: "bk-card", label: "Burger Kitchen" },
  { id: "revenue-chart", label: "Revenue Chart" },
  { id: "labour-chart", label: "Labour Cost Chart" },
  { id: "hours-chart", label: "Worked Hours" },
  { id: "maketime-chart", label: "Make Time" },
  { id: "delivery-perf", label: "Delivery Performance" },
];

export const kernDefaultLayouts: Record<string, WidgetLayoutItem[]> = {
  lg: [
    { i: "kpi-cards", x: 0, y: 0, w: 12, h: 5, minH: 4 },
    { i: "bk-card", x: 0, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "revenue-chart", x: 6, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "labour-chart", x: 0, y: 10, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "hours-chart", x: 6, y: 10, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "maketime-chart", x: 0, y: 15, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "delivery-perf", x: 6, y: 15, w: 6, h: 5, minW: 4, minH: 4 },
  ],
  md: [
    { i: "kpi-cards", x: 0, y: 0, w: 10, h: 5, minH: 4 },
    { i: "bk-card", x: 0, y: 5, w: 5, h: 5, minW: 3, minH: 4 },
    { i: "revenue-chart", x: 5, y: 5, w: 5, h: 5, minW: 3, minH: 4 },
    { i: "labour-chart", x: 0, y: 10, w: 5, h: 5, minW: 3, minH: 4 },
    { i: "hours-chart", x: 5, y: 10, w: 5, h: 5, minW: 3, minH: 4 },
    { i: "maketime-chart", x: 0, y: 15, w: 5, h: 5, minW: 3, minH: 4 },
    { i: "delivery-perf", x: 5, y: 15, w: 5, h: 5, minW: 3, minH: 4 },
  ],
  sm: [
    { i: "kpi-cards", x: 0, y: 0, w: 6, h: 5, minH: 4 },
    { i: "bk-card", x: 0, y: 5, w: 6, h: 5, minH: 4 },
    { i: "revenue-chart", x: 0, y: 10, w: 6, h: 5, minH: 4 },
    { i: "labour-chart", x: 0, y: 15, w: 6, h: 5, minH: 4 },
    { i: "hours-chart", x: 0, y: 20, w: 6, h: 5, minH: 4 },
    { i: "maketime-chart", x: 0, y: 25, w: 6, h: 5, minH: 4 },
    { i: "delivery-perf", x: 0, y: 30, w: 6, h: 5, minH: 4 },
  ],
};

// ── Service dashboard ────────────────────────────────────────

export const serviceWidgetOrder = [
  "bezorg-cards",
  "delivery-rate-chart",
  "time-breakdown-chart",
  "postcode-map",
  "postcode-table",
];

export const serviceWidgetMeta: WidgetMeta[] = [
  { id: "bezorg-cards", label: "Bezorg Cards" },
  { id: "delivery-rate-chart", label: "Delivery Rate" },
  { id: "time-breakdown-chart", label: "Time Breakdown" },
  { id: "postcode-map", label: "Postcode Map" },
  { id: "postcode-table", label: "Postcode Table" },
];

export const serviceDefaultLayouts: Record<string, WidgetLayoutItem[]> = {
  lg: [
    { i: "bezorg-cards", x: 0, y: 0, w: 12, h: 5, minH: 4 },
    { i: "delivery-rate-chart", x: 0, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "time-breakdown-chart", x: 6, y: 5, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "postcode-map", x: 0, y: 10, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "postcode-table", x: 6, y: 10, w: 6, h: 5, minW: 4, minH: 4 },
  ],
  md: [
    { i: "bezorg-cards", x: 0, y: 0, w: 10, h: 5, minH: 4 },
    { i: "delivery-rate-chart", x: 0, y: 5, w: 5, h: 5, minW: 3, minH: 4 },
    { i: "time-breakdown-chart", x: 5, y: 5, w: 5, h: 5, minW: 3, minH: 4 },
    { i: "postcode-map", x: 0, y: 10, w: 5, h: 5, minW: 3, minH: 4 },
    { i: "postcode-table", x: 5, y: 10, w: 5, h: 5, minW: 3, minH: 4 },
  ],
  sm: [
    { i: "bezorg-cards", x: 0, y: 0, w: 6, h: 5, minH: 4 },
    { i: "delivery-rate-chart", x: 0, y: 5, w: 6, h: 5, minH: 4 },
    { i: "time-breakdown-chart", x: 0, y: 10, w: 6, h: 5, minH: 4 },
    { i: "postcode-map", x: 0, y: 15, w: 6, h: 5, minH: 4 },
    { i: "postcode-table", x: 0, y: 20, w: 6, h: 5, minH: 4 },
  ],
};

export function getDefaultOrder(dashboardKey: DashboardKey): string[] {
  return dashboardKey === "kern" ? kernWidgetOrder : serviceWidgetOrder;
}

export function getDefaultLayouts(
  dashboardKey: DashboardKey
): Record<string, WidgetLayoutItem[]> {
  return dashboardKey === "kern" ? kernDefaultLayouts : serviceDefaultLayouts;
}

export function getWidgetMeta(dashboardKey: DashboardKey): WidgetMeta[] {
  return dashboardKey === "kern" ? kernWidgetMeta : serviceWidgetMeta;
}
