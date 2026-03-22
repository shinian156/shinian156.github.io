# Lodash & Underscore 完整指南

> 最实用的 JavaScript 工具函数库，日常开发必备

## 目录

1. [简介与选择](#一简介与选择)
2. [数组操作](#二数组操作)
3. [对象操作](#三对象操作)
4. [函数操作](#四函数操作)
5. [字符串操作](#五字符串操作)
6. [集合操作](#六集合操作)
7. [常用工具函数](#七常用工具函数)
8. [性能与替代方案](#八性能与替代方案)
9. [常见问题](#九常见问题)

---

## 一、简介与选择

**Lodash** 是 Underscore.js 的超集，性能更好、API 更丰富，目前是最流行的 JS 工具库。现代项目推荐使用 Lodash，Underscore 已逐渐退出主流。

```bash
npm install lodash
npm install @types/lodash  # TypeScript 类型支持
```

**按需引入（推荐，减少打包体积）：**

```js
// ❌ 全量引入（约 70kb）
import _ from 'lodash'

// ✅ 按需引入（只打包用到的函数）
import debounce from 'lodash/debounce'
import throttle from 'lodash/throttle'
import cloneDeep from 'lodash/cloneDeep'
```

---

## 二、数组操作

### chunk —— 数组分块

```js
import chunk from 'lodash/chunk'

chunk([1, 2, 3, 4, 5], 2)
// => [[1, 2], [3, 4], [5]]

// 实用场景：分页展示
const pageSize = 10
const pagedData = chunk(allData, pageSize)
const currentPage = pagedData[0]  // 第一页
```

### flatten —— 数组扁平化

```js
import { flatten, flattenDeep } from 'lodash'

flatten([1, [2, [3, [4]]]])
// => [1, 2, [3, [4]]]  (只展开一层)

flattenDeep([1, [2, [3, [4]]]])
// => [1, 2, 3, 4]  (完全展开)
```

### uniq / uniqBy —— 数组去重

```js
import { uniq, uniqBy } from 'lodash'

uniq([1, 2, 1, 3, 2])
// => [1, 2, 3]

// 按属性去重
const users = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 1, name: '张三（重复）' }
]
uniqBy(users, 'id')
// => [{ id: 1, name: '张三' }, { id: 2, name: '李四' }]
```

### groupBy —— 分组

```js
import groupBy from 'lodash/groupBy'

const orders = [
  { status: 'pending', id: 1 },
  { status: 'done', id: 2 },
  { status: 'pending', id: 3 }
]
groupBy(orders, 'status')
// => { pending: [{...}, {...}], done: [{...}] }

// 按数值范围分组
groupBy([1.1, 2.3, 3.7, 4.2], Math.floor)
// => { 1: [1.1], 2: [2.3], 3: [3.7], 4: [4.2] }
```

### orderBy —— 多字段排序

```js
import orderBy from 'lodash/orderBy'

const users = [
  { name: '张三', age: 30, score: 85 },
  { name: '李四', age: 25, score: 92 },
  { name: '王五', age: 30, score: 78 }
]

// 先按 age 降序，再按 score 降序
orderBy(users, ['age', 'score'], ['desc', 'desc'])
```

### difference / intersection / union —— 集合运算

```js
import { difference, intersection, union } from 'lodash'

difference([1, 2, 3, 4], [2, 4])   // => [1, 3]  （差集）
intersection([1, 2, 3], [2, 3, 4]) // => [2, 3]  （交集）
union([1, 2], [2, 3])              // => [1, 2, 3]（并集去重）
```

---

## 三、对象操作

### cloneDeep —— 深克隆

```js
import cloneDeep from 'lodash/cloneDeep'

const original = { a: { b: { c: 42 } }, arr: [1, 2, 3] }
const copy = cloneDeep(original)

copy.a.b.c = 999
console.log(original.a.b.c)  // 42（原对象不受影响）
```

### merge / assign —— 对象合并

```js
import { merge, assign } from 'lodash'

// merge 深合并（递归合并嵌套对象）
const defaults = { server: { host: 'localhost', port: 3000 }, debug: false }
const config = { server: { port: 8080 }, debug: true }
merge({}, defaults, config)
// => { server: { host: 'localhost', port: 8080 }, debug: true }

// assign 浅合并（相当于 Object.assign）
assign({}, { a: 1 }, { b: 2 })
// => { a: 1, b: 2 }
```

### pick / omit —— 选取/排除属性

```js
import { pick, omit } from 'lodash'

const user = { id: 1, name: '张三', password: 'secret', email: 'test@test.com' }

// 只选取指定字段（适合 API 返回数据过滤）
pick(user, ['id', 'name', 'email'])
// => { id: 1, name: '张三', email: 'test@test.com' }

// 排除指定字段（适合去掉敏感字段）
omit(user, ['password'])
// => { id: 1, name: '张三', email: 'test@test.com' }
```

### get / set —— 安全访问深层属性

```js
import { get, set } from 'lodash'

const data = { user: { profile: { avatar: 'xxx.jpg' } } }

// 安全访问，避免 TypeError
get(data, 'user.profile.avatar')          // => 'xxx.jpg'
get(data, 'user.settings.theme', 'light') // => 'light'（默认值）

// 等价于可选链，但更老的项目中很实用
data?.user?.settings?.theme ?? 'light'

// 设置深层值
set(data, 'user.settings.theme', 'dark')
```

---

## 四、函数工具

### debounce —— 防抖

```js
import debounce from 'lodash/debounce'

// 搜索框防抖：停止输入 500ms 后才触发请求
const handleSearch = debounce((query: string) => {
  fetchSearchResults(query)
}, 500)

// Vue 中使用
const searchInput = ref('')
watch(searchInput, debounce((val) => {
  console.log('搜索：', val)
}, 500))
```

### throttle —— 节流

```js
import throttle from 'lodash/throttle'

// 滚动事件节流：每 200ms 最多执行一次
const handleScroll = throttle(() => {
  const scrollTop = window.scrollY
  updateScrollIndicator(scrollTop)
}, 200)

window.addEventListener('scroll', handleScroll)
```

### memoize —— 缓存计算结果

```js
import memoize from 'lodash/memoize'

// 昂贵的计算函数，相同参数直接返回缓存结果
const expensiveCalculate = memoize((n: number) => {
  console.log(`计算 ${n}`)
  return n * n * Math.sqrt(n)
})

expensiveCalculate(100)  // 计算 100，返回结果
expensiveCalculate(100)  // 直接返回缓存，不重新计算
```

### once —— 只执行一次

```js
import once from 'lodash/once'

// 初始化函数只执行一次
const initialize = once(() => {
  console.log('初始化完成')
  connectDatabase()
})

initialize()  // 执行
initialize()  // 不再执行
```

---

## 五、字符串工具

```js
import { camelCase, kebabCase, snakeCase, capitalize, startCase, truncate, escape } from 'lodash'

camelCase('foo bar')       // => 'fooBar'
camelCase('--foo-bar--')   // => 'fooBar'
kebabCase('Foo Bar')       // => 'foo-bar'
snakeCase('Foo Bar')       // => 'foo_bar'
capitalize('hello world')  // => 'Hello world'
startCase('--foo-bar--')   // => 'Foo Bar'

// 截断文本
truncate('这是一段很长很长的文字内容', { length: 10, omission: '...' })
// => '这是一段很长很...'

// HTML 转义（防 XSS）
escape('<script>alert("xss")</script>')
// => '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
```

---

## 六、实用工具

```js
import { isEmpty, isNil, isEqual, random, range, times } from 'lodash'

// 判空
isEmpty([])          // => true
isEmpty({})          // => true
isEmpty('')          // => true
isEmpty(null)        // => true
isNil(null)          // => true
isNil(undefined)     // => true

// 深比较
isEqual({ a: [1, 2] }, { a: [1, 2] })  // => true（引用不同但值相等）

// 生成随机数
random(1, 100)      // 1 到 100 的随机整数
random(1.5, 3.5)    // 浮点数

// 生成范围数组
range(5)            // => [0, 1, 2, 3, 4]
range(1, 6)         // => [1, 2, 3, 4, 5]
range(0, 10, 2)     // => [0, 2, 4, 6, 8]

// 执行 n 次
times(5, (i) => `item-${i}`)
// => ['item-0', 'item-1', 'item-2', 'item-3', 'item-4']
```

---

## 七、Lodash vs 原生 ES

随着 ES6+ 普及，许多 Lodash 功能已有原生替代，合理选择：

| Lodash | 原生替代 |
|--------|----------|
| `_.map` | `Array.map` |
| `_.filter` | `Array.filter` |
| `_.find` | `Array.find` |
| `_.flatten` | `Array.flat()` |
| `_.assign` | `Object.assign` / 展开运算符 |
| `_.keys` | `Object.keys` |
| **`_.cloneDeep`** | ❌ 无原生替代（用 structuredClone） |
| **`_.debounce`** | ❌ 无原生替代 |
| **`_.groupBy`** | ❌ 无原生替代 |
| **`_.orderBy`** | ❌ 无原生替代（多字段排序复杂） |
