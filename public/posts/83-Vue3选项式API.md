# Vue 3 选项式 API（Options API）使用指南与案例模板

> **分类：前端框架** | **难度：入门** | **前置知识：HTML/CSS/JS 基础**

## 为什么还要学 Options API？

Vue 3 推出了 `<script setup>` 组合式 API，但 **选项式 API（Options API）并没有被淘汰**。它在以下场景中依然非常有价值：

| 场景 | 为什么用 Options API |
|------|---------------------|
| **维护老项目** | Vue 2 项目升级到 Vue 3 时无需重写 |
| **团队协作** | 代码结构固定，新人容易上手 |
| **简单组件** | 数据和逻辑不多时，Options 更直观 |
| **学习过渡** | 理解 Options 后再学 Composition 会更清晰 |
| **官方文档/示例** | 大量第三方教程仍以 Options API 编写 |

**核心观点：** 两种 API 是互补关系，不是替代关系。

---

## 目录

- [一、Options API vs Composition API 对照总览](#一options-api-vs-composition-api-对照总览)
- [二、基础模板结构](#二基础模板结构)
- [三、data — 响应式数据](#三data--响应式数据)
- [四、methods — 方法定义](#四methods--方法定义)
- [五、computed — 计算属性](#五computed--计算属性)
- [六、watch — 侦听器](#六watch--侦听器)
- [七、生命周期钩子](#七生命周期钩子)
- [八、props 与 emits](#八props-与-emits)
- [九、10 个实战案例模板（直接复制可用）](#九10-个实战案例模板直接复制可用)

---

## 一、Options API vs Composition API 对照总览

这是最关键的对照表——**每个 Options API 概念都对应一个 Composition 写法**：

```
┌─────────────────────────────────────────────────────────────┐
│              Options API          │     Composition API      │
├─────────────────────────────────────────────────────────────┤
│  data()                        │    ref() / reactive()      │
│  methods: {}                   │    普通函数                 │
│  computed: {}                  │    computed()              │
│  watch: {}                     │    watch() / watchEffect() │
│  created() / mounted() ...     │    onMounted() 等          │
│  props: {}                     │    defineProps()           │
│  emits: {}                     │    defineEmits()           │
│  this.$refs                    │    ref() + template ref    │
│  provide / inject              │    provide() / inject()    │
│  components: {}                │    直接 import 使用         │
│  filters (已移除)              │    用方法或 computed 替代   │
└─────────────────────────────────────────────────────────────┘
```

### 同一功能的两种写法对照

```vue
<!-- ═══ Options API 写法 ═══ -->
<script>
export default {
  data() {
    return {
      count: 0,
      name: 'Vue'
    }
  },
  computed: {
    doubleCount() {
      return this.count * 2
    },
    greeting() {
      return `Hello, ${this.name}!`
    }
  },
  methods: {
    increment() {
      this.count++
    },
    reset() {
      this.count = 0
    }
  },
  watch: {
    count(newVal, oldVal) {
      console.log(`count changed: ${oldVal} → ${newVal}`)
    }
  },
  mounted() {
    console.log('Component mounted, count =', this.count)
  }
}
</script>

<!-- ═══ Composition API 写法（等价功能）═══ -->
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

const count = ref(0)
const name = ref('Vue')

const doubleCount = computed(() => count.value * 2)
const greeting = computed(() => `Hello, ${name.value}!`)

function increment() { count.value++ }
function reset() { count.value = 0 }

watch(count, (newVal, oldVal) => {
  console.log(`count changed: ${oldVal} → ${newVal}`)
})

onMounted(() => {
  console.log('Component mounted, count =', count.value)
})
</script>
```

---

## 二、基础模板结构

### 2.1 标准的 Options API 组件骨架

```vue
<template>
  <div class="my-component">
    <h2>{{ title }}</h2>
    <p>计数：{{ count }}</p>
    <button @click="increment">+1</button>
  </div>
</template>

<script>
export default {
  name: 'MyComponent',       // 组件名（调试时显示）
  
  // 组件属性
  inheritAttrs: true,        // 是否继承根元素属性（默认 true）
  
  // 响应式数据
  data() {
    return {
      title: '我的组件',
      count: 0
    }
  },

  // 计算属性
  computed: {},

  // 方法
  methods: {},

  // 侦听器
  watch: {},

  // 生命周期钩子
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeUnmount() {},   // Vue 3 名称（Vue 2 叫 beforeDestroy）
  unmounted() {}        // Vue 3 名称（Vue 2 叫 destroyed）
}
</script>

<style scoped>
.my-component { padding: 20px; }
</style>
```

### 2.2 各选项执行顺序

```
组件创建流程：
  ① beforeCreate()  ← data/methods 还不存在
  ② created()       ← data/methods 已就绪，但 DOM 未挂载
  ③ beforeMount()   ← 模板编译完成，即将渲染
  ④ mounted()       ← ✅ DOM 已挂载，可访问 this.$el
  
组件更新流程：
  ⑤ beforeUpdate()  ← 数据变化，DOM 尚未更新
  ⑥ updated()       ← ✅ DOM 已更新完毕

组件销毁流程：
  ⑦ beforeUnmount() ← 即将卸载，DOM 仍在
  ⑧ unmounted()     ← ✅ 完全卸载，清理资源
```

---

## 三、data — 响应式数据

### 3.1 基本用法

```javascript
export default {
  data() {
    return {
      // 基本类型
      message: 'Hello',
      count: 0,
      isVisible: true,
      
      // 数组
      items: [],
      tags: ['vue', 'js', 'ts'],
      
      // 对象
      user: {
        name: '',
        age: 0,
        avatar: ''
      },
      
      // 表单对象
      form: {
        username: '',
        password: '',
        rememberMe: false
      },
      
      // 分页状态
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      },
      
      // UI 状态
      loading: false,
      error: null as string | null,
      activeTab: 'home' as string,
      selectedKeys: [] as string[]
    }
  }
}
```

### 3.2 ⚠️ 重要规则

```javascript
// ❌ 错误：data 不能用箭头函数！this 会丢失
data: () => ({ count: 0 })

// ✅ 正确：必须用普通函数
data() {
  return { count: 0 }
}

// ❌ 错误：不要在 data 外部给对象添加属性（非响应式）
mounted() {
  this.user.email = 'test@example.com'  // 不是响应式的！
}

// ✅ 正确方式
mounted() {
  this.$set(this.user, 'email', 'test@example.com')   // Vue 2
  // Vue 3 中可以直接赋值，但最好初始就在 data 里声明
}

// ❌ 错误：不要返回已有引用（多个实例会共享同一对象）
data() {
  return {
    list: defaultList  // 外部变量引用！所有实例共享
  }
}

// ✅ 正确：每次返回新对象
data() {
  return {
    list: [...defaultList]  // 浅拷贝
  }
}
```

### 3.3 在模板和方法中使用 data

```vue
<template>
  <div>
    <!-- 模板中自动解包，不需要 .value 或 this -->
    <p>{{ message }}</p>
    <p>{{ user.name }}</p>
    
    <!-- v-model 双向绑定 -->
    <input v-model="form.username" />
    <input type="checkbox" v-model="form.rememberMe" />
  </div>
</template>

<script>
export default {
  data() {
    return { message: '', form: { username: '', rememberMe: false } }
  },
  methods: {
    // methods 中通过 this 访问
    updateMessage(msg) {
      this.message = msg  // ✅ 用 this.
      console.log(this.form.username)  // ✅ 用 this.
    }
  }
}
</script>
```

---

## 四、methods — 方法定义

### 4.1 定义与调用

```javascript
export default {
  data() {
    return {
      count: 0,
      text: ''
    }
  },
  
  methods: {
    // 无参方法
    increment() {
      this.count++
    },
    
    // 有参方法
    addStep(step = 1) {
      this.count += step
    },
    
    // 返回值方法
    getCountText() {
      return `当前计数: ${this.count}`
    },
    
    // 异步方法
    async fetchData() {
      this.loading = true
      try {
        const res = await fetch('/api/data')
        const json = await res.json()
        this.items = json.data
      } catch (e) {
        this.error = e.message
      } finally {
        this.loading = false
      }
    },
    
    // 事件处理方法（接收事件对象）
    handleClick(e) {
      console.log('点击了:', e.target)
    },
    
    // 表单提交
    async handleSubmit() {
      if (!this.validateForm()) return
      
      await api.submit(this.form)
      this.$message.success('提交成功')
      this.resetForm()
    },
    
    // 内部辅助方法（以 _ 开头表示私有）
    _validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    },
    
    resetForm() {
      this.form.username = ''
      this.form.password = ''
      this.form.rememberMe = false
    },
    
    validateForm() {
      if (!this.form.username) {
        this.$message.warning('请输入用户名')
        return false
      }
      return true
    }
  }
}
```

### 4.2 模板中的调用方式

```vue
<template>
  <!-- 直接调用（无参数） -->
  <button @click="increment">+1</button>
  
  <!-- 传参调用 -->
  <button @click="addStep(5)">+5</button>
  
  <!-- 获取返回值 -->
  <span>{{ getCountText() }}</span>
  
  <!-- 事件对象 + 自定义参数（注意括号） -->
  <input @input="handleInput($event)" />
  
  <!-- 链式调用 -->
  <button @click="fetchData(); increment()">加载并计数</button>
</template>
```

### 4.3 methods 注意事项

```javascript
methods: {
  // ❌ 不要用箭头函数！（this 指向错误）
  badMethod: () => {
    console.log(this)  // undefined 或 window，不是组件实例
  },
  
  // ✅ 必须用普通函数
  goodMethod() {
    console.log(this)  // 组件实例 ✓
  },
  
  // ❌ 不要在 methods 里修改其他方法的引用
  mounted() {
    this.increment = () => {}  // 不建议这样做
  }
}
```

---

## 五、computed — 计算属性

### 5.1 基本计算属性

```javascript
export default {
  data() {
    return {
      firstName: '',
      lastName: '',
      price: 0,
      quantity: 1,
      discount: 0,
      items: [] as Array<{ price: number; count: number }>
    }
  },
  
  computed: {
    // 基本派生
    fullName() {
      return `${this.firstName} ${this.lastName}`.trim()
    },
    
    // 数学运算
    totalPrice() {
      return this.price * this.quantity * (1 - this.discount)
    },
    
    // 数组操作
    cartTotal() {
      return this.items.reduce((sum, item) => {
        return sum + item.price * item.count
      }, 0)
    },
    
    // 过滤/映射
    activeItems() {
      return this.items.filter(item => item.count > 0)
    },
    
    // 条件判断
    hasItems() {
      return this.items.length > 0
    },
    isEmptyCart() {
      return !this.hasItems
    },
    
    // 格式化
    formattedPrice() {
      return `¥${this.cartTotal.toFixed(2)}`
    },
    
    // 多条件组合
    canSubmit() {
      return this.firstName && this.lastName && !this.loading
    }
  }
}
```

### 5.2 可写计算属性

```javascript
computed: {
  // 只读（最常见）
  readOnlyValue() {
    return this.a + this.b
  },
  
  // 可写（较少用，但某些场景很方便）
  fullName: {
    get() {
      return `${this.firstName} ${this.lastName}`
    },
    set(newValue) {
      const parts = newValue.split(' ')
      this.firstName = parts[0] || ''
      this.lastName = parts.slice(1).join(' ') || ''
    }
  },
  
  // 实例：搜索关键词的双向绑定
  searchQuery: {
    get() {
      return this.internalQuery
    },
    set(val) {
      this.internalQuery = val
      this.debouncedSearch()
    }
  }
}
```

### 5.3 computed vs methods 的选择

```vue
<template>
  <!-- computed：有缓存，依赖不变时不会重新计算 -->
  <p>{{ expensiveResult }}</p>
  <p>{{ expensiveResult }}</p>  <!-- 第二次读取缓存结果 -->

  <!-- methods：每次重新渲染都会重新执行 -->
  <p>{{ calculateExpensive() }}</p>
  <p>{{ calculateExpensive() }}</p>  <!-- 第二次重新执行！ -->
</template>

<script>
export default {
  computed: {
    // ✅ 有依赖数据，需要缓存 → 用 computed
    expensiveResult() {
      let result = 0
      for (let i = 0; i < this.largeArray.length; i++) {
        result += this.largeArray[i].value
      }
      return result
    }
  },
  methods: {
    // ✅ 需要传参或每次都需要最新结果 → 用 methods
    calculateExpensive() {
      // ...
    },
    // ✅ 有副作用（如发请求）→ 用 methods
    fetchData() { /* ... */ }
  }
}
</script>
```

| 特性 | computed | methods |
|------|----------|---------|
| 缓存 | ✅ 有缓存 | ❌ 无缓存 |
| 参数 | ❌ 不能传参 | ✅ 可以传参 |
| 副作用 | ❌ 应该是纯函数 | ✅ 可以有副作用 |
| 模板调用 | `{{ value }}` | `{{ fn() }}` |

---

## 六、watch — 侦听器

### 6.1 基本监听

```javascript
export default {
  data() {
    return {
      keyword: '',
      userId: null as number | null,
      formData: { name: '', email: '' },
      list: []
    }
  },
  
  watch: {
    // 监听 data 中的基本属性
    keyword(newVal, oldVal) {
      console.log(`搜索词: "${oldVal}" → "${newVal}"`)
      this.doSearch(newVal)
    },
    
    // 监听并立即执行一次
    userId: {
      handler(id) {
        if (id) this.fetchUserDetail(id)
      },
      immediate: true  // 组件创建时就执行一次
    },
    
    // 深度监听对象
    formData: {
      handler(newForm) {
        this.saveDraft(newForm)  // 表单任何字段变化都触发
      },
      deep: true  // 递归监听内部所有属性
    },
    
    // 监听数组
    list(newList, oldList) {
      console.log('列表更新了，新长度:', newList.length)
      // 注意：oldList 和 newList 是同一个引用（除非整体替换）
    }
  },
  
  methods: {
    doSearch(keyword) { /* ... */ },
    fetchUserDetail(id) { /* ... */ },
    saveDraft(form) { /* ... */ }
  }
}
```

### 6.2 高级监听模式

```javascript
watch: {
  // 字符串形式监听（可以监听嵌套属性）
  'formData.name': function(newName) {
    console.log('姓名改为:', newName)
  },
  
  // 同时监听多个数据（不推荐，改用 $watch）
  /*
  // Options API 无法像 composition 那样 watch([a, b], ...)
  // 解决方案：用一个 computed 作为桥梁
  */
},
computed: {
  watchTarget() {
    return { a: this.keyword, b: this.userId }
  }
},
watch: {
  watchTarget: {
    handler({ a, b }) {
      console.log('keyword 或 userId 变了', a, b)
    },
    deep: true
  }
}
```

### 6.3 $watch 实例方法（动态监听）

```javascript
mounted() {
  // 动态创建监听器，返回取消函数
  const unwatch = this.$watch(
    () => this.someDynamicProperty,  // 可以是函数返回值
    (newVal, oldVal) => {
      console.log('动态属性变化了')
    }
  )
  
  // 需要时手动停止监听
  // unwatch()
}
```

### 6.4 watch 选项完整配置

```javascript
watch: {
  someData: {
    handler(newVal, oldVal) {
      // 回调函数
    },
    immediate: false,    // 是否立即执行一次（默认 false）
    deep: false,         // 是否深度监听（默认 false）
    flush: 'pre'         // 执行时机：'pre'(默认) / 'post' / 'sync'
    // pre  - DOM 更新前执行
    // post - DOM 更新后执行（可访问 updated DOM）
    // sync - 同步执行
  }
}
```

---

## 七、生命周期钩子

### 7.1 所有钩子一览

```javascript
export default {
  // ─── 创建阶段 ───
  beforeCreate() {
    // ❌ data 和 methods 还不可用
    // 适用场景：极少使用，可能在插件开发中用到
    console.log('beforeCreate', this.$data)  // undefined
  },
  
  created() {
    // ✅ data / methods / computed 已初始化
    // ❌ DOM 未挂载，不能访问 this.$el
    // 适用场景：
    //   - 发起初始数据请求
    //   - 初始化非 DOM 相关的状态
    //   - 设置定时器和事件总线监听
    this.fetchInitialData()
    this.startTimer()
  },
  
  // ─── 挂载阶段 ───
  beforeMount() {
    // 模板已编译成 render 函数
    // 但尚未渲染为真实 DOM
    // 适用场景：极少使用
  },
  
  mounted() {
    // ✅ DOM 已挂载完成
    // 适用场景：
    //   - 操作 DOM（获取尺寸/位置/焦点）
    //   - 初始化第三方库（ECharts、Swiper、地图）
    //   - 添加全局事件监听（scroll/resize）
    //   - 设置 IntersectionObserver
    this.initChart()
    window.addEventListener('resize', this.handleResize)
    
    // 访问 DOM 元素
    console.log(this.$refs.container.offsetWidth)
  },
  
  // ─── 更新阶段 ───
  beforeUpdate() {
    // 数据已变化，DOM 即将更新
    // 适用场景：在 DOM 更新前记录旧状态
  },
  
  updated() {
    // ✅ DOM 已更新完成
    // 适用场景：依赖更新后的 DOM 进行操作
    // 注意：避免在此修改数据（可能导致无限循环！）
    this.updateChartSize()
  },
  
  // ─── 卸载阶段 ───
  beforeUnmount() {
    // 组件即将卸载，DOM 仍存在
    // 适用场景：做最后的清理工作
  },
  
  unmounted() {
    // ✅ 组件已完全卸载
    // ⚠️ 必须在此清理所有资源！
    //   - 清除定时器
    //   - 移除事件监听
    //   - 取消网络请求
    //   - 断开 WebSocket
    //   - 销毁第三方库实例
    clearInterval(this.timerId)
    window.removeEventListener('resize', this.handleResize)
    this.chart?.dispose()
  }
}
```

### 7.2 生命周期父子顺序

```
父 beforeCreate → 父 created
  子 beforeCreate → 子 created
  子 beforeMount → 子 mounted
父 beforeMount → 父 mounted

// 数据变化时：
父 beforeUpdate → 子 beforeUpdate → 子 updated → 父 updated

// 卸载时：
父 beforeUnmount
  子 beforeUnmount → 子 unmounted
父 unmounted
```

---

## 八、props 与 emits

### 8.1 Props 定义

```javascript
export default {
  props: {
    // 基础类型检查
    title: String,
    count: Number,
    isActive: Boolean,
    
    // 多个可能类型
    value: [String, Number],
    
    // 必填字段
    requiredProp: {
      type: String,
      required: true
    },
    
    // 默认值
    optionalProp: {
      type: Number,
      default: 42
    },
    
    // 对象/数组默认值必须用工厂函数
    items: {
      type: Array,
      default: () => []
    },
    config: {
      type: Object,
      default: () => ({
        theme: 'light',
        showHeader: true
      })
    },
    
    // 自定义验证函数
    age: {
      type: Number,
      validator(value) {
        return value >= 0 && value <= 150
      }
    },
    
    // 枚举约束
    size: {
      type: String,
      validator(value) {
        return ['sm', 'md', 'lg'].includes(value)
      },
      default: 'md'
    }
  },
  
  // props 数据可以在 data/methods/computed 中通过 this 访问
  computed: {
    displayTitle() {
      return this.title || '默认标题'
    }
  }
}
```

### 8.2 Emits 定义

```javascript
export default {
  emits: {
    // 带验证的 emit
    click(payload) {
      if (!payload.event) {
        console.warn('click event 需要 event 参数')
        return false
      }
      return true
    },
    
    // 简单声明（不做验证）
    close: null,
    submit: null,
    
    // 带参数说明
    'update:value': null,
    'update:modelValue': null
  },
  
  methods: {
    handleClick(e) {
      // 触发事件并传参
      this.$emit('click', { event: e })
      this.$emit('submit', this.formData)
    },
    
    closeModal() {
      this.$emit('close')
    },
    
    // v-model 支持
    updateValue(val) {
      this.$emit('update:value', val)
      this.$emit('update:modelValue', val)
    }
  }
}
```

### 8.3 v-model 在 Options API 中的实现

```vue
<template>
  <!-- 子组件支持 v-model -->
  <input 
    :value="modelValue" 
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>

<script>
export default {
  props: {
    modelValue: { type: String, default: '' }
  },
  emits: ['update:modelValue']
}
</script>

<!-- 父组件使用 -->
<MyInput v-model="searchKeyword" />
```

### 8.4 其他常用选项

```javascript
export default {
  // 组件名称
  name: 'UserCard',
  
  // 继承特性（是否将非 props 属性应用到根元素）
  inheritAttrs: false,  // 设为 false 可自定义属性绑定位置
  
  // 注册子组件
  components: {
    UserAvatar: './UserAvatar.vue',
    ActionButton: './ActionButton.vue'
  },
  
  // provide 提供数据给后代组件
  provide() {
    return {
      theme: this.theme,
      toggleTheme: this.toggleTheme
    }
  },
  
  // inject 注入祖先提供的数据
  inject: {
    // 简单注入（无默认值）
    theme: { default: 'light' },
    
    // 带默认值的注入
    locale: {
      from: 'localeConfig',
      default: () => ({ lang: 'zh-CN', dateFormat: 'YYYY-MM-DD' })
    }
  },
  
  // 过滤器（Vue 3 已移除，保留仅为兼容提示）
  // ❌ Vue 3 中不再支持 filters 选项
  // 改用 methods 或 computed 替代
  
  // directives 自定义指令
  directives: {
    focus: {
      mounted(el) {
        el.focus()
      }
    },
    permission: {
      mounted(el, binding) {
        const permission = binding.value
        if (!hasPermission(permission)) {
          el.parentNode?.removeChild(el)
        }
      }
    }
  }
}
```

---

## 九、10 个实战案例模板（直接复制可用）

### 📋 案例 1：计数器（最简单的完整组件）

```vue
<template>
  <div class="counter">
    <button @click="decrement" :disabled="count <= min">-</button>
    <span class="count">{{ count }}</span>
    <button @click="increment" :disabled="count >= max">+</button>
  </div>
</template>

<script>
export default {
  name: 'Counter',
  props: {
    initialValue: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 }
  },
  data() {
    return {
      count: this.initialValue
    }
  },
  watch: {
    count(val) {
      this.$emit('change', val)
    },
    initialValue(val) {
      this.count = val
    }
  },
  methods: {
    increment() {
      if (this.count < this.max) this.count += this.step
    },
    decrement() {
      if (this.count > this.min) this.count -= this.step
    }
  },
  emits: ['change']
}
</script>

<style scoped>
.counter { display: inline-flex; align-items: center; gap: 12px; }
.counter button {
  width: 32px; height: 32px; border-radius: 6px;
  border: 1px solid #dcdfe6; background: white; cursor: pointer;
  font-size: 18px; display: flex; align-items: center; justify-content: center;
}
.counter button:disabled { opacity: 0.4; cursor: not-allowed; }
.count { font-size: 20px; font-weight: bold; min-width: 40px; text-align: center; }
</style>
```

**使用：**
```vue
<Counter :initial-value="5" :min="0" :max="20" @change="handleChange" />
```

---

### 📋 案例 2：搜索框（带防抖）

```vue
<template>
  <div class="search-box" :class="{ focused: isFocused }">
    <span class="search-icon">🔍</span>
    <input
      ref="searchInput"
      v-model="query"
      :placeholder="placeholder"
      @focus="isFocused = true"
      @blur="isFocused = false"
      @keyup.enter="handleEnter"
    />
    <button v-if="query" class="clear-btn" @click="clear">✕</button>
  </div>
</template>

<script>
export default {
  name: 'SearchBox',
  props: {
    placeholder: { type: String, default: '请输入关键字...' },
    debounceTime: { type: Number, default: 300 }
  },
  data() {
    return {
      query: '',
      isFocused: false,
      timer: null
    }
  },
  watch: {
    query(val) {
      this.debounceEmit(val)
    }
  },
  methods: {
    debounceEmit(query) {
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.$emit('search', query.trim())
      }, this.debounceTime)
    },
    clear() {
      this.query = ''
      this.$emit('search', '')
      this.$refs.searchInput.focus()
    },
    handleEnter() {
      clearTimeout(this.timer)
      this.$emit('search', this.query.trim())
      this.$emit('enter', this.query.trim())
    }
  },
  beforeUnmount() {
    clearTimeout(this.timer)
  },
  emits: ['search', 'enter']
}
</script>

<style scoped>
.search-box {
  display: flex; align-items: center;
  border: 2px solid #dcdfe6; border-radius: 8px;
  padding: 0 12px; transition: all 0.3s;
}
.search-box.focused { border-color: #409eff; box-shadow: 0 0 0 2px rgba(64,158,255,0.15); }
.search-icon { margin-right: 8px; font-size: 16px; }
.search-box input {
  flex: 1; border: none; outline: none;
  padding: 10px 0; font-size: 14px; background: transparent;
}
.clear-btn {
  background: none; border: none; cursor: pointer;
  color: #999; font-size: 16px; padding: 4px 8px;
}
</style>
```

---

### 📋 案例 3：模态弹窗

```vue
<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="visible" class="modal-mask" @click="onMaskClick">
        <div
          class="modal-box"
          :class="[`modal-${size}`]"
          @click.stop
        >
          <header v-if="showHeader" class="modal-header">
            <slot name="header">
              <h3>{{ title }}</h3>
            </slot>
            <button class="close-btn" @click="close">✕</button>
          </header>
          
          <main class="modal-body">
            <slot></slot>
          </main>
          
          <footer v-if="showFooter" class="modal-footer">
            <slot name="footer">
              <button class="btn btn-default" @click="close">取消</button>
              <button class="btn btn-primary" @click="$emit('confirm')">确定</button>
            </slot>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'ModalDialog',
  props: {
    visible: { type: Boolean, default: false },
    title: { type: String, default: '提示' },
    size: { type: String, default: 'md' },  // sm / md / lg
    maskClosable: { type: Boolean, default: true },
    escClosable: { type: Boolean, default: true },
    showHeader: { type: Boolean, default: true },
    showFooter: { type: Boolean, default: true }
  },
  watch: {
    visible(val) {
      document.body.style.overflow = val ? 'hidden' : ''
      if (val && this.escClosable) {
        document.addEventListener('keydown', this.onEsc)
      } else {
        document.removeEventListener('keydown', this.onEsc)
      }
    }
  },
  methods: {
    close() {
      this.$emit('update:visible', false)
      this.$emit('cancel')
    },
    onMaskClick() {
      if (this.maskClosable) this.close()
    },
    onEsc(e) {
      if (e.key === 'Escape') this.close()
    }
  },
  beforeUnmount() {
    document.body.style.overflow = ''
    document.removeEventListener('keydown', this.onEsc)
  },
  emits: ['update:visible', 'confirm', 'cancel']
}
</script>

<style scoped>
.modal-mask {
  position: fixed; inset: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0, 0, 0, 0.5);
}
.modal-box {
  background: white; border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  max-height: 85vh; display: flex; flex-direction: column;
}
.modal-sm { width: 400px; }
.modal-md { width: 520px; }
.modal-lg { width: 720px; }

.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; border-bottom: 1px solid #eee;
}
.modal-header h3 { margin: 0; font-size: 18px; }
.close-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #999; }
.close-btn:hover { color: #333; }

.modal-body { padding: 20px; overflow-y: auto; flex: 1; }
.modal-footer {
  padding: 12px 20px; border-top: 1px solid #eee;
  display: flex; justify-content: flex-end; gap: 10px;
}
.btn {
  padding: 8px 20px; border-radius: 6px; cursor: pointer;
  border: 1px solid #dcdfe6; font-size: 14px;
}
.btn-primary { background: #409eff; color: white; border-color: #409eff; }
.btn-default { background: white; color: #606266; }

/* 动画 */
.modal-enter-active, .modal-leave-active { transition: all 0.3s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-box, .modal-leave-to .modal-box {
  transform: scale(0.95);
}
</style>
```

---

### 📋 案例 4：Tab 切换组件

```vue
<template>
  <div class="tabs-container">
    <nav class="tabs-nav">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeKey === tab.key }"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
        <span v-if="tab.badge" class="badge">{{ tab.badge }}</span>
      </button>
      <!-- 滑动指示条 -->
      <span class="tab-indicator" :style="indicatorStyle"></span>
    </nav>
    <div class="tab-panel">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tabs',
  props: {
    tabs: {
      type: Array,
      required: true,
      validator(tabs) {
        return tabs.every(tab => tab.key && tab.label)
      }
    },
    modelValue: { type: String, default: '' }
  },
  data() {
    return {
      activeKey: this.modelValue || (this.tabs[0]?.key || '')
    }
  },
  computed: {
    indicatorStyle() {
      const index = this.tabs.findIndex(t => t.key === this.activeKey)
      return {
        transform: `translateX(${index * 100}%)`,
        width: `${100 / this.tabs.length}%`
      }
    }
  },
  watch: {
    modelValue(key) {
      if (key) this.activeKey = key
    },
    activeKey(key) {
      this.$emit('update:modelValue', key)
      this.$emit('change', key)
    }
  },
  methods: {
    switchTab(key) {
      this.activeKey = key
    }
  },
  emits: ['update:modelValue', 'change']
}
</script>

<style scoped>
.tabs-nav {
  position: relative; display: flex; border-bottom: 2px solid #eee;
}
.tab-item {
  position: relative; padding: 12px 24px; cursor: pointer;
  border: none; background: none; font-size: 15px; color: #666;
  transition: color 0.3s; flex: 1; text-align: center;
}
.tab-item:hover { color: #409eff; }
.tab-item.active { color: #409eff; font-weight: 600; }
.badge {
  margin-left: 4px; padding: 0 6px; border-radius: 10px;
  background: #f56c6c; color: white; font-size: 11px;
}
.tab-indicator {
  position: absolute; bottom: -2px; left: 0; height: 2px;
  background: #409eff; transition: transform 0.3s;
}
.tab-panel { padding: 16px 0; }
</style>
```

---

### 📋 案例 5：Todo 列表（增删改查完整示例）

```vue
<template>
  <div class="todo-app">
    <h2>📝 待办事项 ({{ remaining }}/{{ todos.length }})</h2>
    
    <div class="todo-input-row">
      <input
        v-model="newTodo"
        placeholder="添加新的待办事项..."
        @keyup.enter="addTodo"
      />
      <button @click="addTodo" :disabled="!newTodo.trim()">添加</button>
    </div>
    
    <div class="filters">
      <button
        v-for="f in filters"
        :key="f.key"
        :class="{ active: filter === f.key }"
        @click="filter = f.key"
      >{{ f.label }}</button>
    </div>
    
    <TransitionGroup name="list" tag="ul" class="todo-list">
      <li
        v-for="todo in filteredTodos"
        :key="todo.id"
        class="todo-item"
        :class="{ completed: todo.done }"
      >
        <input type="checkbox" v-model="todo.done" />
        <span
          v-if="editingId !== todo.id"
          class="todo-text"
          @dblclick="startEdit(todo)"
        >{{ todo.text }}</span>
        <input
          v-else
          v-model="editText"
          @blur="finishEdit(todo)"
          @keyup.enter="finishEdit(todo)"
          @keyup.escape="cancelEdit"
          class="edit-input"
          ref="editInput"
          autofocus
        />
        <button class="delete-btn" @click="removeTodo(todo.id)">删除</button>
      </li>
    </TransitionGroup>
    
    <div v-if="completedTodos.length" class="actions">
      <button @click="clearCompleted">清除已完成 ({{ completedTodos.length }})</button>
    </div>
  </div>
</template>

<script>
let idCounter = 0

export default {
  name: 'TodoApp',
  data() {
    return {
      newTodo: '',
      filter: 'all',
      editingId: null,
      editText: '',
      todos: [
        // 示例数据
      ],
      filters: [
        { key: 'all', label: '全部' },
        { key: 'active', label: '进行中' },
        { key: 'done', label: '已完成' }
      ]
    }
  },
  computed: {
    filteredTodos() {
      switch (this.filter) {
        case 'active': return this.todos.filter(t => !t.done)
        case 'done': return this.todos.filter(t => t.done)
        default: return this.todos
      }
    },
    completedTodos() {
      return this.todos.filter(t => t.done)
    },
    remaining() {
      return this.todos.filter(t => !t.done).length
    }
  },
  methods: {
    addTodo() {
      const text = this.newTodo.trim()
      if (!text) return
      this.todos.push({
        id: ++idCounter,
        text,
        done: false
      })
      this.newTodo = ''
    },
    removeTodo(id) {
      this.todos = this.todos.filter(t => t.id !== id)
    },
    startEdit(todo) {
      this.editingId = todo.id
      this.editText = todo.text
      this.$nextTick(() => {
        this.$refs.editInput?.focus()
      })
    },
    finishEdit(todo) {
      if (this.editingId === todo.id) {
        const newText = this.editText.trim()
        if (newText) {
          todo.text = newText
        } else {
          this.removeTodo(todo.id)
        }
        this.editingId = null
      }
    },
    cancelEdit() {
      this.editingId = null
    },
    clearCompleted() {
      this.todos = this.todos.filter(t => !t.done)
    }
  }
}
</script>

<style scoped>
.todo-app { max-width: 500px; margin: 0 auto; padding: 20px; }
.todo-app h2 { text-align: center; color: #333; }
.todo-input-row { display: flex; gap: 8px; margin-bottom: 16px; }
.todo-input-row input {
  flex: 1; padding: 10px 14px; border: 2px solid #dcdfe6;
  border-radius: 8px; outline: none; font-size: 14px;
}
.todo-input-row input:focus { border-color: #409eff; }
.todo-input-row button {
  padding: 10px 20px; background: #409eff; color: white;
  border: none; border-radius: 8px; cursor: pointer;
}
.filters { display: flex; gap: 8px; margin-bottom: 16px; }
.filters button {
  padding: 6px 16px; border: 1px solid #dcdfe6; border-radius: 16px;
  background: white; cursor: pointer; font-size: 13px;
}
.filters button.active { background: #409eff; color: white; border-color: #409eff; }

.todo-list { list-style: none; padding: 0; margin: 0; }
.todo-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s;
}
.todo-item.completed .todo-text { text-decoration: line-through; color: #999; }
.todo-text { flex: 1; cursor: pointer; }
.edit-input {
  flex: 1; padding: 4px 8px; border: 2px solid #409eff; border-radius: 4px;
  outline: none; font-size: 14px;
}
.delete-btn {
  background: none; border: none; color: #f56c6c;
  cursor: pointer; opacity: 0; transition: opacity 0.2s;
  font-size: 13px;
}
.todo-item:hover .delete-btn { opacity: 1; }

.actions { margin-top: 16px; text-align: right; }
.actions button {
  padding: 6px 14px; background: none; border: 1px solid #dcdfe6;
  border-radius: 6px; cursor: pointer; color: #999; font-size: 13px;
}

/* 列表动画 */
.list-enter-active, .list-leave-active { transition: all 0.3s ease; }
.list-enter-from, .list-leave-to { opacity: 0; transform: translateX(-20px); }
.list-move { transition: transform 0.3s ease; }
</style>
```

---

### 📋 案例 6：图片懒加载组件

```vue
<template>
  <div class="lazy-image" ref="container">
    <img
      v-show="loaded"
      :src="actualSrc"
      :alt="alt"
      :style="{ objectFit: fit }"
      @load="onLoad"
      @error="onError"
    />
    <div v-if="!loaded && !hasError" class="placeholder">
      <slot name="placeholder">
        <div class="skeleton"></div>
      </slot>
    </div>
    <div v-if="hasError" class="error-state">
      <slot name="error">
        <span>图片加载失败</span>
      </slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LazyImage',
  props: {
    src: { type: String, required: true },
    alt: { type: String, default: '' },
    fit: { type: String, default: 'cover' },
    threshold: { type: Number, default: 0.1 },  // 可见比例阈值
    rootMargin: { type: String, default: '50px' }  // 提前加载距离
  },
  data() {
    return {
      loaded: false,
      hasError: false,
      actualSrc: '',
      observer: null
    }
  },
  mounted() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.actualSrc = this.src
            this.observer.unobserve(entry.target)
          }
        })
      },
      { threshold: this.threshold, rootMargin: this.rootMargin }
    )
    this.observer.observe(this.$refs.container)
  },
  beforeUnmount() {
    this.observer?.disconnect()
  },
  methods: {
    onLoad() {
      this.loaded = true
    },
    onError() {
      this.loaded = true
      this.hasError = true
    }
  }
}
</script>

<style scoped>
.lazy-image {
  overflow: hidden; position: relative; background: #f5f5f5;
}
.lazy-image img { width: 100%; height: 100%; display: block; }
.placeholder, .error-state {
  position: absolute; inset: 0;
  display: flex; align-items: center; justify-content: center;
}
.skeleton {
  width: 100%; height: 100%;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
.error-state span { color: #ccc; font-size: 13px; }
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
```

---

### 📋 案例 7：无限滚动列表

```vue
<template>
  <div class="infinite-scroll" ref="scrollContainer">
    <slot :items="items"></slot>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-more">
      <span class="spinner"></span> 加载中...
    </div>
    
    <!-- 全部加载完 -->
    <div v-else-if="noMore" class="no-more">— 已经到底啦 —</div>
    
    <!-- 加载失败 -->
    <div v-else-if="error" class="load-error">
      加载失败 <button @click="retry">重试</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'InfiniteScroll',
  props: {
    // 由外部传入的加载函数
    loadMore: { type: Function, required: true },
    // 是否还有更多数据
    hasMore: { type: Boolean, default: true },
    // 距离底部多少像素触发加载
    distance: { type: Number, default: 100 }
  },
  data() {
    return {
      loading: false,
      error: false,
      items: [] as any[]
    }
  },
  computed: {
    noMore() {
      return !this.hasMore
    }
  },
  mounted() {
    this.loadInitial()
    this.bindScroll()
  },
  beforeUnmount() {
    this.unbindScroll()
  },
  methods: {
    bindScroll() {
      this.scrollHandler = () => {
        const container = this.$refs.scrollContainer
        if (this.loading || this.noMore) return
        
        const { scrollTop, scrollHeight, clientHeight } = container
        if (scrollTop + clientHeight >= scrollHeight - this.distance) {
          this.loadMoreData()
        }
      }
      this.$refs.scrollContainer.addEventListener('scroll', this.scrollHandler)
    },
    unbindScroll() {
      const container = this.$refs.scrollContainer
      container?.removeEventListener('scroll', this.scrollHandler)
    },
    async loadInitial() {
      this.loading = true
      try {
        const result = await this.loadMore(1)
        this.items = result.data
      } catch (e) {
        this.error = true
      } finally {
        this.loading = false
      }
    },
    async loadMoreData() {
      this.loading = true
      this.error = false
      try {
        const page = Math.ceil(this.items.length / 20) + 1
        const result = await this.loadMore(page)
        this.items.push(...result.data)
        this.$emit('loaded', this.items)
      } catch (e) {
        this.error = true
      } finally {
        this.loading = false
      }
    },
    retry() {
      this.loadMoreData()
    }
  },
  emits: ['loaded']
}
</script>

<style scoped>
.infinite-scroll {
  overflow-y: auto; max-height: 600px;
  position: relative;
}
.loading-more, .no-more, .load-error {
  text-align: center; padding: 20px; color: #999; font-size: 13px;
}
.spinner {
  display: inline-block; width: 16px; height: 16px;
  border: 2px solid #ddd; border-top-color: #409eff;
  border-radius: 50%; animation: spin 0.6s linear infinite;
  vertical-align: middle; margin-right: 6px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.load-error button {
  margin-left: 8px; color: #409eff; background: none;
  border: none; cursor: pointer; text-decoration: underline;
}
</style>
```

---

### 📋 案例 8：倒计时组件

```vue
<template>
  <div class="countdown">
    <slot :days="days" :hours="hours" :minutes="minutes" :seconds="seconds" :finished="isFinished">
      <span v-if="!isFinished" class="time-display">
        <span v-if="showDays && days > 0" class="time-unit">{{ pad(days) }}<small>天</small></span>
        <span class="time-unit">{{ pad(hours) }}<small>时</small></span>
        <span class="time-unit">{{ pad(minutes) }}<small>分</small></span>
        <span class="time-unit">{{ pad(seconds) }}<small>秒</small></span>
      </span>
      <span v-else class="finished-text">
        <slot name="finished">⏰ 时间到！</slot>
      </span>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'Countdown',
  props: {
    // 目标时间戳（毫秒）或秒数
    time: { type: Number, required: true },
    // 格式：true=时间戳(ms), false=剩余秒数
    isTimestamp: { type: Boolean, default: true },
    format: { type: String, default: 'DD:HH:mm:ss' },
    showDays: { type: Boolean, default: true },
    autoStart: { type: Boolean, default: true }
  },
  data() {
    return {
      remaining: 0,
      timer: null,
      isFinished: false
    }
  },
  computed: {
    days() { return Math.floor(this.remaining / 86400) },
    hours() { return Math.floor((this.remaining % 86400) / 3600) },
    minutes() { return Math.floor((this.remaining % 3600) / 60) },
    seconds() { return Math.floor(this.remaining % 60) }
  },
  created() {
    this.calcRemaining()
    if (this.autoStart && !this.isFinished) {
      this.start()
    }
  },
  beforeUnmount() {
    this.stop()
  },
  methods: {
    calcRemaining() {
      if (this.isTimestamp) {
        this.remaining = Math.max(0, Math.floor((this.time - Date.now()) / 1000))
      } else {
        this.remaining = Math.max(0, this.time)
      }
      if (this.remaining <= 0) {
        this.remaining = 0
        this.isFinished = true
        this.$emit('finish')
      }
    },
    start() {
      this.stop()
      this.timer = setInterval(() => {
        this.calcRemaining()
        if (this.isFinished) {
          this.stop()
        }
      }, 1000)
    },
    stop() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    restart() {
      this.isFinished = false
      this.calcRemaining()
      this.start()
    },
    pad(n) { return String(n).padStart(2, '0') }
  },
  emits: ['finish']
}
</script>

<style scoped>
.time-display { display: inline-flex; gap: 4px; }
.time-unit {
  background: #333; color: white; padding: 4px 8px;
  border-radius: 4px; font-family: monospace; font-size: 20px;
  line-height: 1;
}
.time-unit small {
  display: block; font-size: 10px; color: #aaa; margin-top: 2px;
}
.finished-text { color: #f56c6c; font-weight: bold; font-size: 16px; }
</style>
```

**使用：**
```vue
<!-- 倒计时到某个时刻 -->
<Countdown :time="Date.now() + 3600000" />

<!-- 剩余多少秒 -->
<Countdown :time="7200" :is-timestamp="false" />

<!-- 自定义插槽内容 -->
<Countdown :time="deadline" @finish="onTimeout">
  <template #default="{ hours, minutes, seconds, finished }">
    <div v-if="!finished" class="my-style">
      {{ hours }}:{{ minutes }}:{{ seconds }}
    </div>
  </template>
  <template #finished><span style="color:red">拍卖结束!</span></template>
</Countdown>
```

---

### 📋 案例 9：表单验证组件（Form + FormItem）

```vue
<!-- MyForm.vue - 表单容器 -->
<template>
  <form class="my-form" novalidate @submit.prevent="handleSubmit">
    <slot></slot>
  </form>
</template>

<script>
export default {
  name: 'MyForm',
  provide() {
    return {
      form: this
    }
  },
  data() {
    return {
      fields: [],       // 注册的 FormItem 实例
      rules: {} as Record<string, any[]>,
      model: {} as Record<string, any>
    }
  },
  methods: {
    // 注册字段（FormItem 调用）
    registerField(field) {
      this.fields.push(field)
    },
    unregisterField(field) {
      const idx = this.fields.indexOf(field)
      if (idx > -1) this.fields.splice(idx, 1)
    },
    // 校验全部字段
    async validate() {
      const results = await Promise.all(
        this.fields.map(f => f.validate())
      )
      return results.every(r => r)
    },
    // 重置所有字段
    resetFields() {
      this.fields.forEach(f => f.resetField())
    },
    // 清除校验状态
    clearValidation() {
      this.fields.forEach(f => f.clearValidate())
    },
    handleSubmit() {
      this.validate().then(valid => {
        if (valid) {
          this.$emit('submit', this.model)
        } else {
          this.$emit('validate-fail')
        }
      })
    }
  },
  emits: ['submit', 'validate-fail']
}
</script>


<!-- MyFormItem.vue - 表单项 -->
<template>
  <div class="form-item" :class="{ 'has-error': errorMsg }">
    <label v-if="label" class="form-label">
      {{ label }}
      <span v-if="required" class="required-mark">*</span>
    </label>
    <div class="form-content">
      <slot :model="model" :fieldValue="model[prop]"></slot>
    </div>
    <transition name="fade">
      <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'MyFormItem',
  inject: ['form'],
  props: {
    prop: { type: String, required: true },
    label: { type: String, default: '' },
    rules: { type: Array, default: () => [] },
    required: { type: Boolean, default: false }
  },
  data() {
    return {
      errorMsg: ''
    }
  },
  computed: {
    model() {
      return this.form.model
    }
  },
  mounted() {
    this.form.registerField(this)
  },
  beforeUnmount() {
    this.form.unregisterField(this)
  },
  methods: {
    validate() {
      this.errorMsg = ''
      const value = this.model[this.prop]
      
      // 合并表单级别规则和字段级规则
      const allRules = [
        ...(this.form.rules[this.prop] || []),
        ...this.rules
      ]
      
      for (const rule of allRules) {
        const error = this.checkRule(rule, value)
        if (error) {
          this.errorMsg = error
          return false
        }
      }
      return true
    },
    checkRule(rule, value) {
      // required
      if (rule.required && (value === '' || value == null)) {
        return rule.message || `${this.label || this.prop}不能为空`
      }
      // pattern
      if (rule.pattern && !rule.pattern.test(String(value))) {
        return rule.message || `${this.label || this.prop}格式不正确`
      }
      // min/max
      if (rule.min !== undefined && String(value).length < rule.min) {
        return rule.message || `最少 ${rule.min} 个字符`
      }
      // custom validator
      if (typeof rule.validator === 'function') {
        return rule.validator(rule, value, (err) => err)
      }
      return ''
    },
    resetField() {
      this.model[this.prop] = ''
      this.errorMsg = ''
    },
    clearValidate() {
      this.errorMsg = ''
    }
  }
}
</script>

<style scoped>
.form-item { margin-bottom: 18px; }
.form-label {
  display: block; margin-bottom: 6px; font-size: 14px;
  color: #606266; font-weight: 500;
}
.required-mark { color: #f56c6c; margin-left: 2px; }
.form-content {}
.has-error .form-content input,
.has-error .form-content textarea {
  border-color: #f56c6c !important;
}
.error-msg {
  color: #f56c6c; font-size: 12px; margin-top: 4px; line-height: 1.4;
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
```

**使用方式：**

```vue
<MyForm ref="loginForm" :model="formData" :rules="formRules" @submit="onLogin">
  <MyFormItem prop="username" label="用户名" :required="true">
    <template #default="{ model }">
      <input v-model="model.username" placeholder="请输入用户名" />
    </template>
  </MyFormItem>
  
  <MyFormItem prop="password" label="密码" :rules="[
    { required: true, message: '请输入密码' },
    { min: 6, message: '密码至少6位' }
  ]">
    <template #default="{ model }">
      <input v-model="model.password" type="password" placeholder="请输入密码" />
    </template>
  </MyFormItem>
  
  <button type="submit">登录</button>
</MyForm>
```

---

### 📋 案例 10：确认对话框（函数式调用风格）

```vue
<template>
  <Teleport to="body">
    <Transition name="confirm">
      <div v-if="visible" class="confirm-overlay" @click="onCancel">
        <div class="confirm-dialog" @click.stop>
          <div class="confirm-icon" :class="type">
            {{ iconMap[type] }}
          </div>
          <h3 class="confirm-title">{{ title }}</h3>
          <p class="confirm-message">{{ message }}</p>
          <div class="confirm-actions">
            <button class="btn btn-cancel" @click="onCancel">{{ cancelText }}</button>
            <button class="btn btn-confirm" :class="`btn-${type}`" @click="onConfirm">
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
export default {
  name: 'ConfirmBox',
  data() {
    return {
      visible: false,
      title: '提示',
      message: '',
      type: 'info' as 'info' | 'warning' | 'success' | 'danger',
      confirmText: '确定',
      cancelText: '取消',
      resolveCallback: null as ((result: boolean) => void) | null
    }
  },
  computed: {
    iconMap() {
      return {
        info: 'ℹ️',
        warning: '⚠️',
        success: '✅',
        danger: '🔴'
      }
    }
  },
  methods: {
    /**
     * 打开确认框
     * @param {Object} options
     * @returns {Promise<boolean>} 用户点击确定返回 true，取消返回 false
     */
    confirm(options = {}) {
      this.title = options.title || '提示'
      this.message = options.message || ''
      this.type = options.type || 'info'
      this.confirmText = options.confirmText || '确定'
      this.cancelText = options.cancelText || '取消'
      this.visible = true
      
      return new Promise<boolean>((resolve) => {
        this.resolveCallback = resolve
      })
    },
    onConfirm() {
      this.visible = false
      this.resolveCallback?.(true)
    },
    onCancel() {
      this.visible = false
      this.resolveCallback?.(false)
    }
  }
}
</script>

<style scoped>
.confirm-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5); z-index: 2000;
  display: flex; align-items: center; justify-content: center;
}
.confirm-dialog {
  background: white; border-radius: 12px;
  padding: 32px 28px 24px; text-align: center;
  max-width: 380px; width: 90%;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}
.confirm-icon { font-size: 48px; margin-bottom: 12px; }
.confirm-title { font-size: 18px; font-weight: 600; margin: 0 0 8px; color: #303133; }
.confirm-message { color: #909399; font-size: 14px; line-height: 1.6; margin: 0 0 24px; }
.confirm-actions { display: flex; justify-content: center; gap: 12px; }
.btn {
  padding: 9px 22px; border-radius: 6px; font-size: 14px;
  cursor: pointer; border: 1px solid #dcdfe6; transition: all 0.2s;
}
.btn-cancel { background: white; color: #606266; }
.btn-confirm { background: #409eff; color: white; border-color: #409eff; }
.btn-confirm.btn-warning { background: #e6a23c; border-color: #e6a23c; }
.btn-confirm.btn-danger { background: #f56c6c; border-color: #f56c6c; }
.btn-confirm.btn-success { background: #67c23a; border-color: #67c23a; }

/* 动画 */
.confirm-enter-active, .confirm-leave-active { transition: all 0.25s; }
.confirm-enter-from, .confirm-leave-to { opacity: 0; }
.confirm-enter-from .confirm-dialog,
.confirm-leave-to .confirm-dialog { transform: scale(0.9); }
</style>
```

**使用（函数式调用）：**

```vue
<template>
  <ConfirmBox ref="confirmRef" />
  <button @click="deletePost">删除文章</button>
  <button @click="exitPage">退出编辑</button>
</template>

<script>
export default {
  methods: {
    async deletePost() {
      const confirmed = await this.$refs.confirm.confirm({
        title: '删除确认',
        message: '删除后将无法恢复，确定要删除这篇文章吗？',
        type: 'danger',
        confirmText: '确认删除'
      })
      
      if (confirmed) {
        await api.deletePost(this.postId)
        alert('删除成功')
      }
    },
    
    async exitPage() {
      const confirmed = await this.$refs.confirm.confirm({
        title: '离开确认',
        message: '当前内容尚未保存，确定要离开吗？',
        type: 'warning'
      })
      
      if (confirmed) {
        this.$router.back()
      }
    }
  },
  components: { ConfirmBox: './ConfirmBox.vue' }
}
</script>
```

---

## 总结：Options API 快速参考卡

```
┌─────────────────────────────────────────────────┐
│           Vue 3 Options API 速查表               │
├─────────────────────────────────────────────────┤
│                                                  │
│  data()      → 响应式数据                        │
│  methods     → 方法定义                          │
│  computed    → 缓存的派生值                       │
│  watch       → 数据变化回调                      │
│  props       → 父组件传入                         │
│  emits       → 向父组件发送事件                   │
│  created()   → 数据就绪，发起请求                 │
│  mounted()   → DOM 就绪，操作 DOM/初始化库         │
│  unmounted() → 清理资源（定时器/监听/DOM）         │
│                                                  │
│  this.xxx    → 访问 data/methods/computed/props  │
│  this.$refs  → 访问模板引用                       │
│  this.$emit() → 触发自定义事件                    │
│  this.$nextTick() → 下次 DOM 更新后执行           │
│  this.$watch() → 动态创建侦听器                   │
│                                                  │
└─────────────────────────────────────────────────┘
```

**下一步学习路径：**

1. 本篇（Options API）+ 📖 **[82-Vue3 基础组件开发](./82-Vue3基础组件开发.md)** — 用组合式 API 写组件
2. 本篇 → 📖 **[78-Vue 通用业务组件开发](./78-Vue通用业务组件开发.md)** — 进阶业务组件封装
3. 本篇 → 📖 **[06-Vue 组件库开发](./06-Vue组件库开发.md)** — 从组件到完整的组件库工程

> 💡 **学习建议：** 先把 Options API 的 10 个案例逐个手敲一遍，理解 `this` 的指向和各个选项之间的协作关系。之后转到 Composition API 时会发现很多概念是一脉相承的，只是组织代码的方式不同。
