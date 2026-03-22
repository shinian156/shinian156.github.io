# Frontend Tech Blog 开发文档

## 项目简介

Frontend Tech Blog 是一个基于 Vue 3 + TypeScript + Vite 构建的前端技术知识库博客，专注于分享前端开发相关的技术文章和实践经验。

## 技术栈

### 核心框架
- **Vue 3.4+**：渐进式 JavaScript 框架
- **TypeScript 5.3+**：JavaScript 的超集，提供静态类型检查
- **Vite 5.0+**：新一代前端构建工具

### 路由和状态管理
- **Vue Router 4.2+**：官方路由管理器
- **Pinia 2.1+**：Vue 3 官方状态管理库

### 开发工具
- **@vitejs/plugin-vue**：Vite 的 Vue 插件
- **vue-tsc**：Vue TypeScript 类型检查器
- **@types/node**：Node.js 类型定义

## 项目结构

```
frontend-blog/
├── about/                 # 关于页面
├── assets/                # 静态资源
├── posts/                 # 博客文章目录
│   ├── javascript/        # JavaScript 相关文章
│   ├── node/              # Node.js 相关文章
│   ├── other/             # 其他技术文章
│   ├── react/             # React 相关文章
│   ├── vue/               # Vue 相关文章
│   └── *.md               # 核心知识文章（19份）
├── src/                   # 源代码目录
│   ├── App.vue            # 根组件
│   ├── main.ts            # 入口文件
│   ├── style.css          # 全局样式
│   ├── router/            # 路由配置
│   └── stores/            # Pinia 状态管理
├── index.html             # HTML 模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── tsconfig.node.json     # Node 环境 TypeScript 配置
└── vite.config.ts         # Vite 配置
```

## 安装和运行

### 1. 安装依赖
```bash
cd D:\v3\frontend-blog
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```
开发服务器将在 `http://localhost:5173` 启动

### 3. 构建生产版本
```bash
npm run build
```
构建后的文件将输出到 `dist/` 目录

### 4. 预览生产构建
```bash
npm run preview
```

### 5. 类型检查
```bash
npm run type-check
```

## 开发指南

### 添加新文章

#### 1. 创建文章文件
在 `posts/` 目录下创建新的 Markdown 文件：
```
posts/
└── my-new-article.md
```

#### 2. 文章格式
```markdown
# 文章标题

## 章节1
内容...

## 章节2
内容...

```javascript
// 代码示例
const example = 'hello';
```
```

#### 3. 核心知识文章命名规范
核心知识文章按以下格式命名：
- `01-主题.md`
- `02-主题.md`
- ...

### 修改样式

#### 1. 全局样式
编辑 `src/style.css` 文件

#### 2. 组件样式
在 `.vue` 文件中使用 `<style>` 标签

### 添加路由

在 `src/router/index.ts` 中添加新路由：
```typescript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home.vue')
  },
  // 添加新路由
  {
    path: '/article/:id',
    name: 'article',
    component: () => import('@/views/Article.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 状态管理

使用 Pinia 管理应用状态：

#### 1. 创建 Store
```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    email: ''
  }),
  actions: {
    setName(name: string) {
      this.name = name
    }
  }
})
```

#### 2. 使用 Store
```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
userStore.setName('Alice')
</script>

<template>
  <div>{{ userStore.name }}</div>
</template>
```

## 配置文件

### package.json
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

### vite.config.ts
```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

### tsconfig.json
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
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 相关文档

本项目提供以下文档支持：

| 文档 | 说明 |
|------|------|
| README.md | 项目介绍和快速开始 |
| QUICKSTART.md | 从0到1开发指南 |
| USAGE.md | 使用流程和学习路径 |
| 架构设计.md | 技术架构设计文档 |
| 贡献指南.md | 贡献指南 |
| 更新日志.md | 更新日志 |
| 文章索引.md | 文章索引 |
| posts/ | 所有核心知识文章目录 |

## 核心知识文章目录

目前包含 19 份核心知识，按基础到进阶的顺序排列：

### 前端框架
1. 01-Vue.md
2. 02-uni-app.md

### JavaScript 核心
3. 06-JavaScript.md
4. 07-JavaScript高级特性.md
5. 08-ES6.md

### TypeScript
6. 09-TypeScript.md
7. 10-TypeScript进阶.md

### 后端开发
8. 11-Node.js.md
9. 12-Koa2后端开发.md

### 数据可视化
10. 13-ECharts数据可视化.md
11. 14-数据大屏开发.md
12. 15-三维GIS开发.md

### AI 与机器学习
13. 13-TensorFlow.js介绍与使用.md
14. 14-主流AI开发工具对比.md

### 性能优化与工程化
15. 15-前端性能优化.md
16. 21-构建工具.md
17. 17-代码规范与工程化思维.md

### 其他
18. 18-App上架应用商店流程.md
19. 23-Docker.md

## 常见问题

### Q: 如何修改端口号？
在 `vite.config.ts` 中添加：
```typescript
export default defineConfig({
  server: {
    port: 3000 // 修改为其他端口
  }
})
```

### Q: 如何启用 HTTPS？
在 `vite.config.ts` 中添加：
```typescript
export default defineConfig({
  server: {
    https: true
  }
})
```

### Q: 如何配置代理？
在 `vite.config.ts` 中添加：
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### Q: TypeScript 报错如何解决？
1. 确保 `tsconfig.json` 配置正确
2. 运行 `npm run type-check` 查看具体错误
3. 安装缺失的类型定义：`npm install -D @types/xxx`

## 部署

### 构建静态文件
```bash
npm run build
```

### 部署到服务器
1. 将 `dist/` 目录上传到服务器
2. 配置 Nginx 或其他 Web 服务器

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 开发规范

### 代码风格
- 使用 TypeScript 进行类型检查
- 遵循 Vue 3 组合式 API 最佳实践
- 使用 ESLint 和 Prettier 保持代码风格一致

### 命名规范
- 组件文件：PascalCase（如 `UserProfile.vue`）
- 工具函数：camelCase（如 `formatDate.ts`）
- 常量：UPPER_SNAKE_CASE（如 `API_BASE_URL`）
- CSS 类名：kebab-case（如 `user-profile`）

### Git 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

## 贡献指南

欢迎贡献文章和改进！

### 1. Fork 项目
### 2. 创建特性分支
```bash
git checkout -b feature/your-feature
```

### 3. 提交更改
```bash
git commit -m 'feat: add new article'
```

### 4. 推送到分支
```bash
git push origin feature/your-feature
```

### 5. 提交 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，欢迎提出 Issue 或 Pull Request。
