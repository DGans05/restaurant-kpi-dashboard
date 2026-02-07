-- ============================================================================
-- NYP Session Management
-- Stores NYP store portal cookies for automated report downloads
-- ============================================================================

CREATE TABLE nyp_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL UNIQUE,
  cookies_json TEXT NOT NULL,
  last_validated TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE nyp_sessions ENABLE ROW LEVEL SECURITY;

-- Only service role can access (sensitive cookie data)
CREATE POLICY "Service role access for nyp_sessions" ON nyp_sessions
  FOR ALL USING (
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Trigger
CREATE TRIGGER update_nyp_sessions_updated_at
  BEFORE UPDATE ON nyp_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE nyp_sessions IS 'NYP store portal session cookies for automated downloads';
COMMENT ON COLUMN nyp_sessions.cookies_json IS 'JSON string of cookie key-value pairs (NOT raw auth.json format)';
