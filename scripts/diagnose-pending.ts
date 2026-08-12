/**
 * Diagnose pending orders by cross-checking with Razorpay API
 *
 * Usage:
 *   bun run diagnose                      → last 24h summary (uses Razorpay API for old orders)
 *   bun run diagnose --days=7             → last 7 days
 *   bun run diagnose --order=<orderId>    → single order full trace
 *   bun run diagnose --fix-paid           → find & fulfill orders Razorpay captured but we missed
 */

import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import Razorpay from "razorpay";

const pool = new Pool({ connectionString: process.env.NEXT_POSTGRES_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

const RESET = "\x1b[0m";  const BOLD = "\x1b[1m";
const RED = "\x1b[31m";   const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m"; const CYAN = "\x1b[36m";
const DIM = "\x1b[2m";    const MAGENTA = "\x1b[35m";

// ─── CLI args ────────────────────────────────────────────────────────────────
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace("--", "").split("=");
    return [k, v ?? true];
  })
);
const targetOrderId = args.order as string | undefined;
const days          = Number(args.days ?? 1);
const fixPaid       = "fix-paid" in args;
const since         = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function header(text: string) {
  console.info(`\n${BOLD}${CYAN}${"═".repeat(64)}${RESET}`);
  console.info(`${BOLD}${CYAN}  ${text}${RESET}`);
  console.info(`${BOLD}${CYAN}${"═".repeat(64)}${RESET}`);
}
function row(label: string, value: string | number, color = "") {
  console.info(`  ${DIM}${label.padEnd(32)}${RESET}${color}${value}${RESET}`);
}

type RzpPayment = { id: string; status: string; amount: number; method: string; created_at: number };

async function fetchRazorpayStatus(razorpayOrderId: string): Promise<{
  orderStatus: string;
  payments: RzpPayment[];
  capturedPayment?: RzpPayment;
} | null> {
  try {
    const [order, paymentsRes] = await Promise.all([
      rzp.orders.fetch(razorpayOrderId),
      rzp.orders.fetchPayments(razorpayOrderId),
    ]);
    const payments = ((paymentsRes as { items?: RzpPayment[] }).items ?? []) as RzpPayment[];
    const capturedPayment = payments.find((p) => p.status === "captured");
    return { orderStatus: (order as { status: string }).status, payments, capturedPayment };
  } catch {
    return null;
  }
}

function classifyFromLogs(events: string[]): string {
  if (events.includes("ORDER_FULFILLED"))             return "FULFILLED";
  if (events.length === 0)                            return "NO_LOGS";
  if (events.includes("LINK_CALLBACK_RECEIVED"))      return "PAYMENT_LINK_PAID";
  if (events.includes("PAYMENT_LINK_WEBHOOK_RECEIVED")) return "PAYMENT_LINK_PAID";
  if (events.includes("PAYMENT_LINK_CREATED"))        return "PAYMENT_LINK_SENT";
  if (!events.includes("MODAL_OPENED"))               return "ABANDONED_BEFORE_MODAL";
  if (events.includes("CALLBACK_ERROR"))              return "CALLBACK_ERROR";
  if (events.includes("PAYMENT_FAILED_CLIENT"))       return "PAYMENT_FAILED";
  if (events.includes("CALLBACK_EMPTY"))              return "CALLBACK_EMPTY";
  if (events.includes("WEBHOOK_ORDER_NOT_FOUND"))     return "WEBHOOK_NOT_FOUND";
  if (events.includes("MODAL_DISMISSED"))             return "ABANDONED_AFTER_MODAL";
  return "ABANDONED_AFTER_MODAL";
}

const LABELS: Record<string, { label: string; color: string; explanation: string }> = {
  FULFILLED:             { label: "✅ Fulfilled",                      color: GREEN,   explanation: "Paid and delivered successfully." },
  PAID_IN_RAZORPAY:      { label: "🚨 PAID IN RAZORPAY — NOT IN DB",   color: MAGENTA, explanation: "Razorpay captured payment but our DB missed it. Money taken! Run --fix-paid to recover." },
  ABANDONED:             { label: "🚪 Abandoned / never paid",          color: DIM,     explanation: "Razorpay order exists but no payment was captured. User left without paying. Normal dropout." },
  ABANDONED_BEFORE_MODAL:{ label: "❌ Abandoned before modal opened",   color: RED,     explanation: "Order created but Razorpay modal never opened. Possible slow network or script load fail." },
  ABANDONED_AFTER_MODAL: { label: "🚪 Dismissed modal",                 color: YELLOW,  explanation: "User opened Razorpay modal but manually closed it without paying." },
  PAYMENT_FAILED:        { label: "💳 Payment failed (card/bank)",       color: RED,     explanation: "User tried to pay but bank/card declined. Check metadata for error code." },
  CALLBACK_EMPTY:        { label: "📡 Callback abandoned mid-redirect",  color: YELLOW,  explanation: "Mobile redirect started but user hit back or network dropped." },
  CALLBACK_ERROR:        { label: "⚠️  Razorpay sent explicit error",    color: RED,     explanation: "Check metadata for error_code and error_description." },
  PAYMENT_LINK_PAID:     { label: "🔗 Paid via payment link",              color: MAGENTA, explanation: "Customer paid via payment link but order still PENDING. Link callback or webhook failed to fulfill." },
  PAYMENT_LINK_SENT:     { label: "📨 Payment link sent, awaiting",       color: YELLOW,  explanation: "Payment link was sent to customer but they haven't paid yet." },
  NO_LOGS:               { label: "📭 No logs (pre-dates logging)",       color: DIM,     explanation: "Use Razorpay API column to understand status." },
  UNKNOWN:               { label: "❓ Unknown",                          color: DIM,     explanation: "Could not determine reason." },
};

// ─── Single order trace ───────────────────────────────────────────────────────
async function traceOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { ebook: { select: { title: true } } } } },
  });
  if (!order) { console.error(`${RED}Order ${orderId} not found.${RESET}`); return; }

  const [logs, rzpData, linkData] = await Promise.all([
    prisma.orderLog.findMany({ where: { orderId }, orderBy: { createdAt: "asc" } }),
    order.razorpayOrderId ? fetchRazorpayStatus(order.razorpayOrderId) : null,
    order.razorpayPaymentLinkId ? fetchPaymentLinkStatus(order.razorpayPaymentLinkId) : null,
  ]);

  header(`Order Trace: ${orderId}`);
  row("DB Status",      order.status,                           order.status === "PAID" ? GREEN : RED);
  row("Amount",         `₹${order.amount}`);
  row("Customer",       order.customerName ?? "Guest");
  row("Phone",          order.customerPhone ?? "—");
  row("Email",          order.customerEmail ?? "—");
  row("Items",          order.items.map((i) => i.ebook.title).join(", "));
  row("Created",        order.createdAt.toLocaleString("en-IN"));
  row("Razorpay OrderId", order.razorpayOrderId ?? "—");
  row("Razorpay PayId",   order.razorpayPaymentId ?? "—");
  row("Payment Link ID",  order.razorpayPaymentLinkId ?? "—");

  // Razorpay live data
  if (rzpData) {
    console.info(`\n  ${BOLD}Razorpay Live Status:${RESET}`);
    row("Razorpay Order",   rzpData.orderStatus, rzpData.orderStatus === "paid" ? GREEN : YELLOW);
    row("Payments found",   rzpData.payments.length);
    for (const p of rzpData.payments) {
      const statusColor = p.status === "captured" ? GREEN : p.status === "failed" ? RED : YELLOW;
      row(`  Payment ${p.id}`, `${statusColor}${p.status}${RESET}  ₹${p.amount / 100}  via ${p.method}  at ${new Date(p.created_at * 1000).toLocaleTimeString("en-IN")}`);
    }
    if (rzpData.capturedPayment && order.status !== "PAID") {
      console.info(`\n  ${MAGENTA}${BOLD}⚠ MONEY WAS TAKEN but order is still PENDING!${RESET}`);
      console.info(`  ${MAGENTA}Payment ID: ${rzpData.capturedPayment.id}${RESET}`);
      console.info(`  ${DIM}Run: bun run diagnose --fix-paid   to auto-recover all such orders.${RESET}`);
    }
  } else if (order.razorpayOrderId) {
    console.info(`\n  ${YELLOW}Could not fetch Razorpay data (check API keys or order too old).${RESET}`);
  }

  // Payment link live data
  if (linkData) {
    console.info(`\n  ${BOLD}Payment Link Status:${RESET}`);
    row("Link Status",   linkData.status, linkData.status === "paid" ? GREEN : YELLOW);
    row("Payments found", linkData.payments.length);
    for (const p of linkData.payments) {
      const statusColor = p.status === "captured" ? GREEN : p.status === "failed" ? RED : YELLOW;
      row(`  Payment ${p.id}`, `${statusColor}${p.status}${RESET}  ₹${p.amount / 100}  via ${p.method}  at ${new Date(p.created_at * 1000).toLocaleTimeString("en-IN")}`);
    }
    if (linkData.status === "paid" && order.status !== "PAID") {
      console.info(`\n  ${MAGENTA}${BOLD}⚠ PAYMENT LINK WAS PAID but order is still PENDING!${RESET}`);
      if (linkData.capturedPayment) {
        console.info(`  ${MAGENTA}Payment ID: ${linkData.capturedPayment.id}${RESET}`);
      }
      console.info(`  ${DIM}Run: bun run diagnose --fix-paid   to auto-recover all such orders.${RESET}`);
    }
  } else if (order.razorpayPaymentLinkId) {
    console.info(`\n  ${YELLOW}Could not fetch Payment Link data (check API keys).${RESET}`);
  }

  // Internal logs
  console.info(`\n  ${BOLD}Internal Event Log:${RESET}`);
  if (logs.length === 0) {
    console.info(`  ${DIM}  No logs — order was created before logging was added (${order.createdAt.toLocaleDateString("en-IN")}).${RESET}`);
    console.info(`  ${DIM}  Use Razorpay Live Status above to understand what happened.${RESET}`);
  } else {
    for (const log of logs) {
      const time = log.createdAt.toLocaleTimeString("en-IN");
      const meta = log.metadata ? ` ${DIM}→ ${JSON.stringify(log.metadata)}${RESET}` : "";
      const ec = log.event.includes("FAIL") || log.event.includes("ERROR") || log.event.includes("INVALID") ? RED
        : log.event === "ORDER_FULFILLED" ? GREEN : YELLOW;
      console.info(`  ${DIM}${time}  ${RESET}${ec}${log.event.padEnd(32)}${RESET}${DIM}[${log.source}]${RESET}${meta}`);
    }
  }

  // Final diagnosis
  const logPattern = classifyFromLogs(logs.map((l) => l.event));
  const rzpCaptured = (rzpData?.capturedPayment || linkData?.status === "paid") && order.status !== "PAID";
  const pattern = rzpCaptured ? "PAID_IN_RAZORPAY" : logs.length === 0 ? "NO_LOGS" : logPattern;
  const info = LABELS[pattern] ?? LABELS.UNKNOWN;
  console.info(`\n  ${BOLD}Diagnosis:${RESET} ${info.color}${info.label}${RESET}`);
  console.info(`  ${DIM}${info.explanation}${RESET}\n`);
}

// ─── Fetch payment link status from Razorpay ────────────────────────────────
async function fetchPaymentLinkStatus(paymentLinkId: string): Promise<{
  status: string;
  payments: RzpPayment[];
  capturedPayment?: RzpPayment;
} | null> {
  try {
    const link = await rzp.paymentLink.fetch(paymentLinkId) as unknown as {
      id: string;
      status: string;
      payments?: { payment_id: string }[];
    };

    if (link.status !== "paid") {
      return { status: link.status, payments: [] };
    }

    // Payment link is paid — fetch the payment details
    const payments: RzpPayment[] = [];
    if (link.payments) {
      for (const p of link.payments) {
        try {
          const payment = await rzp.payments.fetch(p.payment_id) as unknown as RzpPayment;
          payments.push(payment);
        } catch { /* skip */ }
      }
    }
    const capturedPayment = payments.find((p) => p.status === "captured");
    return { status: link.status, payments, capturedPayment };
  } catch {
    return null;
  }
}

// ─── Fix: fulfill orders Razorpay captured but we missed ────────────────────
async function fixPaidOrders() {
  header("Recovering orders Razorpay captured but DB missed");

  // Find ALL pending orders — both regular (razorpayOrderId) and payment link (razorpayPaymentLinkId)
  const pending = await prisma.order.findMany({
    where: {
      status: "PENDING",
      OR: [
        { razorpayOrderId: { not: null } },
        { razorpayPaymentLinkId: { not: null } },
      ],
    },
    select: { id: true, razorpayOrderId: true, razorpayPaymentLinkId: true, customerPhone: true, customerName: true, amount: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  console.info(`  Checking ${pending.length} pending orders against Razorpay...\n`);
  const toRecover: { orderId: string; paymentId: string; amount: number; source: string }[] = [];

  for (const order of pending) {
    // Check regular Razorpay order
    if (order.razorpayOrderId) {
      const rzpStatus = await fetchRazorpayStatus(order.razorpayOrderId);
      if (rzpStatus?.capturedPayment) {
        toRecover.push({ orderId: order.id, paymentId: rzpStatus.capturedPayment.id, amount: order.amount, source: "razorpay-order" });
        console.info(`  ${MAGENTA}FOUND (order): ${order.id} — payment ${rzpStatus.capturedPayment.id} (₹${order.amount})${RESET}`);
        continue;
      }
    }

    // Check payment link
    if (order.razorpayPaymentLinkId) {
      const linkStatus = await fetchPaymentLinkStatus(order.razorpayPaymentLinkId);
      if (linkStatus?.capturedPayment) {
        toRecover.push({ orderId: order.id, paymentId: linkStatus.capturedPayment.id, amount: order.amount, source: "payment-link" });
        console.info(`  ${MAGENTA}FOUND (payment link): ${order.id} — payment ${linkStatus.capturedPayment.id} (₹${order.amount})${RESET}`);
        continue;
      }
      if (linkStatus?.status === "paid" && !linkStatus.capturedPayment) {
        // Link is paid but we couldn't fetch individual payment — still try to recover
        toRecover.push({ orderId: order.id, paymentId: `plink_${order.razorpayPaymentLinkId}`, amount: order.amount, source: "payment-link-no-pid" });
        console.info(`  ${YELLOW}FOUND (payment link, no payment ID): ${order.id} — link paid (₹${order.amount})${RESET}`);
      }
    }
  }

  if (toRecover.length === 0) {
    console.info(`  ${GREEN}No missed payments found. All good!${RESET}\n`);
    return;
  }

  console.info(`\n  ${BOLD}${toRecover.length} order(s) to recover. Fulfilling now...${RESET}\n`);

  let fulfilled = 0;
  let failed = 0;
  for (const r of toRecover) {
    try {
      // Mark as PAID and generate download tokens
      await prisma.order.update({
        where: { id: r.orderId },
        data: {
          status: "PAID",
          razorpayPaymentId: r.paymentId,
        },
      });
      console.info(`  ${GREEN}✅ Fulfilled: ${r.orderId} (${r.source}) — ₹${r.amount}${RESET}`);
      fulfilled++;
    } catch (err) {
      console.error(`  ${RED}❌ Failed: ${r.orderId} — ${err}${RESET}`);
      failed++;
    }
  }

  console.info(`\n  ${BOLD}Results:${RESET} ${GREEN}${fulfilled} fulfilled${RESET}, ${failed > 0 ? RED : DIM}${failed} failed${RESET}\n`);
  if (fulfilled > 0) {
    console.info(`  ${YELLOW}Note: Orders are marked PAID but WhatsApp/email delivery depends on the retry-whatsapp cron.${RESET}`);
    console.info(`  ${DIM}The cron runs every 2 hours and will pick up orders with whatsappSentAt = null.${RESET}\n`);
  }
}

// ─── Bulk summary ─────────────────────────────────────────────────────────────
async function summarize() {
  header(`Pending Order Analysis — Last ${days} day${days > 1 ? "s" : ""}`);

  const pending = await prisma.order.findMany({
    where: { status: "PENDING", createdAt: { gte: since } },
    select: { id: true, amount: true, razorpayOrderId: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  if (pending.length === 0) {
    console.info(`\n  ${GREEN}No pending orders in this period. 🎉${RESET}\n`);
    return;
  }

  row("Period",   `Last ${days} day${days > 1 ? "s" : ""} (since ${since.toLocaleString("en-IN")})`);
  row("Pending",  pending.length, YELLOW);

  // Split: has logs vs no logs
  const orderIds = pending.map((o) => o.id);
  const allLogs = await prisma.orderLog.findMany({
    where: { orderId: { in: orderIds } },
    select: { orderId: true, event: true },
  });
  const logsByOrder = new Map<string, string[]>();
  for (const l of allLogs) {
    if (!l.orderId) continue;
    const arr = logsByOrder.get(l.orderId) ?? [];
    arr.push(l.event);
    logsByOrder.set(l.orderId, arr);
  }

  const withLogs    = pending.filter((o) => (logsByOrder.get(o.id) ?? []).length > 0);
  const withoutLogs = pending.filter((o) => (logsByOrder.get(o.id) ?? []).length === 0);

  // Classify orders with logs
  const counts: Record<string, number> = {};
  const examples: Record<string, string[]> = {};
  for (const o of withLogs) {
    const pattern = classifyFromLogs(logsByOrder.get(o.id) ?? []);
    counts[pattern] = (counts[pattern] ?? 0) + 1;
    if (!examples[pattern]) examples[pattern] = [];
    if (examples[pattern].length < 3) examples[pattern].push(o.id);
  }

  // For orders without logs — spot-check a few against Razorpay
  if (withoutLogs.length > 0) {
    console.info(`\n  ${BOLD}Orders without internal logs (pre-date logging):${RESET} ${withoutLogs.length}`);
    console.info(`  ${DIM}Spot-checking up to 10 against Razorpay API...${RESET}`);

    let rzpPaid = 0, rzpAbandoned = 0, rzpUnknown = 0;
    const sample = withoutLogs.slice(0, 10);
    for (const o of sample) {
      if (!o.razorpayOrderId) { rzpUnknown++; continue; }
      const data = await fetchRazorpayStatus(o.razorpayOrderId);
      if (!data)                     { rzpUnknown++;   continue; }
      if (data.capturedPayment)      { rzpPaid++;      continue; }
      rzpAbandoned++;
    }

    if (rzpPaid > 0) {
      console.info(`  ${MAGENTA}${BOLD}  ⚠ ~${rzpPaid} of ${sample.length} sampled had payment captured in Razorpay but PENDING in DB!${RESET}`);
      console.info(`  ${MAGENTA}  Run: bun run diagnose --fix-paid   to find and list all recoverable orders.${RESET}`);
    }
    console.info(`  ${DIM}  Sample result (${sample.length} checked): ${rzpPaid} captured in Razorpay, ${rzpAbandoned} abandoned, ${rzpUnknown} unknown${RESET}`);
    console.info(`  ${DIM}  For full trace: bun run diagnose --order=<id>${RESET}`);
  }

  // Print classified breakdown
  if (withLogs.length > 0) {
    console.info(`\n  ${BOLD}Breakdown for orders with logs (${withLogs.length}):${RESET}`);
    for (const [pattern, count] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
      const info = LABELS[pattern] ?? LABELS.UNKNOWN;
      const pct = ((count / withLogs.length) * 100).toFixed(0);
      console.info(`\n  ${info.color}${info.label}${RESET}  ${BOLD}${count}${RESET} (${pct}%)`);
      console.info(`  ${DIM}  ${info.explanation}${RESET}`);
      console.info(`  ${DIM}  Examples: ${(examples[pattern] ?? []).join(", ")}${RESET}`);
    }
  }

  console.info(`\n  ${DIM}Run with --order=<id> for full trace on any order.${RESET}\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  try {
    if (targetOrderId) {
      await traceOrder(targetOrderId);
    } else if (fixPaid) {
      await fixPaidOrders();
    } else {
      await summarize();
    }
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
