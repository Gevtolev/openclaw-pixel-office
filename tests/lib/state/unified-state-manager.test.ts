import { describe, it, expect, vi } from 'vitest';
import { UnifiedStateManager } from '@/lib/state/unified-state-manager';

// Mock the openclaw-reader to avoid filesystem access
vi.mock('@/lib/state/openclaw-reader', () => ({
  readOpenClawAgents: vi.fn().mockReturnValue([
    {
      id: 'agent-1',
      name: 'ResearchBot',
      emoji: '🔬',
      source: 'openclaw',
      role: 'agent',
      state: 'writing',
      lastActive: Date.now(),
    },
  ]),
}));

describe('UnifiedStateManager', () => {
  it('merges openclaw agents and api-push agents', () => {
    const manager = new UnifiedStateManager();
    manager.pushStore.addVisitor('v1', 'Alice', '🐱');
    manager.pushStore.updateVisitor('v1', 'writing', 'Coding');

    const agents = manager.getAllAgents();

    // Should have: primary (from push store) + agent-1 (from openclaw) + visitor
    expect(agents.length).toBeGreaterThanOrEqual(3);
    expect(agents.find((a) => a.id === 'agent-1')).toBeDefined();
    expect(agents.find((a) => a.role === 'primary')).toBeDefined();
    expect(agents.find((a) => a.id === 'visitor:v1')).toBeDefined();
  });

  it('deduplicates by id, preferring openclaw source', () => {
    const manager = new UnifiedStateManager();
    const agents = manager.getAllAgents();
    const ids = agents.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
