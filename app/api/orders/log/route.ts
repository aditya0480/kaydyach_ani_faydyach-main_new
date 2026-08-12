import { NextRequest, NextResponse } from "next/server";
import { logOrderEvent, OrderEvent } from "@/lib/order-logger";

const ALLOWED_CLIENT_EVENTS: OrderEvent[] = [
  "MODAL_OPENED",
  "MODAL_DISMISSED",
  "PAYMENT_FAILED_CLIENT",
];

export async function POST(req: NextRequest) {
  try {
    const { event, orderId, metadata } = await req.json();

    if (!ALLOWED_CLIENT_EVENTS.includes(event)) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await logOrderEvent(event, "client", orderId, metadata);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
