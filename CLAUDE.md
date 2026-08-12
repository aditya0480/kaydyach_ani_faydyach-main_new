# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun run dev          # Start dev server on port 2222 (Turbopack)
bun run build        # Build + generate sitemap
bun run validate     # ESLint + TypeScript type check (run before finishing)
bun run lint         # ESLint only

# Prisma
bun run prisma:migrate   # Create and apply new migration
bun run prisma:deploy    # Apply migrations in production
bun run prisma:studio    # Open Prisma Studio GUI
bun run prisma:reset     # Reset database (destructive)
```

## Architecture

This is a **Next.js 16 App Router** e-commerce platform for selling Marathi-language ebooks (kaydyach_ani_faydyach = "What to Buy and What to Benefit"). The site is bilingual (English + Marathi).

### Route Groups
- `app/(auth)/` — Login, signup, OTP verification, forgot/reset password
- `app/(marketing)/` — Public-facing pages (home, ebooks, combos, about, contact, resources, policies)
- `app/dashboard/` — Admin-only dashboard (ebooks, orders, users, analytics, settings)
- `app/api/` — All API routes

### Data Flow
1. **Payment**: Razorpay → webhook at `/api/payment/callback` → order fulfillment → email/WhatsApp delivery
2. **Downloads**: Orders verified → JWT token generated → `/api/download` validates token → returns S3 presigned URL
3. **Auth**: NextAuth v5 with Credentials provider → Prisma adapter → PostgreSQL session storage

### Key Library Files
- `lib/auth.ts` — NextAuth config, role-based access (ADMIN/USER), admin auto-provisioning via env vars
- `lib/prisma.ts` — Singleton Prisma client with `@prisma/adapter-pg`
- `lib/order-fulfillment.ts` — Post-payment logic: creates download tokens, sends email/WhatsApp
- `lib/s3.ts` — AWS S3 presigned URL generation for PDF uploads/downloads
- `lib/pdf-watermark.ts` — Per-customer PDF watermarking before delivery
- `lib/rate-limit.ts` — Database-backed rate limiting (OTP, password reset)
- `lib/data-access.ts` — Centralized database query functions
- `lib/sale-config.ts` — Sale pricing configuration

### Database Models (Prisma + PostgreSQL)
- `Ebook` — Product catalog with combo support, display IDs, S3 file keys
- `Order` / `OrderItem` — Customer orders with Razorpay IDs, snapshot pricing, status tracking
- `User` / `Account` / `Session` — NextAuth models with role field
- `OTP` / `PasswordResetToken` — Email verification flows
- `PushSubscription` — Web Push subscriptions
- `Lead` — Lead capture forms
- `ShortLink` — URL shortener

### Component Organization
- `components/ui/` — shadcn/ui components (do not modify directly)
- `components/marketing/` — Reusable marketing section components
- `components/AppInputFields/` — Unified form input system
- Route-specific components go in `_components/` inside the route folder (e.g., `app/dashboard/ebooks/_components/`)

### External Integrations
- **Razorpay** — Payment gateway; webhook signature verified in `/api/payment/callback`
- **AWS S3** — PDF storage; bucket: `nirmantestbucket` (ap-south-1 region)
- **Interakt** — WhatsApp Business API (template sends) via `lib/whatsapp.ts`; auth via `INTERAKT_API_KEY`
- **Nodemailer** — Transactional email via `lib/email.ts`
- **Web Push** — Browser push notifications via `lib/web-push.ts`
- **Google Gemini AI** — Content generation via `lib/gemini_ai.ts`
- **Google Maps/Places** — Address autocomplete
- **Vercel Analytics** — Page view tracking

### Auth & Security
- Session checked server-side via `auth()` from `lib/auth.ts`
- Admin routes protected by role check (`session.user.role === "ADMIN"`)
- PDF downloads use short-lived JWT tokens (not session-based)
- Rate limiting on OTP and password reset endpoints
- Security headers set in `next.config.ts`

### Notifications System
Push, email, and WhatsApp notifications flow through:
- `/api/notifications/` — Subscribe/unsubscribe endpoints
- `lib/notification-helpers.ts` — Unified send helpers
- Admin can trigger bulk reminders from dashboard

## Key Patterns

**Server Actions**: Max body size 25MB (configured for PDF uploads)

**Image optimization**: Remote S3 images allowed via `next.config.ts` hostname whitelist

**Tailwind v4**: Use canonical syntax — `h-(--var)` not `h-[var(--var)]`. ESLint enforces this.

**Search params**: Always use `nuqs` library, never raw `useSearchParams`

**Client fetching**: Always `useQuery`/`useMutation` from TanStack Query

**Forms**: `react-hook-form` + `zod` validation schemas

**Toast**: `sonner` is the preferred toast library (also `react-hot-toast` used in places)
