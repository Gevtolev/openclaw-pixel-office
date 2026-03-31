const { app, BrowserWindow, Tray, Menu, ipcMain, shell, nativeImage } = require('electron');
const net = require('net');

const APP_NAME = 'OpenClaw Pixel Office';
const APP_HOST = process.env.PIXEL_OFFICE_HOST || '127.0.0.1';
const rawPort = Number(process.env.PIXEL_OFFICE_PORT || 3000);
const APP_PORT = Number.isFinite(rawPort) && rawPort > 0 ? rawPort : 3000;
const APP_BASE_URL = `http://${APP_HOST}:${APP_PORT}`;

let mainWindow = null;
let miniWindow = null;
let tray = null;
let isQuitting = false;
let currentUiLang = 'zh';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function tcpReachable(host, port, timeoutMs = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const done = (ok) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, host);
  });
}

async function waitServerReady(timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await tcpReachable(APP_HOST, APP_PORT, 400)) return true;
    await sleep(300);
  }
  return false;
}

async function readAgentState() {
  try {
    const http = require('http');
    return await new Promise((resolve, reject) => {
      const req = http.get(`${APP_BASE_URL}/api/agents`, { timeout: 1200 }, (res) => {
        let buf = '';
        res.on('data', (chunk) => { buf += chunk; });
        res.on('end', () => {
          try { resolve(JSON.parse(buf)); } catch (e) { reject(e); }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    });
  } catch {
    return null;
  }
}

function createWindows() {
  const preloadPath = require('path').join(__dirname, 'preload.js');

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    x: 80,
    y: 60,
    transparent: false,
    frame: true,
    alwaysOnTop: false,
    resizable: true,
    maximizable: true,
    fullscreenable: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.setTitle(APP_NAME);

  miniWindow = new BrowserWindow({
    width: 220,
    height: 240,
    minWidth: 180,
    minHeight: 200,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  miniWindow.setTitle('OpenClaw Pixel Office Mini');

  const v = Date.now();
  mainWindow.loadURL(`${APP_BASE_URL}/?desktop=1&v=${v}`);
  miniWindow.loadURL(`${APP_BASE_URL}/?mini=1`);
}

function createTray() {
  try {
    const iconPath = require('path').join(__dirname, 'icon.png');
    const fs = require('fs');
    if (!fs.existsSync(iconPath)) return;

    const trayImage = nativeImage.createFromPath(iconPath);
    if (trayImage.isEmpty()) return;

    tray = new Tray(trayImage);
    tray.setToolTip(APP_NAME);

    const menu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => {
          if (miniWindow && !miniWindow.isDestroyed()) miniWindow.hide();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.focus();
          }
        },
      },
      {
        label: '切换 Mini 模式',
        click: () => {
          if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
          if (miniWindow && !miniWindow.isDestroyed()) {
            miniWindow.show();
            miniWindow.focus();
          }
        },
      },
      { type: 'separator' },
      { label: '退出', click: () => app.quit() },
    ]);

    tray.setContextMenu(menu);
    tray.on('click', () => {
      if (!mainWindow || mainWindow.isDestroyed()) return;
      if (mainWindow.isVisible()) mainWindow.hide();
      else {
        if (miniWindow && !miniWindow.isDestroyed()) miniWindow.hide();
        mainWindow.show();
        mainWindow.focus();
      }
    });
  } catch (e) {
    console.warn('Tray creation skipped:', e.message);
  }
}

function registerIpc() {
  const applyMainWindowMode = (expanded) => {
    if (!mainWindow || mainWindow.isDestroyed()) return;
    const bounds = mainWindow.getBounds();
    const targetHeight = expanded ? 800 : 720;
    mainWindow.setSize(bounds.width || 1280, targetHeight, true);
    mainWindow.setContentSize(bounds.width || 1280, targetHeight, true);
  };

  ipcMain.handle('tauri:invoke', async (_event, payload) => {
    const cmd = payload && payload.command;
    const args = (payload && payload.args) || {};

    if (cmd === 'read_state') {
      const state = await readAgentState();
      return { ...(state || {}), ui_lang: currentUiLang };
    }

    if (cmd === 'set_ui_lang') {
      const lang = String(args && args.lang ? args.lang : '').toLowerCase();
      if (['zh', 'zh-tw', 'en', 'ja'].includes(lang)) currentUiLang = lang;
      return { ok: true, lang: currentUiLang };
    }

    if (cmd === 'enter_minimize_mode') {
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.hide();
      if (miniWindow && !miniWindow.isDestroyed()) {
        miniWindow.show();
        miniWindow.focus();
      }
      return null;
    }

    if (cmd === 'restore_main_window') {
      if (miniWindow && !miniWindow.isDestroyed()) miniWindow.hide();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.show();
        mainWindow.focus();
      }
      return null;
    }

    if (cmd === 'close_app') {
      app.quit();
      return null;
    }

    if (cmd === 'open_external_url') {
      if (args && args.url) await shell.openExternal(args.url);
      return null;
    }

    if (cmd === 'set_main_window_mode') {
      const senderWin = BrowserWindow.fromWebContents(_event.sender);
      if (!senderWin || !mainWindow || senderWin.id !== mainWindow.id) return null;
      applyMainWindowMode(!!(args && args.expanded));
      return null;
    }

    throw new Error(`Unsupported invoke command: ${cmd}`);
  });

  ipcMain.handle('window:set-size', (event, payload) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return null;
    const width = Number(payload && payload.width);
    const height = Number(payload && payload.height);
    if (Number.isFinite(width) && Number.isFinite(height)) {
      win.setSize(Math.round(width), Math.round(height), true);
      win.setContentSize(Math.round(width), Math.round(height), true);
    }
    return null;
  });

  ipcMain.handle('window:get-position', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { x: 0, y: 0 };
    const [x, y] = win.getPosition();
    return { x, y };
  });

  ipcMain.handle('window:set-position', (event, payload) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return null;
    const x = Number(payload && payload.x);
    const y = Number(payload && payload.y);
    if (Number.isFinite(x) && Number.isFinite(y)) {
      win.setPosition(Math.round(x), Math.round(y), false);
    }
    return null;
  });
}

async function bootstrap() {
  console.log(`Connecting to ${APP_BASE_URL}`);
  const ready = await waitServerReady(30000);
  if (!ready) {
    console.warn(`Server at ${APP_BASE_URL} not reachable within 30s — opening anyway`);
  }

  registerIpc();
  createWindows();
  createTray();
}

app.on('window-all-closed', (e) => {
  if (!isQuitting) e.preventDefault();
});

app.on('before-quit', () => {
  isQuitting = true;
});

if (app.setName) app.setName(APP_NAME);
app.whenReady().then(bootstrap);
