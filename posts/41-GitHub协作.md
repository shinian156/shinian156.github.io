# GitHub 协作流程完整指南

> GitFlow 分支策略、Pull Request、Code Review 与团队协作

## 目录
- [一、分支策略概述](#分支策略概述)
- [二、GitFlow 完整流程](#gitflow-完整流程)
- [三、团队协作规范](#团队协作规范)
- [四、保护分支设置](#保护分支设置)
- [五、GitHub Actions CI/CD](#github-actions-cicd)
- [六、GitHub Issues 与项目管理](#github-issues-与项目管理)
- [Bug 描述](#bug-描述)
- [复现步骤](#复现步骤)
- [期望行为](#期望行为)
- [截图](#截图)
- [环境信息](#环境信息)
- [七、常用协作命令速查](#常用协作命令速查)

---


## 一、分支策略概述

### GitFlow 工作流

```
main/master ───●────●────●────●────●────●──── (稳定版本，只接受合并)
                  ↖           ↗
               develop ───●────●────●────●──── (开发分支)
                       ↗           ↖
                    feature/xxx   release/v1.0
                    (功能分支)      (发布分支)
```

**核心分支：**
- `main`：生产环境代码，只能通过 PR 合并
- `develop`：开发分支，所有功能合并到这里
- `feature/*`：功能分支，从 develop 拉取
- `release/*`：发布分支，从 develop 拉取，用于上线前修复
- `hotfix/*`：热修复分支，从 main 拉取，用于紧急修复生产问题

---

## 二、GitFlow 完整流程

### 1. 开发新功能

```bash
# 从 develop 创建功能分支
git checkout develop
git pull origin develop
git checkout -b feature/user-login

# 开发完成后，提交到远程
git add .
git commit -m "feat: 实现用户登录功能"
git push -u origin feature/user-login
```

### 2. Pull Request 流程

```
1. Push 到 GitHub 后，页面显示 "Compare & pull request" 按钮
2. 点击创建 PR，选择 base: develop ← compare: feature/user-login
3. 填写 PR 描述（标题 + 内容）
4. 指定 Reviewers（代码审查人）
5. 关联 Issue（可选）
6. 创建 PR
```

### 3. Code Review

**Reviewer 操作：**
- 查看文件变更（Files changed）
- 单行或范围评论（点击行号旁的 +）
- 批准（Approve）或请求修改（Request changes）
- 合并（Merge）前至少需要 1-2 个 Approve

**常见评论示例：**
```markdown
<!-- 单行评论 -->
这个函数是否可以抽取为工具函数复用？

<!-- 建议 -->
```suggestion
const formatDate = (date) => dayjs(date).format('YYYY-MM-DD')
```
建议用 Day.js 统一处理日期格式化。

<!-- 提问 -->
这段逻辑是否考虑了空值情况？
```

### 4. 合并与清理

```bash
# 合并完成后，删除功能分支
git checkout develop
git pull origin develop
git branch -d feature/user-login           # 删除本地
git push origin --delete feature/user-login  # 删除远程
```

---

## 三、团队协作规范

### Commit Message 规范（Conventional Commits）

```bash
# 格式：<type>(<scope>): <subject>
# type: feat | fix | docs | style | refactor | test | chore

feat(auth): 添加用户登录功能
fix(api): 修复列表接口数据丢失问题
docs: 更新 README 使用说明
style(ui): 调整按钮间距
refactor(utils): 重构工具函数
test(unit): 添加单元测试
chore(deps): 升级 Vue 到 3.4
```

### 分支命名规范

```bash
feature/user-login          # 新功能
feature/shopping-cart
fix/login-redirect          # Bug 修复
hotfix/payment-crash        # 热修复
release/v1.2.0              # 发布分支
bugfix/order-display        # 普通修复
```

---

## 四、保护分支设置

**Settings → Branches → Add branch protection rule**

```
✅ Protect matching branches
   Branch name pattern: main

   ✅ Require a pull request before merging
       → Require approvals: 2
       → Dismiss stale approvals
       → Require review from Code Owners
   ✅ Require status checks to pass before merging
       → 添加 CI 检查项（如 lint、test、build）
   ✅ Require signed commits
   ✅ Include administrators
   ✅ Do not allow bypassing the above settings
```

---

## 五、GitHub Actions CI/CD

### 基本工作流

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build

  deploy:
    needs: lint-and-test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - run: npm run build && npm run deploy
```

### 自动部署到 Vercel/GitHub Pages

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install & Build
        run: |
          npm ci
          npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## 六、GitHub Issues 与项目管理

### Issue 模板

```markdown
<!-- .github/ISSUE_TEMPLATE/bug_report.md -->
---
name: Bug Report
about: 报告一个 Bug
title: '[Bug] '
labels: bug
assignees: @username
---

## Bug 描述
<!-- 清晰描述遇到的问题 -->

## 复现步骤
1. Go to '...'
2. Click on '....'
3. See error

## 期望行为
<!-- 描述期望的正确行为 -->

## 截图
<!-- 如有截图请附上 -->

## 环境信息
- OS: [e.g. macOS 14]
- Browser: [e.g. Chrome 120]
- Version: [e.g. 1.0.0]
```

### GitHub Projects（看板）

```
状态列：Todo | In Progress | In Review | Done
可关联 Issue、PR，自动追踪进度
```

---

## 七、常用协作命令速查

```bash
# 同步最新 develop
git fetch origin && git checkout develop && git merge origin/develop

# Rebase 保持线性历史
git checkout feature/user-login
git rebase develop

# 压缩多个提交（提交 PR 前清理）
git rebase -i HEAD~3
# pick → squash(s) 保留一个提交

# 挑选特定提交
git cherry-pick abc123

# 查看远程分支
git branch -r

# 设置默认拉取策略
git config --global pull.rebase true  # 变基优先
```
