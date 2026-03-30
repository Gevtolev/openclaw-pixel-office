import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FURNITURE, NAMEPLATE } from '@/game/config/layout';

// Helper: create a looping animation if the texture has multiple frames
function createLoopAnim(scene: Scene, key: string): Phaser.Animations.Animation | false {
  if (!scene.textures.exists(key)) return false;
  const texture = scene.textures.get(key);
  if (texture.frameTotal <= 1) return false;
  if (scene.anims.exists(key)) return scene.anims.get(key);
  return scene.anims.create({
    key,
    frames: scene.anims.generateFrameNumbers(key, { start: 0, end: texture.frameTotal - 2 }),
    frameRate: 8,
    repeat: -1,
  }) as Phaser.Animations.Animation;
}

// Helper: add a sprite/image at a position, play animation if available
function addSprite(
  scene: Scene,
  key: string,
  x: number,
  y: number,
  options: { depth?: number; scale?: number; originX?: number; originY?: number } = {}
): Phaser.GameObjects.Sprite | Phaser.GameObjects.Image | null {
  if (!scene.textures.exists(key)) return null;

  const { depth = 0, scale = 1, originX = 0.5, originY = 0.5 } = options;
  const anim = createLoopAnim(scene, key);

  if (anim) {
    const sprite = scene.add.sprite(x, y, key);
    sprite.setOrigin(originX, originY);
    sprite.setScale(scale);
    sprite.setDepth(depth);
    sprite.play(key);
    return sprite;
  }

  const img = scene.add.image(x, y, key);
  img.setOrigin(originX, originY);
  img.setScale(scale);
  img.setDepth(depth);
  return img;
}

export class OfficeScene extends Scene {
  constructor() {
    super({ key: 'OfficeScene' });
  }

  create(): void {
    // Background image filling full canvas
    const bg = this.add.image(0, 0, 'office-bg-full');
    bg.setOrigin(0, 0);
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
    bg.setDepth(0);

    // Sofa shadow (behind sofa)
    if (this.textures.exists('sofa-shadow')) {
      const sofaShadow = this.add.image(
        FURNITURE.sofa.x,
        FURNITURE.sofa.y,
        'sofa-shadow'
      );
      sofaShadow.setOrigin(FURNITURE.sofa.originX, FURNITURE.sofa.originY);
      sofaShadow.setDepth(FURNITURE.sofa.depth - 1);
    }

    // Sofa
    addSprite(this, 'sofa', FURNITURE.sofa.x, FURNITURE.sofa.y, {
      depth: FURNITURE.sofa.depth,
      originX: FURNITURE.sofa.originX,
      originY: FURNITURE.sofa.originY,
    });

    // Desk
    addSprite(this, 'desk', FURNITURE.desk.x, FURNITURE.desk.y, {
      depth: FURNITURE.desk.depth,
    });

    // Flower / flowers-bloom animation
    addSprite(this, 'flowers-bloom', FURNITURE.flower.x, FURNITURE.flower.y, {
      depth: FURNITURE.flower.depth,
      scale: FURNITURE.flower.scale,
    });

    // Star working at desk
    addSprite(this, 'star-working', FURNITURE.starWorking.x, FURNITURE.starWorking.y, {
      depth: FURNITURE.starWorking.depth,
      scale: FURNITURE.starWorking.scale,
    });

    // Coffee machine shadow
    if (this.textures.exists('coffee-machine-shadow')) {
      const cmShadow = this.add.image(
        FURNITURE.coffeeMachine.x,
        FURNITURE.coffeeMachine.y,
        'coffee-machine-shadow'
      );
      cmShadow.setDepth(FURNITURE.coffeeMachine.depth - 1);
    }

    // Coffee machine
    addSprite(this, 'coffee-machine', FURNITURE.coffeeMachine.x, FURNITURE.coffeeMachine.y, {
      depth: FURNITURE.coffeeMachine.depth,
    });

    // Server room
    addSprite(this, 'serverroom', FURNITURE.serverroom.x, FURNITURE.serverroom.y, {
      depth: FURNITURE.serverroom.depth,
    });

    // Error bug animation
    addSprite(this, 'error-bug', FURNITURE.errorBug.x, FURNITURE.errorBug.y, {
      depth: FURNITURE.errorBug.depth,
      scale: FURNITURE.errorBug.scale,
    });

    // Sync animation
    addSprite(this, 'sync-animation', FURNITURE.syncAnim.x, FURNITURE.syncAnim.y, {
      depth: FURNITURE.syncAnim.depth,
    });

    // Cat
    addSprite(this, 'cats', FURNITURE.cat.x, FURNITURE.cat.y, {
      depth: FURNITURE.cat.depth,
    });

    // Plants (array of positions)
    for (const plant of FURNITURE.plants) {
      addSprite(this, 'plants', plant.x, plant.y, {
        depth: plant.depth,
      });
    }

    // Nameplate bar at bottom
    this.add
      .rectangle(NAMEPLATE.x, NAMEPLATE.y, NAMEPLATE.width, NAMEPLATE.height, 0x1a1a2e, 0.85)
      .setDepth(9000);

    this.add
      .text(NAMEPLATE.x, NAMEPLATE.y, 'Star / 像素办公室', {
        fontSize: '14px',
        color: '#e8d5ff',
        fontFamily: 'ArkPixel, Courier New, monospace',
      })
      .setOrigin(0.5, 0.5)
      .setDepth(9001);
  }
}
