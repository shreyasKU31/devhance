/**
 * Custom Security Headers and Logic
 * Implements basic rate limiting and bot detection without external libraries.
 */

// In-memory store for rate limiting
// Note: In a serverless environment (like Vercel), this may be reset frequently.
// For a production SaaS with high traffic, consider using Redis (e.g., Upstash).
const rateLimitMap = new Map();

export function checkRateLimit(ip) {
  const windowMs = 60 * 1000; // 1 minute window
  const limit = 100; // Limit each IP to 100 requests per windowMs

  if (!ip) return true; // Could not identify IP, allow (or block if strict)

  // Clean up old entries periodically (optimization: could be done on access)
  const now = Date.now();
  
  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, {
      count: 1,
      startTime: now
    });
    return true; // Allowed
  }

  const data = rateLimitMap.get(ip);

  if (now - data.startTime > windowMs) {
    // Window passed, reset
    data.count = 1;
    data.startTime = now;
    return true; // Allowed
  }

  // Window still active, increment count
  data.count++;
  
  if (data.count > limit) {
    return false; // Blocked
  }

  return true; // Allowed
}

export function isBot(userAgent) {
  if (!userAgent) return true; // No user agent? Suspicious.

  // Common bot patterns (expand as needed)
  const botPatterns = [
    'bot',
    'spider',
    'crawl',
    'scraper',
    'mediapartners',
    'apis-google',
    'curl',
    'wget',
    'python-requests',
    'postman',
    'insomnia',
    'slurp'
  ];

  const lowerUA = userAgent.toLowerCase();

  // Whitelist: Allow common search engines
  const allowedBots = [
    'googlebot', 
    'bingbot', 
    'duckduckbot', 
    'baiduspider', 
    'yandexbot',
    'sogou',
    'exabot',
    'facebot',
    'ia_archiver'
  ];

  if (allowedBots.some(bot => lowerUA.includes(bot))) {
    return false; // Allowed search engine
  }
  
  // Check if UA contains any bot pattern
  if (botPatterns.some(pattern => lowerUA.includes(pattern))) {
    return true; // It is a blocked bot
  }

  return false; // Not a bot
}
