-- ============================================================================
-- Targets & Thresholds for KPI Metrics
-- Per-restaurant configurable targets for dashboard color-coding
-- ============================================================================

CREATE TABLE targets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  metric TEXT NOT NULL,
  target_value NUMERIC(10, 2) NOT NULL,
  warning_threshold NUMERIC(10, 2),
  danger_threshold NUMERIC(10, 2),
  period_type TEXT NOT NULL DEFAULT 'weekly' CHECK (period_type IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(restaurant_id, metric, period_type)
);

ALTER TABLE targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view targets for their restaurants" ON targets
  FOR SELECT USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage targets" ON targets
  FOR ALL USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Service role access for targets" ON targets
  FOR ALL USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

CREATE TRIGGER update_targets_updated_at
  BEFORE UPDATE ON targets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Default targets for Rosmalen
INSERT INTO targets (restaurant_id, metric, target_value, warning_threshold, danger_threshold, period_type) VALUES
  ('rosmalen', 'revenue', 15000, 13000, 11000, 'weekly'),
  ('rosmalen', 'labour_pct', 28, 32, 35, 'weekly'),
  ('rosmalen', 'food_cost_pct', 28, 30, 33, 'weekly'),
  ('rosmalen', 'prime_cost_pct', 56, 60, 65, 'weekly'),
  ('rosmalen', 'delivery_30min_pct', 90, 85, 80, 'weekly');

COMMENT ON TABLE targets IS 'Per-restaurant KPI targets and thresholds';
COMMENT ON COLUMN targets.metric IS 'Metric name: revenue, labour_pct, food_cost_pct, prime_cost_pct, delivery_30min_pct';
COMMENT ON COLUMN targets.warning_threshold IS 'Value at which metric turns yellow/warning';
COMMENT ON COLUMN targets.danger_threshold IS 'Value at which metric turns red/danger';
