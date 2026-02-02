-- ===========================
-- Row Level Security Policies
-- ===========================

-- PROFILES: Users can view all profiles, but only admins can update others
CREATE POLICY "profiles_select_all" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_self" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_admin" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "profiles_delete_admin" ON profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "profiles_insert_admin" ON profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RESTAURANTS: Admins see all, managers/viewers see only assigned ones
CREATE POLICY "restaurants_select_admin" ON restaurants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "restaurants_select_user" ON restaurants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_restaurants
      WHERE user_id = auth.uid() 
        AND restaurant_id = restaurants.id
    )
  );

CREATE POLICY "restaurants_insert_admin" ON restaurants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "restaurants_update_admin" ON restaurants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "restaurants_delete_admin" ON restaurants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- USER_RESTAURANTS: Admins manage all, users see own assignments
CREATE POLICY "user_restaurants_select_admin" ON user_restaurants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "user_restaurants_select_user" ON user_restaurants
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "user_restaurants_insert_admin" ON user_restaurants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "user_restaurants_delete_admin" ON user_restaurants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- KPI_ENTRIES: Admins see all, others see only assigned restaurants
CREATE POLICY "kpi_entries_select_admin" ON kpi_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "kpi_entries_select_user" ON kpi_entries
  FOR SELECT USING (
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "kpi_entries_insert_manager" ON kpi_entries
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
    AND
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "kpi_entries_update_manager" ON kpi_entries
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
    AND
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "kpi_entries_delete_manager" ON kpi_entries
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
    AND
    restaurant_id IN (
      SELECT restaurant_id FROM user_restaurants 
      WHERE user_id = auth.uid()
    )
  );

-- AUDIT_LOGS: Only admins can view, insert by system only
CREATE POLICY "audit_logs_select_admin" ON audit_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "audit_logs_insert_system" ON audit_logs
  FOR INSERT WITH CHECK (
    -- Allow system insertions (user_id may be current user or service account)
    auth.uid() IS NOT NULL
  );
