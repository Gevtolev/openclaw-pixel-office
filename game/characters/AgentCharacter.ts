export const AGENT_SPRITE_KEYS = [
  'guest-anim-1',
  'guest-anim-2',
  'guest-anim-3',
  'guest-anim-4',
  'guest-anim-5',
  'guest-anim-6',
] as const;

export const AGENT_TINTS = [
  0x88ffff, // cyan
  0xffff88, // yellow
  0xff88ff, // magenta
  0x88ff88, // green
  0xff8888, // red
  0x8888ff, // blue
] as const;

function hashId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getAgentSpriteKey(agentId: string): string {
  return AGENT_SPRITE_KEYS[hashId(agentId) % AGENT_SPRITE_KEYS.length];
}

export function getAgentTint(agentId: string): number {
  return AGENT_TINTS[hashId(agentId) % AGENT_TINTS.length];
}
