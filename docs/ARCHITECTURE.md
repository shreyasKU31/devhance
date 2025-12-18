# DevHance Architecture

This document provides an overview of the DevHance system architecture.

## Table of Contents

- [System Overview](#system-overview)
- [Application Architecture](#application-architecture)
- [Data Flow](#data-flow)
- [Key Components](#key-components)
- [Database Schema](#database-schema)
- [External Services](#external-services)

---

## System Overview

DevHance is a Next.js 16 application that transforms GitHub repositories into professional case studies and technical reports using AI.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Application                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Pages     │  │    API      │  │     Middleware          │  │
│  │  (App Dir)  │  │   Routes    │  │  (Auth, Rate Limiting)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
    ┌──────────┐    ┌──────────┐    ┌──────────┐
    │ Clerk    │    │ Prisma   │    │ External │
    │ (Auth)   │    │ (ORM)    │    │ APIs     │
    └──────────┘    └────┬─────┘    └──────────┘
                         │               │
                         ▼               ▼
                   ┌──────────┐    ┌──────────────┐
                   │ MongoDB  │    │ GitHub API   │
                   │ Database │    │ Google AI    │
                   └──────────┘    │ LemonSqueezy │
                                   └──────────────┘
```

---

## Application Architecture

### Directory Structure

```
devhance/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── case-studies/     # Case study generation
│   │   ├── payments/         # Payment processing
│   │   └── webhooks/         # Webhook handlers
│   ├── case-studies/         # Case study pages
│   │   ├── [slug]/           # Dynamic case study view
│   │   └── new/              # New case study creation
│   ├── dashboard/            # User dashboard
│   ├── vc-reports/           # VC report pages
│   ├── layout.jsx            # Root layout
│   ├── page.jsx              # Homepage
│   ├── robots.js             # SEO robots
│   └── sitemap.js            # Dynamic sitemap
│
├── components/               # React Components
│   ├── landing-page/         # Homepage sections
│   ├── ui/                   # Reusable UI (shadcn)
│   ├── GoogleAnalytics.jsx   # Analytics
│   └── JsonLd.jsx            # SEO structured data
│
├── lib/                      # Core Logic
│   ├── ai.js                 # AI generation
│   ├── github.js             # GitHub API
│   ├── prisma.js             # Database client
│   └── prompts.js            # AI prompts
│
└── prisma/                   # Database
    └── schema.prisma         # Schema definition
```

---

## Data Flow

### Case Study Generation Flow

```
1. User Input        2. GitHub Fetch       3. AI Analysis        4. Storage
┌──────────┐        ┌──────────────┐      ┌──────────────┐      ┌─────────┐
│ GitHub   │   →    │ Fetch Repo   │  →   │ Generate     │  →   │ Save to │
│ URL      │        │ Metadata     │      │ Case Study   │      │ Prisma  │
└──────────┘        └──────────────┘      └──────────────┘      └─────────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐      ┌──────────────┐
                    │ - Languages  │      │ - Summary    │
                    │ - Commits    │      │ - Tech Stack │
                    │ - Structure  │      │ - Features   │
                    │ - README     │      │ - Impact     │
                    └──────────────┘      └──────────────┘
```

### VC Report Generation Flow

```
1. Payment          2. Webhook           3. AI Analysis       4. Report
┌──────────┐       ┌──────────────┐     ┌──────────────┐     ┌─────────┐
│ Lemon    │  →    │ Order Paid   │  →  │ Deep Code    │  →  │ Store   │
│ Squeezy  │       │ Webhook      │     │ Analysis     │     │ Report  │
└──────────┘       └──────────────┘     └──────────────┘     └─────────┘
                                               │
                                               ▼
                                        ┌──────────────┐
                                        │ - Security   │
                                        │ - Scalability│
                                        │ - Tech Debt  │
                                        │ - VC Score   │
                                        └──────────────┘
```

---

## Key Components

### Authentication (Clerk)

All protected routes use Clerk for authentication. The middleware (`middleware.js`) handles:
- Public routes (homepage, case study views)
- Protected routes (dashboard, report generation)
- Webhook verification

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/case-studies` | POST | Generate new case study |
| `/api/payments/create-checkout` | POST | Create payment session |
| `/api/webhooks/clerk` | POST | Clerk user sync |
| `/api/webhooks/lemonsqueezy` | POST | Payment webhooks |

### AI Integration

The `lib/ai.js` module uses Google's Generative AI (Gemini) for:
- Case study narrative generation
- Technical analysis
- VC report generation

Prompts are defined in `lib/prompts.js` for consistency and maintainability.

---

## Database Schema

```prisma
model User {
  id          String       @id @default(cuid())
  clerkUserId String       @unique
  email       String       @unique
  caseStudies CaseStudy[]
}

model CaseStudy {
  id          String     @id @default(cuid())
  slug        String     @unique
  title       String
  repoUrl     String
  summary     String
  techStack   String
  // ... additional fields
  user        User       @relation
  vcReport    VCReport?
  payments    Payment[]
}

model VCReport {
  id          String     @id @default(cuid())
  caseStudyId String     @unique
  content     Json
  caseStudy   CaseStudy  @relation
}

model Payment {
  id          String     @id @default(cuid())
  status      String     // pending, paid, refunded
  caseStudyId String
  caseStudy   CaseStudy  @relation
}
```

---

## External Services

| Service | Purpose | Environment Variables |
|---------|---------|----------------------|
| **Clerk** | Authentication | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| **MongoDB** | Database | `DATABASE_URL` |
| **Google AI** | Content generation | `GOOGLE_AI_API_KEY` |
| **Lemon Squeezy** | Payments | `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET` |
| **GitHub API** | Repository data | Public API (no key needed for public repos) |

---

## Performance Optimizations

- **Code Splitting**: Dynamic imports for below-fold components
- **Image Optimization**: Next.js Image with priority loading
- **Caching**: Static assets cached for 1 year
- **Font Loading**: `display: swap` for faster text rendering

---

## Security Measures

- **Authentication**: All mutations require Clerk auth
- **HTTPS**: Enforced via HSTS headers
- **Input Validation**: Server-side validation on all inputs
- **Webhook Verification**: Signature verification for all webhooks
- **Rate Limiting**: Implemented via Clerk
