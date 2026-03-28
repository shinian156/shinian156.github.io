# Rollup 打包工具

## 目录

1. [Rollup 简介](#rollup-简介)
2. [Rollup vs Webpack](#rollup-vs-webpack)
3. [快速开始](#快速开始)
4. [配置文件](#配置文件)
5. [插件系统](#插件系统)
6. [代码分割](#代码分割)
7. [Tree Shaking](#tree-shaking)
8. [构建目标](#构建目标)
9. [最佳实践](#最佳实践)

---

## Rollup 简介

### 1.1 什么是 Rollup？

Rollup 是一个 JavaScript 模块打包器，专注于构建库和应用程序。它可以将小段代码编译成更大、更复杂的代码片段，如库或应用程序。

### 1.2 核心优势

- **Tree Shaking**：原生支持 ES6 模块的静态分析，消除无用代码
- **体积小**：打包产物更加精简
- **速度快**：构建速度比 Webpack 快
- **输出清晰**：易于阅读和调试的输出代码
- **专注库开发**：非常适合构建可复用的库

### 1.3 适用场景

- 开发 npm 包/库
- 构建可复用的组件
- 需要极致打包体积的项目
- 开发 TypeScript/ES6+ 项目

---

## Rollup vs Webpack

### 2.1 功能对比

| 特性 | Rollup | Webpack |
|------|--------|---------|
| Tree Shaking | 原生支持 | 支持 |
| 代码分割 | 支持 | 支持 |
| Loaders | 插件系统 | Loader 系统 |
| 热替换 | 不支持 | 支持 |
| 资源处理 | 需要插件 | 内置支持 |
| 开发服务器 | 需要配置 | 内置 |
| 适用场景 | 库开发、打包 | 应用开发、打包 |

### 2.2 输出对比

#### Rollup 输出（更清晰）
```javascript
// 输入: src/index.js
import { add } from './utils'

console.log(add(1, 2))

// 输出（未压缩）
function add(a, b) {
  return a + b;
}
console.log(add(1, 2));
```

#### Webpack 输出（带包装）
```javascript
// 输出（未压缩）
(function(modules) {
  // webpack bootstrap
})({
  0: function(module, exports, require) {
    // module code
  }
});
```

### 2.3 选择建议

**使用 Rollup：**
- 开发 npm 包/库
- 需要最小的打包体积
- 输出多种格式（ESM、CJS、UMD）
- 代码可读性要求高

**使用 Webpack：**
- 开发复杂的应用
- 需要代码分割和懒加载
- 需要处理多种资源类型
- 需要 HMR 和开发服务器

---

## 快速开始

### 3.1 安装

```bash
# 安装 Rollup
npm install -D rollup

# 或全局安装
npm install -g rollup
```

### 3.2 基本使用

```bash
# 命令行打包
rollup src/index.js -f cjs -o dist/bundle.js

# 查看帮助
rollup --help
```

### 3.3 package.json 脚本

```json
{
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "build:esm": "rollup -c --environment FORMAT:esm"
  }
}
```

---

## 配置文件

### 4.1 基本配置

```javascript
// rollup.config.js
export default {
  // 入口文件
  input: 'src/index.js',

  // 输出配置
  output: {
    file: 'dist/bundle.js',
    format: 'cjs', // amd, esm, cjs, iife, umd, system
    name: 'MyLibrary', // iife/umd 格式需要
    sourcemap: true,
    exports: 'auto' // auto, default, named, none
  }
}
```

### 4.2 多入口配置

```javascript
export default {
  input: {
    main: 'src/index.js',
    utils: 'src/utils/index.js'
  },
  output: {
    dir: 'dist',
    format: 'esm',
    entryFileNames: '[name].js',
    chunkFileNames: '[name]-[hash].js'
  }
}
```

### 4.3 多输出配置

```javascript
export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      exports: 'auto'
    },
    {
      file: 'dist/bundle.esm.js',
      format: 'esm'
    },
    {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'MyLibrary',
      sourcemap: true
    }
  ]
}
```

### 4.4 完整配置示例

```javascript
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
import postcss from 'rollup-plugin-postcss'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

const packageJson = require('./package.json')

export default {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist'
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    postcss(),
    terser()
  ],
  external: ['react', 'react-dom']
}
```

---

## 插件系统

### 5.1 常用插件

```javascript
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import babel from '@rollup/plugin-babel'
import json from '@rollup/plugin-json'
import image from '@rollup/plugin-image'
import postcss from 'rollup-plugin-postcss'
import replace from '@rollup/plugin-replace'

export default {
  plugins: [
    // 解析 node_modules
    resolve({
      browser: true,
      dedupe: ['react', 'react-dom']
    }),

    // 转换 CommonJS 模块
    commonjs(),

    // TypeScript 支持
    typescript(),

    // Babel 转译
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**'
    }),

    // JSON 支持
    json(),

    // 图片处理
    image(),

    // PostCSS 处理
    postcss(),

    // 环境变量替换
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    }),

    // 代码压缩
    terser()
  ]
}
```

### 5.2 自定义插件

```javascript
// my-plugin.js
export default function myPlugin(options = {}) {
  return {
    name: 'my-plugin',

    // 构建开始时
    buildStart() {
      console.log('Build started')
    },

    // 转换代码
    transform(code, id) {
      if (id.endsWith('.js')) {
        // 转换逻辑
        return {
          code: code.replace(/foo/g, 'bar'),
          map: null
        }
      }
    },

    // 解析模块
    resolveId(source, importer) {
      if (source === 'virtual-module') {
        return source
      }
    },

    // 加载模块
    load(id) {
      if (id === 'virtual-module') {
        return 'export default "virtual"'
      }
    },

    // 构建结束时
    buildEnd() {
      console.log('Build ended')
    }
  }
}
```

### 5.3 插件顺序

```javascript
export default {
  plugins: [
    // 1. 解析模块
    resolve(),

    // 2. 转换代码
    typescript(),
    babel(),

    // 3. 处理资源
    json(),
    image(),
    postcss(),

    // 4. 压缩代码
    terser()
  ]
}
```

---

## 代码分割

### 6.1 动态导入

```javascript
// src/index.js
export function main() {
  // 动态导入
  import('./utils.js').then(module => {
    module.default()
  })
}
```

### 6.2 手动分割

```javascript
export default {
  input: 'src/index.js',
  output: {
    dir: 'dist',
    format: 'esm',
    manualChunks: {
      vendor: ['react', 'react-dom'],
      utils: ['lodash']
    }
  }
}
```

### 6.3 代码分割配置

```javascript
export default {
  output: {
    dir: 'dist',
    format: 'esm',
    chunkFileNames: '[name]-[hash].js',
    manualChunks(id) {
      if (id.includes('node_modules')) {
        return 'vendor'
      }
      if (id.includes('src/utils')) {
        return 'utils'
      }
    }
  }
}
```

---

## Tree Shaking

### 7.1 原理

Tree Shaking 基于静态分析，识别并移除未使用的代码。

```javascript
// utils.js
export function add(a, b) {
  return a + b
}

export function subtract(a, b) {
  return a - b
}

// index.js
import { add } from './utils'
console.log(add(1, 2))

// 输出：subtract 函数被移除
```

### 7.2 配置

```javascript
export default {
  treeshake: {
    // 模块级 Tree Shaking
    moduleSideEffects: true,
    // 属性级 Tree Shaking
    propertyReadSideEffects: false,
    // 未知副作用
    unknownGlobalSideEffects: false
  }
}
```

### 7.3 副作用标记

```javascript
// package.json
{
  "sideEffects": [
    "*.css",
    "*.scss",
    "dist/*"
  ]
}

// 或代码中
// #__PURE__
export const version = '1.0.0'
```

---

## 构建目标

### 8.1 输出格式

#### ESM (ES Modules)

```javascript
export default {
  output: {
    file: 'dist/bundle.esm.js',
    format: 'esm'
  }
}

// 输出
export function add(a, b) {
  return a + b
}
```

#### CommonJS

```javascript
export default {
  output: {
    file: 'dist/bundle.cjs.js',
    format: 'cjs'
  }
}

// 输出
function add(a, b) {
  return a + b
}
exports.add = add
```

#### UMD

```javascript
export default {
  output: {
    file: 'dist/bundle.umd.js',
    format: 'umd',
    name: 'MyLibrary'
  }
}

// 输出
(function (global, factory) {
  // UMD 包装器
})(typeof window !== 'undefined' ? window : this, function () {
  // 模块代码
})
```

### 8.2 多环境构建

```javascript
export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/bundle.esm.js',
      format: 'esm'
    }
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/bundle.cjs.js',
      format: 'cjs'
    }
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/bundle.umd.js',
      format: 'umd',
      name: 'MyLibrary'
    }
  }
]
```

---

## 最佳实践

### 9.1 库开发配置

```javascript
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { terser } from 'rollup-plugin-terser'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'

const packageJson = require('./package.json')

export default {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'auto'
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true
    }
  ],
  plugins: [
    peerDepsExternal(),
    resolve({
      browser: true
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      declaration: true,
      declarationDir: 'dist'
    }),
    terser()
  ]
}
```

### 9.2 package.json 配置

```json
{
  "name": "my-library",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "prepublishOnly": "npm run build"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  },
  "devDependencies": {
    "rollup": "^3.0.0",
    "@rollup/plugin-node-resolve": "^15.0.0",
    "@rollup/plugin-commonjs": "^25.0.0",
    "@rollup/plugin-typescript": "^11.0.0",
    "rollup-plugin-terser": "^7.0.0"
  }
}
```

### 9.3 性能优化

```javascript
export default {
  // 减少打包体积
  treeshake: {
    moduleSideEffects: false
  },

  // 优化输出
  output: {
    compact: true,
    minifyInternalExports: true,
    generatedCode: {
      constBindings: true,
      preset: 'es2015'
    }
  }
}
```

### 9.4 常见问题

#### Q: 如何处理外部依赖？
```javascript
export default {
  external: ['react', 'react-dom', 'lodash'],

  // 或使用正则
  external: /^(react|react-dom|lodash)$/
}
```

#### Q: 如何处理 CSS？
```javascript
import postcss from 'rollup-plugin-postcss'

export default {
  plugins: [
    postcss({
      extract: true,
      minimize: true
    })
  ]
}
```

#### Q: 如何生成类型声明？
```javascript
import typescript from '@rollup/plugin-typescript'

export default {
  plugins: [
    typescript({
      declaration: true,
      declarationDir: 'dist',
      rootDir: 'src'
    })
  ]
}
```

---

## 总结

Rollup 的核心优势：
- 原生 Tree Shaking
- 输出代码清晰
- 专注库开发
- 构建速度快

适用场景：
- npm 包/库开发
- 组件库开发
- 需要最小体积的项目

推荐资源：
- Rollup 官方文档：https://rollupjs.org/
- Rollup 插件列表：https://github.com/rollup/awesome

---

**知识点:**
- Rollup
- 打包工具
- Tree Shaking
- 库开发
- 代码分割
- 插件系统
- ESM
- UMD
