'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n, Locale } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { GatewayStatus } from './gateway-status';
import { useState } from 'react';

const NAV_GROUPS = [
  {
    labelKey: 'nav.overview',
    items: [
      { href: '/', labelKey: 'nav.office', icon: '🏠' },
      { href: '/dashboard', labelKey: 'nav.dashboard', icon: '🤖' },
      { href: '/dashboard/models', labelKey: 'nav.models', icon: '🧠' },
    ],
  },
  {
    labelKey: 'nav.monitor',
    items: [
      { href: '/dashboard/sessions', labelKey: 'nav.sessions', icon: '💬' },
      { href: '/dashboard/stats', labelKey: 'nav.stats', icon: '📊' },
      { href: '/dashboard/alerts', labelKey: 'nav.alerts', icon: '🔔' },
    ],
  },
  {
    labelKey: 'nav.config',
    items: [
      { href: '/dashboard/skills', labelKey: 'nav.skills', icon: '⚡' },
    ],
  },
];

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'zh', label: '简中' },
  { code: 'zh-TW', label: '繁中' },
  { code: 'en', label: 'EN' },
  { code: 'ja', label: 'JP' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { t, locale, setLocale } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [experimentExpanded, setExperimentExpanded] = useState(false);

  return (
    <aside
      style={{
        width: collapsed ? 60 : 220,
        minHeight: '100vh',
        background: 'var(--card)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.2s',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 18, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
            {collapsed ? '🦞' : '🦞 OPENCLAW'}
          </span>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>
        {!collapsed && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            PIXEL OFFICE
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey} style={{ marginBottom: 16 }}>
            {!collapsed && (
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  padding: '4px 16px',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                {t(group.labelKey)}
              </div>
            )}
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: collapsed ? '8px 18px' : '8px 16px',
                    color: active ? 'var(--accent)' : 'var(--text)',
                    background: active ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                    textDecoration: 'none',
                    fontSize: 14,
                    borderLeft: active ? '3px solid var(--accent)' : '3px solid transparent',
                  }}
                >
                  <span>{item.icon}</span>
                  {!collapsed && <span>{t(item.labelKey)}</span>}
                </Link>
              );
            })}
          </div>
        ))}
        {/* Experiments accordion */}
        <div style={{ marginBottom: 16 }}>
          <button
            onClick={() => setExperimentExpanded(!experimentExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: collapsed ? '4px 18px' : '4px 16px',
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 11,
              textTransform: 'uppercase' as const,
              letterSpacing: 1,
            }}
          >
            {!collapsed && <span>{t('nav.experiments')}</span>}
            {!collapsed && <span style={{ fontSize: 10 }}>{experimentExpanded ? '▾' : '▸'}</span>}
            {collapsed && <span style={{ fontSize: 14 }}>🧪</span>}
          </button>
          {(experimentExpanded || collapsed) && (
            <Link
              href="/decorate"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: collapsed ? '8px 18px' : '8px 16px',
                color: 'var(--text)',
                background: 'transparent',
                textDecoration: 'none',
                fontSize: 14,
                borderLeft: '3px solid transparent',
              }}
            >
              <span>🎨</span>
              {!collapsed && <span>{t('nav.decorate')}</span>}
            </Link>
          )}
        </div>
      </nav>

      {/* Footer: gateway status + locale + theme */}
      {!collapsed && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: 8 }}>
            <GatewayStatus compact />
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLocale(l.code)}
                style={{
                  padding: '2px 6px',
                  fontSize: 11,
                  background: locale === l.code ? 'var(--accent)' : 'transparent',
                  color: locale === l.code ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 4,
                  cursor: 'pointer',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            onClick={toggleTheme}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 16,
            }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      )}
    </aside>
  );
}
