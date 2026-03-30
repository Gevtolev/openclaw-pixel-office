import { describe, it, expect } from 'vitest';
import { SeatManager } from '@/game/pathfinding/SeatManager';

describe('SeatManager', () => {
  it('assigns the reserved seat to primary agent', () => {
    const mgr = new SeatManager();
    const seat = mgr.assign('primary-agent', 'primary');
    expect(seat).toBeDefined();
    expect(seat!.id).toBe('seat-main');
  });

  it('assigns first available seat to regular agents', () => {
    const mgr = new SeatManager();
    mgr.assign('primary-agent', 'primary');
    const seat = mgr.assign('agent-1', 'agent');
    expect(seat).toBeDefined();
    expect(seat!.id).toBe('seat-1');
  });

  it('assigns nearest seat to subagent based on parent', () => {
    const mgr = new SeatManager();
    mgr.assign('primary-agent', 'primary');
    const seat = mgr.assign('sub-1', 'subagent');
    expect(seat).toBeDefined();
  });

  it('returns null when all seats are taken', () => {
    const mgr = new SeatManager();
    for (let i = 0; i < 7; i++) {
      mgr.assign(`agent-${i}`, i === 0 ? 'primary' : 'agent');
    }
    const seat = mgr.assign('overflow', 'visitor');
    expect(seat).toBeNull();
  });

  it('release frees a seat for reuse', () => {
    const mgr = new SeatManager();
    mgr.assign('primary-agent', 'primary');
    const s1 = mgr.assign('agent-1', 'agent');
    mgr.release('agent-1');
    const s2 = mgr.assign('agent-2', 'agent');
    expect(s2!.id).toBe(s1!.id);
  });
});
