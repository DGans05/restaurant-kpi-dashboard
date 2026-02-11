"use client";

import { useRef, useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { cardStyles } from "@/lib/utils/styles";
import type { Restaurant } from "@/lib/types";

interface ServiceReportImportClientProps {
  restaurants: Restaurant[];
}

interface PreviewOrder {
  orderNumber: string;
  phoneNumber: string;
  waitingTimeMins: number;
  address: string | null;
  driverName: string | null;
  date: string;
}

type ImportStatus = "idle" | "previewing" | "ready" | "importing" | "done" | "error";

export function ServiceReportImportClient({ restaurants }: ServiceReportImportClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [restaurantId, setRestaurantId] = useState(restaurants[0]?.id ?? "");
  const [orders, setOrders] = useState<PreviewOrder[]>([]);
  const [status, setStatus] = useState<ImportStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [importedCount, setImportedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [fileDate, setFileDate] = useState("");

  const handleFile = async (f: File) => {
    setFile(f);
    setStatus("previewing");
    setErrorMessage("");
    setOrders([]);

    const formData = new FormData();
    formData.append("file", f);

    try {
      const res = await fetch("/api/delivery-orders/preview", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(json.error ?? "Failed to parse file");
        return;
      }

      setOrders(json.orders as PreviewOrder[]);
      setFileDate(json.date as string);
      setStatus("ready");
    } catch {
      setStatus("error");
      setErrorMessage("Network error — could not reach server");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleImport = async () => {
    if (!file || !restaurantId) return;
    setStatus("importing");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("restaurantId", restaurantId);

    try {
      const res = await fetch("/api/delivery-orders/import", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(json.error ?? "Import failed");
        return;
      }

      setImportedCount(json.imported as number);
      setStatus("done");
    } catch {
      setStatus("error");
      setErrorMessage("Network error — could not reach server");
    }
  };

  const reset = () => {
    setFile(null);
    setOrders([]);
    setStatus("idle");
    setErrorMessage("");
    setImportedCount(0);
    setFileDate("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Restaurant selector */}
      <div className={cn(cardStyles, "p-6")}>
        <label className="block text-sm font-medium text-foreground mb-2">
          Restaurant
        </label>
        <select
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          disabled={status === "importing"}
        >
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Drop zone */}
      {status === "idle" && (
        <div
          className={cn(
            cardStyles,
            "p-12 flex flex-col items-center justify-center gap-4 border-2 border-dashed cursor-pointer transition-colors",
            isDragging && "border-primary bg-primary/5"
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
            <Upload className="size-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Sleep een Service Report hierheen of klik om te uploaden
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Excel (.xlsx) — Service_report_DD-MM-YYYY_*.xlsx
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>
      )}

      {/* Parsing */}
      {status === "previewing" && (
        <div className={cn(cardStyles, "p-8 flex items-center gap-4")}>
          <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Bestand verwerken…</span>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className={cn(cardStyles, "p-6 flex items-start gap-3 border-destructive/40 bg-destructive/5")}>
          <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">Import mislukt</p>
            <p className="mt-1 text-xs text-muted-foreground break-words">{errorMessage}</p>
          </div>
          <button onClick={reset} className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Success */}
      {status === "done" && (
        <div className={cn(cardStyles, "p-6 flex items-center gap-3 border-green-500/40 bg-green-500/5")}>
          <CheckCircle2 className="size-5 text-green-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {importedCount} bezorgorders succesvol geïmporteerd
            </p>
          </div>
          <button
            onClick={reset}
            className="text-sm font-medium text-primary hover:underline"
          >
            Nog een bestand
          </button>
        </div>
      )}

      {/* Preview */}
      {(status === "ready" || status === "importing") && orders.length > 0 && (
        <div className="space-y-4">
          {/* Header row with file info + import button */}
          <div className={cn(cardStyles, "p-4 flex items-center gap-3")}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileSpreadsheet className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{file?.name}</p>
              <p className="text-xs text-muted-foreground">
                {orders.length} bezorgorders · {fileDate} · {restaurants.find((r) => r.id === restaurantId)?.name}
              </p>
            </div>
            <button
              onClick={reset}
              className="shrink-0 text-muted-foreground hover:text-foreground"
              disabled={status === "importing"}
            >
              <X className="size-4" />
            </button>
            <button
              onClick={handleImport}
              disabled={status === "importing"}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                "bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {status === "importing" ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Importeren…
                </>
              ) : (
                <>
                  Importeer {orders.length} orders
                  <ArrowRight className="size-4" />
                </>
              )}
            </button>
          </div>

          {/* Preview table */}
          <div className={cn(cardStyles, "overflow-hidden p-0")}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Order</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Telefoon</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Wachttijd</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bezorger</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Adres</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 50).map((order, i) => (
                    <tr
                      key={`${order.orderNumber}-${i}`}
                      className={cn(
                        "border-b border-border last:border-0",
                        i % 2 === 0 ? "bg-background" : "bg-muted/20"
                      )}
                    >
                      <td className="px-4 py-2.5 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-2.5 font-mono text-foreground">{order.orderNumber}</td>
                      <td className="px-4 py-2.5 text-foreground">{order.phoneNumber}</td>
                      <td className="px-4 py-2.5 text-right">
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          order.waitingTimeMins > 45 ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : order.waitingTimeMins > 30 ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                            : "bg-green-500/10 text-green-600 dark:text-green-400"
                        )}>
                          {order.waitingTimeMins} min
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{order.driverName || "—"}</td>
                      <td className="px-4 py-2.5 text-muted-foreground truncate max-w-[200px]">{order.address || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length > 50 && (
                <div className="px-4 py-3 text-xs text-muted-foreground bg-muted/20 border-t border-border">
                  … en {orders.length - 50} meer orders
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
