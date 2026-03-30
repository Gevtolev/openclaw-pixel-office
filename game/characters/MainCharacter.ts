// sprite keys verified against game/config/sprites.ts
// note: no dedicated researching sprite exists; falls back to star-idle
export const MAIN_CHARACTER_ANIMS = {
  idle: { key: 'star-idle', frameRate: 6, repeat: -1 },
  writing: { key: 'star-working', frameRate: 10, repeat: -1 },
  researching: { key: 'star-idle', frameRate: 8, repeat: -1 },
  executing: { key: 'star-working', frameRate: 15, repeat: -1 },
  syncing: { key: 'sync-animation', frameRate: 12, repeat: 0 },
  error: { key: 'error-bug', frameRate: 8, repeat: -1 },
} as const;

export type MainAnimState = keyof typeof MAIN_CHARACTER_ANIMS;
