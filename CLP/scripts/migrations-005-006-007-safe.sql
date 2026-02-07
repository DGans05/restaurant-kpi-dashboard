-- ============================================================================
-- SAFE MIGRATIONS: 005, 006, 007
-- Idempotent version - safe to run multiple times
-- ============================================================================
-- Project: apvamphntjpbgoydsluc
-- ============================================================================

BEGIN;

-- ============================================================================
-- Migration 005: User Profiles & Auth-Based RLS Policies
-- ============================================================================

-- Create user_profiles table (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_profiles') THEN
    CREATE TABLE user_profiles (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'viewer')) DEFAULT 'viewer',
      display_name TEXT,
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      UNIQUE(user_id, restaurant_id)
    );

    CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

    RAISE NOTICE 'Created table: user_profiles';
  ELSE
    RAISE NOTICE 'Table user_profiles already exists, skipping';
  END IF;
END $$;

-- Create trigger (skip if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_user_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_user_profiles_updated_at
      BEFORE UPDATE ON user_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE 'Created trigger: update_user_profiles_updated_at';
  ELSE
    RAISE NOTICE 'Trigger update_user_profiles_updated_at already exists, skipping';
  END IF;
END $$;

-- Enable RLS (safe to run multiple times)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop old allow-all policies (safe if they don't exist)
DROP POLICY IF EXISTS "Allow all access for restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow all access for kpi_entries" ON kpi_entries;
DROP POLICY IF EXISTS "Allow all access for reports" ON reports;

-- Create helper function (replace if exists)
CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN coalesce(
    current_setting('request.jwt.claims', true)::json->>'role',
    ''
  ) = 'service_role';
END;
$$ LANGUAGE plpgsql STABLE;

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view own profiles" ON user_profiles;
CREATE POLICY "Users can view own profiles"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id OR is_service_role());

DROP POLICY IF EXISTS "Service role full access on user_profiles" ON user_profiles;
CREATE POLICY "Service role full access on user_profiles"
  ON user_profiles FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- restaurants policies (auth-scoped)
DROP POLICY IF EXISTS "Users can view their restaurants" ON restaurants;
CREATE POLICY "Users can view their restaurants"
  ON restaurants FOR SELECT
  USING (
    id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

DROP POLICY IF EXISTS "Service role full access on restaurants" ON restaurants;
CREATE POLICY "Service role full access on restaurants"
  ON restaurants FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- kpi_entries policies (auth-scoped)
DROP POLICY IF EXISTS "Users can view their kpi_entries" ON kpi_entries;
CREATE POLICY "Users can view their kpi_entries"
  ON kpi_entries FOR SELECT
  USING (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

DROP POLICY IF EXISTS "Service role full access on kpi_entries" ON kpi_entries;
CREATE POLICY "Service role full access on kpi_entries"
  ON kpi_entries FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- reports policies (auth-scoped, full CRUD for authenticated users)
DROP POLICY IF EXISTS "Users can view their reports" ON reports;
CREATE POLICY "Users can view their reports"
  ON reports FOR SELECT
  USING (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

DROP POLICY IF EXISTS "Users can insert reports for their restaurants" ON reports;
CREATE POLICY "Users can insert reports for their restaurants"
  ON reports FOR INSERT
  WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

DROP POLICY IF EXISTS "Users can update their reports" ON reports;
CREATE POLICY "Users can update their reports"
  ON reports FOR UPDATE
  USING (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  )
  WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

DROP POLICY IF EXISTS "Users can delete their reports" ON reports;
CREATE POLICY "Users can delete their reports"
  ON reports FOR DELETE
  USING (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

DROP POLICY IF EXISTS "Service role full access on reports" ON reports;
CREATE POLICY "Service role full access on reports"
  ON reports FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- Comments
COMMENT ON TABLE user_profiles IS 'Links Supabase Auth users to restaurants with role-based access';
COMMENT ON COLUMN user_profiles.user_id IS 'References auth.users(id) — the authenticated user';
COMMENT ON COLUMN user_profiles.restaurant_id IS 'The restaurant this user has access to';
COMMENT ON COLUMN user_profiles.role IS 'Access level: owner, manager, or viewer';
COMMENT ON FUNCTION is_service_role() IS 'Returns true when the current JWT belongs to the service_role, used for RLS bypass';

-- ============================================================================
-- Migration 006: NYP Session Management
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'nyp_sessions') THEN
    CREATE TABLE nyp_sessions (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL UNIQUE,
      cookies_json TEXT NOT NULL,
      last_validated TIMESTAMPTZ,
      is_active BOOLEAN DEFAULT true NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
    );

    RAISE NOTICE 'Created table: nyp_sessions';
  ELSE
    RAISE NOTICE 'Table nyp_sessions already exists, skipping';
  END IF;
END $$;

ALTER TABLE nyp_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role access for nyp_sessions" ON nyp_sessions;
CREATE POLICY "Service role access for nyp_sessions" ON nyp_sessions
  FOR ALL USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_nyp_sessions_updated_at'
  ) THEN
    CREATE TRIGGER update_nyp_sessions_updated_at
      BEFORE UPDATE ON nyp_sessions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE 'Created trigger: update_nyp_sessions_updated_at';
  ELSE
    RAISE NOTICE 'Trigger update_nyp_sessions_updated_at already exists, skipping';
  END IF;
END $$;

COMMENT ON TABLE nyp_sessions IS 'NYP store portal session cookies for automated downloads';
COMMENT ON COLUMN nyp_sessions.cookies_json IS 'JSON string of cookie key-value pairs (NOT raw auth.json format)';

-- ============================================================================
-- Migration 007: Targets & Thresholds for KPI Metrics
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'targets') THEN
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

    RAISE NOTICE 'Created table: targets';
  ELSE
    RAISE NOTICE 'Table targets already exists, skipping';
  END IF;
END $$;

ALTER TABLE targets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view targets for their restaurants" ON targets;
CREATE POLICY "Users can view targets for their restaurants" ON targets
  FOR SELECT USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can manage targets" ON targets;
CREATE POLICY "Owners can manage targets" ON targets
  FOR ALL USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

DROP POLICY IF EXISTS "Service role access for targets" ON targets;
CREATE POLICY "Service role access for targets" ON targets
  FOR ALL USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_targets_updated_at'
  ) THEN
    CREATE TRIGGER update_targets_updated_at
      BEFORE UPDATE ON targets
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE 'Created trigger: update_targets_updated_at';
  ELSE
    RAISE NOTICE 'Trigger update_targets_updated_at already exists, skipping';
  END IF;
END $$;

-- Default targets for Rosmalen (insert only if not exists)
INSERT INTO targets (restaurant_id, metric, target_value, warning_threshold, danger_threshold, period_type) VALUES
  ('rosmalen', 'revenue', 15000, 13000, 11000, 'weekly'),
  ('rosmalen', 'labour_pct', 28, 32, 35, 'weekly'),
  ('rosmalen', 'food_cost_pct', 28, 30, 33, 'weekly'),
  ('rosmalen', 'prime_cost_pct', 56, 60, 65, 'weekly'),
  ('rosmalen', 'delivery_30min_pct', 90, 85, 80, 'weekly')
ON CONFLICT (restaurant_id, metric, period_type) DO NOTHING;

COMMENT ON TABLE targets IS 'Per-restaurant KPI targets and thresholds';
COMMENT ON COLUMN targets.metric IS 'Metric name: revenue, labour_pct, food_cost_pct, prime_cost_pct, delivery_30min_pct';
COMMENT ON COLUMN targets.warning_threshold IS 'Value at which metric turns yellow/warning';
COMMENT ON COLUMN targets.danger_threshold IS 'Value at which metric turns red/danger';

COMMIT;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check tables created
SELECT 'Tables created:' as status;
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('user_profiles', 'nyp_sessions', 'targets');

-- Check default targets inserted
SELECT 'Default targets:' as status;
SELECT metric, target_value, warning_threshold, danger_threshold
FROM targets
WHERE restaurant_id = 'rosmalen';

-- Check RLS policies exist
SELECT 'RLS policies:' as status;
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('user_profiles', 'nyp_sessions', 'targets', 'kpi_entries', 'restaurants', 'reports')
GROUP BY tablename
ORDER BY tablename;

SELECT '✅ Migrations completed successfully!' as status;
