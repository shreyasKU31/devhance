# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take security seriously at DevHance. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT Create a Public Issue

Security vulnerabilities should not be reported through public GitHub issues.

### 2. Email Us Directly

Send a detailed report to: **[shreyas@devhance.in](mailto:shreyas@devhance.in)**

Or contact us at: **[shreyas@devhance.in](mailto:shreyas@devhance.in)**

### 3. Include in Your Report

Please include as much of the following information as possible:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Location** of the affected source code (file path, line numbers if known)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept** or exploit code (if possible)
- **Impact assessment** of the vulnerability
- **Suggested fix** (if you have one)

### 4. Response Timeline

| Action | Timeline |
|--------|----------|
| Acknowledgment | Within 48 hours |
| Initial assessment | Within 1 week |
| Fix development | Within 2 weeks |
| Coordinated disclosure | After patch release |

## Security Best Practices

When contributing to DevHance, please follow these security best practices:

### Environment Variables

- Never commit secrets or API keys
- Use `.env.local` for local development
- Follow the `.env.example` template

### Authentication

- All protected routes use Clerk authentication
- Never bypass authentication checks
- Validate user permissions server-side

### Input Validation

- Validate all user inputs
- Sanitize data before database operations
- Use parameterized queries (Prisma handles this)

### Dependencies

- Keep dependencies updated
- Review security advisories regularly
- Run `pnpm audit` periodically

### Bot Protection

- Automated clients and bots are blocked via middleware
- **Allowed**: Search engine bots (Googlebot, Bingbot, DuckDuckBot, etc.)
- **Blocked**: Scrapers, curl, wget, python-requests, Postman, and other automated tools
- Bot detection is based on User-Agent analysis

### Rate Limiting

- All requests are rate-limited to **100 requests per minute per IP**
- Exceeding the limit returns `429 Too Many Requests`
- Rate limiting uses in-memory storage (per server instance)

## Bug Bounty

While we don't currently have a formal bug bounty program, we deeply appreciate security researchers who responsibly disclose vulnerabilities. Contributors who report valid security issues will be:

- Credited in our security acknowledgments (if desired)
- Thanked publicly (with permission)

---

Thank you for helping keep DevHance and our users safe! 🛡️
