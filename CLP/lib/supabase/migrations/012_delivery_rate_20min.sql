-- Migration 012: Add delivery_rate_20min column to kpi_entries
-- Tracks percentage of deliveries completed within 20 minutes

ALTER TABLE kpi_entries
ADD COLUMN IF NOT EXISTS delivery_rate_20min NUMERIC(5,2) DEFAULT 0;

-- Backfill existing rows
UPDATE kpi_entries SET delivery_rate_20min = 0 WHERE delivery_rate_20min IS NULL;
