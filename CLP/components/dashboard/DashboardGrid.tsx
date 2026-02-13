"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardLayout } from "@/lib/hooks/useDashboardLayout";
import { GridWidget } from "./GridWidget";
import type { DashboardKey } from "./grid-defaults";

interface WidgetEntry {
  id: string;
  node: React.ReactNode;
  /** Tailwind grid column class (e.g. "xl:col-span-2") */
  colSpan?: string;
}

interface DashboardGridProps {
  dashboardKey: DashboardKey;
  widgets: WidgetEntry[];
}

export function DashboardGrid({ dashboardKey, widgets }: DashboardGridProps) {
  const { order, isLoading, moveItem, resetOrder } =
    useDashboardLayout(dashboardKey);

  if (isLoading) {
    return <div className="min-h-[400px]" />;
  }

  // Build order index map: widget id → visual position
  const orderMap = new Map<string, number>();
  order.forEach((id, i) => orderMap.set(id, i));

  // Assign indices to any widgets not yet in saved order
  let nextIndex = order.length;
  for (const w of widgets) {
    if (!orderMap.has(w.id)) {
      orderMap.set(w.id, nextIndex++);
    }
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="mb-2 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={resetOrder}
          className="gap-1.5 text-xs text-muted-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset layout
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {widgets.map((widget) => (
          <GridWidget
            key={widget.id}
            id={widget.id}
            index={orderMap.get(widget.id) ?? 0}
            onMoveItem={moveItem}
            className={widget.colSpan}
          >
            {widget.node}
          </GridWidget>
        ))}
      </div>
    </DndProvider>
  );
}
