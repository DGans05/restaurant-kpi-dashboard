"use client";

import type { ReactNode } from "react";

interface DeliveryStripItemProps {
  label: string;
  value: string;
  icon: ReactNode;
  children?: ReactNode;
}

export function DeliveryStripItem({
  label,
  value,
  icon,
  children,
}: DeliveryStripItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-[#6B6B6B]">{icon}</span>
      <div>
        <p className="text-[10px] font-bold font-sans uppercase tracking-[0.5px] text-[#6B6B6B]">
          {label}
        </p>
        <p className="text-[18px] font-bold font-sans metric-value text-foreground">{value}</p>
        {children}
      </div>
    </div>
  );
}
