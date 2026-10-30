/**
 * Ultra-lightweight in-memory cache with TTL and prefix/tag invalidation.
 * Zero external dependencies. Keeps memory usage minimal.
 */
class MemoryCache {
  constructor(defaultTtlMs = 60 * 1000) {
    this.cache = new Map();
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttlMs = this.defaultTtlMs) {
    // Keep max 500 keys to avoid memory bloat on free tier hosting
    if (this.cache.size >= 500) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  del(key) {
    this.cache.delete(key);
  }

  invalidatePrefix(prefix) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
  }
}

const serverCache = new MemoryCache(60 * 1000); // 1 minute default TTL

module.exports = { serverCache, MemoryCache };
