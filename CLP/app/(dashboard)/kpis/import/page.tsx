export const dynamic = "force-dynamic";

import { getAllRestaurants } from "@/lib/services/restaurant-service";
import { CSVImportClient } from "@/components/dashboard/CSVImportClient";

export default async function ImportKPIPage() {
  const restaurants = await getAllRestaurants();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          CSV Import
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Importeer Einde Dag Rapportage (Excel/CSV)
        </p>
      </div>
      <CSVImportClient restaurants={restaurants} />
    </div>
  );
}
