-- ============================================================================
-- V5: Rider Live Telemetry & Location Streaming Columns
-- ============================================================================

ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS rider_speed_kmh NUMERIC(5, 2);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS rider_heading_degrees NUMERIC(5, 2);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS rider_location_updated_at TIMESTAMPTZ;
