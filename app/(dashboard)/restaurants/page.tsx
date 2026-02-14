import { getAllRestaurants } from "@/lib/services/restaurant-service";

export const dynamic = "force-dynamic";

export default async function RestaurantsPage() {
  const restaurants = await getAllRestaurants();

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Restaurants
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your restaurant locations
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-foreground">
              {restaurant.name}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              ID: {restaurant.id}
            </p>
            {restaurant.createdAt && (
              <p className="mt-1 text-xs text-muted-foreground">
                Created: {restaurant.createdAt.toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {restaurants.length === 0 && (
        <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-border bg-card">
          <p className="text-sm text-muted-foreground">
            No restaurants found. Add your first restaurant to get started.
          </p>
        </div>
      )}
    </div>
  );
}
