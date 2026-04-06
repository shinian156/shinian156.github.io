# Frontend Blog - 长期记忆

## 项目概述
- 项目路径：`D:\v3\frontend-blog`
- 技术栈：Vue 3 + Vite + TypeScript + marked + highlight.js
- 文章存放：`posts/` 和 `public/posts/`（两处需同步）
- 文章编号：当前最大 80，下次从 81 开始
- **目录实现方式**：手动在 Markdown 文件中编写（不是自动生成）
- **Git 提交状态**：已推送至 GitHub，最新提交 `5f3c72a`（修复 21 篇文章空目录）

## 项目结构
- `src/components/Sidebar.vue` - PC端侧边栏导航（含分类和文章列表）
- `src/components/MobileNav.vue` - 移动端底部导航抽屉
- `src/views/Article.vue` - 文章页，含 `categoryMap` 分类映射、文章目录功能
- `src/views/Home.vue` - 首页文章列表（categories 数据）
- 新增文章必须同时更新：Sidebar.vue、MobileNav.vue、Article.vue categoryMap、Home.vue categories、public/posts/ 目录

## 分类结构（截至 2026-03-28）
| 分类 | 图标 | 代表文章编号 |
|------|------|------------|
| 前端框架 | 🎯 | 01,05,02,73(SSR),78(通用组件),06,03,04 |
| 前端 CSS/JS 库 | 🎨 | 31,32,33,34,35,79(form-create),36(VueUse),37,38 |
| 前端性能优化 | ⚡ | 18,19 |
| **构建与打包** | ⚡ | 20(包管理),75(Webpack),76(Vite),77(Rollup) |
| **微前端** | 🧩 | 66,67 |
| App 开发 | 📱 | 27,28,22,68,69,70 |
| JavaScript 核心 | ⚡ | 06,07,08 |
| TypeScript | 📘 | 09,10,80(常用实战用法) |
| 数据可视化 | 📊 | 13,14,15 |
| AI 与机器学习 | 🤖 | 16,17 |
| Node.js | 🟢 | 11,12,74(Nest),39,60,72(DB) |
| **Node.js 桌面端** | 🖥️ | 71(Electron) |
| Python | 🐍 | 25,26,26B |
| Linux | 💻 | 43-47 |
| 容器化部署 | 🐳 | 23,24 |
| Git 与 GitHub | 🔀 | 40,41,42,62 |
| 数据结构与算法 | 📐 | 48-52 |
| 前端常用设计模式 | 🔧 | 61 |
| Kali 及渗透 | 🛠️ | 53-58 |
| 股票分析 | 📈 | 29,30,62,63,64,65 |

## 股票筛选系统（独立项目，记忆保留）
- picks_service.py 顶部 DATA_SOURCE 配置：eastmoney（推荐）/ akshare
- em_data_service.py - 东方财富数据接口
- em_pool_service.py - 东财候选池服务
- Git标签 v1.0-akshare-stable 为akshare最后稳定版 (ID: 46461310)

## 新建项目：AI Agent 网站（2026-04-02）
- 项目路径：`D:\v3\ai-agent-project`
- 目录结构：
  - `frontend/` - 前端网站（HTML/CSS/JS，响应式 PC/移动端）
  - `backend/` - 后端服务（Flask + LangChain）
  - `docs/` - 开发文档和教程
- 技术栈：Flask + LangChain + OpenAI + FAISS
- 功能：Agent 智能体、工具系统、RAG 检索、记忆系统
- **商业化功能（新增）**：
  - `models.py` - 用户、交易、套餐数据模型
  - `points_service.py` - 积分服务（定价、VIP折扣）
  - `payment_service.py` - 支付服务（支付宝/微信/爱发电/手动）
  - 套餐系统：¥1(100积分) / ¥8(1050积分) / ¥20(3200积分) / ¥99(23000积分)
- 开发教程：见 `docs/教程.html`（完整商业化方案）

## 股票分析 AI Agent（2026-04-02）
- 项目路径：`D:\v3\ai-agent-project\stock-agent`
- **数据源**：新浪财经（东方财富被封）
- **后端 MVC 架构**（Flask，端口5001）：
  - `views/stock.py` - 数据API（搜索/实时/K线）
  - `views/analysis.py` - AI分析API
  - `services/stock_service.py` - 新浪数据服务
  - `services/ai_service.py` - 阿里云百炼
- **特点**：只支持个股分析，无批量接口（避免被封）
- **API接口**：
  - `GET /api/stock/search?keyword=茅台`
  - `GET /api/stock/realtime/600519`
  - `GET /api/stock/kline/600519`
  - `GET /api/analysis/technical/600519`
  - `GET /api/analysis/comprehensive/600519`
- **开发文档**：`docs/开发文档.html`
