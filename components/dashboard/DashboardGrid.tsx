"use client";

import {
  Responsive,
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout";
import type { Layout, ResponsiveLayouts } from "react-grid-layout";
import { GridWidget } from "./GridWidget";

import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const BREAKPOINTS = { lg: 900, md: 600, sm: 0 };
const COLS = { lg: 12, md: 10, sm: 6 };

interface WidgetEntry {
  id: string;
  label?: string;
  node: React.ReactNode;
}

interface DashboardGridProps {
  widgets: WidgetEntry[];
  layouts: ResponsiveLayouts;
  isEditMode: boolean;
  onLayoutChange: (currentLayout: Layout, allLayouts: ResponsiveLayouts) => void;
}

export function DashboardGrid({
  widgets,
  layouts,
  isEditMode,
  onLayoutChange,
}: DashboardGridProps) {
  const { width, mounted, containerRef } = useContainerWidth({
    initialWidth: 1200,
  });

  if (!mounted) {
    return <div className="min-h-[400px]" ref={containerRef} />;
  }

  return (
    <div ref={containerRef}>
      <Responsive
        className="dashboard-grid"
        width={width}
        layouts={layouts}
        breakpoints={BREAKPOINTS}
        cols={COLS}
        rowHeight={60}
        margin={[24, 24] as readonly [number, number]}
        dragConfig={{
          enabled: isEditMode,
          handle: ".drag-handle",
        }}
        resizeConfig={{
          enabled: isEditMode,
        }}
        compactor={verticalCompactor}
        onLayoutChange={onLayoutChange}
      >
        {widgets.map((widget) => (
          <div key={widget.id}>
            <GridWidget
              id={widget.id}
              label={widget.label}
              isEditMode={isEditMode}
            >
              {widget.node}
            </GridWidget>
          </div>
        ))}
      </Responsive>
    </div>
  );
}
