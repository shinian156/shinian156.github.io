# Electron 从 0 到 1 实现桌面端应用

## 目录

---

## Electron 简介

Electron 是由 GitHub 开发的开源框架，使用 **Chromium + Node.js** 构建跨平台桌面应用，支持 Windows、macOS、Linux。

### 知名应用

| 应用 | 类型 |
|------|------|
| VS Code | 代码编辑器 |
| Figma | 设计工具 |
| Slack | 团队协作 |
| Discord | 社交通讯 |
| Postman | API 测试 |

### 架构概览

```
┌──────────────────────────────────────────────┐
│                 Electron 应用                  │
│                                               │
│  ┌─────────────────┐   ┌──────────────────┐  │
│  │   主进程 (Main)   │   │ 渲染进程 (Renderer)│  │
│  │                 │   │                  │  │
│  │  Node.js 全能力  │←→│  Chromium 浏览器   │  │
│  │  文件/系统操作   │IPC│  Vue/React UI    │  │
│  │  原生菜单/托盘   │   │  Web 技术栈       │  │
│  └─────────────────┘   └──────────────────┘  │
└──────────────────────────────────────────────┘
```

---

## 环境搭建

### 1. 创建项目

```bash
# 使用官方模板（Vue 3 + Electron）
npm create electron-vite@latest my-desktop-app
cd my-desktop-app
npm install
npm run dev
```

### 2. 项目结构

```
my-desktop-app/
├── electron/
│   ├── main/
│   │   └── index.ts       # 主进程入口
│   └── preload/
│       └── index.ts       # 预加载脚本
├── src/                   # Vue 渲染进程
│   ├── App.vue
│   └── main.ts
├── electron-builder.json  # 打包配置
└── vite.config.ts
```

### 3. package.json 关键配置

```json
{
  "main": "dist-electron/main/index.js",
  "scripts": {
    "dev": "electron-vite dev",
    "build": "electron-vite build",
    "preview": "electron-vite preview",
    "build:win": "npm run build && electron-builder --win",
    "build:mac": "npm run build && electron-builder --mac",
    "build:linux": "npm run build && electron-builder --linux"
  },
  "devDependencies": {
    "electron": "^28.0.0",
    "electron-vite": "^2.0.0",
    "electron-builder": "^24.0.0"
  }
}
```

---

## 核心概念

### 主进程 vs 渲染进程

| 特性 | 主进程 | 渲染进程 |
|------|--------|---------|
| 运行环境 | Node.js | Chromium |
| 数量 | 唯一 | 每个窗口一个 |
| 职责 | 窗口管理、系统 API | UI 渲染 |
| DOM 访问 | ❌ | ✅ |
| Node.js API | ✅ | ⚠️ 需预加载 |
| 文件系统 | ✅ | ⚠️ 通过 IPC |

### 安全模型（contextIsolation）

```
渲染进程（不信任的 Web 代码）
        │  无法直接访问 Node.js
        │
        ▼
    预加载脚本（安全桥梁）
    contextBridge.exposeInMainWorld()
        │  只暴露安全的 API
        │
        ▼
    主进程（受信任的 Node.js 代码）
```

---

## 主进程开发

### 基础窗口创建

```typescript
// electron/main/index.ts
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,           // 先隐藏，加载完再显示（避免白屏闪烁）
    frame: true,           // 是否显示系统标题栏
    titleBarStyle: 'hiddenInset', // macOS 隐藏标题栏（保留交通灯按钮）
    backgroundColor: '#ffffff',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      nodeIntegration: false,   // 禁用渲染进程中的 Node.js（安全）
      contextIsolation: true,   // 开启上下文隔离（安全）
      sandbox: false
    }
  })

  // 加载完成后显示（避免白屏）
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
    // 开发环境打开 DevTools
    if (process.env.NODE_ENV === 'development') {
      mainWindow?.webContents.openDevTools()
    }
  })

  // 加载页面
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../../dist/index.html'))
  }

  // 拦截新窗口，用系统浏览器打开外部链接
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

// App 生命周期
app.whenReady().then(() => {
  createWindow()

  // macOS：点击 Dock 图标时重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Windows/Linux：关闭所有窗口时退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

### 系统菜单

```typescript
// electron/main/menu.ts
import { Menu, MenuItemConstructorOptions, app, shell } from 'electron'

export function createMenu() {
  const isMac = process.platform === 'darwin'

  const template: MenuItemConstructorOptions[] = [
    // macOS 应用菜单
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' as const },
        { type: 'separator' as const },
        { role: 'services' as const },
        { type: 'separator' as const },
        { role: 'hide' as const },
        { role: 'hideOthers' as const },
        { role: 'unhide' as const },
        { type: 'separator' as const },
        { role: 'quit' as const }
      ]
    }] : []),
    {
      label: '文件',
      submenu: [
        {
          label: '新建',
          accelerator: 'CmdOrCtrl+N',
          click: () => { /* 处理新建 */ }
        },
        {
          label: '打开',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const { dialog } = await import('electron')
            const result = await dialog.showOpenDialog({
              properties: ['openFile'],
              filters: [{ name: 'JSON', extensions: ['json'] }]
            })
            if (!result.canceled) {
              // 通知渲染进程打开文件
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '文档',
          click: () => shell.openExternal('https://your-docs.com')
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
```

### 系统托盘

```typescript
// electron/main/tray.ts
import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'

let tray: Tray | null = null

export function createTray(mainWindow: any) {
  const icon = nativeImage.createFromPath(
    join(__dirname, '../../resources/tray-icon.png')
  )

  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        mainWindow?.show()
        mainWindow?.focus()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => app.quit()
    }
  ])

  tray.setToolTip('我的桌面应用')
  tray.setContextMenu(contextMenu)

  // 双击托盘图标显示窗口
  tray.on('double-click', () => {
    mainWindow?.show()
  })
}
```

---

## 渲染进程开发

### 预加载脚本（安全桥梁）

```typescript
// electron/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

// 向渲染进程暴露安全的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 文件操作
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  writeFile: (path: string, content: string) =>
    ipcRenderer.invoke('write-file', path, content),
  showOpenDialog: (options: any) =>
    ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options: any) =>
    ipcRenderer.invoke('show-save-dialog', options),

  // 系统信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => process.platform,

  // 监听主进程事件
  onMenuAction: (callback: (action: string) => void) => {
    ipcRenderer.on('menu-action', (_, action) => callback(action))
    // 返回取消监听函数
    return () => ipcRenderer.removeAllListeners('menu-action')
  },

  // 窗口控制（自定义标题栏用）
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close')
})

// TypeScript 类型声明
declare global {
  interface Window {
    electronAPI: {
      readFile: (path: string) => Promise<string>
      writeFile: (path: string, content: string) => Promise<void>
      showOpenDialog: (options: any) => Promise<any>
      showSaveDialog: (options: any) => Promise<any>
      getAppVersion: () => Promise<string>
      getPlatform: () => string
      onMenuAction: (callback: (action: string) => void) => () => void
      minimizeWindow: () => void
      maximizeWindow: () => void
      closeWindow: () => void
    }
  }
}
```

---

## 进程间通信（IPC）

### 主进程 IPC 处理

```typescript
// electron/main/ipc.ts
import { ipcMain, dialog, app, BrowserWindow } from 'electron'
import { readFileSync, writeFileSync } from 'fs'

export function setupIPC() {
  // 读取文件
  ipcMain.handle('read-file', async (_, filePath: string) => {
    try {
      return readFileSync(filePath, 'utf-8')
    } catch (err: any) {
      throw new Error(`读取文件失败: ${err.message}`)
    }
  })

  // 写入文件
  ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
    writeFileSync(filePath, content, 'utf-8')
  })

  // 打开文件选择对话框
  ipcMain.handle('show-open-dialog', async (event, options) => {
    const win = BrowserWindow.fromWebContents(event.sender)!
    return dialog.showOpenDialog(win, options)
  })

  // 保存文件对话框
  ipcMain.handle('show-save-dialog', async (event, options) => {
    const win = BrowserWindow.fromWebContents(event.sender)!
    return dialog.showSaveDialog(win, options)
  })

  // 获取应用版本
  ipcMain.handle('get-app-version', () => app.getVersion())

  // 窗口控制
  ipcMain.on('window-minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize()
  })

  ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.isMaximized() ? win.unmaximize() : win?.maximize()
  })

  ipcMain.on('window-close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close()
  })
}
```

### 渲染进程调用

```vue
<!-- src/components/FileEditor.vue -->
<template>
  <div class="editor">
    <div class="toolbar">
      <button @click="openFile">📂 打开</button>
      <button @click="saveFile">💾 保存</button>
    </div>
    <textarea v-model="content" class="editor-area"></textarea>
    <div class="status">{{ filePath || '未选择文件' }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const content = ref('')
const filePath = ref('')

async function openFile() {
  const result = await window.electronAPI.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: '文本文件', extensions: ['txt', 'md', 'json'] },
      { name: '所有文件', extensions: ['*'] }
    ]
  })

  if (!result.canceled && result.filePaths.length > 0) {
    filePath.value = result.filePaths[0]
    content.value = await window.electronAPI.readFile(filePath.value)
  }
}

async function saveFile() {
  if (!filePath.value) {
    const result = await window.electronAPI.showSaveDialog({
      defaultPath: 'untitled.txt',
      filters: [{ name: '文本文件', extensions: ['txt'] }]
    })
    if (result.canceled) return
    filePath.value = result.filePath
  }

  await window.electronAPI.writeFile(filePath.value, content.value)
  // 显示保存成功提示
}
</script>
```

---

## 原生功能集成

### 通知

```typescript
// 主进程发送系统通知
import { Notification } from 'electron'

export function showNotification(title: string, body: string) {
  if (Notification.isSupported()) {
    new Notification({
      title,
      body,
      icon: join(__dirname, '../../resources/icon.png')
    }).show()
  }
}
```

### 全局快捷键

```typescript
import { globalShortcut, app } from 'electron'

app.whenReady().then(() => {
  // 注册全局快捷键（即使应用不在前台也生效）
  globalShortcut.register('CommandOrControl+Shift+F', () => {
    mainWindow?.show()
    mainWindow?.focus()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
```

### 文件拖放

```typescript
// 渲染进程处理文件拖放
document.addEventListener('dragover', (e) => e.preventDefault())
document.addEventListener('drop', (e) => {
  e.preventDefault()
  const files = Array.from(e.dataTransfer?.files || [])
  files.forEach(file => {
    console.log('拖入文件:', file.path)
    // 处理文件...
  })
})
```

### 自动更新

```typescript
// electron/main/updater.ts
import { autoUpdater } from 'electron-updater'
import { ipcMain } from 'electron'

export function setupAutoUpdater(mainWindow: any) {
  autoUpdater.autoDownload = false  // 手动触发下载

  // 检查更新
  autoUpdater.checkForUpdates()

  autoUpdater.on('update-available', (info) => {
    // 通知渲染进程有新版本
    mainWindow?.webContents.send('update-available', info)
  })

  autoUpdater.on('download-progress', (progress) => {
    mainWindow?.webContents.send('download-progress', progress)
  })

  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update-downloaded')
  })

  // 渲染进程触发下载
  ipcMain.on('start-download', () => {
    autoUpdater.downloadUpdate()
  })

  // 渲染进程触发安装重启
  ipcMain.on('quit-and-install', () => {
    autoUpdater.quitAndInstall()
  })
}
```

---

## 打包与发布

### electron-builder 配置

```json
{
  "appId": "com.yourcompany.appname",
  "productName": "我的桌面应用",
  "copyright": "Copyright © 2024 YourCompany",
  "directories": {
    "output": "release"
  },
  "files": [
    "dist/**/*",
    "dist-electron/**/*"
  ],
  "extraResources": [
    { "from": "resources/", "to": "resources/" }
  ],
  "win": {
    "target": [
      { "target": "nsis", "arch": ["x64", "ia32"] }
    ],
    "icon": "resources/icon.ico",
    "requestedExecutionLevel": "asInvoker"
  },
  "mac": {
    "target": [
      { "target": "dmg", "arch": ["x64", "arm64"] }
    ],
    "icon": "resources/icon.icns",
    "category": "public.app-category.productivity",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "resources/entitlements.mac.plist"
  },
  "linux": {
    "target": ["AppImage", "deb", "rpm"],
    "icon": "resources/icon.png",
    "category": "Utility"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "installerIcon": "resources/installer-icon.ico"
  },
  "publish": {
    "provider": "github",
    "owner": "your-username",
    "repo": "your-repo"
  }
}
```

### 打包命令

```bash
# 打包当前平台
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux

# 打包所有平台（需要对应 OS 环境或 CI）
npm run build -- --win --mac --linux
```

### GitHub Actions 自动发布

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - name: Build & Release
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: npm run build && npx electron-builder --publish always
```

---

## 性能优化

```typescript
// 1. 延迟加载非关键模块
app.whenReady().then(async () => {
  createWindow()
  // 窗口显示后再加载其他功能
  mainWindow?.once('ready-to-show', async () => {
    const { createTray } = await import('./tray')
    createTray(mainWindow)
    const { setupAutoUpdater } = await import('./updater')
    setupAutoUpdater(mainWindow)
  })
})

// 2. 预加载关键资源
mainWindow.webContents.session.preconnect({
  url: 'https://api.your-server.com'
})

// 3. 启用硬件加速（默认开启，必要时关闭）
// app.disableHardwareAcceleration() // 仅在渲染异常时使用
```
