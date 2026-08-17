type RateLimit = {
  count: number;
  resetAt: number;
};

const requests = new Map<string, RateLimit>();

// This simple in-memory limit protects the local MVP. Use Redis or a gateway limit when scaling to many servers.
export function allowRequest(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = requests.get(key);

  if (!current || current.resetAt <= now) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export function requestIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}
