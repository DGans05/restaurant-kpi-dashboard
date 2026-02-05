export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-9 w-64 rounded-lg" />
          <div className="skeleton-shimmer h-4 w-72 rounded" />
        </div>
        <div className="skeleton-shimmer h-10 w-40 rounded-lg" />
      </div>

      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-border"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="skeleton-shimmer h-3 w-20 rounded" />
              <div className="skeleton-shimmer size-10 rounded-lg" />
            </div>
            <div className="skeleton-shimmer h-9 w-28 rounded mb-3" />
            <div className="skeleton-shimmer h-5 w-36 rounded-full" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-border"
          >
            <div className="space-y-1 mb-6">
              <div className="skeleton-shimmer h-6 w-36 rounded" />
              <div className="skeleton-shimmer h-3 w-48 rounded" />
            </div>
            <div className="skeleton-shimmer h-[280px] rounded-lg" />
          </div>
        ))}
      </div>

      {/* Delivery section skeleton */}
      <div className="space-y-6">
        <div className="skeleton-shimmer h-6 w-40 rounded" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-border"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="skeleton-shimmer h-4 w-24 rounded" />
                  <div className="skeleton-shimmer h-8 w-20 rounded" />
                </div>
                <div className="skeleton-shimmer size-12 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl bg-card p-6 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] dark:shadow-none dark:border dark:border-border">
          <div className="skeleton-shimmer h-5 w-36 rounded mb-4" />
          <div className="skeleton-shimmer h-[400px] rounded-lg" />
        </div>
      </div>
    </div>
  );
}
