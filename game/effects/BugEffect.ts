const BUG_COUNT = 3;
const WANDER_RADIUS = 40;
const WANDER_SPEED = 25;

interface Bug {
  sprite: Phaser.GameObjects.Sprite;
  vx: number;
  vy: number;
  wanderTimer: number;
}

export class BugEffect {
  private bugs: Bug[] = [];
  private originX: number;
  private originY: number;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.originX = x;
    this.originY = y;

    if (!scene.textures.exists('error-bug')) return;

    const animKey = 'error-bug-loop';
    if (!scene.anims.exists(animKey)) {
      const texture = scene.textures.get('error-bug');
      scene.anims.create({
        key: animKey,
        frames: scene.anims.generateFrameNumbers('error-bug', {
          start: 0,
          end: texture.frameTotal - 2,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }

    for (let i = 0; i < BUG_COUNT; i++) {
      const bx = x + Phaser.Math.Between(-20, 20);
      const by = y + Phaser.Math.Between(-10, 10);
      const sprite = scene.add.sprite(bx, by, 'error-bug');
      sprite.setScale(0.15);
      sprite.setDepth(800);
      sprite.play(animKey);

      this.bugs.push({
        sprite,
        vx: Phaser.Math.FloatBetween(-1, 1),
        vy: Phaser.Math.FloatBetween(-1, 1),
        wanderTimer: Phaser.Math.Between(500, 1500),
      });
    }
  }

  update(delta: number, x: number, y: number): void {
    this.originX = x;
    this.originY = y;

    for (const bug of this.bugs) {
      bug.wanderTimer -= delta;
      if (bug.wanderTimer <= 0) {
        bug.vx = Phaser.Math.FloatBetween(-1, 1);
        bug.vy = Phaser.Math.FloatBetween(-1, 1);
        bug.wanderTimer = Phaser.Math.Between(500, 1500);
      }

      const step = (WANDER_SPEED * delta) / 1000;
      bug.sprite.x += bug.vx * step;
      bug.sprite.y += bug.vy * step;

      const dx = bug.sprite.x - this.originX;
      const dy = bug.sprite.y - this.originY;
      if (Math.sqrt(dx * dx + dy * dy) > WANDER_RADIUS) {
        bug.sprite.x = this.originX + dx * 0.5;
        bug.sprite.y = this.originY + dy * 0.5;
        bug.vx *= -1;
        bug.vy *= -1;
      }
    }
  }

  destroy(): void {
    for (const bug of this.bugs) bug.sprite.destroy();
    this.bugs = [];
  }
}
