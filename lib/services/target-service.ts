import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Target } from "@/lib/types";

export const getTargets = cache(
  async (restaurantId: string): Promise<Target[]> => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("targets")
        .select("*")
        .eq("restaurant_id", restaurantId);

      if (error) {
        console.error("Failed to fetch targets:", error);
        return [];
      }

      return (data ?? []).map((row) => ({
        id: row.id,
        restaurantId: row.restaurant_id,
        metric: row.metric,
        targetValue: Number(row.target_value),
        warningThreshold: row.warning_threshold ? Number(row.warning_threshold) : null,
        dangerThreshold: row.danger_threshold ? Number(row.danger_threshold) : null,
        periodType: row.period_type,
      }));
    } catch (error) {
      console.error("Failed to fetch targets:", error);
      return [];
    }
  }
);
