import { KPIEntryForm } from "@/components/dashboard/KPIEntryForm";

export default function NewKPIEntryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          KPI Invoer
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Handmatige dagelijkse KPI invoer
        </p>
      </div>
      <KPIEntryForm />
    </div>
  );
}
