import { BulkPlannedValuesForm } from "@/components/dashboard/BulkPlannedValuesForm";

export default function BulkPlannedValuesPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Bulk Geplande Waarden
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vul geplande omzet en arbeidskosten in voor meerdere dagen tegelijk
        </p>
      </div>
      <BulkPlannedValuesForm />
    </div>
  );
}
