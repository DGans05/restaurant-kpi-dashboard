import { getAllRestaurants } from "@/lib/services/restaurant-service";
import { ServiceReportImportClient } from "@/components/dashboard/ServiceReportImportClient";

export const dynamic = "force-dynamic";

export default async function DeliveryImportPage() {
  const restaurants = await getAllRestaurants();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Bezorg Import
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload een Service Report om bezorgorders te importeren
        </p>
      </div>

      <ServiceReportImportClient restaurants={restaurants} />
    </div>
  );
}
