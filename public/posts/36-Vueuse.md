# VueUse 工具库完整指南

> Vue 3 组合式函数的瑞士军刀，200+ 实用工具，大幅提升开发效率

## 一、简介与安装

VueUse 是基于 Vue 3 Composition API 构建的工具函数集合，涵盖浏览器 API、传感器、状态、动画、网络等各类场景。

```bash
npm install @vueuse/core
```

---

## 二、状态管理

### useStorage —— 响应式持久化存储

```vue
<script setup lang="ts">
import { useStorage, useLocalStorage, useSessionStorage } from '@vueuse/core'

// 自动同步到 localStorage
const theme = useLocalStorage('theme', 'light')  // 默认值 'light'
const userInfo = useLocalStorage('user', { name: '', token: '' })

// 修改会自动保存到 localStorage
theme.value = 'dark'
userInfo.value.name = '张三'

// sessionStorage
const tabState = useSessionStorage('tab', 0)
</script>
```

### useRefHistory —— 历史记录（撤销/重做）

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRefHistory } from '@vueuse/core'

const content = ref('初始文字')
const { history, undo, redo, canUndo, canRedo } = useRefHistory(content)

// 修改内容
content.value = '修改后的文字'
content.value = '再次修改'

// 撤销
if (canUndo.value) undo()

// 重做
if (canRedo.value) redo()

// 查看历史
console.log(history.value)
// [{ snapshot: '再次修改', timestamp: ... }, { snapshot: '修改后的文字', ... }, ...]
</script>
```

---

## 三、浏览器 API

### useEventListener —— 事件监听（自动清理）

```vue
<script setup lang="ts">
import { useEventListener } from '@vueuse/core'

// 自动在组件销毁时移除监听
useEventListener(window, 'resize', () => {
  console.log('窗口大小改变')
})

useEventListener(document, 'keydown', (e: KeyboardEvent) => {
  if (e.key === 'Escape') closeModal()
})
</script>
```

### useWindowSize —— 响应式窗口尺寸

```vue
<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'

const { width, height } = useWindowSize()
</script>

<template>
  <div>当前窗口：{{ width }} x {{ height }}</div>
  <div v-if="width < 768">移动端布局</div>
  <div v-else>桌面端布局</div>
</template>
```

### useScroll —— 滚动状态

```vue
<script setup lang="ts">
import { useScroll } from '@vueuse/core'

const { x, y, isScrolling, arrivedState, directions } = useScroll(window)

// arrivedState.top  // 是否到达顶部
// arrivedState.bottom  // 是否到达底部
// directions.top  // 是否向上滚动
</script>
```

### useIntersectionObserver —— 元素是否可见

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const target = ref<HTMLElement | null>(null)
const isVisible = ref(false)

useIntersectionObserver(target, ([{ isIntersecting }]) => {
  isVisible.value = isIntersecting
})
</script>

<template>
  <!-- 图片懒加载 -->
  <img ref="target" :src="isVisible ? realSrc : placeholder" />
</template>
```

---

## 四、传感器与设备

### useMouse —— 鼠标位置

```vue
<script setup lang="ts">
import { useMouse } from '@vueuse/core'

const { x, y, sourceType } = useMouse()
</script>

<template>
  <div :style="{ transform: `translate(${x}px, ${y}px)` }">跟随鼠标的元素</div>
</template>
```

### useDeviceOrientation —— 设备方向（移动端）

```vue
<script setup lang="ts">
import { useDeviceOrientation } from '@vueuse/core'

const { alpha, beta, gamma } = useDeviceOrientation()
// alpha: 0-360 绕Z轴旋转（指南针方向）
// beta: -180-180 绕X轴（前后倾斜）
// gamma: -90-90 绕Y轴（左右倾斜）
</script>
```

### useBattery —— 电池状态

```vue
<script setup lang="ts">
import { useBattery } from '@vueuse/core'

const { charging, level, chargingTime, dischargingTime } = useBattery()
// level: 0-1 的电量
// charging: 是否充电中
</script>
```

### useGeolocation —— 地理位置

```vue
<script setup lang="ts">
import { useGeolocation } from '@vueuse/core'

const { coords, locatedAt, error } = useGeolocation()
// coords.latitude  // 纬度
// coords.longitude // 经度
</script>
```

---

## 五、网络状态

### useNetwork —— 网络信息

```vue
<script setup lang="ts">
import { useNetwork } from '@vueuse/core'

const { isOnline, offlineAt, downlink, effectiveType } = useNetwork()
// isOnline: 是否联网
// effectiveType: 'slow-2g' | '2g' | '3g' | '4g'
</script>

<template>
  <div v-if="!isOnline" class="offline-tip">
    ⚠️ 网络连接已断开
  </div>
</template>
```

### useFetch —— 响应式请求

```vue
<script setup lang="ts">
import { useFetch } from '@vueuse/core'

const { data, error, isFetching, execute } = useFetch('/api/users').json()

// 手动触发
// execute()
</script>

<template>
  <div v-if="isFetching">加载中...</div>
  <div v-else-if="error">错误：{{ error }}</div>
  <div v-else>{{ data }}</div>
</template>
```

---

## 六、工具函数

### useDebounce / useThrottle —— 防抖节流

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useDebouncedRef, useThrottledRef } from '@vueuse/core'

// 防抖 ref：值改变后 500ms 才触发 watch
const searchQuery = useDebouncedRef('', 500)

// 节流 ref
const scrollTop = useThrottledRef(0, 200)
</script>
```

### useClipboard —— 剪贴板

```vue
<script setup lang="ts">
import { useClipboard } from '@vueuse/core'

const { text, copy, copied, isSupported } = useClipboard()

async function handleCopy() {
  await copy('要复制的文字')
  // copied.value 会在复制后短暂变为 true
}
</script>

<template>
  <button @click="handleCopy">
    {{ copied ? '✅ 已复制' : '📋 复制' }}
  </button>
</template>
```

### useTitle —— 动态页面标题

```vue
<script setup lang="ts">
import { useTitle } from '@vueuse/core'

const title = useTitle('首页 - 我的博客')

// 修改标题
title.value = '文章详情 - 我的博客'
</script>
```

### useDark —— 暗色模式

```vue
<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <button @click="toggleDark()">
    {{ isDark ? '🌙 暗色' : '☀️ 亮色' }}
  </button>
</template>
```

---

## 七、动画

### useInterval / useTimeout —— 响应式计时器

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useInterval, useTimeout } from '@vueuse/core'

const count = ref(0)

// 每秒计数，返回 pause/resume 控制
const { pause, resume } = useInterval(1000, {
  callback: () => count.value++
})

// 3秒后执行
const { isPending } = useTimeout(3000, {
  callback: () => console.log('时间到！')
})
</script>
```

### useTransition —— 数值过渡动画

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useTransition, TransitionPresets } from '@vueuse/core'

const source = ref(0)
const output = useTransition(source, {
  duration: 1500,
  transition: TransitionPresets.easeOutExpo
})

// 将 source 改为 100，output 会平滑过渡到 100
source.value = 100
</script>

<template>
  <!-- 数字滚动动画 -->
  <div class="counter">{{ Math.round(output) }}</div>
</template>
```

---

## 八、实用组合示例

### 无限滚动加载

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

const list = ref<string[]>([])
const loadMoreRef = ref<HTMLElement | null>(null)
const loading = ref(false)

// 当"加载更多"元素进入视口时触发加载
useIntersectionObserver(loadMoreRef, async ([{ isIntersecting }]) => {
  if (!isIntersecting || loading.value) return
  
  loading.value = true
  const newItems = await fetchMoreData()
  list.value.push(...newItems)
  loading.value = false
})
</script>

<template>
  <ul>
    <li v-for="item in list">{{ item }}</li>
  </ul>
  <div ref="loadMoreRef">
    <span v-if="loading">加载中...</span>
    <span v-else>下拉加载更多</span>
  </div>
</template>
```
