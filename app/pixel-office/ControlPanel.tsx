'use client';

import { useState } from 'react';
import { useI18n } from '@/lib/i18n';

const STATES = [
  { key: 'idle', labelKey: 'control.idle' },
  { key: 'writing', labelKey: 'control.work' },
  { key: 'syncing', labelKey: 'control.sync' },
  { key: 'error', labelKey: 'control.alert' },
] as const;

export function ControlPanel() {
  const { t } = useI18n();
  const [active, setActive] = useState('idle');

  const handleSetState = async (state: string) => {
    setActive(state);
    await fetch('/api/set-state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
    });
  };

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
      <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: 'var(--accent)' }}>
        Star Status
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {STATES.map((s) => (
          <button
            key={s.key}
            onClick={() => handleSetState(s.key)}
            style={{
              padding: '6px 16px',
              background: active === s.key ? 'var(--accent)' : 'var(--bg)',
              color: active === s.key ? '#fff' : 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
            }}
          >
            {t(s.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
