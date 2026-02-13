export type DashboardKey = "kern" | "service";

export const kernWidgetOrder = [
  "kpi-cards",
  "bk-card",
  "revenue-chart",
  "labour-chart",
  "hours-chart",
  "maketime-chart",
  "delivery-perf",
];

export const serviceWidgetOrder = [
  "bezorg-cards",
  "delivery-rate-chart",
  "time-breakdown-chart",
  "postcode-map",
  "postcode-table",
];

export function getDefaultOrder(dashboardKey: DashboardKey): string[] {
  return dashboardKey === "kern" ? kernWidgetOrder : serviceWidgetOrder;
}
