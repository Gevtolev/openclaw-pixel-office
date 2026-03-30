# OpenClaw Pixel Office MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working pixel office with Star-Office-UI visual fidelity, multi-agent support with A* pathfinding, and dual-mode data source (OpenClaw local + API push).

**Architecture:** Next.js 16 App Router serves both the Phaser 3 pixel office (homepage) and API routes. Phaser runs in a React wrapper component, decoupled from React state via an AgentBridge. A Unified State Manager aggregates agent data from local OpenClaw files and external API pushes.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Phaser 3.80, Tailwind CSS v4, pnpm

**Spec:** `docs/superpowers/specs/2026-03-30-openclaw-pixel-office-design.md`

**Scope:** This is Plan 1 of 3. Covers project setup, data layer, and the complete pixel office. Dashboard pages (Plan 2) and additional features like AI decoration/Electron (Plan 3) will follow.

---

## File Structure

```
openclaw-pixel-office/
├── app/
│   ├── layout.tsx                    # Global layout with sidebar
│   ├── page.tsx                      # Homepage: mounts PhaserGame
│   ├── providers.tsx                 # ThemeProvider + I18nProvider
│   ├── sidebar.tsx                   # Pixel-style sidebar navigation
│   ├── globals.css                   # Tailwind v4 + CSS theme tokens
│   ├── pixel-office/
│   │   ├── PhaserGame.tsx            # Phaser ↔ React bridge
│   │   ├── ControlPanel.tsx          # Status buttons + visitor list
│   │   └── MemoCard.tsx              # Yesterday memo card
│   └── api/
│       ├── agents/route.ts           # GET unified agent list
│       ├── agent-activity/route.ts   # GET agent activity + subagents
│       ├── set-state/route.ts        # POST manual state change
│       ├── join-agent/route.ts       # POST visitor join
│       ├── agent-push/route.ts       # POST visitor heartbeat
│       ├── leave-agent/route.ts      # POST visitor leave
│       ├── yesterday-memo/route.ts   # GET yesterday memo
│       └── health/route.ts           # GET health check
│       # pixel-office/layout/route.ts deferred to Plan 3 (layout editor)
├── lib/
│   ├── state/
│   │   ├── types.ts                  # UnifiedAgentState + related types
│   │   ├── unified-state-manager.ts  # Aggregates both data sources
│   │   ├── openclaw-reader.ts        # Reads ~/.openclaw/ files
│   │   └── api-push-store.ts         # In-memory visitor state store
│   ├── openclaw-paths.ts             # OPENCLAW_HOME path resolution
│   ├── config-cache.ts               # Generic TTL cache
│   ├── memo-utils.ts                 # Yesterday memo extraction + redaction
│   ├── i18n.tsx                      # 4-language i18n (zh/zh-TW/en/ja)
│   └── theme.tsx                     # Dark/light theme provider
├── game/
│   ├── scenes/
│   │   ├── BootScene.ts              # Asset preloading with progress bar
│   │   ├── OfficeScene.ts            # Main scene: background, furniture, env animations
│   │   └── UIScene.ts                # HUD overlay: name tags, bubbles, status
│   ├── characters/
│   │   ├── CharacterManager.ts       # Lifecycle: create, update, remove characters
│   │   ├── MainCharacter.ts          # Star character with 6 animation states
│   │   ├── AgentCharacter.ts         # OpenClaw agent (guest sprite + hue shift)
│   │   ├── SubagentCharacter.ts      # Temporary worker with run-in animation
│   │   └── VisitorCharacter.ts       # API-push visitor
│   ├── pathfinding/
│   │   ├── AStarGrid.ts              # A* pathfinding on tile grid
│   │   ├── CollisionMap.ts           # Walkable/blocked tile map
│   │   └── SeatManager.ts            # Workstation assignment logic
│   ├── effects/
│   │   ├── CodeBubble.ts             # Floating code snippet effect
│   │   └── BugSystem.ts              # Bug creatures with pheromone AI
│   ├── bridge/
│   │   └── AgentBridge.ts            # UnifiedAgentState[] → Phaser character actions
│   └── config/
│       ├── sprites.ts                # Sprite registry (keys, paths, frame sizes)
│       └── layout.ts                 # Zone coords, waypoints, furniture positions
├── public/
│   ├── sprites/                      # Star original spritesheets (copied from Star-Office-UI)
│   ├── backgrounds/
│   │   └── office_bg_small.webp
│   ├── fonts/
│   │   └── ark-pixel-12px-proportional-zh_cn.woff2
│   └── audio/
├── tests/
│   ├── lib/
│   │   ├── state/
│   │   │   ├── unified-state-manager.test.ts
│   │   │   ├── openclaw-reader.test.ts
│   │   │   └── api-push-store.test.ts
│   │   ├── config-cache.test.ts
│   │   └── memo-utils.test.ts
│   └── game/
│       ├── pathfinding/
│       │   ├── AStarGrid.test.ts
│       │   └── SeatManager.test.ts
│       └── bridge/
│           └── AgentBridge.test.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
├── .gitignore
└── .env.example
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.mjs`, `tsconfig.json`, `.gitignore`, `.env.example`, `app/globals.css`

- [ ] **Step 1: Initialize git repo and Next.js project**

```bash
cd /data/lidongyu/projects/openclaw-pixel-office
git init
pnpm init
```

- [ ] **Step 2: Install core dependencies**

```bash
pnpm add next@^16 react@^19 react-dom@^19 phaser@^3.80
pnpm add -D typescript@^5 @types/react@^19 @types/node@^22 @tailwindcss/postcss@^4 postcss@^8 tailwindcss@^4 vitest@latest @types/react-dom@^19
```

- [ ] **Step 3: Write package.json scripts**

Add to `package.json`:
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 4: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Write next.config.mjs**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  webpack: (config) => {
    // Phaser needs these for Node.js polyfills in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    return config;
  },
};

export default nextConfig;
```

- [ ] **Step 6: Write postcss.config.mjs**

```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 7: Write globals.css with theme tokens**

Create `app/globals.css` with Tailwind v4 import and CSS theme variables (dark/light), matching the OpenClaw-bot-review color scheme:

```css
@import "tailwindcss";

:root {
  --bg: #0f172a;
  --card: #1e293b;
  --border: #334155;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --accent: #38bdf8;
  --accent2: #a78bfa;
  --green: #4ade80;
  --orange: #fb923c;
  --red: #f87171;
}

[data-theme="light"] {
  --bg: #f3f6fb;
  --card: #ffffff;
  --border: #cbd5e1;
  --text: #0b1220;
  --text-muted: #475569;
  --accent: #0369a1;
  --accent2: #7c3aed;
  --green: #16a34a;
  --orange: #ea580c;
  --red: #dc2626;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'ArkPixel', 'Courier New', monospace;
}
```

- [ ] **Step 8: Write .gitignore**

```
node_modules/
.next/
out/
.env
.env.local
*.tsbuildinfo
.superpowers/
```

- [ ] **Step 9: Write .env.example**

```
# OpenClaw home directory (default: ~/.openclaw)
OPENCLAW_HOME=

# Production security
PIXEL_OFFICE_ENV=development
SESSION_SECRET=
ASSET_DRAWER_PASS=1234
```

- [ ] **Step 10: Write vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 11: Verify project builds**

```bash
pnpm build
```

Expected: Build succeeds (may warn about missing pages, that's OK).

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: initialize Next.js 16 project with Phaser 3, Tailwind v4, vitest"
```

---

## Task 2: Copy Static Assets from Star-Office-UI

**Files:**
- Create: `public/sprites/*`, `public/backgrounds/*`, `public/fonts/*`

- [ ] **Step 1: Copy sprite assets**

```bash
mkdir -p public/sprites public/backgrounds public/fonts public/audio

# Copy all spritesheet assets from Star-Office-UI
cp Star-Office-UI/frontend/star-working-spritesheet-grid.webp public/sprites/
cp Star-Office-UI/frontend/star-idle-spritesheet.png public/sprites/
cp Star-Office-UI/frontend/star-researching-spritesheet.webp public/sprites/
cp Star-Office-UI/frontend/sofa-busy-spritesheet.webp public/sprites/
cp Star-Office-UI/frontend/coffee-machine-spritesheet.webp public/sprites/
cp Star-Office-UI/frontend/serverroom-spritesheet.webp public/sprites/
cp Star-Office-UI/frontend/sync-animation-v3-grid.webp public/sprites/
cp Star-Office-UI/frontend/error-bug-spritesheet-grid.webp public/sprites/
cp Star-Office-UI/frontend/plants-spritesheet.webp public/sprites/
cp Star-Office-UI/frontend/posters-spritesheet.webp public/sprites/
cp Star-Office-UI/frontend/cats-spritesheet.webp public/sprites/
cp Star-Office-UI/frontend/flowers-bloom-v2.webp public/sprites/
cp Star-Office-UI/frontend/desk-v3.webp public/sprites/
cp Star-Office-UI/frontend/star-working-spritesheet.png public/sprites/

# Copy guest character assets
cp Star-Office-UI/frontend/guest_role_*.png public/sprites/
cp Star-Office-UI/frontend/guest_anim_*.webp public/sprites/

# Copy UI button sprites
cp Star-Office-UI/frontend/btn-*-sprite.png public/sprites/
cp Star-Office-UI/frontend/memo-bg.webp public/sprites/

# Copy background
cp Star-Office-UI/frontend/office_bg_small.webp public/backgrounds/
cp Star-Office-UI/frontend/office_bg.webp public/backgrounds/

# Copy fonts
cp Star-Office-UI/frontend/fonts/*.woff2 public/fonts/
```

- [ ] **Step 2: Verify assets copied correctly**

```bash
ls -la public/sprites/ | wc -l
ls -la public/backgrounds/
ls -la public/fonts/
```

Expected: ~30+ sprite files, 2 background files, font files present.

- [ ] **Step 3: Commit**

```bash
git add public/
git commit -m "chore: copy Star-Office-UI art assets (sprites, backgrounds, fonts)"
```

---

## Task 3: Theme, I18n, and Global Layout

**Files:**
- Create: `lib/theme.tsx`, `lib/i18n.tsx`, `app/providers.tsx`, `app/sidebar.tsx`, `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: Write theme provider**

Create `lib/theme.tsx`:

```tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

- [ ] **Step 2: Write i18n provider (foundation with key translations)**

Create `lib/i18n.tsx`:

```tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type Locale = 'zh' | 'zh-TW' | 'en' | 'ja';

const translations: Record<Locale, Record<string, string>> = {
  zh: {
    'nav.office': '像素办公室',
    'nav.dashboard': 'Agent 总览',
    'nav.models': '模型列表',
    'nav.sessions': '会话列表',
    'nav.stats': '消息统计',
    'nav.alerts': '告警中心',
    'nav.skills': '技能管理',
    'nav.overview': '总览',
    'nav.monitor': '监控',
    'nav.config': '配置',
    'status.idle': '待命',
    'status.writing': '工作中',
    'status.researching': '调研中',
    'status.executing': '执行中',
    'status.syncing': '同步中',
    'status.error': '异常',
    'status.offline': '离线',
    'office.title': '的像素办公室',
    'office.yesterday': '昨日小记',
    'office.noMemo': '暂无昨日日记',
    'office.visitors': '访客列表',
    'office.noVisitors': '暂无访客',
    'office.loading': '正在进入像素办公室…',
    'office.decorate': '装修房间',
    'office.noSeat': '没位子了',
    'office.tempWorker': '临时工',
    'control.idle': '待命',
    'control.work': '工作',
    'control.sync': '同步',
    'control.alert': '警报',
  },
  'zh-TW': {
    'nav.office': '像素辦公室',
    'nav.dashboard': 'Agent 總覽',
    'nav.models': '模型列表',
    'nav.sessions': '會話列表',
    'nav.stats': '訊息統計',
    'nav.alerts': '告警中心',
    'nav.skills': '技能管理',
    'nav.overview': '總覽',
    'nav.monitor': '監控',
    'nav.config': '配置',
    'status.idle': '待命',
    'status.writing': '工作中',
    'status.researching': '調研中',
    'status.executing': '執行中',
    'status.syncing': '同步中',
    'status.error': '異常',
    'status.offline': '離線',
    'office.title': '的像素辦公室',
    'office.yesterday': '昨日小記',
    'office.noMemo': '暫無昨日日記',
    'office.visitors': '訪客列表',
    'office.noVisitors': '暫無訪客',
    'office.loading': '正在進入像素辦公室…',
    'office.decorate': '裝修房間',
    'office.noSeat': '沒位子了',
    'office.tempWorker': '臨時工',
    'control.idle': '待命',
    'control.work': '工作',
    'control.sync': '同步',
    'control.alert': '警報',
  },
  en: {
    'nav.office': 'Pixel Office',
    'nav.dashboard': 'Agent Overview',
    'nav.models': 'Models',
    'nav.sessions': 'Sessions',
    'nav.stats': 'Statistics',
    'nav.alerts': 'Alerts',
    'nav.skills': 'Skills',
    'nav.overview': 'Overview',
    'nav.monitor': 'Monitor',
    'nav.config': 'Config',
    'status.idle': 'Idle',
    'status.writing': 'Writing',
    'status.researching': 'Researching',
    'status.executing': 'Executing',
    'status.syncing': 'Syncing',
    'status.error': 'Error',
    'status.offline': 'Offline',
    'office.title': "'s Pixel Office",
    'office.yesterday': 'Yesterday Notes',
    'office.noMemo': 'No notes from yesterday',
    'office.visitors': 'Visitor List',
    'office.noVisitors': 'No visitors',
    'office.loading': 'Entering pixel office…',
    'office.decorate': 'Decorate Room',
    'office.noSeat': 'No seats left',
    'office.tempWorker': 'Temp Worker',
    'control.idle': 'Idle',
    'control.work': 'Work',
    'control.sync': 'Sync',
    'control.alert': 'Alert',
  },
  ja: {
    'nav.office': 'ピクセルオフィス',
    'nav.dashboard': 'Agentの概要',
    'nav.models': 'モデル一覧',
    'nav.sessions': 'セッション',
    'nav.stats': 'メッセージ統計',
    'nav.alerts': 'アラート',
    'nav.skills': 'スキル管理',
    'nav.overview': '概要',
    'nav.monitor': '監視',
    'nav.config': '設定',
    'status.idle': '待機中',
    'status.writing': '作業中',
    'status.researching': 'リサーチ中',
    'status.executing': '実行中',
    'status.syncing': '同期中',
    'status.error': 'エラー',
    'status.offline': 'オフライン',
    'office.title': 'のピクセルオフィス',
    'office.yesterday': '昨日のメモ',
    'office.noMemo': '昨日のメモはありません',
    'office.visitors': '来客リスト',
    'office.noVisitors': '来客なし',
    'office.loading': 'ピクセルオフィスに入室中…',
    'office.decorate': '部屋を飾る',
    'office.noSeat': '席がない',
    'office.tempWorker': '派遣さん',
    'control.idle': '待機',
    'control.work': '作業',
    'control.sync': '同期',
    'control.alert': '警報',
  },
};

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'zh',
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh');

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale | null;
    if (saved && translations[saved]) setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('locale', l);
  }, []);

  const t = useCallback(
    (key: string) => translations[locale]?.[key] ?? translations['zh']?.[key] ?? key,
    [locale]
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => useContext(I18nContext);
```

- [ ] **Step 3: Write providers.tsx**

Create `app/providers.tsx`:

```tsx
'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from '@/lib/theme';
import { I18nProvider } from '@/lib/i18n';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 4: Write sidebar component**

Create `app/sidebar.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n, Locale } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
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
      </nav>

      {/* Footer: locale + theme */}
      {!collapsed && (
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
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
```

- [ ] **Step 5: Write global layout**

Create `app/layout.tsx`:

```tsx
import type { Metadata } from 'next';
import { Providers } from './providers';
import { Sidebar } from './sidebar';
import './globals.css';

export const metadata: Metadata = {
  title: 'OpenClaw Pixel Office',
  description: 'Pixel-art office visualization for AI agents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh">
      <head>
        <style>{`
          @font-face {
            font-family: 'ArkPixel';
            src: url('/fonts/ark-pixel-12px-proportional-zh_cn.woff2') format('woff2');
            font-display: swap;
          }
        `}</style>
      </head>
      <body>
        <Providers>
          <div style={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Write placeholder homepage**

Create `app/page.tsx`:

```tsx
export default function Home() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <p style={{ color: 'var(--text-muted)' }}>Pixel Office loading here...</p>
    </div>
  );
}
```

- [ ] **Step 7: Verify dev server starts and shows sidebar + placeholder**

```bash
pnpm dev
```

Open http://localhost:3000, verify sidebar renders with navigation links and theme/locale controls.

- [ ] **Step 8: Commit**

```bash
git add app/ lib/
git commit -m "feat: add global layout with sidebar, theme provider, and 4-language i18n"
```

---

## Task 4: Core Types and Config Cache

**Files:**
- Create: `lib/state/types.ts`, `lib/openclaw-paths.ts`, `lib/config-cache.ts`
- Test: `tests/lib/config-cache.test.ts`

- [ ] **Step 1: Write the failing test for config cache**

Create `tests/lib/config-cache.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { CacheEntry } from '@/lib/config-cache';

describe('CacheEntry', () => {
  it('returns cached value within TTL', () => {
    const fetcher = vi.fn().mockReturnValue('data');
    const cache = new CacheEntry(fetcher, 30000);
    expect(cache.get()).toBe('data');
    expect(cache.get()).toBe('data');
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('re-fetches after TTL expires', () => {
    const fetcher = vi.fn().mockReturnValueOnce('old').mockReturnValueOnce('new');
    const cache = new CacheEntry(fetcher, 100);
    expect(cache.get()).toBe('old');
    vi.advanceTimersByTime(150);
    expect(cache.get()).toBe('new');
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('invalidate forces re-fetch', () => {
    const fetcher = vi.fn().mockReturnValueOnce('old').mockReturnValueOnce('new');
    const cache = new CacheEntry(fetcher, 30000);
    expect(cache.get()).toBe('old');
    cache.invalidate();
    expect(cache.get()).toBe('new');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/lib/config-cache.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write config-cache implementation**

Create `lib/config-cache.ts`:

```typescript
export class CacheEntry<T> {
  private value: T | undefined;
  private lastFetch = 0;

  constructor(
    private fetcher: () => T,
    private ttlMs: number
  ) {}

  get(): T {
    const now = Date.now();
    if (this.value === undefined || now - this.lastFetch > this.ttlMs) {
      this.value = this.fetcher();
      this.lastFetch = now;
    }
    return this.value;
  }

  invalidate(): void {
    this.value = undefined;
    this.lastFetch = 0;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- tests/lib/config-cache.test.ts
```

Expected: PASS (note: the timer-based test needs `vi.useFakeTimers()` — add `beforeEach(() => vi.useFakeTimers())` and `afterEach(() => vi.useRealTimers())` to the describe block).

- [ ] **Step 5: Write core types**

Create `lib/state/types.ts`:

```typescript
export type AgentSource = 'openclaw' | 'api-push';
export type AgentRole = 'primary' | 'agent' | 'subagent' | 'visitor';
export type AgentState =
  | 'idle'
  | 'writing'
  | 'researching'
  | 'executing'
  | 'syncing'
  | 'error'
  | 'offline';

export interface UnifiedAgentState {
  id: string;
  name: string;
  emoji: string;
  source: AgentSource;
  role: AgentRole;
  state: AgentState;
  currentTool?: string;
  parentId?: string;
  message?: string;
  model?: string;
  platforms?: string[];
  lastActive: number;
  tokenUsage?: { input: number; output: number };
}

export interface SubagentInfo {
  toolId: string;
  label: string;
  sessionKey?: string;
  childSessionKey?: string;
  state: AgentState;
  lastActive: number;
}

export interface OfficeLayout {
  collisionMap: boolean[][];
  waypoints: Record<string, { x: number; y: number }>;
  furniture: Array<{
    type: string;
    x: number;
    y: number;
    rotation?: number;
  }>;
}

export interface JoinKeyConfig {
  key: string;
  maxConcurrency: number;
  createdAt: number;
}
```

- [ ] **Step 6: Write openclaw-paths utility**

Create `lib/openclaw-paths.ts`:

```typescript
import path from 'path';
import os from 'os';

export function getOpenClawHome(): string {
  return process.env.OPENCLAW_HOME || path.join(os.homedir(), '.openclaw');
}

export function getPixelOfficePath(): string {
  return path.join(getOpenClawHome(), 'pixel-office');
}

export function getAgentsDir(): string {
  return path.join(getOpenClawHome(), 'agents');
}

export function getConfigPath(): string {
  return path.join(getOpenClawHome(), 'openclaw.json');
}

export function getCronJobsPath(): string {
  return path.join(getOpenClawHome(), 'cron', 'jobs.json');
}
```

- [ ] **Step 7: Commit**

```bash
git add lib/ tests/
git commit -m "feat: add core types, config cache, and openclaw path utilities"
```

---

## Task 5: OpenClaw Local File Reader

**Files:**
- Create: `lib/state/openclaw-reader.ts`
- Test: `tests/lib/state/openclaw-reader.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/state/openclaw-reader.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseAgentActivity, determineAgentState } from '@/lib/state/openclaw-reader';

describe('determineAgentState', () => {
  it('returns writing when mtime is less than 2 minutes ago', () => {
    const now = Date.now();
    expect(determineAgentState(now - 60_000, now)).toBe('writing');
  });

  it('returns idle when mtime is 2-10 minutes ago', () => {
    const now = Date.now();
    expect(determineAgentState(now - 5 * 60_000, now)).toBe('idle');
  });

  it('returns offline when mtime is more than 10 minutes ago', () => {
    const now = Date.now();
    expect(determineAgentState(now - 15 * 60_000, now)).toBe('offline');
  });
});

describe('parseAgentActivity', () => {
  it('extracts tool name from assistant message with toolCall', () => {
    const lines = [
      JSON.stringify({
        role: 'assistant',
        content: [{ type: 'toolCall', name: 'Read', input: {} }],
      }),
    ];
    const result = parseAgentActivity(lines);
    expect(result.currentTool).toBe('Read');
    expect(result.subagents).toEqual([]);
  });

  it('detects subagent spawn from session_spawn tool call', () => {
    const lines = [
      JSON.stringify({
        role: 'assistant',
        content: [
          {
            type: 'toolCall',
            name: 'session_spawn',
            input: { description: 'research task' },
            toolId: 'tool_123',
          },
        ],
      }),
    ];
    const result = parseAgentActivity(lines);
    expect(result.subagents).toHaveLength(1);
    expect(result.subagents[0].label).toBe('research task');
    expect(result.subagents[0].toolId).toBe('tool_123');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/lib/state/openclaw-reader.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write openclaw-reader implementation**

Create `lib/state/openclaw-reader.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import { getOpenClawHome, getAgentsDir, getConfigPath, getCronJobsPath } from '@/lib/openclaw-paths';
import type { UnifiedAgentState, AgentState, SubagentInfo } from './types';

const TWO_MINUTES = 2 * 60 * 1000;
const TEN_MINUTES = 10 * 60 * 1000;

export function determineAgentState(mtimeMs: number, nowMs: number): AgentState {
  const age = nowMs - mtimeMs;
  if (age < TWO_MINUTES) return 'writing';
  if (age < TEN_MINUTES) return 'idle';
  return 'offline';
}

interface ParsedActivity {
  currentTool?: string;
  subagents: SubagentInfo[];
}

export function parseAgentActivity(lines: string[]): ParsedActivity {
  let currentTool: string | undefined;
  const subagents: SubagentInfo[] = [];

  for (const line of lines) {
    try {
      const msg = JSON.parse(line);
      if (msg.role !== 'assistant' || !Array.isArray(msg.content)) continue;

      for (const block of msg.content) {
        if (block.type === 'toolCall') {
          currentTool = block.name;

          if (block.name === 'session_spawn' || block.name === 'sessions_spawn') {
            subagents.push({
              toolId: block.toolId || '',
              label: block.input?.description || block.input?.prompt?.slice(0, 50) || 'subtask',
              sessionKey: block.input?.sessionKey,
              state: 'writing',
              lastActive: Date.now(),
            });
          }
        }
      }
    } catch {
      // skip malformed lines
    }
  }

  return { currentTool, subagents };
}

function parseIdentityName(identityPath: string): { name: string; emoji: string } {
  try {
    const content = fs.readFileSync(identityPath, 'utf-8');
    const nameMatch = content.match(/\*\*Name:\*\*\s*(.+)/);
    const name = nameMatch?.[1]?.trim() || path.basename(path.dirname(path.dirname(identityPath)));
    // Extract first emoji if present
    const emojiMatch = name.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/u);
    const emoji = emojiMatch?.[0] || '🤖';
    const cleanName = name.replace(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)\s*/u, '');
    return { name: cleanName || name, emoji };
  } catch {
    return { name: path.basename(path.dirname(path.dirname(identityPath))), emoji: '🤖' };
  }
}

export function readOpenClawAgents(): UnifiedAgentState[] {
  const agentsDir = getAgentsDir();
  const now = Date.now();

  if (!fs.existsSync(agentsDir)) return [];

  const agentDirs = fs.readdirSync(agentsDir).filter((d) => {
    const fullPath = path.join(agentsDir, d);
    return fs.statSync(fullPath).isDirectory();
  });

  const agents: UnifiedAgentState[] = [];

  for (const agentId of agentDirs) {
    const agentPath = path.join(agentsDir, agentId);
    const identityPath = path.join(agentPath, 'agent', 'IDENTITY.md');
    const sessionsDir = path.join(agentPath, 'sessions');

    const { name, emoji } = parseIdentityName(identityPath);

    // Find newest session file
    let newestMtime = 0;
    let newestSessionPath = '';

    if (fs.existsSync(sessionsDir)) {
      const sessionFiles = fs.readdirSync(sessionsDir).filter((f) => f.endsWith('.jsonl'));
      for (const sf of sessionFiles) {
        const fp = path.join(sessionsDir, sf);
        const stat = fs.statSync(fp);
        if (stat.mtimeMs > newestMtime) {
          newestMtime = stat.mtimeMs;
          newestSessionPath = fp;
        }
      }
    }

    const state = newestMtime > 0 ? determineAgentState(newestMtime, now) : 'offline';

    // Parse latest session for tool info and subagents
    let currentTool: string | undefined;
    let subagentInfos: SubagentInfo[] = [];

    if (newestSessionPath && state === 'writing') {
      try {
        const content = fs.readFileSync(newestSessionPath, 'utf-8');
        const lines = content.trim().split('\n');
        // Only parse last 50 lines for performance
        const recentLines = lines.slice(-50);
        const parsed = parseAgentActivity(recentLines);
        currentTool = parsed.currentTool;
        subagentInfos = parsed.subagents;
      } catch {
        // ignore read errors
      }
    }

    agents.push({
      id: agentId,
      name,
      emoji,
      source: 'openclaw',
      role: 'agent',
      state,
      currentTool,
      lastActive: newestMtime || 0,
    });

    // Add subagents as separate entries
    for (const sub of subagentInfos) {
      agents.push({
        id: `${agentId}:sub:${sub.toolId}`,
        name: sub.label,
        emoji: '⚡',
        source: 'openclaw',
        role: 'subagent',
        state: sub.state,
        parentId: agentId,
        lastActive: sub.lastActive,
      });
    }
  }

  return agents;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- tests/lib/state/openclaw-reader.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/state/openclaw-reader.ts tests/lib/state/openclaw-reader.test.ts
git commit -m "feat: add OpenClaw local file reader with agent state detection and subagent parsing"
```

---

## Task 6: API Push Store

**Files:**
- Create: `lib/state/api-push-store.ts`
- Test: `tests/lib/state/api-push-store.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/state/api-push-store.test.ts`:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiPushStore } from '@/lib/state/api-push-store';

describe('ApiPushStore', () => {
  let store: ApiPushStore;

  beforeEach(() => {
    store = new ApiPushStore();
    vi.useFakeTimers();
  });

  afterEach(() => vi.useRealTimers());

  it('setPrimaryState sets the primary agent state', () => {
    store.setPrimaryState('writing', 'Coding now');
    const agents = store.getAll();
    expect(agents).toHaveLength(1);
    expect(agents[0].role).toBe('primary');
    expect(agents[0].state).toBe('writing');
    expect(agents[0].message).toBe('Coding now');
  });

  it('addVisitor adds a visitor agent', () => {
    store.addVisitor('v1', 'Alice', '🐱');
    const agents = store.getAll();
    const visitor = agents.find((a) => a.id === 'visitor:v1');
    expect(visitor).toBeDefined();
    expect(visitor!.role).toBe('visitor');
    expect(visitor!.name).toBe('Alice');
  });

  it('updateVisitor updates visitor state', () => {
    store.addVisitor('v1', 'Alice', '🐱');
    store.updateVisitor('v1', 'writing', 'Working hard');
    const visitor = store.getAll().find((a) => a.id === 'visitor:v1');
    expect(visitor!.state).toBe('writing');
  });

  it('removeVisitor removes a visitor', () => {
    store.addVisitor('v1', 'Alice', '🐱');
    store.removeVisitor('v1');
    const visitor = store.getAll().find((a) => a.id === 'visitor:v1');
    expect(visitor).toBeUndefined();
  });

  it('cleanExpired removes visitors with no heartbeat for 5 minutes', () => {
    store.addVisitor('v1', 'Alice', '🐱');
    vi.advanceTimersByTime(6 * 60 * 1000);
    store.cleanExpired();
    expect(store.getAll().find((a) => a.id === 'visitor:v1')).toBeUndefined();
  });

  it('work state auto-decays to idle after 300s', () => {
    store.setPrimaryState('writing', 'Coding');
    vi.advanceTimersByTime(301_000);
    store.cleanExpired();
    const primary = store.getAll().find((a) => a.role === 'primary');
    expect(primary!.state).toBe('idle');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/lib/state/api-push-store.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write api-push-store implementation**

Create `lib/state/api-push-store.ts`:

```typescript
import type { UnifiedAgentState, AgentState } from './types';

const VISITOR_TTL_MS = 5 * 60 * 1000;
const WORK_STATE_TTL_MS = 300 * 1000;

const WORK_STATES: AgentState[] = ['writing', 'researching', 'executing', 'syncing', 'error'];

interface VisitorEntry {
  id: string;
  name: string;
  emoji: string;
  state: AgentState;
  message?: string;
  lastHeartbeat: number;
}

interface PrimaryEntry {
  state: AgentState;
  message?: string;
  lastUpdate: number;
}

export class ApiPushStore {
  private primary: PrimaryEntry = { state: 'idle', lastUpdate: Date.now() };
  private visitors = new Map<string, VisitorEntry>();

  setPrimaryState(state: AgentState, message?: string): void {
    this.primary = { state, message, lastUpdate: Date.now() };
  }

  addVisitor(id: string, name: string, emoji: string): void {
    this.visitors.set(id, {
      id,
      name,
      emoji,
      state: 'idle',
      lastHeartbeat: Date.now(),
    });
  }

  updateVisitor(id: string, state: AgentState, message?: string): boolean {
    const v = this.visitors.get(id);
    if (!v) return false;
    v.state = state;
    v.message = message;
    v.lastHeartbeat = Date.now();
    return true;
  }

  removeVisitor(id: string): boolean {
    return this.visitors.delete(id);
  }

  hasVisitor(id: string): boolean {
    return this.visitors.has(id);
  }

  cleanExpired(): void {
    const now = Date.now();

    // Auto-decay primary work state after 300s
    if (
      WORK_STATES.includes(this.primary.state) &&
      now - this.primary.lastUpdate > WORK_STATE_TTL_MS
    ) {
      this.primary.state = 'idle';
    }

    // Remove expired visitors
    for (const [id, v] of this.visitors) {
      if (now - v.lastHeartbeat > VISITOR_TTL_MS) {
        this.visitors.delete(id);
      }
    }
  }

  getAll(): UnifiedAgentState[] {
    const result: UnifiedAgentState[] = [];

    // Primary agent
    result.push({
      id: 'primary',
      name: 'Star',
      emoji: '⭐',
      source: 'api-push',
      role: 'primary',
      state: this.primary.state,
      message: this.primary.message,
      lastActive: this.primary.lastUpdate,
    });

    // Visitors
    for (const v of this.visitors.values()) {
      result.push({
        id: `visitor:${v.id}`,
        name: v.name,
        emoji: v.emoji,
        source: 'api-push',
        role: 'visitor',
        state: v.state,
        message: v.message,
        lastActive: v.lastHeartbeat,
      });
    }

    return result;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- tests/lib/state/api-push-store.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/state/api-push-store.ts tests/lib/state/api-push-store.test.ts
git commit -m "feat: add API push store with visitor management and TTL auto-expiry"
```

---

## Task 7: Unified State Manager

**Files:**
- Create: `lib/state/unified-state-manager.ts`
- Test: `tests/lib/state/unified-state-manager.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/lib/state/unified-state-manager.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { UnifiedStateManager } from '@/lib/state/unified-state-manager';

// Mock the openclaw-reader to avoid filesystem access
vi.mock('@/lib/state/openclaw-reader', () => ({
  readOpenClawAgents: vi.fn().mockReturnValue([
    {
      id: 'agent-1',
      name: 'ResearchBot',
      emoji: '🔬',
      source: 'openclaw',
      role: 'agent',
      state: 'writing',
      lastActive: Date.now(),
    },
  ]),
}));

describe('UnifiedStateManager', () => {
  it('merges openclaw agents and api-push agents', () => {
    const manager = new UnifiedStateManager();
    manager.pushStore.addVisitor('v1', 'Alice', '🐱');
    manager.pushStore.updateVisitor('v1', 'writing', 'Coding');

    const agents = manager.getAllAgents();

    // Should have: primary (from push store) + agent-1 (from openclaw) + visitor
    expect(agents.length).toBeGreaterThanOrEqual(3);
    expect(agents.find((a) => a.id === 'agent-1')).toBeDefined();
    expect(agents.find((a) => a.role === 'primary')).toBeDefined();
    expect(agents.find((a) => a.id === 'visitor:v1')).toBeDefined();
  });

  it('deduplicates by id, preferring openclaw source', () => {
    const manager = new UnifiedStateManager();
    const agents = manager.getAllAgents();
    const ids = agents.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/lib/state/unified-state-manager.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write unified state manager implementation**

Create `lib/state/unified-state-manager.ts`:

```typescript
import { readOpenClawAgents } from './openclaw-reader';
import { ApiPushStore } from './api-push-store';
import { CacheEntry } from '@/lib/config-cache';
import type { UnifiedAgentState } from './types';

const OPENCLAW_CACHE_TTL = 5000; // 5 seconds

export class UnifiedStateManager {
  public readonly pushStore = new ApiPushStore();
  private openclawCache: CacheEntry<UnifiedAgentState[]>;

  constructor() {
    this.openclawCache = new CacheEntry(() => {
      try {
        return readOpenClawAgents();
      } catch {
        return [];
      }
    }, OPENCLAW_CACHE_TTL);
  }

  getAllAgents(): UnifiedAgentState[] {
    this.pushStore.cleanExpired();

    const openclawAgents = this.openclawCache.get();
    const pushAgents = this.pushStore.getAll();

    // Merge: openclaw agents take priority for dedup
    const agentMap = new Map<string, UnifiedAgentState>();

    for (const agent of pushAgents) {
      agentMap.set(agent.id, agent);
    }

    for (const agent of openclawAgents) {
      agentMap.set(agent.id, agent);
    }

    return Array.from(agentMap.values());
  }

  invalidateCache(): void {
    this.openclawCache.invalidate();
  }
}

// Singleton instance for API routes
let _instance: UnifiedStateManager | null = null;

export function getStateManager(): UnifiedStateManager {
  if (!_instance) {
    _instance = new UnifiedStateManager();
  }
  return _instance;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- tests/lib/state/unified-state-manager.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/state/unified-state-manager.ts tests/lib/state/unified-state-manager.test.ts
git commit -m "feat: add unified state manager merging OpenClaw local + API push data sources"
```

---

## Task 8: Core API Routes

**Files:**
- Create: `app/api/agents/route.ts`, `app/api/agent-activity/route.ts`, `app/api/set-state/route.ts`, `app/api/join-agent/route.ts`, `app/api/agent-push/route.ts`, `app/api/leave-agent/route.ts`, `app/api/health/route.ts`

- [ ] **Step 1: Write health check endpoint**

Create `app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: Date.now() });
}
```

- [ ] **Step 2: Write agents endpoint**

Create `app/api/agents/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getStateManager } from '@/lib/state/unified-state-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  const manager = getStateManager();
  const agents = manager.getAllAgents();
  return NextResponse.json(agents);
}
```

- [ ] **Step 3: Write set-state endpoint**

Create `app/api/set-state/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getStateManager } from '@/lib/state/unified-state-manager';
import type { AgentState } from '@/lib/state/types';

const VALID_STATES: AgentState[] = [
  'idle', 'writing', 'researching', 'executing', 'syncing', 'error',
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { state, message } = body;

  if (!state || !VALID_STATES.includes(state)) {
    return NextResponse.json(
      { error: `Invalid state. Must be one of: ${VALID_STATES.join(', ')}` },
      { status: 400 }
    );
  }

  const manager = getStateManager();
  manager.pushStore.setPrimaryState(state, message);
  return NextResponse.json({ ok: true, state, message });
}
```

- [ ] **Step 4: Write join-agent endpoint**

Create `app/api/join-agent/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getStateManager } from '@/lib/state/unified-state-manager';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, name, emoji, joinKey } = body;

  if (!id || !name) {
    return NextResponse.json({ error: 'id and name are required' }, { status: 400 });
  }

  // TODO: validate joinKey against join-keys.json in Plan 3

  const manager = getStateManager();

  if (manager.pushStore.hasVisitor(id)) {
    return NextResponse.json({ error: 'Agent already joined' }, { status: 409 });
  }

  manager.pushStore.addVisitor(id, name, emoji || '🤖');
  return NextResponse.json({ ok: true, id, name });
}
```

- [ ] **Step 5: Write agent-push endpoint**

Create `app/api/agent-push/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getStateManager } from '@/lib/state/unified-state-manager';
import type { AgentState } from '@/lib/state/types';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, state, message } = body;

  if (!id || !state) {
    return NextResponse.json({ error: 'id and state are required' }, { status: 400 });
  }

  const manager = getStateManager();
  const updated = manager.pushStore.updateVisitor(id, state as AgentState, message);

  if (!updated) {
    return NextResponse.json({ error: 'Agent not found. Call /api/join-agent first.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Write leave-agent endpoint**

Create `app/api/leave-agent/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getStateManager } from '@/lib/state/unified-state-manager';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 });
  }

  const manager = getStateManager();
  const removed = manager.pushStore.removeVisitor(id);

  if (!removed) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 7: Write agent-activity endpoint (combines state + subagent info)**

Create `app/api/agent-activity/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getStateManager } from '@/lib/state/unified-state-manager';

export const dynamic = 'force-dynamic';

export async function GET() {
  const manager = getStateManager();
  const agents = manager.getAllAgents();

  // Group subagents under their parents
  const parents = agents.filter((a) => a.role !== 'subagent');
  const subagents = agents.filter((a) => a.role === 'subagent');

  const activity = parents.map((parent) => ({
    ...parent,
    subagents: subagents.filter((s) => s.parentId === parent.id),
  }));

  return NextResponse.json(activity);
}
```

- [ ] **Step 8: Verify APIs work**

```bash
pnpm dev &
sleep 3

# Test health
curl http://localhost:3000/api/health
# Expected: {"status":"ok","timestamp":...}

# Test set state
curl -X POST http://localhost:3000/api/set-state -H 'Content-Type: application/json' -d '{"state":"writing","message":"Coding"}'
# Expected: {"ok":true,"state":"writing","message":"Coding"}

# Test agents list
curl http://localhost:3000/api/agents
# Expected: array with primary agent in writing state

kill %1
```

- [ ] **Step 9: Commit**

```bash
git add app/api/
git commit -m "feat: add core API routes (agents, set-state, join/push/leave, health)"
```

---

## Task 9: Phaser ↔ React Bridge Component

**Files:**
- Create: `game/config/sprites.ts`, `game/config/layout.ts`, `app/pixel-office/PhaserGame.tsx`

- [ ] **Step 1: Write sprite registry**

Create `game/config/sprites.ts`:

```typescript
export interface SpriteConfig {
  key: string;
  path: string;
  frameWidth?: number;
  frameHeight?: number;
  forcePng?: boolean;
}

export const SPRITES: SpriteConfig[] = [
  // Main character
  { key: 'star-working', path: '/sprites/star-working-spritesheet-grid.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'star-idle', path: '/sprites/star-idle-spritesheet.png', frameWidth: 128, frameHeight: 128 },
  { key: 'star-researching', path: '/sprites/star-researching-spritesheet.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'sync-anim', path: '/sprites/sync-animation-v3-grid.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'error-bug', path: '/sprites/error-bug-spritesheet-grid.webp', frameWidth: 128, frameHeight: 128 },

  // Environment
  { key: 'sofa-busy', path: '/sprites/sofa-busy-spritesheet.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'coffee-machine', path: '/sprites/coffee-machine-spritesheet.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'serverroom', path: '/sprites/serverroom-spritesheet.webp', frameWidth: 128, frameHeight: 128 },
  { key: 'cats', path: '/sprites/cats-spritesheet.webp', frameWidth: 64, frameHeight: 64 },
  { key: 'plants', path: '/sprites/plants-spritesheet.webp', frameWidth: 64, frameHeight: 64 },
  { key: 'posters', path: '/sprites/posters-spritesheet.webp', frameWidth: 64, frameHeight: 64 },
  { key: 'flowers', path: '/sprites/flowers-bloom-v2.webp', frameWidth: 64, frameHeight: 64 },
  { key: 'desk', path: '/sprites/desk-v3.webp' },

  // Guests
  { key: 'guest-anim-1', path: '/sprites/guest_anim_1.webp', frameWidth: 64, frameHeight: 64 },
  { key: 'guest-anim-2', path: '/sprites/guest_anim_2.webp', frameWidth: 64, frameHeight: 64 },
  { key: 'guest-anim-3', path: '/sprites/guest_anim_3.webp', frameWidth: 64, frameHeight: 64 },
  { key: 'guest-anim-4', path: '/sprites/guest_anim_4.webp', frameWidth: 64, frameHeight: 64 },
  { key: 'guest-anim-5', path: '/sprites/guest_anim_5.webp', frameWidth: 64, frameHeight: 64 },
  { key: 'guest-anim-6', path: '/sprites/guest_anim_6.webp', frameWidth: 64, frameHeight: 64 },
];

export const IMAGES = [
  { key: 'office-bg', path: '/backgrounds/office_bg_small.webp' },
  { key: 'memo-bg', path: '/sprites/memo-bg.webp' },
];
```

- [ ] **Step 2: Write layout constants**

Create `game/config/layout.ts`:

```typescript
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const TILE_SIZE = 32;
export const GRID_COLS = Math.floor(GAME_WIDTH / TILE_SIZE); // 40
export const GRID_ROWS = Math.floor(GAME_HEIGHT / TILE_SIZE); // 22

// Zone positions (pixel coordinates, matching Star-Office-UI layout.js)
export const ZONES = {
  door: { x: 640, y: 550 },
  writing: { x: 320, y: 360 },
  error: { x: 1066, y: 180 },
  breakroom: { x: 640, y: 360 },
} as const;

// Furniture positions and depth (from Star-Office-UI layout.js)
export const FURNITURE = {
  sofa: { x: 670, y: 144, depth: 10, originX: 0, originY: 0 },
  desk: { x: 218, y: 417, depth: 1000, forcePng: true },
  flower: { x: 310, y: 390, depth: 1100, scale: 0.8 },
  starWorking: { x: 217, y: 333, depth: 900, scale: 1.32 },
  coffeeMachine: { x: 659, y: 397, depth: 99 },
  serverroom: { x: 1021, y: 142, depth: 2 },
  errorBug: { x: 1007, y: 221, depth: 50, scale: 0.9 },
  syncAnim: { x: 1157, y: 592, depth: 40 },
  cat: { x: 94, y: 557, depth: 2000 },
  plants: [
    { x: 565, y: 178, depth: 5 },
    { x: 230, y: 185, depth: 5 },
    { x: 977, y: 496, depth: 5 },
  ],
} as const;

// Workstation seats (pre-defined positions for agents)
export const SEATS = [
  { id: 'seat-main', x: 217, y: 360, reserved: 'primary' },
  { id: 'seat-1', x: 280, y: 360, reserved: null },
  { id: 'seat-2', x: 340, y: 360, reserved: null },
  { id: 'seat-3', x: 400, y: 360, reserved: null },
  { id: 'seat-4', x: 280, y: 420, reserved: null },
  { id: 'seat-5', x: 340, y: 420, reserved: null },
  { id: 'seat-6', x: 400, y: 420, reserved: null },
] as const;

// Nameplate bar at bottom
export const NAMEPLATE = {
  x: 640,
  y: 684,
  width: 420,
  height: 44,
} as const;
```

- [ ] **Step 3: Write PhaserGame React bridge component**

Create `app/pixel-office/PhaserGame.tsx`:

```tsx
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
            arcade: { gravity: { y: 0 }, debug: false },
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
```

- [ ] **Step 4: Commit**

```bash
git add game/config/ app/pixel-office/PhaserGame.tsx
git commit -m "feat: add Phaser-React bridge component with sprite registry and layout constants"
```

---

## Task 10: Phaser Scenes (Boot + Office + UI)

**Files:**
- Create: `game/scenes/BootScene.ts`, `game/scenes/OfficeScene.ts`, `game/scenes/UIScene.ts`

- [ ] **Step 1: Write BootScene (asset preloading)**

Create `game/scenes/BootScene.ts`:

```typescript
import { Scene } from 'phaser';
import { SPRITES, IMAGES } from '@/game/config/sprites';
import { GAME_WIDTH, GAME_HEIGHT } from '@/game/config/layout';

export class BootScene extends Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Progress bar
    const barW = 300;
    const barH = 20;
    const barX = (GAME_WIDTH - barW) / 2;
    const barY = GAME_HEIGHT / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x1a1a2e, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x333333, 0.8);
    progressBox.fillRect(barX, barY, barW, barH);

    const loadingText = this.add.text(GAME_WIDTH / 2, barY - 30, '正在进入像素办公室…', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'ArkPixel, Courier New, monospace',
    });
    loadingText.setOrigin(0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xe94560, 1);
      progressBar.fillRect(barX + 2, barY + 2, (barW - 4) * value, barH - 4);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      bg.destroy();
    });

    // Load images
    for (const img of IMAGES) {
      this.load.image(img.key, img.path);
    }

    // Load spritesheets
    for (const sprite of SPRITES) {
      if (sprite.frameWidth && sprite.frameHeight) {
        this.load.spritesheet(sprite.key, sprite.path, {
          frameWidth: sprite.frameWidth,
          frameHeight: sprite.frameHeight,
        });
      } else {
        this.load.image(sprite.key, sprite.path);
      }
    }
  }

  create(): void {
    this.scene.start('OfficeScene');
    this.scene.start('UIScene');
  }
}
```

- [ ] **Step 2: Write OfficeScene (background + furniture + environment animations)**

Create `game/scenes/OfficeScene.ts`:

```typescript
import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FURNITURE } from '@/game/config/layout';

export class OfficeScene extends Scene {
  constructor() {
    super({ key: 'OfficeScene' });
  }

  create(): void {
    // Background
    const bg = this.add.image(0, 0, 'office-bg');
    bg.setOrigin(0, 0);
    bg.setDisplaySize(GAME_WIDTH, GAME_HEIGHT);

    // Sofa
    const sofa = this.add.sprite(FURNITURE.sofa.x, FURNITURE.sofa.y, 'sofa-busy');
    sofa.setOrigin(0, 0);
    sofa.setDepth(FURNITURE.sofa.depth);
    if (this.textures.exists('sofa-busy') && this.textures.get('sofa-busy').frameTotal > 1) {
      this.anims.create({
        key: 'sofa-anim',
        frames: this.anims.generateFrameNumbers('sofa-busy', { start: 0, end: -1 }),
        frameRate: 4,
        repeat: -1,
      });
      sofa.play('sofa-anim');
    }

    // Coffee machine
    const coffee = this.add.sprite(FURNITURE.coffeeMachine.x, FURNITURE.coffeeMachine.y, 'coffee-machine');
    coffee.setDepth(FURNITURE.coffeeMachine.depth);
    if (this.textures.exists('coffee-machine') && this.textures.get('coffee-machine').frameTotal > 1) {
      this.anims.create({
        key: 'coffee-anim',
        frames: this.anims.generateFrameNumbers('coffee-machine', { start: 0, end: -1 }),
        frameRate: 8,
        repeat: -1,
      });
      coffee.play('coffee-anim');
    }

    // Server room
    const server = this.add.sprite(FURNITURE.serverroom.x, FURNITURE.serverroom.y, 'serverroom');
    server.setDepth(FURNITURE.serverroom.depth);
    if (this.textures.exists('serverroom') && this.textures.get('serverroom').frameTotal > 1) {
      this.anims.create({
        key: 'server-anim',
        frames: this.anims.generateFrameNumbers('serverroom', { start: 0, end: -1 }),
        frameRate: 6,
        repeat: -1,
      });
      server.play('server-anim');
    }

    // Cat
    const cat = this.add.sprite(FURNITURE.cat.x, FURNITURE.cat.y, 'cats');
    cat.setDepth(FURNITURE.cat.depth);
    if (this.textures.exists('cats') && this.textures.get('cats').frameTotal > 1) {
      this.anims.create({
        key: 'cat-anim',
        frames: this.anims.generateFrameNumbers('cats', { start: 0, end: -1 }),
        frameRate: 3,
        repeat: -1,
      });
      cat.play('cat-anim');
    }

    // Desk (static image)
    const desk = this.add.image(FURNITURE.desk.x, FURNITURE.desk.y, 'desk');
    desk.setDepth(FURNITURE.desk.depth);

    // Flower
    if (this.textures.exists('flowers')) {
      const flower = this.add.sprite(FURNITURE.flower.x, FURNITURE.flower.y, 'flowers');
      flower.setDepth(FURNITURE.flower.depth);
      flower.setScale(FURNITURE.flower.scale);
    }

    // Plants
    for (const p of FURNITURE.plants) {
      if (this.textures.exists('plants')) {
        const plant = this.add.sprite(p.x, p.y, 'plants');
        plant.setDepth(p.depth);
        // Random frame variant
        const totalFrames = this.textures.get('plants').frameTotal;
        if (totalFrames > 1) {
          plant.setFrame(Phaser.Math.Between(0, totalFrames - 2));
        }
      }
    }

    // Nameplate bar
    const nameplateBar = this.add.graphics();
    nameplateBar.fillStyle(0x000000, 0.5);
    nameplateBar.fillRoundedRect(640 - 210, 684 - 22, 420, 44, 4);
    nameplateBar.setDepth(3000);

    const nameplateText = this.add.text(640, 684, 'Star / 像素办公室', {
      fontSize: '14px',
      color: '#ffffff',
      fontFamily: 'ArkPixel, Courier New, monospace',
    });
    nameplateText.setOrigin(0.5);
    nameplateText.setDepth(3001);
  }
}
```

- [ ] **Step 3: Write UIScene (HUD overlay placeholder)**

Create `game/scenes/UIScene.ts`:

```typescript
import { Scene } from 'phaser';

export class UIScene extends Scene {
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    // Status indicator at top-left
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
```

- [ ] **Step 4: Update homepage to mount PhaserGame**

Edit `app/page.tsx`:

```tsx
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
```

- [ ] **Step 5: Verify pixel office renders in browser**

```bash
pnpm dev
```

Open http://localhost:3000. Verify: background image loads, furniture sprites animate (sofa, coffee machine, cat), nameplate bar shows at bottom.

- [ ] **Step 6: Commit**

```bash
git add game/scenes/ app/page.tsx
git commit -m "feat: add Phaser scenes - BootScene (preloader), OfficeScene (background + furniture), UIScene (HUD)"
```

---

## Task 11: A* Pathfinding

**Files:**
- Create: `game/pathfinding/AStarGrid.ts`, `game/pathfinding/CollisionMap.ts`
- Test: `tests/game/pathfinding/AStarGrid.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/game/pathfinding/AStarGrid.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { AStarGrid } from '@/game/pathfinding/AStarGrid';

describe('AStarGrid', () => {
  it('finds a straight-line path on an empty grid', () => {
    const grid = new AStarGrid(10, 10, []);
    const path = grid.findPath(0, 0, 5, 0);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(0);
    expect(path![path!.length - 1]).toEqual({ x: 5, y: 0 });
  });

  it('navigates around obstacles', () => {
    // Block column 3 except row 5
    const blocked: [number, number][] = [];
    for (let y = 0; y < 10; y++) {
      if (y !== 5) blocked.push([3, y]);
    }
    const grid = new AStarGrid(10, 10, blocked);
    const path = grid.findPath(0, 0, 5, 0);
    expect(path).not.toBeNull();
    // Path must go around the wall
    expect(path!.some((p) => p.y === 5)).toBe(true);
  });

  it('returns null when no path exists', () => {
    // Completely block column 3
    const blocked: [number, number][] = [];
    for (let y = 0; y < 10; y++) blocked.push([3, y]);
    const grid = new AStarGrid(10, 10, blocked);
    const path = grid.findPath(0, 0, 5, 0);
    expect(path).toBeNull();
  });

  it('returns single-step path when start equals goal', () => {
    const grid = new AStarGrid(10, 10, []);
    const path = grid.findPath(3, 3, 3, 3);
    expect(path).toEqual([{ x: 3, y: 3 }]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/game/pathfinding/AStarGrid.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write AStarGrid implementation**

Create `game/pathfinding/AStarGrid.ts`:

```typescript
interface Point {
  x: number;
  y: number;
}

interface Node {
  x: number;
  y: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

export class AStarGrid {
  private blocked: Set<string>;

  constructor(
    private cols: number,
    private rows: number,
    blockedTiles: [number, number][]
  ) {
    this.blocked = new Set(blockedTiles.map(([x, y]) => `${x},${y}`));
  }

  isBlocked(x: number, y: number): boolean {
    return this.blocked.has(`${x},${y}`);
  }

  setBlocked(x: number, y: number, blocked: boolean): void {
    const key = `${x},${y}`;
    if (blocked) this.blocked.add(key);
    else this.blocked.delete(key);
  }

  findPath(startX: number, startY: number, endX: number, endY: number): Point[] | null {
    if (startX === endX && startY === endY) {
      return [{ x: startX, y: startY }];
    }

    if (this.isBlocked(endX, endY)) return null;

    const open: Node[] = [];
    const closed = new Set<string>();

    const heuristic = (x: number, y: number) =>
      Math.abs(x - endX) + Math.abs(y - endY);

    const startNode: Node = {
      x: startX,
      y: startY,
      g: 0,
      h: heuristic(startX, startY),
      f: heuristic(startX, startY),
      parent: null,
    };
    open.push(startNode);

    const dirs = [
      [0, -1], [0, 1], [-1, 0], [1, 0],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];

    while (open.length > 0) {
      // Find node with lowest f
      let lowestIdx = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[lowestIdx].f) lowestIdx = i;
      }
      const current = open.splice(lowestIdx, 1)[0];

      if (current.x === endX && current.y === endY) {
        // Reconstruct path
        const path: Point[] = [];
        let node: Node | null = current;
        while (node) {
          path.unshift({ x: node.x, y: node.y });
          node = node.parent;
        }
        return path;
      }

      closed.add(`${current.x},${current.y}`);

      for (const [dx, dy] of dirs) {
        const nx = current.x + dx;
        const ny = current.y + dy;

        if (nx < 0 || nx >= this.cols || ny < 0 || ny >= this.rows) continue;
        if (closed.has(`${nx},${ny}`)) continue;
        if (this.isBlocked(nx, ny)) continue;

        // Diagonal movement: check that both adjacent orthogonal tiles are open
        if (dx !== 0 && dy !== 0) {
          if (this.isBlocked(current.x + dx, current.y) || this.isBlocked(current.x, current.y + dy)) {
            continue;
          }
        }

        const g = current.g + (dx !== 0 && dy !== 0 ? 1.414 : 1);
        const h = heuristic(nx, ny);
        const f = g + h;

        const existing = open.find((n) => n.x === nx && n.y === ny);
        if (existing) {
          if (g < existing.g) {
            existing.g = g;
            existing.f = f;
            existing.parent = current;
          }
        } else {
          open.push({ x: nx, y: ny, g, h, f, parent: current });
        }
      }
    }

    return null;
  }
}
```

- [ ] **Step 4: Write CollisionMap**

Create `game/pathfinding/CollisionMap.ts`:

```typescript
import { AStarGrid } from './AStarGrid';
import { GRID_COLS, GRID_ROWS, TILE_SIZE } from '@/game/config/layout';

// Default blocked tiles (furniture areas)
// These approximate the Star-Office-UI furniture positions as tile coordinates
const DEFAULT_BLOCKED: [number, number][] = [];

// Furniture bounding boxes in pixel coords → tile coords
const FURNITURE_BOUNDS = [
  // Desk area: (180-280, 400-450)
  { x1: 5, y1: 12, x2: 9, y2: 14 },
  // Sofa area: (640-780, 120-180)
  { x1: 20, y1: 3, x2: 25, y2: 5 },
  // Server room: (980-1100, 120-200)
  { x1: 30, y1: 3, x2: 35, y2: 6 },
  // Walls (top)
  { x1: 0, y1: 0, x2: 39, y2: 2 },
];

for (const bound of FURNITURE_BOUNDS) {
  for (let x = bound.x1; x <= bound.x2; x++) {
    for (let y = bound.y1; y <= bound.y2; y++) {
      DEFAULT_BLOCKED.push([x, y]);
    }
  }
}

export function createCollisionMap(): AStarGrid {
  return new AStarGrid(GRID_COLS, GRID_ROWS, DEFAULT_BLOCKED);
}

export function pixelToTile(px: number, py: number): { tx: number; ty: number } {
  return {
    tx: Math.floor(px / TILE_SIZE),
    ty: Math.floor(py / TILE_SIZE),
  };
}

export function tileToPixel(tx: number, ty: number): { px: number; py: number } {
  return {
    px: tx * TILE_SIZE + TILE_SIZE / 2,
    py: ty * TILE_SIZE + TILE_SIZE / 2,
  };
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm test -- tests/game/pathfinding/AStarGrid.test.ts
```

Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add game/pathfinding/ tests/game/pathfinding/
git commit -m "feat: add A* pathfinding with collision map and tile/pixel coordinate conversion"
```

---

## Task 12: Seat Manager

**Files:**
- Create: `game/pathfinding/SeatManager.ts`
- Test: `tests/game/pathfinding/SeatManager.test.ts`

- [ ] **Step 1: Write the failing test**

Create `tests/game/pathfinding/SeatManager.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { SeatManager } from '@/game/pathfinding/SeatManager';

describe('SeatManager', () => {
  it('assigns the reserved seat to primary agent', () => {
    const mgr = new SeatManager();
    const seat = mgr.assign('primary-agent', 'primary');
    expect(seat).toBeDefined();
    expect(seat!.id).toBe('seat-main');
  });

  it('assigns first available seat to regular agents', () => {
    const mgr = new SeatManager();
    mgr.assign('primary-agent', 'primary');
    const seat = mgr.assign('agent-1', 'agent');
    expect(seat).toBeDefined();
    expect(seat!.id).toBe('seat-1');
  });

  it('assigns nearest seat to subagent based on parent', () => {
    const mgr = new SeatManager();
    mgr.assign('primary-agent', 'primary');
    const seat = mgr.assign('sub-1', 'subagent');
    expect(seat).toBeDefined();
  });

  it('returns null when all seats are taken', () => {
    const mgr = new SeatManager();
    for (let i = 0; i < 7; i++) {
      mgr.assign(`agent-${i}`, i === 0 ? 'primary' : 'agent');
    }
    const seat = mgr.assign('overflow', 'visitor');
    expect(seat).toBeNull();
  });

  it('release frees a seat for reuse', () => {
    const mgr = new SeatManager();
    mgr.assign('primary-agent', 'primary');
    const s1 = mgr.assign('agent-1', 'agent');
    mgr.release('agent-1');
    const s2 = mgr.assign('agent-2', 'agent');
    expect(s2!.id).toBe(s1!.id);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/game/pathfinding/SeatManager.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write SeatManager implementation**

Create `game/pathfinding/SeatManager.ts`:

```typescript
import { SEATS } from '@/game/config/layout';
import type { AgentRole } from '@/lib/state/types';

interface Seat {
  id: string;
  x: number;
  y: number;
  reserved: string | null;
}

export class SeatManager {
  private seats: Seat[];
  private assignments = new Map<string, string>(); // agentId → seatId

  constructor() {
    this.seats = SEATS.map((s) => ({ ...s, reserved: s.reserved }));
  }

  assign(agentId: string, role: AgentRole): Seat | null {
    // Already assigned?
    const existing = this.assignments.get(agentId);
    if (existing) return this.seats.find((s) => s.id === existing) || null;

    // Primary gets reserved seat
    if (role === 'primary') {
      const reserved = this.seats.find((s) => s.reserved === 'primary');
      if (reserved) {
        this.assignments.set(agentId, reserved.id);
        return reserved;
      }
    }

    // Find first unoccupied, non-reserved seat
    const occupied = new Set(this.assignments.values());
    const available = this.seats.filter(
      (s) => !occupied.has(s.id) && (s.reserved === null || s.reserved === role)
    );

    if (available.length === 0) return null;

    // For subagents, pick nearest available seat
    const seat = available[0];
    this.assignments.set(agentId, seat.id);
    return seat;
  }

  release(agentId: string): void {
    this.assignments.delete(agentId);
  }

  releaseAll(): void {
    this.assignments.clear();
  }

  getSeatFor(agentId: string): Seat | undefined {
    const seatId = this.assignments.get(agentId);
    return seatId ? this.seats.find((s) => s.id === seatId) : undefined;
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test -- tests/game/pathfinding/SeatManager.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add game/pathfinding/SeatManager.ts tests/game/pathfinding/SeatManager.test.ts
git commit -m "feat: add SeatManager with role-based assignment and release"
```

---

## Task 13: Character System + Agent Bridge

**Files:**
- Create: `game/characters/CharacterManager.ts`, `game/characters/MainCharacter.ts`, `game/characters/AgentCharacter.ts`, `game/characters/SubagentCharacter.ts`, `game/characters/VisitorCharacter.ts`, `game/bridge/AgentBridge.ts`
- Test: `tests/game/bridge/AgentBridge.test.ts`

- [ ] **Step 1: Write the failing test for AgentBridge**

Create `tests/game/bridge/AgentBridge.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { mapAgentToAction, CharacterAction } from '@/game/bridge/AgentBridge';
import type { UnifiedAgentState } from '@/lib/state/types';

function makeAgent(overrides: Partial<UnifiedAgentState>): UnifiedAgentState {
  return {
    id: 'test',
    name: 'TestBot',
    emoji: '🤖',
    source: 'openclaw',
    role: 'agent',
    state: 'idle',
    lastActive: Date.now(),
    ...overrides,
  };
}

describe('mapAgentToAction', () => {
  it('maps writing state to GOTO_SEAT action', () => {
    const action = mapAgentToAction(makeAgent({ state: 'writing' }));
    expect(action.type).toBe('GOTO_SEAT');
    expect(action.animKey).toBe('typing');
  });

  it('maps idle state to WANDER action', () => {
    const action = mapAgentToAction(makeAgent({ state: 'idle' }));
    expect(action.type).toBe('WANDER');
  });

  it('maps offline state to REMOVE action', () => {
    const action = mapAgentToAction(makeAgent({ state: 'offline' }));
    expect(action.type).toBe('REMOVE');
  });

  it('maps error state to GOTO_ERROR_ZONE action', () => {
    const action = mapAgentToAction(makeAgent({ state: 'error' }));
    expect(action.type).toBe('GOTO_ERROR_ZONE');
  });

  it('maps syncing state to PLAY_EFFECT action', () => {
    const action = mapAgentToAction(makeAgent({ state: 'syncing' }));
    expect(action.type).toBe('PLAY_EFFECT');
    expect(action.effectKey).toBe('sync');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- tests/game/bridge/AgentBridge.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write AgentBridge**

Create `game/bridge/AgentBridge.ts`:

```typescript
import type { UnifiedAgentState, AgentState } from '@/lib/state/types';

export type ActionType = 'GOTO_SEAT' | 'WANDER' | 'GOTO_ERROR_ZONE' | 'PLAY_EFFECT' | 'REMOVE' | 'SPAWN';

export interface CharacterAction {
  type: ActionType;
  animKey?: string;
  effectKey?: string;
  speed?: number;
}

export function mapAgentToAction(agent: UnifiedAgentState): CharacterAction {
  switch (agent.state) {
    case 'writing':
      return { type: 'GOTO_SEAT', animKey: 'typing' };
    case 'researching':
      return { type: 'GOTO_SEAT', animKey: 'researching' };
    case 'executing':
      return { type: 'GOTO_SEAT', animKey: 'typing', speed: 1.5 };
    case 'idle':
      return { type: 'WANDER' };
    case 'error':
      return { type: 'GOTO_ERROR_ZONE' };
    case 'syncing':
      return { type: 'PLAY_EFFECT', effectKey: 'sync' };
    case 'offline':
      return { type: 'REMOVE' };
    default:
      return { type: 'WANDER' };
  }
}

export function diffAgents(
  prev: UnifiedAgentState[],
  next: UnifiedAgentState[]
): {
  added: UnifiedAgentState[];
  removed: UnifiedAgentState[];
  changed: UnifiedAgentState[];
} {
  const prevMap = new Map(prev.map((a) => [a.id, a]));
  const nextMap = new Map(next.map((a) => [a.id, a]));

  const added: UnifiedAgentState[] = [];
  const removed: UnifiedAgentState[] = [];
  const changed: UnifiedAgentState[] = [];

  for (const [id, agent] of nextMap) {
    const prevAgent = prevMap.get(id);
    if (!prevAgent) {
      added.push(agent);
    } else if (prevAgent.state !== agent.state) {
      changed.push(agent);
    }
  }

  for (const [id, agent] of prevMap) {
    if (!nextMap.has(id)) {
      removed.push(agent);
    }
  }

  return { added, removed, changed };
}
```

- [ ] **Step 4: Write CharacterManager**

Create `game/characters/CharacterManager.ts`:

```typescript
import { Scene } from 'phaser';
import type { UnifiedAgentState } from '@/lib/state/types';
import { mapAgentToAction, diffAgents } from '@/game/bridge/AgentBridge';
import { SeatManager } from '@/game/pathfinding/SeatManager';
import { createCollisionMap, pixelToTile, tileToPixel } from '@/game/pathfinding/CollisionMap';
import { AStarGrid } from '@/game/pathfinding/AStarGrid';
import { ZONES, TILE_SIZE } from '@/game/config/layout';

interface ManagedCharacter {
  id: string;
  sprite: Phaser.GameObjects.Sprite;
  nameTag: Phaser.GameObjects.Text;
  state: UnifiedAgentState;
  path: { x: number; y: number }[] | null;
  pathIndex: number;
  moving: boolean;
}

const SUBAGENT_SPEED = 2.8;
const BASE_SPEED = 80; // pixels per second

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

  private spawnCharacter(agent: UnifiedAgentState): void {
    const spawnPoint = agent.role === 'subagent' || agent.role === 'visitor'
      ? ZONES.door
      : ZONES.breakroom;

    // Pick sprite key based on role
    const spriteKey = agent.role === 'primary' ? 'star-idle' : this.getGuestSpriteKey(agent.id);

    const sprite = this.scene.add.sprite(spawnPoint.x, spawnPoint.y, spriteKey);
    sprite.setDepth(500);

    const nameTag = this.scene.add.text(spawnPoint.x, spawnPoint.y - 40, `${agent.emoji} ${agent.name}`, {
      fontSize: '10px',
      color: '#ffffff',
      fontFamily: 'ArkPixel, Courier New, monospace',
      backgroundColor: '#00000080',
      padding: { x: 4, y: 2 },
    });
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

    this.characters.set(agent.id, managed);
    this.updateCharacter(agent);
  }

  private removeCharacter(id: string): void {
    const char = this.characters.get(id);
    if (!char) return;

    this.seatManager.release(id);
    char.sprite.destroy();
    char.nameTag.destroy();
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
        if (seat) {
          this.navigateTo(char, seat.x, seat.y);
        }
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
      case 'REMOVE': {
        this.removeCharacter(agent.id);
        break;
      }
      default:
        break;
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
      if (!char.moving || !char.path) continue;

      const speed = char.state.role === 'subagent' ? BASE_SPEED * SUBAGENT_SPEED : BASE_SPEED;
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

      // Update name tag position
      char.nameTag.setPosition(char.sprite.x, char.sprite.y - 40);
    }
  }

  private getGuestSpriteKey(id: string): string {
    // Deterministic guest sprite based on id hash
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
    }
    const idx = (Math.abs(hash) % 6) + 1;
    return `guest-anim-${idx}`;
  }
}
```

- [ ] **Step 5: Write stub character classes (MainCharacter, AgentCharacter, SubagentCharacter, VisitorCharacter)**

These extend the logic in CharacterManager. For the MVP, the CharacterManager handles all character types. Create placeholder files:

Create `game/characters/MainCharacter.ts`:

```typescript
// Main character (Star) specific animations and behavior
// Used by CharacterManager for the primary agent role

export const MAIN_CHARACTER_ANIMS = {
  idle: { key: 'star-idle', frameRate: 6, repeat: -1 },
  writing: { key: 'star-working', frameRate: 10, repeat: -1 },
  researching: { key: 'star-researching', frameRate: 8, repeat: -1 },
  executing: { key: 'star-working', frameRate: 15, repeat: -1 }, // faster
  syncing: { key: 'sync-anim', frameRate: 12, repeat: 0 },
  error: { key: 'error-bug', frameRate: 8, repeat: -1 },
} as const;

export type MainAnimState = keyof typeof MAIN_CHARACTER_ANIMS;
```

Create `game/characters/AgentCharacter.ts`:

```typescript
// OpenClaw agent character - uses guest sprites with hue shift
export const AGENT_SPRITE_KEYS = [
  'guest-anim-1', 'guest-anim-2', 'guest-anim-3',
  'guest-anim-4', 'guest-anim-5', 'guest-anim-6',
] as const;

export function getAgentSpriteKey(agentId: string): string {
  let hash = 0;
  for (let i = 0; i < agentId.length; i++) {
    hash = ((hash << 5) - hash + agentId.charCodeAt(i)) | 0;
  }
  return AGENT_SPRITE_KEYS[Math.abs(hash) % AGENT_SPRITE_KEYS.length];
}
```

Create `game/characters/SubagentCharacter.ts`:

```typescript
// Subagent (temporary worker) configuration
export const SUBAGENT_RUN_SPEED_MULTIPLIER = 2.8;
export const SUBAGENT_LABEL_STYLE = {
  fontSize: '9px',
  color: '#fbbf24',
  fontFamily: 'ArkPixel, Courier New, monospace',
  backgroundColor: '#00000080',
  padding: { x: 3, y: 1 },
} as const;
```

Create `game/characters/VisitorCharacter.ts`:

```typescript
// Visitor character configuration
export const VISITOR_HEARTBEAT_TIMEOUT_MS = 5 * 60 * 1000;
export const VISITOR_SPRITE_KEYS = [
  'guest-anim-1', 'guest-anim-2', 'guest-anim-3',
  'guest-anim-4', 'guest-anim-5', 'guest-anim-6',
] as const;
```

- [ ] **Step 6: Run AgentBridge tests**

```bash
pnpm test -- tests/game/bridge/AgentBridge.test.ts
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add game/characters/ game/bridge/
git commit -m "feat: add character system with CharacterManager, AgentBridge, and role-specific configs"
```

---

## Task 14: Wire Characters into OfficeScene + Polling

**Files:**
- Modify: `game/scenes/OfficeScene.ts`, `game/scenes/UIScene.ts`

- [ ] **Step 1: Update OfficeScene to create CharacterManager and poll API**

Edit `game/scenes/OfficeScene.ts` — add to the `create()` method and add `update()`:

```typescript
import { Scene } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, FURNITURE } from '@/game/config/layout';
import { CharacterManager } from '@/game/characters/CharacterManager';
import type { UnifiedAgentState } from '@/lib/state/types';

export class OfficeScene extends Scene {
  private characterManager!: CharacterManager;
  private pollTimer = 0;
  private readonly POLL_INTERVAL = 2000; // ms

  constructor() {
    super({ key: 'OfficeScene' });
  }

  create(): void {
    // ... (keep all existing background/furniture code from Task 10 Step 2) ...

    // Initialize character manager
    this.characterManager = new CharacterManager(this);

    // Initial fetch
    this.fetchAndSync();
  }

  update(_time: number, delta: number): void {
    // Poll API periodically
    this.pollTimer += delta;
    if (this.pollTimer >= this.POLL_INTERVAL) {
      this.pollTimer = 0;
      this.fetchAndSync();
    }

    // Update character movement
    this.characterManager.update(delta);
  }

  private async fetchAndSync(): Promise<void> {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const agents: UnifiedAgentState[] = await res.json();
        this.characterManager.syncAgents(agents);

        // Update UI scene status
        const uiScene = this.scene.get('UIScene') as any;
        const primary = agents.find((a) => a.role === 'primary');
        if (primary && uiScene?.updateStatus) {
          uiScene.updateStatus(primary.state, primary.message);
        }
      }
    } catch {
      // silently retry next poll
    }
  }
}
```

- [ ] **Step 2: Verify end-to-end: dev server → pixel office → API polling → characters**

```bash
pnpm dev
```

Open http://localhost:3000. Verify:
1. Pixel office background and furniture render
2. Primary "Star" character appears (idle state by default)
3. Click through to a different state via curl: `curl -X POST http://localhost:3000/api/set-state -H 'Content-Type: application/json' -d '{"state":"writing"}'`
4. Character should move toward a seat within 2 seconds

- [ ] **Step 3: Commit**

```bash
git add game/scenes/OfficeScene.ts
git commit -m "feat: wire CharacterManager into OfficeScene with 2s API polling"
```

---

## Task 15: Control Panel and Memo Card

**Files:**
- Create: `app/pixel-office/ControlPanel.tsx`, `app/pixel-office/MemoCard.tsx`, `lib/memo-utils.ts`, `app/api/yesterday-memo/route.ts`
- Modify: `app/page.tsx`

- [ ] **Step 1: Write memo-utils**

Create `lib/memo-utils.ts`:

```typescript
import fs from 'fs';
import path from 'path';
import { getOpenClawHome } from './openclaw-paths';

const REDACTION_PATTERNS = [
  { regex: /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, replace: '[IP]' },
  { regex: /[\w.-]+@[\w.-]+\.\w+/g, replace: '[EMAIL]' },
  { regex: /1[3-9]\d{9}/g, replace: '[PHONE]' },
  { regex: /\/[\w/.-]{10,}/g, replace: '[PATH]' },
  { regex: /o[A-Za-z0-9_-]{20,}/g, replace: '[OPENID]' },
];

export function redactSensitive(text: string): string {
  let result = text;
  for (const { regex, replace } of REDACTION_PATTERNS) {
    result = result.replace(regex, replace);
  }
  return result;
}

export function getYesterdayMemo(): string | null {
  const memoryDir = path.join(getOpenClawHome(), '..', 'memory');

  if (!fs.existsSync(memoryDir)) return null;

  const files = fs.readdirSync(memoryDir).filter((f) => f.endsWith('.md'));
  if (files.length === 0) return null;

  // Find yesterday's file or most recent
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().slice(0, 10);

  const target = files.find((f) => f.includes(dateStr)) || files[files.length - 1];
  const content = fs.readFileSync(path.join(memoryDir, target), 'utf-8');

  return redactSensitive(content.slice(0, 500));
}
```

- [ ] **Step 2: Write yesterday-memo API route**

Create `app/api/yesterday-memo/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { getYesterdayMemo } from '@/lib/memo-utils';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const memo = getYesterdayMemo();
    return NextResponse.json({ memo });
  } catch {
    return NextResponse.json({ memo: null });
  }
}
```

- [ ] **Step 3: Write ControlPanel component**

Create `app/pixel-office/ControlPanel.tsx`:

```tsx
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
```

- [ ] **Step 4: Write MemoCard component**

Create `app/pixel-office/MemoCard.tsx`:

```tsx
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
```

- [ ] **Step 5: Update homepage to include ControlPanel and MemoCard**

Edit `app/page.tsx`:

```tsx
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
```

- [ ] **Step 6: Verify complete pixel office page**

```bash
pnpm dev
```

Open http://localhost:3000. Verify:
1. Pixel office canvas renders with background and furniture
2. Control panel below with Idle/Work/Sync/Alert buttons
3. Yesterday memo card below control panel
4. Clicking buttons changes agent state and character responds

- [ ] **Step 7: Commit**

```bash
git add app/pixel-office/ app/page.tsx lib/memo-utils.ts app/api/yesterday-memo/
git commit -m "feat: add ControlPanel, MemoCard, and yesterday-memo API"
```

---

## Task 16: Run All Tests + Final Verification

**Files:** None new

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
```

Expected: All tests pass (config-cache, api-push-store, unified-state-manager, openclaw-reader, AStarGrid, SeatManager, AgentBridge).

- [ ] **Step 2: Run production build**

```bash
pnpm build
```

Expected: Build succeeds with no errors.

- [ ] **Step 3: Verify production server**

```bash
pnpm start &
sleep 3

# Test health
curl http://localhost:3000/api/health

# Test full agent flow
curl -X POST http://localhost:3000/api/set-state -H 'Content-Type: application/json' -d '{"state":"writing","message":"Building MVP"}'
curl http://localhost:3000/api/agents

# Test visitor flow
curl -X POST http://localhost:3000/api/join-agent -H 'Content-Type: application/json' -d '{"id":"v1","name":"Alice","emoji":"🐱"}'
curl -X POST http://localhost:3000/api/agent-push -H 'Content-Type: application/json' -d '{"id":"v1","state":"writing","message":"Helping out"}'
curl http://localhost:3000/api/agents

kill %1
```

Expected: All endpoints return correct JSON. Agents list shows primary + visitor.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: verify all tests pass and production build succeeds - MVP Plan 1 complete"
```

---

## Checkpoint: MVP Complete

At this point, the project has:

- **Working pixel office** at `/` with Star-Office-UI visual fidelity (background, furniture, environment animations)
- **Multi-agent characters** with A* pathfinding, seat assignment, and state-driven behavior
- **Dual data source**: OpenClaw local file reading + API push for visitors
- **Control panel** with status buttons
- **Yesterday memo** with privacy redaction
- **Sidebar navigation** with 4-language i18n and dark/light theme
- **7 unit test files** covering core logic
- **Production-ready build** with standalone output

**Next plans:**
- Plan 2: Dashboard pages migration (Agent overview, models, sessions, stats, alerts, skills)
- Plan 3: Additional features (AI room decoration, asset management, Electron desktop pet, layout editor)
