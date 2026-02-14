"use client";

import { useRouter, usePathname } from "next/navigation";
import type { Restaurant } from "@/lib/types";

interface RestaurantFilterProps {
  restaurants: Restaurant[];
  currentRestaurantId?: string;
}

export function RestaurantFilter({
  restaurants,
  currentRestaurantId,
}: RestaurantFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (restaurantId: string) => {
    const params = new URLSearchParams(window.location.search);

    if (restaurantId === "all") {
      params.delete("restaurantId");
    } else {
      params.set("restaurantId", restaurantId);
    }

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="restaurant-filter"
        className="text-sm font-medium text-muted-foreground"
      >
        Restaurant:
      </label>
      <select
        id="restaurant-filter"
        value={currentRestaurantId || "all"}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        <option value="all">All Restaurants</option>
        {restaurants.map((restaurant) => (
          <option key={restaurant.id} value={restaurant.id}>
            {restaurant.name}
          </option>
        ))}
      </select>
    </div>
  );
}
