// Best-effort limits on paid AI calls. State lives in each server instance's
// memory, so limits are per instance, not global. The AI Gateway budget set in
// the Vercel dashboard is the hard spending cap.
const PER_VISITOR = { max: 10, windowMs: 10 * 60 * 1000 };
const PER_INSTANCE = { max: 200, windowMs: 60 * 60 * 1000 };
const visitors = new Map<string, number[]>();
let instance: number[] = [];

function prune(times: number[], windowMs: number, now: number) {
  return times.filter((t) => now - t < windowMs);
}

export function visitorKey(request: Request) {
  const fwd = request.headers.get("x-forwarded-for") ?? "";
  return (fwd.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
}

/** Returns true and records the call when an AI call is allowed. */
export function allowAiCall(key: string, now = Date.now()) {
  instance = prune(instance, PER_INSTANCE.windowMs, now);
  const mine = prune(visitors.get(key) ?? [], PER_VISITOR.windowMs, now);
  if (instance.length >= PER_INSTANCE.max || mine.length >= PER_VISITOR.max) {
    visitors.set(key, mine);
    return false;
  }
  mine.push(now);
  instance.push(now);
  visitors.set(key, mine);
  if (visitors.size > 5000) visitors.clear();
  return true;
}

export const aiLimits = { PER_VISITOR, PER_INSTANCE };
