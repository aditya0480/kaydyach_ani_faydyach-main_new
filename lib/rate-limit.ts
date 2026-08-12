import { prisma_db } from "./prisma";

export type RateLimitAction = "resend-otp" | "forgot-password" | "signup" | "create-order" | "lead-submit" | "order-lookup" | "send-payment-link";

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
}

const rateLimitConfigs: Record<RateLimitAction, RateLimitConfig> = {
  "resend-otp": {
    maxAttempts: 1,
    windowMinutes: 1,
  },
  "forgot-password": {
    maxAttempts: 3,
    windowMinutes: 60,
  },
  "signup": {
    maxAttempts: 5,
    windowMinutes: 60,
  },
  "create-order": {
    maxAttempts: 20,
    windowMinutes: 60,
  },
  "lead-submit": {
    maxAttempts: 3,
    windowMinutes: 60,
  },
  "order-lookup": {
    maxAttempts: 50,
    windowMinutes: 60,
  },
  "send-payment-link": {
    maxAttempts: 5,
    windowMinutes: 1440, // 24 hours
  },
};

/**
 * Check if rate limit has been exceeded
 * @param identifier - User identifier (email or IP)
 * @param action - Action being rate limited
 * @returns Object with isAllowed flag and optional retry time
 */
export async function checkRateLimit(
  identifier: string,
  action: RateLimitAction
): Promise<{ isAllowed: boolean; retryAfter?: Date }> {
  const config = rateLimitConfigs[action];
  const now = new Date();

  try {
    // Find existing rate limit record
    const record = await prisma_db.rateLimit.findUnique({
      where: {
        identifier_action: {
          identifier,
          action,
        },
      },
    });

    // No existing record - allow and create new
    if (!record) {
      const resetAt = new Date(now.getTime() + config.windowMinutes * 60 * 1000);
      await prisma_db.rateLimit.create({
        data: {
          identifier,
          action,
          count: 1,
          resetAt,
        },
      });
      return { isAllowed: true };
    }

    // Check if reset window has passed
    if (now >= record.resetAt) {
      // Reset the counter
      const resetAt = new Date(now.getTime() + config.windowMinutes * 60 * 1000);
      await prisma_db.rateLimit.update({
        where: { id: record.id },
        data: {
          count: 1,
          resetAt,
          updatedAt: now,
        },
      });
      return { isAllowed: true };
    }

    // Within window - check if limit exceeded
    if (record.count >= config.maxAttempts) {
      return {
        isAllowed: false,
        retryAfter: record.resetAt,
      };
    }

    // Increment counter
    await prisma_db.rateLimit.update({
      where: { id: record.id },
      data: {
        count: record.count + 1,
        updatedAt: now,
      },
    });

    return { isAllowed: true };
  } catch (error) {
    console.error("Error checking rate limit:", error);
    // On error, allow the action (fail open)
    return { isAllowed: true };
  }
}

