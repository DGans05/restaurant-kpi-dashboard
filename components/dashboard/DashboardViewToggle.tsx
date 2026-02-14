"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type DashboardView = "kern" | "service";

interface DashboardViewToggleProps {
  active: DashboardView;
  restaurantSuffix?: string;
}

const views = [
  { key: "kern" as const, label: "Kern Cijfers", href: "/dashboard" },
  { key: "service" as const, label: "Service", href: "/bezorg" },
];

export function DashboardViewToggle({
  active,
  restaurantSuffix,
}: DashboardViewToggleProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSwitch = (view: (typeof views)[number]) => {
    if (view.key === active) return;
    // Preserve current search params (view, week, month, restaurantId)
    const params = new URLSearchParams(searchParams.toString());
    router.push(`${view.href}?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex items-center gap-1">
        {views.map((view) => (
          <button
            key={view.key}
            onClick={() => handleSwitch(view)}
            className={cn(
              "rounded-xl px-4 py-2 text-2xl font-display tracking-tight transition-all duration-200",
              active === view.key
                ? "text-foreground"
                : "text-muted-foreground/40 hover:text-muted-foreground/70"
            )}
          >
            {view.label}
          </button>
        ))}
        {restaurantSuffix && (
          <span className="text-2xl font-display tracking-tight text-muted-foreground">
            — {restaurantSuffix}
          </span>
        )}
      </div>
      <p className="mt-1 pl-4 text-sm text-muted-foreground">
        {active === "kern" ? "Einde Dag Rapportage" : "Bezorgprestaties & tijden"}
      </p>
    </div>
  );
}
