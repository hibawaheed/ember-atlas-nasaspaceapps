// In-memory cache of checked AI results, per server instance. Repeated
// questions (the suggested prompts, the default lab and Mission-desk views)
// are answered from here without a new model call or a rate-limit charge.
const TTL_MS = 6 * 60 * 60 * 1000;
const MAX = 500;
const store = new Map<string, { at: number; value: unknown }>();

export const normalizeQuestion = (q: string) =>
  q.toLowerCase().replace(/[^a-z0-9%.\s-]/g, " ").replace(/\s+/g, " ").trim();

export function cacheGet<T>(key: string, now = Date.now()): T | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (now - hit.at > TTL_MS) {
    store.delete(key);
    return undefined;
  }
  return hit.value as T;
}

export function cacheSet(key: string, value: unknown, now = Date.now()) {
  if (store.size >= MAX) store.delete(store.keys().next().value!);
  store.set(key, { at: now, value });
}
