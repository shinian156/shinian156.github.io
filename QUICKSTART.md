# Frontend Tech Blog 从0到1开发指南

## 目录

1. [项目初始化](#项目初始化)
2. [项目结构搭建](#项目结构搭建)
3. [核心功能开发](#核心功能开发)
4. [样式开发](#样式开发)
5. [测试与优化](#测试与优化)
6. [部署上线](#部署上线)

---

## 项目初始化

### 1. 创建项目目录

```bash
# 创建项目根目录
mkdir D:\v3\frontend-blog
cd D:\v3\frontend-blog
```

### 2. 初始化 Vite 项目

```bash
# 使用 Vite 创建 Vue 3 + TypeScript 项目
npm create vite@latest . -- --template vue-ts
```

### 3. 安装项目依赖

```bash
# 安装核心依赖
npm install vue vue-router pinia

# 安装开发依赖
npm install -D @vitejs/plugin-vue typescript vue-tsc @types/node

# 如果需要 UI 组件库（可选）
npm install element-plus
```

### 4. 配置项目文件

#### 4.1 更新 `package.json`

```json
{
  "name": "frontend-tech-knowledge-base",
  "version": "1.0.0",
  "description": "前端开发技术知识库",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "vue-tsc --noEmit"
  }
}
```

#### 4.2 配置 `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    open: true
  }
})
```

#### 4.3 配置 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 项目结构搭建

### 1. 创建基础目录结构

```bash
# 创建所有必要的目录
mkdir src\views
mkdir src\router
mkdir src\stores
mkdir src\components
mkdir src\utils
mkdir posts
```

### 2. 创建入口文件

#### 2.1 更新 `src/main.ts`

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

const app = createApp(App)

// 使用插件
app.use(createPinia())
app.use(router)

// 挂载应用
app.mount('#app')
```

#### 2.2 创建 `src/App.vue`

```vue
<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 根组件
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
```

### 3. 创建路由配置

#### 3.1 创建 `src/router/index.ts`

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: '/article/:id',
    name: 'article',
    component: () => import('@/views/Article.vue'),
    meta: { title: '文章详情' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 前端技术知识库`
  }
  next()
})

export default router
```

### 4. 创建状态管理

#### 4.1 创建 `src/stores/article.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Article {
  id: string
  title: string
  category: string
  content: string
}

export const useArticleStore = defineStore('article', () => {
  const articles = ref<Article[]>([])
  const currentArticle = ref<Article | null>(null)

  // 获取所有文章
  const getAllArticles = computed(() => articles.value)

  // 根据ID获取文章
  const getArticleById = (id: string) => {
    return articles.value.find(article => article.id === id)
  }

  // 设置当前文章
  const setCurrentArticle = (article: Article) => {
    currentArticle.value = article
  }

  return {
    articles,
    currentArticle,
    getAllArticles,
    getArticleById,
    setCurrentArticle
  }
})
```

---

## 核心功能开发

### 1. 创建页面组件

#### 1.1 创建 `src/views/Home.vue`

```vue
<template>
  <div class="home">
    <header class="header">
      <h1>前端技术知识库</h1>
      <p>系统化学习前端开发，从基础到进阶</p>
    </header>

    <main class="content">
      <div class="categories">
        <div
          v-for="category in categories"
          :key="category.name"
          class="category"
        >
          <h2>{{ category.name }}</h2>
          <ul class="article-list">
            <li v-for="article in category.articles" :key="article.id">
              <router-link :to="`/article/${article.id}`">
                {{ article.title }}
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Article {
  id: string
  title: string
}

interface Category {
  name: string
  articles: Article[]
}

const categories = ref<Category[]>([
  {
    name: '前端框架',
    articles: [
      { id: '01-Vue', title: 'Vue' },
      { id: '02-uni-app', title: 'uni-app' }
    ]
  },
  {
    name: 'JavaScript 核心',
    articles: [
      { id: '06-JavaScript', title: 'JavaScript' },
      { id: '07-JavaScript高级特性', title: 'JavaScript 高级特性' },
      { id: '08-ES6', title: 'ES6' }
    ]
  }
  // ... 其他分类
])
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 3rem;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.categories {
  display: grid;
  gap: 2rem;
}

.category {
  background: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
}

.category h2 {
  margin-bottom: 1rem;
}

.article-list {
  list-style: none;
  padding: 0;
}

.article-list li {
  padding: 0.5rem 0;
}

.article-list a {
  color: #42b883;
  text-decoration: none;
}

.article-list a:hover {
  text-decoration: underline;
}
</style>
```

#### 1.2 创建 `src/views/Article.vue`

```vue
<template>
  <div class="article">
    <div v-if="loading">加载中...</div>
    <div v-else-if="article">
      <header class="article-header">
        <h1>{{ article.title }}</h1>
        <p class="meta">{{ article.category }}</p>
      </header>
      <div class="article-content" v-html="article.content"></div>
    </div>
    <div v-else>文章不存在</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/article'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()

const loading = ref(true)
const article = ref<any>(null)

onMounted(async () => {
  const articleId = route.params.id as string

  // 这里可以添加从服务器获取文章的逻辑
  // 或者从本地 markdown 文件加载

  loading.value = false
})
</script>

<style scoped>
.article {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.article-header {
  margin-bottom: 2rem;
}

.article-header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.meta {
  color: #666;
}

.article-content {
  line-height: 1.8;
}

.article-content h2 {
  margin-top: 2rem;
  margin-bottom: 1rem;
}
</style>
```

### 2. 创建工具函数

#### 2.1 创建 `src/utils/markdown.ts`

```typescript
// Markdown 解析工具
// 可以使用 marked 或 remark 等库

export const parseMarkdown = (content: string): string => {
  // 这里实现 Markdown 转 HTML 的逻辑
  return content
}

export const extractTitle = (content: string): string => {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1] : '无标题'
}
```

### 3. 创建公共组件

#### 3.1 创建 `src/components/Navbar.vue`

```vue
<template>
  <nav class="navbar">
    <div class="container">
      <router-link to="/" class="logo">技术知识库</router-link>
      <div class="menu">
        <router-link to="/">首页</router-link>
        <router-link to="/about">关于</router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  background: #42b883;
  padding: 1rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
}

.menu a {
  color: white;
  margin-left: 1.5rem;
  text-decoration: none;
}

.menu a:hover {
  text-decoration: underline;
}
</style>
```

---

## 样式开发

### 1. 全局样式 `src/style.css`

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

a {
  color: #42b883;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
}
```

### 2. CSS 变量定义

在 `src/style.css` 中添加：

```css
:root {
  --primary-color: #42b883;
  --secondary-color: #35495e;
  --text-color: #333;
  --bg-color: #fff;
  --border-color: #e0e0e0;
  --spacing-unit: 1rem;
}
```

---

## 测试与优化

### 1. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:5173 查看效果

### 2. 类型检查

```bash
npm run type-check
```

### 3. 性能优化

#### 3.1 路由懒加载（已在路由配置中使用）

```typescript
component: () => import('@/views/Home.vue')
```

#### 3.2 按需引入组件

如果使用 UI 组件库，按需引入：

```typescript
import { ElButton } from 'element-plus'
```

### 4. 添加内容

#### 4.1 添加核心知识文章

在 `posts/` 目录下添加 Markdown 文件：

```markdown
# Vue 核心知识

## 1. Vue 3 和 Vue 2 的主要区别是什么？

...
```

---

## 部署上线

### 1. 构建生产版本

```bash
npm run build
```

### 2. 预览构建结果

```bash
npm run preview
```

### 3. 部署到静态服务器

#### 3.1 部署到 Nginx

将 `dist/` 目录上传到服务器，配置 Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 缓存配置
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 3.2 部署到 Vercel/Netlify

将项目推送到 GitHub，然后在 Vercel/Netlify 中导入项目即可自动部署。

#### 3.3 部署到 GitHub Pages

1. 在 `vite.config.ts` 中配置 base：

```typescript
export default defineConfig({
  base: '/your-repo-name/',
  // ... 其他配置
})
```

2. 构建项目

3. 推送到 GitHub

4. 在仓库设置中启用 GitHub Pages，选择 `gh-pages` 分支

---

## 常见问题

### Q1: 路由刷新 404

**解决方案**：配置服务器支持 SPA 路由模式

### Q2: 样式不生效

**解决方案**：检查 CSS 作用域和导入顺序

### Q3: 类型报错

**解决方案**：运行 `npm run type-check` 查看详细错误

### Q4: 构建后页面空白

**解决方案**：检查 `base` 路径配置是否正确

---

## 开发工具推荐

- **IDE**: VSCode + Volar 插件
- **调试**: Vue DevTools
- **API 测试**: Postman
- **代码格式化**: Prettier
- **代码检查**: ESLint

---

## 总结

完成以上步骤后，你就拥有了一个功能完整的前端技术知识库博客系统。整个流程包括：

1. ✅ 项目初始化和环境搭建
2. ✅ 项目结构规划和目录创建
3. ✅ 核心功能开发（路由、状态管理、组件）
4. ✅ 样式开发和响应式设计
5. ✅ 内容填充（核心知识文章）
6. ✅ 测试和性能优化
7. ✅ 部署上线

整个开发流程遵循 Vue 3 + TypeScript 的最佳实践，确保代码质量和可维护性。

---

**开始你的前端博客开发之旅吧！** 🚀
