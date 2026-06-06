type Bucket = number[];

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_BUCKETS = 10_000;

function pruneOld(bucket: Bucket, now: number) {
  const cutoff = now - WINDOW_MS;
  while (bucket.length > 0 && bucket[0] < cutoff) {
    bucket.shift();
  }
}

function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const xri = request.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return "unknown";
}

export interface RateLimitOptions {
  key: string;
  limit: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(request: Request, opts: RateLimitOptions): RateLimitResult {
  const ip = clientIp(request);
  const bucketKey = `${opts.key}:${ip}`;
  const now = Date.now();

  let bucket = buckets.get(bucketKey);
  if (!bucket) {
    bucket = [];
    buckets.set(bucketKey, bucket);
  }

  pruneOld(bucket, now);

  if (bucket.length >= opts.limit) {
    const oldest = bucket[0];
    const retryAfterMs = (oldest + WINDOW_MS) - now;
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    };
  }

  bucket.push(now);

  if (buckets.size > MAX_BUCKETS) {
    const firstKey = buckets.keys().next().value;
    if (firstKey) buckets.delete(firstKey);
  }

  return { allowed: true, remaining: opts.limit - bucket.length, retryAfterSeconds: 0 };
}
