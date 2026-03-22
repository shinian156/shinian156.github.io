# Frontend Tech Knowledge Base

前端技术知识库 - 包含完整的前端开发核心知识和技术文章

## 在线访问

**网站地址**: https://shinian156.github.io/

## 项目介绍

这是一个基于 Vue 3 + TypeScript + Vite 构建的前端技术知识库，包含 **60+ 篇**完整的前端开发核心知识，涵盖 **19 个技术领域**。

## 技术栈

- **Vue 3.4+** - 渐进式 JavaScript 框架
- **TypeScript 5.3+** - JavaScript 超集
- **Vite 5.0+** - 新一代构建工具
- **Vue Router 4.2+** - 官方路由管理器

## 核心知识分类 (19个领域)

### 前端框架
- Vue 核心知识
- Vue Router
- Vuex 与 Pinia 对比
- Vue 组件库开发
- Vue2 源码解析
- Vue3 源码解析

### 前端 CSS/JS 库
- TailwindCSS
- CSS 动画库
- Lodash & Underscore
- Day.js & Moment.js
- Axios & Fetch
- VueUse 工具库
- Swiper 轮播库
- 常用工具函数库

### JavaScript 核心
- JavaScript 基础
- JavaScript 高级特性
- ES6 新特性

### TypeScript
- TypeScript 基础
- TypeScript 进阶

### Node.js
- Node.js 基础
- Koa2 后端开发
- Node.js 搭建 CLI
- Vue3 CLI 从 0 到 1

### 数据可视化
- ECharts 数据可视化
- 数据大屏开发
- 三维 GIS 开发

### AI 与机器学习
- TensorFlow.js
- 主流 AI 开发工具对比

### Python
- Python 基础
- Flask 最佳实战
- 爬虫最佳实战

### 容器化部署
- Docker 容器化
- Docker 集成 Jenkins

### Linux
- Linux 入门
- Linux 常用命令
- Linux 用户与权限
- Linux 进程与服务管理
- Linux 网络配置

### Git 与 GitHub
- Git 与 GitHub 基础
- GitHub 协作流程
- Git 高级操作与 Hooks
- GitHub 部署流程

### 数据结构与算法
- 数组与链表
- 栈与队列
- 树与图
- 排序算法
- 动态规划

### 前端常用设计模式
- 创建型模式（单例、工厂、建造者）
- 结构型模式（装饰器、适配器、代理）
- 行为型模式（观察者、策略、命令、迭代器）
- 架构型模式（MVC、MVVM、Flux）

### App 开发
- uni-app 跨平台开发
- Flutter 开发
- App 上架应用商店流程

### 构建与打包
- npm、pnpm、npx、yarn
- 构建工具（Webpack、Vite）

### 前端性能优化
- 前端性能优化
- 代码规范

### Kali 及渗透
- Kali Linux 入门
- 信息收集与侦察
- 漏洞扫描与利用
- Web 渗透测试
- 密码攻击与破解
- 社会工程学攻防

### 量化交易
- 量化交易入门
- 量化交易策略实战

## 快速开始

### 环境要求
- Node.js 18.0+
- npm 9.0+ 或 pnpm 8.0+

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:5173 查看博客

### 构建生产版本
```bash
npm run build
```

## 项目结构

```
frontend-blog/
├── public/posts/      # 技术文章（实际服务目录）
├── posts/             # 技术文章备份
├── src/
│   ├── components/    # 组件 (Header/Footer/Sidebar/MobileNav)
│   ├── views/         # 页面 (Home/Article/About)
│   └── router/        # 路由配置
├── .github/
│   └── workflows/     # CI/CD 配置 (自动部署到 GitHub Pages)
└── package.json
```

## 部署说明

本项目已配置 GitHub Actions 自动部署：

1. 推送代码到 main 分支
2. 自动触发构建和部署
3. 部署到 GitHub Pages

详细部署流程请参考：[GitHub 部署流程](./public/posts/62-GitHub部署流程.md)

## 适用场景

- 面试准备 - 系统化学习前端技术
- 日常学习 - 查阅技术文档
- 团队培训 - 作为团队学习资料
- 项目参考 - 开发过程中查阅技术方案

## 许可证

MIT License

---

**开始你的前端技术学习之旅！**
