-- ============================================================================
-- Migration 005: User Profiles & Auth-Based RLS Policies
-- ============================================================================
-- Adds user_profiles table linking Supabase Auth users to restaurants with
-- role-based access. Replaces temporary allow-all RLS policies with
-- auth-scoped policies. Includes service_role bypass for backend/cron jobs.
-- ============================================================================

-- --------------------------------------------------------------------------
-- 1. Create user_profiles table
-- --------------------------------------------------------------------------

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

-- Index for fast lookups by user
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- Auto-update updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- 2. Drop existing allow-all policies
-- --------------------------------------------------------------------------

DROP POLICY IF EXISTS "Allow all access for restaurants" ON restaurants;
DROP POLICY IF EXISTS "Allow all access for kpi_entries" ON kpi_entries;
DROP POLICY IF EXISTS "Allow all access for reports" ON reports;

-- --------------------------------------------------------------------------
-- 3. Helper: check if current request is from service_role
-- --------------------------------------------------------------------------
-- Service role bypasses all RLS so backend/cron jobs continue to work.

CREATE OR REPLACE FUNCTION is_service_role()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN coalesce(
    current_setting('request.jwt.claims', true)::json->>'role',
    ''
  ) = 'service_role';
END;
$$ LANGUAGE plpgsql STABLE;

-- --------------------------------------------------------------------------
-- 4. user_profiles policies
-- --------------------------------------------------------------------------

-- Users can read their own profile rows
CREATE POLICY "Users can view own profiles"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id OR is_service_role());

-- Service role can manage all profiles
CREATE POLICY "Service role full access on user_profiles"
  ON user_profiles FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- --------------------------------------------------------------------------
-- 5. restaurants policies (auth-scoped)
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their restaurants"
  ON restaurants FOR SELECT
  USING (
    id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

CREATE POLICY "Service role full access on restaurants"
  ON restaurants FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- --------------------------------------------------------------------------
-- 6. kpi_entries policies (auth-scoped)
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their kpi_entries"
  ON kpi_entries FOR SELECT
  USING (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

CREATE POLICY "Service role full access on kpi_entries"
  ON kpi_entries FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- --------------------------------------------------------------------------
-- 7. reports policies (auth-scoped, full CRUD for authenticated users)
-- --------------------------------------------------------------------------

CREATE POLICY "Users can view their reports"
  ON reports FOR SELECT
  USING (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

CREATE POLICY "Users can insert reports for their restaurants"
  ON reports FOR INSERT
  WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

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

CREATE POLICY "Users can delete their reports"
  ON reports FOR DELETE
  USING (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

CREATE POLICY "Service role full access on reports"
  ON reports FOR ALL
  USING (is_service_role())
  WITH CHECK (is_service_role());

-- --------------------------------------------------------------------------
-- 8. Comments
-- --------------------------------------------------------------------------

COMMENT ON TABLE user_profiles IS 'Links Supabase Auth users to restaurants with role-based access';
COMMENT ON COLUMN user_profiles.user_id IS 'References auth.users(id) — the authenticated user';
COMMENT ON COLUMN user_profiles.restaurant_id IS 'The restaurant this user has access to';
COMMENT ON COLUMN user_profiles.role IS 'Access level: owner, manager, or viewer';
COMMENT ON FUNCTION is_service_role() IS 'Returns true when the current JWT belongs to the service_role, used for RLS bypass';
