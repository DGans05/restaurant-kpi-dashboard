"use client";

import { GripVertical } from "lucide-react";

interface GridWidgetProps {
  id: string;
  label?: string;
  isEditMode: boolean;
  children: React.ReactNode;
}

export function GridWidget({ id, label, isEditMode, children }: GridWidgetProps) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl transition-all duration-200 ${
        isEditMode
          ? "ring-1 ring-dashed ring-border/60 bg-muted/20"
          : ""
      }`}
    >
      {/* Drag handle — only interactive in edit mode */}
      {isEditMode && (
        <div className="drag-handle absolute top-0 left-0 right-0 z-10 flex h-8 cursor-grab items-center justify-center opacity-0 transition-opacity hover:opacity-100 active:cursor-grabbing">
          <div className="flex items-center gap-1 rounded-b-lg bg-muted/80 px-3 py-1 backdrop-blur-sm">
            <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
            {label && (
              <span className="text-[11px] font-medium text-muted-foreground">
                {label}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Widget content */}
      <div className="h-full w-full overflow-auto">{children}</div>
    </div>
  );
}
