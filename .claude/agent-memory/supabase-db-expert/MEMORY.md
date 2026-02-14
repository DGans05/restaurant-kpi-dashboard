# Supabase Integration Memory

## Restaurant KPI Dashboard Project

### Setup Complete
- Database: kpi_entries, restaurants tables created
- RLS: Disabled (no auth yet)
- Data: 28 KPI entries for Rosmalen restaurant (Feb 1-28, 2025)

### Build Fix Applied
**Issue**: Pages using `cookies()` via Supabase server client were being statically rendered, causing build failures.

**Solution**: Add `export const dynamic = "force-dynamic"` to pages that use Supabase server client:
- `/app/(dashboard)/dashboard/page.tsx`
- `/app/(dashboard)/restaurants/page.tsx`

This forces Next.js to server-render these pages on-demand instead of static pre-rendering.

### Integration Pattern
The project maintains a clean service layer pattern:
1. **Services** (`lib/services/kpi-service.ts`) - Exported functions that components call
2. **Repository** (`lib/repositories/`) - Factory pattern returns either SeedRepository or SupabaseRepository
3. **Server Client** (`lib/supabase/server.ts`) - Creates Supabase client with cookies for auth context

This allows swapping data sources without changing component code.

### Common Query Patterns

#### Date Range Filtering
```typescript
.gte("date", start.toISOString().split("T")[0])
.lte("date", end.toISOString().split("T")[0])
```
Uses ISO date strings (YYYY-MM-DD format) for PostgreSQL DATE comparison.

#### Optional Restaurant Filter
```typescript
if (restaurantId) {
  query = query.eq("restaurant_id", restaurantId);
}
```
Build query conditionally before executing.

#### Type Mapping
Database uses snake_case, TypeScript uses camelCase. Repository layer handles mapping:
```typescript
return data.map((row) => ({
  restaurantId: row.restaurant_id,
  netRevenue: Number(row.net_revenue),
  // ...
}));
```

### Performance Optimizations Needed

1. **Index on date + restaurant_id**: Most queries filter by date range and optionally restaurant
   ```sql
   CREATE INDEX idx_kpi_entries_date_restaurant ON kpi_entries(date, restaurant_id);
   ```

2. **Select specific columns**: Currently using `SELECT *` - should specify needed columns
   ```typescript
   .select('date, net_revenue, planned_revenue, ...')
   ```

3. **Composite index for ordering**: Queries order by date
   ```sql
   CREATE INDEX idx_kpi_entries_restaurant_date ON kpi_entries(restaurant_id, date);
   ```

### Next Steps
- Add indexes when query performance becomes an issue
- Enable RLS when authentication is added
- Consider materialized views for complex aggregations if dashboard grows

### Date Range Anchor
Dataset ends on 2025-02-28 (hardcoded in `DATASET_END` constant in kpi-service.ts)
