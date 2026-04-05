# Vue SSR 服务端渲染

## 目录

---

## SSR 简介

**SSR（Server-Side Rendering）** 服务端渲染，指在服务器上将 Vue 组件渲染为 HTML 字符串，直接返回给浏览器，浏览器再进行"激活"（Hydration）使其具备交互能力。

### 渲染流程对比

```
CSR（客户端渲染）:
用户请求 → 返回空 HTML → 下载 JS → 执行 JS → 渲染页面 → 可交互
          （白屏等待时间长）

SSR（服务端渲染）:
用户请求 → 服务端渲染 HTML → 返回完整 HTML → 浏览器显示（首屏快）
                                             → 下载 JS → Hydration → 可交互

SSG（静态生成）:
构建时生成 → CDN 分发 → 用户请求 → 直接返回静态 HTML（最快）
```

---

## SSR vs CSR vs SSG

| 特性 | CSR | SSR | SSG |
|------|-----|-----|-----|
| **首屏速度** | 慢 | 快 | 最快 |
| **SEO 友好** | 差 | ✅ | ✅ |
| **服务器压力** | 低 | 高 | 极低 |
| **适合场景** | 后台系统 | 电商/新闻 | 博客/文档 |
| **实时数据** | ✅ | ✅ | ❌ |
| **构建复杂度** | 低 | 高 | 中 |

---

## Nuxt.js 框架

Nuxt.js 是基于 Vue 3 的全栈框架，内置 SSR/SSG/SPA 支持，是生产环境最推荐的方案。

### 1. 快速创建

```bash
npx nuxi@latest init my-nuxt-app
cd my-nuxt-app
npm install
npm run dev
```

### 2. 目录结构

```
my-nuxt-app/
├── pages/              # 基于文件的路由
│   ├── index.vue       → /
│   ├── about.vue       → /about
│   └── posts/
│       ├── index.vue   → /posts
│       └── [id].vue    → /posts/:id（动态路由）
├── components/         # 自动导入的组件
├── composables/        # 自动导入的组合式函数
├── server/
│   └── api/            # 服务端 API 路由
│       └── users.get.ts → GET /api/users
├── layouts/            # 页面布局
├── middleware/         # 路由中间件
├── plugins/            # 插件
├── public/             # 静态资源
├── assets/             # 需编译的资源
└── nuxt.config.ts
```

### 3. nuxt.config.ts 配置

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // 渲染模式
  ssr: true, // true = SSR, false = SPA

  // 运行时配置（可通过环境变量覆盖）
  runtimeConfig: {
    // 仅服务端可访问
    apiSecret: process.env.API_SECRET,
    dbUrl: process.env.DATABASE_URL,
    // 客户端也可访问（public）
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'https://api.example.com'
    }
  },

  // 模块
  modules: [
    '@pinia/nuxt',          // 状态管理
    '@nuxtjs/tailwindcss',  // 样式
    '@vueuse/nuxt'          // VueUse 组合式函数
  ],

  // 路由规则（精细控制渲染模式）
  routeRules: {
    '/': { prerender: true },           // 静态生成
    '/blog/**': { swr: 3600 },          // 增量静态再生，1小时缓存
    '/admin/**': { ssr: false },        // 管理页面用 CSR
    '/api/**': { cors: true }           // API 跨域
  },

  // Head 默认配置
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }]
    }
  }
})
```

### 4. 数据获取

```vue
<!-- pages/posts/[id].vue -->
<template>
  <article>
    <h1>{{ post?.title }}</h1>
    <p>{{ post?.content }}</p>
  </article>
</template>

<script setup lang="ts">
const route = useRoute()
const config = useRuntimeConfig()

// useFetch：SSR + 客户端都能用，自动处理 SSR 水合
const { data: post, error, pending } = await useFetch(
  `/api/posts/${route.params.id}`,
  {
    baseURL: config.public.apiBase,
    // 缓存策略
    key: `post-${route.params.id}`,
    getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key]
  }
)

// SEO Meta
useSeoMeta({
  title: () => post.value?.title,
  description: () => post.value?.summary,
  ogTitle: () => post.value?.title,
  ogImage: () => post.value?.cover
})

// 404 处理
if (error.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在' })
}
</script>
```

### 5. Server API 路由

```typescript
// server/api/posts/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // 这里是纯服务端代码，可以直接操作数据库
  const post = await db.post.findUnique({
    where: { id: Number(id) },
    include: { author: true, tags: true }
  })

  if (!post) {
    throw createError({ statusCode: 404, message: '文章不存在' })
  }

  return post
})

// server/api/posts/index.post.ts（POST 方法）
export default defineEventHandler(async (event) => {
  // 验证用户登录
  const user = await requireUser(event)

  // 读取请求体
  const body = await readBody(event)

  // 验证参数
  const { title, content } = body
  if (!title || !content) {
    throw createError({ statusCode: 400, message: '参数错误' })
  }

  return db.post.create({
    data: { title, content, authorId: user.id }
  })
})
```

### 6. 中间件

```typescript
// middleware/auth.ts（路由中间件）
export default defineNuxtRouteMiddleware((to) => {
  const user = useUser()

  if (!user.value && to.path.startsWith('/dashboard')) {
    // 未登录，重定向到登录页
    return navigateTo('/login?redirect=' + to.fullPath)
  }
})
```

```vue
<!-- 在页面中使用中间件 -->
<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
```

---

## 手动搭建 Vue SSR

> 了解 SSR 底层原理，适合深度定制场景。

### 1. 安装依赖

```bash
npm install vue @vue/server-renderer express
npm install -D vite @vitejs/plugin-vue
```

### 2. 通用应用入口

```typescript
// src/app.ts（服务端和客户端共用）
import { createSSRApp } from 'vue'
import { createRouter, createMemoryHistory, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import routes from './router/routes'

export function createApp() {
  const app = createSSRApp(App)

  const router = createRouter({
    // 服务端用 memory history，客户端用 web history
    history: import.meta.env.SSR
      ? createMemoryHistory()
      : createWebHistory(),
    routes
  })

  const pinia = createPinia()

  app.use(router)
  app.use(pinia)

  return { app, router, pinia }
}
```

### 3. 服务端入口

```typescript
// src/entry-server.ts
import { renderToString } from '@vue/server-renderer'
import { createApp } from './app'

export async function render(url: string, manifest: any) {
  const { app, router, pinia } = createApp()

  // 设置路由
  await router.push(url)
  await router.isReady()

  // 渲染为 HTML 字符串
  const ctx: any = {}
  const html = await renderToString(app, ctx)

  // 收集 SSR 期间用到的 pinia state
  const state = JSON.stringify(pinia.state.value)

  // 预加载链接
  const preloadLinks = renderPreloadLinks(ctx.modules, manifest)

  return { html, state, preloadLinks }
}

function renderPreloadLinks(modules: Set<string>, manifest: any) {
  let links = ''
  for (const id of modules) {
    const files = manifest[id]
    if (files) {
      files.forEach((file: string) => {
        if (file.endsWith('.js')) {
          links += `<link rel="modulepreload" crossorigin href="${file}">`
        } else if (file.endsWith('.css')) {
          links += `<link rel="stylesheet" href="${file}">`
        }
      })
    }
  }
  return links
}
```

### 4. 客户端入口（Hydration）

```typescript
// src/entry-client.ts
import { createApp } from './app'

const { app, router, pinia } = createApp()

// 恢复服务端的 pinia state
if (window.__INITIAL_STATE__) {
  pinia.state.value = JSON.parse(window.__INITIAL_STATE__)
}

router.isReady().then(() => {
  // 激活服务端渲染的 HTML（Hydration）
  app.mount('#app')
})
```

### 5. Express 服务器

```typescript
// server.ts
import express from 'express'
import { readFileSync } from 'fs'
import { resolve } from 'path'

const app = express()
const isProd = process.env.NODE_ENV === 'production'

// 静态资源
app.use('/assets', express.static(resolve('dist/client/assets')))

// HTML 模板
const template = readFileSync(
  resolve(isProd ? 'dist/client/index.html' : 'index.html'),
  'utf-8'
)

// SSR 路由
app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl

    // 动态导入服务端入口
    const { render } = await import('./dist/server/entry-server.js')
    const manifest = JSON.parse(
      readFileSync('dist/client/.vite/ssr-manifest.json', 'utf-8')
    )

    const { html, state, preloadLinks } = await render(url, manifest)

    // 注入到 HTML 模板
    const finalHtml = template
      .replace('<!--preload-links-->', preloadLinks)
      .replace('<!--app-html-->', html)
      .replace(
        '<!--initial-state-->',
        `<script>window.__INITIAL_STATE__ = '${state}'</script>`
      )

    res.status(200).set({ 'Content-Type': 'text/html' }).send(finalHtml)

  } catch (err: any) {
    console.error('SSR Error:', err)
    res.status(500).send('Internal Server Error')
  }
})

app.listen(3000, () => {
  console.log('🚀 SSR Server: http://localhost:3000')
})
```

---

## 数据预取

### Nuxt 数据获取对比

```typescript
// 1. useFetch - 最常用，自动 SSR + 客户端同步
const { data } = await useFetch('/api/posts')

// 2. useAsyncData - 更灵活，可以包装任意异步函数
const { data } = await useAsyncData('posts', () =>
  $fetch('/api/posts', { query: { page: 1 } })
)

// 3. $fetch - 纯粹的 HTTP 请求，不带状态管理
// 仅用于用户交互触发的请求（不用于 SSR 预取）
async function handleSubmit() {
  await $fetch('/api/posts', { method: 'POST', body: formData })
}

// 4. useLazyFetch - 非阻塞，不等待数据就渲染
const { data, pending } = useLazyFetch('/api/comments')
```

---

## SEO 优化

```vue
<script setup lang="ts">
// 方式1：useSeoMeta（推荐，类型安全）
useSeoMeta({
  title: '文章标题 - 网站名',
  description: '文章摘要描述，100-200字',
  ogTitle: '文章标题',
  ogDescription: '分享描述',
  ogImage: 'https://your-site.com/og-image.jpg',
  ogType: 'article',
  twitterCard: 'summary_large_image',
  robots: 'index, follow',
  // 文章结构化数据
  articlePublishedTime: post.value?.createdAt,
  articleAuthor: post.value?.author?.name
})

// 方式2：useHead（更灵活）
useHead({
  title: computed(() => `${post.value?.title} - MyBlog`),
  link: [
    { rel: 'canonical', href: `https://your-site.com/posts/${route.params.id}` }
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.value?.title,
        author: { '@type': 'Person', name: post.value?.author?.name }
      })
    }
  ]
})
</script>
```

### 生成 sitemap

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap'],
  sitemap: {
    hostname: 'https://your-site.com',
    routes: async () => {
      // 动态路由
      const posts = await $fetch('/api/posts?all=true')
      return posts.map((p: any) => `/posts/${p.id}`)
    }
  }
})
```

---

## 性能优化

### 缓存策略

```typescript
// nuxt.config.ts - 路由级别缓存
routeRules: {
  // 静态页面，构建时生成
  '/': { prerender: true },
  '/about': { prerender: true },

  // 增量静态再生：最多缓存 1 小时
  '/blog/**': { swr: 3600 },

  // 服务端渲染 + CDN 缓存
  '/products/**': {
    cache: { maxAge: 600 }  // 10分钟 CDN 缓存
  }
}
```

### 组件懒加载

```vue
<script setup>
// 仅客户端渲染的组件（如地图、图表）
const HeavyChart = defineAsyncComponent(() =>
  import('~/components/HeavyChart.vue')
)
</script>

<template>
  <!-- 包裹在 ClientOnly 中，避免 SSR 水合错误 -->
  <ClientOnly fallback-tag="div" fallback="加载中...">
    <HeavyChart :data="chartData" />
  </ClientOnly>
</template>
```

---

## 部署方案

### Node.js 部署

```bash
# 构建
npm run build

# 启动（Nuxt 会自动生成 .output 目录）
node .output/server/index.mjs
```

### Docker 部署

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.output ./
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
CMD ["node", "server/index.mjs"]
```

### Nginx 反向代理

```nginx
server {
    listen 80;
    server_name your-site.com;

    # 静态资源直接由 Nginx 服务
    location /_nuxt/ {
        root /app/.output/public;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 其他请求转发到 Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Vercel / Netlify 一键部署

```bash
# Vercel（零配置）
npm install -g vercel
vercel

# 或连接 GitHub 仓库，自动 CI/CD
```

---

## 常见问题

### 1. Hydration 不匹配

```vue
<!-- 问题：服务端和客户端渲染结果不一致 -->
<template>
  <!-- ❌ 错误：Date.now() 每次不同 -->
  <p>当前时间：{{ Date.now() }}</p>

  <!-- ✅ 正确：用 ClientOnly 包裹仅客户端的内容 -->
  <ClientOnly>
    <p>当前时间：{{ Date.now() }}</p>
  </ClientOnly>
</template>
```

### 2. window/document 未定义

```typescript
// ❌ 错误：SSR 环境没有 window
const width = window.innerWidth

// ✅ 正确：判断环境
if (process.client) {
  const width = window.innerWidth
}

// 或使用 onMounted（只在客户端执行）
onMounted(() => {
  const width = window.innerWidth
})
```

### 3. 第三方库 SSR 兼容

```typescript
// plugins/chart.client.ts（.client.ts 后缀 = 仅客户端加载）
import Chart from 'chart.js/auto'
export default defineNuxtPlugin(() => {
  return { provide: { chart: Chart } }
})
```
