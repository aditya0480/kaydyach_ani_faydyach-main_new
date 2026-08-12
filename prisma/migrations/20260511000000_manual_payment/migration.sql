-- CreateEnum
CREATE TYPE "ManualPaymentStatus" AS ENUM ('PENDING', 'AUTO_APPROVED', 'AUTO_REJECTED', 'ADMIN_APPROVED', 'ADMIN_REJECTED');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'PENDING_VERIFICATION';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "manualConfidence" DOUBLE PRECISION,
ADD COLUMN     "manualGeminiRaw" JSONB,
ADD COLUMN     "manualPaidAt" TIMESTAMP(3),
ADD COLUMN     "manualPayerName" TEXT,
ADD COLUMN     "manualReceiverName" TEXT,
ADD COLUMN     "manualReceiverUpiId" TEXT,
ADD COLUMN     "manualRejectionReason" TEXT,
ADD COLUMN     "manualScreenshotHash" TEXT,
ADD COLUMN     "manualScreenshotKey" TEXT,
ADD COLUMN     "manualStatus" "ManualPaymentStatus",
ADD COLUMN     "manualSubmittedAt" TIMESTAMP(3),
ADD COLUMN     "manualUtr" TEXT,
ADD COLUMN     "manualVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "manualVerifiedBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_manualUtr_key" ON "Order"("manualUtr");

-- CreateIndex
CREATE UNIQUE INDEX "Order_manualScreenshotHash_key" ON "Order"("manualScreenshotHash");

-- CreateIndex
CREATE INDEX "Order_manualStatus_idx" ON "Order"("manualStatus");
