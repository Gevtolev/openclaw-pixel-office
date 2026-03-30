import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CacheEntry } from '@/lib/config-cache';

describe('CacheEntry', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns cached value within TTL', () => {
    const fetcher = vi.fn().mockReturnValue('data');
    const cache = new CacheEntry(fetcher, 30000);
    expect(cache.get()).toBe('data');
    expect(cache.get()).toBe('data');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('re-fetches after TTL expires', () => {
    const fetcher = vi.fn().mockReturnValueOnce('old').mockReturnValueOnce('new');
    const cache = new CacheEntry(fetcher, 100);
    expect(cache.get()).toBe('old');
    vi.advanceTimersByTime(150);
    expect(cache.get()).toBe('new');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('invalidate forces re-fetch', () => {
    const fetcher = vi.fn().mockReturnValueOnce('old').mockReturnValueOnce('new');
    const cache = new CacheEntry(fetcher, 30000);
    expect(cache.get()).toBe('old');
    cache.invalidate();
    expect(cache.get()).toBe('new');
  });
});
