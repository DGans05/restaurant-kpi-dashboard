"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  getDefaultLayouts,
  type DashboardKey,
  type WidgetLayoutItem,
} from "@/components/dashboard/grid-defaults";
import type { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout";

const DEBOUNCE_MS = 1000;

function toRGLLayouts(
  layouts: Record<string, WidgetLayoutItem[]>
): ResponsiveLayouts {
  const result: Record<string, LayoutItem[]> = {};
  for (const [bp, items] of Object.entries(layouts)) {
    result[bp] = items.map((item) => ({ ...item }));
  }
  return result;
}

function fromRGLLayouts(
  layouts: ResponsiveLayouts
): Record<string, WidgetLayoutItem[]> {
  const result: Record<string, WidgetLayoutItem[]> = {};
  for (const [bp, items] of Object.entries(layouts)) {
    if (!items) continue;
    result[bp] = (items as readonly LayoutItem[]).map((item) => ({
      i: item.i,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      ...(item.minW !== undefined ? { minW: item.minW } : {}),
      ...(item.minH !== undefined ? { minH: item.minH } : {}),
      ...(item.maxW !== undefined ? { maxW: item.maxW } : {}),
    }));
  }
  return result;
}

export function useDashboardLayout(dashboardKey: DashboardKey) {
  const defaults = getDefaultLayouts(dashboardKey);
  const [layouts, setLayouts] = useState<ResponsiveLayouts>(() =>
    toRGLLayouts(defaults)
  );
  const [hidden, setHidden] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved state on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/dashboard-layout?key=${dashboardKey}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            if (
              data.layouts &&
              typeof data.layouts === "object" &&
              !Array.isArray(data.layouts)
            ) {
              setLayouts(toRGLLayouts(data.layouts));
            }
            if (Array.isArray(data.hidden)) {
              setHidden(data.hidden);
            }
          }
        }
      } catch {
        // Fall back to defaults silently
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dashboardKey]);

  // Debounced save
  const saveState = useCallback(
    (newLayouts: ResponsiveLayouts, newHidden: string[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);

      saveTimer.current = setTimeout(async () => {
        try {
          await fetch("/api/dashboard-layout", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key: dashboardKey,
              layouts: fromRGLLayouts(newLayouts),
              hidden: newHidden,
            }),
          });
        } catch {
          // Silent fail — layout still works locally
        }
      }, DEBOUNCE_MS);
    },
    [dashboardKey]
  );

  const onLayoutChange = useCallback(
    (_currentLayout: Layout, allLayouts: ResponsiveLayouts) => {
      setLayouts(allLayouts);
      saveState(allLayouts, hidden);
    },
    [saveState, hidden]
  );

  const toggleWidget = useCallback(
    (widgetId: string) => {
      setHidden((prev) => {
        const next = prev.includes(widgetId)
          ? prev.filter((id) => id !== widgetId)
          : [...prev, widgetId];
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveState(layouts, next);
        return next;
      });
    },
    [saveState, layouts]
  );

  const resetLayout = useCallback(() => {
    const defaultRGL = toRGLLayouts(defaults);
    setLayouts(defaultRGL);
    setHidden([]);
    saveState(defaultRGL, []);
  }, [defaults, saveState]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return {
    layouts,
    hidden,
    isLoading,
    onLayoutChange,
    toggleWidget,
    resetLayout,
  };
}
