"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Polygon, Tooltip } from "react-leaflet";
import { formatEUR } from "@/lib/utils/formatters";
import type { DeliveryZone } from "@/lib/data/rosmalen-delivery-zones";

interface PostcodeMapInnerProps {
  zones: DeliveryZone[];
  center: [number, number];
}

export default function PostcodeMapInner({ zones, center }: PostcodeMapInnerProps) {
  return (
    <MapContainer
      center={center}
      zoom={14}
      scrollWheelZoom={false}
      className="h-full w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {zones.map((zone) => (
        <Polygon
          key={zone.postcode}
          positions={zone.coordinates}
          pathOptions={{
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.3,
            weight: 2,
          }}
        >
          <Tooltip sticky>
            <div className="text-sm">
              <div className="font-bold">{zone.postcode} — {zone.name}</div>
              <div>Omzet: {formatEUR(zone.revenue)}</div>
              <div>Orders: {zone.orders}</div>
            </div>
          </Tooltip>
        </Polygon>
      ))}
    </MapContainer>
  );
}
