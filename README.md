# 📚 Kaydyancha Ani Faydyach (कायद्याचं आणि फायद्याचं)
update
A professional Next.js-powered ebook marketplace and management platform specializing in legal and property guidance, featuring AI-assisted content creation and a mobile-first user experience.


---

## ✨ Key Features

### 🛒 **Ebook Marketplace**

- **Dual-Language UI**: Seamless support for English and Marathi users.
- **Secure Checkout**: Integrated with **Razorpay** for safe and reliable payments.
- **Mobile-First UX**: Responsive **Bottom Sheets** for checkout, providing a native app-like experience for non-tech users.
- **Instant Delivery**: Automated email confirmation and secure JWT-based private download links.

### 🤖 **AI-Powered Content Management**

- **Smart Editor**: Notion-style rich text editor with slash commands and markdown support.
- **Gemini AI Integration**: AI-powered text generation, auto-completion, and assistance directly within the editor.
- **Modern Media Handling**: Drag-and-drop image uploads with built-in cropping for ebook covers.

### 📊 **Admin & User Dashboard**

- **Comprehensive Analytics**: Stats cards with trends and interactive Recharts (Bar, Line, Pie).
- **Order Management**: Detailed tracking and filtering of all ebook sales.
- **User Management**: Role-based access control and user activity monitoring.
- **Secure Authentication**: Multi-provider support (Email/Password, Google, GitHub) via **Auth.js v5**.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: [Prisma ORM](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/)
- **Authentication**: [Auth.js v5](https://authjs.dev/)
- **AI Engine**: [Google Gemini AI](https://ai.google.dev/)
- **Payments**: [Razorpay](https://razorpay.com/)
- **Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix UI)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Mail**: [Nodemailer](https://nodemailer.com/)

---

## 🏗️ Project Structure

```bash
├── app/                  # Next.js App Router
│   ├── (auth)/           # Authentication pages
│   ├── (marketing)/      # Public facing pages (Landing, Ebooks catalog)
│   ├── dashboard/        # Admin & User dashboard system
│   └── api/              # Backend API routes (Auth, Orders, AI, Notifications)
├── components/
│   ├── ui/               # Reusable shadcn components
│   ├── AppInputFields/   # High-level unified input system
│   └── marketing/        # Ebook cards, sections, and catalog components
├── hooks/                # Custom React hooks (use-mobile, etc.)
├── lib/                  # Shared utilities (Prisma client, Gemini config, Email)
└── prisma/               # Database schema and migrations
```

---

## 📦 Getting Started

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database
- Razorpay account (for payments)
- Google AI (Gemini) API key
- SMTP server (for emails)

### 2. Installation

```bash
# Clone the repository and install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials
```

### 3. Database Setup

```bash
# Generate Prisma client
pnpm prisma generate

# Push the schema to your database
pnpm prisma db push
```

### 4. Run Locally

```bash
# Start development server
pnpm dev
```

Open [http://localhost:2222](http://localhost:2222) to see the result.

---

## 🔧 Environment Variables

Required variables for development:

```env
# Database Connection
NEXT_POSTGRES_URL="postgresql://user:password@host:port/database"

# NextAuth Config
AUTH_SECRET="your-auth-secret"
NEXTAUTH_URL="http://localhost:2222"

# External APIs
NEXT_GEMINI_API_KEY="your-gemini-api-key"
RAZORPAY_KEY_ID="your-razorpay-id"
RAZORPAY_KEY_SECRET="your-razorpay-secret"

# SMTP (Email Delivery)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# AWS S3 (Media Storage)
AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="your-bucket-name"
```

---

## 🚀 Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Connect your GitHub repository to Vercel.
2. Add all environment variables from your `.env` to the Vercel project settings.
3. Vercel will automatically handle the build and deployment.

---

Built with ❤️ for professional ebook delivery.
