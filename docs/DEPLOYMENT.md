# Deployment Guide

This guide covers deploying DevHance to production.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub repository with DevHance code
- [ ] Vercel account (or alternative hosting)
- [ ] MongoDB database (MongoDB Atlas, etc.)
- [ ] Clerk account for authentication
- [ ] Lemon Squeezy account for payments
- [ ] Google AI API key

---

## Vercel Deployment

### 1. Connect Repository

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Select the `devhance` repository

### 2. Configure Build Settings

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `./` |
| Build Command | `pnpm build` |
| Output Directory | `.next` |
| Install Command | `pnpm install` |

### 3. Add Environment Variables

Add all required environment variables (see below).

### 4. Deploy

Click **Deploy** and wait for the build to complete.

---

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/dashboard"

# Lemon Squeezy Payments
LEMONSQUEEZY_API_KEY="..."
LEMONSQUEEZY_STORE_ID="..."
LEMONSQUEEZY_WEBHOOK_SECRET="..."
NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID="..."

# Google AI
GOOGLE_AI_API_KEY="..."

# Analytics (Optional)
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
```

### Setting in Vercel

1. Go to **Project Settings → Environment Variables**
2. Add each variable with appropriate values
3. Set scope to **Production** (and optionally Preview/Development)

---

## Database Setup

### Option 1: Supabase

1. Create a new Supabase project
2. Go to **Settings → Database**
3. Copy the connection string
4. Add `?pgbouncer=true` for connection pooling

### Option 2: Neon

1. Create a new Neon project
2. Copy the connection string from the dashboard
3. Use the pooled connection for production

### Run Migrations

After setting `DATABASE_URL`, run:

```bash
pnpm prisma generate
pnpm prisma db push
```

Or use Vercel's build command:

```json
{
  "scripts": {
    "build": "prisma generate && prisma db push && next build"
  }
}
```

---

## Post-Deployment

### 1. Configure Webhooks

#### Clerk Webhooks

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Select events: `user.created`, `user.updated`
4. Copy signing secret to `CLERK_WEBHOOK_SECRET`

#### Lemon Squeezy Webhooks

1. Go to Lemon Squeezy → Settings → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/lemonsqueezy`
3. Select events: `order_created`, `order_paid`, `order_refunded`
4. Copy signing secret to `LEMONSQUEEZY_WEBHOOK_SECRET`

### 2. Verify Domain

1. Add your custom domain in Vercel
2. Configure DNS records as instructed
3. Wait for SSL certificate provisioning

### 3. Submit to Search Engines

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your domain
3. Submit sitemap: `https://yourdomain.com/sitemap.xml`

### 4. Verify Analytics

1. Open your site in an incognito window
2. Check Google Analytics real-time dashboard
3. Verify page views are being tracked

---

## Monitoring

### Recommended Tools

| Tool | Purpose |
|------|---------|
| Vercel Analytics | Performance monitoring |
| Sentry | Error tracking |
| Uptime Robot | Uptime monitoring |
| Google Analytics | User analytics |

### Health Checks

Monitor these endpoints:
- `https://yourdomain.com` - Homepage loads
- `https://yourdomain.com/robots.txt` - SEO check
- `https://yourdomain.com/sitemap.xml` - Sitemap valid

---

## Troubleshooting

### Build Failures

```bash
# Clear cache and rebuild
rm -rf .next node_modules
pnpm install
pnpm build
```

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check IP allowlist in database settings
- Ensure SSL mode is correct

### Webhook Failures

- Check webhook logs in Clerk/Lemon Squeezy dashboards
- Verify webhook secrets match environment variables
- Test with ngrok locally first

---

## Support

For deployment issues:
- **Email**: [shreyas@devhance.in](mailto:shreyas@devhance.in)
- **GitHub Issues**: Open an issue with the `deployment` label
