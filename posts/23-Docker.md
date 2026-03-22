# Docker 容器化部署核心知识

## 1. Docker 基础概念

### 1.1 什么是 Docker？
Docker 是一个开源的应用容器引擎，基于 Go 语言开发，可以让开发者打包应用以及依赖包到一个轻量级、可移植的容器中，然后发布到任何流行的 Linux 机器上。

### 1.2 核心概念

#### 镜像（Image）
- Docker 镜像是一个只读的模板
- 可以用来创建 Docker 容器
- 类似于面向对象编程中的类

#### 容器（Container）
- Docker 容器是从镜像创建的运行实例
- 类似于面向对象编程中的对象
- 可以被启动、停止、删除

#### 仓库（Repository）
- 仓库是集中存放镜像文件的场所
- 类似于代码仓库
- Docker Hub 是最大的公共仓库

### 1.3 Docker 的优势
- **快速交付**：快速构建和部署应用
- **环境一致性**：开发、测试、生产环境一致
- **资源隔离**：进程、网络、存储隔离
- **轻量级**：相比虚拟机，占用资源更少
- **可移植性**：一次构建，到处运行

## 2. Docker 安装和基本命令

### 2.1 常用命令

#### 镜像操作
```bash
# 拉取镜像
docker pull nginx

# 查看镜像
docker images
docker images nginx

# 删除镜像
docker rmi nginx

# 构建镜像
docker build -t nginx:test .

# 查看镜像详细信息
docker inspect nginx
```

#### 容器操作
```bash
# 启动容器
docker run -p 80:80 -v $PWD/www:/usr/share/nginx/html nginx

# 后台启动
docker run -d nginx

# 查看运行中的容器
docker ps

# 查看所有容器
docker ps -a

# 停止容器
docker stop <container_id>

# 启动已停止的容器
docker start <container_id>

# 删除容器
docker rm <container_id>

# 进入容器
docker exec -it <container_id> /bin/bash
```

#### 日志查看
```bash
# 查看容器日志
docker logs <container_id>

# 实时查看日志
docker logs -f <container_id>

# 查看最后100行日志
docker logs --tail 100 <container_id>
```

## 3. Dockerfile

### 3.1 Dockerfile 是什么？
Dockerfile 是一个用来构建镜像的文本文件，包含了一系列构建镜像所需的指令。

### 3.2 常用指令

#### FROM
指定基础镜像
```dockerfile
FROM nginx
FROM node:14-alpine
FROM ubuntu:20.04
```

#### RUN
执行命令
```dockerfile
RUN echo 'hello' > /test.txt
RUN npm install
RUN apt-get update && apt-get install -y vim
```

#### WORKDIR
设置工作目录
```dockerfile
WORKDIR /usr/src/app
```

#### COPY 和 ADD
复制文件到镜像
```dockerfile
# COPY：复制文件
COPY . /usr/src/app

# ADD：支持 URL 和自动解压
ADD https://example.com/file.tar.gz /usr/src/
ADD archive.tar.gz /usr/src/
```

#### EXPOSE
声明容器运行时监听的端口
```dockerfile
EXPOSE 80
EXPOSE 3000
```

#### CMD 和 ENTRYPOINT
容器启动时执行的命令
```dockerfile
# CMD：可以被 docker run 参数覆盖
CMD ["npm", "start"]

# ENTRYPOINT：不能被覆盖，只能追加参数
ENTRYPOINT ["node", "server.js"]
```

#### ENV
设置环境变量
```dockerfile
ENV NODE_ENV=production
ENV PORT=3000
```

#### ARG
构建参数
```dockerfile
ARG NODE_VERSION=14
FROM node:${NODE_VERSION}
```

#### VOLUME
定义匿名卷
```dockerfile
VOLUME ["/data"]
VOLUME /var/log
```

### 3.3 实战示例

#### Node.js 应用
```dockerfile
FROM node:14-alpine

WORKDIR /usr/src/app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm install --production

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
```

#### Nginx 静态站点
```dockerfile
FROM nginx

# 复制配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 复制静态文件
COPY dist/ /usr/share/nginx/html/

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
```

#### 多阶段构建
```dockerfile
# 构建阶段
FROM node:14 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.4 .dockerignore
类似于 .gitignore，排除不需要的文件
```bash
node_modules
dist
.git
.env
npm-debug.log
```

## 4. Docker Compose

### 4.1 什么是 Docker Compose？
Docker Compose 是用于定义和运行多容器 Docker 应用程序的工具。

### 4.2 常用命令
```bash
# 启动所有服务
docker-compose up

# 后台启动
docker-compose up -d

# 停止所有服务
docker-compose down

# 查看服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs app

# 构建镜像
docker-compose build

# 重新构建并启动
docker-compose up -d --build

# 查看运行状态
docker-compose ps
```

### 4.3 docker-compose.yml 示例

#### 基础配置
```yaml
version: '3.8'

services:
  app:
    build: ./app
    ports:
      - "3000:3000"
    depends_on:
      - db

  db:
    image: postgres:13
    environment:
      POSTGRES_PASSWORD: example
    volumes:
      - db-data:/var/lib/postgresql/data

volumes:
  db-data:
```

#### 完整的前后端项目
```yaml
version: '3.1'

services:
  # 后端服务
  app:
    container_name: node-app
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/myapp
    depends_on:
      - mongo
    volumes:
      - ./backend:/usr/src/app

  # 前端服务
  nginx:
    container_name: web-nginx
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/conf.d:/etc/nginx/conf.d
      - ./frontend/dist:/usr/share/nginx/html
      - ./static:/static
    depends_on:
      - app

  # MongoDB 数据库
  mongo:
    image: mongo:4.4
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  # Redis 缓存
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  mongo-data:
```

## 5. 数据管理

### 5.1 数据卷（Volume）
```bash
# 创建数据卷
docker volume create my-vol

# 查看数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect my-vol

# 删除数据卷
docker volume rm my-vol
```

### 5.2 挂载目录
```bash
# 挂载本地目录
docker run -v /host/path:/container/path nginx

# 只读挂载
docker run -v /host/path:/container/path:ro nginx

# 匿名卷
docker run -v /data nginx

# 命名卷
docker run -v my-vol:/data nginx
```

## 6. 网络管理

### 6.1 查看网络
```bash
docker network ls
```

### 6.2 创建网络
```bash
docker network create my-network
```

### 6.3 连接容器到网络
```bash
docker network connect my-network container1
```

### 6.4 断开容器
```bash
docker network disconnect my-network container1
```

## 7. 部署实战

### 7.1 单容器部署
```bash
# 1. 构建镜像
docker build -t my-app .

# 2. 运行容器
docker run -d -p 80:3000 --name my-app my-app
```

### 7.2 多容器部署
```bash
# 使用 docker-compose
docker-compose up -d
```

### 7.3 CI/CD 集成
```yaml
# .github/workflows/docker.yml
name: Docker CI

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker image
        run: docker build -t my-app .
      - name: Push to Docker Hub
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push my-username/my-app
```

## 8. 最佳实践

### 8.1 镜像优化
- 使用 Alpine 基础镜像减小体积
- 多阶段构建
- 合并 RUN 指令
- 清理缓存
- 使用 .dockerignore

### 8.2 安全最佳实践
- 使用官方基础镜像
- 定期更新镜像
- 最小化容器权限
- 扫描镜像漏洞
- 不在镜像中存储敏感信息

### 8.3 生产环境配置
- 健康检查
- 资源限制
- 日志管理
- 监控告警

### 8.4 容器编排
```dockerfile
# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/health || exit 1
```

## 9. 面试高频题

### Q1: Docker 和虚拟机的区别？
- **架构**：Docker 共享宿主机内核，虚拟机有独立内核
- **启动速度**：Docker 秒级启动，虚拟机分钟级
- **资源占用**：Docker 轻量，虚拟机重量级
- **隔离性**：虚拟机强隔离，Docker 进程级隔离
- **性能**：Docker 接近原生，虚拟机有损耗

### Q2: CMD 和 ENTRYPOINT 的区别？
- **CMD**：可以被 docker run 参数覆盖
- **ENTRYPOINT**：不能被覆盖，只能追加参数
- 同时存在时，CMD 会作为 ENTRYPOINT 的参数

### Q3: COPY 和 ADD 的区别？
- **COPY**：只支持本地文件复制
- **ADD**：支持 URL 和自动解压 tar 包
- 优先使用 COPY，除非需要 URL 或自动解压

### Q4: 如何优化镜像大小？
- 使用 Alpine 基础镜像
- 多阶段构建
- 合并 RUN 指令
- 清理不必要的文件
- 使用 .dockerignore

### Q5: 如何实现容器的持久化存储？
- 使用数据卷（Volume）
- 挂载主机目录（Bind Mount）
- 使用存储驱动

### Q6: 如何调试容器？
- 查看容器日志：`docker logs`
- 进入容器：`docker exec -it <container> /bin/bash`
- 查看容器进程：`docker top`
- 查看容器资源使用：`docker stats`

## 10. 进阶技巧

### 10.1 Docker 命名空间
Docker 利用 Linux 命名空间实现隔离：
- PID 命名空间：进程隔离
- NET 命名空间：网络隔离
- MNT 命名空间：文件系统隔离
- UTS 命名空间：主机名隔离
- IPC 命名空间：信号量隔离

### 10.2 Docker Cgroups
控制组（Cgroups）用于资源限制：
- CPU 限制
- 内存限制
- 磁盘 I/O 限制

### 10.3 Docker 存储
- UnionFS：联合文件系统
- 分层存储
- Copy-on-Write（写时复制）

### 10.4 容器编排
- Docker Swarm
- Kubernetes
- Nomad

## 11. 总结

Docker 容器化部署是现代 DevOps 的核心技能，需要掌握：
- Docker 基本概念和命令
- Dockerfile 编写
- Docker Compose 使用
- 数据和网络管理
- 镜像优化
- CI/CD 集成

推荐资源：
- Docker 官方文档：https://docs.docker.com/
- Docker 入门教程：https://www.runoob.com/docker/docker-tutorial.html
- Docker 实践：https://vuepress.mirror.docker-practice.com/
