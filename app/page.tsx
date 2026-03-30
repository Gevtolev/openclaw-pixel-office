'use client';

import { PhaserGame } from './pixel-office/PhaserGame';
import { useI18n } from '@/lib/i18n';

export default function Home() {
  const { t } = useI18n();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0' }}>
      <PhaserGame />
      <div style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 12 }}>
        Star {t('office.title')}
      </div>
    </div>
  );
}
