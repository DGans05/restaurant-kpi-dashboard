/**
 * Simple in-memory rate limiter
 *
 * For production, consider using @upstash/ratelimit with Redis:
 * https://github.com/upstash/ratelimit
 *
 * This implementation is suitable for:
 * - Single-instance deployments
 * - Development/testing
 * - Low-traffic applications
 *
 * For serverless/edge deployments with multiple instances,
 * use a distributed rate limiter backed by Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (resets on server restart)
const store = new Map<string, RateLimitEntry>();

// Cleanup old entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 60_000);

export interface RateLimitConfig {
  /**
   * Unique identifier for this rate limit bucket
   * (e.g., user ID, IP address, API key)
   */
  identifier: string;

  /**
   * Maximum number of requests allowed in the time window
   */
  limit: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;
}

export interface RateLimitResult {
  /**
   * Whether the request is allowed
   */
  success: boolean;

  /**
   * Current request count in this window
   */
  count: number;

  /**
   * Maximum requests allowed
   */
  limit: number;

  /**
   * Milliseconds until the rate limit resets
   */
  resetMs: number;

  /**
   * Timestamp when the rate limit resets
   */
  resetAt: number;
}

/**
 * Check if a request is allowed under rate limit
 *
 * @example
 * ```typescript
 * const result = rateLimit({
 *   identifier: userId,
 *   limit: 10,
 *   windowMs: 60_000, // 10 requests per minute
 * });
 *
 * if (!result.success) {
 *   return NextResponse.json(
 *     { error: "Too many requests", resetAt: result.resetAt },
 *     { status: 429 }
 *   );
 * }
 * ```
 */
export function rateLimit(config: RateLimitConfig): RateLimitResult {
  const { identifier, limit, windowMs } = config;
  const now = Date.now();
  const key = `${identifier}`;

  // Get or create entry
  let entry = store.get(key);

  // Create new entry if doesn't exist or window expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    store.set(key, entry);
  }

  // Increment count
  entry.count++;

  // Check if limit exceeded
  const success = entry.count <= limit;

  return {
    success,
    count: entry.count,
    limit,
    resetMs: entry.resetAt - now,
    resetAt: entry.resetAt,
  };
}

/**
 * Get rate limit headers for HTTP responses
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": Math.max(0, result.limit - result.count).toString(),
    "X-RateLimit-Reset": Math.floor(result.resetAt / 1000).toString(),
  };
}
