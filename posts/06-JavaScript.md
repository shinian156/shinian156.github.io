# JavaScript 核心知识

> 本文系统梳理 JavaScript 面试和日常开发中最核心的知识点，涵盖数据类型、闭包、原型链、事件循环、异步编程等十大模块。每个概念不仅给出代码示例，更注重**讲清楚「是什么、为什么、怎么用」**。

## 目录
- [一、数据类型](#一数据类型)
- [二、深拷贝与浅拷贝](#二深拷贝与浅拷贝)
- [三、闭包（Closure）](#三闭包closure)
- [四、原型与原型链](#四原型与原型链)
- [五、this 指向](#五this-指向)
- [六、事件循环（Event Loop）](#六事件循环event-loop)
- [七、Promise 与 Async/Await](#七promise-与-asyncawait)
- [八、ES6+ 新特性](#八es6-新特性)
- [九、数组常用方法](#九数组常用方法)
- [十、常见知识点](#十常见知识点)

---

## 一、数据类型

### 为什么首先要搞懂数据类型？

JavaScript 是**动态类型语言**，变量没有类型约束，值才有类型。这带来了灵活性的同时也埋下了很多隐患。比如 `1 + '1'` 结果是 `'11'` 而不是 `2`，这种隐式类型转换是 JS bug 的重要来源。理解数据类型是写出可靠 JS 代码的第一步。

### 1. 基本数据类型（7 种）

基本类型也叫**原始类型（Primitive）**，它们的值是不可变的，按值传递。

```javascript
// 原始类型
const num = 1        // Number - 整数和浮点数都是这个类型
const str = 'hello'  // String - 文本，单引号双引号反引号都可以
const bool = true    // Boolean - 只有 true 和 false 两个值
const undef = undefined  // undefined - 变量声明了但未赋值时的默认值
const nul = null    // null - 表示"空"，需要手动赋值
const sym = Symbol('id')  // Symbol - ES6 新增，创建唯一的标识符
const big = 9007199254740991n  // BigInt - ES2020 新增，表示超大整数
```

**各类型的实际用途**：

| 类型 | 使用场景 |
|------|----------|
| **Number** | 数学运算、计数器、索引、配置项数值等。注意 JS 的 number 是 64 位浮点数，`0.1 + 0.2 !== 0.3`，精度敏感的场景要用特殊处理 |
| **String** | 用户输入展示、API 接口参数、DOM 操作、模板渲染等。JS 中字符串不可变，所有操作都返回新字符串 |
| **Boolean** | 条件判断、开关状态、表单验证结果。`if` 语句会自动做布尔转换 |
| **undefined** | 表示"缺失"。函数没写 return 时默认返回 undefined；访问对象不存在的属性也是 undefined |
| **null** | 表示"有意置空"。和 undefined 的区别：null 是开发者主动赋值的，表示"这里没有值" |
| **Symbol** | 主要用于对象属性的唯一键，防止属性名冲突。Vue 3 的响应式系统内部就大量使用了 Symbol |
| **BigInt** | 处理超过 `Number.MAX_SAFE_INTEGER`（2^53 - 1）的大数，如数据库唯一 ID、高精度计算、时间戳运算 |

### 2. 引用数据类型

引用类型存储的是**内存地址**，按引用传递。这意味着把一个对象赋值给另一个变量时，它们指向同一个内存地址。

```javascript
const obj = { name: 'John' }   // Object - 万物皆对象的基石
const arr = [1, 2, 3]          // Array - 有序集合，JS 最常用的数据结构
const fn = () => {}            // Function - 一等公民，可以赋值、传参、返回
const date = new Date()        // Date - 时间日期处理
const reg = /test/             // RegExp - 文本匹配、表单验证、字符串替换
const map = new Map()          // Map - 键值对集合，键可以是任意类型
const set = new Set()          // Set - 无序唯一值集合，常用于去重
```

### 3. 类型判断的方法

实际开发中经常需要判断变量的类型，这里有三种常用方式：

```javascript
// typeof - 运算符，返回类型字符串（适合判断基本类型）
typeof 1              // 'number'
typeof 'hello'        // 'string'
typeof true           // 'boolean'
typeof undefined      // 'undefined'
typeof null           // 'object' ❌（这是 JS 历史遗留的著名 bug）
typeof []             // 'object'（无法区分数组和普通对象）
typeof function(){}   // 'function'

// instanceof - 检查原型链，适合判断引用类型
[] instanceof Array      // true
[] instanceof Object     // true（数组也是对象）

// Object.prototype.toString - 最准确的通用方法
Object.prototype.toString.call([])      // '[object Array]'
Object.prototype.toString.call(null)    // '[object Null]'
Object.prototype.toString.call({})      // '[object Object]'

// 实际开发中的推荐做法：
function getType(val) {
  return Object.prototype.toString.call(val).slice(8, -1) // 返回 'Array', 'Null' 等
}
```

**选用建议**：
- 判断基本类型 → 用 `typeof`
- 判断具体引用类型（Array / Date 等）→ 用 `Object.prototype.toString`
- `instanceof` 在跨 iframe 场景会出问题，不太推荐

---

## 二、深拷贝与浅拷贝

### 什么是浅拷贝？什么是深拷贝？

这是面试高频题，核心在于**引用类型的赋值是传址而非传值**。

```javascript
const original = { a: 1, b: { c: 2 } }

// 直接赋值 —— 不是拷贝！只是多了一个引用指向同一块内存
const ref = original
ref.a = 999
console.log(original.a)  // 999，原对象被修改了

// 浅拷贝 —— 只复制第一层，嵌套的对象仍然是共享引用
const shallow = { ...original }
shallow.a = 888          // ✅ 不影响原对象（第一层独立了）
shallow.b.c = 777        // ❌ 原对象也被改了（嵌套层还是同一个引用）

// 深拷贝 —— 所有层级完全独立，互不影响
const deep = JSON.parse(JSON.stringify(original))
deep.b.c = 555           // ✅ 原对象完全不受影响
```

### 浅拷贝的三种方式

```javascript
const obj = { a: 1, b: { c: 2 } }

// 方法 1：Object.assign —— ES5 的标准方案
const copy1 = Object.assign({}, obj)

// 方法 2：展开运算符 —— ES6 写法最简洁，推荐
const copy2 = { ...obj }

// 方法 3：Array.from（专门针对数组）
const arr = [1, 2, { a: 3 }]
const copyArr = Array.from(arr)
```

**适用场景**：当你的对象只有一层结构（或者你只关心第一层的修改隔离）时，浅拷贝就够了。比如组件 props 的默认值合并、Redux reducer 的 state 更新。

### 深拷贝的四种方式

```javascript
const obj = { a: 1, b: { c: 2 }, d: [3, 4], e: () => 'hello', f: undefined, g: Symbol('key') }

// 方式 1：JSON.stringify —— 最简单但有严重缺陷
const deepCopy1 = JSON.parse(JSON.stringify(obj))
// ⚠️ 缺陷：函数丢失 → undefined、Symbol 丢失、Date 变成字符串、RegExp 变成空对象
// ✅ 优点：原生支持，无需依赖，纯数据对象足够用

// 方式 2：structuredClone —— 现代浏览器原生 API（推荐用于简单场景）
const deepCopy2 = structuredClone(obj)
// ✅ 支持 Date、RegExp、Map、Set、ArrayBuffer
// ❌ 不支持函数、DOM 节点、对象属性中的 getter/setter

// 方式 3：手动递归实现 —— 面试常考，能处理各种边界情况
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj
  
  // 处理循环引用（A 引用 B，B 又引用 A）
  if (hash.has(obj)) return hash.get(obj)

  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)

  const clone = Array.isArray(obj) ? [] : {}
  hash.set(obj, clone)  // 记录已克隆的对象

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key], hash)
    }
  }
  return clone
}

// 方式 4：lodash —— 生产环境最靠谱
import _ from 'lodash'
const deepCopy3 = _.cloneDeep(obj)
// ✅ 功能完备，处理了几乎所有边界情况和循环引用
```

**生产环境推荐**：项目已经用了 lodash 就直接用 `_.cloneDeep()`；没用 lodash 且数据简单就用 `structuredClone()`；面试就准备手写递归版本。

---

## 三、闭包（Closure）

### 什么是闭包？为什么它这么重要？

**闭包** = 函数 + 函数能够访问的词法环境（外部变量）。简单说就是：**内部函数记住了它诞生时所处的作用域**。

闭包不是你主动"创建"的——只要你在函数内部定义了另一个函数，闭包就自然形成了。它是 JavaScript 最强大的特性之一。

```javascript
function createCounter() {
  let count = 0  // 这个变量在 createCounter 执行完后应该销毁
                  // 但因为内部的函数引用了它，所以它被"保存"了下来

  return {
    increment() { count++ },     // 这三个函数都形成了闭包
    decrement() { count-- },
    getCount() { return count }  // 它们共享同一个 count 变量
  }
}

const counter = createCounter()
counter.increment()
counter.increment()
console.log(counter.getCount())  // 2

// 关键点：count 不是全局变量，外部无法直接修改
// 只能通过暴露出来的方法来操作 → 这就是「数据私有化」
```

### 闭包的核心应用场景

#### 场景 1：数据私有化（模块模式）

```javascript
// 模拟"私有变量"——JS 没有 Java/C++ 的 private 关键字，但闭包可以实现同样效果
function privateData() {
  let data = 'secret'  // 外部永远无法直接访问 data
  return { getData: () => data }
}

const store = privateData()
store.getData()   // 'secret'
store.data        // undefined，拿不到
```

这在状态管理库（如 Redux/Vuex/Pinia）中大量使用——store 内部的 state 就是闭包保护的私有数据。

#### 场景 2：函数柯里化（Currying）

柯里化是把一个多参数函数拆成一系列单参数函数的技术。好处是可以**部分配置（partial application）**，复用性极强。

```javascript
// 普通函数
const add = (a, b, c) => a + b + c

// 柯里化后
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      // 参数够了，执行原函数
      return fn.apply(this, args)
    } else {
      // 参数不够，返回一个新函数继续收集参数
      return (...nextArgs) => curried.apply(this, args.concat(nextArgs))
    }
  }
}

const curriedAdd = curry(add)

// 可以一次传完
curriedAdd(1, 2, 3)  // 6

// 也可以分步传（这就是柯里化的威力）
const add10 = curriedAdd(10)       // 先固定第一个参数
add10(20, 30)                      // 60
const add15 = add10(5)            // 再固定第二个参数
add15(50)                          // 65
```

**实际应用**：React-Redux 的 `connect` 函数、Lodash 的 `_.curry`、事件绑定的工厂函数等。

#### 场景 3：防抖和节流

前端性能优化必备的两个工具，底层都是闭包在维护定时器和时间戳状态。

```javascript
// 防抖（Debounce）：触发后等待一段时间才执行，期间再触发就重新计时
// 典型用途：搜索框输入（用户停止打字后才发请求）、窗口 resize
function debounce(fn, delay) {
  let timer = null  // ← 闭包保存定时器 ID
  return function(...args) {
    clearTimeout(timer)  // 每次触发清除上一次的定时器
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}

// 使用示例：搜索防抖
const searchInput = document.getElementById('search')
searchInput.addEventListener('input', debounce((e) => {
  console.log('发送搜索请求:', e.target.value)
}, 300))  // 用户停顿 300ms 后才真正请求

// 节流（Throttle）：规定时间内只执行一次，不管触发了多少次
// 典型用途：滚动加载更多、按钮重复点击防护
function throttle(fn, interval) {
  let lastTime = 0  // ← 闭包保存上次执行时间
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= interval) {
      lastTime = now
      fn.apply(this, args)
    }
  }
}
```

### 闭包的内存泄漏风险

闭包会让外部变量一直存在于内存中，如果不当使用会导致内存泄漏：

```javascript
// ⚠️ 问题场景：闭包引用了大量数据但不释放
function createLeak() {
  const largeData = new Array(1000000).fill(1)  // 占用大量内存
  return () => {
    console.log('Leak!')  // 这个函数虽然没用到 largeData，
                          // 但 largeData 仍然被闭包持有
  }
}

const leak = createLeak()
// largeData 会一直在内存中，直到 leak 本身被回收

// ✅ 解决：不再使用时手动解除引用
leak = null  // 现在 largeData 就可以被垃圾回收了
```

**总结**：闭包本身不是问题，问题是不再需要的闭包没有及时清理。在 Vue/React 组件中，组件卸载时要记得清除定时器、取消订阅，本质上就是在释放闭包。

---

## 四、原型与原型链

### 为什么要理解原型？

JavaScript 的继承体系是基于**原型（Prototype）**的，而不是像 Java 那样基于 class（ES6 的 class 其实是语法糖，底层还是原型）。理解原型链才能搞清楚：为什么数组有 `map`/`filter` 方法？为什么自定义的类可以 `extends` 另一个类？`instanceof` 到底是怎么判断的？

### 1. 原型对象

每个函数都有一个 `prototype` 属性，每个对象都有一个 `__proto__` 属性（或用 `Object.getPrototypeOf()` 获取）。

```javascript
function Person(name) {
  this.name = name
}

// 在 Person.prototype 上添加方法 → 所有实例共享这一个方法
Person.prototype.sayHello = function() {
  console.log('Hello, ' + this.name)
}

const person = new Person('John')
person.sayHello()  // 'Hello, John'

// person 本身并没有 sayHello 方法
// 但 JS 引擎沿着 __proto__ 找到了 Person.prototype.sayHello
```

**为什么要挂载到 prototype 上而不是构造函数内部？**

```javascript
// ❌ 低效写法：每次 new 都创建一个新的函数实例
function BadPerson(name) {
  this.name = name
  this.sayHello = function() {  // 每个 instance 都有一份独立的 sayHello
    console.log('Hello, ' + this.name)
  }
}
const p1 = new BadPerson('A')
const p2 = new BadPerson('B')
p1.sayHello === p2.sayHello  // false，两个不同的函数！

// ✅ 正确写法：所有实例共享 prototype 上的同一个方法
function GoodPerson(name) {
  this.name = name
}
GoodPerson.prototype.sayHello = function() {
  console.log('Hello, ' + this.name)
}
const g1 = new GoodPerson('A')
const g2 = new GoodPerson('B')
g1.sayHello === g2.sayHello  // true，共享同一个函数
```

### 2. 原型链

当访问一个对象的属性时，JS 引擎会沿着一层层链条向上查找，这就是**原型链**。

```javascript
// 原型链的结构
person.__proto__ === Person.prototype              // true — 实例的原型是其构造函数的 prototype
Person.prototype.__proto__ === Object.prototype     // true — Person.prototype 也是一个对象
Object.prototype.__proto__ === null                 // true — 到头了，null 是终点

// 实际查找过程：
// person.toString()
// ① person 自身有没有 toString？没有
// ② Person.prototype 上有没有？没有
// ③ Object.prototype 上有没有？有！调用它
```

**查找顺序**：实例自身 → 构造函数的 prototype → prototype 的 prototype → ... → Object.prototype → null

这就是为什么普通的空对象也能调用 `toString()`、`hasOwnProperty()` 这些方法——它们都在 Object.prototype 上。

### 3. 继承的实现

#### ES5 方式（组合继承）

```javascript
// 父类
function Animal(name) {
  this.name = name
}
Animal.prototype.eat = function() {
  console.log(this.name + ' is eating')
}

// 子类
function Dog(name, breed) {
  Animal.call(this, name)  // ① 继承属性（借用父类构造函数）
  this.breed = breed
}

Dog.prototype = Object.create(Animal.prototype)  // ② 继承方法（原型链连接）
Dog.prototype.constructor = Dog                   // ③ 修复 constructor 指向

Dog.prototype.bark = function() {                // ④ 添加子类自有方法
  console.log('Woof!')
}

const dog = new Dog('旺财', '柴犬')
dog.eat()   // '旺财 is eating'（继承来的）
dog.bark()  // 'Woof!'（自己的）
```

#### ES6 class 方式（推荐）

```javascript
class Animal {
  constructor(name) {
    this.name = name
  }

  eat() {
    console.log(this.name + ' is eating')
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name)  // 必须先调用 super，否则报错
    this.breed = breed
  }

  bark() {
    console.log('Woof!')
  }
}

const dog = new Dog('旺财', '柴犬')
```

**class 只是语法糖**，底层仍然是原型链。但可读性好得多，推荐在实际开发中使用 class。

---

## 五、this 指向

### 为什么 this 让人头疼？

JavaScript 的 `this` 和其他面向对象语言的 `this` 不太一样——它的值**取决于函数是怎么被调用的**，而不是定义在哪里。这也是 JS 面试题的重灾区之一。

### this 的 4 种绑定规则（优先级从低到高）

```javascript
// ===== 规则 1：默认绑定 =====
// 独立函数调用，非严格模式下 this 指向 window（浏览器）/ global（Node）
// 严格模式下 this 是 undefined
function fn() {
  console.log(this)
}
fn()  // window（非严格模式） / undefined（严格模式 'use strict'）

// ===== 规则 2：隐式绑定 =====
// 对象调用方法，this 指向调用者（谁打点调用就指向谁）
const obj = {
  name: 'John',
  fn() {
    console.log(this.name)  // this → obj
  }
}
obj.fn()  // 'John'

// ⚠️ 隐式绑定丢失的陷阱
const myFn = obj.fn
myFn()  // undefined！因为现在 myFn 是独立调用的，this 不再指向 obj
// 常见场景：回调函数、解构赋值
setTimeout(obj.fn, 100)  // 同样丢失！

// ===== 规则 3：显式绑定 =====
// 用 call / apply / bind 强制指定 this
const fn2 = function() {
  console.log(this.name)
}
fn2.call({ name: 'John' })         // 'John' — call：参数逐个传递
fn2.apply({ name: 'John' })        // 'John' — apply：参数用数组传递
const boundFn = fn2.bind({ name: 'John' })  // bind：返回新函数，不立即执行
boundFn()                           // 'John'

// call vs apply 的区别只有参数形式不同
fn2.call(obj, 1, 2, 3)      // 参数逐个传
fn2.apply(obj, [1, 2, 3])   // 参数数组传

// ===== 规则 4：new 绑定（最高优先级）=====
// 用 new 调用构造函数，this 指向新创建的实例
function Person(name) {
  this.name = name  // this → 新创建的对象
}
const person = new Person('John')
console.log(person.name)  // 'John'
```

### 箭头函数的 this

箭头函数**没有自己的 this**，它会捕获外层作用域的 this。这正是它在 React 组件和回调中如此好用的原因。

```javascript
const obj = {
  name: 'John',
  fn() {
    const arrow = () => {
      console.log(this.name)  // this 来自外层 fn() 的上下文，即 obj
    }
    arrow()
  }
}
obj.fn()  // 'John'

// 实际应用：解决 React 类组件中 this 丢失的问题
class MyComponent extends React.Component {
  handleClick = () => {  // 箭头函数作为类属性
    console.log(this.state)  // this 正确指向组件实例
  }
  
  // 如果写成普通方法，就需要在 JSX 中 onClick={this.handleClick.bind(this)}
  // 或者 constructor 里 bind，很麻烦
}
```

**⚠️ 注意**：正因为箭头函数没有自己的 this，所以不能用 call/apply/bind 改变它的 this 指向。不要用箭头函数定义对象的方法，也不要把它用在 Vue 的 methods 或 computed 里（Vue 需要正确的 this 来做响应式追踪）。

---

## 六、事件循环（Event Loop）

### 为什么需要事件循环？

JavaScript 是**单线程**的——同一时间只能做一件事。但如果所有操作都是同步的，那发送一个网络请求时整个页面就会卡死。于是 JS 设计了一套**异步机制**来解决这个问题：

- 把耗时操作（网络请求、定时器、文件读写）交给浏览器的其他线程去处理
- 主线程继续执行后面的同步代码
- 异步操作完成后，通过**回调函数**通知主线程

这套协调同步代码和异步回调执行的机制，就叫**事件循环（Event Loop）**。

### 宏任务与微任务

异步任务分为两类，优先级不同：

| 分类 | 包含内容 | 优先级 |
|------|---------|--------|
| **微任务（Microtask）** | Promise.then/catch/finally、MutationObserver、queueMicrotask | 高 |
| **宏任务（Macrotask）** | setTimeout、setInterval、setImmediate、I/O、UI 渲染 | 低 |

```javascript
// 经典面试题：你能猜对输出顺序吗？
console.log('1')                    // ① 同步代码，立即执行

setTimeout(() => console.log('2'), 0)  // ③ 宏任务，最后执行

Promise.resolve().then(() => console.log('3'))  // ② 微任务，第二执行

console.log('4')                    // ① 同步代码，立即执行

// 输出顺序：1 → 4 → 3 → 2
```

### 完整执行流程图

```
┌──────────────────────────────────┐
│           执行栈（Call Stack）      │
│  （主线程，一行行执行同步代码）       │
└──────────────┬───────────────────┘
               │ 同步代码执行完
               ▼
┌──────────────────────────────────┐
│     微任务队列（Microtask Queue）  │
│  （一次性全部执行完，清空为止）      │
└──────────────┬───────────────────┘
               │ 微任务清空后
               ▼
┌──────────────────────────────────┐
│     宏任务队列（Macrotask Queue）  │
│  （取一个执行，执行完再看微任务）    │
└──────────────┬───────────────────┘
               ▼
            渲染页面（如有必要）
               ↓
         回到执行栈，循环往复
```

**核心原则**：每执行完一个宏任务，都会先把所有微任务清空，然后再取下一个宏任务。

### 进阶经典题（含 async/await）

```javascript
async function async1() {
  console.log('async1 start')     // ② 同步执行
  await async2()                  // await 后面的代码变成微任务
  console.log('async1 end')       // ⑥ 微任务
}

async function async2() {
  console.log('async2')           // ③ 同步执行
}

console.log('script start')       // ① 同步代码

setTimeout(() => {
  console.log('setTimeout')       // ⑦ 宏任务
}, 0)

async1()                          // 调用上面的 async1

new Promise((resolve) => {
  console.log('promise1')         // ④ Promise 构造函数内是同步的！
  resolve()
}).then(() => {
  console.log('promise2')         // ⑤ 微任务
})

console.log('script end')         // 同步代码结束

// 完整输出顺序：
// ① script start
// ② async1 start
// ③ async2
// ④ promise1
//   script end
// ⑤ promise2      ← 微任务队列依次执行
// ⑥ async1 end
// ⑦ setTimeout    ← 最后执行宏任务
```

**关键记忆点**：
1. `async` 函数体内的同步代码仍然立即执行
2. `await` 之后的代码会被放到微任务队列（相当于 `.then()`）
3. `new Promise(callback)` 的 callback 是**同步执行**的，`.then()` 才是微任务
4. 微任务永远比下一个宏任务先执行

---

## 七、Promise 与 Async/Await

### 从回调地狱到 Promise

在 Promise 出现之前，处理多个连续的异步操作只能靠嵌套回调，俗称**回调地狱（Callback Hell）**：

```javascript
// ❌ 回调地狱——难以阅读和维护
getData(function(a) {
  getMoreData(a, function(b) {
    getEvenMoreData(b, function(c) {
      console.log(c)  // 缩进越来越深...
    })
  })
})
```

Promise 把嵌套变成了**链式调用**：

```javascript
// ✅ Promise 链式调用——扁平清晰
getData()
  .then(a => getMoreData(a))
  .then(b => getEvenMoreData(b))
  .then(c => console.log(c))
  .catch(error => console.error(error))  // 统一错误处理
```

### Promise 基础用法

```javascript
// 创建 Promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    const success = true
    if (success) {
      resolve('Success!')  // 成功时调用 resolve
    } else {
      reject(new Error('Failed!'))  // 失败时调用 reject
    }
  }, 1000)
})

// 消费 Promise
promise
  .then(result => console.log(result))   // resolve 时进入这里
  .catch(error => console.error(error))  // reject 时进入这里
  .finally(() => console.log('Done'))    // 无论成功失败都会执行
```

### Promise 并发控制

```javascript
const p1 = Promise.resolve(1)  // 已成功的 Promise
const p2 = new Promise(r => setTimeout(() => r(2), 1000))
const p3 = Promise.resolve(3)

// Promise.all：全部成功才成功，有一个失败立刻 reject
// 适用场景：同时请求多个接口，都要拿到数据后才渲染页面
Promise.all([p1, p2, p3])
  .then(results => console.log(results))  // [1, 2, 3]
  .catch(err => console.error(err))

// Promise.race：哪个先完成用哪个（不管成功失败）
// 适用场景：请求超时控制（比赛请求和网络超时）
Promise.race([
  fetch('/api/data'),
  new Promise((_, reject) => setTimeout(() => reject(new Error('超时')), 5000))
])
.then(res => console.log('请求成功'))
.catch(err => console.error(err))

// 其他有用的静态方法：
Promise.allSettled([p1, p2])  // 等待全部完成，不管成功失败，返回状态数组
Promise.any([p1, p2])         // 第一个成功的就算成功（全部失败才 reject）
```

### Async/Await —— Promise 的语法糖

`async/await` 让异步代码看起来像同步代码，极大提升了可读性。

```javascript
// 基本用法
async function fetchData() {
  try {
    const res1 = await fetch('/api/data1')  // 等待请求完成
    const data1 = await res1.json()          // 等待解析完成

    const res2 = await fetch('/api/data2')
    const data2 = await res2.json()

    return { data1, data2 }  // 相当于 return Promise.resolve({ data1, data2 })
  } catch (error) {
    console.error(error)  // try/catch 替代了 .catch()
  }
}

// ⚠️ 注意：上面的写法是串行的（等待 data1 完成才开始请求 data2）
// 如果两个请求互相独立，应该并行执行 ↓

async function parallelFetch() {
  // 同时发起请求，不互相等待
  const [data1, data2] = await Promise.all([
    fetch('/api/data1').then(r => r.json()),
    fetch('/api/data2').then(r => r.json())
  ])
  return { data1, data2 }
}

// async/await 的错误处理最佳实践
async function safeFetch(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (error) {
    console.error(`请求 ${url} 失败:`, error.message)
    return null  // 返回兜底值，让调用方决定如何处理
  }
}
```

**使用建议**：能用 `async/await` 就尽量用它，比 `.then()` 链更容易调试（断点和错误堆栈更直观）。但在某些需要并行处理的场景下，配合 `Promise.all` 使用效果最佳。

---

## 八、ES6+ 新特性

ES6（ECMAScript 2015）是 JavaScript 史上最大的升级之一，之后每年都有新特性发布（ES2016、ES2017...）。这些现代特性大幅提升了开发效率。

### 1. let 和 const —— 取代 var

```javascript
// let：块级作用域，可重新赋值
let count = 1
count = 2  // ✅ 允许

// const：块级作用域，不可重新赋值（但对象内容可以改）
const PI = 3.14159
// PI = 3  // ❌ TypeError: Assignment to constant variable

const obj = { name: 'John' }
obj.name = 'Jane'  // ✅ 修改属性没问题
// obj = {}  // ❌ 不能改变引用

// 块级作用域的好处：避免变量污染
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100)  // 0, 1, 2（正确）
  // 如果用 var，输出会是 3, 3, 3（var 是函数作用域，i 共享）
}
```

**实际规范**：默认用 `const`，需要重新赋值时再用 `let`。**永远不要再使用 `var`**。

### 2. 解构赋值

从数组或对象中提取值的简洁语法，在日常开发中使用频率极高。

```javascript
// 数组解构 —— 按位置对应
const [a, b, c] = [1, 2, 3]
const [first, ...rest] = [1, 2, 3, 4, 5]  // first=1, rest=[2,3,4,5]
const [, second, , fourth] = ['a', 'b', 'c', 'd']  // 跳过不需要的元素

// 对象解构 —— 按属性名匹配
const { name, age } = { name: 'John', age: 30 }
const { name: userName, ...restProps } = { name: 'John', age: 30, city: 'NYC' }
// 重命名：name → userName
// 剩余运算符收集其余属性到 restProps

// 默认值
const { x = 0, y = 0 } = {}  // x=0, y=0

// 函数参数解构 —— 最常用的场景之一
function fn({ x, y }) {
  console.log(x, y)
}
fn({ x: 1, y: 2 })

// 嵌套解构
const { user: { name, address: { city } } } = {
  user: { name: 'John', address: { city: 'Beijing' } }
}
// name='John', city='Beijing'

// 实际应用：Vue 组合式函数、React Hooks 中随处可见
const [count, setCount] = useState(0)
const { data, loading, error } = useFetch('/api/users')
```

### 3. 模板字符串（Template Literal）

```javascript
const name = 'John'
const greeting = `Hello, ${name}!`  // 表达式插值
const result = `1 + 1 = ${1 + 1}`  // 支持任意表达式

// 多行文本 —— 不再用 \n 拼接
const html = `
  <div class="card">
    <h2>${name}</h2>
    <p>这是一段内容</p>
  </div>
`
```

### 4. 箭头函数

```javascript
const sum = (a, b) => a + b           // 简洁的单行写法
const double = x => x * 2             // 单参数可以省略括号
const log = () => console.log('hi')   // 无参数必须有空括号

// 多行函数体需要花括号和 return
const process = (data) => {
  const cleaned = data.trim()
  return cleaned.toUpperCase()
}

// ⚠️ 重要限制：箭头函数没有自己的 arguments 对象
const fn = () => {
  console.log(arguments)  // ReferenceError: arguments is not defined
  // 如果需要参数列表，用 rest 参数代替
}
const fn2 = (...args) => {
  console.log(args)  // 正确获取所有参数
}
```

### 5. 扩展运算符（Spread / Rest）

```javascript
// Spread 展开 —— 将数组/对象"展开"
const arr1 = [1, 2, 3]
const arr2 = [...arr1, 4, 5]  // [1,2,3,4,5]

const obj1 = { name: 'John' }
const obj2 = { ...obj1, age: 30 }  // { name: 'John', age: 30 }

// Rest 收集 —— 将剩余参数"收集"成数组
function sum(first, ...restArgs) {
  console.log(first)      // 第一个参数
  console.log(restArgs)   // 其余参数组成的数组
}
sum(1, 2, 3, 4, 5)  // first=1, restArgs=[2,3,4,5]

// 实际应用：数组浅拷贝、对象合并、函数不定参数
const defaults = { theme: 'dark', lang: 'zh' }
const userConfig = { lang: 'en' }
const merged = { ...defaults, ...userConfig }  // { theme: 'dark', lang: 'en' }
// 后面的覆盖前面的
```

### 6. 对象属性简写

```javascript
const name = 'John'
const age = 30

// 当属性名和变量名相同时可以简写
const obj = {
  name,        // 等同于 name: name
  age,         // 等同于 age: age
  sayHello() { // 方法简写（等同于 sayHello: function() {...}）
    console.log('Hello')
  }
}

// 计算属性名（动态 key）
const key = 'dynamicKey'
const obj2 = { [key]: 'value' }  // { dynamicKey: 'value' }
```

### 7. 类（Class）

虽然 JS 的本质是原型继承，但 class 语法让代码更易读，也更接近传统 OOP 语言的风格。

```javascript
class Person {
  // 构造函数，new 时自动调用
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  // 实例方法（挂载到 prototype 上）
  sayHello() {
    console.log(`Hello, I'm ${this.name}`)
  }

  // 静态方法（通过类名调用，不用 new）
  static getSpecies() {
    return 'Homo sapiens'
  }

  // getter / setter（属性的拦截器）
  get info() {
    return `${this.name}, ${this.age}岁`
  }
}

// 继承
class Student extends Person {
  constructor(name, age, grade) {
    super(name, age)  // 必须先调用父类构造器
    this.grade = grade
  }

  study() {
    console.log(`${this.name} is studying`)
  }

  // 方法覆写
  sayHello() {
    console.log(`Hi, I'm student ${this.name}`)
  }
}

const s = new Student('小明', 18, '高三')
s.study()      // '小明 is studying'
s.sayHello()   // 'Hi, I'm student 小明'
Student.getSpecies()  // 'Homo sapiens'（静态方法通过类调用）
```

---

## 九、数组常用方法

数组是 JavaScript 中最常用的数据结构之一，熟练掌握数组方法是前端基本功。

### 会改变原数组的方法（Mutating）

这些方法直接在原数组上操作，**慎用**——特别是在 React/Vue 中，直接修改 state 可能导致视图不更新或引发 bug。

```javascript
const arr = [1, 2, 3]

arr.push(4)        // 末尾添加元素 → 返回新长度 4
arr.pop()          // 删除并返回末尾元素 → 4，arr 变回 [1,2,3]
arr.unshift(0)     // 开头添加 → arr 变成 [0,1,2,3]
arr.shift()        // 删除并返回开头元素 → 0，arr 变回 [1,2,3]

arr.splice(1, 1)   // 从索引 1 开始，删除 1 个元素 → 返回 [2]，arr 变成 [1,3]
arr.splice(1, 0, 2)  // 从索引 1 开始，删除 0 个，插入 2 → arr 变成 [1,2,3]
// splice 也可以替换：splice(1, 1, 'a') 把索引1的元素换成 'a'

arr.reverse()      // 反转数组 → [3,2,1]
arr.sort((a, b) => a - b)  // 升序排序（数字比较要传比较函数！）

// ⚠️ sort 默认按字符串排序，数字排序一定要传比较函数
// 升序：(a, b) => a - b（a-b < 0 说明 a 应该排前面）
// 降序：(a, b) => b - a
```

### 不改变原数组的方法（Immutable）—— 推荐优先使用

这些方法返回新数组，原数组保持不变。在函数式编程和框架开发中非常安全好用。

```javascript
const arr = [1, 2, 3]

arr.map(x => x * 2)        // [2, 4, 6] —— 映射：对每个元素做变换
arr.filter(x => x > 1)     // [2, 3] —— 过滤：保留满足条件的
arr.reduce((acc, cur) => acc + cur, 0)  // 6 —— 归约：累加器，功能最强大
arr.find(x => x > 1)       // 2 —— 找第一个满足条件的元素
arr.findIndex(x => x > 1)  // 1 —— 找第一个满足条件的索引
arr.includes(2)            // true —— 是否包含某个值
arr.some(x => x > 1)       // true —— 是否至少有一个满足条件
arr.every(x => x > 0)      // true —— 是否全部满足条件
arr.slice(1, 3)            // [2, 3] —— 截取片段（不包含结束索引）
arr.concat([4, 5])         // [1,2,3,4,5] —— 合并数组
arr.join(',')              // '1,2,3' —— 转为字符串

// reduce 的高级用法示例
const users = [
  { name: 'Alice', score: 90 },
  { name: 'Bob', score: 80 },
  { name: 'Carol', score: 95 },
]

// 分组
users.reduce((acc, user) => {
  const level = user.score >= 90 ? '优秀' : '良好'
  ;(acc[level] ||= []).push(user.name)
  return acc
}, {})
// { 优秀: ['Alice', 'Carol'], 良好: ['Bob'] }
```

### 方法速查表

| 操作 | 方法 | 改变原数组? | 返回值 |
|------|------|:-----------:|--------|
| 添加末尾 | push | ✅ | 新长度 |
| 删除末尾 | pop | ✅ | 被删元素 |
| 添加开头 | unshift | ✅ | 新长度 |
| 删除开头 | shift | ✅ | 被删元素 |
| 增删替换 | splice | ✅ | 被删元素数组 |
| 反转 | reverse | ✅ | 反转后的数组 |
| 排序 | sort | ✅ | 排序后的数组 |
| 遍历变换 | map | ❌ | 新数组 |
| 过滤 | filter | ❌ | 新数组 |
| 归约 | reduce | ❌ | 累计结果 |
| 查找 | find/findIndex | ❌ | 元素/索引 |
| 截取 | slice | ❌ | 新数组 |
| 拼接 | concat | ❌ | 新数组 |
| 包含判断 | includes/some/every | ❌ | boolean |

---

## 十、常见知识点

### 1. == 和 === 的区别？

```javascript
0 == '0'    // true  == 会进行隐式类型转换
0 === '0'   // false === 严格比较，类型不同直接 false

null == undefined   // true  （特殊情况）
null === undefined  // false

[] == ![]   // true  （经典迷惑题：![] 是 false，[] == false → 0 == 0 → true）
```

**结论**：除了判 `null == undefined` 这种特殊情况外，**一律使用 `===`**，避免隐式转换带来的意外行为。

### 2. undefined 和 null 的区别？

| 特征 | undefined | null |
|------|-----------|------|
| 含义 | "未定义" | "空的 / 无值" |
| 出现场景 | 变量声明未赋值、函数无 return、读取不存在属性 | 开发者主动设置"空值" |
| typeof | `'undefined'` | `'object'`（历史 bug） |
| 转数字 | `NaN` | `0` |

### 3. typeof null 为什么返回 'object'？

这是 JavaScript 第一版留下的 bug。当时 JS 的值是用类型标签 + 值来存储的，`null` 的类型标签和 object 一样（都是 `000`），后来为了兼容已有代码一直没有修正。

### 4. map 和 forEach 的区别？

```javascript
const arr = [1, 2, 3]

// forEach：遍历执行副作用，不返回有意义的值
const result1 = arr.forEach(item => item * 2)
console.log(result1)  // undefined

// map：遍历变换每个元素，返回新数组
const result2 = arr.map(item => item * 2)
console.log(result2)  // [2, 4, 6]
```

**选择建议**：需要返回新数组用 `map`；只需要遍历做些操作（如打印、DOM 操作、累计计数）用 `forEach`。另外 `for...of` 循环在某些场景下比两者都高效（支持 break/continue）。

### 5. 数组去重的几种方法

```javascript
const arr = [1, 2, 2, 3, 3, 3, 4]

// 方法 1：Set —— 最简洁推荐
const unique1 = [...new Set(arr)]  // [1,2,3,4]

// 方法 2：filter + indexOf —— 兼容性好
const unique2 = arr.filter((item, index) => arr.indexOf(item) === index)

// 方法 3：reduce —— 函数式风格
const unique3 = arr.reduce((acc, cur) => {
  return acc.includes(cur) ? acc : [...acc, cur]
}, [])

// 对象数组去重（根据某个字段）
const users = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
  { id: 1, name: 'A' },  // 重复
]
const uniqueUsers = [...new Map(users.map(u => [u.id, u])).values()]
// [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]
```

### 6. 防抖（Debounce）和节流（Throttle）的区别？

这两个都是控制函数执行频率的手段，但策略不同：

| 特征 | 防抖 Debounce | 节流 Throttle |
|------|--------------|---------------|
| 策略 | 等待一段时间，期间再触发则**重新计时** | 固定时间间隔内**只执行一次** |
| 效果 | 多次快速触发只执行**最后一次** | 多次触发**均匀地**间隔执行 |
| 典型场景 | 搜索框输入、按钮防重复点击 | 滚动事件、鼠标移动、窗口 resize |
| 生活类比 | 公交车等人满了才走（没人来就一直等） | 地铁固定班次发车（到了点就走） |

### 7. call、apply、bind 三者的区别？

三者都能显式指定 `this`，区别在于**调用方式和参数传递**：

```javascript
function greet(greeting, punctuation) {
  console.log(`${greeting}, I'm ${this.name}${punctuation}`)
}

const person = { name: 'John' }

// call —— 立即执行，参数逐个传递
greet.call(person, 'Hello', '!')     // 'Hello, John!'

// apply —— 立即执行，参数以数组传递
greet.apply(person, ['Hi', '~'])     // 'Hi, John~'

// bind —— 不立即执行，返回一个新函数
const boundGreet = greet.bind(person, 'Hey')
boundGreet('.')                       // 'Hey, John.'
```

**使用场景**：
- `call/apply`：借用方法（如 `[].slice.call(arguments)` 把类数组转真数组）、继承（`Animal.call(this)`）
- `bind`：永久绑定 this（如 React 的事件处理函数）、函数预设参数（偏函数）

### 8. 如何准确判断数组？

```javascript
Array.isArray([])                              // ✅ 推荐，最简洁
[] instanceof Array                             // ⚠️ 可靠，但跨 iframe 可能出错
Object.prototype.toString.call([]) === '[object Array]'  // ✅ 最准确，万能方法
```

### 9. 深拷贝和浅拷贝的区别？

- **浅拷贝**：只复制顶层属性，嵌套的对象/数组仍与原数据**共享引用**（修改会相互影响）
- **深拷贝**：递归复制所有层级的数据，产生**完全独立**的副本（互不影响）

选择依据：如果数据只有一层结构，浅拷贝就够了（效率更高）；如果有嵌套对象且需要独立修改，就必须深拷贝。

### 10. 闭包是什么？优缺点？

**定义**：闭包是指函数能够记住并访问其词法作用域（定义时的作用域），即使该函数在其词法作用域之外执行。

**优点**：
- 数据封装和私有化（模拟私有变量）
- 函数柯里化和偏函数（预先填充部分参数）
- 模块模式（Node.js 的 CommonJS、ES Module 底层都是闭包）
- 维持状态（如 React 的 useState hooks）

**缺点/风险**：
- 内存泄漏：闭包持有的外部变量不会自动释放
- 性能开销：闭包比普通函数占用更多内存
- 调试困难：闭包中的变量不像全局变量那么容易追踪

**应对**：及时将不再使用的闭包引用设为 `null`；组件卸载时清除定时器/事件监听/订阅。
