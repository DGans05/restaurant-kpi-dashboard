export function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Page Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-9 w-64 animate-pulse rounded-md bg-muted" />
          <div className="h-5 w-48 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="h-11 w-40 animate-pulse rounded-lg bg-muted" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-border bg-card p-6"
          >
            <div className="h-5 w-32 rounded-md bg-muted" />
            <div className="mt-2 h-8 w-24 rounded-md bg-muted" />
            <div className="mt-2 h-4 w-20 rounded-md bg-muted" />
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-lg border border-border bg-card p-6"
          >
            <div className="h-6 w-48 rounded-md bg-muted" />
            <div className="mt-6 h-64 rounded-md bg-muted" />
          </div>
        ))}
      </div>

      {/* Delivery Performance Skeleton */}
      <div className="animate-pulse rounded-lg border border-border bg-card p-6">
        <div className="h-6 w-56 rounded-md bg-muted" />
        <div className="mt-6 h-64 rounded-md bg-muted" />
      </div>
    </div>
  );
}
