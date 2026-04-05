# Vuex 与 Pinia 对比

## 目录

---

## 概述

Vuex 和 Pinia 都是 Vue.js 的状态管理库，用于管理全局状态。

| 特性 | Vuex | Pinia |
|------|------|-------|
| 作者 | Vue 官方团队 | Vue 官方团队 |
| 发布时间 | 2015年 | 2019年 |
| Vue 版本 | Vue 2 / Vue 3 | Vue 3 (主推) |
| API 风格 | Options API | Composition API |
| TypeScript 支持 | 一般 | 原生支持 |
| 体积 | 较大 | 更小 |

---

## 核心概念对比

### Vuex 核心概念

```
Store (仓库)
├── state (状态)
├── mutations (同步修改)
├── actions (异步操作)
├── getters (计算属性)
└── modules (模块化)
```

### Pinia 核心概念

```
Store (商店)
├── state (状态 - Ref)
├── getters (计算属性 - computed)
├── actions (操作 - function)
└── 无需模块化 (每个 Store 独立)
```

### 代码对比

#### 1. 定义 Store

**Vuex:**
```typescript
// store/index.ts
import { createStore } from 'vuex'

export default createStore({
  state: {
    count: 0,
    todos: []
  },
  mutations: {
    increment(state) {
      state.count++
    },
    addTodo(state, todo) {
      state.todos.push(todo)
    }
  },
  actions: {
    async fetchTodos({ commit }) {
      const res = await fetch('/api/todos')
      const todos = await res.json()
      commit('setTodos', todos)
    }
  },
  getters: {
    doneTodos: state => state.todos.filter(t => t.done)
  }
})
```

**Pinia:**
```typescript
// stores/counter.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // 状态
  const count = ref(0)
  const todos = ref([])

  // 计算属性
  const doneTodos = computed(() => todos.value.filter(t => t.done))

  // 方法
  function increment() {
    count.value++
  }

  async function fetchTodos() {
    const res = await fetch('/api/todos')
    todos.value = await res.json()
  }

  return { count, todos, doneTodos, increment, fetchTodos }
})
```

#### 2. 组件中使用

**Vuex:**
```vue
<script>
import { mapState, mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  computed: {
    ...mapState(['count', 'todos']),
    ...mapGetters(['doneTodos'])
  },
  methods: {
    ...mapMutations(['increment']),
    ...mapActions(['fetchTodos'])
  }
}
</script>
```

**Pinia:**
```vue
<script setup>
import { useCounterStore } from '@/stores/counter'

const counterStore = useCounterStore()

// 直接访问
console.log(counterStore.count)

// 解构 (需要使用 storeToRefs)
import { storeToRefs } from 'pinia'
const { count, todos } = storeToRefs(counterStore)

// 方法解构 (不需要 storeToRefs)
const { increment, fetchTodos } = counterStore
</script>
```

---

## API 对比

### 模块化

**Vuex 模块化:**
```typescript
// store/modules/user.ts
export default {
  namespaced: true,
  state: () => ({ name: '张三' }),
  mutations: { setName(state, name) { state.name = name } },
  actions: { async fetchUser({ commit }) { /* ... */ } },
  getters: { greeting: state => `你好, ${state.name}` }
}

// store/index.ts
import user from './modules/user'
export default createStore({
  modules: { user }
})

// 使用
this.$store.commit('user/setName', '李四')
this.$store.getters['user/greeting']
```

**Pinia (天然模块化):**
```typescript
// stores/user.ts
export const useUserStore = defineStore('user', () => {
  const name = ref('张三')
  const greeting = computed(() => `你好, ${name.value}`)

  function setName(newName: string) { name.value = newName }
  async function fetchUser() { /* ... */ }

  return { name, greeting, setName, fetchUser }
})

// stores/cart.ts
export const useCartStore = defineStore('cart', () => {
  // 独立 Store
})

// 使用
const userStore = useUserStore()
userStore.setName('李四')
console.log(userStore.greeting)
```

### 持久化

**Vuex (插件方式):**
```typescript
import createPersistedstate from 'vuex-persistedstate'

export default createStore({
  plugins: [
    createPersistedstate({
      paths: ['user', 'cart.items']
    })
  ]
})
```

**Pinia (插件方式):**
```typescript
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 使用
export const useUserStore = defineStore('user', {
  persist: true // 开启持久化
})
```

---

## 性能对比

| 指标 | Vuex | Pinia |
|------|------|-------|
| 打包体积 | ~14KB | ~10KB |
| 响应式性能 | 良好 | 优秀 |
| DevTools 支持 | 完整 | 完整 |
| 热更新 | 支持 | 支持 |

### 性能优化技巧

**Pinia 优化:**
```typescript
// 避免响应式开销
const { name } = storeToRefs(store) // name 是响应式的
const { increment } = store // increment 不是响应式的

// 使用 shallowRef
import { defineStore, shallowRef } from 'pinia'
export const useStore = defineStore('store', () => {
  const largeData = shallowRef({}) // 大对象使用 shallowRef
  return { largeData }
})
```

---

## 适用场景

### 适合 Vuex 的场景

- Vue 2 项目
- 需要严格的模块化管理
- 已有 Vuex 代码库

### 适合 Pinia 的场景

- Vue 3 项目（推荐）
- 新项目启动
- TypeScript 项目
- 喜欢 Composition API 风格
- 简单的状态管理需求

---

## 迁移指南

### 从 Vuex 迁移到 Pinia

1. **安装 Pinia:**
```bash
npm install pinia
```

2. **更新 main.ts:**
```typescript
// main.ts
import { createPinia } from 'pinia'

app.use(createPinia())
```

3. **逐个模块迁移:**
```typescript
// stores/moduleName.ts
import { defineStore } from 'pinia'

// 原 Vuex 模块
export const useModuleNameStore = defineStore('moduleName', {
  state: () => ({
    // 原 state
  }),
  getters: {
    // 原 getters
  },
  actions: {
    // 原 actions (同步) + 原 mutations (改为同步 actions)
  }
})
```

4. **更新组件:**
```typescript
// 原
import { mapState } from 'vuex'
const { prop } = mapState('module', ['prop'])

// 改
import { useModuleNameStore } from '@/stores/moduleName'
const store = useModuleNameStore()
const { prop } = storeToRefs(store)
```

---

## 常见问题

### Q1: Pinia 可以用于 Vue 2 吗？

可以，但需要额外配置：
```bash
npm install pinia @pinia/nuxt
```

### Q2: Pinia 是否支持 Vue DevTools？

完全支持，Pinia 有专门的 DevTools 插件。

### Q3: 如何调试 Pinia？

使用 Vue DevTools 的 Pinia 面板，可以查看所有 Store 的状态。

---

## 总结

| 对比项 | Vuex | Pinia |
|--------|------|-------|
| 学习曲线 | 较陡 | 平缓 |
| TypeScript | 需要额外类型定义 | 原生支持 |
| 代码量 | 较多 | 简洁 |
| 模块化 | 手动配置 | 自动 |
| 未来发展 | 维护模式 | 活跃开发 |
| 推荐程度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

**推荐**: 新项目使用 **Pinia**，Vue 2 项目可继续使用 Vuex。

---

**知识点:**
- 状态管理
- Pinia Store
- Vuex
- Composition API
- TypeScript
