'use client';

import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';

export function MemoCard() {
  const { t } = useI18n();
  const [memo, setMemo] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/yesterday-memo')
      .then((r) => r.json())
      .then((data) => setMemo(data.memo))
      .catch(() => setMemo(null));
  }, []);

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: 16,
        maxWidth: 1280,
        margin: '8px auto',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: 'var(--orange)' }}>
        {t('office.yesterday')}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        {memo || t('office.noMemo')}
      </div>
    </div>
  );
}
