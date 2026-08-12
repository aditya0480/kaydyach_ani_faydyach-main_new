-- AlterTable
ALTER TABLE "Order" ADD COLUMN "razorpayPaymentLinkId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_razorpayPaymentLinkId_key" ON "Order"("razorpayPaymentLinkId");
