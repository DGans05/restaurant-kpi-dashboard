"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const inputClass =
  "w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all";

interface FormState {
  restaurantId: string;
  date: string;
  plannedRevenue: string;
  grossRevenue: string;
  netRevenue: string;
  plannedLabourCost: string;
  labourCost: string;
  plannedLabourPct: string;
  workedHours: string;
  foodCost: string;
  deliveryRate30min: string;
  onTimeDeliveryMins: string;
  makeTimeMins: string;
  driveTimeMins: string;
  orderCount: string;
  avgOrderValue: string;
  ordersPerRun: string;
  cashDifference: string;
  manager: string;
}

const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");

const initialState: FormState = {
  restaurantId: "rosmalen",
  date: yesterday,
  plannedRevenue: "",
  grossRevenue: "",
  netRevenue: "",
  plannedLabourCost: "",
  labourCost: "",
  plannedLabourPct: "",
  workedHours: "",
  foodCost: "",
  deliveryRate30min: "",
  onTimeDeliveryMins: "",
  makeTimeMins: "",
  driveTimeMins: "",
  orderCount: "",
  avgOrderValue: "",
  ordersPerRun: "",
  cashDifference: "",
  manager: "",
};

function num(v: string): number {
  return v === "" ? 0 : Number(v);
}

function computeDerived(s: FormState) {
  const netRevenue = num(s.netRevenue);
  const labourCost = num(s.labourCost);
  const workedHours = num(s.workedHours);
  const foodCost = num(s.foodCost);

  return {
    labourPct: netRevenue > 0 && labourCost > 0 ? (labourCost / netRevenue) * 100 : 0,
    labourProductivity: workedHours > 0 && netRevenue > 0 ? netRevenue / workedHours : 0,
    foodCostPct: netRevenue > 0 && foodCost > 0 ? (foodCost / netRevenue) * 100 : 0,
  };
}

function NumberField({
  label,
  name,
  value,
  onChange,
  step = "0.01",
}: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (name: keyof FormState, value: string) => void;
  step?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-muted-foreground">{label}</label>
      <input
        type="number"
        step={step}
        className={inputClass}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      />
    </div>
  );
}

export function KPIEntryForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const derived = computeDerived(form);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch("/api/kpi-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: form.restaurantId,
          date: form.date,
          plannedRevenue: num(form.plannedRevenue),
          grossRevenue: num(form.grossRevenue),
          netRevenue: num(form.netRevenue),
          plannedLabourCost: num(form.plannedLabourCost),
          labourCost: num(form.labourCost),
          plannedLabourPct: form.plannedLabourPct === "" ? null : num(form.plannedLabourPct),
          labourPct: derived.labourPct,
          workedHours: num(form.workedHours),
          labourProductivity: derived.labourProductivity,
          foodCost: num(form.foodCost),
          foodCostPct: derived.foodCostPct,
          deliveryRate30min: num(form.deliveryRate30min),
          onTimeDeliveryMins: num(form.onTimeDeliveryMins),
          makeTimeMins: num(form.makeTimeMins),
          driveTimeMins: num(form.driveTimeMins),
          orderCount: Math.round(num(form.orderCount)),
          avgOrderValue: num(form.avgOrderValue),
          ordersPerRun: num(form.ordersPerRun),
          cashDifference: form.cashDifference === "" ? null : num(form.cashDifference),
          manager: form.manager,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(Array.isArray(data.error) ? data.error.map((e: { message: string }) => e.message).join(", ") : data.error);
      }

      setMessage({ type: "success", text: "KPI entry opgeslagen!" });
      setForm(initialState);
    } catch (error) {
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Onbekende fout" });
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

      {/* General */}
      <Card>
        <CardHeader>
          <CardTitle>Algemeen</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Restaurant</label>
            <input
              type="text"
              className={inputClass}
              value={form.restaurantId}
              onChange={(e) => handleChange("restaurantId", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Datum</label>
            <input
              type="date"
              className={inputClass}
              value={form.date}
              onChange={(e) => handleChange("date", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Manager</label>
            <input
              type="text"
              className={inputClass}
              value={form.manager}
              onChange={(e) => handleChange("manager", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Omzet</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <NumberField label="Geplande omzet" name="plannedRevenue" value={form.plannedRevenue} onChange={handleChange} />
          <NumberField label="Bruto omzet" name="grossRevenue" value={form.grossRevenue} onChange={handleChange} />
          <NumberField label="Netto omzet" name="netRevenue" value={form.netRevenue} onChange={handleChange} />
        </CardContent>
      </Card>

      {/* Labour */}
      <Card>
        <CardHeader>
          <CardTitle>Arbeidskosten</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <NumberField label="Geplande arbeidskosten" name="plannedLabourCost" value={form.plannedLabourCost} onChange={handleChange} />
          <NumberField label="Arbeidskosten" name="labourCost" value={form.labourCost} onChange={handleChange} />
          <NumberField label="Gepland arbeid %" name="plannedLabourPct" value={form.plannedLabourPct} onChange={handleChange} />
          <NumberField label="Gewerkte uren" name="workedHours" value={form.workedHours} onChange={handleChange} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Arbeid %</label>
            <div className="rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm">
              {derived.labourPct.toFixed(1)}%
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Productiviteit</label>
            <div className="rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm">
              {derived.labourProductivity.toFixed(2)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Food Cost */}
      <Card>
        <CardHeader>
          <CardTitle>Food Cost</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <NumberField label="Food cost" name="foodCost" value={form.foodCost} onChange={handleChange} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground">Food cost %</label>
            <div className="rounded-xl border border-border bg-muted/50 px-4 py-2.5 text-sm">
              {derived.foodCostPct.toFixed(1)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card>
        <CardHeader>
          <CardTitle>Bezorging</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Bezorgsnelheid 30min %" name="deliveryRate30min" value={form.deliveryRate30min} onChange={handleChange} />
          <NumberField label="On-time delivery (min)" name="onTimeDeliveryMins" value={form.onTimeDeliveryMins} onChange={handleChange} />
          <NumberField label="Maaktijd (min)" name="makeTimeMins" value={form.makeTimeMins} onChange={handleChange} />
          <NumberField label="Rijtijd (min)" name="driveTimeMins" value={form.driveTimeMins} onChange={handleChange} />
        </CardContent>
      </Card>

      {/* Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Bestellingen</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <NumberField label="Aantal bestellingen" name="orderCount" value={form.orderCount} onChange={handleChange} step="1" />
          <NumberField label="Gem. bestelwaarde" name="avgOrderValue" value={form.avgOrderValue} onChange={handleChange} />
          <NumberField label="Bestellingen per rit" name="ordersPerRun" value={form.ordersPerRun} onChange={handleChange} />
        </CardContent>
      </Card>

      {/* Other */}
      <Card>
        <CardHeader>
          <CardTitle>Overig</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <NumberField label="Kasverschil" name="cashDifference" value={form.cashDifference} onChange={handleChange} />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? "Opslaan..." : "Opslaan"}
      </Button>
    </form>
  );
}
