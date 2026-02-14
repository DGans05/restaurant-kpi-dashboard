-- ============================================================================
-- Initial Schema Migration for Restaurant KPI Dashboard
-- ============================================================================

-- Restaurants table
CREATE TABLE restaurants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- KPI entries table
CREATE TABLE kpi_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  day_name TEXT NOT NULL,
  week_number INTEGER NOT NULL CHECK (week_number > 0),

  -- Revenue
  planned_revenue NUMERIC(10, 2) NOT NULL CHECK (planned_revenue >= 0),
  gross_revenue NUMERIC(10, 2) NOT NULL CHECK (gross_revenue >= 0),
  net_revenue NUMERIC(10, 2) NOT NULL CHECK (net_revenue >= 0),

  -- Labour
  planned_labour_cost NUMERIC(10, 2) NOT NULL CHECK (planned_labour_cost >= 0),
  labour_cost NUMERIC(10, 2) NOT NULL CHECK (labour_cost >= 0),
  planned_labour_pct NUMERIC(5, 2),
  labour_pct NUMERIC(5, 2) NOT NULL CHECK (labour_pct >= 0),
  worked_hours NUMERIC(6, 2) NOT NULL CHECK (worked_hours >= 0),
  labour_productivity NUMERIC(10, 2) NOT NULL CHECK (labour_productivity >= 0),

  -- Delivery
  delivery_rate_30min NUMERIC(5, 2) NOT NULL CHECK (delivery_rate_30min >= 0 AND delivery_rate_30min <= 100),
  on_time_delivery_mins NUMERIC(6, 2) NOT NULL CHECK (on_time_delivery_mins >= 0),
  make_time_mins NUMERIC(6, 2) NOT NULL CHECK (make_time_mins >= 0),
  drive_time_mins NUMERIC(6, 2) NOT NULL CHECK (drive_time_mins >= 0),

  -- Orders
  order_count INTEGER NOT NULL CHECK (order_count >= 0),
  avg_order_value NUMERIC(10, 2) NOT NULL CHECK (avg_order_value >= 0),
  orders_per_run NUMERIC(6, 2) NOT NULL CHECK (orders_per_run >= 0),

  -- Meta
  cash_difference NUMERIC(10, 2),
  manager TEXT NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(restaurant_id, date)
);

-- Indexes for query performance
CREATE INDEX idx_kpi_entries_restaurant_date ON kpi_entries(restaurant_id, date DESC);
CREATE INDEX idx_kpi_entries_date ON kpi_entries(date DESC);
CREATE INDEX idx_kpi_entries_week ON kpi_entries(week_number);

-- Row Level Security (placeholder for future auth)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_entries ENABLE ROW LEVEL SECURITY;

-- Temporary policy: allow all (replace with auth-based policies later)
CREATE POLICY "Allow all access for restaurants" ON restaurants FOR ALL USING (true);
CREATE POLICY "Allow all access for kpi_entries" ON kpi_entries FOR ALL USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_restaurants_updated_at
  BEFORE UPDATE ON restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kpi_entries_updated_at
  BEFORE UPDATE ON kpi_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE restaurants IS 'Restaurant locations and metadata';
COMMENT ON TABLE kpi_entries IS 'Daily KPI entries for each restaurant';
COMMENT ON COLUMN kpi_entries.date IS 'ISO date YYYY-MM-DD';
COMMENT ON COLUMN kpi_entries.delivery_rate_30min IS 'Percentage of deliveries within 30 minutes';
