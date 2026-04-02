# Vue 组件库开发指南

## 目录
- [一、单包组件库 vs 多包组件库](#一单包组件库-vs-多包组件库)
- [二、单包组件库开发流程](#二单包组件库开发流程)
- [三、多包组件库开发流程](#三多包组件库开发流程)
- [四、两种架构对比](#四两种架构对比)
- [五、组件库开发常见问题](#五组件库开发常见问题)
- [六、组件库最佳实践](#六组件库最佳实践)
- [七、常见问题](#七常见问题)

---

## 一、单包组件库 vs 多包组件库

在实际项目中，组件库有两种常见的架构方式：

### 1. 单包组件库

**特点**：所有组件打包成一个 npm 包。

**优点**：
- 结构简单，配置容易
- 一次性安装所有组件
- 版本管理简单

**缺点**：
- 用户即使只用一个组件也需要安装整个包
- 打包体积大
- 组件无法独立发版

**适用场景**：
- 组件数量少（<10个）
- 团队内部使用
- 不需要按需引入

---

### 2. 多包组件库

**特点**：每个组件是独立的 npm 包，基于 pnpm workspace 管理。

**优点**：
- 用户可以按需安装需要的组件，体积极小
- 每个组件可独立发版和升级
- 组件之间完全解耦

**缺点**：
- 配置相对复杂
- 需要多个 package.json
- 构建流程较复杂

**适用场景**：
- 组件数量多（>10个）
- 需要按需引入
- 组件需要独立版本管理

---

## 二、单包组件库开发流程

### 1. 项目初始化

```bash
# 创建项目
npm create vite@latest vue3-ui-library -- --template vue-ts
cd vue3-ui-library

# 安装依赖
npm install
```

### 2. 项目结构

```
vue3-ui-library/
├── src/
│   ├── components/          # 组件源码
│   │   ├── Button/         # 按钮组件
│   │   │   ├── Button.vue
│   │   │   └── index.ts
│   │   ├── Input/          # 输入框组件
│   │   │   ├── Input.vue
│   │   │   └── index.ts
│   │   └── Card/           # 卡片组件
│   │       ├── Card.vue
│   │       └── index.ts
│   ├── styles/             # 样式文件
│   │   ├── index.scss
│   │   └── variables.scss
│   └── index.ts            # 组件库入口
├── dist/                   # 构建输出
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### 3. 组件开发

**Button 组件示例**：

```vue
<!-- src/components/Button/Button.vue -->
<template>
  <button
    :class="[
      'ui-button',
      `ui-button--${type}`,
      `ui-button--${size}`,
      { 'ui-button--disabled': disabled }
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Props {
  type?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.ui-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.ui-button--primary {
  background-color: #1890ff;
  color: white;
}

.ui-button--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
```

**组件导出**：

```typescript
// src/components/Button/index.ts
import Button from './Button.vue'
import type { App } from 'vue'

Button.install = (app: App) => {
  app.component(Button.name || 'Button', Button)
}

export default Button
```

### 4. 组件库入口

```typescript
// src/index.ts
import Button from './components/Button'
import Input from './components/Input'
import Card from './components/Card'
import type { App } from 'vue'

const components = [Button, Input, Card]

const install = (app: App) => {
  components.forEach(component => {
    app.use(component)
  })
}

export {
  Button,
  Input,
  Card
}

export default {
  install
}
```

### 5. Vite 配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Vue3UILibrary',
      fileName: 'vue3-ui-library'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
```

### 6. package.json 配置

```json
{
  "name": "vue3-ui-library",
  "version": "1.0.0",
  "main": "dist/vue3-ui-library.cjs.js",
  "module": "dist/vue3-ui-library.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:types": "vue-tsc --declaration --emitDeclarationOnly"
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  }
}
```

### 7. 构建和发布

```bash
# 构建
npm run build

# 生成类型声明
npm run build:types

# 发布到 npm
npm publish
```

### 8. 在项目中使用

**全局引入**：

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import Vue3UILibrary from 'vue3-ui-library'
import 'vue3-ui-library/dist/vue3-ui-library.css'

const app = createApp(App)
app.use(Vue3UILibrary)
app.mount('#app')
```

**按需引入**：

```vue
<template>
  <Button type="primary">按钮</Button>
</template>

<script setup lang="ts">
import { Button } from 'vue3-ui-library'
import 'vue3-ui-library/dist/vue3-ui-library.css'
</script>
```

---

## 三、多包组件库开发流程

### 1. 项目初始化

```bash
# 创建目录
mkdir monorepo-ui-library
cd monorepo-ui-library

# 初始化 pnpm workspace
pnpm init

# 创建 pnpm-workspace.yaml
echo "packages:
  - 'packages/*'" > pnpm-workspace.yaml
```

### 2. 项目结构

```
monorepo-ui-library/
├── packages/                        # 组件包（每个都是独立 npm 包）
│   ├── button/                      # @monorepo/button
│   │   ├── src/
│   │   │   ├── Button.vue
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── input/                       # @monorepo/input
│       ├── src/
│       │   ├── Input.vue
│       │   └── index.ts
│       ├── package.json
│       └── vite.config.ts
├── apps/
│   └── demo/                        # 示例应用
│       ├── src/
│       │   ├── App.vue
│       │   └── main.ts
│       ├── package.json
│       └── vite.config.ts
├── package.json                     # 根配置
└── pnpm-workspace.yaml              # workspace 配置
```

### 3. 创建组件包

**button 组件包**：

```bash
mkdir -p packages/button/src
cd packages/button
pnpm init
```

**package.json**：

```json
{
  "name": "@monorepo/button",
  "version": "1.0.0",
  "main": "dist/button.cjs.js",
  "module": "dist/button.esm.js",
  "types": "dist/button.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "vite build"
  },
  "peerDependencies": {
    "vue": "^3.3.0"
  }
}
```

**vite.config.ts**：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'Button',
      fileName: 'button'
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: { vue: 'Vue' }
      }
    }
  }
})
```

**Button.vue** 和 **index.ts** 同单包方式。

### 4. 创建示例应用

```bash
mkdir -p apps/demo/src
cd apps/demo
pnpm init
pnpm add vue
pnpm add -D @vitejs/plugin-vue vite typescript
```

**package.json**：

```json
{
  "name": "demo",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {
    "vue": "^3.3.0",
    "@monorepo/button": "workspace:*",
    "@monorepo/input": "workspace:*"
  }
}
```

**App.vue**：

```vue
<template>
  <div>
    <Button type="primary">按钮</Button>
    <Input v-model="value" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@monorepo/button'
import { Input } from '@monorepo/input'

const value = ref('')
</script>
```

### 5. 根目录配置

**package.json**：

```json
{
  "name": "monorepo-ui-library",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter demo dev",
    "build": "pnpm -r --filter './packages/**' build",
    "build:button": "pnpm --filter @monorepo/button build"
  }
}
```

### 6. 安装依赖和运行

```bash
# 安装所有依赖
pnpm install

# 构建所有组件包
pnpm build

# 启动示例应用
pnpm dev
```

### 7. 发布到 npm

每个组件包独立发布：

```bash
cd packages/button
pnpm build
npm publish

cd ../input
pnpm build
npm publish
```

### 8. 在项目中使用

```bash
# 按需安装
pnpm add @monorepo/button @monorepo/input
```

```vue
<template>
  <Button type="primary">按钮</Button>
</template>

<script setup lang="ts">
import { Button } from '@monorepo/button'
import '@monorepo/button/dist/button.css'
</script>
```

---

## 四、两种架构对比

| 对比项 | 单包组件库 | 多包组件库 |
|--------|-----------|-----------|
| **包数量** | 1 个 npm 包 | 多个 npm 包 |
| **安装方式** | npm install vue3-ui-library | npm add @monorepo/button @monorepo/input |
| **按需引入** | 支持（但打包体积大） | 原生支持，体积最小 |
| **版本管理** | 统一版本 | 每个组件独立版本 |
| **构建复杂度** | 简单 | 较复杂 |
| **配置文件** | 1 个 package.json | 多个 package.json |
| **适用场景** | 小型组件库 | 中大型组件库 |

---

## 五、组件库开发常见问题

### 1. 如何实现按需引入？

**方法一：tree-shaking**（推荐）

```typescript
// 组件库入口导出
export { Button } from './components/Button'
export { Input } from './components/Input'
```

```vue
<!-- 用户按需引入 -->
<script setup>
import { Button } from 'vue3-ui-library'
</script>
```

**方法二：手动引入**

```vue
<script setup>
import Button from 'vue3-ui-library/es/components/Button'
import 'vue3-ui-library/es/components/Button/style.css'
</script>
```

---

### 2. 如何处理样式隔离？

**方法一：Scoped CSS**

```vue
<style scoped>
.button {
  /* 样式只作用于当前组件 */
}
</style>
```

**方法二：CSS Modules**

```vue
<template>
  <button :class="styles.button">按钮</button>
</template>

<script setup>
import styles from './Button.module.css'
</script>
```

---

### 3. 如何实现主题定制？

**SCSS 变量方案**：

```scss
// styles/variables.scss
$primary-color: #1890ff;
$success-color: #52c41a;

// components/Button/Button.vue
<style lang="scss" scoped>
@import '@/styles/variables.scss';

.button {
  background-color: $primary-color;
}
</style>
```

**CSS 变量方案**（推荐）：

```css
/* styles/variables.css */
:root {
  --primary-color: #1890ff;
  --success-color: #52c41a;
}

/* components/Button/Button.vue */
<style scoped>
.button {
  background-color: var(--primary-color);
}
</style>
```

用户可以覆盖变量：

```css
/* 用户项目的样式 */
:root {
  --primary-color: #f5222d;
}
```

---

### 4. 如何处理组件类型？

**TypeScript 类型定义**：

```typescript
// Button.vue
<script setup lang="ts">
interface Props {
  type?: 'primary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'primary',
  size: 'medium',
  disabled: false
})
</script>
```

**导出类型**：

```typescript
// components/Button/index.ts
import Button from './Button.vue'
import type { App } from 'vue'
import type { Props as ButtonProps } from './Button.vue'

Button.install = (app: App) => {
  app.component(Button.name || 'Button', Button)
}

export type { ButtonProps }
export default Button
```

---

### 5. 如何处理组件通信？

**Props + Emits**（推荐）：

```vue
<!-- 子组件 -->
<script setup lang="ts">
const props = defineProps<{ value: string }>()
const emit = defineEmits<{
  update: [value: string]
}>()

const handleChange = (event: Event) => {
  emit('update', (event.target as HTMLInputElement).value)
}
</script>

<!-- 父组件 -->
<Child v-model:value="inputValue" />
```

**Provide + Inject**（跨层级）：

```typescript
// 祖先组件
import { provide } from 'vue'
provide('theme', 'dark')

// 后代组件
import { inject } from 'vue'
const theme = inject('theme', 'light')
```

---

### 6. 如何处理表单验证？

**组合式函数方案**：

```typescript
// composables/useForm.ts
import { ref } from 'vue'

export function useForm<T extends Record<string, any>>(initialValues: T) {
  const values = ref<T>({ ...initialValues })
  const errors = ref<Partial<Record<keyof T, string>>>({})

  const validate = (rules: Record<keyof T, (value: any) => boolean>) => {
    errors.value = {}
    for (const key in rules) {
      if (!rules[key](values.value[key])) {
        errors.value[key] = '验证失败'
      }
    }
    return Object.keys(errors.value).length === 0
  }

  return {
    values,
    errors,
    validate
  }
}
```

```vue
<script setup lang="ts">
import { useForm } from '@/composables/useForm'

const { values, errors, validate } = useForm({
  username: '',
  password: ''
})

const handleSubmit = () => {
  if (validate({
    username: (v) => v.length > 0,
    password: (v) => v.length >= 6
  })) {
    // 提交表单
  }
}
</script>
```

---

## 六、组件库最佳实践

### 1. 命名规范

- 组件名：PascalCase（Button、Input）
- 属性名：kebab-case（type="primary"）
- 事件名：kebab-case（@click、@update）
- 插槽名：kebab-case（slot="default"）

### 2. 组件设计原则

- **单一职责**：每个组件只做一件事
- **可复用性**：提供 props 自定义行为
- **可扩展性**：预留插槽和事件钩子
- **向后兼容**：API 变更要提供过渡期

### 3. 代码质量

- **TypeScript**：所有组件必须使用 TS
- **单元测试**：核心组件必须有测试
- **代码规范**：使用 ESLint + Prettier
- **文档完善**：API 文档、使用示例

### 4. 性能优化

- **按需加载**：支持 tree-shaking
- **虚拟滚动**：长列表组件
- **懒加载**：图片、复杂组件
- **防抖节流**：搜索、滚动事件

### 5. 可访问性

- **语义化标签**：使用 button、input 等原生元素
- **键盘导航**：支持 Tab、Enter、Escape
- **ARIA 标签**：提供 aria-label、role
- **焦点管理**：Modal、Drawer 等组件

### 6. 国际化

- 使用 i18n 库（vue-i18n）
- 文本提取到语言包
- 支持多语言切换

---

## 七、常见问题

### 1. 单包组件库和多包组件库的区别？

**答**：
- 单包：所有组件打包成一个 npm 包，简单但体积大
- 多包：每个组件独立 npm 包，体积小但配置复杂
- 多包使用 pnpm workspace 管理，支持按需安装和独立发版

### 2. 如何实现组件按需引入？

**答**：
- 使用 tree-shaking：组件库导出所有组件，用户按需导入
- Vite/Webpack 会自动剔除未使用的代码
- 需要配置 external: ['vue'] 避免 Vue 被打包

### 3. 组件库如何实现主题定制？

**答**：
- CSS 变量：定义 --primary-color 等变量，用户覆盖即可
- SCSS 变量：提供默认值，用户通过 @mixin 覆盖
- 推荐 CSS 变量方案，更灵活

### 4. 如何处理组件类型？

**答**：
- 使用 TypeScript defineProps 定义 props 类型
- 导出类型供用户使用：export type { ButtonProps }
- 生成 .d.ts 类型声明文件

### 5. 组件库为什么要 external Vue？

**答**：
- 避免打包多个 Vue 实例
- 减少打包体积
- 用户项目复用自己的 Vue 版本
- 避免版本冲突

### 6. pnpm workspace 的作用？

**答**：
- 管理多个 npm 包（Monorepo）
- workspace:* 协议引用本地包
- 统一安装依赖，提高安装速度
- 支持跨包调试

### 7. 组件库开发流程是什么？

**答**：
1. 设计组件 API
2. 实现组件逻辑
3. 编写单元测试
4. 编写文档和示例
5. 构建发布
6. 版本管理和更新

### 8. 如何保证组件库质量？

**答**：
- TypeScript 类型检查
- 单元测试覆盖
- ESLint 代码规范
- 代码审查
- 自动化 CI/CD
