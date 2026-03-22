# TypeScript 核心知识

## 目录

1. [TypeScript 基础](#一typescript-基础)
2. [基础类型](#二基础类型)
3. [函数类型](#三函数类型)
4. [接口](#四接口interface)
5. [类型别名](#五类型别名type)
6. [泛型](#六泛型generics)
7. [枚举](#七枚举enum)
8. [类型断言与类型守卫](#八类型断言与类型守卫)
9. [模块与命名空间](#九模块与命名空间)
10. [装饰器](#十装饰器)
11. [高级类型](#十一高级类型)
12. [tsconfig.json 配置](#十二tsconfigjson-配置)
13. [常见知识点](#十三常见知识点)

---

## 一、TypeScript 基础

### 1. TypeScript vs JavaScript
| 特性 | JavaScript | TypeScript |
|------|-----------|-----------|
| 类型 | 动态类型 | 静态类型 |
| 编译 | 无需编译 | 编译为 JavaScript |
| IDE 支持 | 一般 | 优秀（智能提示、重构） |
| 学习曲线 | 低 | 中等 |
| 适用场景 | 小项目、快速原型 | 大型项目、团队协作 |

### 2. 安装与使用
```bash
# 安装 TypeScript
npm install -g typescript

# 初始化项目
tsc --init

# 编译
tsc filename.ts

# 监听模式
tsc --watch
```

---

## 二、基础类型

### 1. 原始类型
```typescript
// 常用类型
let num: number = 1
let str: string = 'hello'
let bool: boolean = true
let undef: undefined = undefined
let nul: null = null

// Symbol 和 BigInt
let sym: symbol = Symbol('id')
let big: bigint = 100n

// 数组
let arr1: number[] = [1, 2, 3]
let arr2: Array<number> = [1, 2, 3]

// 元组
let tuple: [string, number] = ['hello', 1]
```

### 2. 特殊类型
```typescript
// any：任意类型
let anything: any = 'hello'
anything = 123  // ✅ 允许

// unknown：安全的 any
let value: unknown = 'hello'
// console.log(value.length)  // ❌ 类型不安全
if (typeof value === 'string') {
  console.log(value.length)  // ✅ 类型缩小后安全
}

// void：无返回值
function fn1(): void {
  console.log('Hello')
}

// never：永远不会返回
function fn2(): never {
  throw new Error('Error')
}

// object：非原始类型
let obj: object = { name: 'John' }

// {}：空对象类型
let empty: {} = {}  // 只能赋值为空对象或原始类型
```

---

## 三、函数类型

### 1. 函数声明
```typescript
// 基本写法
function add(a: number, b: number): number {
  return a + b
}

// 可选参数
function greet(name: string, greeting?: string) {
  console.log(greeting ? `${greeting}, ${name}` : `Hello, ${name}`)
}

// 默认参数
function multiply(a: number, b: number = 2): number {
  return a * b
}

// 剩余参数
function sum(...args: number[]): number {
  return args.reduce((a, b) => a + b, 0)
}
```

### 2. 函数表达式
```typescript
// 函数表达式
const add = function(a: number, b: number): number {
  return a + b
}

// 箭头函数
const subtract = (a: number, b: number): number => {
  return a - b
}
```

### 3. 函数类型
```typescript
// 定义函数类型
type MathFunc = (a: number, b: number) => number

const add: MathFunc = (a, b) => a + b
const multiply: MathFunc = (a, b) => a * b
```

### 4. 函数重载
```typescript
function reverse(x: string): string
function reverse(x: number): number
function reverse(x: string | number): string | number {
  if (typeof x === 'string') {
    return x.split('').reverse().join('')
  }
  return Number(x.toString().split('').reverse().join(''))
}

console.log(reverse('hello'))  // 'olleh'
console.log(reverse(123))      // 321
```

---

## 四、接口（Interface）

### 1. 基本用法
```typescript
interface User {
  name: string
  age: number
}

const user: User = {
  name: 'John',
  age: 30
}
```

### 2. 可选属性
```typescript
interface User {
  name: string
  age?: number  // 可选
}

const user: User = {
  name: 'John'
  // age 可以不传
}
```

### 3. 只读属性
```typescript
interface User {
  readonly id: number
  name: string
}

const user: User = {
  id: 1,
  name: 'John'
}

// user.id = 2  // ❌ 不能修改
```

### 4. 函数类型
```typescript
interface MathFunc {
  (a: number, b: number): number
}

const add: MathFunc = (a, b) => a + b
```

### 5. 继承
```typescript
interface Animal {
  name: string
}

interface Dog extends Animal {
  breed: string
}

const dog: Dog = {
  name: 'Rex',
  breed: 'Bulldog'
}
```

### 6. 混合类型
```typescript
interface Counter {
  (start: number): string
  interval: number
  reset(): void
}

function getCounter(): Counter {
  const counter = <Counter>function (start: number) {
    return 'Count: ' + start
  }
  counter.interval = 123
  counter.reset = function () {}
  return counter
}
```

---

## 五、类型别名（Type）

### 1. 基本用法
```typescript
type Name = string
type Age = number
type User = {
  name: Name
  age: Age
}
```

### 2. 联合类型
```typescript
type ID = string | number

function printID(id: ID) {
  console.log(id)
}

printID('123')
printID(123)
```

### 3. 交叉类型
```typescript
type Name = { name: string }
type Age = { age: number }

type Person = Name & Age

const person: Person = {
  name: 'John',
  age: 30
}
```

### 4. 泛型类型别名
```typescript
type Container<T> = { value: T }

const numContainer: Container<number> = { value: 123 }
const strContainer: Container<string> = { value: 'hello' }
```

---

## 六、泛型（Generics）

### 1. 基本用法
```typescript
// 泛型函数
function identity<T>(arg: T): T {
  return arg
}

const num = identity<number>(123)  // 123
const str = identity<string>('hello')  // 'hello'

// 类型推断
const num2 = identity(123)  // 自动推断为 number
```

### 2. 泛型接口
```typescript
interface Box<T> {
  value: T
}

const numBox: Box<number> = { value: 123 }
const strBox: Box<string> = { value: 'hello' }
```

### 3. 泛型类
```typescript
class GenericNumber<T> {
  zeroValue: T
  add: (x: T, y: T) => T

  constructor(zeroValue: T, add: (x: T, y: T) => T) {
    this.zeroValue = zeroValue
    this.add = add
  }
}

const myGenericNumber = new GenericNumber<number>(0, (x, y) => x + y)
```

### 4. 泛型约束
```typescript
interface Lengthwise {
  length: number
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
  console.log(arg.length)
  return arg
}

loggingIdentity('hello')  // ✅
loggingIdentity([1, 2, 3])  // ✅
// loggingIdentity(123)  // ❌
```

### 5. 多个泛型参数
```typescript
function pair<T, U>(first: T, second: U): [T, U] {
  return [first, second]
}

const result = pair<string, number>('hello', 123)
```

---

## 七、枚举（Enum）

### 1. 数字枚举
```typescript
enum Direction {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3
}

console.log(Direction.Up)    // 0
console.log(Direction[0])    // 'Up'

// 自动递增
enum Status {
  Success = 0,
  Warning,  // 1
  Error     // 2
}
```

### 2. 字符串枚举
```typescript
enum Role {
  Admin = 'ADMIN',
  User = 'USER',
  Guest = 'GUEST'
}

console.log(Role.Admin)  // 'ADMIN'
```

### 3. 常量枚举
```typescript
const enum Color {
  Red,
  Green,
  Blue
}

const red = Color.Red  // 编译时内联
```

### 4. 异构枚举
```typescript
enum Mixed {
  Yes = 1,
  No = 'NO'
}
```

---

## 八、类型断言与类型守卫

### 1. 类型断言
```typescript
// 方式 1：尖括号
let value: any = 'hello'
let length1: number = (<string>value).length

// 方式 2：as（推荐）
let length2: number = (value as string).length
```

### 2. 类型守卫
```typescript
// typeof
function printId(id: string | number) {
  if (typeof id === 'string') {
    console.log(id.toUpperCase())
  } else {
    console.log(id.toFixed(2))
  }
}

// instanceof
class Cat {
  meow() {}
}

class Dog {
  bark() {}
}

function speak(animal: Cat | Dog) {
  if (animal instanceof Cat) {
    animal.meow()
  } else {
    animal.bark()
  }
}

// 自定义类型守卫
interface Fish {
  swim(): void
}

interface Bird {
  fly(): void
}

function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined
}
```

---

## 九、模块与命名空间

### 1. 模块
```typescript
// utils.ts
export function add(a: number, b: number): number {
  return a + b
}

export const PI = 3.14159

// main.ts
import { add, PI } from './utils'
import * as utils from './utils'
```

### 2. 命名空间（不推荐）
```typescript
namespace App {
  export const version = '1.0.0'

  export function log(message: string) {
    console.log(message)
  }
}

App.log('Hello')
console.log(App.version)
```

---

## 十、装饰器（Decorators）

### 1. 类装饰器
```typescript
function sealed(constructor: Function) {
  Object.seal(constructor)
  Object.seal(constructor.prototype)
}

@sealed
class Greeter {
  greeting: string
  constructor(message: string) {
    this.greeting = message
  }
}
```

### 2. 方法装饰器
```typescript
function log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value

  descriptor.value = function (...args: any[]) {
    console.log(`Calling ${propertyKey} with`, args)
    return originalMethod.apply(this, args)
  }
}

class Calculator {
  @log
  add(a: number, b: number) {
    return a + b
  }
}
```

---

## 十一、高级类型

### 1. 映射类型
```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P]
}

type Partial<T> = {
  [P in keyof T]?: T[P]
}

type User = {
  name: string
  age: number
}

type ReadonlyUser = Readonly<User>
type PartialUser = Partial<User>
```

### 2. 条件类型
```typescript
type NonNullable<T> = T extends null | undefined ? never : T

type Result = NonNullable<string | null>  // string
```

### 3. 类型推断
```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any

type Fn = (x: number) => string
type Result = ReturnType<Fn>  // string
```

### 4. 工具类型
```typescript
// Partial：所有属性可选
type PartialUser = Partial<{ name: string; age: number }>

// Required：所有属性必填
type RequiredUser = Required<{ name?: string; age?: number }>

// Readonly：所有属性只读
type ReadonlyUser = Readonly<{ name: string; age: number }>

// Pick：选取部分属性
type NameOnly = Pick<{ name: string; age: number }, 'name'>

// Omit：排除部分属性
type AgeOnly = Omit<{ name: string; age: number }, 'name'>

// Record：创建对象类型
type UserMap = Record<string, { name: string; age: number }>

// Extract：提取联合类型中符合的
type Numbers = Extract<string | number, number>

// Exclude：排除联合类型中符合的
type Strings = Exclude<string | number, number>
```

---

## 十二、tsconfig.json 配置

### 1. 基础配置
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 2. 常用选项说明
| 选项 | 说明 |
|------|------|
| `target` | 编译目标（ES3/ES5/ES2020） |
| `module` | 模块系统（CommonJS/ESNext） |
| `strict` | 启用所有严格类型检查 |
| `esModuleInterop` | 允许 CommonJS 模块按 ES 模块导入 |
| `declaration` | 生成 .d.ts 声明文件 |
| `sourceMap` | 生成 sourcemap |

---

## 十三、常见知识点

### 1. TypeScript 的优势是什么？
- 静态类型检查，减少运行时错误
- 更好的 IDE 支持（智能提示、重构）
- 更好的代码可读性和维护性
- 支持最新的 JavaScript 特性

### 2. any vs unknown 的区别？
- **any**：任意类型，绕过类型检查，不安全
- **unknown**：安全的 any，使用前需要类型检查

### 3. interface vs type 的区别？
- **interface**：可以被继承、合并
- **type**：不能继承、合并，但支持联合、交叉、映射类型

### 4. 泛型的作用是什么？
- 提高代码复用性
- 保持类型安全
- 避免代码重复

### 5. 什么是类型守卫？
- 在运行时检查类型的表达式
- TypeScript 会根据类型守卫缩小类型范围
- 常见：typeof、instanceof、in、自定义类型守卫

### 6. enum 的优缺点？
- **优点**：自文档化，提高可读性
- **缺点**：增加打包体积，编译后是普通对象

### 7. 工具类型有哪些？
- Partial、Required、Readonly
- Pick、Omit、Record
- Extract、Exclude
- ReturnType、Parameters

### 8. 什么是类型推断？
- TypeScript 自动推断表达式的类型
- 基于初始值、返回值、上下文等

### 9. readonly vs const 的区别？
- **const**：变量，不能重新赋值
- **readonly**：属性，不能修改

### 10. declare 的作用是什么？
- 声明类型但不实现
- 常用于声明第三方库的类型
- 扩展全局类型
