import { prisma_db } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export type OrderEvent =
  | "ORDER_CREATED"
  | "MODAL_OPENED"
  | "MODAL_DISMISSED"
  | "PAYMENT_FAILED_CLIENT"
  | "CALLBACK_RECEIVED"
  | "CALLBACK_EMPTY"
  | "CALLBACK_ERROR"
  | "CALLBACK_SIG_INVALID"
  | "WEBHOOK_RECEIVED"
  | "WEBHOOK_ORDER_NOT_FOUND"
  | "VERIFY_CALLED"
  | "VERIFY_RECEIVED"
  | "VERIFY_SIG_INVALID"
  | "VERIFY_ERROR"
  | "VERIFY_FAILED"
  | "ORDER_FULFILLED"
  | "ORDER_ALREADY_PAID"
  | "STATUS_UPDATED"
  | "WHATSAPP_SENT"
  | "WHATSAPP_FAILED"
  | "PAYMENT_LINK_CREATED"
  | "PAYMENT_LINK_WHATSAPP_SENT"
  | "PAYMENT_LINK_WHATSAPP_FAILED"
  | "PAYMENT_LINK_WEBHOOK_RECEIVED"
  | "PAYMENT_LINK_RATE_LIMITED"
  | "LINK_CALLBACK_RECEIVED"
  | "LINK_CALLBACK_SIG_INVALID"
  | "LINK_CALLBACK_ORDER_NOT_FOUND"
  | "PAYMENT_REMINDER_SENT"
  | "PAYMENT_REMINDER_FAILED"
  | "ORDER_AUTO_RECOVERED";

export type LogSource = "server" | "callback" | "webhook" | "verify" | "client" | "payment-link" | "link-callback" | "manual" | "admin";

export async function logOrderEvent(
  event: OrderEvent,
  source: LogSource,
  orderId?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await prisma_db.orderLog.create({
      data: {
        event,
        source,
        orderId: orderId ?? null,
        metadata: metadata as Prisma.InputJsonObject | undefined,
      },
    });
  } catch (err) {
    // Never throw — logging must never break the payment flow
    console.error("[ORDER_LOGGER] Failed to write log:", err);
  }
}
