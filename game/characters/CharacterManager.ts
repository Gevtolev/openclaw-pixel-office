import { Scene } from 'phaser';
import type { UnifiedAgentState } from '@/lib/state/types';
import { mapAgentToAction, diffAgents } from '@/game/bridge/AgentBridge';
import { SeatManager } from '@/game/pathfinding/SeatManager';
import { createCollisionMap, pixelToTile, tileToPixel } from '@/game/pathfinding/CollisionMap';
import { AStarGrid } from '@/game/pathfinding/AStarGrid';
import { ZONES } from '@/game/config/layout';
import { getAgentSpriteKey, getAgentTint } from '@/game/characters/AgentCharacter';
import { SUBAGENT_LABEL_STYLE } from '@/game/characters/SubagentCharacter';
import { CodeBubble } from '@/game/effects/CodeBubble';
import { SyncEffect } from '@/game/effects/SyncEffect';
import { BugEffect } from '@/game/effects/BugEffect';

interface ManagedCharacter {
  id: string;
  sprite: Phaser.GameObjects.Sprite;
  nameTag: Phaser.GameObjects.Text;
  subLabel?: Phaser.GameObjects.Text;
  state: UnifiedAgentState;
  path: { x: number; y: number }[] | null;
  pathIndex: number;
  moving: boolean;
  codeBubble?: CodeBubble;
  syncEffect?: SyncEffect;
  bugEffect?: BugEffect;
}

const SUBAGENT_SPEED_MULTIPLIER = 2.8;
const BASE_SPEED = 80;

export class CharacterManager {
  private characters = new Map<string, ManagedCharacter>();
  private prevAgents: UnifiedAgentState[] = [];
  private seatManager = new SeatManager();
  private grid: AStarGrid;
  private scene: Scene;

  constructor(scene: Scene) {
    this.scene = scene;
    this.grid = createCollisionMap();
  }

  syncAgents(agents: UnifiedAgentState[]): void {
    const { added, removed, changed } = diffAgents(this.prevAgents, agents);

    for (const agent of added) {
      this.spawnCharacter(agent);
    }

    for (const agent of removed) {
      this.removeCharacter(agent.id);
    }

    for (const agent of changed) {
      this.updateCharacter(agent);
    }

    this.prevAgents = [...agents];
  }

  private ensureGuestAnim(key: string): void {
    if (this.scene.anims.exists(key)) return;
    const texture = this.scene.textures.get(key);
    if (!texture || texture.frameTotal <= 1) return;
    this.scene.anims.create({
      key,
      frames: this.scene.anims.generateFrameNumbers(key, {
        start: 0,
        end: texture.frameTotal - 2,
      }),
      frameRate: 8,
      repeat: -1,
    });
  }

  private spawnCharacter(agent: UnifiedAgentState): void {
    const spawnPoint =
      agent.role === 'subagent' || agent.role === 'visitor' ? ZONES.door : ZONES.breakroom;

    const spriteKey = agent.role === 'primary' ? 'star-idle' : getAgentSpriteKey(agent.id);

    const sprite = this.scene.add.sprite(spawnPoint.x, spawnPoint.y, spriteKey);
    sprite.setDepth(500);

    if (agent.role !== 'primary') {
      this.ensureGuestAnim(spriteKey);
      if (this.scene.anims.exists(spriteKey)) sprite.play(spriteKey);
      sprite.setTint(getAgentTint(agent.id));
    }

    const nameTag = this.scene.add.text(
      spawnPoint.x,
      spawnPoint.y - 40,
      `${agent.emoji} ${agent.name}`,
      {
        fontSize: '10px',
        color: '#ffffff',
        fontFamily: 'ArkPixel, Courier New, monospace',
        backgroundColor: '#00000080',
        padding: { x: 4, y: 2 },
      }
    );
    nameTag.setOrigin(0.5);
    nameTag.setDepth(501);

    const managed: ManagedCharacter = {
      id: agent.id,
      sprite,
      nameTag,
      state: agent,
      path: null,
      pathIndex: 0,
      moving: false,
    };

    if (agent.role === 'subagent') {
      const subLabel = this.scene.add.text(
        spawnPoint.x,
        spawnPoint.y - 54,
        '临时工',
        SUBAGENT_LABEL_STYLE
      );
      subLabel.setOrigin(0.5);
      subLabel.setDepth(502);
      managed.subLabel = subLabel;
    }

    this.characters.set(agent.id, managed);
    this.updateCharacter(agent);
  }

  private removeCharacter(id: string): void {
    const char = this.characters.get(id);
    if (!char) return;

    this.seatManager.release(id);
    char.sprite.destroy();
    char.nameTag.destroy();
    char.subLabel?.destroy();
    char.codeBubble?.destroy();
    char.syncEffect?.destroy();
    char.bugEffect?.destroy();
    this.characters.delete(id);
  }

  private updateCharacter(agent: UnifiedAgentState): void {
    const char = this.characters.get(agent.id);
    if (!char) return;

    char.state = agent;
    const action = mapAgentToAction(agent);

    switch (action.type) {
      case 'GOTO_SEAT': {
        const seat = this.seatManager.assign(agent.id, agent.role);
        if (seat) this.navigateTo(char, seat.x, seat.y);
        break;
      }
      case 'WANDER': {
        this.seatManager.release(agent.id);
        const wx = ZONES.breakroom.x + Phaser.Math.Between(-100, 100);
        const wy = ZONES.breakroom.y + Phaser.Math.Between(-50, 50);
        this.navigateTo(char, wx, wy);
        break;
      }
      case 'GOTO_ERROR_ZONE': {
        this.seatManager.release(agent.id);
        this.navigateTo(char, ZONES.error.x, ZONES.error.y);
        break;
      }
      case 'PLAY_EFFECT': {
        if (!char.syncEffect?.isActive()) {
          char.syncEffect?.destroy();
          char.syncEffect = new SyncEffect(this.scene, char.sprite.x, char.sprite.y);
        }
        break;
      }
      case 'REMOVE': {
        this.removeCharacter(agent.id);
        return;
      }
      default:
        break;
    }

    const isWorking = ['writing', 'executing', 'researching'].includes(agent.state);
    if (isWorking && !char.codeBubble) {
      char.codeBubble = new CodeBubble(this.scene, char.sprite.x, char.sprite.y);
    } else if (!isWorking && char.codeBubble) {
      char.codeBubble.destroy();
      char.codeBubble = undefined;
    }

    const isError = agent.state === 'error';
    if (isError && !char.bugEffect) {
      char.bugEffect = new BugEffect(this.scene, char.sprite.x, char.sprite.y);
    } else if (!isError && char.bugEffect) {
      char.bugEffect.destroy();
      char.bugEffect = undefined;
    }
  }

  private navigateTo(char: ManagedCharacter, targetX: number, targetY: number): void {
    const start = pixelToTile(char.sprite.x, char.sprite.y);
    const end = pixelToTile(targetX, targetY);
    const path = this.grid.findPath(start.tx, start.ty, end.tx, end.ty);

    if (path) {
      char.path = path;
      char.pathIndex = 0;
      char.moving = true;
    }
  }

  update(delta: number): void {
    for (const char of this.characters.values()) {
      if (char.moving && char.path) {
        const speed =
          char.state.role === 'subagent' ? BASE_SPEED * SUBAGENT_SPEED_MULTIPLIER : BASE_SPEED;
        const target = char.path[char.pathIndex];
        const pixel = tileToPixel(target.x, target.y);

        const dx = pixel.px - char.sprite.x;
        const dy = pixel.py - char.sprite.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 2) {
          char.pathIndex++;
          if (char.pathIndex >= char.path.length) {
            char.moving = false;
            char.path = null;
            char.sprite.x = pixel.px;
            char.sprite.y = pixel.py;
          }
        } else {
          const step = (speed * delta) / 1000;
          char.sprite.x += (dx / dist) * Math.min(step, dist);
          char.sprite.y += (dy / dist) * Math.min(step, dist);
        }
      }

      char.nameTag.setPosition(char.sprite.x, char.sprite.y - 40);
      char.subLabel?.setPosition(char.sprite.x, char.sprite.y - 54);

      char.codeBubble?.update(delta, char.sprite.x, char.sprite.y);
      char.syncEffect?.updatePosition(char.sprite.x, char.sprite.y);
      char.bugEffect?.update(delta, char.sprite.x, char.sprite.y);
    }
  }

}
