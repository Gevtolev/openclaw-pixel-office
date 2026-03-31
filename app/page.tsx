'use client';

import { PhaserGame } from './pixel-office/PhaserGame';
import { ControlPanel } from './pixel-office/ControlPanel';
import { MemoCard } from './pixel-office/MemoCard';
import { AssetSidebar } from './pixel-office/AssetSidebar';

export default function Home() {
  return (
    <div style={{ padding: '16px', overflow: 'auto' }}>
      <PhaserGame />
      <ControlPanel />
      <MemoCard />
      <AssetSidebar />
    </div>
  );
}
