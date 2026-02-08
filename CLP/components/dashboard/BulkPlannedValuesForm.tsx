"use client";

import { useState } from "react";
import { format, differenceInDays, parseISO, eachDayOfInterval } from "date-fns";
import { nl } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

interface DayEntry {
  date: string;
  dayName: string;
  plannedRevenue: string;
  plannedLabourCost: string;
}

interface FormState {
  restaurantId: string;
  startDate: string;
  endDate: string;
  days: DayEntry[];
}

const initialState: FormState = {
  restaurantId: "rosmalen",
  startDate: format(new Date(), "yyyy-MM-dd"),
  endDate: format(new Date(), "yyyy-MM-dd"),
  days: [],
};

function num(v: string): number {
  return v === "" ? 0 : Number(v);
}

export function BulkPlannedValuesForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateRangeChange = (name: "startDate" | "endDate", value: string) => {
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };

      // If both dates are set, generate days array
      if (newForm.startDate && newForm.endDate) {
        try {
          const start = parseISO(newForm.startDate);
          const end = parseISO(newForm.endDate);

          if (end >= start) {
            const dates = eachDayOfInterval({ start, end });
            const days: DayEntry[] = dates.map((date) => {
              const dateStr = format(date, "yyyy-MM-dd");
              const dayName = format(date, "EEEE", { locale: nl });
              const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);

              // Keep existing values if this date was already in the form
              const existing = prev.days.find((d) => d.date === dateStr);

              return {
                date: dateStr,
                dayName: capitalizedDayName,
                plannedRevenue: existing?.plannedRevenue || "",
                plannedLabourCost: existing?.plannedLabourCost || "",
              };
            });

            return { ...newForm, days };
          }
        } catch (e) {
          // Invalid date, ignore
        }
      }

      return newForm;
    });
  };

  const handleDayChange = (index: number, field: "plannedRevenue" | "plannedLabourCost", value: string) => {
    setForm((prev) => {
      const newDays = [...prev.days];
      newDays[index] = { ...newDays[index], [field]: value };
      return { ...prev, days: newDays };
    });
  };

  const dayCount = form.days.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    // Client-side validation
    if (!form.startDate || !form.endDate) {
      setMessage({ type: "error", text: "Start- en einddatum zijn verplicht" });
      setSubmitting(false);
      return;
    }

    if (form.days.length === 0) {
      setMessage({ type: "error", text: "Geen dagen geselecteerd" });
      setSubmitting(false);
      return;
    }

    if (form.days.length > 31) {
      setMessage({ type: "error", text: "Maximaal 31 dagen per keer toegestaan" });
      setSubmitting(false);
      return;
    }

    // Validate each day has values
    const invalidDays = form.days.filter(
      (day) => num(day.plannedRevenue) <= 0 || num(day.plannedLabourCost) <= 0
    );

    if (invalidDays.length > 0) {
      setMessage({
        type: "error",
        text: "Alle dagen moeten geldige geplande omzet en arbeidskosten hebben (> 0)",
      });
      setSubmitting(false);
      return;
    }

    try {
      // Submit each day individually
      const entries = form.days.map((day) => ({
        restaurantId: form.restaurantId,
        date: day.date,
        plannedRevenue: num(day.plannedRevenue),
        plannedLabourCost: num(day.plannedLabourCost),
      }));

      const res = await fetch("/api/kpi-entries/bulk-planned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: form.restaurantId,
          entries,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Onbekende fout");
      }

      setMessage({
        type: "success",
        text: `Opgeslagen voor ${data.daysUpdated} dagen!`,
      });
      setForm(initialState);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Onbekende fout",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300"
              : "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* General Section */}
      <Card>
        <CardHeader>
          <CardTitle>Periode Selectie</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Restaurant</label>
            <input
              type="text"
              className={inputClass}
              value={form.restaurantId}
              onChange={(e) => handleChange("restaurantId", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Startdatum</label>
            <input
              type="date"
              className={inputClass}
              value={form.startDate}
              onChange={(e) => handleDateRangeChange("startDate", e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Einddatum</label>
            <input
              type="date"
              className={inputClass}
              value={form.endDate}
              onChange={(e) => handleDateRangeChange("endDate", e.target.value)}
              required
            />
          </div>
        </CardContent>
      </Card>

      {dayCount > 0 && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {dayCount} {dayCount === 1 ? "dag" : "dagen"} geselecteerd
          </span>
        </div>
      )}

      {/* Per-Day Values Table */}
      {form.days.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Geplande Waarden per Dag</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Datum</th>
                    <th className="pb-3 text-left text-sm font-medium text-muted-foreground">Dag</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Geplande Omzet (€)</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Geplande Arbeidskosten (€)</th>
                    <th className="pb-3 text-right text-sm font-medium text-muted-foreground">Arbeid %</th>
                  </tr>
                </thead>
                <tbody>
                  {form.days.map((day, index) => {
                    const revenue = num(day.plannedRevenue);
                    const cost = num(day.plannedLabourCost);
                    const labourPct = revenue > 0 && cost > 0 ? (cost / revenue) * 100 : 0;

                    return (
                      <tr key={day.date} className="border-b border-border/50">
                        <td className="py-3 text-sm">{format(parseISO(day.date), "dd MMM yyyy", { locale: nl })}</td>
                        <td className="py-3 text-sm text-muted-foreground">{day.dayName}</td>
                        <td className="py-3">
                          <input
                            type="number"
                            step="0.01"
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-right text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={day.plannedRevenue}
                            onChange={(e) => handleDayChange(index, "plannedRevenue", e.target.value)}
                            required
                          />
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            step="0.01"
                            className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-right text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            value={day.plannedLabourCost}
                            onChange={(e) => handleDayChange(index, "plannedLabourCost", e.target.value)}
                            required
                          />
                        </td>
                        <td className="py-3 text-right text-sm font-medium">
                          {labourPct > 0 ? labourPct.toFixed(1) : "0.0"}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Section */}
      <Button type="submit" className="w-full" disabled={submitting || dayCount <= 0}>
        {submitting ? "Opslaan..." : `Opslaan voor ${dayCount} ${dayCount === 1 ? "dag" : "dagen"}`}
      </Button>
    </form>
  );
}
