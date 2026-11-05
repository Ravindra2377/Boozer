-- ============================================================================
-- BOOZER · DATABASE SEED DATA (Flyway V2 Migration)
-- Sample realistic licensed retailer, catalog, verified user & safe ride setup
-- ============================================================================

-- 1. Insert Verified Customer User
INSERT INTO users (id, phone, email, full_name, date_of_birth, kyc_status, is_active)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '+919876543210',
    'rohit.sharma@example.com',
    'Rohit Sharma',
    '1995-04-30',
    'VERIFIED',
    true
) ON CONFLICT (phone) DO NOTHING;

-- 2. Insert Trusted Emergency Contacts
INSERT INTO user_trusted_contacts (id, user_id, name, phone, relationship, is_sos_recipient)
VALUES 
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b22',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Pooja Sharma',
    '+919876500001',
    'Spouse',
    true
),
(
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380b23',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Karan Verma',
    '+919876500002',
    'Best Friend',
    true
) ON CONFLICT DO NOTHING;

-- 3. Insert KYC Record (DPDP compliant: masked ID, provider reference)
INSERT INTO kyc_records (
    id, user_id, provider, provider_ref, id_document_type, masked_id_number,
    age_verified, calculated_age, state_jurisdiction, verification_hash
) VALUES (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380c33',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'DIGILOCKER',
    'DL-IND-2026-9812491',
    'DRIVING_LICENCE',
    'DL-142011XXXX9124',
    true,
    31,
    'DELHI',
    'sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'
) ON CONFLICT DO NOTHING;

-- 4. Insert Licensed Retailer
INSERT INTO retailers (
    id, store_name, legal_entity_name, licence_number, licence_state,
    licence_expiry, license_status, excise_zone, address_line1, city, state,
    pincode, latitude, longitude, delivery_radius_km, operating_hours_start,
    operating_hours_end, payout_account_ref, is_accepting_orders
) VALUES (
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
    'Connaught Place Premium Vintners',
    'Apex Beverages & Retail Ltd.',
    'L-2/EXCISE/DL/2026/0491',
    'DELHI',
    '2027-03-31',
    'ACTIVE',
    'CENTRAL_DELHI_ZONE_1',
    'Block B, Inner Circle, Connaught Place',
    'New Delhi',
    'Delhi',
    '110001',
    28.6328000,
    77.2197000,
    6.50,
    '10:00:00',
    '22:00:00',
    'acc_rzp_route_89124',
    true
) ON CONFLICT (licence_number) DO NOTHING;

-- 5. Insert Retailer Staff User
INSERT INTO retailer_users (id, retailer_id, phone, email, full_name, password_hash, role)
VALUES (
    'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380e55',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
    '+919811122233',
    'manager@cpvintners.com',
    'Vikram Malhotra',
    '$2a$12$e8YkZ8XgR02o.4VpD.8Y1ec/bYk1yFfH7HkRvhjE0.m7Y4H08zTqy', -- mock bcrypt
    'MANAGER'
) ON CONFLICT (email) DO NOTHING;

-- 6. Insert Catalog Products (Fixed Legal MRP, No Surge Pricing)
INSERT INTO products (
    id, retailer_id, name, brand, category, abv, volume_ml,
    price_legal_mrp, age_restricted, min_age_requirement, image_url, description
) VALUES
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f61',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
    'Bira 91 White Craft Beer',
    'Bira 91',
    'BEER',
    4.90,
    330,
    180.00,
    true,
    21,
    'https://images.unsplash.com/photo-1608270118837-17e909a80e1b?w=600',
    'Low bitterness wheat beer with a hint of spicy citrus coriander and orange peel.'
),
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f62',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
    'Corona Extra Mexican Lager',
    'Corona',
    'BEER',
    4.50,
    355,
    240.00,
    true,
    21,
    'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=600',
    'Classic crisp Mexican lager brewed with fine barley malt and corn.'
),
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f63',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
    'Sula Rasa Cabernet Sauvignon',
    'Sula Vineyards',
    'WINE',
    13.50,
    750,
    1450.00,
    true,
    21,
    'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600',
    'Oak-aged reserve red wine from Dindori estate with notes of dark berries and vanilla.'
),
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f64',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
    'Amrut Fusion Single Malt Whisky',
    'Amrut Distilleries',
    'WHISKY',
    50.00,
    750,
    4200.00,
    true,
    25,
    'https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600',
    'Internationally acclaimed Indian single malt crafted from Indian barley and Scottish peated barley.'
),
(
    'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f65',
    'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44',
    'Stranger & Sons Goa Gin',
    'Third Eye Distillery',
    'GIN',
    42.80,
    750,
    2100.00,
    true,
    21,
    'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600',
    'Indian spirited gin distilled with Indian botanicals including black pepper, coriander, and citrus peels.'
) ON CONFLICT DO NOTHING;

-- 7. Insert Stock Quantities
INSERT INTO stock (product_id, retailer_id, quantity, low_stock_threshold, last_restocked_at)
VALUES
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f61', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 48, 10, NOW()),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f62', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 36, 8, NOW()),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f63', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 18, 5, NOW()),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f64', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 12, 3, NOW()),
('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380f65', 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d44', 24, 6, NOW())
ON CONFLICT (product_id) DO NOTHING;

-- 8. Insert Initial Audit Log for Seed Event
INSERT INTO audit_log (actor_id, actor_role, action, entity, entity_id, new_state, ip_address)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'SYSTEM',
    'SEED_DATA_INITIALIZED',
    'SYSTEM_BOOTSTRAP',
    'V2',
    '{"message": "Initial pilot retailer, products, and verified user setup complete"}'::jsonb,
    '127.0.0.1'
);
