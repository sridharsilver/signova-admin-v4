/**
 * queryCache — lightweight stale-while-revalidate cache for Supabase queries.
 *
 * How it works:
 * - Results are stored in memory keyed by a cache key.
 * - On cache hit: returns the stale value instantly, then refreshes in background.
 * - On cache miss: fetches and caches the result.
 * - TTL controls how long before a background refresh is triggered (default 60 s).
 *
 * Usage:
 *   const data = await queryCache.get("products", () => productService.getProducts(), 60_000);
 *   queryCache.invalidate("products"); // call after mutations
 */

interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

// ── Restore from localStorage on boot ──
try {
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith('qc_')) {
      const raw = localStorage.getItem(k);
      if (raw) store.set(k.slice(3), JSON.parse(raw));
    }
  }
} catch (err) { /* ignore private mode errors */ }

function saveToLocal(key: string, entry: CacheEntry<unknown>) {
  try { localStorage.setItem('qc_' + key, JSON.stringify(entry)); } catch (err) { /* ignore */ }
}
function removeFromLocal(key: string) {
  try { localStorage.removeItem('qc_' + key); } catch (err) { /* ignore */ }
}


export const queryCache = {
  /**
   * Returns cached data immediately if available, then refreshes in background
   * if the entry is older than `ttlMs`. On cache miss, awaits the fetch.
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs = 60_000,
    onBackground?: (fresh: T) => void,
  ): Promise<T> {
    const entry = store.get(key) as CacheEntry<T> | undefined;
    const now = Date.now();

    if (entry) {
      const stale = now - entry.fetchedAt > ttlMs;
      if (stale && !inflight.has(key)) {
        // Trigger background refresh without blocking the caller
        const p = fetcher()
          .then((fresh) => {
            const entry = { data: fresh, fetchedAt: Date.now() };
            store.set(key, entry);
            saveToLocal(key, entry);
            inflight.delete(key);
            onBackground?.(fresh);
            return fresh;
          })
          .catch((err) => {
            inflight.delete(key);
            console.warn(`[queryCache] background refresh failed for "${key}":`, err);
          });
        inflight.set(key, p);
      }
      // Return stale data immediately — background refresh will push an update
      return entry.data;
    }

    // Cache miss — coalesce concurrent requests for the same key
    if (inflight.has(key)) {
      return inflight.get(key) as Promise<T>;
    }

    const p = fetcher().then((data) => {
      const entry = { data, fetchedAt: Date.now() };
      store.set(key, entry);
      saveToLocal(key, entry);
      inflight.delete(key);
      return data;
    }).catch((err) => {
      inflight.delete(key);
      throw err;
    });

    inflight.set(key, p);
    return p;
  },

  /** Force the next get() call to re-fetch from the server. */
  invalidate(...keys: string[]) {
    keys.forEach((k) => {
      store.delete(k);
      removeFromLocal(k);
    });
  },

  /** Clear everything (e.g. on sign-out). */
  clear() {
    store.clear();
    inflight.clear();
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith('qc_')) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch (err) { /* ignore */ }
  },
};
