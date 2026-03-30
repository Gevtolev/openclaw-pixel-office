# Dashboard Migration — Implementation Plan (Plan 2 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all 6 dashboard pages and their supporting API routes/utilities from OpenClaw-bot-review into the new project under `/dashboard/*`.

**Architecture:** Copy existing working code from `OpenClaw-bot-review/` (source), adapting route paths from `/{page}` to `/dashboard/{page}`, merging i18n keys into the 4-locale system, and reconciling utility libraries where the new project already has different implementations. No functional changes — this is a faithful migration.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5 strict, Tailwind CSS v4

**Source project:** `OpenClaw-bot-review/` (sibling directory in workspace)

**Migration stats:** ~25 files, ~7,500 lines of existing code

---

## File Structure

### New utility libraries (copy from source)
| File | Source | Lines | Notes |
|------|--------|-------|-------|
| `lib/json.ts` | Copy verbatim | 17 | JSON parse with BOM handling |
| `lib/gateway-url.ts` | Copy verbatim | 31 | Gateway URL builder |
| `lib/openclaw-cli.ts` | Copy verbatim | 108 | CLI wrapper |
| `lib/session-test-fallback.ts` | Copy verbatim | 61 | Session test CLI fallback |
| `lib/model-probe.ts` | Copy verbatim | 372 | Model availability probe |
| `lib/openclaw-skills.ts` | Copy verbatim | 161 | Skills scanner |

### Modified utility libraries
| File | Change | Notes |
|------|--------|-------|
| `lib/openclaw-paths.ts` | Add constant exports | Source uses `OPENCLAW_HOME` etc. constants |
| `lib/platforms.ts` | Replace with source version | Source has `shouldHidePlatformChannel` |
| `lib/config-cache.ts` | Add simple dashboard cache functions | Source uses `getConfigCache/setConfigCache/clearConfigCache` pattern |

### API routes (copy from source, minimal edits)
| File | Source lines | Notes |
|------|-------------|-------|
| `app/api/config/route.ts` | 556 | Main data provider, uses source-style cache |
| `app/api/config/agent-model/route.ts` | 243 | Live model switching via Gateway |
| `app/api/stats-all/route.ts` | 163 | Global token stats |
| `app/api/stats/[agentId]/route.ts` | 143 | Per-agent stats |
| `app/api/stats-models/route.ts` | 120 | Per-model stats |
| `app/api/agent-status/route.ts` | 92 | Agent online/idle/offline |
| `app/api/sessions/[agentId]/route.ts` | 67 | Session list |
| `app/api/gateway-health/route.ts` | 257 | Triple-fallback health check |
| `app/api/alerts/route.ts` | 122 | Alert rules CRUD |
| `app/api/alerts/check/route.ts` | 455 | Alert check runner |
| `app/api/skills/route.ts` | 10 | Skills list |
| `app/api/skills/content/route.ts` | 28 | Skill content reader |
| `app/api/test-bound-models/route.ts` | 100 | Batch model probe |
| `app/api/test-model/route.ts` | 33 | Single model probe |
| `app/api/test-platforms/route.ts` | 1227 | Platform connectivity test |
| `app/api/test-sessions/route.ts` | 94 | Session health check |
| `app/api/test-dm-sessions/route.ts` | 150 | DM session health check |
| `app/api/test-session/route.ts` | 84 | Single session test |
| `app/api/agent-activity/route.ts` | 852 | **Replace** existing simplified version |

### Shared UI components (copy, adapt links)
| File | Source lines | Notes |
|------|-------------|-------|
| `app/components/agent-card.tsx` | 634 | AgentCard + ModelBadge |
| `app/gateway-status.tsx` | 102 | Gateway health indicator |
| `app/alert-monitor.tsx` | 44 | Background alert checker |

### Dashboard pages (copy, adapt route paths)
| File | Source | Lines | Route change |
|------|--------|-------|--------------|
| `app/dashboard/page.tsx` | `app/page.tsx` | 872 | Source `/` → `/dashboard` |
| `app/dashboard/models/page.tsx` | `app/models/page.tsx` | 482 | `/models` → `/dashboard/models` |
| `app/dashboard/sessions/page.tsx` | `app/sessions/page.tsx` | 398 | `/sessions` → `/dashboard/sessions` |
| `app/dashboard/stats/page.tsx` | `app/stats/page.tsx` | 460 | `/stats` → `/dashboard/stats` |
| `app/dashboard/alerts/page.tsx` | `app/alerts/page.tsx` | 503 | `/alerts` → `/dashboard/alerts` |
| `app/dashboard/skills/page.tsx` | `app/skills/page.tsx` | 370 | `/skills` → `/dashboard/skills` |

### Modified existing files
| File | Change |
|------|--------|
| `lib/i18n.tsx` | Add ~130 dashboard translation keys to all 4 locales |
| `app/layout.tsx` | Add AlertMonitor to global layout |
| `app/sidebar.tsx` | Add GatewayStatus + experiment accordion |

---

## Task 1: Utility Libraries — Copy Verbatim

**Files:**
- Create: `lib/json.ts`, `lib/gateway-url.ts`, `lib/openclaw-cli.ts`, `lib/session-test-fallback.ts`, `lib/model-probe.ts`, `lib/openclaw-skills.ts`

- [ ] **Step 1: Copy all 6 utility files from source**

```bash
cp OpenClaw-bot-review/lib/json.ts lib/json.ts
cp OpenClaw-bot-review/lib/gateway-url.ts lib/gateway-url.ts
cp OpenClaw-bot-review/lib/openclaw-cli.ts lib/openclaw-cli.ts
cp OpenClaw-bot-review/lib/session-test-fallback.ts lib/session-test-fallback.ts
cp OpenClaw-bot-review/lib/model-probe.ts lib/model-probe.ts
cp OpenClaw-bot-review/lib/openclaw-skills.ts lib/openclaw-skills.ts
```

- [ ] **Step 2: Verify no import errors**

```bash
npx tsc --noEmit --pretty 2>&1 | head -30
```

Expected: No errors from these files (they only import from `@/lib/*` which either exists or will be created in Task 2).

- [ ] **Step 3: Commit**

```bash
git add lib/json.ts lib/gateway-url.ts lib/openclaw-cli.ts lib/session-test-fallback.ts lib/model-probe.ts lib/openclaw-skills.ts
git commit -m "feat(lib): add utility libraries for dashboard (json, gateway-url, openclaw-cli, model-probe, openclaw-skills, session-test-fallback)"
```

---

## Task 2: Reconcile Shared Libraries

**Files:**
- Modify: `lib/openclaw-paths.ts`, `lib/platforms.ts`, `lib/config-cache.ts`

The source project and new project have different implementations of these files. We need both styles to coexist.

- [ ] **Step 1: Update `lib/openclaw-paths.ts`**

The source project's API routes use constant-style exports (`OPENCLAW_HOME`, `OPENCLAW_CONFIG_PATH`, etc.) and `getOpenclawPackageCandidates()`. The new project uses function-style exports (`getOpenClawHome()`, etc.). Add the source-style exports alongside existing ones.

Add to the end of `lib/openclaw-paths.ts`:

```typescript
// Constant-style exports (used by dashboard API routes from OpenClaw-bot-review)
export const OPENCLAW_HOME = getOpenClawHome();
export const OPENCLAW_CONFIG_PATH = path.join(OPENCLAW_HOME, 'openclaw.json');
export const OPENCLAW_AGENTS_DIR = path.join(OPENCLAW_HOME, 'agents');
export const OPENCLAW_PIXEL_OFFICE_DIR = path.join(OPENCLAW_HOME, 'pixel-office');

function uniquePaths(paths: Array<string | undefined>): string[] {
  return Array.from(new Set(paths.filter((value): value is string => Boolean(value && value.trim()))));
}

export function getOpenclawPackageCandidates(version = process.version): string[] {
  const home = os.homedir();
  const appData = process.env.APPDATA;
  const homebrewPrefix = process.env.HOMEBREW_PREFIX;
  const npmPrefix = process.env.npm_config_prefix || process.env.PREFIX;

  return uniquePaths([
    process.env.OPENCLAW_PACKAGE_DIR,
    path.join(home, '.local', 'lib', 'node_modules', 'openclaw'),
    npmPrefix ? path.join(npmPrefix, 'node_modules', 'openclaw') : undefined,
    path.join(home, '.nvm', 'versions', 'node', version, 'lib', 'node_modules', 'openclaw'),
    path.join(home, '.fnm', 'node-versions', version, 'installation', 'lib', 'node_modules', 'openclaw'),
    path.join(home, '.npm-global', 'lib', 'node_modules', 'openclaw'),
    path.join(home, '.local', 'share', 'pnpm', 'global', '5', 'node_modules', 'openclaw'),
    path.join(home, 'Library', 'pnpm', 'global', '5', 'node_modules', 'openclaw'),
    appData ? path.join(appData, 'npm', 'node_modules', 'openclaw') : undefined,
    homebrewPrefix ? path.join(homebrewPrefix, 'lib', 'node_modules', 'openclaw') : undefined,
    '/opt/homebrew/lib/node_modules/openclaw',
    '/usr/local/lib/node_modules/openclaw',
    '/usr/lib/node_modules/openclaw',
  ]);
}
```

- [ ] **Step 2: Replace `lib/platforms.ts`**

The new project doesn't have this file yet (the Plan 1 types.ts has `platforms?: string[]` but no platform utility). Create it with the source content:

```typescript
export function shouldHidePlatformChannel(
  channelName: string,
  channels: Record<string, any>
): boolean {
  return channelName === 'wechat-access' && !!channels.wecom && channels.wecom.enabled !== false;
}

export function getPlatformDisplayName(channelName: string): string {
  return channelName === 'wechat-access' ? 'wecom' : channelName;
}
```

- [ ] **Step 3: Update `lib/config-cache.ts`**

The new project has a generic `CacheEntry<T>` class. The source's dashboard API routes use simple `getConfigCache()/setConfigCache()/clearConfigCache()` functions. Add both to coexist:

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

// Simple dashboard config cache (used by /api/config route)
type ConfigCacheEntry = { data: any; ts: number };
let configCache: ConfigCacheEntry | null = null;

export function getConfigCache(): ConfigCacheEntry | null {
  return configCache;
}

export function setConfigCache(entry: ConfigCacheEntry): void {
  configCache = entry;
}

export function clearConfigCache(): void {
  configCache = null;
}
```

- [ ] **Step 4: Run tests to verify no regressions**

```bash
pnpm test
```

Expected: All 30 existing tests pass (CacheEntry class API unchanged).

- [ ] **Step 5: Commit**

```bash
git add lib/openclaw-paths.ts lib/platforms.ts lib/config-cache.ts
git commit -m "feat(lib): reconcile shared libraries for dashboard compatibility"
```

---

## Task 3: Expand i18n with Dashboard Keys

**Files:**
- Modify: `lib/i18n.tsx`

The source project has ~170 translation keys across 3 locales (zh-TW, zh, en). The new project has ~40 keys across 4 locales (zh, zh-TW, en, ja). We need to merge the source keys into the new project, adding Japanese translations for all new keys.

- [ ] **Step 1: Copy the source i18n file and merge**

This is a large merge. The approach:
1. Copy `OpenClaw-bot-review/lib/i18n.tsx` to a temp location
2. Merge all keys from the source into the new project's `lib/i18n.tsx`
3. Add Japanese (ja) translations for all new keys (the source doesn't have ja)

The merge must preserve:
- The new project's existing keys (nav.*, status.*, office.*, control.*)
- The new project's 4-locale structure (zh, zh-TW, en, ja)
- The source's `LanguageSwitcher` component export (needed by sidebar)

**Strategy**: Replace `lib/i18n.tsx` with the source version, then:
1. Add back the `ja` locale (not in source)
2. Add back the `office.*` and `control.*` keys (not in source)
3. Keep the `LanguageSwitcher` component from source

```bash
cp OpenClaw-bot-review/lib/i18n.tsx lib/i18n.tsx
```

Then edit `lib/i18n.tsx` to:
- Add `'ja'` to the `Locale` type union
- Add a full `ja` section with Japanese translations for all keys
- Add the `office.*` and `control.*` keys that exist in the new project but not source
- Ensure `LanguageSwitcher` includes ja option

The `ja` translations for dashboard keys should follow patterns established in Plan 1 (e.g., `nav.dashboard` → `'Agentの概要'`, etc.). For keys without obvious Japanese translations, use English as fallback.

Key sections to add to all 3 existing locales (zh, zh-TW, en) from new project:
```
office.title, office.yesterday, office.noMemo, office.visitors, office.noVisitors,
office.loading, office.decorate, office.noSeat, office.tempWorker,
control.title, control.idle, control.work, control.sync, control.alert
```

The full ja locale needs all ~170+ source keys plus the office/control keys above.

- [ ] **Step 2: Verify the i18n module compiles**

```bash
npx tsc --noEmit lib/i18n.tsx 2>&1 | head -10
```

Expected: No errors.

- [ ] **Step 3: Run tests**

```bash
pnpm test
```

Expected: All 30 tests pass.

- [ ] **Step 4: Commit**

```bash
git add lib/i18n.tsx
git commit -m "feat(i18n): merge dashboard translation keys from OpenClaw-bot-review, add Japanese locale"
```

---

## Task 4: Dashboard API Routes — Core Data

**Files:**
- Create: `app/api/config/route.ts`, `app/api/stats-all/route.ts`, `app/api/stats/[agentId]/route.ts`, `app/api/stats-models/route.ts`, `app/api/agent-status/route.ts`, `app/api/sessions/[agentId]/route.ts`, `app/api/gateway-health/route.ts`
- Replace: `app/api/agent-activity/route.ts` (replace simplified Plan 1 version with full source version)

All these API routes can be copied from source with zero modification — they use `@/lib/*` imports that now exist in the new project (after Tasks 1-2).

- [ ] **Step 1: Copy core data API routes**

```bash
# config route (556 lines)
cp OpenClaw-bot-review/app/api/config/route.ts app/api/config/route.ts

# stats routes
cp OpenClaw-bot-review/app/api/stats-all/route.ts app/api/stats-all/route.ts
mkdir -p app/api/stats
cp OpenClaw-bot-review/app/api/stats/\[agentId\]/route.ts app/api/stats/\[agentId\]/route.ts
cp OpenClaw-bot-review/app/api/stats-models/route.ts app/api/stats-models/route.ts

# agent status
cp OpenClaw-bot-review/app/api/agent-status/route.ts app/api/agent-status/route.ts

# sessions (per agent)
mkdir -p app/api/sessions
cp OpenClaw-bot-review/app/api/sessions/\[agentId\]/route.ts app/api/sessions/\[agentId\]/route.ts

# gateway health
cp OpenClaw-bot-review/app/api/gateway-health/route.ts app/api/gateway-health/route.ts
```

- [ ] **Step 2: Replace agent-activity with full version**

The Plan 1 `app/api/agent-activity/route.ts` is a simplified wrapper around the unified state manager. The source version (852 lines) does deep subagent tracking, cron job parsing, and real JSONL analysis. Replace it:

```bash
cp OpenClaw-bot-review/app/api/agent-activity/route.ts app/api/agent-activity/route.ts
```

Note: The source version imports `@/lib/openclaw-paths` and `@/lib/json` — both now available.

- [ ] **Step 3: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No type errors from these routes.

- [ ] **Step 4: Commit**

```bash
git add app/api/config/ app/api/stats-all/ app/api/stats/ app/api/stats-models/ app/api/agent-status/ app/api/sessions/ app/api/gateway-health/ app/api/agent-activity/
git commit -m "feat(api): add core dashboard API routes (config, stats, sessions, gateway-health, agent-activity)"
```

---

## Task 5: Dashboard API Routes — Alerts, Skills, Config/Agent-Model

**Files:**
- Create: `app/api/alerts/route.ts`, `app/api/alerts/check/route.ts`, `app/api/skills/route.ts`, `app/api/skills/content/route.ts`, `app/api/config/agent-model/route.ts`

- [ ] **Step 1: Copy alerts API routes**

```bash
cp OpenClaw-bot-review/app/api/alerts/route.ts app/api/alerts/route.ts
mkdir -p app/api/alerts/check
cp OpenClaw-bot-review/app/api/alerts/check/route.ts app/api/alerts/check/route.ts
```

- [ ] **Step 2: Copy skills API routes**

```bash
mkdir -p app/api/skills/content
cp OpenClaw-bot-review/app/api/skills/route.ts app/api/skills/route.ts
cp OpenClaw-bot-review/app/api/skills/content/route.ts app/api/skills/content/route.ts
```

- [ ] **Step 3: Copy config/agent-model route**

```bash
mkdir -p app/api/config/agent-model
cp OpenClaw-bot-review/app/api/config/agent-model/route.ts app/api/config/agent-model/route.ts
```

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add app/api/alerts/ app/api/skills/ app/api/config/agent-model/
git commit -m "feat(api): add alerts, skills, and agent-model API routes"
```

---

## Task 6: Dashboard API Routes — Test Endpoints

**Files:**
- Create: `app/api/test-bound-models/route.ts`, `app/api/test-model/route.ts`, `app/api/test-platforms/route.ts`, `app/api/test-sessions/route.ts`, `app/api/test-dm-sessions/route.ts`, `app/api/test-session/route.ts`

- [ ] **Step 1: Copy all test API routes**

```bash
mkdir -p app/api/test-bound-models app/api/test-model app/api/test-platforms app/api/test-sessions app/api/test-dm-sessions app/api/test-session
cp OpenClaw-bot-review/app/api/test-bound-models/route.ts app/api/test-bound-models/route.ts
cp OpenClaw-bot-review/app/api/test-model/route.ts app/api/test-model/route.ts
cp OpenClaw-bot-review/app/api/test-platforms/route.ts app/api/test-platforms/route.ts
cp OpenClaw-bot-review/app/api/test-sessions/route.ts app/api/test-sessions/route.ts
cp OpenClaw-bot-review/app/api/test-dm-sessions/route.ts app/api/test-dm-sessions/route.ts
cp OpenClaw-bot-review/app/api/test-session/route.ts app/api/test-session/route.ts
```

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No type errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/test-bound-models/ app/api/test-model/ app/api/test-platforms/ app/api/test-sessions/ app/api/test-dm-sessions/ app/api/test-session/
git commit -m "feat(api): add test endpoint routes (models, platforms, sessions, DM)"
```

---

## Task 7: Shared UI Components

**Files:**
- Create: `app/components/agent-card.tsx`, `app/gateway-status.tsx`, `app/alert-monitor.tsx`

- [ ] **Step 1: Copy agent-card component**

```bash
mkdir -p app/components
cp OpenClaw-bot-review/app/components/agent-card.tsx app/components/agent-card.tsx
```

The agent-card component imports `@/lib/gateway-url` and `@/lib/platforms` — both exist. No edits needed.

- [ ] **Step 2: Copy gateway-status component**

```bash
cp OpenClaw-bot-review/app/gateway-status.tsx app/gateway-status.tsx
```

This imports `@/lib/i18n` — exists. No edits needed.

- [ ] **Step 3: Copy alert-monitor component**

```bash
cp OpenClaw-bot-review/app/alert-monitor.tsx app/alert-monitor.tsx
```

This is a 44-line invisible component that polls `/api/alerts/check`. No edits needed.

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add app/components/agent-card.tsx app/gateway-status.tsx app/alert-monitor.tsx
git commit -m "feat(components): add AgentCard, GatewayStatus, AlertMonitor components"
```

---

## Task 8: Dashboard — Agent Overview Page

**Files:**
- Create: `app/dashboard/page.tsx`

The source `app/page.tsx` (872 lines) is the agents dashboard. It needs to be placed at `app/dashboard/page.tsx` with link paths updated.

- [ ] **Step 1: Copy and adapt**

```bash
cp OpenClaw-bot-review/app/page.tsx app/dashboard/page.tsx
```

Then edit `app/dashboard/page.tsx` — update all internal navigation links:

| Search | Replace |
|--------|---------|
| `href="/"` | `href="/dashboard"` |
| `href="/models"` | `href="/dashboard/models"` |
| `href="/sessions"` | `href="/dashboard/sessions"` |
| `href="/stats"` | `href="/dashboard/stats"` |
| `href="/alerts"` | `href="/dashboard/alerts"` |
| `href="/skills"` | `href="/dashboard/skills"` |

Also update any `usePathname()` comparisons if present (e.g., `pathname === '/'` → `pathname === '/dashboard'`).

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/page.tsx
git commit -m "feat(dashboard): add Agent Overview page at /dashboard"
```

---

## Task 9: Dashboard — Models Page

**Files:**
- Create: `app/dashboard/models/page.tsx`

- [ ] **Step 1: Copy and adapt**

```bash
mkdir -p app/dashboard/models
cp OpenClaw-bot-review/app/models/page.tsx app/dashboard/models/page.tsx
```

Edit `app/dashboard/models/page.tsx` — update navigation links:
- `href="/"` → `href="/dashboard"`
- Any other cross-page links following the same pattern

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/models/
git commit -m "feat(dashboard): add Models page at /dashboard/models"
```

---

## Task 10: Dashboard — Sessions Page

**Files:**
- Create: `app/dashboard/sessions/page.tsx`

- [ ] **Step 1: Copy and adapt**

```bash
mkdir -p app/dashboard/sessions
cp OpenClaw-bot-review/app/sessions/page.tsx app/dashboard/sessions/page.tsx
```

Edit `app/dashboard/sessions/page.tsx` — update links:
- `href="/"` → `href="/dashboard"`
- `href="/sessions` → `href="/dashboard/sessions`
- `href="/stats` → `href="/dashboard/stats`
- The source uses `useSearchParams()` with `Suspense` — keep this pattern

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/sessions/
git commit -m "feat(dashboard): add Sessions page at /dashboard/sessions"
```

---

## Task 11: Dashboard — Stats Page

**Files:**
- Create: `app/dashboard/stats/page.tsx`

- [ ] **Step 1: Copy and adapt**

```bash
mkdir -p app/dashboard/stats
cp OpenClaw-bot-review/app/stats/page.tsx app/dashboard/stats/page.tsx
```

Edit `app/dashboard/stats/page.tsx` — update links:
- `href="/"` → `href="/dashboard"`
- `href="/stats` → `href="/dashboard/stats`
- The source uses `useSearchParams()` with `Suspense` — keep this pattern

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/stats/
git commit -m "feat(dashboard): add Stats page at /dashboard/stats"
```

---

## Task 12: Dashboard — Alerts Page

**Files:**
- Create: `app/dashboard/alerts/page.tsx`

- [ ] **Step 1: Copy and adapt**

```bash
mkdir -p app/dashboard/alerts
cp OpenClaw-bot-review/app/alerts/page.tsx app/dashboard/alerts/page.tsx
```

Edit `app/dashboard/alerts/page.tsx` — update links:
- `href="/"` → `href="/dashboard"`

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/alerts/
git commit -m "feat(dashboard): add Alerts page at /dashboard/alerts"
```

---

## Task 13: Dashboard — Skills Page

**Files:**
- Create: `app/dashboard/skills/page.tsx`

- [ ] **Step 1: Copy and adapt**

```bash
mkdir -p app/dashboard/skills
cp OpenClaw-bot-review/app/skills/page.tsx app/dashboard/skills/page.tsx
```

Edit `app/dashboard/skills/page.tsx` — update links:
- `href="/"` → `href="/dashboard"`

- [ ] **Step 2: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 3: Commit**

```bash
git add app/dashboard/skills/
git commit -m "feat(dashboard): add Skills page at /dashboard/skills"
```

---

## Task 14: Update Layout and Sidebar

**Files:**
- Modify: `app/layout.tsx`, `app/sidebar.tsx`

- [ ] **Step 1: Add AlertMonitor to global layout**

Edit `app/layout.tsx` — add import and render `AlertMonitor`:

```tsx
import { AlertMonitor } from './alert-monitor';
```

Add `<AlertMonitor />` inside the layout body (it renders null, just runs background polling):

```tsx
<AlertMonitor />
```

- [ ] **Step 2: Add GatewayStatus to sidebar**

Edit `app/sidebar.tsx` — add `GatewayStatus` import and render it in the sidebar footer area (above the language/theme switchers):

```tsx
import { GatewayStatus } from './gateway-status';
```

Add `<GatewayStatus compact />` in the sidebar footer section.

- [ ] **Step 3: Update sidebar navigation links**

The sidebar already has nav items pointing to `/dashboard`, `/dashboard/models`, etc. — verify these match the new page routes. If the sidebar uses different paths, update them.

- [ ] **Step 4: Verify build**

```bash
npx tsc --noEmit 2>&1 | head -30
```

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx app/sidebar.tsx
git commit -m "feat(layout): add AlertMonitor to layout, GatewayStatus to sidebar"
```

---

## Task 15: Full Build Verification

**Files:** None new

- [ ] **Step 1: Run full test suite**

```bash
pnpm test
```

Expected: All 30+ tests pass.

- [ ] **Step 2: Run production build**

```bash
pnpm build
```

Expected: Build succeeds with all dashboard routes listed.

- [ ] **Step 3: Smoke test production server**

```bash
pnpm start &
sleep 3

# Test dashboard API routes
curl -s http://localhost:3000/api/health | head -1
curl -s http://localhost:3000/api/config | head -1
curl -s http://localhost:3000/api/gateway-health | head -1
curl -s http://localhost:3000/api/stats-all | head -1
curl -s http://localhost:3000/api/alerts | head -1
curl -s http://localhost:3000/api/skills | head -1
curl -s http://localhost:3000/api/agent-status | head -1

kill %1
```

Expected: All endpoints return valid JSON responses.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: verify dashboard migration — all tests pass, production build succeeds"
```

---

## Checkpoint: Dashboard Migration Complete

At this point, the project has:

- **All 6 dashboard pages** at `/dashboard/*` with full functionality
- **19 dashboard API routes** serving config, stats, sessions, alerts, skills, gateway health, and test endpoints
- **Shared UI components**: AgentCard, GatewayStatus, AlertMonitor
- **6 utility libraries** for CLI integration, model probing, skills scanning
- **~170 i18n keys** across 4 locales (zh, zh-TW, en, ja)
- **Working pixel office** at `/` (from Plan 1)
- **30+ unit tests** passing
- **Production build** succeeds

**Next:** Plan 3 — Additional features (AI room decoration, asset management, Electron desktop pet, layout editor)
