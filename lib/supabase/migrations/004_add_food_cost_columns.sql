-- ============================================================================
-- Migration 004: Add food_cost columns to kpi_entries
-- These columns were in the TypeScript types but missing from the DB schema
-- ============================================================================

ALTER TABLE kpi_entries
  ADD COLUMN IF NOT EXISTS food_cost NUMERIC(10,2) DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS food_cost_pct NUMERIC(5,2) DEFAULT 0 NOT NULL;

-- Relax NOT NULL constraints for fields that may not have data from reports
-- planned_revenue, planned_labour_cost already have NOT NULL + CHECK >= 0
-- We keep the defaults at 0 so existing queries still work

COMMENT ON COLUMN kpi_entries.food_cost IS 'Food cost (COGS) in euros, default 0 when not available';
COMMENT ON COLUMN kpi_entries.food_cost_pct IS 'Food cost as percentage of net revenue, default 0';
