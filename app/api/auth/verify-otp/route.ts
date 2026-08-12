import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma_db } from "@/lib/prisma";

const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(4, "OTP must be 4 digits"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp } = verifyOTPSchema.parse(body);

    // Find the most recent OTP for this email
    const otpRecord = await prisma_db.oTP.findFirst({
      where: {
        email,
        code: otp,
        verified: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid OTP code" },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    await prisma_db.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true },
    });

    // Update user verification status
    await prisma_db.user.update({
      where: { email },
      data: { isVerified: true },
    });

    // Delete all OTPs for this email (cleanup)
    await prisma_db.oTP.deleteMany({
      where: { email },
    });

    return NextResponse.json(
      {
        message: "Email verified successfully! You can now login.",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("OTP verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
