-- Migration 008: Performance Indexes (Fixed)
-- Created: 2026-02-08
-- Purpose: Add indexes for frequently queried columns to improve performance

-- ============================================================================
-- KPI ENTRIES INDEXES
-- ============================================================================
-- Note: idx_kpi_entries_restaurant_date already exists from migration 001
-- Note: idx_kpi_entries_week already exists from migration 001

-- Index for manager-based queries
-- Used by: Manager leaderboard, manager performance tracking
CREATE INDEX IF NOT EXISTS idx_kpi_entries_manager
ON kpi_entries(restaurant_id, manager, date DESC);

-- ============================================================================
-- REPORTS INDEXES
-- ============================================================================

-- Composite index for report lookup
-- Used by: Report listing, filtering by restaurant and type
CREATE INDEX IF NOT EXISTS idx_reports_restaurant_type_period
ON reports(restaurant_id, report_type, report_period DESC);

-- Index for report status filtering
-- Used by: Finding parsed/pending reports
CREATE INDEX IF NOT EXISTS idx_reports_upload_status
ON reports(upload_status, parsed_at DESC) WHERE upload_status IN ('parsed', 'pending');

-- Index for report search by date
-- Used by: Finding reports for a specific period
CREATE INDEX IF NOT EXISTS idx_reports_created_at
ON reports(created_at DESC);

-- Composite index for restaurant + created_at
-- Used by: Recent reports by restaurant
CREATE INDEX IF NOT EXISTS idx_reports_restaurant_created
ON reports(restaurant_id, created_at DESC);

-- ============================================================================
-- NYP SESSIONS INDEXES
-- ============================================================================

-- Index for finding active sessions
-- Used by: Cookie refresh, session validation
CREATE INDEX IF NOT EXISTS idx_nyp_sessions_active
ON nyp_sessions(restaurant_id, is_active, last_validated DESC) WHERE is_active = true;

-- Index for session validation sorting
-- Used by: Finding oldest sessions for refresh
CREATE INDEX IF NOT EXISTS idx_nyp_sessions_last_validated
ON nyp_sessions(last_validated DESC) WHERE is_active = true;

-- ============================================================================
-- USER PROFILES INDEXES
-- ============================================================================

-- Index for user lookup by auth user_id
-- Used by: Authentication, authorization checks
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id
ON user_profiles(user_id);

-- Composite index for restaurant access check
-- Used by: RLS policies, restaurant filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_restaurant
ON user_profiles(restaurant_id, user_id);

-- ============================================================================
-- TARGETS INDEXES
-- ============================================================================

-- Index for target lookup by restaurant and metric
-- Used by: Dashboard threshold calculations
CREATE INDEX IF NOT EXISTS idx_targets_restaurant_active
ON targets(restaurant_id, metric, period_type) WHERE is_active = true;

-- ============================================================================
-- STATISTICS & MONITORING
-- ============================================================================

-- Update table statistics for query planner
ANALYZE kpi_entries;
ANALYZE reports;
ANALYZE nyp_sessions;
ANALYZE user_profiles;
ANALYZE targets;
ANALYZE restaurants;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON INDEX idx_kpi_entries_manager IS
  'Optimizes manager-based performance queries';

COMMENT ON INDEX idx_reports_restaurant_type_period IS
  'Optimizes report listing and filtering by restaurant';

COMMENT ON INDEX idx_nyp_sessions_active IS
  'Optimizes active session lookup for cookie validation';

COMMENT ON INDEX idx_user_profiles_user_id IS
  'Optimizes user authentication lookups';

COMMENT ON INDEX idx_targets_restaurant_active IS
  'Optimizes target threshold lookups for KPI calculations';
