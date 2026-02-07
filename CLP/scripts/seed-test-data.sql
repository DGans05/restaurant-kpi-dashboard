-- ============================================================================
-- Seed Test KPI Data
-- Run this in Supabase SQL Editor to populate dashboard with test data
-- ============================================================================

-- Insert test KPI entries for the last 8 weeks
-- This will populate charts and metrics on the dashboard

INSERT INTO kpi_entries (
  restaurant_id,
  period_start,
  period_end,
  period_type,
  revenue,
  labour_cost,
  labour_pct,
  food_cost,
  food_cost_pct,
  order_count,
  avg_order_value
) VALUES
  -- Week 1 (8 weeks ago)
  ('rosmalen', '2025-12-09', '2025-12-15', 'week', 14200, 3800, 26.8, 3950, 27.8, 425, 33.41),
  -- Week 2 (7 weeks ago)
  ('rosmalen', '2025-12-16', '2025-12-22', 'week', 15800, 4100, 25.9, 4200, 26.6, 468, 33.76),
  -- Week 3 (6 weeks ago)
  ('rosmalen', '2025-12-23', '2025-12-29', 'week', 18500, 5200, 28.1, 5100, 27.6, 542, 34.13),
  -- Week 4 (5 weeks ago)
  ('rosmalen', '2025-12-30', '2026-01-05', 'week', 16200, 4500, 27.8, 4400, 27.2, 491, 33.00),
  -- Week 5 (4 weeks ago)
  ('rosmalen', '2026-01-06', '2026-01-12', 'week', 14800, 4200, 28.4, 4150, 28.0, 445, 33.26),
  -- Week 6 (3 weeks ago)
  ('rosmalen', '2026-01-13', '2026-01-19', 'week', 15600, 4300, 27.6, 4250, 27.2, 472, 33.05),
  -- Week 7 (2 weeks ago)
  ('rosmalen', '2026-01-20', '2026-01-26', 'week', 16800, 4600, 27.4, 4500, 26.8, 505, 33.27),
  -- Week 8 (last week)
  ('rosmalen', '2026-01-27', '2026-02-02', 'week', 15200, 4100, 27.0, 4200, 27.6, 458, 33.19),
  -- Current week (this week)
  ('rosmalen', '2026-02-03', '2026-02-09', 'week', 15500, 4250, 27.4, 4300, 27.7, 465, 33.33)
ON CONFLICT (restaurant_id, period_start, period_end) DO UPDATE SET
  revenue = EXCLUDED.revenue,
  labour_cost = EXCLUDED.labour_cost,
  labour_pct = EXCLUDED.labour_pct,
  food_cost = EXCLUDED.food_cost,
  food_cost_pct = EXCLUDED.food_cost_pct,
  order_count = EXCLUDED.order_count,
  avg_order_value = EXCLUDED.avg_order_value;

-- Verify the data was inserted
SELECT
  period_start,
  period_end,
  revenue,
  labour_pct,
  food_cost_pct,
  order_count
FROM kpi_entries
WHERE restaurant_id = 'rosmalen'
ORDER BY period_start DESC;

SELECT '✅ Test data seeded successfully! Refresh your dashboard to see charts.' as status;
