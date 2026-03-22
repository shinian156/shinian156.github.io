# Axios & Fetch 完整指南

> 前端 HTTP 请求全解，从基础到封装实战

## 目录

1. [选型对比](#一选型对比)
2. [Axios 基础使用](#二axios-基础使用)
3. [Axios 进阶配置](#三axios-进阶配置)
4. [请求拦截与响应拦截](#四请求拦截与响应拦截)
5. [统一封装实战](#五统一封装实战)
6. [Fetch API](#六fetch-api)
7. [常见问题与最佳实践](#七常见问题与最佳实践)

---

## 一、选型对比

| | Axios | Fetch |
|---|---|---|
| 浏览器兼容 | IE 11+ | 现代浏览器（IE 不支持） |
| Node.js 支持 | ✅ | ✅（Node 18+原生） |
| 拦截器 | ✅ 内置 | ❌ 需手动实现 |
| 超时设置 | ✅ 内置 | ❌ 需用 AbortController |
| 请求取消 | ✅ | ✅ AbortController |
| 自动转换JSON | ✅ | ❌ 需 `.json()` |
| 进度监控 | ✅ | ❌ 复杂 |
| 包大小 | ~14kb | 原生，0kb |

**推荐选择：** 项目中统一用 Axios + 封装层，Fetch 了解即可。

---

## 二、Axios 基础使用

### 安装

```bash
npm install axios
```

### 基本请求

```js
import axios from 'axios'

// GET 请求
const res = await axios.get('/api/users')
console.log(res.data)

// 带参数的 GET
const res = await axios.get('/api/users', {
  params: { page: 1, pageSize: 10, keyword: '张三' }
})
// 实际请求：/api/users?page=1&pageSize=10&keyword=张三

// POST 请求
const res = await axios.post('/api/users', {
  name: '张三',
  email: 'zhang@example.com'
})

// PUT 请求
await axios.put(`/api/users/${id}`, { name: '李四' })

// DELETE 请求
await axios.delete(`/api/users/${id}`)

// PATCH 请求
await axios.patch(`/api/users/${id}`, { name: '王五' })
```

---

## 三、Axios 封装（项目实战推荐）

```ts
// src/utils/request.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'  // 或你用的 UI 库

// 响应数据结构
interface ApiResponse<T = any> {
  code: number
  data: T
  message: string
}

// 创建实例
const request: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 自动附加 Token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { code, data, message } = response.data

    if (code === 200) {
      return data  // 直接返回业务数据
    }

    // 业务错误统一处理
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message))
  },
  (error) => {
    // HTTP 错误处理
    const status = error.response?.status
    const msgMap: Record<number, string> = {
      400: '请求参数错误',
      401: '登录已过期，请重新登录',
      403: '没有权限访问',
      404: '请求的资源不存在',
      500: '服务器内部错误',
      502: '网关错误',
      503: '服务暂不可用'
    }

    if (status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }

    ElMessage.error(msgMap[status] || '网络请求失败')
    return Promise.reject(error)
  }
)

export default request
```

### API 模块化

```ts
// src/api/user.ts
import request from '@/utils/request'

interface User {
  id: number
  name: string
  email: string
}

interface UserListParams {
  page: number
  pageSize: number
  keyword?: string
}

export const userApi = {
  // 获取用户列表
  getList: (params: UserListParams) =>
    request.get<User[]>('/users', { params }),

  // 获取用户详情
  getById: (id: number) =>
    request.get<User>(`/users/${id}`),

  // 创建用户
  create: (data: Omit<User, 'id'>) =>
    request.post<User>('/users', data),

  // 更新用户
  update: (id: number, data: Partial<User>) =>
    request.put<User>(`/users/${id}`, data),

  // 删除用户
  delete: (id: number) =>
    request.delete(`/users/${id}`)
}
```

### 在 Vue 组件中使用

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { userApi } from '@/api/user'

const users = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    users.value = await userApi.getList({ page: 1, pageSize: 10 })
  } finally {
    loading.value = false
  }
})
</script>
```

---

## 四、请求取消

```ts
// 取消重复请求（路由切换时取消所有进行中的请求）
const pendingRequests = new Map<string, AbortController>()

request.interceptors.request.use((config) => {
  const key = `${config.method}_${config.url}`
  
  // 取消上一个相同请求
  if (pendingRequests.has(key)) {
    pendingRequests.get(key)!.abort()
  }
  
  const controller = new AbortController()
  config.signal = controller.signal
  pendingRequests.set(key, controller)
  
  return config
})

// 在路由守卫中清除所有请求
router.beforeEach(() => {
  pendingRequests.forEach(controller => controller.abort())
  pendingRequests.clear()
})
```

---

## 五、上传文件

```ts
// 上传单个文件
async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', 'avatar')

  return request.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      const percent = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      )
      console.log(`上传进度：${percent}%`)
    }
  })
}
```

---

## 六、Fetch API 使用

```js
// 基础 GET
const res = await fetch('/api/users')
const data = await res.json()

// POST
const res = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '张三' })
})

// 带超时的 Fetch（需要 AbortController）
async function fetchWithTimeout(url: string, timeout = 5000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  
  try {
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }
    return await res.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('请求超时')
    }
    throw error
  }
}
```

---

## 七、并发请求

```ts
import axios from 'axios'

// 并发执行多个请求
const [users, products, orders] = await Promise.all([
  request.get('/users'),
  request.get('/products'),
  request.get('/orders')
])

// 全部完成（有一个失败全部失败）
// 允许部分失败
const results = await Promise.allSettled([
  request.get('/api-1'),
  request.get('/api-2'),
  request.get('/api-3')
])

results.forEach((result) => {
  if (result.status === 'fulfilled') {
    console.log('成功：', result.value)
  } else {
    console.error('失败：', result.reason)
  }
})
```

---

## 八、请求重试

```ts
// 封装重试逻辑
async function requestWithRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error
    await new Promise(resolve => setTimeout(resolve, delay))
    return requestWithRetry(fn, retries - 1, delay * 2) // 指数退避
  }
}

// 使用
const data = await requestWithRetry(
  () => request.get('/api/unstable-endpoint'),
  3,  // 最多重试3次
  500 // 初始延迟500ms
)
```
