/**
 * Environment Variable Validation
 * Validates required environment variables at startup.
 * Import this in layout.jsx or a top-level server component to fail fast.
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
];

const optionalEnvVars = [
  'GEMINI_API_KEY',
  'GITHUB_TOKEN',
  'LEMON_SQUEEZY_API_KEY',
  'LEMON_SQUEEZY_STORE_ID',
  'LEMON_SQUEEZY_VARIANT_ID',
  'CLERK_WEBHOOK_SECRET',
  'LEMON_SQUEEZY_WEBHOOK_SECRET',
];

export function validateEnv() {
  const missing = [];
  const warnings = [];

  for (const key of requiredEnvVars) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  for (const key of optionalEnvVars) {
    if (!process.env[key]) {
      warnings.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\nPlease check your .env.local file.`
    );
  }

  if (warnings.length > 0 && process.env.NODE_ENV === 'development') {
    console.warn(
      `⚠️  Missing optional environment variables (some features may not work):\n${warnings.map(k => `  - ${k}`).join('\n')}`
    );
  }

  return true;
}

// Auto-validate on import in non-edge environments
if (typeof EdgeRuntime === 'undefined') {
  validateEnv();
}
