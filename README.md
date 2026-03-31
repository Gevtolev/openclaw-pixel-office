# OpenClaw Pixel Office

## 开发模式

```bash
# 安装依赖
pnpm install

# 启动开发服务器（带热更新）
pnpm dev
# 访问 http://localhost:3000
```

---

## Docker 部署

```bash
# 构建并启动（~/.openclaw 挂载至容器）
docker compose up --build -d
# 访问 http://localhost:3000
```

**生产环境安全要求**（设置 `PIXEL_OFFICE_ENV=production` 时）：
- `SESSION_SECRET` — 至少 24 字符
- `ASSET_DRAWER_PASS` — 至少 8 字符，且不能为默认值 `openclaw`

```bash
export SESSION_SECRET="your-very-long-random-secret-here"
export ASSET_DRAWER_PASS="your-strong-pass"
export PIXEL_OFFICE_ENV=production
docker compose up --build -d
```

## Electron 桌面端

需先在本地启动 Next.js 服务（`pnpm dev` 或 `pnpm start`），再启动 Electron：

```bash
cd electron-shell
npm install
npm start
```

默认连接 `http://localhost:3000`。通过 `PIXEL_OFFICE_PORT` 环境变量修改端口。
