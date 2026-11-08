-- ============================================================================
-- BOOZER · V4 KYC RECORDS SCHEMA ALIGNMENT
-- Synchronize kyc_records table with Spring Boot KycRecordEntity
-- ============================================================================

-- 1. Add columns required by KycRecordEntity
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS doc_type VARCHAR(50) DEFAULT 'DRIVING_LICENCE';
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS doc_number_masked VARCHAR(50) DEFAULT 'DL-142011XXXX9124';
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS date_of_birth DATE DEFAULT '1995-04-30';
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'VERIFIED';
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS failure_reason TEXT;
ALTER TABLE kyc_records ADD COLUMN IF NOT EXISTS raw_hash VARCHAR(255);

-- Ensure raw_hash column is widened to VARCHAR(255) if it already exists as VARCHAR(64)
ALTER TABLE kyc_records ALTER COLUMN raw_hash TYPE VARCHAR(255);

-- 2. Drop strict NOT NULL constraints from legacy V1 columns so new inserts won't fail
ALTER TABLE kyc_records ALTER COLUMN calculated_age DROP NOT NULL;
ALTER TABLE kyc_records ALTER COLUMN id_document_type DROP NOT NULL;
ALTER TABLE kyc_records ALTER COLUMN masked_id_number DROP NOT NULL;

-- 3. Synchronize data from legacy columns to new columns
UPDATE kyc_records SET doc_type = id_document_type WHERE doc_type IS NULL OR (id_document_type IS NOT NULL AND doc_type = 'DRIVING_LICENCE');
UPDATE kyc_records SET doc_number_masked = masked_id_number WHERE doc_number_masked IS NULL OR (masked_id_number IS NOT NULL AND doc_number_masked = 'DL-142011XXXX9124');
UPDATE kyc_records SET raw_hash = LEFT(verification_hash, 255) WHERE raw_hash IS NULL AND verification_hash IS NOT NULL;
UPDATE kyc_records SET status = CASE WHEN age_verified = true THEN 'VERIFIED' ELSE 'REJECTED' END WHERE status IS NULL;
