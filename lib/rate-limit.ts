type Entry = { count: number; resetAt: number };
const attempts = new Map<string, Entry>();

export function allowRequest(key: string, limit = 6, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count += 1;
  return true;
}
