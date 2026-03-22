# Vue Router 路由详解

## 目录

1. [基础配置](#基础配置)
2. [动态路由](#动态路由)
3. [嵌套路由](#嵌套路由)
4. [编程式导航](#编程式导航)
5. [路由守卫](#路由守卫)
6. [路由元信息](#路由元信息)
7. [进阶用法](#进阶用法)

---

## 基础配置

### 1. 安装与引入

```bash
npm install vue-router
```

### 2. 创建路由实例

```typescript
// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
```

### 3. 路由模式

```typescript
// Hash 模式 (兼容性好)
const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// History 模式 (需要服务器配置)
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Memory 模式 (用于 SSR)
import { createMemoryHistory } from 'vue-router'
const router = createRouter({
  history: createMemoryHistory(),
  routes
})
```

### 4. 在 Vue 应用中使用

```typescript
// main.ts
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')
```

```vue
<!-- App.vue -->
<template>
  <nav>
    <router-link to="/">首页</router-link>
    <router-link to="/about">关于</router-link>
  </nav>

  <router-view />
</template>
```

---

## 动态路由

### 1. 基本动态路由

```typescript
const routes = [
  // 路由参数
  {
    path: '/user/:id',
    name: 'User',
    component: () => import('@/views/User.vue')
  }
]
```

```vue
<!-- User.vue -->
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()
// 获取路由参数
console.log(route.params.id) // '123'
console.log(route.params)    // { id: '123' }
</script>
```

### 2. 多参数路由

```typescript
{
  path: '/user/:userId/post/:postId',
  name: 'UserPost',
  component: () => import('@/views/UserPost.vue')
}
```

```vue
<script setup>
const route = useRoute()
console.log(route.params.userId)  // '1'
console.log(route.params.postId)   // '2'
</script>
```

### 3. 可选参数

```typescript
{
  // ? 表示可选
  path: '/user/:id?',
  name: 'User',
  component: () => import('@/views/User.vue')
}
```

### 4. 正则约束

```typescript
{
  // 只匹配数字
  path: '/user/:id(\\d+)',
  name: 'User',
  component: () => import('@/views/User.vue')
}

// 匹配以 /user/ 开头，后跟数字
path: '/user/*',
```

---

## 嵌套路由

### 1. 基本嵌套

```typescript
const routes = [
  {
    path: '/user',
    component: UserLayout,
    children: [
      {
        path: '',           // 默认子路由
        name: 'UserHome',
        component: UserHome
      },
      {
        path: 'profile',    // /user/profile
        name: 'UserProfile',
        component: UserProfile
      },
      {
        path: 'posts',      // /user/posts
        name: 'UserPosts',
        component: UserPosts
      }
    ]
  }
]
```

### 2. 嵌套路由示例

```vue
<!-- UserLayout.vue (父组件) -->
<template>
  <div class="user-layout">
    <aside>
      <router-link to="/user">概览</router-link>
      <router-link to="/user/profile">资料</router-link>
      <router-link to="/user/posts">文章</router-link>
    </aside>

    <!-- 子路由出口 -->
    <main>
      <router-view />
    </main>
  </div>
</template>
```

---

## 编程式导航

### 1. 导航方法

```typescript
// 字符串路径
router.push('/user/123')

// 对象形式
router.push({ path: '/user/123' })

// 命名路由 (推荐)
router.push({ name: 'User', params: { id: '123' } })

// 带查询参数
router.push({ path: '/user', query: { name: '张三' } })
// URL: /user?name=张三

// 带 hash
router.push({ path: '/about', hash: '#team' })
// URL: /about#team
```

### 2. 替换当前记录

```typescript
// 不添加历史记录
router.replace({ path: '/home' })

// 等同于
router.push({ path: '/home', replace: true })
```

### 3. 前进后退

```typescript
// 前进一页
router.forward()

// 后退一页
router.back()

// 前进 n 页
router.go(2)

// 后退 n 页
router.go(-3)
```

### 4. 组件中的导航

```vue
<script setup>
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

function goToUser(id: string) {
  router.push({ name: 'User', params: { id } })
}

function goBack() {
  router.back()
}
</script>
```

---

## 路由守卫

### 1. 全局守卫

```typescript
// 全局前置守卫
router.beforeEach((to, from, next) => {
  // to: 目标路由
  // from: 来源路由
  // next: 放行函数

  // 检查是否需要登录
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next() // 放行
  }
})

// 全局后置守卫 (没有 next)
router.afterEach((to, from) => {
  // 设置页面标题
  document.title = to.meta.title || '默认标题'

  // 发送页面访问统计
  sendAnalytics(to.fullPath)
})

// 全局解析守卫 (在组件解析后，导航确认前)
router.beforeResolve((to, from, next) => {
  // 可以在此预加载数据
  next()
})
```

### 2. 路由独享守卫

```typescript
const routes = [
  {
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, next) => {
      // 检查权限
      if (hasAdminPermission()) {
        next()
      } else {
        next({ name: 'Home' })
      }
    }
  }
]
```

### 3. 组件内守卫

```vue
<script>
export default {
  name: 'UserProfile',

  // 进入组件前
  beforeRouteEnter(to, from, next) {
    // 此时组件实例还未创建
    next(vm => {
      // vm 是组件实例
      console.log(vm.$data)
    })
  },

  // 路由参数变化时
  beforeRouteUpdate(to, from, next) {
    // 当路由参数变化时触发
    this.fetchData(to.params.id)
    next()
  },

  // 离开组件时
  beforeRouteLeave(to, from, next) {
    // 询问是否离开
    if (this.hasUnsavedChanges) {
      const answer = confirm('有未保存的更改，确定离开吗？')
      if (answer) {
        next()
      } else {
        next(false)
      }
    } else {
      next()
    }
  }
}
</script>
```

### 4. 守卫执行顺序

```
导航触发
    ↓
失活的组件 beforeRouteLeave
    ↓
全局 beforeEach
    ↓
路由 beforeEnter
    ↓
被激活的组件 beforeRouteEnter
    ↓
全局 beforeResolve
    ↓
导航确认
    ↓
全局 afterEach
    ↓
DOM 更新
    ↓
beforeRouteEnter 的 next 回调
```

---

## 路由元信息

### 1. 定义元信息

```typescript
const routes = [
  {
    path: '/admin',
    component: Admin,
    meta: {
      requiresAuth: true,
      title: '管理后台',
      roles: ['admin'],
      keepAlive: true
    }
  }
]
```

### 2. 访问元信息

```typescript
// 在路由中访问
router.beforeEach((to, from) => {
  if (to.meta.requiresAuth) {
    // 需要认证
  }

  if (to.meta.roles) {
    // 检查角色权限
  }
})

// 在组件中访问
<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

console.log(route.meta.requiresAuth)
console.log(route.meta.title)
</script>
```

---

## 进阶用法

### 1. 懒加载路由

```typescript
// 方式一：动态导入
const User = () => import('./views/User.vue')

// 方式二：批量懒加载
const routes = [
  {
    path: '/user/:id',
    component: () => import(/* webpackChunkName: "user" */ './views/User.vue')
  }
]
```

### 2. 路由懒加载与预加载

```typescript
// 预加载下一个路由
<script setup>
import { definePreload } from 'vue-router'

// 在用户悬停时预加载
definePreload('User', {
  loadingRoute: () => import('./views/User.vue')
})
</script>
```

### 3. 滚动行为

```typescript
const router = createRouter({
  history: createWebHistory(),
  routes,

  scrollBehavior(to, from, savedPosition) {
    // 返回滚动位置

    // 1. 滚动到锚点
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }

    // 2. 滚动到顶部
    return { top: 0 }

    // 3. 保持上次滚动位置
    if (savedPosition) {
      return savedPosition
    }

    // 4. 滚动到指定位置
    return { top: 100 }
  }
})
```

### 4. 过渡动画

```vue
<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
```

### 5. 路由路径别名

```typescript
{
  path: '/user',
  component: User,
  alias: ['/u', '/user-center']
}
// 访问 /u 或 /user-center 都会渲染 User 组件
```

### 6. 路由命名

```typescript
// 给路由起别名，方便跳转
{
  path: '/user/profile',
  name: 'UserProfile',  // 命名路由
  component: () => import('@/views/UserProfile.vue')
}

// 跳转时使用 name，而不是 path
router.push({ name: 'UserProfile', params: { id: '123' } })
```

---

## 常见问题

### Q1: 如何获取当前路由信息？

```typescript
import { useRoute } from 'vue-router'

const route = useRoute()

console.log(route.path)      // /user/123
console.log(route.name)     // User
console.log(route.params)    // { id: '123' }
console.log(route.query)    // { name: '张三' }
console.log(route.hash)      // #section
console.log(route.fullPath)  // /user/123?name=张三#section
```

### Q2: 如何传递数据给路由？

三种方式：
1. **query 参数**: `router.push({ path: '/user', query: { id: '123' } })`
2. **params 参数**: `router.push({ name: 'User', params: { id: '123' } })`
3. **路由 meta**: 在路由配置中定义 `meta`

### Q3: 如何处理 404 页面？

```typescript
{
  path: '/:pathMatch(.*)*',  // 匹配所有未定义的路径
  name: 'NotFound',
  component: () => import('@/views/NotFound.vue')
}
```

---

## 总结

| 功能 | API |
|------|-----|
| 路由跳转 | `router.push()` |
| 路由替换 | `router.replace()` |
| 前进后退 | `router.go(n)` |
| 获取路由 | `useRoute()` |
| 获取路由器 | `useRouter()` |
| 路由守卫 | `beforeEach` / `beforeEnter` / `beforeRouteEnter` |

---

**知识点:**
- Vue Router
- SPA 路由
- 路由守卫
- 动态路由
- 嵌套路由
- 编程式导航
