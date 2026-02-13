"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getDefaultOrder, type DashboardKey } from "@/components/dashboard/grid-defaults";

const DEBOUNCE_MS = 1000;

function move(array: string[], fromIndex: number, toIndex: number): string[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

export function useDashboardLayout(dashboardKey: DashboardKey) {
  const defaults = getDefaultOrder(dashboardKey);
  const [order, setOrder] = useState<string[]>(defaults);
  const [isLoading, setIsLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved order on mount
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/dashboard-layout?key=${dashboardKey}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data.order)) {
            setOrder(data.order);
          }
        }
      } catch {
        // Fall back to defaults silently
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [dashboardKey]);

  // Debounced save
  const saveOrder = useCallback(
    (newOrder: string[]) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);

      saveTimer.current = setTimeout(async () => {
        try {
          await fetch("/api/dashboard-layout", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key: dashboardKey, order: newOrder }),
          });
        } catch {
          // Silent fail — order still works locally
        }
      }, DEBOUNCE_MS);
    },
    [dashboardKey]
  );

  const moveItem = useCallback(
    (sourceId: string, destinationId: string) => {
      setOrder((prev) => {
        const sourceIndex = prev.indexOf(sourceId);
        const destIndex = prev.indexOf(destinationId);
        if (sourceIndex === -1 || destIndex === -1) return prev;
        const newOrder = move(prev, sourceIndex, destIndex);
        saveOrder(newOrder);
        return newOrder;
      });
    },
    [saveOrder]
  );

  const resetOrder = useCallback(() => {
    setOrder(defaults);
    saveOrder(defaults);
  }, [defaults, saveOrder]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return { order, isLoading, moveItem, resetOrder };
}
