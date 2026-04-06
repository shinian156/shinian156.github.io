# TypeScript 常用实战用法

## 目录
- [一、实用类型工具（Utility Types）](#一实用类型工具utility-types)
- [二、条件类型与 infer 推断](#二条件类型与-infer-推断)
- [三、模板字面量类型](#三模板字面量类型)
- [四、函数重载实战](#四函数重载实战)
- [五、泛型约束与高级泛型](#五泛型约束与高级泛型)
- [六、声明文件（.d.ts）实战](#六声明文件dts实战)
- [七、类型体操常见场景](#七类型体操常见场景)
- [八、Vue 3 + TypeScript 实战](#八vue-3--typescript-实战)
- [九、React + TypeScript 实战](#九react--typescript-实战)
- [十、项目中的 TS 最佳实践](#十项目中的-ts-最佳实践)

---

## 一、实用类型工具（Utility Types）

TypeScript 内置了大量实用类型工具，日常开发中高频使用。

### 1. Partial / Required / Readonly

```typescript
interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

// 所有属性变为可选 —— 适用于更新场景
type PartialUser = Partial<User>
// { id?: number; name?: string; email?: string; avatar?: string }

// 所有属性变为必填
type RequiredUser = Required<User>

// 所有属性变为只读
type ReadonlyUser = Readonly<User>
```

**实战： PATCH 接口更新部分字段**

```typescript
interface UpdateUserDTO {
  name?: string
  email?: string
  avatar?: string
}

async function updateUser(id: number, data: Partial<User>): Promise<User> {
  const user = await fetchUser(id)
  return { ...user, ...data }
}

// 只传需要更新的字段
await updateUser(1, { name: '新名字' })
await updateUser(1, { email: 'new@mail.com', avatar: '/new.png' })
```

### 2. Pick / Omit

```typescript
// 从 User 中选取部分属性
type UserBasic = Pick<User, 'id' | 'name'>
// { id: number; name: string }

// 从 User 中排除部分属性
type UserWithoutId = Omit<User, 'id'>
// { name: string; email: string; avatar?: string }

// 实战：创建用户时不需要 id
async function createUser(data: Omit<User, 'id'>): Promise<User> {
  const id = await generateId()
  return { id, ...data }
}
```

### 3. Record

```typescript
// 构造键值对类型
type RoleMap = Record<string, string[]>
// { [key: string]: string[] }

const rolePermissions: Record<string, string[]> = {
  admin: ['read', 'write', 'delete'],
  editor: ['read', 'write'],
  viewer: ['read']
}

// 实战：状态映射
type StatusMap = Record<'pending' | 'success' | 'error', { label: string; color: string }>

const statusMap: StatusMap = {
  pending: { label: '处理中', color: '#faad14' },
  success: { label: '成功', color: '#52c41a' },
  error:   { label: '失败', color: '#f5222d' }
}
```

### 4. Extract / Exclude

```typescript
type EventName = 'click' | 'hover' | 'focus' | 'blur'

// 提取满足条件的类型
type MouseEvents = Extract<EventName, 'click' | 'hover'>
// 'click' | 'hover'

// 排除满足条件的类型
type FocusEvents = Exclude<EventName, 'click' | 'hover'>
// 'focus' | 'blur'

// 实战：过滤联合类型
type ApiResponse<T> = { status: 'success'; data: T } | { status: 'error'; message: string }

type SuccessResponse<T> = Extract<ApiResponse<T>, { status: 'success' }>
type ErrorResponse = Extract<ApiResponse<unknown>, { status: 'error' }>
```

### 5. ReturnType / Parameters

```typescript
function createUser(name: string, age: number) {
  return { id: Math.random(), name, age, createdAt: new Date() }
}

// 获取函数返回值类型
type User = ReturnType<typeof createUser>
// { id: number; name: string; age: number; createdAt: Date }

// 获取函数参数类型（元组）
type UserParams = Parameters<typeof createUser>
// [name: string, age: number]
```

### 6. NonNullable

```typescript
type Value = string | null | undefined

type NonNullValue = NonNullable<Value>
// string

// 实战：过滤掉 null/undefined
function filterNull<T>(arr: (T | null | undefined)[]): T[] {
  return arr.filter((v): v is T => v !== null && v !== undefined)
}
```

---

## 二、条件类型与 infer 推断

### 1. 基本条件类型

```typescript
type IsString<T> = T extends string ? true : false

type A = IsString<'hello'>  // true
type B = IsString<42>       // false

// 实战：根据类型返回不同的默认值
type DefaultValue<T> = T extends string
  ? ''
  : T extends number
    ? 0
    : T extends boolean
      ? false
      : null
```

### 2. infer 关键字

`infer` 用于在条件类型中推断类型变量。

```typescript
// 提取函数返回值类型
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// 提取 Promise 内部类型
type Unpacked<T> = T extends (infer U)[] ? U
  : T extends Promise<infer U> ? U
  : T

type A = Unpacked<string[]>        // string
type B = Unpacked<Promise<number>> // number
type C = Unpacked<boolean>         // boolean

// 实战：提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : T
type Item = ElementType<string[]>  // string
```

### 3. 分布式条件类型

```typescript
// 当 T 是联合类型时，条件类型会自动分发
type ToArray<T> = T extends any ? T[] : never

type Result = ToArray<string | number>
// string[] | number[]  （不是 (string | number)[]）

// 实战：提取对象中的函数类型
type FunctionKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never
}[keyof T]

interface Api {
  getUser: (id: number) => Promise<User>
  deleteUser: (id: number) => Promise<void>
  users: User[]
  count: number
}

type ApiMethods = FunctionKeys<Api>
// 'getUser' | 'deleteUser'
```

### 4. infer 实战：提取路由参数

```typescript
// 从字符串中提取动态路由参数
type ExtractParams<T extends string> =
  T extends `${string}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<Rest>
    : T extends `${string}:${infer Param}`
      ? Param
      : never

type Params = ExtractParams<'/users/:id/posts/:postId'>
// 'id' | 'postId'
```

---

## 三、模板字面量类型

### 1. 基本用法

```typescript
type EventName = 'click' | 'focus' | 'blur'
type EventHandler = `on${Capitalize<EventName>}`
// 'onClick' | 'onFocus' | 'onBlur'

// 实战：CSS 属性类型
type CssDirection = 'top' | 'right' | 'bottom' | 'left'
type CssMargin = `margin-${CssDirection}`
// 'margin-top' | 'margin-right' | 'margin-bottom' | 'margin-left'

type CssPadding = `padding-${CssDirection}`
type CssBorder = `border-${CssDirection}`
```

### 2. 字符串操作类型

```typescript
type UppercaseStr = 'hello world'
type Upper = Uppercase<UppercaseStr>    // 'HELLO WORLD'
type Lower = Lowercase<Upper>            // 'hello world'
type Capitalized = Capitalize<UppercaseStr> // 'Hello world'
type Uncapitalized = Uncapitalize<'Hello'>  // 'hello'
```

### 3. 实战：生成 getter/setter 类型

```typescript
type Getter<T> = `get${Capitalize<string & keyof T>}`
type Setter<T> = `set${Capitalize<string & keyof T>}`

interface UserModel {
  name: string
  age: number
  email: string
}

type UserGetters = Getter<UserModel>
// 'getName' | 'getAge' | 'getEmail'

type UserSetters = Setter<UserModel>
// 'setName' | 'setAge' | 'setEmail'
```

---

## 四、函数重载实战

### 1. 基本重载

```typescript
// 根据不同参数返回不同类型
function parseValue(input: string): number
function parseValue(input: number): string
function parseValue(input: string | number): number | string {
  if (typeof input === 'string') {
    return parseInt(input, 10)
  }
  return String(input)
}

const a = parseValue('123')  // number
const b = parseValue(456)    // string
```

### 2. 实战：灵活的查询函数

```typescript
interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

// 重载签名
function queryUsers(role: 'admin'): Promise<User[]>
function queryUsers(role: 'editor' | 'viewer'): Promise<User[]>
function queryUsers(ids: number[]): Promise<User[]>
function queryUsers(roleOrIds: string | number[]): Promise<User[]> {
  if (Array.isArray(roleOrIds)) {
    return db.users.where('id').in(roleOrIds).findAll()
  }
  return db.users.where('role').equals(roleOrIds).findAll()
}

const admins = await queryUsers('admin')
const editors = await queryUsers('editor')
const selected = await queryUsers([1, 2, 3])
```

### 3. 签名合并

```typescript
interface Validator {
  (value: string): boolean
  (value: number): boolean
  pattern: RegExp
}

const isEmail: Validator = (value: any) => isEmail.pattern.test(value)
isEmail.pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

isEmail('test@mail.com')  // boolean
```

---

## 五、泛型约束与高级泛型

### 1. extends 约束

```typescript
interface HasId {
  id: number
}

// 约束 T 必须包含 id 属性
function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id)
}

const users = [{ id: 1, name: 'Tom' }, { id: 2, name: 'Jerry' }]
const user = findById(users, 1)  // { id: number; name: string } | undefined
```

### 2. keyof 约束

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = { name: 'Tom', age: 25, email: 'tom@mail.com' }

const name = getProperty(user, 'name')   // string
const age = getProperty(user, 'age')     // number
// getProperty(user, 'xxx')  // 报错：'xxx' 不在 'name' | 'age' | 'email' 中
```

### 3. 多类型参数

```typescript
function mapKeys<T, K extends string>(
  obj: Record<K, any>,
  fn: (key: K, value: any) => string
): Record<string, any> {
  const result: Record<string, any> = {}
  for (const key in obj) {
    result[fn(key as K, obj[key])] = obj[key]
  }
  return result
}

const data = { firstName: 'Tom', lastName: 'Jerry', age: 25 }
const result = mapKeys(data, (key, value) => `${key}_mapped`)
```

### 4. 默认类型参数

```typescript
// 默认类型参数 —— 类似默认值
interface ApiResponse<T = unknown, E = Error> {
  data: T
  error?: E
  status: number
}

type DefaultResponse = ApiResponse
// { data: unknown; error?: Error; status: number }

type UserResponse = ApiResponse<User>
// { data: User; error?: Error; status: number }

type UserResponseCustom = ApiResponse<User, string>
// { data: User; error?: string; status: number }
```

### 5. 递归类型

```typescript
// 深层 Readonly
type DeepReadonly<T> = {
  readonly [K in keyof T]: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepReadonly<T[K]>
    : T[K]
}

// 深层 Partial
type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepPartial<T[K]>
    : T[K]
}

// 深层 Required
type DeepRequired<T> = {
  [K in keyof T]-?: T[K] extends object
    ? T[K] extends Function
      ? T[K]
      : DeepRequired<T[K]>
    : T[K]
}

// 实战使用
interface Config {
  db: {
    host: string
    port: number
    credentials: {
      username: string
      password: string
    }
  }
  cache: {
    ttl: number
  }
}

const config: DeepReadonly<Config> = { /* ... */ }
const partialConfig: DeepPartial<Config> = {
  db: { host: 'localhost' }  // 其他字段都可选
}
```

---

## 六、声明文件（.d.ts）实战

### 1. 为第三方库添加类型

```typescript
// src/types/lodash.d.ts
declare module 'some-lib-without-types' {
  export function doSomething(input: string): number
  export interface Options {
    verbose?: boolean
    timeout?: number
  }
  export function configure(options: Options): void
}
```

### 2. 全局类型声明

```typescript
// src/types/global.d.ts
declare global {
  interface Window {
    // 扩展 window 属性
    analytics: {
      track(event: string, data?: Record<string, any>): void
      identify(userId: string): void
    }
    __APP_VERSION__: string
  }

  // 自定义全局类型
  type Nullable<T> = T | null
  type Optional<T> = T | undefined
  type Dict<T = any> = Record<string, T>

  // 环境变量类型
  interface ImportMetaEnv {
    VITE_API_BASE: string
    VITE_APP_TITLE: string
    VITE_ENABLE_MOCK: string
  }
}

export {}
```

### 3. 模块 augmentation

```typescript
// 扩展 Axios 类型
import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    skipAuth?: boolean
    retryCount?: number
  }

  interface AxiosResponse<T = any> {
    timestamp: number
  }
}

// 使用
axios.get('/api/data', { skipAuth: true })
```

### 4. 图片等静态资源声明

```typescript
// src/types/assets.d.ts
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.svg' {
  const content: string
  export default content
}

declare module '*.png' {
  const src: string
  export default src
}

declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
```

---

## 七、类型体操常见场景

### 1. 深层 Pick

```typescript
type DeepPick<T, K extends string> =
  T extends object
    ? K extends `${infer Key}.${infer Rest}`
      ? { [P in Key]: DeepPick<T[P & keyof T], Rest> }
      : { [P in K & keyof T]: T[P] }
    : T

interface User {
  id: number
  profile: {
    name: string
    address: {
      city: string
      zip: string
    }
  }
}

type Result = DeepPick<User, 'id' | 'profile.name' | 'profile.address.city'>
// { id: number; profile: { name: string; address: { city: string } } }
```

### 2. 联合类型转交叉类型

```typescript
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends (k: infer I) => void
    ? I
    : never

type A = { name: string }
type B = { age: number }
type C = { email: string }

type Result = UnionToIntersection<A | B | C>
// { name: string } & { age: number } & { email: string }
```

### 3. 精确类型匹配

```typescript
// 确保 obj 不包含 T 之外的属性
type Exact<T, Shape> = T extends Shape
  ? Exclude<keyof T, keyof Shape> extends never
    ? T
    : never
  : never

interface PersonShape {
  name: string
  age: number
}

// 正确
const person1: Exact<PersonShape, PersonShape> = { name: 'Tom', age: 25 }

// 报错：email 是多余属性
// const person2: Exact<PersonShape, PersonShape> = { name: 'Tom', age: 25, email: 'x' }
```

### 4. 实现 OmitByValue

```typescript
type OmitByValue<T, ValueType> = {
  [K in keyof T as T[K] extends ValueType ? never : K]: T[K]
}

interface Mixed {
  name: string
  age: number
  active: boolean
  tags: string[]
}

type NoStrings = OmitByValue<Mixed, string>
// { age: number; active: boolean; tags: string[] }

type NoBooleans = OmitByValue<Mixed, boolean>
// { name: string; age: number; tags: string[] }
```

---

## 八、Vue 3 + TypeScript 实战

### 1. defineProps 类型声明

```typescript
// 方式一：泛型声明（推荐）
<script setup lang="ts">
interface Props {
  title: string
  count?: number
  items: string[]
  config: {
    theme: 'light' | 'dark'
    lang: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  count: 0,
  config: () => ({ theme: 'light', lang: 'zh-CN' })
})
</script>

// 方式二：运行时声明
const props = defineProps({
  title: { type: String, required: true },
  count: { type: Number, default: 0 }
})
```

### 2. defineEmits 类型声明

```typescript
interface Emits {
  (e: 'change', value: string): void
  (e: 'update', id: number, data: Partial<User>): void
  (e: 'delete', id: number): void
}

const emit = defineEmits<Emits>()

emit('change', 'new value')
emit('update', 1, { name: 'updated' })
emit('delete', 1)
```

### 3. ref 与 reactive 类型

```typescript
import { ref, reactive, computed } from 'vue'

// ref 自动推导
const count = ref(0)              // Ref<number>
const name = ref('Tom')           // Ref<string>

// ref 显式泛型
const user = ref<User | null>(null)
const list = ref<User[]>([])

// reactive
interface FormState {
  username: string
  password: string
  remember: boolean
}

const form = reactive<FormState>({
  username: '',
  password: '',
  remember: false
})

// computed
const isValid = computed<boolean>(() => {
  return form.username.length >= 3 && form.password.length >= 6
})
```

### 4. composable 函数

```typescript
// useFetch.ts
import { ref, type Ref } from 'vue'

interface UseFetchOptions {
  immediate?: boolean
  initialData?: T
}

interface UseFetchReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  refresh: () => Promise<void>
}

export function useFetch<T = any>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchReturn<T> {
  const data = ref<T | null>(options.initialData ?? null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  async function fetch() {
    loading.value = true
    error.value = null
    try {
      const response = await fetch(url)
      data.value = await response.json()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  if (options.immediate !== false) {
    fetch()
  }

  return { data, loading, error, refresh: fetch }
}

// 使用
const { data, loading, error } = useFetch<User[]>('/api/users')
```

### 5. provide / inject 类型安全

```typescript
import { inject, type InjectionKey } from 'vue'

// 定义注入键（类型安全）
const userKey: InjectionKey<User> = Symbol('user')
const themeKey: InjectionKey<Ref<'light' | 'dark'>> = Symbol('theme')

// 父组件 provide
provide(userKey, user)
provide(themeKey, theme)

// 子组件 inject
const user = inject(userKey)    // User | undefined
const theme = inject(themeKey)  // Ref<'light' | 'dark'> | undefined

// 带默认值
const user = inject(userKey, defaultValue)
```

---

## 九、React + TypeScript 实战

### 1. 函数组件类型

```typescript
import { useState, type FC, type ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
}

const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick
}) => {
  return (
    <button
      className={`btn btn-${variant} btn-${size}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### 2. 自定义 Hook 类型

```typescript
interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string
  deserializer?: (value: string) => T
}

function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions<T> = {}
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { serializer = JSON.stringify, deserializer = JSON.parse } = options

  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? deserializer(item) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T | ((prev: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value
    setStoredValue(valueToStore)
    window.localStorage.setItem(key, serializer(valueToStore))
  }

  const removeValue = () => {
    setStoredValue(initialValue)
    window.localStorage.removeItem(key)
  }

  return [storedValue, setValue, removeValue]
}

// 使用
const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')
const [user, setUser] = useLocalStorage<User>('user', null)
```

### 3. Ref 类型

```typescript
import { useRef, type RefObject } from 'react'

function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const focusInput = () => {
    inputRef.current?.focus()
  }

  return (
    <form ref={formRef}>
      <input ref={inputRef} type="text" />
      <button type="button" onClick={focusInput}>Focus</button>
    </form>
  )
}
```

---

## 十、项目中的 TS 最佳实践

### 1. 严格模式配置

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

### 2. 类型与值的命名空间分离

```typescript
// 推荐用 namespace 或单独的类型文件
// types/api.d.ts
export interface UserDTO {
  id: number
  name: string
}

export namespace UserDTO {
  export type Create = Omit<UserDTO, 'id'>
  export type Update = Partial<Omit<UserDTO, 'id'>>
  export type List = UserDTO[]
}

// 使用
async function createUser(data: UserDTO.Create): Promise<UserDTO> { /* ... */ }
```

### 3. 类型守卫函数

```typescript
// 自定义类型守卫
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  )
}

function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

// 使用
const data: unknown = fetchData()
if (isUser(data)) {
  console.log(data.name)  // 安全访问
}

const list: (User | null)[] = getUsers()
const validUsers = list.filter(isNonNullable)  // User[]
```

### 4. as const 断言

```typescript
// as const 获得最精确的字面量类型
const CONFIG = {
  API_URL: 'https://api.example.com',
  TIMEOUT: 5000,
  RETRY: 3
} as const

// API_URL 的类型是 'https://api.example.com'（不是 string）
// TIMEOUT 的类型是 5000（不是 number）

// 实战：定义路由常量
const Routes = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  USER_PROFILE: (id: number) => `/users/${id}`
} as const

type RoutePath = typeof Routes[keyof typeof Routes]
// '/' | '/login' | '/dashboard' | ((id: number) => string)
```

### 5. satisfies 操作符（TS 4.9+）

```typescript
// satisfies: 验证类型但不拓宽
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
  blue: [0, 0, 255]
} satisfies Record<string, string | number[]>

// green 仍然是 '#00ff00' 字面量类型，而不是 string
// 但如果写错了会报错
```

### 6. 常见错误与解决方案

```typescript
// ❌ 错误：any 滥用
function processData(data: any) { /* ... */ }

// ✅ 正确：使用泛型
function processData<T>(data: T): T { /* ... */ }

// ❌ 错误：断言绕过检查
const user = response as User

// ✅ 正确：类型守卫
function isUserResponse(data: any): data is User { /* ... */ }

// ❌ 错误：optional chaining 后仍可能 undefined
const name = user?.profile.name  // 报错

// ✅ 正确：逐级 optional chaining
const name = user?.profile?.name  // string | undefined

// ❌ 错误：枚举滥用
enum Status { Pending, Success, Error }

// ✅ 正确：联合类型（更轻量，tree-shakable）
type Status = 'pending' | 'success' | 'error'
```

### 7. 常用工具类型速查表

| 工具类型 | 作用 | 示例 |
|---------|------|------|
| `Partial<T>` | 所有属性可选 | `{ id?: number; name?: string }` |
| `Required<T>` | 所有属性必填 | `{ id: number; name: string }` |
| `Readonly<T>` | 所有属性只读 | `{ readonly id: number }` |
| `Pick<T, K>` | 选取部分属性 | `Pick<User, 'id' \| 'name'>` |
| `Omit<T, K>` | 排除部分属性 | `Omit<User, 'id'>` |
| `Record<K, V>` | 构造键值对 | `Record<string, number>` |
| `Exclude<U, E>` | 排除联合成员 | `Exclude<'a'\|'b', 'a'>` |
| `Extract<U, E>` | 提取联合成员 | `Extract<'a'\|'b', 'a'>` |
| `ReturnType<F>` | 函数返回值类型 | `ReturnType<typeof fn>` |
| `Parameters<F>` | 函数参数类型 | `Parameters<typeof fn>` |
| `NonNullable<T>` | 排除 null/undefined | `NonNullable<string \| null>` |
| `Awaited<T>` | 解包 Promise 类型 | `Awaited<Promise<string>>` |
