# Node.js 核心知识

## 目录

1. [Node.js 基础](#一nodejs-基础)
2. [事件循环](#二事件循环event-loop)
3. [模块系统](#三模块系统)
4. [核心模块](#四核心模块)
5. [异步编程](#五异步编程)
6. [错误处理](#六错误处理)
7. [进程与线程](#七进程与线程)
8. [性能优化](#八性能优化)
9. [安全](#九安全)
10. [常见知识点](#十常见知识点)

---

## 一、Node.js 基础

### 1. Node.js 是什么？
Node.js 是一个基于 Chrome V8 引擎的 JavaScript 运行时环境，让 JavaScript 可以在服务器端运行。

### 2. Node.js 特点
- **单线程**：主线程是单线程，通过事件循环处理并发
- **非阻塞 I/O**：异步 I/O，提高性能
- **事件驱动**：基于事件机制处理请求
- **跨平台**：可以在 Windows、macOS、Linux 上运行

### 3. Node.js 适用场景
- RESTful API
- 实时应用（聊天、游戏）
- CLI 工具
- 自动化脚本
- 微服务

---

## 二、事件循环（Event Loop）

### 1. 事件循环机制
```
┌─────────────────────────────┐
│         Timers                │  setTimeout、setInterval
├─────────────────────────────┤
│     Pending Callbacks        │  I/O 回调
├─────────────────────────────┤
│      Idle/Prepare            │  内部使用
├─────────────────────────────┤
│          Poll                │  I/O 事件、新连接
├─────────────────────────────┤
│          Check               │  setImmediate
├─────────────────────────────┤
│     Close Callbacks          │  close 事件
└─────────────────────────────┘
```

### 2. 执行顺序
```javascript
console.log('1. Script start')

setTimeout(() => console.log('2. setTimeout'), 0)

setImmediate(() => console.log('3. setImmediate'))

process.nextTick(() => console.log('4. nextTick'))

Promise.resolve().then(() => console.log('5. Promise'))

console.log('6. Script end')

// 输出顺序：
// 1. Script start
// 6. Script end
// 4. nextTick
// 5. Promise
// 2. setTimeout
// 3. setImmediate
```

### 3. 微任务 vs 宏任务
- **微任务**：process.nextTick、Promise.then
- **宏任务**：setTimeout、setInterval、setImmediate

**执行顺序**：
1. 同步代码
2. process.nextTick（微任务）
3. Promise.then（微任务）
4. 宏任务

---

## 三、模块系统

### 1. CommonJS（Node.js 默认）
```javascript
// 导出
module.exports = {
  name: 'John',
  age: 30
}

// 或
exports.add = function(a, b) {
  return a + b
}

// 导入
const user = require('./user')
const { add } = require('./utils')
```

### 2. ES Module（ESM）
```javascript
// 导出
export const name = 'John'
export function add(a, b) {
  return a + b
}
export default { name: 'John' }

// 导入
import user from './user.js'
import { add } from './utils.js'
import * as utils from './utils.js'
```

### 3. CommonJS vs ESM
| 特性 | CommonJS | ESM |
|------|----------|-----|
| 导入方式 | require | import |
| 导出方式 | module.exports | export |
| 加载方式 | 运行时加载 | 编译时加载 |
| 是否动态 | ✅ 是 | ❌ 否（除动态导入） |
| 顶层 await | ❌ 不支持 | ✅ 支持 |

### 4. 动态导入
```javascript
const module = await import('./module.js')
```

---

## 四、核心模块

### 1. fs（文件系统）
```javascript
const fs = require('fs')
const path = require('path')

// 同步读取
const data = fs.readFileSync('./file.txt', 'utf8')

// 异步读取
fs.readFile('./file.txt', 'utf8', (err, data) => {
  if (err) throw err
  console.log(data)
})

// Promise 风格
const { readFile } = require('fs').promises
readFile('./file.txt', 'utf8').then(console.log)

// 检查文件是否存在
fs.existsSync('./file.txt')

// 创建目录
fs.mkdirSync('./dist', { recursive: true })

// 删除文件
fs.unlinkSync('./file.txt')
```

### 2. path（路径处理）
```javascript
const path = require('path')

// 拼接路径
const fullPath = path.join(__dirname, 'dist', 'file.txt')

// 解析路径
const parsed = path.parse('/home/user/file.txt')
console.log(parsed)
// {
//   root: '/',
//   dir: '/home/user',
//   base: 'file.txt',
//   ext: '.txt',
//   name: 'file'
// }

// 获取扩展名
const ext = path.extname('file.txt')  // '.txt'

// 获取目录名
const dir = path.dirname('/home/user/file.txt')  // '/home/user'
```

### 3. http（HTTP 服务器）
```javascript
const http = require('http')

// 创建服务器
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Hello, World!')
})

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000')
})

// 发送 HTTP 请求
http.get('http://example.com', (res) => {
  let data = ''
  res.on('data', (chunk) => {
    data += chunk
  })
  res.on('end', () => {
    console.log(data)
  })
})
```

### 4. events（事件发射器）
```javascript
const EventEmitter = require('events')

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter()

// 监听事件
myEmitter.on('event', (data) => {
  console.log('Event received:', data)
})

// 触发事件
myEmitter.emit('event', { message: 'Hello' })

// 只监听一次
myEmitter.once('event', () => {
  console.log('Only once')
})
```

### 5. stream（流）
```javascript
const fs = require('fs')

// 读取流
const readStream = fs.createReadStream('./input.txt')

// 写入流
const writeStream = fs.createWriteStream('./output.txt')

// 管道
readStream.pipe(writeStream)

// 手动处理
readStream.on('data', (chunk) => {
  writeStream.write(chunk)
})

readStream.on('end', () => {
  writeStream.end()
})
```

### 6. buffer（缓冲区）
```javascript
const buf = Buffer.from('Hello')

console.log(buf.toString())  // 'Hello'
console.log(buf.length)      // 5

// 拼接 buffer
const buf1 = Buffer.from('Hello')
const buf2 = Buffer.from('World')
const buf3 = Buffer.concat([buf1, buf2])
console.log(buf3.toString())  // 'HelloWorld'
```

---

## 五、异步编程

### 1. 回调函数
```javascript
fs.readFile('./file.txt', 'utf8', (err, data) => {
  if (err) throw err
  console.log(data)
})
```

### 2. Promise
```javascript
const { readFile } = require('fs').promises

readFile('./file.txt', 'utf8')
  .then(data => console.log(data))
  .catch(err => console.error(err))
```

### 3. Async/Await
```javascript
const { readFile } = require('fs').promises

async function readFiles() {
  try {
    const data = await readFile('./file.txt', 'utf8')
    console.log(data)
  } catch (err) {
    console.error(err)
  }
}
```

### 4. 串行 vs 并行
```javascript
// 串行执行（慢）
async function sequential() {
  const data1 = await readFile('file1.txt', 'utf8')
  const data2 = await readFile('file2.txt', 'utf8')
  return [data1, data2]
}

// 并行执行（快）
async function parallel() {
  const [data1, data2] = await Promise.all([
    readFile('file1.txt', 'utf8'),
    readFile('file2.txt', 'utf8')
  ])
  return [data1, data2]
}
```

---

## 六、错误处理

### 1. try/catch
```javascript
async function fn() {
  try {
    const data = await readFile('file.txt', 'utf8')
    return data
  } catch (err) {
    console.error(err)
    throw err  // 重新抛出
  }
}
```

### 2. error 事件（未捕获的异常）
```javascript
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason)
})
```

### 3. domain（已废弃）
```javascript
const domain = require('domain')

const d = domain.create()
d.run(() => {
  // 在这个域内运行的代码，错误可以被捕获
  throw new Error('Error in domain')
})

d.on('error', (err) => {
  console.error('Domain error:', err)
})
```

---

## 七、进程与线程

### 1. process（当前进程）
```javascript
// 退出进程
process.exit(1)

// 获取参数
const args = process.argv.slice(2)

// 环境变量
const env = process.env.NODE_ENV

// 当前工作目录
const cwd = process.cwd()

// 内存使用
const memory = process.memoryUsage()

// CPU 信息
const cpus = require('os').cpus()
```

### 2. child_process（子进程）
```javascript
const { spawn, exec, fork } = require('child_process')

// spawn：流式输出
const ls = spawn('ls', ['-lh'])
ls.stdout.on('data', (data) => {
  console.log(data.toString())
})

// exec：缓冲输出
exec('ls -lh', (err, stdout, stderr) => {
  if (err) throw err
  console.log(stdout)
})

// fork：创建 Node 子进程
const child = fork('./child.js')
child.send('Hello from parent')
child.on('message', (msg) => {
  console.log('Message from child:', msg)
})
```

### 3. cluster（集群）
```javascript
const cluster = require('cluster')
const http = require('http')
const numCPUs = require('os').cpus().length

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }
} else {
  http.createServer((req, res) => {
    res.end('Worker: ' + process.pid)
  }).listen(3000)
}
```

---

## 八、性能优化

### 1. 避免阻塞主线程
```javascript
// 错误：同步读取大文件
const data = fs.readFileSync('./large-file.txt')

// 正确：异步读取
const data = await readFile('./large-file.txt', 'utf8')
```

### 2. 使用流处理大文件
```javascript
const readStream = fs.createReadStream('./large-file.txt')
const writeStream = fs.createWriteStream('./output.txt')

readStream.pipe(writeStream)
```

### 3. 缓存
```javascript
// 内存缓存
const cache = new Map()

function getData(key) {
  if (cache.has(key)) {
    return cache.get(key)
  }
  const data = fetchDataFromDB(key)
  cache.set(key, data)
  return data
}
```

### 4. 连接池
```javascript
const mysql = require('mysql2/promise')

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'test',
  waitForConnections: true,
  connectionLimit: 10
})

async function query(sql) {
  const [rows] = await pool.execute(sql)
  return rows
}
```

---

## 九、安全

### 1. 输入验证
```javascript
const validator = require('validator')

function validateEmail(email) {
  return validator.isEmail(email)
}
```

### 2. SQL 注入防护
```javascript
// 错误：拼接 SQL
const sql = `SELECT * FROM users WHERE name = '${name}'`

// 正确：使用参数化查询
const [rows] = await pool.execute(
  'SELECT * FROM users WHERE name = ?',
  [name]
)
```

### 3. XSS 防护
```javascript
const escape = require('escape-html')

function sanitizeInput(input) {
  return escape(input)
}
```

### 4. CORS
```javascript
const cors = require('cors')

app.use(cors({
  origin: 'https://example.com',
  credentials: true
}))
```

---

## 十、常见知识点

### 1. Node.js 是单线程的吗？
- **主线程**：单线程
- **底层**：多线程（libuv）
- **优点**：避免线程切换开销，提高并发性能

### 2. 什么是事件循环？
- Node.js 的核心机制
- 处理异步 I/O 事件
- 由 libuv 实现

### 3. process.nextTick 和 setImmediate 的区别？
- **process.nextTick**：在当前操作后立即执行（优先级更高）
- **setImmediate**：在 check 阶段执行

### 4. CommonJS 和 ESM 的区别？
- CommonJS：require/module.exports，运行时加载
- ESM：import/export，编译时加载

### 5. 什么是流（Stream）？
- 处理大数据的高效方式
- 分块读取和写入
- 四种流：Readable、Writable、Duplex、Transform

### 6. 如何处理错误？
- try/catch（同步）
- .catch()（Promise）
- error 事件（EventEmitter）
- uncaughtException/unhandledRejection（全局）

### 7. Node.js 如何处理并发？
- 单线程 + 事件循环
- 非阻塞 I/O
- 异步编程

### 8. 什么是 cluster？
- 多进程模式
- 利用多核 CPU
- 主进程管理工作进程

### 9. Buffer 的作用是什么？
- 处理二进制数据
- Node.js 处理文件、网络数据的基础

### 10. Node.js 适用场景有哪些？
- RESTful API
- 实时应用
- CLI 工具
- 自动化脚本
- 微服务
