import type { SyncStatus } from "@/lib/types";

export default function SyncBadge({ status }: { status: SyncStatus }) {
  if (status === "idle") return null;

  return (
    <div className={`sync-badge sync-badge--${status}`} aria-live="polite">
      {status === "syncing" && (
        <><span className="spin-icon" aria-hidden="true">⟳</span> Synchroniseren...</>
      )}
      {status === "synced" && "✓ Gesynchroniseerd"}
      {status === "offline" && "⚠ Offline — lokaal opgeslagen"}
    </div>
  );
}
