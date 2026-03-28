# Vite 构建工具

## 目录

1. [Vite 简介](#vite-简介)
2. [Vite vs Webpack](#vite-vs-webpack)
3. [快速开始](#快速开始)
4. [配置文件](#配置文件)
5. [核心功能](#核心功能)
6. [插件系统](#插件系统)
7. [构建优化](#构建优化)
8. [环境变量](#环境变量)
9. [部署](#部署)
10. [最佳实践](#最佳实践)

---

## Vite 简介

### 1.1 什么是 Vite？

Vite（法语意为 "快速的"）是一个新一代前端构建工具，使用 ES Modules 和 Rollup 进行开发和生产构建。

### 1.2 核心优势

- **极速的服务启动**：无需打包，基于 ES Modules 即时启动
- **轻量快速的热更新**：无论项目大小，HMR 始终保持快速
- **丰富的功能**：支持 TypeScript、JSX、CSS 预处理器等
- **优化的构建**：使用 Rollup 打包，输出优化、静态资源处理

### 1.3 适用场景

- Vue / React / Preact 等现代前端框架
- 需要 HMR 快速反馈的开发环境
- SPA（单页应用）项目
- 需要快速构建的中小型项目

---

## Vite vs Webpack

### 2.1 构建模式对比

| 特性 | Webpack | Vite |
|------|---------|------|
| 开发模式 | 打包所有模块 | 按需编译（ESM） |
| 热更新 | 需重新打包模块 | 只更新变化部分 |
| 启动速度 | 慢（大项目明显） | 快（几乎秒开） |
| 构建速度 | 中等 | 快（基于 Rollup） |
| 配置复杂度 | 高 | 低（开箱即用） |
| 生态成熟度 | 成熟 | 快速增长 |

### 2.2 技术原理对比

#### Webpack 开发模式
```
入口文件 → 解析依赖 → 打包所有模块 → 输出 bundle → 启动服务器
（慢：需要打包整个项目）
```

#### Vite 开发模式
```
浏览器请求 → 按需编译模块 → 返回 ES Module
（快：只编译当前需要的模块）
```

### 2.3 何时选择 Vite？

**推荐使用 Vite：**
- 新项目
- Vue 3 / React 18 项目
- 追求极致开发体验
- SPA 项目

**推荐使用 Webpack：**
- 复杂的企业级项目
- 需要 Loader 的复杂转换
- 有大量 Webpack 生态依赖
- 需要特定的构建优化

---

## 快速开始

### 3.1 创建项目

```bash
# 使用 npm
npm create vite@latest my-vue-app -- --template vue

# 使用 yarn
yarn create vite my-vue-app --template vue

# 使用 pnpm
pnpm create vite my-vue-app --template vue
```

### 3.2 可用模板

```bash
# Vue
npm create vite@latest my-app -- --template vue
npm create vite@latest my-app -- --template vue-ts

# React
npm create vite@latest my-app -- --template react
npm create vite@latest my-app -- --template react-ts

# Preact
npm create vite@latest my-app -- --template preact

# Svelte
npm create vite@latest my-app -- --template svelte

# 其他
npm create vite@latest my-app -- --template vanilla
npm create vite@latest my-app -- --template vanilla-ts
```

### 3.3 启动项目

```bash
cd my-app

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

---

## 配置文件

### 4.1 vite.config.js

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],

  // 路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components')
    }
  },

  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // 构建配置
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus']
        }
      }
    }
  },

  // CSS 配置
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      }
    }
  }
})
```

### 4.2 TypeScript 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import type { UserConfig } from 'vite'

export default defineConfig({
  plugins: [vue()],
  // ... 配置
}) as UserConfig
```

---

## 核心功能

### 5.1 静态资源处理

#### 导入资源

```javascript
// 导入图片
import logo from './assets/logo.png'

// 动态导入
const modules = import.meta.glob('./dir/*.js')

// 懒加载
const image = new URL('./image.png', import.meta.url).href
```

#### Base URL

```javascript
// vite.config.js
export default defineConfig({
  base: '/my-app/' // 部署到子目录
})
```

### 5.2 CSS 处理

#### CSS Modules

```vue
<style module>
.title {
  color: red;
}
</style>

<script>
// 组件中
console.log(this.$style.title)
</script>
```

#### CSS Preprocessors

```javascript
// vite.config.js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`
      },
      less: {
        modifyVars: {
          'primary-color': '#1890ff'
        }
      }
    }
  }
})
```

### 5.3 HMR API

```javascript
// 自定义 HMR 处理
if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    console.log('模块已更新')
  })

  import.meta.hot.dispose(() => {
    // 清理逻辑
  })
}
```

---

## 插件系统

### 6.1 常用插件

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

export default defineConfig({
  plugins: [
    vue(),

    // 自动导入组件
    Components({
      resolvers: [ElementPlusResolver()]
    }),

    // 自动导入 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts'
    }),

    // SVG 图标
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/icons')],
      symbolId: 'icon-[dir]-[name]'
    }),

    // Mock 数据
    viteMockServe({
      mockPath: 'mock',
      enable: true
    })
  ]
})
```

### 6.2 开发自定义插件

```javascript
// my-plugin.js
export default function myPlugin() {
  return {
    name: 'my-plugin',
    transform(code, id) {
      if (id.endsWith('.js')) {
        // 转换代码
        return code.replace(/foo/g, 'bar')
      }
    }
  }
}

// vite.config.js
import myPlugin from './my-plugin'

export default defineConfig({
  plugins: [myPlugin()]
})
```

---

## 构建优化

### 7.1 代码分割

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
```

### 7.2 构建产物分析

```bash
npm install rollup-plugin-visualizer -D
```

```javascript
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
})
```

### 7.3 压缩优化

```javascript
export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

### 7.4 预加载指令

```html
<link rel="modulepreload" href="/assets/vendor.js">
<link rel="prefetch" href="/assets/about.js">
```

---

## 环境变量

### 8.1 使用环境变量

```javascript
// .env
VITE_API_URL=https://api.example.com
VITE_APP_TITLE=My App

// 访问环境变量
console.log(import.meta.env.VITE_API_URL)
```

### 8.2 环境变量文件

```
.env                # 所有环境
.env.local          # 所有环境（被 git 忽略）
.env.development    # 开发环境
.env.production     # 生产环境
.env.staging        # 预发布环境
```

### 8.3 类型定义

```typescript
// src/env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

## 部署

### 9.1 静态托管

```bash
# 构建
npm run build

# 部署到 Vercel
npm i -g vercel
vercel

# 部署到 Netlify
npm i -g netlify-cli
netlify deploy --prod
```

### 9.2 部署到子目录

```javascript
// vite.config.js
export default defineConfig({
  base: '/sub-directory/'
})
```

### 9.3 服务器配置

#### Nginx 配置

```nginx
server {
  listen 80;
  server_name example.com;

  root /var/www/html;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

#### Apache 配置

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 最佳实践

### 10.1 项目结构

```
my-app/
├── public/           # 静态资源
├── src/
│   ├── assets/       # 资源文件
│   ├── components/   # 组件
│   ├── composables/   # 组合式函数
│   ├── router/       # 路由
│   ├── stores/       # 状态管理
│   ├── styles/       # 全局样式
│   ├── utils/        # 工具函数
│   ├── views/        # 页面
│   ├── App.vue
│   └── main.ts
├── .env              # 环境变量
├── index.html
├── package.json
└── vite.config.js
```

### 10.2 性能优化建议

- 使用 CDN 加速
- 开启 Gzip 压缩
- 合理配置缓存策略
- 按需加载路由和组件
- 优化图片资源
- 使用 Web Workers 处理复杂计算

### 10.3 常见问题

#### Q: 如何解决跨域问题？
```javascript
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://backend.com',
        changeOrigin: true
      }
    }
  }
})
```

#### Q: 如何兼容旧浏览器？
```javascript
// vite.config.js
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ]
})
```

#### Q: 如何配置多入口？
```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        admin: path.resolve(__dirname, 'admin.html')
      }
    }
  }
})
```

---

## 总结

Vite 的核心优势：
- 开发体验极佳（快速启动、HMR）
- 配置简单（开箱即用）
- 生态丰富（插件支持良好）
- 构建高效（基于 Rollup）

推荐资源：
- Vite 官方文档：https://cn.vitejs.dev/
- Vite 生态：https://vitejs.dev/plugins/

---

**知识点:**
- Vite
- 构建工具
- ESM
- HMR
- 插件系统
- 开发体验
- 构建优化
