export const AGENT_SPRITE_KEYS = [
  'guest-anim-1',
  'guest-anim-2',
  'guest-anim-3',
  'guest-anim-4',
  'guest-anim-5',
  'guest-anim-6',
] as const;

export function getAgentSpriteKey(agentId: string): string {
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) {
    hash = ((hash << 5) - hash + agentId.charCodeAt(i)) | 0;
  }
  return AGENT_SPRITE_KEYS[Math.abs(hash) % AGENT_SPRITE_KEYS.length];
}
