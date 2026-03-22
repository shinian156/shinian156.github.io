# JavaScript 核心知识

## 目录

1. [数据类型](#一数据类型)
2. [深拷贝与浅拷贝](#二深拷贝与浅拷贝)
3. [闭包](#三闭包closure)
4. [原型与原型链](#四原型与原型链)
5. [this 指向](#五this-指向)
6. [事件循环](#六事件循环event-loop)
7. [Promise 与 Async/Await](#七promise-与-asyncawait)
8. [ES6+ 新特性](#八es6-新特性)
9. [数组常用方法](#九数组常用方法)
10. [常见知识点](#十常见知识点)

---

## 一、数据类型

### 1. 基本数据类型（7 种）
```javascript
// 原始类型
const num = 1        // Number
const str = 'hello'  // String
const bool = true    // Boolean
const undef = undefined  // undefined
const nul = null    // null
const sym = Symbol('id')  // Symbol
const big = 9007199254740991n  // BigInt
```

### 2. 引用数据类型
```javascript
const obj = { name: 'John' }   // Object
const arr = [1, 2, 3]          // Array
const fn = () => {}            // Function
const date = new Date()        // Date
const reg = /test/             // RegExp
const map = new Map()          // Map
const set = new Set()          // Set
```

### 3. typeof vs instanceof
```javascript
typeof 1              // 'number'
typeof 'hello'        // 'string'
typeof true           // 'boolean'
typeof undefined      // 'undefined'
typeof null           // 'object' ❌（历史遗留问题）
typeof []             // 'object'
typeof function(){}   // 'function'

instanceof Array      // true
instanceof Object     // true

// 准确判断类型
Object.prototype.toString.call([])      // '[object Array]'
Object.prototype.toString.call(null)    // '[object Null]'
```

---

## 二、深拷贝与浅拷贝

### 1. 浅拷贝
```javascript
const obj = { a: 1, b: { c: 2 } }

// 方法 1：Object.assign
const copy1 = Object.assign({}, obj)

// 方法 2：展开运算符
const copy2 = { ...obj }

// 方法 3：Array.from（数组）
const arr = [1, 2, { a: 3 }]
const copyArr = Array.from(arr)

// 问题：嵌套对象仍然是引用
copy1.b.c = 999
console.log(obj.b.c)  // 999（原对象也被修改）
```

### 2. 深拷贝
```javascript
const obj = { a: 1, b: { c: 2 }, d: [3, 4] }

// 方法 1：JSON.stringify（有限制）
const deepCopy1 = JSON.parse(JSON.stringify(obj))
// 问题：函数、undefined、Symbol 会丢失

// 方法 2：structuredClone（现代浏览器）
const deepCopy2 = structuredClone(obj)

// 方法 3：手动递归实现
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj

  if (obj instanceof Date) return new Date(obj)
  if (obj instanceof RegExp) return new RegExp(obj)

  const clone = Array.isArray(obj) ? [] : {}

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      clone[key] = deepClone(obj[key])
    }
  }

  return clone
}

// 方法 4：使用 lodash
const deepCopy3 = _.cloneDeep(obj)
```

---

## 三、闭包（Closure）

### 1. 什么是闭包？
函数及其词法环境的组合，函数可以访问外部作用域的变量。

```javascript
function createCounter() {
  let count = 0  // 私有变量

  return {
    increment() { count++ },
    decrement() { count-- },
    getCount() { return count }
  }
}

const counter = createCounter()
counter.increment()
console.log(counter.getCount())  // 1
```

### 2. 闭包的应用场景
```javascript
// 1. 数据私有化
function privateData() {
  let data = 'secret'
  return { getData: () => data }
}

// 2. 函数柯里化
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args)
    } else {
      return (...nextArgs) => curried.apply(this, args.concat(nextArgs))
    }
  }
}

const add = (a, b, c) => a + b + c
const curriedAdd = curry(add)
console.log(curriedAdd(1)(2)(3))  // 6

// 3. 节流和防抖
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
```

### 3. 闭包的内存泄漏
```javascript
// 问题：闭包导致内存无法释放
function createLeak() {
  const largeData = new Array(1000000).fill(1)
  return () => {
    console.log('Leak!')
  }
}

const leak = createLeak()  // largeData 一直被引用，无法回收

// 解决：及时清理引用
leak = null
```

---

## 四、原型与原型链

### 1. 原型对象
```javascript
function Person(name) {
  this.name = name
}

Person.prototype.sayHello = function() {
  console.log('Hello, ' + this.name)
}

const person = new Person('John')
person.sayHello()  // 'Hello, John'
```

### 2. 原型链
```javascript
person.__proto__ === Person.prototype  // true
Person.prototype.__proto__ === Object.prototype  // true
Object.prototype.__proto__ === null  // true
```

**查找顺序**：
1. 实例属性 → 原型对象 → 原型的原型 → ... → null

### 3. 继承
```javascript
// ES5 方式
function Animal(name) {
  this.name = name
}

Animal.prototype.eat = function() {
  console.log(this.name + ' is eating')
}

function Dog(name, breed) {
  Animal.call(this, name)  // 继承属性
  this.breed = breed
}

Dog.prototype = Object.create(Animal.prototype)  // 继承方法
Dog.prototype.constructor = Dog

// ES6 方式（推荐）
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
    super(name)
    this.breed = breed
  }

  bark() {
    console.log('Woof!')
  }
}
```

---

## 五、this 指向

### 1. this 的 4 种绑定规则
```javascript
// 1. 默认绑定（严格模式下是 undefined）
function fn() {
  console.log(this)
}
fn()  // window（非严格模式）

// 2. 隐式绑定（谁调用就指向谁）
const obj = {
  name: 'John',
  fn() {
    console.log(this.name)  // 'John'
  }
}
obj.fn()

// 3. 显式绑定（call、apply、bind）
const fn2 = function() {
  console.log(this.name)
}
fn2.call({ name: 'John' })  // 'John'
fn2.apply({ name: 'John' })
const boundFn = fn2.bind({ name: 'John' })
boundFn()

// 4. new 绑定
function Person(name) {
  this.name = name
}
const person = new Person('John')
console.log(person.name)  // 'John'
```

### 2. 箭头函数的 this
```javascript
const obj = {
  name: 'John',
  fn() {
    const arrow = () => {
      console.log(this.name)  // 'John'（继承外层 this）
    }
    arrow()
  }
}
obj.fn()
```

**注意**：箭头函数没有自己的 this，不能使用 call/apply/bind 改变

---

## 六、事件循环（Event Loop）

### 1. 宏任务与微任务
```javascript
console.log('1')

setTimeout(() => console.log('2'), 0)

Promise.resolve().then(() => console.log('3'))

console.log('4')

// 输出顺序：1 → 4 → 3 → 2
```

### 2. 执行顺序
```
1. 同步代码
2. 微任务（Promise.then、MutationObserver）
3. 宏任务（setTimeout、setInterval、I/O）
4. 循环 2-3
```

### 3. 经典题目
```javascript
async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}

async function async2() {
  console.log('async2')
}

console.log('script start')

setTimeout(() => {
  console.log('setTimeout')
}, 0)

async1()

new Promise((resolve) => {
  console.log('promise1')
  resolve()
}).then(() => {
  console.log('promise2')
})

console.log('script end')

// 输出顺序：
// script start
// async1 start
// async2
// promise1
// script end
// promise2
// async1 end
// setTimeout
```

---

## 七、Promise 与 Async/Await

### 1. Promise 基础
```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Success')
  }, 1000)
})

promise
  .then(result => console.log(result))
  .catch(error => console.error(error))
  .finally(() => console.log('Done'))
```

### 2. Promise.all vs Promise.race
```javascript
// Promise.all：所有都成功才成功
Promise.all([p1, p2, p3])
  .then(results => console.log(results))
  .catch(error => console.error(error))

// Promise.race：谁快用谁
Promise.race([p1, p2, p3])
  .then(result => console.log(result))
```

### 3. Async/Await
```javascript
async function fetchData() {
  try {
    const res1 = await fetch('/api/data1')
    const data1 = await res1.json()

    const res2 = await fetch('/api/data2')
    const data2 = await res2.json()

    return { data1, data2 }
  } catch (error) {
    console.error(error)
  }
}

// 并行执行
async function parallelFetch() {
  const [data1, data2] = await Promise.all([
    fetch('/api/data1').then(r => r.json()),
    fetch('/api/data2').then(r => r.json())
  ])
  return { data1, data2 }
}
```

---

## 八、ES6+ 新特性

### 1. let 和 const
```javascript
// let：块级作用域，可重新赋值
let count = 1
count = 2

// const：块级作用域，不可重新赋值
const PI = 3.14159
// PI = 3  // TypeError

const obj = { name: 'John' }
obj.name = 'Jane'  // ✅ 对象属性可以修改
// obj = {}  // ❌ 不能重新赋值
```

### 2. 解构赋值
```javascript
// 数组解构
const [a, b, c] = [1, 2, 3]
const [first, ...rest] = [1, 2, 3, 4, 5]

// 对象解构
const { name, age } = { name: 'John', age: 30 }
const { name: userName, ...rest } = { name: 'John', age: 30, city: 'NYC' }

// 默认值
const { x = 0 } = {}

// 函数参数解构
function fn({ x, y }) {
  console.log(x, y)
}
fn({ x: 1, y: 2 })
```

### 3. 模板字符串
```javascript
const name = 'John'
const greeting = `Hello, ${name}!`
const multiline = `
  Line 1
  Line 2
`
```

### 4. 箭头函数
```javascript
const sum = (a, b) => a + b
const double = x => x * 2

// 注意：箭头函数没有 arguments
const fn = () => {
  console.log(arguments)  // ReferenceError
}
```

### 5. 扩展运算符
```javascript
// 数组展开
const arr1 = [1, 2, 3]
const arr2 = [...arr1, 4, 5]

// 对象展开
const obj1 = { name: 'John' }
const obj2 = { ...obj1, age: 30 }

// 函数参数展开
function sum(...args) {
  return args.reduce((a, b) => a + b, 0)
}
console.log(sum(1, 2, 3, 4, 5))  // 15
```

### 6. 对象简写
```javascript
const name = 'John'
const age = 30

const obj = {
  name,  // 等同于 name: name
  age,   // 等同于 age: age
  sayHello() {  // 方法简写
    console.log('Hello')
  }
}
```

### 7. 类（Class）
```javascript
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  sayHello() {
    console.log(`Hello, I'm ${this.name}`)
  }

  static getSpecies() {
    return 'Homo sapiens'
  }
}

class Student extends Person {
  constructor(name, age, grade) {
    super(name, age)
    this.grade = grade
  }

  study() {
    console.log(`${this.name} is studying`)
  }
}
```

---

## 九、数组常用方法

### 1. 改变原数组
```javascript
const arr = [1, 2, 3]

arr.push(4)        // 末尾添加，返回新长度
arr.pop()          // 末尾删除，返回删除的元素
arr.unshift(0)    // 开头添加
arr.shift()        // 开头删除
arr.splice(1, 1)   // 从索引 1 开始，删除 1 个元素
arr.reverse()      // 反转
arr.sort((a, b) => a - b)  // 排序
```

### 2. 不改变原数组
```javascript
const arr = [1, 2, 3]

arr.map(x => x * 2)        // 映射
arr.filter(x => x > 1)     // 过滤
arr.reduce((a, b) => a + b, 0)  // 归约
arr.find(x => x > 1)       // 查找第一个
arr.findIndex(x => x > 1)  // 查找索引
arr.includes(2)           // 是否包含
arr.some(x => x > 1)      // 是否有满足条件的
arr.every(x => x > 0)      // 是否都满足
arr.slice(1, 3)            // 切片
arr.concat([4, 5])         // 拼接
arr.join(',')              // 转字符串
```

---

## 十、常见知识点

### 1. == 和 === 的区别？
- `==`：比较值，会进行类型转换
- `===`：比较值和类型，不转换

```javascript
0 == '0'   // true
0 === '0'  // false

null == undefined  // true
null === undefined // false
```

### 2. undefined 和 null 的区别？
- `undefined`：未定义
- `null`：空对象指针

```javascript
typeof undefined  // 'undefined'
typeof null      // 'object'
```

### 3. typeof null 返回 'object' 的原因？
JavaScript 早期实现 bug，为兼容性保留至今。

### 4. map 和 forEach 的区别？
- `map`：返回新数组，不改变原数组
- `forEach`：不返回值，主要是副作用

### 5. 数组去重有哪些方法？
```javascript
// 方法 1：Set
const unique = [...new Set(arr)]

// 方法 2：filter + indexOf
const unique = arr.filter((item, index) => arr.indexOf(item) === index)

// 方法 3：reduce
const unique = arr.reduce((acc, cur) => {
  return acc.includes(cur) ? acc : [...acc, cur]
}, [])
```

### 6. 防抖和节流的区别？
- **防抖**：触发后等待一段时间再执行，期间再触发重新计时
- **节流**：规定时间内只执行一次

### 7. call、apply、bind 的区别？
- `call`：立即执行，参数逐个传递
- `apply`：立即执行，参数数组传递
- `bind`：返回新函数，不立即执行

### 8. 如何判断数组？
```javascript
Array.isArray([])  // 推荐
[] instanceof Array  // 可靠但跨 iframe 有问题
Object.prototype.toString.call([]) === '[object Array]'
```

### 9. 深拷贝和浅拷贝的区别？
- **浅拷贝**：只复制第一层，嵌套对象仍然是引用
- **深拷贝**：递归复制所有层级

### 10. 闭包是什么？有什么优缺点？
- **定义**：函数及其词法环境的组合
- **优点**：数据私有化、函数柯里化、模块化
- **缺点**：内存泄漏风险
