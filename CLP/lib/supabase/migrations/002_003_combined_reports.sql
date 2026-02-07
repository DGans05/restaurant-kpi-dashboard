-- ============================================================================
-- Combined Reports Migration: Table + Storage
-- Run this in Supabase SQL Editor to enable the Reports page
-- ============================================================================

-- 1. Create reports metadata table
CREATE TABLE IF NOT EXISTS reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id TEXT REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  report_type TEXT NOT NULL,
  report_name TEXT NOT NULL,
  report_period DATE NOT NULL,
  file_path TEXT,
  file_size_bytes INTEGER,
  upload_status TEXT CHECK (upload_status IN ('uploaded', 'parsing', 'parsed', 'error')) DEFAULT 'uploaded',
  upload_error TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  parsed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(restaurant_id, report_type, report_period)
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_reports_restaurant_period ON reports(restaurant_id, report_period DESC);
CREATE INDEX IF NOT EXISTS idx_reports_type_period ON reports(report_type, report_period DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(upload_status);

-- 3. Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policy if it exists, then create it
DROP POLICY IF EXISTS "Allow all access for reports" ON reports;
CREATE POLICY "Allow all access for reports" ON reports FOR ALL USING (true);

-- 5. Create trigger (only if update_updated_at_column function exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
    CREATE TRIGGER update_reports_updated_at
      BEFORE UPDATE ON reports
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 6. Create reports storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('reports', 'reports', false)
ON CONFLICT (id) DO NOTHING;

-- 7. Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- 8. Create storage policies
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reports');

CREATE POLICY "Allow authenticated downloads"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reports');

CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'reports');

CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'reports');

-- ============================================================================
-- Migration Complete! Refresh your Reports page at http://localhost:3000/reports
-- ============================================================================
