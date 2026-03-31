const CODE_CHARS = ['{  }', '//·', '=>', ':=', 'fn()', '</>', '···'];

export class CodeBubble {
  private text: Phaser.GameObjects.Text;
  private timer = 0;
  private idx = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.text = scene.add.text(x, y - 60, CODE_CHARS[0], {
      fontSize: '8px',
      color: '#00ff88',
      fontFamily: 'Courier New, monospace',
      backgroundColor: '#00000060',
      padding: { x: 2, y: 1 },
    });
    this.text.setOrigin(0.5);
    this.text.setDepth(600);
    this.text.setAlpha(0.85);
  }

  update(delta: number, x: number, y: number): void {
    this.timer += delta;
    if (this.timer >= 900) {
      this.timer = 0;
      this.idx = (this.idx + 1) % CODE_CHARS.length;
      this.text.setText(CODE_CHARS[this.idx]);
    }
    this.text.setPosition(x, y - 60);
  }

  destroy(): void {
    this.text.destroy();
  }
}
