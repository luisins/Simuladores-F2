-- Create an atomic increment function
CREATE OR REPLACE FUNCTION increment_visits()
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_count BIGINT;
BEGIN
  UPDATE site_visits SET count = count + 1 WHERE id = 1
  RETURNING count INTO new_count;
  RETURN new_count;
END;
$$;