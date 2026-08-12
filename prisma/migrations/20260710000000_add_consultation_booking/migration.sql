-- CreateTable
CREATE TABLE "ConsultationBooking" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 99,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "razorpayOrderId" TEXT,
    "razorpayPaymentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationBooking_razorpayOrderId_key" ON "ConsultationBooking"("razorpayOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "ConsultationBooking_razorpayPaymentId_key" ON "ConsultationBooking"("razorpayPaymentId");

-- CreateIndex
CREATE INDEX "ConsultationBooking_status_idx" ON "ConsultationBooking"("status");

-- CreateIndex
CREATE INDEX "ConsultationBooking_createdAt_idx" ON "ConsultationBooking"("createdAt");

-- CreateIndex
CREATE INDEX "ConsultationBooking_mobile_idx" ON "ConsultationBooking"("mobile");
