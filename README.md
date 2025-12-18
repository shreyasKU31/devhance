<p align="center">
  <img src="public/DH Logo.png" alt="DevHance Logo" width="300" />
</p>

<h1 align="center">DevHance</h1>

<p align="center">
  <strong>Stop Sending Ugly GitHub Links.</strong><br/>
  Transform your repositories into client-winning case studies and investor-grade technical audits in 30 seconds.
</p>

<p align="center">
  <a href="https://devhance.in">Website</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Docs</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?style=flat-square&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License" />
</p>

---

## 🚀 What is DevHance?

**DevHance** is an AI-powered SaaS that transforms raw GitHub repositories into professional, shareable assets:

- **📄 Case Studies** — Instantly generate beautiful, deployed case study pages from any public repo
- **📊 VC Reports** — Get investor-grade technical audits with code quality metrics, architecture analysis, and scalability assessments

Your code is genius. Your presentation is costing you money. **We fix that.**

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| **One-Click Generation** | Paste a GitHub URL, get a professional case study in seconds |
| **AI-Powered Analysis** | Automatic tech stack detection, architecture mapping, and narrative generation |
| **Investor-Ready Reports** | Technical debt scans, security analysis, and "Buy Box" scoring |
| **Shareable Links** | Every case study gets a unique, SEO-optimized URL |
| **PDF Export** | Download reports for proposals and pitch decks |

---

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Styling** | Tailwind CSS 4, Radix UI |
| **Database** | MongoDB + Prisma ORM |
| **Auth** | Clerk |
| **Payments** | Lemon Squeezy |
| **AI** | Google Generative AI (Gemini) |
| **Animations** | Framer Motion |

---

## 🔒 Security & Production Features

| Feature | Description |
|---------|-------------|
| **Rate Limiting** | 100 requests/min per IP to prevent abuse |
| **Bot Protection** | Blocks scrapers & automated tools (allows search engines) |
| **CSP Headers** | Content Security Policy for XSS prevention |
| **Structured Errors** | Consistent API error responses with error codes |
| **Environment Validation** | Fails fast if required env vars are missing |
| **Duplicate Prevention** | Prevents generating duplicate case studies for same repo |

---

## 🚦 Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- MongoDB database

### Installation

```bash
# Clone the repository
git clone https://github.com/devhance/devhance.git
cd devhance

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up the database
pnpm prisma generate
pnpm prisma db push

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## ⚙️ Environment Variables

Create a `.env.local` file with the following:

```env
# Database
DATABASE_URL="mongodb+srv://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Lemon Squeezy Payments
LEMONSQUEEZY_API_KEY="..."
LEMONSQUEEZY_STORE_ID="..."
LEMONSQUEEZY_WEBHOOK_SECRET="..."
NEXT_PUBLIC_LEMONSQUEEZY_VARIANT_ID="..."

# Google AI
GOOGLE_AI_API_KEY="..."

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-..."
```

See [`.env.example`](.env.example) for full documentation.

---

## 📁 Project Structure

```
devhance/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/               # API endpoints
│   ├── case-studies/      # Case study pages
│   ├── dashboard/         # User dashboard
│   └── vc-reports/        # VC report pages
├── components/            # React components
│   ├── landing-page/      # Homepage sections
│   └── ui/                # Reusable UI components
├── lib/                   # Utility functions & services
│   ├── ai.js              # AI generation logic
│   ├── errors.js          # Custom error classes
│   ├── env.js             # Environment validation
│   ├── github.js          # GitHub API integration
│   ├── prisma.js          # Database client
│   └── security.js        # Rate limiting & bot protection
├── prisma/                # Database schema
├── public/                # Static assets
└── docs/                  # Documentation
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | System design and component overview |
| [API Reference](docs/API.md) | API endpoints documentation |
| [Deployment](docs/DEPLOYMENT.md) | Production deployment guide |

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🔗 Links

- **Website**: [devhance.in](https://devhance.in)
- **Support**: [shreyas@devhance.in](mailto:shreyas@devhance.in)
- **Twitter**: [@devhance](https://twitter.com/devhance)

---

<p align="center">
  <strong>Built for High-Signal Developers</strong><br/>
  <sub>Made with ❤️ by the DevHance team</sub>
</p>
