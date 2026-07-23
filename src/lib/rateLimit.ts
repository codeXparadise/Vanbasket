// [FIXED] - API Rate Limiting
const rateLimitMap = new Map<string, number[]>();

/**
 * In-memory sliding window rate limiter.
 * @param identifier IP address or user ID identifier
 * @param limit Max allowed requests within windowMs
 * @param windowMs Time window in milliseconds (default: 60000ms = 1min)
 * @returns true if allowed, false if limit exceeded
 */
export function rateLimit(identifier: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  const requests = (rateLimitMap.get(identifier) || []).filter((t: number) => t > windowStart);
  requests.push(now);
  rateLimitMap.set(identifier, requests);

  return requests.length <= limit;
}

export function getClientIp(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}
