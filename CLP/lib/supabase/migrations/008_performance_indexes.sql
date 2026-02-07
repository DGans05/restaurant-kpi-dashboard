-- Migration 008: Performance Indexes
-- Created: 2026-02-07
-- Purpose: Add indexes for frequently queried columns to improve performance

-- ============================================================================
-- KPI ENTRIES INDEXES
-- ============================================================================

-- Composite index for date range queries by restaurant
-- Used by: Dashboard queries, CSV export, chart data
CREATE INDEX IF NOT EXISTS idx_kpi_entries_restaurant_date
ON kpi_entries(restaurant_id, date DESC);

-- Index for period-based queries
-- Used by: Period comparison, sparkline data
CREATE INDEX IF NOT EXISTS idx_kpi_entries_period
ON kpi_entries(restaurant_id, period_start, period_end);

-- Index for week-based queries
-- Used by: Weekly aggregations
CREATE INDEX IF NOT EXISTS idx_kpi_entries_week
ON kpi_entries(restaurant_id, week_number);

-- ============================================================================
-- REPORTS INDEXES
-- ============================================================================

-- Composite index for report lookup
-- Used by: Report listing, filtering by restaurant and type
CREATE INDEX IF NOT EXISTS idx_reports_restaurant_type_period
ON reports(restaurant_id, report_type, report_period DESC);

-- Index for report status filtering
-- Used by: Finding parsed/pending reports
CREATE INDEX IF NOT EXISTS idx_reports_status
ON reports(upload_status, parsed_at DESC) WHERE upload_status IN ('parsed', 'pending');

-- Index for report search by date
-- Used by: Finding reports for a specific period
CREATE INDEX IF NOT EXISTS idx_reports_period
ON reports(report_period DESC);

-- ============================================================================
-- NYP SESSIONS INDEXES
-- ============================================================================

-- Index for finding active sessions
-- Used by: Cookie refresh, session validation
CREATE INDEX IF NOT EXISTS idx_nyp_sessions_active
ON nyp_sessions(restaurant_id, is_active, last_validated DESC) WHERE is_active = true;

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
CREATE INDEX IF NOT EXISTS idx_targets_restaurant_metric
ON targets(restaurant_id, metric, period_type);

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

COMMENT ON INDEX idx_kpi_entries_restaurant_date IS
  'Optimizes date range queries for dashboard and exports';

COMMENT ON INDEX idx_kpi_entries_period IS
  'Optimizes period-based queries for comparisons';

COMMENT ON INDEX idx_reports_restaurant_type_period IS
  'Optimizes report listing and filtering by restaurant';

COMMENT ON INDEX idx_nyp_sessions_active IS
  'Optimizes active session lookup for cookie validation';

COMMENT ON INDEX idx_user_profiles_user_id IS
  'Optimizes user authentication lookups';

COMMENT ON INDEX idx_targets_restaurant_metric IS
  'Optimizes target threshold lookups for KPI calculations';
