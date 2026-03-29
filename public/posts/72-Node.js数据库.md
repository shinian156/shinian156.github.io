# Node.js 数据库开发

## 目录
1. [数据库选型](#数据库选型)
2. [MySQL 集成](#mysql-集成)
3. [MongoDB 集成](#mongodb-集成)
4. [Redis 集成](#redis-集成)
5. [ORM 框架 Sequelize](#orm-框架-sequelize)
6. [ORM 框架 Prisma](#orm-框架-prisma)
7. [数据库最佳实践](#数据库最佳实践)

---

## 数据库选型

### 常用数据库对比

| 数据库 | 类型 | 适用场景 |
|--------|------|---------|
| **MySQL** | 关系型 | 业务数据、事务、复杂查询 |
| **PostgreSQL** | 关系型 | 复杂查询、JSON 支持、高并发 |
| **MongoDB** | 文档型 | 灵活结构、大量读写、日志 |
| **Redis** | 键值型 | 缓存、Session、消息队列 |
| **SQLite** | 嵌入式 | 本地存储、桌面应用、测试 |

---

## MySQL 集成

### 1. 安装驱动

```bash
npm install mysql2
npm install -D @types/mysql2
```

### 2. 连接池配置

```typescript
// db/mysql.ts
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,      // 最大连接数
  queueLimit: 0,
  timezone: '+08:00',       // 时区
  charset: 'utf8mb4'        // 支持 emoji
})

// 测试连接
export async function testConnection() {
  try {
    const conn = await pool.getConnection()
    console.log('✅ MySQL 连接成功')
    conn.release()
  } catch (err) {
    console.error('❌ MySQL 连接失败:', err)
    process.exit(1)
  }
}

export default pool
```

### 3. 基础 CRUD

```typescript
// db/user.ts
import pool from './mysql'

interface User {
  id?: number
  username: string
  email: string
  password: string
  created_at?: Date
}

// 查询列表（分页）
export async function getUsers(page = 1, pageSize = 10) {
  const offset = (page - 1) * pageSize
  const [rows] = await pool.execute<any[]>(
    'SELECT id, username, email, created_at FROM users LIMIT ? OFFSET ?',
    [pageSize, offset]
  )
  const [countResult] = await pool.execute<any[]>(
    'SELECT COUNT(*) AS total FROM users'
  )
  return {
    list: rows,
    total: countResult[0].total,
    page,
    pageSize
  }
}

// 根据 ID 查询
export async function getUserById(id: number) {
  const [rows] = await pool.execute<any[]>(
    'SELECT id, username, email FROM users WHERE id = ?',
    [id]
  )
  return rows[0] || null
}

// 创建用户
export async function createUser(user: User) {
  const [result] = await pool.execute<any>(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [user.username, user.email, user.password]
  )
  return result.insertId
}

// 更新用户
export async function updateUser(id: number, data: Partial<User>) {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ')
  const values = [...Object.values(data), id]
  const [result] = await pool.execute<any>(
    `UPDATE users SET ${fields} WHERE id = ?`,
    values
  )
  return result.affectedRows > 0
}

// 删除用户
export async function deleteUser(id: number) {
  const [result] = await pool.execute<any>(
    'DELETE FROM users WHERE id = ?',
    [id]
  )
  return result.affectedRows > 0
}
```

### 4. 事务处理

```typescript
// 转账示例 - 需要事务保证原子性
export async function transfer(fromId: number, toId: number, amount: number) {
  const conn = await pool.getConnection()
  
  try {
    await conn.beginTransaction()

    // 检查余额
    const [fromRows] = await conn.execute<any[]>(
      'SELECT balance FROM accounts WHERE id = ? FOR UPDATE',
      [fromId]
    )
    
    if (fromRows[0].balance < amount) {
      throw new Error('余额不足')
    }

    // 扣款
    await conn.execute(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [amount, fromId]
    )

    // 收款
    await conn.execute(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, toId]
    )

    // 记录流水
    await conn.execute(
      'INSERT INTO transactions (from_id, to_id, amount) VALUES (?, ?, ?)',
      [fromId, toId, amount]
    )

    await conn.commit()
    return true

  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}
```

---

## MongoDB 集成

### 1. 安装 Mongoose

```bash
npm install mongoose
npm install -D @types/mongoose
```

### 2. 连接配置

```typescript
// db/mongodb.ts
import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/myapp'

export async function connectMongoDB() {
  try {
    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10
    })
    console.log('✅ MongoDB 连接成功')
  } catch (err) {
    console.error('❌ MongoDB 连接失败:', err)
    process.exit(1)
  }
}

// 连接事件监听
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB 连接断开，尝试重连...')
})
```

### 3. 定义 Schema 和 Model

```typescript
// models/Article.ts
import mongoose, { Schema, Document } from 'mongoose'

export interface IArticle extends Document {
  title: string
  content: string
  tags: string[]
  author: mongoose.Types.ObjectId
  viewCount: number
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

const ArticleSchema = new Schema<IArticle>({
  title: {
    type: String,
    required: [true, '标题不能为空'],
    trim: true,
    maxlength: [200, '标题最长 200 字符']
  },
  content: {
    type: String,
    required: true
  },
  tags: [{ type: String, lowercase: true }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  viewCount: { type: Number, default: 0 },
  isPublished: { type: Boolean, default: false }
}, {
  timestamps: true,  // 自动添加 createdAt/updatedAt
  versionKey: false
})

// 索引
ArticleSchema.index({ title: 'text', content: 'text' }) // 全文索引
ArticleSchema.index({ author: 1, createdAt: -1 })
ArticleSchema.index({ tags: 1 })

// 虚拟字段
ArticleSchema.virtual('summary').get(function() {
  return this.content.substring(0, 200) + '...'
})

// 中间件：删除前清理关联数据
ArticleSchema.pre('deleteOne', async function() {
  const docId = this.getFilter()._id
  await mongoose.model('Comment').deleteMany({ articleId: docId })
})

const Article = mongoose.model<IArticle>('Article', ArticleSchema)
export default Article
```

### 4. MongoDB CRUD

```typescript
// services/article.service.ts
import Article, { IArticle } from '../models/Article'

// 查询（分页 + 过滤）
export async function getArticles(query: {
  page?: number
  pageSize?: number
  tag?: string
  keyword?: string
}) {
  const { page = 1, pageSize = 10, tag, keyword } = query
  const filter: any = { isPublished: true }

  if (tag) filter.tags = tag
  if (keyword) filter.$text = { $search: keyword }

  const [list, total] = await Promise.all([
    Article.find(filter)
      .populate('author', 'username avatar')  // 关联查询作者信息
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean(),  // 返回普通对象，性能更好
    Article.countDocuments(filter)
  ])

  return { list, total, page, pageSize }
}

// 增加阅读量（原子操作）
export async function incrementViewCount(id: string) {
  return Article.findByIdAndUpdate(
    id,
    { $inc: { viewCount: 1 } },
    { new: true }  // 返回更新后的文档
  )
}

// 聚合统计
export async function getTagStats() {
  return Article.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 }
  ])
}
```

---

## Redis 集成

### 1. 安装 ioredis

```bash
npm install ioredis
npm install -D @types/ioredis
```

### 2. 连接配置

```typescript
// db/redis.ts
import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  db: 0,
  retryStrategy: (times) => Math.min(times * 50, 2000), // 重连策略
  maxRetriesPerRequest: 3
})

redis.on('connect', () => console.log('✅ Redis 连接成功'))
redis.on('error', (err) => console.error('❌ Redis 错误:', err))

export default redis
```

### 3. 缓存封装

```typescript
// utils/cache.ts
import redis from '../db/redis'

/**
 * 通用缓存装饰器
 * @param key 缓存键
 * @param ttl 过期时间（秒）
 * @param fetcher 数据获取函数
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  // 先查缓存
  const cached = await redis.get(key)
  if (cached) {
    return JSON.parse(cached)
  }

  // 缓存未命中，查数据库
  const data = await fetcher()

  // 写入缓存
  await redis.setex(key, ttl, JSON.stringify(data))

  return data
}

/**
 * 删除缓存（支持模糊匹配）
 */
export async function invalidateCache(pattern: string) {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) {
    await redis.del(...keys)
  }
}

// 使用示例
export async function getCachedUserById(id: number) {
  return withCache(
    `user:${id}`,
    300, // 5 分钟
    () => getUserById(id)
  )
}
```

### 4. Session 管理

```typescript
// 使用 Redis 存储 Session（Koa2）
import Koa from 'koa'
import session from 'koa-session'
import RedisStore from 'koa-redis'
import redis from './db/redis'

const app = new Koa()
app.keys = [process.env.SESSION_SECRET || 'your-secret']

app.use(session({
  key: 'sess',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
  store: RedisStore({ client: redis }),
  rolling: true,   // 每次请求重置过期时间
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production'
}, app))
```

### 5. 分布式锁

```typescript
// 防止并发重复操作（如重复提交）
export async function withLock<T>(
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  const lockKey = `lock:${key}`
  const lockValue = Date.now().toString()

  // 尝试获取锁（NX = 不存在才设置）
  const acquired = await redis.set(lockKey, lockValue, 'EX', ttl, 'NX')

  if (!acquired) {
    throw new Error('操作太频繁，请稍后再试')
  }

  try {
    return await fn()
  } finally {
    // 释放锁（Lua 脚本保证原子性）
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `
    await redis.eval(script, 1, lockKey, lockValue)
  }
}
```

---

## ORM 框架 Sequelize

### 1. 安装

```bash
npm install sequelize mysql2
npm install -D sequelize-cli @types/sequelize
```

### 2. 初始化

```typescript
// db/sequelize.ts
import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: { max: 10, min: 0, idle: 30000 },
  timezone: '+08:00'
})
```

### 3. 定义模型

```typescript
// models/User.ts
import { Model, DataTypes, Optional } from 'sequelize'
import { sequelize } from '../db/sequelize'
import bcrypt from 'bcryptjs'

interface UserAttributes {
  id: number
  username: string
  email: string
  password: string
  avatar: string | null
  role: 'admin' | 'user'
  isActive: boolean
  createdAt?: Date
  updatedAt?: Date
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'avatar' | 'role' | 'isActive'>

class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  declare id: number
  declare username: string
  declare email: string
  declare password: string
  declare avatar: string | null
  declare role: 'admin' | 'user'
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date

  // 实例方法：验证密码
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password)
  }
}

User.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  password: { type: DataTypes.STRING(255), allowNull: false },
  avatar: { type: DataTypes.STRING(500), defaultValue: null },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  sequelize,
  tableName: 'users',
  hooks: {
    // 保存前自动加密密码
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 10)
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10)
      }
    }
  }
})

export default User
```

---

## ORM 框架 Prisma

> Prisma 是目前 Node.js 生态中最现代的 ORM，类型安全、开发体验极佳。

### 1. 安装与初始化

```bash
npm install prisma @prisma/client
npx prisma init  # 生成 prisma/schema.prisma
```

### 2. 定义 Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        Int       @id @default(autoincrement())
  username  String    @unique @db.VarChar(50)
  email     String    @unique
  password  String
  avatar    String?
  role      Role      @default(USER)
  isActive  Boolean   @default(true)
  posts     Post[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([email])
  @@map("users")
}

model Post {
  id          Int      @id @default(autoincrement())
  title       String   @db.VarChar(200)
  content     String   @db.LongText
  published   Boolean  @default(false)
  viewCount   Int      @default(0)
  author      User     @relation(fields: [authorId], references: [id])
  authorId    Int
  tags        Tag[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([authorId, createdAt])
  @@map("posts")
}

model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]

  @@map("tags")
}

enum Role {
  ADMIN
  USER
}
```

### 3. 生成客户端和迁移

```bash
# 生成 Prisma Client
npx prisma generate

# 创建并应用数据库迁移
npx prisma migrate dev --name init

# 查看数据库（可视化）
npx prisma studio
```

### 4. Prisma CRUD 示例

```typescript
// services/post.service.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : []
})

// 查询文章（关联查询）
export async function getPosts(params: {
  page?: number
  pageSize?: number
  authorId?: number
  keyword?: string
}) {
  const { page = 1, pageSize = 10, authorId, keyword } = params

  const where = {
    published: true,
    ...(authorId && { authorId }),
    ...(keyword && {
      OR: [
        { title: { contains: keyword } },
        { content: { contains: keyword } }
      ]
    })
  }

  const [posts, total] = await prisma.$transaction([
    prisma.post.findMany({
      where,
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        tags: { select: { id: true, name: true } },
        _count: { select: { tags: true } }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }),
    prisma.post.count({ where })
  ])

  return { list: posts, total, page, pageSize }
}

// 创建文章（含标签关联）
export async function createPost(data: {
  title: string
  content: string
  authorId: number
  tagNames: string[]
}) {
  const { tagNames, ...postData } = data

  return prisma.post.create({
    data: {
      ...postData,
      tags: {
        connectOrCreate: tagNames.map(name => ({
          where: { name },
          create: { name }
        }))
      }
    },
    include: { tags: true }
  })
}
```

---

## 数据库最佳实践

### 1. 环境变量管理

```bash
# .env
DATABASE_URL="mysql://user:password@localhost:3306/myapp"
MONGO_URI="mongodb://localhost:27017/myapp"
REDIS_HOST="localhost"
REDIS_PORT="6379"
```

### 2. 数据库连接池监控

```typescript
// 定期检查连接健康
setInterval(async () => {
  try {
    await pool.execute('SELECT 1')
  } catch (err) {
    console.error('数据库连接异常:', err)
    // 告警通知
  }
}, 30000)
```

### 3. SQL 注入防护

```typescript
// ❌ 错误：字符串拼接（SQL 注入风险）
const sql = `SELECT * FROM users WHERE username = '${username}'`

// ✅ 正确：参数化查询
const [rows] = await pool.execute(
  'SELECT * FROM users WHERE username = ?',
  [username]
)
```

### 4. 索引优化要点

```sql
-- 为常用查询字段添加索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_post_author_time ON posts(author_id, created_at);

-- 复合索引注意最左前缀原则
-- 以下查询可以命中 idx_post_author_time
SELECT * FROM posts WHERE author_id = 1 ORDER BY created_at DESC;

-- 以下查询无法命中（缺少 author_id 条件）
SELECT * FROM posts ORDER BY created_at DESC;
```
