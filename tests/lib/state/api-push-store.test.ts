import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ApiPushStore } from '@/lib/state/api-push-store';

describe('ApiPushStore', () => {
  let store: ApiPushStore;

  beforeEach(() => {
    store = new ApiPushStore();
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it('setPrimaryState sets the primary agent state', () => {
    store.setPrimaryState('writing', 'Coding now');
    const agents = store.getAll();
    expect(agents).toHaveLength(1);
    expect(agents[0].role).toBe('primary');
    expect(agents[0].state).toBe('writing');
    expect(agents[0].message).toBe('Coding now');
  });

  it('addVisitor adds a visitor agent', () => {
    store.addVisitor('v1', 'Alice', '🐱');
    const agents = store.getAll();
    const visitor = agents.find((a) => a.id === 'visitor:v1');
    expect(visitor).toBeDefined();
    expect(visitor!.role).toBe('visitor');
    expect(visitor!.name).toBe('Alice');
  });

  it('updateVisitor updates visitor state', () => {
    store.addVisitor('v1', 'Alice', '🐱');
    store.updateVisitor('v1', 'writing', 'Working hard');
    const visitor = store.getAll().find((a) => a.id === 'visitor:v1');
    expect(visitor!.state).toBe('writing');
  });

  it('removeVisitor removes a visitor', () => {
    store.addVisitor('v1', 'Alice', '🐱');
    store.removeVisitor('v1');
    const visitor = store.getAll().find((a) => a.id === 'visitor:v1');
    expect(visitor).toBeUndefined();
  });

  it('cleanExpired removes visitors with no heartbeat for 5 minutes', () => {
    store.addVisitor('v1', 'Alice', '🐱');
    vi.advanceTimersByTime(6 * 60 * 1000);
    store.cleanExpired();
    expect(store.getAll().find((a) => a.id === 'visitor:v1')).toBeUndefined();
  });

  it('work state auto-decays to idle after 300s', () => {
    store.setPrimaryState('writing', 'Coding');
    vi.advanceTimersByTime(301_000);
    store.cleanExpired();
    const primary = store.getAll().find((a) => a.role === 'primary');
    expect(primary!.state).toBe('idle');
  });
});
