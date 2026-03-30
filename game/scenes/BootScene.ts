import { Scene } from 'phaser';
import { SPRITES, IMAGES } from '@/game/config/sprites';
import { GAME_WIDTH, GAME_HEIGHT } from '@/game/config/layout';

export class BootScene extends Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Progress bar background
    const barBg = this.add.rectangle(cx, cy, 400, 20, 0x333344);
    const barFill = this.add.rectangle(cx - 200, cy, 0, 20, 0x9b72cf);
    barFill.setOrigin(0, 0.5);

    const loadingText = this.add.text(cx, cy - 32, '正在进入像素办公室…', {
      fontSize: '16px',
      color: '#ccaaee',
      fontFamily: 'ArkPixel, Courier New, monospace',
    });
    loadingText.setOrigin(0.5, 0.5);

    const percentText = this.add.text(cx, cy + 20, '0%', {
      fontSize: '12px',
      color: '#aaaacc',
      fontFamily: 'ArkPixel, Courier New, monospace',
    });
    percentText.setOrigin(0.5, 0);

    this.load.on('progress', (value: number) => {
      barFill.width = 400 * value;
      percentText.setText(`${Math.floor(value * 100)}%`);
    });

    this.load.on('complete', () => {
      barBg.destroy();
      barFill.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Load all spritesheets (have frameWidth/frameHeight)
    for (const sprite of SPRITES) {
      if (sprite.frameWidth && sprite.frameHeight) {
        this.load.spritesheet(sprite.key, sprite.path, {
          frameWidth: sprite.frameWidth,
          frameHeight: sprite.frameHeight,
        });
      } else {
        this.load.image(sprite.key, sprite.path);
      }
    }

    // Load all static images
    for (const image of IMAGES) {
      this.load.image(image.key, image.path);
    }
  }

  create(): void {
    this.scene.start('OfficeScene');
    this.scene.start('UIScene');
  }
}
