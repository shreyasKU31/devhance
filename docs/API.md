# API Reference

This document describes the DevHance API endpoints.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://devhance.in/api`

## Authentication

Most endpoints require authentication via Clerk. Include the session cookie or use Clerk's client SDK.

---

## Endpoints

### Case Studies

#### Create Case Study

Generate a new case study from a GitHub repository.

```http
POST /api/case-studies
```

**Authentication**: Required

**Request Body**:
```json
{
  "repoUrl": "https://github.com/username/repository"
}
```

**Response** (201 Created):
```json
{
  "id": "cuid",
  "slug": "repository-name",
  "title": "Repository Name",
  "url": "/case-studies/repository-name"
}
```

**Error Responses**:
| Status | Description |
|--------|-------------|
| 400 | Invalid GitHub URL |
| 401 | Unauthorized |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

### Payments

#### Create Checkout Session

Initiate a payment for VC report generation.

```http
POST /api/payments/create-checkout
```

**Authentication**: Required

**Request Body**:
```json
{
  "caseStudyId": "cuid"
}
```

**Response** (200 OK):
```json
{
  "checkoutUrl": "https://lemonsqueezy.com/checkout/..."
}
```

---

### Webhooks

#### Clerk Webhook

Handles user creation/update events from Clerk.

```http
POST /api/webhooks/clerk
```

**Headers**:
- `svix-id`: Webhook ID
- `svix-timestamp`: Timestamp
- `svix-signature`: HMAC signature

**Events Handled**:
- `user.created` - Create new user in database
- `user.updated` - Update user email

---

#### Lemon Squeezy Webhook

Handles payment events from Lemon Squeezy.

```http
POST /api/webhooks/lemonsqueezy
```

**Headers**:
- `x-signature`: HMAC signature

**Events Handled**:
- `order_created` - Payment initiated
- `order_paid` - Payment completed, triggers VC report generation
- `order_refunded` - Payment refunded

---

## Data Types

### CaseStudy

```typescript
interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  repoUrl: string;
  summary: string;
  techStack: string;
  architectureOverview: string;
  coreFeatures: string[];
  challengesAndSolutions: string;
  impact: string;
  problemSummary?: string;
  solutionSummary?: string;
  totalCommits?: number;
  activePeriod?: string;
  keyFolders?: string[];
  proofData?: ProofData;
  createdAt: Date;
  updatedAt: Date;
}
```

### VCReport

```typescript
interface VCReport {
  id: string;
  caseStudyId: string;
  content: {
    executiveSummary: string;
    technicalAssessment: object;
    securityAnalysis: object;
    scalabilityScore: number;
    investmentReadiness: object;
    recommendations: string[];
  };
  createdAt: Date;
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

| Endpoint | Limit |
|----------|-------|
| Case study creation | 10/hour per user |
| Payment creation | 20/hour per user |

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Error Codes**:

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Permission denied |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `RATE_LIMITED` | Too many requests |
| `INTERNAL_ERROR` | Server error |
