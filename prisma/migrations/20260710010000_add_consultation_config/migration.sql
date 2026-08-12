-- CreateTable
CREATE TABLE "ConsultationConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 99,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsultationConfig_pkey" PRIMARY KEY ("id")
);
