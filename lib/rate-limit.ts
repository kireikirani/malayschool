// In-memory token-bucket limiter. Resets on process restart and does not share
// state across multiple Node instances (e.g. PM2 cluster mode) — acceptable for
// a single-instance VPS/cPanel deployment. A DB-backed limiter is a documented
// future upgrade if the site ever scales horizontally.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= max) {
    return false;
  }

  bucket.count++;
  return true;
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}
