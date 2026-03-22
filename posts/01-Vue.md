# Vue 核心知识

## 目录

1. [Vue2 vs Vue3 核心区别](#一vue2-vs-vue3-核心区别)
2. [生命周期](#二生命周期)
3. [computed 和 watch 的区别](#三computed-和-watch-的区别)
4. [组件通信方式](#四组件通信方式)
5. [虚拟 DOM 和 Diff 算法](#五虚拟-dom-和-diff-算法)
6. [Vue 性能优化](#六vue-性能优化)
7. [常见问题](#七常见问题)
8. [高频知识点汇总](#八高频知识点汇总)

---

## 一、Vue2 vs Vue3 核心区别

### 1. 响应式原理
**Vue2**：Object.defineProperty
- 只能监听对象已有属性，无法监听新增属性
- 无法监听数组下标变化
- 性能开销大，需要递归遍历所有属性

**Vue3**：Proxy
- 可以监听对象所有属性（包括新增、删除）
- 可以监听数组下标变化
- 性能更好，惰性监听

### 2. 组合式 API vs 选项式 API
**Vue2（选项式）**：
```javascript
export default {
  data() { return { count: 0 } },
  computed: { double() { return this.count * 2 } },
  methods: { increment() { this.count++ } }
}
```

**Vue3（组合式）**：
```javascript
import { ref, computed } from 'vue'
export default {
  setup() {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    const increment = () => count.value++
    return { count, double, increment }
  }
}
```

### 3. TypeScript 支持
- Vue2：对 TypeScript 支持较弱，需要大量类型声明
- Vue3：用 TypeScript 重写，原生支持良好

---

## 二、生命周期

### Vue2 生命周期
```
beforeCreate → created → beforeMount → mounted →
beforeUpdate → updated → beforeDestroy → destroyed
```

### Vue3 生命周期（组合式 API）
```
onBeforeMount → onMounted → onBeforeUpdate → onUpdated →
onBeforeUnmount → onUnmounted
```

### 对应关系
| Vue2 | Vue3 |
|------|------|
| beforeCreate | setup() |
| created | setup() |
| beforeMount | onBeforeMount |
| mounted | onMounted |
| beforeUpdate | onBeforeUpdate |
| updated | onUpdated |
| beforeDestroy | onBeforeUnmount |
| destroyed | onUnmounted |

---

## 三、computed 和 watch 的区别

### computed
- **有缓存**：依赖不变时不会重新计算
- **同步计算**：必须返回值
- **不支持异步**：不能有副作用操作
- **默认只读**：需要可写时需要手动实现

```javascript
const fullName = computed(() => {
  return firstName.value + ' ' + lastName.value
})

// 可写 computed
const fullName = computed({
  get: () => firstName.value + ' ' + lastName.value,
  set: (val) => {
    [firstName.value, lastName.value] = val.split(' ')
  }
})
```

### watch
- **无缓存**：每次依赖变化都会执行
- **支持异步**：可以有副作用操作
- **返回值无意义**：主要是执行副作用
- **可配置**：immediate、deep 等

```javascript
// 基本用法
watch(source, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})

// 深度监听
watch(obj, (val) => {
  console.log(val)
}, { deep: true })

// 立即执行
watch(count, (val) => {
  console.log(val)
}, { immediate: true })

// 监听多个源
watch([foo, bar], ([newFoo, newBar], [oldFoo, oldBar]) => {
  console.log(newFoo, newBar)
})
```

---

## 四、组件通信方式

### 1. props / emit（父子通信）
```javascript
// 父组件
<Child :msg="message" @update="handleUpdate" />

// 子组件
const props = defineProps<{ msg: string }>()
const emit = defineEmits(['update'])
emit('update', newValue)
```

### 2. provide / inject（跨层级通信）
```javascript
// 祖先组件
provide('message', ref('Hello'))

// 后代组件
const message = inject('message')
```

### 3. $refs（父访问子）
```javascript
// 父组件
<Child ref="childRef" />
const childRef = ref()
childRef.value.childMethod()
```

### 4. $parent / $children（子访问父）
```javascript
// 子组件
const parent = getCurrentInstance()?.parent
```

### 5. EventBus（兄弟组件通信）
```javascript
// 创建事件总线
const eventBus = mitt()

// 发送事件
eventBus.emit('update', data)

// 监听事件
eventBus.on('update', (data) => { ... })
```

### 6. Vuex / Pinia（全局状态管理）
详见专属文章：[Vuex 与 Pinia 对比](/article/02-Vuex-Pinia)

---

## 五、虚拟 DOM 和 Diff 算法

### 虚拟 DOM 优势
- 性能优化：减少真实 DOM 操作
- 跨平台：可以渲染到不同平台（Web、Native、小程序等）
- 批量更新：React/Vue 会批量处理 DOM 更新

### Diff 算法核心策略
1. **同层比较**：只比较同一层级的节点
2. **Key 优化**：通过 key 判断节点是否复用
3. **列表优化**：双端指针比较

### 为什么 key 重要？
```javascript
// 不推荐
<li v-for="item in list">{{ item.name }}</li>

// 推荐
<li v-for="item in list" :key="item.id">{{ item.name }}</li>
```

**不用 key 的问题**：
- 列表倒序、插入、删除时会错位
- 带输入框的列表，输入内容会错乱

---

## 六、Vue 性能优化

### 1. 长列表优化
```javascript
// 虚拟滚动
<RecycleScroller
  :items="items"
  :item-size="50"
  v-slot="{ item }"
>
  {{ item.name }}
</RecycleScroller>
```

### 2. 组件懒加载
```javascript
const LazyComponent = defineAsyncComponent(() =>
  import('./LazyComponent.vue')
)
```

### 3. 防抖和节流
```javascript
import { debounce, throttle } from 'lodash-es'

watch(keyword, debounce((val) => {
  search(val)
}, 300))
```

### 4. v-once
```javascript
<div v-once>{{ message }}</div>  <!-- 只渲染一次 -->
```

### 5. 使用 v-memo（Vue3.2+）
```javascript
<div v-memo="[id]">{{ content }}</div>  <!-- id 不变时不重新渲染 -->
```

---

## 七、常见问题

### 1. 为什么 data 必须是函数？
防止多个组件实例共享同一个 data 对象。

```javascript
// 错误
data: { count: 0 }  // 所有实例共享

// 正确
data() { return { count: 0 } }  // 每个实例独立
```

### 2. v-if 和 v-show 的区别？
- **v-if**：条件渲染，不满足条件时不渲染 DOM，切换开销大
- **v-show**：始终渲染，只是切换 display，初始渲染开销大

### 3. nextTick 的作用？
等待 DOM 更新完成后执行回调。

```javascript
const count = ref(0)
count.value++
await nextTick()  // DOM 已更新
console.log(document.querySelector('.count').innerText)
```

### 4. keep-alive 的作用？
缓存组件实例，避免重复创建和销毁。

```javascript
<keep-alive>
  <component :is="currentComponent" />
</keep-alive>
```

---

## 八、高频知识点汇总

1. **Vue 响应式原理是什么？**
   - Vue2：Object.defineProperty（劫持 getter/setter）
   - Vue3：Proxy（代理整个对象）

2. **computed 和 watch 的区别？**
   - computed 有缓存，同步计算，返回值
   - watch 无缓存，支持异步，主要是副作用

3. **Vue 生命周期有哪些？**
   - Vue2：8 个（beforeCreate → destroyed）
   - Vue3：6 个（onBeforeMount → onUnmounted）

4. **组件通信方式有哪些？**
   - props/emit、provide/inject、$refs、EventBus、Vuex/Pinia

5. **为什么要用 key？**
   - 区分节点，提高 Diff 算法效率
   - 避免列表错位问题

6. **Vue Router 路由守卫详见专属文章：** [Vue Router](/article/04-Vue-Router)

7. **Vuex 与 Pinia 对比详见专属文章：** [Vuex 与 Pinia 对比](/article/02-Vuex-Pinia)

8. **Vue 性能优化有哪些方法？**
   - 虚拟滚动、组件懒加载、防抖节流、v-once、v-memo

9. **nextTick 的作用是什么？**
   - 等待 DOM 更新完成后执行回调

10. **v-if 和 v-show 的区别？**
    - v-if：条件渲染，不满足时不渲染 DOM
    - v-show：始终渲染，切换 display
