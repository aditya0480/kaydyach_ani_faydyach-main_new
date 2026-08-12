import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma_db } from "@/lib/prisma";
import { sendOTPEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

const resendOTPSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = resendOTPSchema.parse(body);

    // Check rate limit (60 second cooldown)
    const rateLimitCheck = await checkRateLimit(email, "resend-otp");

    if (!rateLimitCheck.isAllowed) {
      const secondsRemaining = Math.ceil(
        ((rateLimitCheck.retryAfter?.getTime() || Date.now()) - Date.now()) / 1000
      );
      return NextResponse.json(
        {
          error: `Please wait ${secondsRemaining} seconds before requesting a new OTP`,
          retryAfter: rateLimitCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    // Check if user exists
    const user = await prisma_db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is already verified
    if (user.isVerified) {
      return NextResponse.json(
        { error: "Email is already verified" },
        { status: 400 }
      );
    }

    // Delete old OTPs for this email
    await prisma_db.oTP.deleteMany({
      where: { email },
    });

    // Generate new 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save new OTP to database
    await prisma_db.oTP.create({
      data: {
        email,
        code: otp,
        expiresAt,
        verified: false,
      },
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send OTP email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "New OTP sent successfully! Please check your email.",
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

    console.error("Resend OTP error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
