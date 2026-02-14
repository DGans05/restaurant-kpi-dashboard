-- Migration 010: Admin Infrastructure
-- Adds admin functionality: user management, system settings, audit logs

-- ============================================================================
-- 1. ADD ADMIN FLAG TO USER PROFILES
-- ============================================================================

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false NOT NULL;

COMMENT ON COLUMN user_profiles.is_admin IS 'System-wide admin flag for full access';

-- ============================================================================
-- 2. ADD SOFT DELETES
-- ============================================================================

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

COMMENT ON COLUMN user_profiles.deleted_at IS 'Soft delete timestamp';
COMMENT ON COLUMN restaurants.deleted_at IS 'Soft delete timestamp';

-- ============================================================================
-- 3. SYSTEM SETTINGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'email', 'security', 'features')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE system_settings IS 'Centralized system configuration';
COMMENT ON COLUMN system_settings.key IS 'Unique setting identifier (e.g., "upload_max_size_mb")';
COMMENT ON COLUMN system_settings.value IS 'JSONB value for flexibility (strings, numbers, booleans, objects)';
COMMENT ON COLUMN system_settings.category IS 'Setting category for organization';

-- Create index for category filtering
CREATE INDEX idx_system_settings_category ON system_settings(category);

-- Insert default settings
INSERT INTO system_settings (key, value, category, description) VALUES
  ('upload_max_size_mb', '10', 'general', 'Maximum file upload size in megabytes'),
  ('session_timeout_hours', '12', 'security', 'Session timeout in hours'),
  ('enable_audit_logs', 'true', 'features', 'Enable audit logging'),
  ('enable_nyp_integration', 'true', 'features', 'Enable NYP API integration')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 4. AUDIT LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'ACCESS')),
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE audit_logs IS 'Complete audit trail of system activity';
COMMENT ON COLUMN audit_logs.user_id IS 'User who performed action (nullable for system actions)';
COMMENT ON COLUMN audit_logs.user_email IS 'Email snapshot at time of action';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., "user_profiles", "restaurants")';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of affected resource';
COMMENT ON COLUMN audit_logs.old_values IS 'Previous state (for UPDATE/DELETE)';
COMMENT ON COLUMN audit_logs.new_values IS 'New state (for CREATE/UPDATE)';

-- Create indexes for efficient querying
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- 5. AUTOMATIC AUDIT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_table_changes()
RETURNS TRIGGER AS $$
DECLARE
  user_id_val UUID;
  user_email_val TEXT;
BEGIN
  -- Get current user from auth context (may be null for service role)
  user_id_val := auth.uid();

  -- Get user email if user_id is available
  IF user_id_val IS NOT NULL THEN
    SELECT email INTO user_email_val
    FROM auth.users
    WHERE id = user_id_val;
  END IF;

  -- Log the change based on operation type
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_logs (
      user_id,
      user_email,
      action,
      resource_type,
      resource_id,
      old_values
    ) VALUES (
      user_id_val,
      user_email_val,
      'DELETE',
      TG_TABLE_NAME,
      OLD.id::TEXT,
      to_jsonb(OLD)
    );
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_logs (
      user_id,
      user_email,
      action,
      resource_type,
      resource_id,
      old_values,
      new_values
    ) VALUES (
      user_id_val,
      user_email_val,
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_logs (
      user_id,
      user_email,
      action,
      resource_type,
      resource_id,
      new_values
    ) VALUES (
      user_id_val,
      user_email_val,
      'CREATE',
      TG_TABLE_NAME,
      NEW.id::TEXT,
      to_jsonb(NEW)
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. ATTACH AUDIT TRIGGERS TO TABLES
-- ============================================================================

-- User profiles audit
DROP TRIGGER IF EXISTS audit_user_profiles_changes ON user_profiles;
CREATE TRIGGER audit_user_profiles_changes
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- Restaurants audit
DROP TRIGGER IF EXISTS audit_restaurants_changes ON restaurants;
CREATE TRIGGER audit_restaurants_changes
  AFTER INSERT OR UPDATE OR DELETE ON restaurants
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- Targets audit
DROP TRIGGER IF EXISTS audit_targets_changes ON targets;
CREATE TRIGGER audit_targets_changes
  AFTER INSERT OR UPDATE OR DELETE ON targets
  FOR EACH ROW EXECUTE FUNCTION audit_table_changes();

-- ============================================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- System Settings Policies
-- Only admins can read/write system settings
CREATE POLICY "Admins can read system settings"
  ON system_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
      AND user_profiles.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can insert system settings"
  ON system_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
      AND user_profiles.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can update system settings"
  ON system_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
      AND user_profiles.deleted_at IS NULL
    )
  );

CREATE POLICY "Admins can delete system settings"
  ON system_settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
      AND user_profiles.deleted_at IS NULL
    )
  );

-- Audit Logs Policies
-- Admins can read audit logs, service role can write (via trigger)
CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
      AND user_profiles.deleted_at IS NULL
    )
  );

-- Service role can write audit logs (triggers use SECURITY DEFINER)
CREATE POLICY "Service role can write audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 8. UPDATE UPDATED_AT TRIGGER FOR SYSTEM SETTINGS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables exist
DO $$
BEGIN
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings')), 'system_settings table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs')), 'audit_logs table not created';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'is_admin')), 'is_admin column not added';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'deleted_at')), 'user_profiles deleted_at not added';
  ASSERT (SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'restaurants' AND column_name = 'deleted_at')), 'restaurants deleted_at not added';
  RAISE NOTICE 'Migration 010 completed successfully';
END $$;
