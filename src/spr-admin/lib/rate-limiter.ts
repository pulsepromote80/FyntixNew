interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter for API routes.
 * 
 * For production, use Redis-based rate limiting (e.g., upstash/ratelimit).
 * This is suitable for development and small deployments.
 */
export function rateLimit({
  limit = 10,
  windowMs = 60000,
}: {
  limit?: number;
  windowMs?: number;
} = {}) {
  return async function checkRateLimit(identifier: string): Promise<{
    success: boolean;
    remaining: number;
    resetTime: number;
  }> {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + windowMs,
      };
      rateLimitStore.set(identifier, newEntry);
      return {
        success: true,
        remaining: limit - 1,
        resetTime: newEntry.resetTime,
      };
    }

    if (entry.count >= limit) {
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    return {
      success: true,
      remaining: limit - entry.count,
      resetTime: entry.resetTime,
    };
  };
}

/**
 * Get client IP from request headers
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    const firstIp = forwarded.split(',')[0];
    if (firstIp) {
      return firstIp.trim();
    }
  }

  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

/**
 * Cleanup expired entries periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 60000); // Cleanup every minute
}
