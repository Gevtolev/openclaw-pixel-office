import { Scene } from 'phaser';

export class UIScene extends Scene {
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this.statusText = this.add.text(16, 16, '[待命] Waiting...', {
      fontSize: '12px',
      color: '#ffffff',
      fontFamily: 'ArkPixel, Courier New, monospace',
      backgroundColor: '#00000080',
      padding: { x: 8, y: 4 },
    });
  }

  updateStatus(state: string, message?: string): void {
    const display = message ? `[${state}] ${message}` : `[${state}]`;
    this.statusText.setText(display);
  }
}
