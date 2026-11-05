-- ============================================================================
-- BOOZER · V3 SCHEMA ALIGNMENT MIGRATION
-- Synchronize table columns with Spring Boot JPA entities
-- ============================================================================

-- 1. Deliveries table: add OTP, delivered_at and rider coordinate aliases
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS doorstep_otp VARCHAR(6) DEFAULT '4819';
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS rider_lat NUMERIC(10, 7);
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS rider_lng NUMERIC(10, 7);

-- 2. Orders table: add missing INR amount fields, address and lifecycle timestamps
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal_inr NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee_inr NUMERIC(10, 2) DEFAULT 49.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS convenience_fee_inr NUMERIC(10, 2) DEFAULT 19.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_inr NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_inr NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS placed_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS safe_ride_voucher_eligible BOOLEAN DEFAULT true;

-- 3. Order Items table: add explicit unit and total MRP columns
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS unit_mrp_inr NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS total_mrp_inr NUMERIC(10, 2) DEFAULT 0.00;

-- 4. Products table: add title, statutory MRP and subcategory columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS title VARCHAR(200);
ALTER TABLE products ADD COLUMN IF NOT EXISTS statutory_mrp_inr NUMERIC(10, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);

-- Populate new columns from existing seed data
UPDATE products SET title = name WHERE title IS NULL AND name IS NOT NULL;
UPDATE products SET statutory_mrp_inr = price_legal_mrp WHERE statutory_mrp_inr IS NULL AND price_legal_mrp IS NOT NULL;
UPDATE orders SET subtotal_inr = subtotal_amount WHERE subtotal_inr = 0.00 AND subtotal_amount IS NOT NULL;
UPDATE orders SET total_inr = total_amount WHERE total_inr = 0.00 AND total_amount IS NOT NULL;
UPDATE orders SET delivery_address = delivery_address_line1 WHERE delivery_address IS NULL AND delivery_address_line1 IS NOT NULL;
UPDATE order_items SET unit_mrp_inr = unit_price WHERE unit_mrp_inr = 0.00 AND unit_price IS NOT NULL;
UPDATE order_items SET total_mrp_inr = total_price WHERE total_mrp_inr = 0.00 AND total_price IS NOT NULL;
