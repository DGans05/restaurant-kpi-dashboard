"use client";

import { cardStyles } from "@/lib/utils/styles";
import type { PostcodeDeliveryData } from "@/lib/types";

interface PostcodeTableProps {
  data: PostcodeDeliveryData[];
}

export function PostcodeTable({ data }: PostcodeTableProps) {
  if (data.length === 0) {
    return (
      <div className={cardStyles}>
        <h3 className="text-2xl font-display">POSTCODE BEZORGING</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Geen data beschikbaar
        </p>
      </div>
    );
  }

  return (
    <div className={`animate-fade-up animate-lift stagger-9 ${cardStyles}`}>
      <div className="mb-6">
        <h3 className="text-2xl font-display text-foreground">
          POSTCODE BEZORGING
        </h3>
        <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground font-medium">
          Bezorgprestaties per postcode
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 font-semibold text-muted-foreground">Postcode</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Gem. bezorgtijd</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">Orders</th>
              <th className="px-4 py-3 font-semibold text-muted-foreground">&lt; 30 min %</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.postcode} className="border-b border-border/50 hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{row.postcode}</td>
                <td className="px-4 py-3">{row.avgDeliveryMins.toFixed(1)} min</td>
                <td className="px-4 py-3">{row.orderCount}</td>
                <td className="px-4 py-3">{row.deliveryRate30min.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
