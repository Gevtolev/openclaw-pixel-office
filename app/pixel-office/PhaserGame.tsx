'use client';

import { useEffect, useRef } from 'react';
import type Phaser from 'phaser';

interface PhaserGameProps {
  onSceneReady?: (scene: Phaser.Scene) => void;
}

export function PhaserGame({ onSceneReady }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameRef.current || !containerRef.current) return;

    // Dynamic import Phaser (it accesses `window` so must be client-only)
    import('phaser').then((Phaser) => {
      // Dynamic import scenes
      Promise.all([
        import('@/game/scenes/BootScene'),
        import('@/game/scenes/OfficeScene'),
        import('@/game/scenes/UIScene'),
      ]).then(([{ BootScene }, { OfficeScene }, { UIScene }]) => {
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: 1280,
          height: 720,
          parent: containerRef.current!,
          pixelArt: true,
          physics: {
            default: 'arcade',
            arcade: { gravity: { x: 0, y: 0 }, debug: false },
          },
          scene: [BootScene, OfficeScene, UIScene],
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
        };

        gameRef.current = new Phaser.Game(config);

        if (onSceneReady) {
          gameRef.current.events.on('ready', () => {
            const scene = gameRef.current?.scene.getScene('OfficeScene');
            if (scene) onSceneReady(scene);
          });
        }
      });
    });

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onSceneReady]);

  return (
    <div
      ref={containerRef}
      style={{
        width: 1280,
        maxWidth: '100%',
        aspectRatio: '1280 / 720',
        imageRendering: 'pixelated',
        margin: '0 auto',
        boxShadow: 'inset 0 0 0 4px #64477d',
      }}
    />
  );
}
