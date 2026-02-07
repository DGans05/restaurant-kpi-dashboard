"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportButtonProps {
  startDate: string;
  endDate: string;
  restaurantId?: string;
}

export function ExportButton({ startDate, endDate, restaurantId }: ExportButtonProps) {
  const handleExport = () => {
    const params = new URLSearchParams({
      startDate,
      endDate,
    });
    if (restaurantId) {
      params.set("restaurantId", restaurantId);
    }
    window.open(`/api/export/csv?${params.toString()}`, "_blank");
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-2"
    >
      <Download className="size-4" />
      <span className="hidden sm:inline">Export</span>
    </Button>
  );
}
