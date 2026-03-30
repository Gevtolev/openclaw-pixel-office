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
