// Shared user-agent parsing for payment funnel diagnostics.
// Used server-side (order creation logging) and client-side (in-app-browser detection).
// The goal: quantify how much checkout drop-off comes from Meta/WhatsApp in-app
// browsers (WebViews), where UPI app-switching silently kills the payment.

export type InAppBrowser =
  | "instagram"
  | "facebook"
  | "whatsapp"
  | "messenger"
  | "snapchat"
  | "tiktok"
  | "line"
  | null;

export interface ClientContext {
  userAgent: string | null;
  inAppBrowser: InAppBrowser;
  isInApp: boolean;
  os: "android" | "ios" | "other";
  isMobile: boolean;
}

/** Detect a known in-app browser (WebView) from a user-agent string. */
export function detectInAppBrowser(ua: string): InAppBrowser {
  if (!ua) return null;
  // Instagram sets "Instagram"; Facebook app/Messenger set FBAN/FBAV/FB_IAB/FBAB.
  if (/Instagram/i.test(ua)) return "instagram";
  if (/Messenger/i.test(ua)) return "messenger";
  if (/FBAN|FBAV|FB_IAB|FBAB|FB4A|FBIOS/i.test(ua)) return "facebook";
  if (/WhatsApp/i.test(ua)) return "whatsapp";
  if (/Snapchat/i.test(ua)) return "snapchat";
  if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) return "tiktok";
  if (/\bLine\//i.test(ua)) return "line";
  return null;
}

function detectOs(ua: string): ClientContext["os"] {
  if (/android/i.test(ua)) return "android";
  if (/iPad|iPhone|iPod/i.test(ua)) return "ios";
  return "other";
}

/** Parse a user-agent into the funnel-relevant context. Safe on empty input. */
export function parseClientContext(ua: string | null | undefined): ClientContext {
  const s = ua ?? "";
  const inAppBrowser = detectInAppBrowser(s);
  const os = detectOs(s);
  return {
    userAgent: ua ?? null,
    inAppBrowser,
    isInApp: inAppBrowser !== null,
    os,
    isMobile: os === "android" || os === "ios" || /Mobi/i.test(s),
  };
}
