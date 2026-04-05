# NestJS 后端开发

## 目录

---

## NestJS 简介

NestJS 是一个用于构建高效、可靠和可扩展的 Node.js 服务端应用的框架，深度整合 TypeScript，架构灵感来自 Angular。

### 核心特点

| 特性 | 说明 |
|------|------|
| **TypeScript 优先** | 完整 TS 支持，类型安全 |
| **模块化架构** | 清晰的模块边界，便于维护 |
| **依赖注入** | IoC 容器，解耦依赖 |
| **装饰器驱动** | 声明式编程，代码简洁 |
| **平台无关** | 支持 Express / Fastify |

### 与 Koa/Express 对比

| 维度 | Express/Koa | NestJS |
|------|-------------|--------|
| 学习曲线 | 低 | 中高 |
| 代码组织 | 自由 | 强约束（MVC） |
| TypeScript | 可用 | 原生支持 |
| 企业级功能 | 需自行集成 | 内置 |
| 测试支持 | 一般 | 优秀 |

---

## 快速开始

### 1. 安装脚手架

```bash
npm install -g @nestjs/cli
nest new my-nest-app
cd my-nest-app
npm run start:dev
```

### 2. 目录结构

```
my-nest-app/
├── src/
│   ├── main.ts              # 应用入口
│   ├── app.module.ts        # 根模块
│   ├── app.controller.ts    # 根控制器
│   ├── app.service.ts       # 根服务
│   └── modules/
│       ├── users/
│       │   ├── users.module.ts
│       │   ├── users.controller.ts
│       │   ├── users.service.ts
│       │   ├── dto/
│       │   │   ├── create-user.dto.ts
│       │   │   └── update-user.dto.ts
│       │   └── entities/
│       │       └── user.entity.ts
│       └── auth/
│           ├── auth.module.ts
│           ├── auth.controller.ts
│           └── auth.service.ts
├── test/
└── nest-cli.json
```

### 3. 主入口配置

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug']
  })

  // 全局前缀
  app.setGlobalPrefix('api/v1')

  // 全局管道：自动参数验证和转换
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,       // 过滤 DTO 中未声明的字段
    transform: true,       // 自动类型转换（string → number）
    forbidNonWhitelisted: true, // 多余字段直接报错
    transformOptions: {
      enableImplicitConversion: true
    }
  }))

  // 跨域
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
  })

  // Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API 接口文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('docs', app, document)

  const port = process.env.PORT || 3000
  await app.listen(port)
  Logger.log(`🚀 Server running on http://localhost:${port}`)
  Logger.log(`📖 API Docs: http://localhost:${port}/docs`)
}

bootstrap()
```

---

## 核心概念

### Module（模块）

```typescript
// src/modules/users/users.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { User } from './entities/user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User])], // 导入实体
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService] // 允许其他模块使用此服务
})
export class UsersModule {}
```

### Controller（控制器）

```typescript
// src/modules/users/users.controller.ts
import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, ParseIntPipe,
  HttpCode, HttpStatus, UseGuards
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'

@ApiTags('用户管理')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('keyword') keyword?: string
  ) {
    return this.usersService.findAll({ page, pageSize, keyword })
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '创建用户' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户（需要管理员权限）' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id)
  }
}
```

### Service（服务）

```typescript
// src/modules/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like } from 'typeorm'
import * as bcrypt from 'bcryptjs'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findAll(params: { page: number; pageSize: number; keyword?: string }) {
    const { page, pageSize, keyword } = params
    const [list, total] = await this.userRepository.findAndCount({
      where: keyword ? { username: Like(`%${keyword}%`) } : {},
      select: ['id', 'username', 'email', 'role', 'createdAt'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize
    })
    return { list, total, page, pageSize }
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'username', 'email', 'avatar', 'role']
    })
    if (!user) throw new NotFoundException(`用户 #${id} 不存在`)
    return user
  }

  async create(dto: CreateUserDto): Promise<User> {
    // 检查邮箱是否已存在
    const existing = await this.userRepository.findOneBy({ email: dto.email })
    if (existing) throw new ConflictException('邮箱已被注册')

    const user = this.userRepository.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10)
    })
    return this.userRepository.save(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'] // 包含 password 用于验证
    })
  }

  async update(id: number, dto: Partial<CreateUserDto>) {
    await this.findOne(id) // 确保用户存在
    await this.userRepository.update(id, dto)
    return this.findOne(id)
  }

  async remove(id: number) {
    await this.findOne(id)
    await this.userRepository.delete(id)
  }
}
```

### DTO（数据传输对象）

```typescript
// src/modules/users/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ description: '用户名', example: 'john_doe' })
  @IsString()
  @MinLength(3, { message: '用户名至少 3 个字符' })
  @MaxLength(50, { message: '用户名最多 50 个字符' })
  username: string

  @ApiProperty({ description: '邮箱', example: 'john@example.com' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string

  @ApiProperty({ description: '密码', minLength: 6 })
  @IsString()
  @MinLength(6, { message: '密码至少 6 位' })
  password: string

  @ApiPropertyOptional({ description: '头像 URL' })
  @IsString()
  @IsOptional()
  avatar?: string
}
```

---

## 模块开发实战

### 文章模块完整示例

```typescript
// src/modules/posts/entities/post.entity.ts
import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, ManyToMany, JoinTable,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Tag } from './tag.entity'

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 200 })
  title: string

  @Column('longtext')
  content: string

  @Column({ default: false })
  published: boolean

  @Column({ default: 0 })
  viewCount: number

  @ManyToOne(() => User, user => user.posts, { eager: false })
  author: User

  @Column()
  authorId: number

  @ManyToMany(() => Tag, { cascade: true, eager: true })
  @JoinTable({ name: 'post_tags' })
  tags: Tag[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
```

---

## 数据库集成

### TypeORM + MySQL 配置

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') === 'development', // 开发自动同步
        logging: config.get('NODE_ENV') === 'development',
        timezone: '+08:00'
      })
    })
  ]
})
export class AppModule {}
```

---

## 认证与授权

### JWT 认证

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
npm install -D @types/passport-jwt @types/passport-local
```

```typescript
// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { UsersService } from '../users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new UnauthorizedException('邮箱或密码错误')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new UnauthorizedException('邮箱或密码错误')

    const { password: _, ...result } = user
    return result
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role }
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
      user: { id: user.id, email: user.email, role: user.role }
    }
  }
}
```

```typescript
// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET')
    })
  }

  async validate(payload: any) {
    // payload 是 JWT 解码后的内容
    return { id: payload.sub, email: payload.email, role: payload.role }
  }
}
```

```typescript
// src/modules/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    )
    if (!requiredRoles) return true

    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.includes(user.role)
  }
}
```

---

## 异常处理

### 全局异常过滤器

```typescript
// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = '服务器内部错误'
    let errors: any = null

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse() as any
      message = exceptionResponse.message || exception.message
      errors = exceptionResponse.errors || null
    } else {
      this.logger.error('未处理的异常:', exception)
    }

    response.status(status).json({
      code: status,
      message,
      errors,
      path: request.url,
      timestamp: new Date().toISOString()
    })
  }
}
```

### 在 main.ts 注册

```typescript
app.useGlobalFilters(new AllExceptionsFilter())
```

---

## 测试

```typescript
// src/modules/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { UsersService } from './users.service'
import { User } from './entities/user.entity'

describe('UsersService', () => {
  let service: UsersService

  const mockRepository = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepository }
      ]
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('findOne 应该返回用户', async () => {
    const user = { id: 1, username: 'test', email: 'test@test.com' }
    mockRepository.findOne.mockResolvedValue(user)

    const result = await service.findOne(1)
    expect(result).toEqual(user)
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      select: expect.any(Array)
    })
  })

  it('findOne 用户不存在应该抛出 NotFoundException', async () => {
    mockRepository.findOne.mockResolvedValue(null)
    await expect(service.findOne(999)).rejects.toThrow('用户 #999 不存在')
  })
})
```

---

## 部署

### 生产构建

```bash
npm run build
node dist/main.js
```

### PM2 部署

```bash
npm install -g pm2
pm2 start dist/main.js --name "nest-app" -i max
pm2 save
pm2 startup
```

### Dockerfile

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main.js"]
```
