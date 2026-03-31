import { describe, it, expect } from 'vitest';
import { getAgentSpriteKey, getAgentTint, AGENT_TINTS } from '@/game/characters/AgentCharacter';

describe('getAgentSpriteKey', () => {
  it('returns a key from AGENT_SPRITE_KEYS', () => {
    const key = getAgentSpriteKey('test-agent');
    expect(key).toMatch(/^guest-anim-[1-6]$/);
  });

  it('is consistent for the same id', () => {
    expect(getAgentSpriteKey('agent-abc')).toBe(getAgentSpriteKey('agent-abc'));
  });
});

describe('getAgentTint', () => {
  it('returns a value from AGENT_TINTS', () => {
    const tint = getAgentTint('test-agent');
    expect(AGENT_TINTS).toContain(tint);
  });

  it('is consistent for the same id', () => {
    expect(getAgentTint('agent-abc')).toBe(getAgentTint('agent-abc'));
  });

  it('produces different tints for different ids', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
    const tints = new Set(ids.map(getAgentTint));
    expect(tints.size).toBeGreaterThan(1);
  });
});
