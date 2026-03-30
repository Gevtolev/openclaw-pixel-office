'use client';

import { PhaserGame } from './pixel-office/PhaserGame';
import { ControlPanel } from './pixel-office/ControlPanel';
import { MemoCard } from './pixel-office/MemoCard';

export default function Home() {
  return (
    <div style={{ padding: '16px', overflow: 'auto' }}>
      <PhaserGame />
      <ControlPanel />
      <MemoCard />
    </div>
  );
}
