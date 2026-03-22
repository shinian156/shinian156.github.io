# Vue3 CLI 从 0 到 1 实战

> 手把手实现一个功能完整的 `create-vue3-app` CLI，内置 Vue3 + TypeScript + Vite 模板，支持交互式创建、项目启动。

## 目录

- [一、项目初始化](#一项目初始化)
- [二、创建入口文件](#二创建入口文件)
- [三、主逻辑](#三主逻辑)
- [四、交互问答](#四交互问答)
- [五、核心：项目创建](#五核心项目创建)
- [六、子进程工具](#六子进程工具)
- [七、本地调试](#七本地调试)
- [八、发布到 npm](#八发布到-npm)
- [九、完整项目结构](#九完整项目结构)
- [十、与 Vue CLI / Vite 对比](#十与-vue-cli--vite-对比)

---

## 一、项目初始化

```bash
mkdir create-vue3-app && cd create-vue3-app
npm init -y
npm install commander inquirer chalk ora fs-extra
# ES Module
npm install --save-dev @types/node
```

**package.json：**

```json
{
  "name": "create-vue3-app",
  "version": "1.0.0",
  "description": "Vue3 快速构建脚手架",
  "type": "module",
  "bin": {
    "create-vue3-app": "./bin/index.js"
  },
  "scripts": {
    "dev": "node ./bin/index.js",
    "link": "npm link"
  }
}
```

---

## 二、创建入口文件

```bash
mkdir bin && touch bin/index.js
chmod +x bin/index.js
```

```js
#!/usr/bin/env node

import '../src/index.js'
```

---

## 三、主逻辑

```js
#!/usr/bin/env node

import { program } from 'commander'
import { askProjectName, askFeatures } from './prompts.js'
import { createProject } from './create.js'
import chalk from 'chalk'

// 显示 Logo
console.log(chalk.cyan(`
  ╔═══════════════════════════════════╗
  ║    create-vue3-app  v1.0.0       ║
  ║    Vue3 快速构建脚手架            ║
  ╚═══════════════════════════════════╝
`))

program
  .name('create-vue3-app')
  .description('快速创建 Vue3 项目')
  .version('1.0.0')

program
  .command('create <project-name>')
  .description('创建一个新的 Vue3 项目')
  .option('-ts, --typescript', '使用 TypeScript')
  .option('-r, --router', '集成 Vue Router')
  .option('-s, --store', '集成 Pinia 状态管理')
  .action(async (name, options) => {
    try {
      const answers = await askProjectName(name)
      const features = await askFeatures()
      await createProject({ name, ...options, ...answers, features })
    } catch (err) {
      console.error(chalk.red(`\n创建失败: ${err.message}`))
      process.exit(1)
    }
  })

program.parse(process.argv)
```

---

## 四、交互问答

```js
import inquirer from 'inquirer'

export async function askProjectName(defaultName) {
  const { name } = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: '项目名称：',
      default: defaultName || 'my-vue3-app',
      validate: (input) =>
        /^[a-zA-Z0-9-]+$/.test(input) || '只能包含字母、数字和中划线'
    }
  ])
  return { name }
}

export async function askFeatures() {
  const { features } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'features',
      message: '选择功能特性（空格选择，回车确认）：',
      choices: [
        { name: 'Vue Router 4（路由管理）', value: 'router', checked: true },
        { name: 'Pinia（状态管理）', value: 'store', checked: true },
        { name: 'ESLint + Prettier（代码规范）', value: 'lint', checked: false },
        { name: 'Vitest（单元测试）', value: 'test', checked: false },
        { name: 'Axios（HTTP 客户端）', value: 'axios', checked: false }
      ]
    }
  ])
  return features
}
```

---

## 五、核心：项目创建

```js
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import chalk from 'chalk'
import ora from 'ora'
import { spawn } from './utils/spawn.js'

export async function createProject({ name, typescript, router, store, features }) {
  const targetDir = path.resolve(process.cwd(), name)
  const spinner = ora(chalk.cyan('正在创建项目...')).start()

  // 1. 创建目录结构
  fs.ensureDirSync(targetDir)
  spinner.succeed(chalk.green('✅ 项目目录已创建'))

  // 2. 写入 package.json
  const pkg = buildPackageJson({ name, typescript, router, store, features })
  fs.writeFileSync(
    path.join(targetDir, 'package.json'),
    JSON.stringify(pkg, null, 2),
    'utf-8'
  )
  spinner.succeed(chalk.green('✅ package.json 已生成'))

  // 3. 生成 Vite 配置
  await generateViteConfig(targetDir, { typescript, router })
  spinner.succeed(chalk.green('✅ vite.config.ts 已生成'))

  // 4. 生成入口文件
  await generateSrcFiles(targetDir, { typescript, router, store, features })
  spinner.succeed(chalk.green('✅ 源码文件已生成'))

  // 5. 安装依赖
  const installSpinner = ora(chalk.cyan('正在安装依赖（这一步耗时较长，请耐心等待）...')).start()
  try {
    await spawn('npm', ['install'], { cwd: targetDir })
    installSpinner.succeed(chalk.green('✅ 依赖安装完成'))
  } catch (err) {
    installSpinner.warn(chalk.yellow('⚠️ 依赖安装遇到问题，请手动执行 npm install'))
  }

  // 完成
  console.log(chalk.bold.green(`\n🎉 项目 ${name} 创建完成！`))
  console.log(chalk.gray(`\n  cd ${name}`))
  console.log(chalk.cyan(`  npm run dev\n`))
}

function buildPackageJson({ name, typescript, router, store, features }) {
  const deps = { vue: '^3.4.0' }
  if (router) deps['vue-router'] = '^4.2.0'
  if (store) deps.pinia = '^2.1.0'
  if (features.includes('axios')) deps.axios = '^1.6.0'

  const devDeps = {
    '@vitejs/plugin-vue': '^5.0.0',
    vite: '^5.0.0'
  }
  if (typescript) {
    devDeps.typescript = '^5.3.0'
    devDeps['vue-tsc'] = '^1.8.0'
  }
  if (features.includes('lint')) {
    devDeps.eslint = '^8.0.0'
    devDeps.prettier = '^3.0.0'
  }
  if (features.includes('test')) {
    devDeps.vitest = '^1.0.0'
  }

  return {
    name,
    version: '0.0.0',
    type: 'module',
    scripts: {
      dev: 'vite',
      build: typescript ? 'vue-tsc && vite build' : 'vite build',
      preview: 'vite preview'
    },
    dependencies: deps,
    devDependencies: devDeps
  }
}

async function generateViteConfig(targetDir, { typescript, router }) {
  const content = `import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
${router ? "import { resolve } from 'path'" : ''}

export default defineConfig({
  plugins: [vue()],${router ? `
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },` : ''}
  server: {
    port: 3000,
    open: true
  }
})
`
  fs.writeFileSync(
    path.join(targetDir, 'vite.config' + (typescript ? '.ts' : '.js')),
    content,
    'utf-8'
  )
}

async function generateSrcFiles(targetDir, { typescript, router, store, features }) {
  const srcDir = path.join(targetDir, 'src')
  const dirs = [srcDir, path.join(srcDir, 'components'), path.join(srcDir, 'views')]
  dirs.forEach(d => fs.ensureDirSync(d))

  // main.ts / main.js
  const mainExt = typescript ? 'ts' : 'js'
  const mainContent = typescript
    ? `import { createApp } from 'vue'
import App from './App.vue'${router ? '\nimport router from \'./router\'' : ''}${store ? '\nimport { createPinia } from \'pinia\'' : ''}

const app = createApp(App)${store ? '\napp.use(createPinia())' : ''}${router ? '\napp.use(router)' : ''}
app.mount('#app')
`
    : `import { createApp } from 'vue'
import App from './App.vue'${router ? '\nimport router from \'./router\'' : ''}${store ? '\nimport { createPinia } from \'pinia\'' : ''}

const app = createApp(App)${store ? '\napp.use(createPinia())' : ''}${router ? '\napp.use(router)' : ''}
app.mount('#app')
`
  fs.writeFileSync(path.join(srcDir, `main.${mainExt}`), mainContent, 'utf-8')

  // App.vue
  fs.writeFileSync(
    path.join(srcDir, 'App.vue'),
    `<template>
  <div id="app">
    <nav>
      <router-link to="/">首页</router-link>${router ? '\n      <router-link to="/about">关于</router-link>' : ''}
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
// created by create-vue3-app
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
}
nav {
  padding: 20px;
}
nav a {
  margin: 0 10px;
  text-decoration: none;
  color: #42b983;
}
</style>
`,
    'utf-8'
  )

  // router
  if (router) {
    const routerDir = path.join(srcDir, 'router')
    fs.ensureDirSync(routerDir)
    const typeImport = typescript ? "\nimport type { RouteRecordRaw } from 'vue-router'" : ''
    const routeType = typescript ? ': RouteRecordRaw[]' : ''
    fs.writeFileSync(
      path.join(routerDir, `index.${mainExt}`),
      `import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'${typeImport}

const routes${routeType} = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/About.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
`,
      'utf-8'
    )

    // views
    fs.writeFileSync(
      path.join(srcDir, 'views/Home.vue'),
      `<template>
  <div class="home">
    <h1>{{ msg }}</h1>
    <p>欢迎使用 create-vue3-app 创建的项目</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const msg = ref('Hello Vue 3 + TypeScript!')
</script>
`,
      'utf-8'
    )
    fs.writeFileSync(
      path.join(srcDir, 'views/About.vue'),
      `<template>
  <div class="about">
    <h1>About</h1>
    <p>这是一个由 create-vue3-app 快速生成的项目</p>
  </div>
</template>
`,
      'utf-8'
    )
  }

  // index.html
  fs.writeFileSync(
    path.join(targetDir, 'index.html'),
    `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${name}</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.${mainExt}"></script>
  </body>
</html>
`,
    'utf-8'
  )
}
```

---

## 六、子进程工具

```js
import { spawn } from 'child_process'

export function spawn(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    })
    child.on('close', (code) => {
      if (code === 0) resolve()
      else reject(new Error(`${cmd} ${args.join(' ')} 退出码: ${code}`))
    })
    child.on('error', reject)
  })
}
```

---

## 七、本地调试

```bash
# 在 create-vue3-app 目录执行
npm link

# 测试创建项目
create-vue3-app create my-vue3-project --router --store

# 取消 link
npm unlink
```

---

## 八、发布到 npm

```bash
# 1. 确保包名全局唯一（发布前先去 npm 搜索确认）
# 2. 登录 npm
npm login

# 3. 发布
npm publish --access public

# 4. 用户安装使用
npx create-vue3-app create my-project --router --store
```

---

## 九、完整项目结构

```
create-vue3-app/
├── bin/
│   └── index.js              # Shebang 入口
├── src/
│   ├── index.js              # commander 主逻辑
│   ├── prompts.js            # 交互问答
│   ├── create.js             # 核心：生成项目文件
│   └── utils/
│       └── spawn.js           # 子进程执行 npm install
├── package.json
└── README.md
```

---

## 十、与 Vue CLI / Vite 对比

| 特性 | create-vue3-app（自建） | Vue CLI | create-vite |
|---|---|---|---|
| 模板定制 | 完全自己控制 | 官方固定 | 部分可定制 |
| 依赖 | 仅 commander + inquirer | webpack + CLI | Vite + 少量依赖 |
| 构建速度 | 取决于模板（Vite） | 较慢（webpack） | 快（Vite） |
| 学习价值 | 高（完整理解 CLI 原理） | 低 | 中 |
| 适合场景 | 个人/团队内部脚手架 | 官方标准项目 | 快速原型 |

> **核心收获：** 通过从 0 到 1 实现一个完整的 Vue3 CLI，你不仅掌握了一个实用的工程化工具，更重要的是深入理解了 CLI 的本质——**参数解析 + 文件生成 + 子进程管理**，这些能力可以迁移到任何命令行工具的开发中。
