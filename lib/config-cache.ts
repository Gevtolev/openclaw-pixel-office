export class CacheEntry<T> {
  private value: T | undefined;
  private lastFetch = 0;

  constructor(
    private fetcher: () => T,
    private ttlMs: number
  ) {}

  get(): T {
    const now = Date.now();
    if (this.value === undefined || now - this.lastFetch > this.ttlMs) {
      this.value = this.fetcher();
      this.lastFetch = now;
    }
    return this.value;
  }

  invalidate(): void {
    this.value = undefined;
    this.lastFetch = 0;
  }
}

// Simple dashboard config cache (used by /api/config route)
type ConfigCacheEntry = { data: any; ts: number };
let configCache: ConfigCacheEntry | null = null;

export function getConfigCache(): ConfigCacheEntry | null {
  return configCache;
}

export function setConfigCache(entry: ConfigCacheEntry): void {
  configCache = entry;
}

export function clearConfigCache(): void {
  configCache = null;
}
