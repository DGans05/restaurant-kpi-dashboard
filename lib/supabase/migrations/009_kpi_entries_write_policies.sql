-- ============================================================================
-- Migration 009: Add INSERT/UPDATE/DELETE policies for kpi_entries
-- ============================================================================
-- Migration 005 only added SELECT policy for authenticated users on
-- kpi_entries. This adds INSERT, UPDATE, DELETE policies so users can
-- manage KPI entries for their restaurants, matching the reports pattern.
-- ============================================================================

-- Users can insert kpi_entries for their restaurants
CREATE POLICY "Users can insert kpi_entries for their restaurants"
  ON kpi_entries FOR INSERT
  WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

-- Users can update kpi_entries for their restaurants
CREATE POLICY "Users can update their kpi_entries"
  ON kpi_entries FOR UPDATE
  USING (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  )
  WITH CHECK (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

-- Users can delete kpi_entries for their restaurants
CREATE POLICY "Users can delete their kpi_entries"
  ON kpi_entries FOR DELETE
  USING (
    restaurant_id IN (SELECT restaurant_id FROM user_profiles WHERE user_id = auth.uid())
    OR is_service_role()
  );

-- Comments
COMMENT ON POLICY "Users can insert kpi_entries for their restaurants" ON kpi_entries
  IS 'Allows authenticated users to insert KPI entries for restaurants they have access to via user_profiles';
COMMENT ON POLICY "Users can update their kpi_entries" ON kpi_entries
  IS 'Allows authenticated users to update KPI entries for restaurants they have access to via user_profiles';
COMMENT ON POLICY "Users can delete their kpi_entries" ON kpi_entries
  IS 'Allows authenticated users to delete KPI entries for restaurants they have access to via user_profiles';
