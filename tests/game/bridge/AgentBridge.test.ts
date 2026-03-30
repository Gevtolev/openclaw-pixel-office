import { describe, it, expect } from 'vitest';
import { mapAgentToAction } from '@/game/bridge/AgentBridge';
import type { UnifiedAgentState } from '@/lib/state/types';

function makeAgent(overrides: Partial<UnifiedAgentState>): UnifiedAgentState {
  return {
    id: 'test',
    name: 'TestBot',
    emoji: '🤖',
    source: 'openclaw',
    role: 'agent',
    state: 'idle',
    lastActive: Date.now(),
    ...overrides,
  };
}

describe('mapAgentToAction', () => {
  it('maps writing state to GOTO_SEAT action', () => {
    const action = mapAgentToAction(makeAgent({ state: 'writing' }));
    expect(action.type).toBe('GOTO_SEAT');
    expect(action.animKey).toBe('typing');
  });

  it('maps idle state to WANDER action', () => {
    const action = mapAgentToAction(makeAgent({ state: 'idle' }));
    expect(action.type).toBe('WANDER');
  });

  it('maps offline state to REMOVE action', () => {
    const action = mapAgentToAction(makeAgent({ state: 'offline' }));
    expect(action.type).toBe('REMOVE');
  });

  it('maps error state to GOTO_ERROR_ZONE action', () => {
    const action = mapAgentToAction(makeAgent({ state: 'error' }));
    expect(action.type).toBe('GOTO_ERROR_ZONE');
  });

  it('maps syncing state to PLAY_EFFECT action', () => {
    const action = mapAgentToAction(makeAgent({ state: 'syncing' }));
    expect(action.type).toBe('PLAY_EFFECT');
    expect(action.effectKey).toBe('sync');
  });
});
