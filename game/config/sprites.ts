export interface SpriteConfig {
  key: string;
  path: string;
  frameWidth?: number;
  frameHeight?: number;
}

// Spritesheets (require frameWidth/frameHeight for animation frames)
export const SPRITES: SpriteConfig[] = [
  // Main character animations
  { key: 'star-working', path: '/sprites/star-working-spritesheet-grid.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'star-idle', path: '/sprites/star-idle-v5.png', frameWidth: 128, frameHeight: 128 },

  // Environment animations
  { key: 'coffee-machine', path: '/sprites/coffee-machine-v3-grid.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'cats', path: '/sprites/cats-spritesheet.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'plants', path: '/sprites/plants-spritesheet.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'flowers-bloom', path: '/sprites/flowers-bloom-v2.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'error-bug', path: '/sprites/error-bug-spritesheet-grid.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'serverroom', path: '/sprites/serverroom-spritesheet.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'sync-animation', path: '/sprites/sync-animation-v3-grid.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'posters', path: '/sprites/posters-spritesheet.webp', frameWidth: 128, frameHeight: 128 },

  // Guest character animations
  { key: 'guest-anim-1', path: '/sprites/guest_anim_1.webp', frameWidth: 32, frameHeight: 32 },
  { key: 'guest-anim-2', path: '/sprites/guest_anim_2.webp', frameWidth: 32, frameHeight: 32 },
  { key: 'guest-anim-3', path: '/sprites/guest_anim_3.webp', frameWidth: 32, frameHeight: 32 },
  { key: 'guest-anim-4', path: '/sprites/guest_anim_4.webp', frameWidth: 32, frameHeight: 32 },
  { key: 'guest-anim-5', path: '/sprites/guest_anim_5.webp', frameWidth: 32, frameHeight: 32 },
  { key: 'guest-anim-6', path: '/sprites/guest_anim_6.webp', frameWidth: 32, frameHeight: 32 },
];

// Static images (no frame dimensions needed)
export const IMAGES = [
  // Backgrounds
  { key: 'office-bg', path: '/backgrounds/office_bg_small.webp' },
  { key: 'office-bg-full', path: '/backgrounds/office_bg.webp' },

  // Furniture static images
  { key: 'desk', path: '/sprites/desk-v3.webp' },
  { key: 'sofa', path: '/sprites/sofa-idle-v3.png' },
  { key: 'sofa-shadow', path: '/sprites/sofa-shadow-v1.png' },
  { key: 'coffee-machine-shadow', path: '/sprites/coffee-machine-shadow-v1.png' },
  { key: 'memo-bg', path: '/sprites/memo-bg.webp' },

  // Guest role static portraits
  { key: 'guest-role-1', path: '/sprites/guest_role_1.png' },
  { key: 'guest-role-2', path: '/sprites/guest_role_2.png' },
  { key: 'guest-role-3', path: '/sprites/guest_role_3.png' },
  { key: 'guest-role-4', path: '/sprites/guest_role_4.png' },
  { key: 'guest-role-5', path: '/sprites/guest_role_5.png' },
  { key: 'guest-role-6', path: '/sprites/guest_role_6.png' },

  // UI button sprites
  { key: 'btn-back-home', path: '/sprites/btn-back-home-sprite.png' },
  { key: 'btn-broker', path: '/sprites/btn-broker-sprite.png' },
  { key: 'btn-diy', path: '/sprites/btn-diy-sprite.png' },
  { key: 'btn-move-house', path: '/sprites/btn-move-house-sprite.png' },
  { key: 'btn-open-drawer', path: '/sprites/btn-open-drawer-sprite.png' },
  { key: 'btn-state', path: '/sprites/btn-state-sprite.png' },
];
