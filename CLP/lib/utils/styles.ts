import type { CSSProperties } from "react";

export const cardStyles =
  "rounded-2xl bg-card p-6 shadow-[0_24px_38px_rgba(0,0,0,0.04),0_9px_46px_rgba(0,0,0,0.03),0_11px_15px_rgba(0,0,0,0.05)] dark:shadow-none dark:border dark:border-border";

export const tooltipContentStyle: CSSProperties = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "16px",
  color: "var(--foreground)",
  fontSize: "12px",
  padding: "12px 16px",
  boxShadow: "0 8px 16px rgba(0,0,0,0.12)",
};
