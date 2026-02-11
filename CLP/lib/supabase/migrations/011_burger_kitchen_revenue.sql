-- Migration 011: Add burger_kitchen_revenue column to kpi_entries
-- Tracks revenue from the Burger Kitchen (BK Omzet)

ALTER TABLE kpi_entries
ADD COLUMN IF NOT EXISTS burger_kitchen_revenue NUMERIC(10,2) DEFAULT 0;

-- Backfill existing rows
UPDATE kpi_entries SET burger_kitchen_revenue = 0 WHERE burger_kitchen_revenue IS NULL;
