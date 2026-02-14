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
  "revenue-card",
  "labour-card",
  "orders-card",
  "productivity-card",
  "prime-cost-card",
  "bk-card",
  "revenue-chart",
  "labour-chart",
  "hours-chart",
  "maketime-chart",
  "delivery-rate30-card",
  "otd-card",
  "maketime-card",
  "drivetime-card",
];

export const kernWidgetMeta: WidgetMeta[] = [
  { id: "revenue-card", label: "Netto Omzet" },
  { id: "labour-card", label: "Arbeidskosten" },
  { id: "orders-card", label: "Bestellingen" },
  { id: "productivity-card", label: "Productiviteit" },
  { id: "prime-cost-card", label: "Prime Cost" },
  { id: "bk-card", label: "Burger Kitchen" },
  { id: "revenue-chart", label: "Revenue Chart" },
  { id: "labour-chart", label: "Labour Cost Chart" },
  { id: "hours-chart", label: "Worked Hours" },
  { id: "maketime-chart", label: "Make Time" },
  { id: "delivery-rate30-card", label: "Bezorgd < 30 min" },
  { id: "otd-card", label: "OTD" },
  { id: "maketime-card", label: "Maaktijd" },
  { id: "drivetime-card", label: "Rijtijd" },
];

export const kernDefaultLayouts: Record<string, WidgetLayoutItem[]> = {
  lg: [
    // KPI cards row — 5 cards across top
    { i: "revenue-card", x: 0, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: "labour-card", x: 3, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: "orders-card", x: 6, y: 0, w: 2, h: 4, minW: 2, minH: 3 },
    { i: "productivity-card", x: 8, y: 0, w: 2, h: 4, minW: 2, minH: 3 },
    { i: "prime-cost-card", x: 10, y: 0, w: 2, h: 4, minW: 2, minH: 3 },
    // Charts row
    { i: "bk-card", x: 0, y: 4, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "revenue-chart", x: 6, y: 4, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "labour-chart", x: 0, y: 9, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "hours-chart", x: 6, y: 9, w: 6, h: 5, minW: 4, minH: 4 },
    { i: "maketime-chart", x: 0, y: 14, w: 6, h: 5, minW: 4, minH: 4 },
    // Delivery cards row
    { i: "delivery-rate30-card", x: 0, y: 19, w: 3, h: 3, minW: 2, minH: 3 },
    { i: "otd-card", x: 3, y: 19, w: 3, h: 3, minW: 2, minH: 3 },
    { i: "maketime-card", x: 6, y: 19, w: 3, h: 3, minW: 2, minH: 3 },
    { i: "drivetime-card", x: 9, y: 19, w: 3, h: 3, minW: 2, minH: 3 },
  ],
  md: [
    // KPI cards — 3 + 2 rows
    { i: "revenue-card", x: 0, y: 0, w: 4, h: 4, minW: 2, minH: 3 },
    { i: "labour-card", x: 4, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: "orders-card", x: 7, y: 0, w: 3, h: 4, minW: 2, minH: 3 },
    { i: "productivity-card", x: 0, y: 4, w: 5, h: 4, minW: 2, minH: 3 },
    { i: "prime-cost-card", x: 5, y: 4, w: 5, h: 4, minW: 2, minH: 3 },
    // Charts
    { i: "bk-card", x: 0, y: 8, w: 5, h: 5, minW: 3, minH: 4 },
    { i: "revenue-chart", x: 5, y: 8, w: 5, h: 5, minW: 3, minH: 4 },
    { i: "labour-chart", x: 0, y: 13, w: 5, h: 5, minW: 3, minH: 4 },
    { i: "hours-chart", x: 5, y: 13, w: 5, h: 5, minW: 3, minH: 4 },
    { i: "maketime-chart", x: 0, y: 18, w: 5, h: 5, minW: 3, minH: 4 },
    // Delivery cards — 2x2
    { i: "delivery-rate30-card", x: 0, y: 23, w: 5, h: 3, minW: 2, minH: 3 },
    { i: "otd-card", x: 5, y: 23, w: 5, h: 3, minW: 2, minH: 3 },
    { i: "maketime-card", x: 0, y: 26, w: 5, h: 3, minW: 2, minH: 3 },
    { i: "drivetime-card", x: 5, y: 26, w: 5, h: 3, minW: 2, minH: 3 },
  ],
  sm: [
    // KPI cards stacked
    { i: "revenue-card", x: 0, y: 0, w: 6, h: 4, minH: 3 },
    { i: "labour-card", x: 0, y: 4, w: 6, h: 4, minH: 3 },
    { i: "orders-card", x: 0, y: 8, w: 6, h: 4, minH: 3 },
    { i: "productivity-card", x: 0, y: 12, w: 6, h: 4, minH: 3 },
    { i: "prime-cost-card", x: 0, y: 16, w: 6, h: 4, minH: 3 },
    // Charts
    { i: "bk-card", x: 0, y: 20, w: 6, h: 5, minH: 4 },
    { i: "revenue-chart", x: 0, y: 25, w: 6, h: 5, minH: 4 },
    { i: "labour-chart", x: 0, y: 30, w: 6, h: 5, minH: 4 },
    { i: "hours-chart", x: 0, y: 35, w: 6, h: 5, minH: 4 },
    { i: "maketime-chart", x: 0, y: 40, w: 6, h: 5, minH: 4 },
    // Delivery cards stacked
    { i: "delivery-rate30-card", x: 0, y: 45, w: 6, h: 3, minH: 3 },
    { i: "otd-card", x: 0, y: 48, w: 6, h: 3, minH: 3 },
    { i: "maketime-card", x: 0, y: 51, w: 6, h: 3, minH: 3 },
    { i: "drivetime-card", x: 0, y: 54, w: 6, h: 3, minH: 3 },
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
