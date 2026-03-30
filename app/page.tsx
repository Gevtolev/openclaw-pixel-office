'use client';

import { PhaserGame } from './pixel-office/PhaserGame';
import { ControlPanel } from './pixel-office/ControlPanel';
import { MemoCard } from './pixel-office/MemoCard';
import { useI18n } from '@/lib/i18n';

export default function Home() {
  const { t } = useI18n();

  return (
    <div style={{ padding: '16px', overflow: 'auto' }}>
      <PhaserGame />
      <ControlPanel />
      <MemoCard />
    </div>
  );
}
