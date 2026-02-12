"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { cardStyles } from "@/lib/utils/styles";
import { formatEUR } from "@/lib/utils/formatters";
import {
  rosmalenDeliveryZones,
  ROSMALEN_CENTER,
  type DeliveryZone,
} from "@/lib/data/rosmalen-delivery-zones";

const MapInner = dynamic(() => import("./PostcodeMapInner"), { ssr: false });

export function PostcodeMap() {
  const zones = useMemo(() => rosmalenDeliveryZones, []);

  return (
    <div className={cardStyles}>
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        Bezorggebieden — Rosmalen
      </h3>
      <div className="h-[400px] w-full overflow-hidden rounded-xl">
        <MapInner zones={zones} center={ROSMALEN_CENTER} />
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {zones.map((zone) => (
          <div key={zone.postcode} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: zone.color }}
            />
            <span className="font-medium">{zone.postcode}</span>
            <span>{zone.name}</span>
            <span className="text-foreground font-semibold">{formatEUR(zone.revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
