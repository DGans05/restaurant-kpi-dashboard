-- Reports metadata table
CREATE TABLE reports (
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

CREATE INDEX idx_reports_restaurant_period ON reports(restaurant_id, report_period DESC);
CREATE INDEX idx_reports_type_period ON reports(report_type, report_period DESC);
CREATE INDEX idx_reports_status ON reports(upload_status);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access for reports" ON reports FOR ALL USING (true);

CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
