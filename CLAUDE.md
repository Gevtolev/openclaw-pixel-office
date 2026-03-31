# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 常用命令

```bash
pnpm dev          # 启动开发服务器（Turbopack 热更新）
pnpm build        # 生产构建
pnpm test         # 运行全部测试（~0.5s，无需 dev server）
pnpm test:watch   # 测试监听模式

# 运行单个测试文件
pnpm test tests/unit/security-utils.test.ts
pnpm test tests/game/bridge/AgentBridge.test.ts

# TypeScript 类型检查
pnpm exec tsc --noEmit
```

---

## 开发规则

**提交前必须通过测试：**
- 每次提交前至少运行 `pnpm test` 确保全部通过
- 修改 Phaser 游戏逻辑（`game/`）后必须用浏览器实际启动验证角色行为正常

**UI 改动必须用浏览器验证：**
- 修改组件、样式、布局后，必须用 playwright MCP 打开 `http://localhost:3000` 截图确认渲染正确，并检查 console 无报错
- 涉及交互改动（按钮、表单、Phaser 点击）需通过 playwright 模拟操作验证

**新增 Phaser 功能前确认渲染限制：**
- Phaser 及所有游戏代码（`game/`）只能在客户端运行，不能在 Server Component 或 API 路由中 import
- 新增 Scene、Effect、Character 类后，必须在 `game/config/sprites.ts` 注册资源，否则 BootScene 不会预加载

**commit 信息规范：**
- 标题行使用 conventional commits（`feat/fix/refactor/docs/test/chore`）
- body 说明改了什么、为什么改、影响范围；修复 bug 需说明根因

---

## 改动自查

完成代码修改后，提交前确认：

| 改动类型 | 需要同步的地方 |
|---------|--------------|
| 新增 UI 文案 | `lib/i18n.tsx` 补全 **4 个语言**（zh / zh-TW / en / ja） |
| 新增精灵/图片资源 | `game/config/sprites.ts` 注册到 `SPRITES` 或 `IMAGES` |
| 调整游戏坐标/布局 | `game/config/layout.ts`（`ZONES`、`FURNITURE`、`SEATS`） |
| 新增 API 路由 | 添加 `export const dynamic = 'force-dynamic'` |
| 资源上传/删除路由 | 调用 `isAllowedAssetFilename()` 校验扩展名 |
| 组件样式 | 使用 CSS 变量（`--card`、`--border`、`--accent` 等），**禁止硬编码颜色** |

---

## 项目架构

### 整体定位

Next.js 16 (App Router) 的 web 仪表板，核心功能是把 OpenClaw AI agent 渲染成像素风格角色，在 Phaser 3 的 2D 办公室场景里实时显示其状态。同时包含 agent 监控、会话、模型、统计、告警、技能等管理页面。

### 关键配置

- `next.config.mjs`：`output: 'standalone'`（Docker 部署必需）；webpack `fs/path: false` fallback（防止 Node 内置模块打包进客户端，Phaser 必须纯客户端运行）
- `vitest.config.ts`：`environment: 'node'`，无 jsdom；`@` 别名指向项目根目录
- `instrumentation.ts`：Next.js 启动钩子，生产环境（`PIXEL_OFFICE_ENV=production`）校验 `SESSION_SECRET` 和 `ASSET_DRAWER_PASS`，不满足直接 `process.exit(1)`

### Phaser 游戏集成

Phaser 必须完全客户端运行，`app/pixel-office/PhaserGame.tsx` 通过 `useEffect` + `import('phaser')` 动态导入实现。三个 Scene 的职责：

- **`BootScene`**：预加载 `game/config/sprites.ts` 里注册的全部资源，完成后同时启动 OfficeScene 和 UIScene
- **`OfficeScene`**：渲染办公室背景和家具，每 2 秒轮询 `/api/agents`，将结果传给 `CharacterManager.syncAgents()`
- **`UIScene`**：独立 HUD 图层，左上角显示主 agent 的当前状态文字

### Agent 状态数据流

`UnifiedStateManager`（`lib/state/unified-state-manager.ts`）是进程级单例，合并两个数据源：

1. **文件系统**（`openclaw-reader.ts`）：扫描 `~/.openclaw/agents/*/sessions/*.jsonl`，根据最近会话文件的 mtime 推断状态（< 2 分钟 = writing，< 10 分钟 = idle，否则 offline），读取结果缓存 5 秒（`CacheEntry<T>`，见 `lib/config-cache.ts`）
2. **API 推送**（`api-push-store.ts`）：外部 agent 通过 `POST /api/join-agent` 注册、`POST /api/agent-push` 推送状态，5 分钟无心跳自动过期；openclaw 源的 agent 优先级高于推送源

`OfficeScene` → `/api/agents` → `AgentBridge.diffAgents()` 计算增删改集合 → `mapAgentToAction()` 将 state 字符串映射为 `CharacterAction` → `CharacterManager` 驱动 A* 寻路和特效。

### 游戏配置入口

新增精灵或调整坐标时必须修改这两个文件：
- `game/config/sprites.ts`：精灵表/图片资源注册（`SPRITES` / `IMAGES`），BootScene 预加载读取此处
- `game/config/layout.ts`：`GAME_WIDTH/HEIGHT`、`TILE_SIZE`、`ZONES`、`FURNITURE`、`SEATS` 等坐标定义

### i18n 系统

`lib/i18n.tsx` 包含全部翻译（zh / zh-TW / en / ja），**硬编码在同一个文件里**，不读取外部 JSON。`t(key)` 缺失时按 `locale → zh → key` 顺序降级。新增文案需同时补全 4 个语言。

### CSS 主题变量

`app/globals.css` 定义 CSS 自定义属性（`--card`、`--border`、`--accent`、`--text`、`--text-muted` 等），通过 `ThemeProvider`（`lib/theme.tsx`）切换 `<html data-theme>` 触发。**组件样式必须用这些变量，不要写死颜色值。**

### OpenClaw 集成

- `lib/openclaw-paths.ts`：解析 `~/.openclaw` 路径（`$OPENCLAW_HOME` 可覆盖），读取 `openclaw.json`、`agents/` 目录结构
- `lib/openclaw-cli.ts`：跨平台执行 `openclaw` CLI，`parseJsonFromMixedOutput()` 从混合输出中稳健提取 JSON
- 所有 API 路由均设置 `export const dynamic = 'force-dynamic'` 禁用缓存

### 资源管理 API

`app/api/assets/` 下的路由通过 `x-asset-pass` 请求头做密码校验（`lib/asset-utils.ts` 的 `checkPassword()`）。上传/删除文件时必须调用 `isAllowedAssetFilename()` 校验扩展名（允许 `.webp/.png/.jpg/.jpeg`）。

### 部署

- **Docker**：两阶段构建，运行阶段复制 `.next/standalone`；`~/.openclaw` 挂载进容器（**可读写**，写入 layout、assets、gemini 配置等）
- **Electron**：`electron-shell/` 包装本地运行的 Next.js 服务器（默认 `http://localhost:3000`，`PIXEL_OFFICE_PORT` 可覆盖），需单独 `npm install`

---

## 测试说明

测试文件位于 `tests/`，目录结构镜像源码。没有浏览器/E2E 测试，全部为纯 Node 单元测试。覆盖范围：`CacheEntry`、`validateProductionConfig`、`AgentBridge`、`AStarGrid`、`SeatManager`、`ApiPushStore`、`openclaw-reader`、`UnifiedStateManager`、`AgentCharacter` 精灵/染色哈希。

新增测试文件放在对应的 `tests/` 子目录，导入路径用 `@/` 别名。
