"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { WidgetMeta } from "./grid-defaults";

interface CustomizeToolbarProps {
  isEditMode: boolean;
  onToggleEditMode: () => void;
  widgetMeta: WidgetMeta[];
  hiddenWidgets: string[];
  availableWidgetIds: string[];
  onToggleWidget: (widgetId: string) => void;
  onReset: () => void;
}

export function CustomizeToolbar({
  isEditMode,
  onToggleEditMode,
  widgetMeta,
  hiddenWidgets,
  availableWidgetIds,
  onToggleWidget,
  onReset,
}: CustomizeToolbarProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on click outside
  useEffect(() => {
    if (!panelOpen) return;

    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [panelOpen]);

  // Close panel when exiting edit mode
  useEffect(() => {
    if (!isEditMode) setPanelOpen(false);
  }, [isEditMode]);

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant={isEditMode ? "default" : "outline"}
        size="sm"
        onClick={() => {
          if (isEditMode) {
            setPanelOpen((prev) => !prev);
          } else {
            onToggleEditMode();
          }
        }}
        className="gap-1.5"
      >
        <Pencil className="h-3.5 w-3.5" />
        {isEditMode ? "Customize" : "Edit layout"}
      </Button>

      {isEditMode && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleEditMode}
          className="ml-1 gap-1 text-xs text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" />
          Done
        </Button>
      )}

      {/* Floating panel */}
      {panelOpen && (
        <div className="fixed right-8 top-24 z-[9999] w-72 rounded-xl border border-border/60 bg-background/95 p-4 shadow-xl backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">Widgets</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-7 gap-1 text-xs text-muted-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          </div>

          <div className="space-y-2">
            {widgetMeta.map((meta) => {
              const isAvailable = availableWidgetIds.includes(meta.id);
              const isVisible = !hiddenWidgets.includes(meta.id);

              return (
                <label
                  key={meta.id}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                    isAvailable
                      ? "hover:bg-muted/50 cursor-pointer"
                      : "opacity-40 cursor-not-allowed"
                  }`}
                >
                  <span className="text-sm">{meta.label}</span>
                  <Switch
                    checked={isVisible && isAvailable}
                    disabled={!isAvailable}
                    onCheckedChange={() => onToggleWidget(meta.id)}
                  />
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
