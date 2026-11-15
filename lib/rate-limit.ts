// Best-effort limits on paid AI calls. State lives in each server instance's
// memory, so limits are per instance, not global. The AI Gateway budget set in
// the Vercel dashboard is the hard spending cap.
// A visitor is an IP address plus browser, so people sharing one network (a
// judging room, a classroom) each get their own allowance.
const PER_VISITOR = { max: 30, windowMs: 10 * 60 * 1000 };
const PER_INSTANCE = { max: 400, windowMs: 60 * 60 * 1000 };
const visitors = new Map<string, number[]>();
let instance: number[] = [];

function prune(times: number[], windowMs: number, now: number) {
  return times.filter((t) => now - t < windowMs);
}

export function visitorKey(request: Request) {
  const fwd = request.headers.get("x-forwarded-for") ?? "";
  const ip = (fwd.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
  const ua = request.headers.get("user-agent") ?? "";
  let h = 0;
  for (let i = 0; i < ua.length; i++) h = (h * 31 + ua.charCodeAt(i)) | 0;
  return `${ip}|${(h >>> 0).toString(36)}`;
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
