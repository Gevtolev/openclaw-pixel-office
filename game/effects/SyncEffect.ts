export class SyncEffect {
  private sprite: Phaser.GameObjects.Sprite | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    if (!scene.textures.exists('sync-animation')) return;

    const animKey = 'sync-anim-once';
    if (!scene.anims.exists(animKey)) {
      const texture = scene.textures.get('sync-animation');
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers('sync-animation', {
          start: 0,
          end: texture.frameTotal - 2,
        }),
        frameRate: 12,
        repeat: 0,
      });
    }

    this.sprite = scene.add.sprite(x, y, 'sync-animation');
    this.sprite.setDepth(700);
    this.sprite.setScale(0.6);
    this.sprite.play(animKey);
    this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      this.sprite?.destroy();
      this.sprite = null;
    });
  }

  isActive(): boolean {
    return this.sprite !== null && this.sprite.active;
  }

  updatePosition(x: number, y: number): void {
    if (this.sprite?.active) this.sprite.setPosition(x, y);
  }

  destroy(): void {
    this.sprite?.destroy();
    this.sprite = null;
  }
}
