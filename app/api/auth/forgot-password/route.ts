import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma_db } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Check rate limit (3 attempts per hour)
    const rateLimitCheck = await checkRateLimit(email, "forgot-password");

    if (!rateLimitCheck.isAllowed) {
      const minutesRemaining = Math.ceil(
        ((rateLimitCheck.retryAfter?.getTime() || Date.now()) - Date.now()) / (1000 * 60)
      );
      return NextResponse.json(
        {
          error: `Too many password reset attempts. Please try again in ${minutesRemaining} minute(s)`,
          retryAfter: rateLimitCheck.retryAfter,
        },
        { status: 429 }
      );
    }

    // Check if user exists
    const user = await prisma_db.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user || !user.password) {
      // Return success even if user doesn't exist (security measure)
      return NextResponse.json(
        {
          message:
            "If an account exists with this email, a password reset link has been sent.",
        },
        { status: 200 }
      );
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete old reset tokens for this email
    await prisma_db.passwordResetToken.deleteMany({
      where: { email },
    });

    // Save reset token to database
    await prisma_db.passwordResetToken.create({
      data: {
        email,
        token: resetToken,
        expiresAt,
        used: false,
      },
    });

    // Generate reset link
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:2222";
    const resetUrl = `${baseUrl}/auth/reset-password/${resetToken}`;

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetUrl);

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send reset email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message:
          "If an account exists with this email, a password reset link has been sent.",
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

    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
