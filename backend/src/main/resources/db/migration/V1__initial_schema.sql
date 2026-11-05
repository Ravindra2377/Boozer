-- ============================================================================
-- BOOZER · DATABASE SCHEMA (Flyway V1 Migration)
-- Modular Monolith with PostgreSQL 16
-- Compliance: India DPDP Act 2023 & State Excise Rules
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE user_kyc_status AS ENUM (
    'PENDING',
    'VERIFIED',
    'REJECTED',
    'EXPIRED'
);

-- Exact Order State Machine:
-- CREATED -> PAID -> ACCEPTED -> PACKED -> DISPATCHED -> ARRIVED -> AGE_CHECKED -> DELIVERED
-- CANCELLED or REFUNDED reachable from intermediate steps
CREATE TYPE order_status AS ENUM (
    'CREATED',
    'PAID',
    'ACCEPTED',
    'PACKED',
    'DISPATCHED',
    'ARRIVED',
    'AGE_CHECKED',
    'DELIVERED',
    'CANCELLED',
    'REFUNDED'
);

CREATE TYPE payment_status AS ENUM (
    'PENDING',
    'AUTHORIZED',
    'CAPTURED',
    'FAILED',
    'REFUNDED'
);

CREATE TYPE refund_status AS ENUM (
    'NONE',
    'INITIATED',
    'PROCESSED',
    'FAILED'
);

CREATE TYPE delivery_status AS ENUM (
    'ASSIGNED',
    'ACCEPTED_BY_RIDER',
    'ARRIVED_AT_STORE',
    'PICKED_UP',
    'IN_TRANSIT',
    'ARRIVED_AT_DOOR',
    'AGE_VERIFIED',
    'COMPLETED',
    'FAILED'
);

CREATE TYPE ride_partner AS ENUM (
    'UBER',
    'OLA',
    'RAPIDO',
    'LOCAL_FLEET'
);

CREATE TYPE ride_booking_status AS ENUM (
    'CREDIT_ISSUED',
    'DEEP_LINK_OPENED',
    'BOOKED',
    'IN_TRANSIT',
    'COMPLETED',
    'EXPIRED',
    'CANCELLED'
);

CREATE TYPE safety_event_type AS ENUM (
    'SOS_TRIGGERED',
    'TRIP_SHARED',
    'EMERGENCY_DISPATCH',
    'CHECK_IN_FAILED'
);

CREATE TYPE safety_event_status AS ENUM (
    'OPEN',
    'CONTACTS_NOTIFIED',
    'DISPATCH_ENGAGED',
    'RESOLVED',
    'FALSE_ALARM'
);

CREATE TYPE retailer_license_status AS ENUM (
    'ACTIVE',
    'UNDER_REVIEW',
    'SUSPENDED',
    'EXPIRED'
);

CREATE TYPE product_category AS ENUM (
    'BEER',
    'WINE',
    'WHISKY',
    'VODKA',
    'RUM',
    'GIN',
    'TEQUILA',
    'RTD',
    'MIXERS_AND_SODA'
);

CREATE TYPE actor_role AS ENUM (
    'CUSTOMER',
    'RETAILER_STAFF',
    'RETAILER_MANAGER',
    'DELIVERY_PARTNER',
    'ADMIN',
    'SYSTEM'
);

-- ============================================================================
-- 1. USERS & TRUSTED CONTACTS
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    date_of_birth DATE NOT NULL,
    kyc_status user_kyc_status NOT NULL DEFAULT 'PENDING',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_user_min_age CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '18 years')
);

CREATE TABLE user_trusted_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    relationship VARCHAR(50),
    is_sos_recipient BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_contact UNIQUE (user_id, phone)
);

-- DPDP Rule: Store only verification result & provider ref, NEVER raw documents/Aadhaar numbers
CREATE TABLE kyc_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL DEFAULT 'DIGILOCKER',
    provider_ref VARCHAR(120) NOT NULL,
    id_document_type VARCHAR(30) NOT NULL,
    masked_id_number VARCHAR(50) NOT NULL,
    age_verified BOOLEAN NOT NULL DEFAULT false,
    calculated_age INT NOT NULL,
    state_jurisdiction VARCHAR(50) NOT NULL DEFAULT 'DELHI',
    verification_hash VARCHAR(255),
    verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. RETAILERS & LICENSING
-- ============================================================================

CREATE TABLE retailers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_name VARCHAR(150) NOT NULL,
    legal_entity_name VARCHAR(150) NOT NULL,
    licence_number VARCHAR(100) UNIQUE NOT NULL,
    licence_state VARCHAR(50) NOT NULL,
    licence_document_url TEXT,
    licence_expiry DATE NOT NULL,
    license_status retailer_license_status NOT NULL DEFAULT 'UNDER_REVIEW',
    excise_zone VARCHAR(100) NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(20) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    delivery_radius_km NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    delivery_zone_polygon JSONB,
    operating_hours_start TIME NOT NULL DEFAULT '10:00:00',
    operating_hours_end TIME NOT NULL DEFAULT '22:00:00',
    payout_account_ref VARCHAR(100),
    is_accepting_orders BOOLEAN NOT NULL DEFAULT true,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_operating_hours CHECK (operating_hours_start < operating_hours_end)
);

CREATE TABLE retailer_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'MANAGER',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. PRODUCTS & STOCK (Legal MRP, No surge pricing)
-- ============================================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category product_category NOT NULL,
    abv NUMERIC(4, 2) NOT NULL,
    volume_ml INT NOT NULL,
    price_legal_mrp NUMERIC(10, 2) NOT NULL,
    age_restricted BOOLEAN NOT NULL DEFAULT true,
    min_age_requirement INT NOT NULL DEFAULT 21,
    image_url TEXT,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_price_positive CHECK (price_legal_mrp > 0),
    CONSTRAINT chk_abv_range CHECK (abv >= 0 AND abv <= 100)
);

CREATE TABLE stock (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    retailer_id UUID NOT NULL REFERENCES retailers(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    is_available BOOLEAN GENERATED ALWAYS AS (quantity > 0) STORED,
    last_restocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_stock_quantity_non_negative CHECK (quantity >= 0)
);

-- ============================================================================
-- 4. ORDERS & ORDER ITEMS
-- ============================================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(32) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    retailer_id UUID NOT NULL REFERENCES retailers(id),
    status order_status NOT NULL DEFAULT 'CREATED',
    
    delivery_address_line1 VARCHAR(255) NOT NULL,
    delivery_landmark VARCHAR(255),
    delivery_city VARCHAR(100) NOT NULL,
    delivery_pincode VARCHAR(20) NOT NULL,
    delivery_lat NUMERIC(10, 7) NOT NULL,
    delivery_lng NUMERIC(10, 7) NOT NULL,
    
    subtotal_amount NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    packaging_fee NUMERIC(10, 2) NOT NULL DEFAULT 20.00,
    tax_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    
    age_check_at_door_required BOOLEAN NOT NULL DEFAULT true,
    age_check_at_door_verified BOOLEAN NOT NULL DEFAULT false,
    door_verified_by_rider VARCHAR(100),
    door_verified_at TIMESTAMPTZ,
    
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name_snapshot VARCHAR(200) NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. PAYMENTS & REFUNDS
-- ============================================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id),
    gateway VARCHAR(50) NOT NULL DEFAULT 'RAZORPAY',
    gateway_order_id VARCHAR(100) UNIQUE NOT NULL,
    gateway_payment_id VARCHAR(100) UNIQUE,
    gateway_signature VARCHAR(255),
    amount NUMERIC(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status payment_status NOT NULL DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    refund_status refund_status NOT NULL DEFAULT 'NONE',
    refund_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    refund_gateway_ref VARCHAR(100),
    raw_response JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. DELIVERIES (Rider assignment & Live tracking)
-- ============================================================================

CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status delivery_status NOT NULL DEFAULT 'ASSIGNED',
    rider_name VARCHAR(100),
    rider_phone VARCHAR(20),
    rider_vehicle_number VARCHAR(50),
    current_lat NUMERIC(10, 7),
    current_lng NUMERIC(10, 7),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    picked_up_at TIMESTAMPTZ,
    arrived_at_door_at TIMESTAMPTZ,
    age_verified_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. RIDE BOOKINGS & CREDITS
-- ============================================================================

CREATE TABLE ride_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID NOT NULL REFERENCES orders(id),
    credit_code VARCHAR(30) UNIQUE NOT NULL,
    credit_amount NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    is_redeemed BOOLEAN NOT NULL DEFAULT false,
    redeemed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ride_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    ride_credit_id UUID REFERENCES ride_credits(id),
    partner ride_partner NOT NULL DEFAULT 'UBER',
    partner_booking_ref VARCHAR(120),
    status ride_booking_status NOT NULL DEFAULT 'CREDIT_ISSUED',
    pickup_address VARCHAR(255) NOT NULL,
    pickup_lat NUMERIC(10, 7) NOT NULL,
    pickup_lng NUMERIC(10, 7) NOT NULL,
    dropoff_address VARCHAR(255) NOT NULL,
    dropoff_lat NUMERIC(10, 7) NOT NULL,
    dropoff_lng NUMERIC(10, 7) NOT NULL,
    estimated_fare NUMERIC(10, 2),
    credit_applied NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    net_fare_payable NUMERIC(10, 2),
    driver_name VARCHAR(100),
    driver_phone VARCHAR(20),
    vehicle_model VARCHAR(50),
    vehicle_number VARCHAR(50),
    deep_link_url TEXT,
    trip_share_token VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. SAFETY CENTRE & SOS DISPATCH
-- ============================================================================

CREATE TABLE safety_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    ride_booking_id UUID REFERENCES ride_bookings(id),
    event_type safety_event_type NOT NULL DEFAULT 'SOS_TRIGGERED',
    status safety_event_status NOT NULL DEFAULT 'OPEN',
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    accuracy_meters NUMERIC(6, 2),
    sos_reason VARCHAR(100) DEFAULT 'USER_TRIGGERED_EMERGENCY_BUTTON',
    contacts_notified_count INT NOT NULL DEFAULT 0,
    emergency_dispatch_notified BOOLEAN NOT NULL DEFAULT false,
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. AUDIT LOG (Immutable trail for all sensitive and administrative actions)
-- ============================================================================

CREATE TABLE audit_log (
    id BIGSERIAL PRIMARY KEY,
    actor_id UUID,
    actor_role actor_role NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(60) NOT NULL,
    entity_id VARCHAR(100),
    old_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. INDEXES (Optimized for frequent queries)
-- ============================================================================

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);

CREATE INDEX idx_kyc_records_user ON kyc_records(user_id);
CREATE INDEX idx_kyc_records_provider_ref ON kyc_records(provider_ref);

CREATE INDEX idx_retailers_location ON retailers(latitude, longitude);
CREATE INDEX idx_retailers_status ON retailers(license_status, is_accepting_orders);

CREATE INDEX idx_products_retailer_id ON products(retailer_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_stock_product_retailer ON stock(product_id, retailer_id);

CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_orders_retailer ON orders(retailer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE INDEX idx_order_items_order ON order_items(order_id);

CREATE INDEX idx_payments_order ON payments(order_id);
CREATE INDEX idx_payments_gateway_order ON payments(gateway_order_id);

CREATE INDEX idx_deliveries_order ON deliveries(order_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);

CREATE INDEX idx_ride_credits_user ON ride_credits(user_id);
CREATE INDEX idx_ride_bookings_user ON ride_bookings(user_id);

CREATE INDEX idx_safety_events_user ON safety_events(user_id);
CREATE INDEX idx_safety_events_status ON safety_events(status);

CREATE INDEX idx_audit_log_entity ON audit_log(entity, entity_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(created_at DESC);

-- ============================================================================
-- 11. AUTOMATED UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_user_trusted_contacts_updated_at BEFORE UPDATE ON user_trusted_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_retailers_updated_at BEFORE UPDATE ON retailers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_retailer_users_updated_at BEFORE UPDATE ON retailer_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_stock_updated_at BEFORE UPDATE ON stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_deliveries_updated_at BEFORE UPDATE ON deliveries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_ride_bookings_updated_at BEFORE UPDATE ON ride_bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_safety_events_updated_at BEFORE UPDATE ON safety_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
