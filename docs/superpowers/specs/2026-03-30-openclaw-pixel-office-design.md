# OpenClaw Pixel Office — 设计文档

> **版本**: 1.0.0 | **日期**: 2026-03-30 | **状态**: Draft

## 1. 项目概述

### 1.1 定位

OpenClaw Pixel Office 是一个将 **精美像素风办公室可视化** 与 **多 Agent 运维仪表盘** 合二为一的 Web 应用。它合并了两个现有项目的核心优势：

- **Star-Office-UI**: 精致的像素美术资产、Phaser 游戏引擎、环境动画系统、桌面宠物模式
- **OpenClaw-bot-review**: OpenClaw Agent 自动状态读取、监控仪表盘（7 个页面）、自研像素引擎的寻路/子 Agent 逻辑

### 1.2 核心目标

- 像素办公室视觉效果与 Star-Office-UI **完全一致**
- 自动读取 OpenClaw 本地 Agent 状态，无需手动推送
- 同时支持外部 Agent 通过 API 推送加入
- 保留两个项目的全部功能模块
- 新增 A* 寻路、子 Agent 动态生成等增强功能

### 1.3 用户场景

- **OpenClaw 用户**: 运行多 Agent 的开发者，自动读取 `~/.openclaw/` 目录，在像素办公室中看到所有 Agent 的实时工作状态
- **独立部署**: 不依赖 OpenClaw，通过手动或脚本推送状态，作为个人/团队工作状态展示看板
- **混合模式**: 本地 OpenClaw Agent + 外部 API 推送的 Agent 共存于同一个像素办公室

## 2. 技术栈

| 技术 | 用途 |
|------|------|
| Next.js (App Router) | 全栈框架，单进程部署 |
| React 19 + TypeScript | 仪表盘 UI、状态管理 |
| Phaser 3 | 像素办公室游戏引擎（替换自研 Canvas 引擎） |
| Tailwind CSS | 仪表盘样式系统 |
| Electron (可选) | 桌面宠物透明窗口 |

**为什么选 Phaser 3 而不是保留自研 Canvas 引擎**: Star-Office-UI 的全部美术资产（36 个精灵图，主角 200+ 帧动画）都是为 Phaser spritesheet 格式制作的。自研引擎使用像素数组格式，两者完全不兼容。要做到"视觉完全一致"，用 Phaser 加载原版资产是最直接的路径。自研引擎的寻路、座位分配等逻辑以独立模块形式在 Phaser 场景中重新实现。

## 3. 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Browser (用户)                           │
│                                                                 │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐ │
│  │   Pixel Office (/)   │  │     Dashboard (/dashboard/*)     │ │
│  │                      │  │                                  │ │
│  │  ┌────────────────┐  │  │  /agents    Agent 总览卡片墙     │ │
│  │  │   Phaser 3     │  │  │  /models    模型列表 & 测试      │ │
│  │  │   Game Scene   │  │  │  /sessions  会话列表             │ │
│  │  │                │  │  │  /stats     消息统计趋势图       │ │
│  │  │  · 角色动画    │  │  │  /alerts    告警中心             │ │
│  │  │  · A* 寻路     │  │  │  /skills    技能管理             │ │
│  │  │  · 子Agent     │  │  │                                  │ │
│  │  │  · 状态气泡    │  │  └──────────────────────────────────┘ │
│  │  └────────────────┘  │                                       │
│  │                      │  ┌──────────────────────────────────┐ │
│  │  昨日小记 · 访客列表 │  │     特殊功能                      │ │
│  │  装修 · 资产管理     │  │  /decorate   AI 生图装修          │ │
│  │  状态切换按钮        │  │  /electron   桌面宠物设置         │ │
│  └──────────────────────┘  └──────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP (fetch)
┌───────────────────────────┴─────────────────────────────────────┐
│                    Next.js Server (单进程)                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                   API Routes (/api/*)                       ││
│  │                                                             ││
│  │  ┌─────────────────┐  ┌──────────────────┐                 ││
│  │  │  数据源 A:      │  │  数据源 B:        │                 ││
│  │  │  OpenClaw 本地  │  │  外部 API 推送    │                 ││
│  │  │  ~/.openclaw/   │  │  POST /api/*-agent│                 ││
│  │  └────────┬────────┘  └────────┬─────────┘                 ││
│  │           └──────────┬─────────┘                            ││
│  │                      ▼                                      ││
│  │           ┌─────────────────────┐                           ││
│  │           │  Unified Agent      │                           ││
│  │           │  State Manager      │                           ││
│  │           └─────────────────────┘                           ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 3.1 路由结构

- `/` — 像素办公室（首页）
- `/dashboard` — Agent 总览卡片墙
- `/dashboard/models` — 模型列表 & 批量测试
- `/dashboard/sessions` — 会话列表
- `/dashboard/stats` — 消息统计 & 趋势图
- `/dashboard/alerts` — 告警中心
- `/dashboard/skills` — 技能管理

### 3.2 侧边栏导航

像素风格侧边栏，分组：
- **办公室**: 像素办公室（首页）
- **总览**: Agent 卡片墙、模型列表
- **监控**: 会话列表、消息统计、告警中心
- **配置**: 技能管理
- **实验功能**: 折叠菜单

底部：语言切换（zh/zh-TW/en/ja）+ 主题切换（暗色/亮色）

## 4. 像素办公室

### 4.1 场景结构

- **画布尺寸**: 1280 × 720（与 Star 原版一致）
- **背景图**: `office_bg_small.webp`（Star 原版，零修改）
- **寻路层**: 不可见的 tile 网格（40×22 tiles，每 tile 32px），叠加在背景图上
- **碰撞区**: 家具/墙壁区域标记为不可通行

**场景分区**:

| 区域 | 位置 | 用途 |
|------|------|------|
| Work Zone | 左侧工作桌区 | working/researching/executing 状态角色的工位 |
| Rest Zone | 右侧 + 中央 | idle 状态角色闲逛区域，含沙发/咖啡机 |
| Error Zone | 服务器机架区 | error 状态角色移动到此 |
| 门口 | 中部入口 | 子 Agent/访客的生成点 |

### 4.2 角色系统

#### 4.2.1 主 Agent（Star 角色）

使用 Star 原版全套精灵图，六种状态对应不同动画：

| 状态 | 精灵图 | 帧数 | 场景行为 |
|------|--------|------|----------|
| idle | star-idle-spritesheet | 30 | 休息区闲逛 |
| writing | star-working-spritesheet-grid | 192 | 坐到工位，打字 + 代码气泡 |
| researching | star-researching-spritesheet | 96 | 坐到工位，翻阅文档 |
| executing | star-working-spritesheet-grid | 192 | 工位打字加速动画 |
| syncing | sync-animation-v3-grid | 52 | 播放同步特效 |
| error | error-bug-spritesheet-grid | 96 | 移动到 Error Zone |

#### 4.2.2 OpenClaw Agent（自动发现）

- 通过读取 `~/.openclaw/` 目录自动发现
- 复用 Star 原版访客角色精灵（guest_anim_1~6），通过 hue shift 区分不同 Agent
- 每个 Agent 分配唯一配色（hue shift）
- 头顶显示 Agent 名 + Emoji
- 状态映射：working → 寻路到工位坐下，idle → 起身漫游，offline → 消失动画

#### 4.2.3 子 Agent（动态生成）

- 父 Agent 启动子任务时，从门口生成新角色
- 以 **2.8 倍速度** 跑步寻路到最近空闲工位坐下
- 头顶标注"临时工"标签 + 子任务名称
- 任务完成后起身走向门口，播放消失动画
- 父 Agent 离线时，所有子 Agent 同步消失
- 数据来源：OpenClaw session 文件中的 `session_spawn` 事件

#### 4.2.4 访客（API 推送）

- 通过 Join Key 加入（`POST /api/join-agent`）
- 使用 Star 原版 6 种访客角色（guest_role_1~6 / guest_anim_1~6）
- 每 15s 心跳推送状态（`POST /api/agent-push`）
- 5 分钟无心跳自动标记 offline 并移除
- Join Key 支持并发上限（默认 3 人）

### 4.3 A* 寻路系统

- **网格**: 40×22 tiles，每 tile 32px，覆盖在 1280×720 背景图上
- **碰撞地图**: 家具/墙壁区域标记为不可通行 tile
- **路径点**: 各工位、沙发、门口注册为命名 waypoint
- **算法**: 标准 A* 在网格上计算最短路径，角色沿路径逐 tile 移动
- **移动动画**: 移动时播放行走帧，到达目标后切换为目标状态动画
- **碰撞地图编辑**: 复用 Star 的 "Decorate Room" 编辑模式，增加碰撞区标记功能

**工位分配策略**:

1. 主 Agent: 固定工位（Star 原版位置）
2. OpenClaw Agent: 按发现顺序分配预设工位
3. 子 Agent: 就近分配最近的空闲工位
4. 访客: 从剩余工位中分配
5. 工位不足时: 角色站在工位旁，显示"没位子了"气泡

### 4.4 环境动画与特效

全部从 Star-Office-UI 原样移植：

| 元素 | 精灵图 | 行为 |
|------|--------|------|
| 壁炉 | 内嵌背景 | 持续火焰动画 |
| 咖啡机 | coffee-machine-spritesheet (96帧) | 循环动画 |
| 猫咪 | cats-spritesheet (16帧) | 窝里睡觉 + 偶尔伸懒腰 |
| 植物 | plants-spritesheet (16种) | 随机变体静态放置 |
| 海报 | posters-spritesheet (32种) | 墙面装饰 |
| 花 | flowers-bloom-v2 | 开花动画 |
| Bug 小虫 | 程序生成 | error 时出现，信息素寻路 AI |
| 代码气泡 | 程序生成 | working 状态角色头顶显示 |

### 4.5 附加功能

- **昨日小记**: 读取 `~/.openclaw/` 下的 memory 文件，提取工作要点，自动隐私脱敏（IP/邮箱/手机号/路径），附加随机语录
- **AI 生图装修**: 接入 Gemini API，基于参考图生成像素风背景，异步执行（task_id 轮询避免超时）
- **资产管理侧边栏**: 密码保护，支持上传替换美术资产（WebP/PNG/GIF），动图自动转精灵表，支持重置和回退
- **状态切换按钮**: Idle / Work / Sync / Alert 手动切换主 Agent 状态

## 5. 数据层

### 5.1 Unified State Manager

核心数据聚合模块，合并两种数据源为统一的 Agent 状态列表。

**统一类型定义**:

```typescript
interface UnifiedAgentState {
  id: string
  name: string
  emoji: string
  source: 'openclaw' | 'api-push'
  role: 'primary' | 'agent' | 'subagent' | 'visitor'
  state: 'idle' | 'writing' | 'researching'
       | 'executing' | 'syncing' | 'error' | 'offline'
  currentTool?: string
  parentId?: string
  message?: string
  model?: string
  platforms?: string[]
  lastActive: number
  tokenUsage?: { input: number; output: number }
}
```

### 5.2 数据源 A: OpenClaw 本地文件读取

**轮询频率**: 每 5 秒扫描一次

**读取路径** (`OPENCLAW_HOME` 环境变量，默认 `~/.openclaw/`):

| 文件 | 读取内容 |
|------|----------|
| `openclaw.json` | Agent 列表、模型 Provider、平台绑定 |
| `agents/{id}/IDENTITY.md` | Agent 名称（正则解析 `**Name:**`） |
| `agents/{id}/sessions/*.jsonl` | 活跃状态判断 + 工具调用解析 + 子 Agent 检测 |
| `cron/jobs.json` | Cron 任务状态 |

**状态判断规则**（基于 session 文件 mtime）:
- mtime < 2 分钟 → `working`
- mtime 2~10 分钟 → `idle`
- mtime > 10 分钟 → `offline`

**子 Agent 检测**: 解析 `.jsonl` 中的 `session_spawn` / `sessions_spawn` 工具调用，追踪子 session 文件的活动状态。

### 5.3 数据源 B: 外部 API 推送

| 端点 | 方法 | 用途 |
|------|------|------|
| `/api/join-agent` | POST | 访客加入（带 Join Key） |
| `/api/agent-push` | POST | 访客心跳 + 状态更新（建议每 15s） |
| `/api/leave-agent` | POST | 访客主动离开 |
| `/api/set-state` | POST | 主 Agent 手动切换状态 |

**TTL 自动过期**:
- 工作状态 300s 无更新 → 自动回 idle
- 访客 5 分钟无心跳 → 标记 offline 并移除

### 5.4 状态映射表

| 数据源原始状态 | 统一状态 | 像素办公室行为 |
|---------------|----------|---------------|
| OpenClaw: mtime < 2min | `writing` | 寻路到工位 → 坐下 → 打字动画 + 代码气泡 |
| OpenClaw: mtime 2~10min | `idle` | 起身离开工位 → 休息区随机漫游 |
| OpenClaw: mtime > 10min | `offline` | 播放消失动画 → 移除角色 |
| API Push: state=writing | `writing` | 同上，使用访客角色精灵 |
| API Push: state=researching | `researching` | 寻路到工位 → 坐下 → 翻阅文档动画 |
| API Push: state=executing | `executing` | 工位打字加速动画 + 终端气泡 |
| API Push: state=syncing | `syncing` | 播放 sync 特效动画 (52帧) |
| API Push: state=error | `error` | 寻路到 Error Zone → error 动画 + Bug 小虫 |

### 5.5 缓存策略

| 数据 | 缓存时间 | 存储位置 |
|------|----------|----------|
| OpenClaw 配置 (openclaw.json) | 30s | 内存 |
| Agent 活动状态 | 5s | 内存 |
| 访客列表 | 实时 | 内存 Map |

### 5.6 持久化

```
~/.openclaw/                      ← OpenClaw 原有，只读不写
  ├── openclaw.json
  ├── agents/*/sessions/*.jsonl
  └── cron/jobs.json

~/.openclaw/pixel-office/         ← 新项目写入区
  ├── state.json                  ← 主 Agent 手动状态 + 访客状态
  ├── layout.json                 ← 办公室布局（家具位置、碰撞图）
  ├── join-keys.json              ← 访客 Join Key 配置
  ├── alerts.json                 ← 告警规则
  ├── gemini-config.json          ← AI 生图配置
  └── assets/                     ← 用户上传的自定义资产
      ├── bg-history/             ← AI 生图历史
      └── custom/                 ← 用户替换的精灵图
```

## 6. API 路由

### 6.1 像素办公室 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/agents` | GET | 统一 Agent 列表（合并两种数据源） |
| `/api/agent-activity` | GET | Agent 活动状态 + 子 Agent + Cron |
| `/api/set-state` | POST | 手动切换主 Agent 状态 |
| `/api/join-agent` | POST | 访客加入（带 Join Key） |
| `/api/agent-push` | POST | 访客心跳推送 |
| `/api/leave-agent` | POST | 访客离开 |
| `/api/yesterday-memo` | GET | 昨日小记 |
| `/api/pixel-office/layout` | GET/POST | 办公室布局读写 |

### 6.2 仪表盘 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/config` | GET | OpenClaw 配置读取 |
| `/api/gateway-health` | GET | Gateway 健康检测（三级 fallback） |
| `/api/stats-all` | GET | 全局 Token 统计 |
| `/api/stats/[agentId]` | GET | 单 Agent Token 统计 |
| `/api/sessions/[agentId]` | GET | Agent 会话列表 |
| `/api/skills` | GET | 技能列表 |
| `/api/alerts` | GET/POST | 告警规则 CRUD |
| `/api/test-bound-models` | POST | 批量测试模型可用性 |
| `/api/test-platforms` | POST | 批量测试平台连通 |
| `/api/test-sessions` | POST | 批量测试 Agent 会话 |
| `/api/test-dm-sessions` | POST | 批量测试 DM Session |

### 6.3 装修 & 资产 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/config/gemini` | GET/POST | Gemini API 配置 |
| `/api/assets/generate-bg` | POST | AI 生图（异步，返回 task_id） |
| `/api/assets/generate-bg/poll` | GET | 轮询生图进度 |
| `/api/assets/upload` | POST | 上传替换美术资产 |
| `/api/assets/reset` | POST | 重置为默认资产 |
| `/api/assets/rollback` | POST | 回退上一版 |

### 6.4 系统 API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/status` | GET | 主 Agent 当前状态 |

## 7. 仪表盘页面

从 OpenClaw-bot-review 全量迁移，保留全部功能：

### 7.1 Agent 总览 (/dashboard)

- 卡片墙展示所有 Agent（名称、Emoji、模型、平台、Token 用量、响应时间）
- 4 个批量测试按钮（模型/平台/会话/DM）
- 实时任务追踪面板（子任务 + Cron 定时任务状态）
- 全局 Token 消耗趋势图（SVG 渲染，按日/周/月）
- 群聊拓扑图
- 可配置自动刷新间隔（10s/30s/1min/5min/10min）
- **新增**: 来自 API 推送的访客 Agent 也出现在卡片墙，标注来源

### 7.2 模型列表 (/dashboard/models)

- 显示所有配置的模型 Provider
- 一键测试模型可用性
- 模型 → Agent 绑定关系
- 响应延迟和成功率

### 7.3 会话列表 (/dashboard/sessions)

- Agent 会话列表，消息条数，时间线
- 支持按 Agent 筛选

### 7.4 消息统计 (/dashboard/stats)

- Token 消耗按日/周/月统计
- 纯 SVG 趋势图
- 按 Agent 筛选

### 7.5 告警中心 (/dashboard/alerts)

- 告警规则 CRUD
- 规则类型：模型不可用 / Bot 长时间无响应 / 消息失败率 / Cron 连续失败
- 飞书 Bot 通知
- 定时自动检查 + 手动触发

### 7.6 技能管理 (/dashboard/skills)

- 技能列表展示和管理

## 8. 国际化 (i18n)

四语言支持，合并两个项目的翻译：

| 语言 | 代码 | 来源 |
|------|------|------|
| 简体中文 | zh | 默认语言 |
| 繁体中文 | zh-TW | 来自 OpenClaw-bot-review |
| English | en | 两项目合并 |
| 日本語 | ja | 来自 Star-Office-UI |

翻译内容硬编码在 `lib/i18n.tsx`，通过 React Context 全局共享，语言选择存储在 localStorage。

## 9. Electron 桌面宠物

从 Star-Office-UI 迁移 `electron-shell/` 目录，作为独立可选模块：

- 透明无边框悬浮窗口（700×460 主窗口 / 220×240 迷你窗口）
- 自动拉起 Next.js 后端（或连接已运行的实例）
- 系统托盘常驻，双击切换主/迷你窗口
- 加载 `http://localhost:3000`（像素办公室首页）
- 独立 `package.json`，与主项目解耦

## 10. 安全

- 生产模式（`PIXEL_OFFICE_ENV=production`）强制校验：
  - `SESSION_SECRET`（24 字符以上，用于签名 Cookie）
  - `ASSET_DRAWER_PASS` 必须非默认值且 8 位以上
- Session Cookie: HttpOnly + SameSite=Lax，生产启用 Secure
- 资产侧边栏密码保护
- 昨日小记自动隐私脱敏（IP、邮箱、手机号、OpenID、路径）
- Join Key 并发上限控制

## 11. 部署

### 11.1 开发模式

```bash
pnpm install
pnpm dev
# → http://localhost:3000
```

### 11.2 生产构建

```bash
pnpm build
pnpm start
```

支持 `OPENCLAW_HOME` 环境变量自定义配置路径。

### 11.3 Docker

```bash
docker build -t openclaw-pixel-office .
docker run -d -p 3000:3000 \
  -v ~/.openclaw:/root/.openclaw \
  openclaw-pixel-office
```

Multi-stage build，`next build --output standalone` 最小化镜像体积。

### 11.4 桌面宠物

```bash
cd electron-shell
npm install
npm run dev
```

## 12. 项目目录结构

```
openclaw-pixel-office/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # 全局布局
│   ├── providers.tsx                 # React Context
│   ├── sidebar.tsx                   # 侧边栏导航
│   ├── page.tsx                      # 首页: 像素办公室
│   ├── pixel-office/                 # 像素办公室 React 组件
│   │   ├── PhaserGame.tsx            # Phaser ↔ React 桥接
│   │   ├── ControlPanel.tsx          # 控制面板
│   │   ├── MemoCard.tsx              # 昨日小记
│   │   └── AssetSidebar.tsx          # 资产管理
│   ├── dashboard/                    # 仪表盘页面
│   │   ├── page.tsx                  # Agent 总览
│   │   ├── models/page.tsx
│   │   ├── sessions/page.tsx
│   │   ├── stats/page.tsx
│   │   ├── alerts/page.tsx
│   │   └── skills/page.tsx
│   └── api/                          # API Routes (~25 个端点)
│       └── ...
├── lib/                              # 共享库
│   ├── state/                        # 状态管理核心
│   │   ├── unified-state-manager.ts
│   │   ├── openclaw-reader.ts
│   │   ├── api-push-store.ts
│   │   └── types.ts
│   ├── openclaw-paths.ts
│   ├── config-cache.ts
│   ├── memo-utils.ts
│   ├── security-utils.ts
│   ├── i18n.tsx
│   ├── theme.tsx
│   └── platforms.ts
├── game/                             # Phaser 引擎 (独立于 React)
│   ├── scenes/
│   │   ├── OfficeScene.ts            # 主场景
│   │   ├── BootScene.ts              # 资源预加载
│   │   └── UIScene.ts                # HUD 层
│   ├── characters/
│   │   ├── CharacterManager.ts       # 角色生命周期
│   │   ├── MainCharacter.ts          # 主 Agent
│   │   ├── AgentCharacter.ts         # OpenClaw Agent
│   │   ├── SubagentCharacter.ts      # 子 Agent
│   │   └── VisitorCharacter.ts       # 访客
│   ├── pathfinding/
│   │   ├── AStarGrid.ts
│   │   ├── CollisionMap.ts
│   │   └── SeatManager.ts
│   ├── effects/
│   │   ├── CodeBubble.ts
│   │   ├── BugSystem.ts
│   │   └── SyncEffect.ts
│   ├── bridge/
│   │   └── AgentBridge.ts            # State → 角色行为映射
│   └── config/
│       ├── sprites.ts
│       └── layout.ts
├── public/                           # 静态资源
│   ├── sprites/                      # Star 原版精灵图
│   ├── backgrounds/
│   ├── fonts/
│   ├── audio/
│   └── icons/
├── electron-shell/                   # 桌面宠物 (独立)
├── scripts/                          # 工具脚本
│   ├── set-state.ts
│   ├── agent-push.ts
│   └── smoke-test.ts
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── Dockerfile
└── docker-compose.yml
```
