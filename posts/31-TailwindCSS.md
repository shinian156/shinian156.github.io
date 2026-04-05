# TailwindCSS 完整指南

## 目录
- [一、什么是 TailwindCSS](#一什么是-tailwindcss)
- [二、快速安装](#二快速安装)
- [三、核心概念：功能类](#三核心概念功能类)
- [四、响应式设计](#四响应式设计)
- [五、暗色模式](#五暗色模式)
- [六、自定义主题](#六自定义主题)
- [七、组件抽象（@apply）](#七组件抽象apply)
- [八、常用 UI 模式](#八常用-ui-模式)
- [九、与 Vue 集成（动态类）](#九与-vue-集成动态类)
- [十、插件生态](#十插件生态)
- [十一、性能优化](#十一性能优化)

---
## 一、什么是 TailwindCSS

TailwindCSS 是一个以**功能类优先（Utility-First）**为核心理念的 CSS 框架。与 Bootstrap 等组件型框架不同，Tailwind 不提供预制 UI 组件，而是提供数百个细粒度的原子类，让你直接在 HTML 中组合样式，极大提升开发效率。

**核心优势：**
- 无需离开 HTML 就能完成样式编写
- 内置 PurgeCSS，生产包极小（通常 < 10kb）
- 高度可定制，一切皆可配置
- 完美支持响应式和暗色模式

---

## 二、快速安装

### Vite + Vue 项目

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js：**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: []
}
```

**在 main.css 中引入：**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 三、核心概念：功能类

### 布局与间距

```html
<!-- flex 布局 + 间距 -->
<div class="flex items-center justify-between gap-4 p-6 m-4">
  <span class="text-lg font-bold">标题</span>
  <button class="px-4 py-2 bg-blue-500 text-white rounded">按钮</button>
</div>
```

### 常用类速查

| 功能 | 类名示例 |
|------|----------|
| 内边距 | `p-4` `px-6` `pt-2` |
| 外边距 | `m-4` `mx-auto` `mt-8` |
| 宽高 | `w-full` `h-screen` `w-1/2` |
| 文字 | `text-xl` `font-bold` `text-gray-600` |
| 背景色 | `bg-blue-500` `bg-white` `bg-transparent` |
| 圆角 | `rounded` `rounded-lg` `rounded-full` |
| 阴影 | `shadow` `shadow-md` `shadow-xl` |
| Flex | `flex` `items-center` `justify-between` |
| Grid | `grid` `grid-cols-3` `gap-4` |

---

## 四、响应式设计

Tailwind 内置断点前缀，移动端优先：

```html
<!-- 手机 1 列，平板 2 列，桌面 3 列 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  <div class="p-4 bg-white rounded-lg shadow">卡片1</div>
  <div class="p-4 bg-white rounded-lg shadow">卡片2</div>
  <div class="p-4 bg-white rounded-lg shadow">卡片3</div>
</div>
```

| 前缀 | 断点 |
|------|------|
| `sm:` | ≥ 640px |
| `md:` | ≥ 768px |
| `lg:` | ≥ 1024px |
| `xl:` | ≥ 1280px |
| `2xl:` | ≥ 1536px |

---

## 五、暗色模式

```js
// tailwind.config.js
export default {
  darkMode: 'class', // 或 'media'
  // ...
}
```

```html
<!-- 亮/暗模式切换样式 -->
<div class="bg-white dark:bg-gray-900 text-black dark:text-white p-6">
  <h1 class="text-2xl font-bold">内容区域</h1>
</div>
```

```js
// 切换暗色模式
document.documentElement.classList.toggle('dark')
```

---

## 六、自定义主题

```js
// tailwind.config.js
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      spacing: {
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  }
}
```

---

## 七、组件抽象（@apply）

当重复样式过多时，用 `@apply` 提取为组件类：

```css
/* components.css */
@layer components {
  .btn-primary {
    @apply px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200;
  }

  .card {
    @apply bg-white rounded-xl shadow-md p-6 border border-gray-100;
  }

  .input-base {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500;
  }
}
```

---

## 八、常用 UI 模式

### 导航栏

```html
<nav class="bg-white shadow-sm border-b border-gray-200">
  <div class="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
    <div class="text-xl font-bold text-blue-600">Logo</div>
    <div class="flex items-center gap-6">
      <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">首页</a>
      <a href="#" class="text-gray-600 hover:text-blue-600 transition-colors">关于</a>
      <button class="btn-primary">登录</button>
    </div>
  </div>
</nav>
```

### 卡片组件

```html
<div class="max-w-sm bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
  <img src="cover.jpg" class="w-full h-48 object-cover" />
  <div class="p-6">
    <h2 class="text-lg font-semibold text-gray-800">文章标题</h2>
    <p class="mt-2 text-sm text-gray-500 line-clamp-3">文章摘要内容...</p>
    <div class="mt-4 flex items-center justify-between">
      <span class="text-xs text-gray-400">2024-01-01</span>
      <a href="#" class="text-blue-500 text-sm hover:underline">阅读更多 →</a>
    </div>
  </div>
</div>
```

---

## 九、与 Vue 集成（动态类）

```vue
<template>
  <button
    :class="[
      'px-4 py-2 rounded font-medium transition-colors',
      variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800',
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}>()
</script>
```

---

## 十、插件生态

```bash
# 官方表单样式插件
npm install -D @tailwindcss/forms

# 官方排版插件（prose 类）
npm install -D @tailwindcss/typography

# 官方宽高比插件
npm install -D @tailwindcss/aspect-ratio
```

```js
// tailwind.config.js
plugins: [
  require('@tailwindcss/forms'),
  require('@tailwindcss/typography'),
]
```

**排版插件使用：**

```html
<!-- 自动给 Markdown 渲染内容添加漂亮排版 -->
<div class="prose prose-lg max-w-none dark:prose-invert">
  <!-- Markdown 渲染内容 -->
</div>
```

---

## 十一、性能优化

生产环境 Tailwind 会自动扫描内容并只保留用到的类，通常 CSS 体积 < 10kb。

```bash
# 构建时查看 CSS 体积
npm run build
# 查看 dist/assets/*.css 的大小
```

**JIT（即时编译）模式特性：**

```html
<!-- 支持任意值 -->
<div class="w-[328px] top-[117px] bg-[#1da1f2]">...</div>

<!-- 支持任意变体 -->
<div class="[&>li]:mb-2 [&:nth-child(2)]:text-red-500">...</div>
```
