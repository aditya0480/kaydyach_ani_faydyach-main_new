-- Manual UPI Payment + Claude AI Verification — Production Migration
-- Safe additive changes only. No data loss.
-- Paste into Neon SQL Editor / psql against production DB.

BEGIN;

-- 1) Add new enum value to OrderStatus
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PENDING_VERIFICATION';

-- 2) New enum: ManualPaymentStatus
DO $$ BEGIN
    CREATE TYPE "ManualPaymentStatus" AS ENUM (
        'PENDING',
        'AUTO_APPROVED',
        'AUTO_REJECTED',
        'ADMIN_APPROVED',
        'ADMIN_REJECTED'
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3) Add manual payment columns to Order
ALTER TABLE "Order"
    ADD COLUMN IF NOT EXISTS "manualUtr" TEXT,
    ADD COLUMN IF NOT EXISTS "manualScreenshotKey" TEXT,
    ADD COLUMN IF NOT EXISTS "manualScreenshotHash" TEXT,
    ADD COLUMN IF NOT EXISTS "manualPayerName" TEXT,
    ADD COLUMN IF NOT EXISTS "manualReceiverName" TEXT,
    ADD COLUMN IF NOT EXISTS "manualReceiverUpiId" TEXT,
    ADD COLUMN IF NOT EXISTS "manualPaidAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "manualSubmittedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "manualVerifiedAt" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "manualVerifiedBy" TEXT,
    ADD COLUMN IF NOT EXISTS "manualStatus" "ManualPaymentStatus",
    ADD COLUMN IF NOT EXISTS "manualConfidence" DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS "manualRejectionReason" TEXT,
    ADD COLUMN IF NOT EXISTS "manualGeminiRaw" JSONB;

-- 4) Unique constraints on manualUtr + manualScreenshotHash (nullable — safe)
CREATE UNIQUE INDEX IF NOT EXISTS "Order_manualUtr_key" ON "Order"("manualUtr");
CREATE UNIQUE INDEX IF NOT EXISTS "Order_manualScreenshotHash_key" ON "Order"("manualScreenshotHash");

-- 5) Index on manualStatus for admin queue queries
CREATE INDEX IF NOT EXISTS "Order_manualStatus_idx" ON "Order"("manualStatus");

COMMIT;

-- Verification queries (run after):
-- SELECT unnest(enum_range(NULL::"OrderStatus"));
-- SELECT unnest(enum_range(NULL::"ManualPaymentStatus"));
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name='Order' AND column_name LIKE 'manual%';
