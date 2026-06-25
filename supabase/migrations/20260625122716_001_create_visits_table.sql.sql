-- Create a simple visits counter table
CREATE TABLE IF NOT EXISTS site_visits (
  id INTEGER PRIMARY KEY DEFAULT 1,
  count BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial row
INSERT INTO site_visits (id, count) VALUES (1, 0) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE site_visits ENABLE ROW LEVEL SECURITY;

-- Allow public read access (to display the counter)
CREATE POLICY "allow_public_read_visits" ON site_visits
  FOR SELECT TO public USING (true);

-- Allow anon to increment (for edge function)
CREATE POLICY "allow_service_write_visits" ON site_visits
  FOR ALL TO service_role USING (true) WITH CHECK (true);