# Git 与 GitHub 完整指南

> 版本控制核心概念与日常使用全覆盖

## 目录
- [一、Git 核心概念](#git-核心概念)
- [二、基础操作](#基础操作)
- [三、分支操作](#分支操作)
- [四、远程仓库](#远程仓库)
- [五、撤销与回退](#撤销与回退)
- [六、GitHub 基础](#github-基础)
- [七、标签管理](#标签管理)
- [八、忽略文件](#忽略文件)

---


## 一、Git 核心概念

### 工作区域模型

```
Working Directory（工作区）  →  git add  →  Staging Area（暂存区）  →  git commit  →  Repository（仓库）
     你正在编辑的文件                        等待提交的文件快照                    本地 Git 仓库
```

**三个关键区域：**
- **工作区（Working Tree）**：项目当前状态的文件
- **暂存区（Staging / Index）**：已标记要提交的文件快照
- **仓库（Repository）**：Git 保存所有提交历史的地方

### 基础配置

```bash
# 全局配置
git config --global user.name "你的名字"
git config --global user.email "your@email.com"
git config --global core.editor vim
git config --global alias.st status        # 设置别名
git config --global alias.lg "log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit"

# 查看所有配置
git config --list --show-origin
```

---

## 二、基础操作

### 初始化与克隆

```bash
# 本地初始化新仓库
git init
git init --initial-branch=main  # 指定初始分支名

# 克隆远程仓库
git clone https://github.com/user/repo.git
git clone --depth 1 https://github.com/user/repo.git  # 浅克隆（只拉最新版本）
git clone --branch develop https://github.com/user/repo.git  # 克隆指定分支
```

### 日常提交流程

```bash
# 查看状态
git status
git status -s  # 简洁模式

# 添加文件到暂存区
git add filename.txt          # 添加单个文件
git add src/                  # 添加整个目录
git add .                     # 添加所有变更
git add -p                    # 交互式添加（部分文件）

# 提交
git commit -m "提交信息"
git commit -am "添加新功能"   # 跳过暂存区，直接提交已跟踪文件（不适用于新文件）
git commit --amend            # 修改上一次提交（追加修改/改提交信息）
```

### 查看历史与差异

```bash
# 查看提交历史
git log
git log --oneline             # 每行一条
git log --oneline -10         # 最近10条
git log --graph --all         # 分支图
git log -p filename           # 查看某个文件的修改历史
git log --author="张三"       # 筛选某人提交
git log --since="2024-01-01" # 时间范围

# 查看差异
git diff                     # 工作区 vs 暂存区
git diff --cached            # 暂存区 vs 最新提交
git diff HEAD                # 工作区 vs 最新提交
git diff HEAD~3 HEAD         # 对比提交
git diff branch1 branch2     # 对比两个分支
```

---

## 三、分支操作

```bash
# 查看分支
git branch                    # 本地分支列表
git branch -a                 # 所有分支（含远程）
git branch -r                 # 远程分支

# 创建与切换
git branch feature-login       # 创建分支
git checkout feature-login     # 切换分支
git checkout -b feature-login  # 创建并切换（一步完成）
git switch -c feature-login   # 新版切换命令（更直观）

# 分支重命名
git branch -m old-name new-name

# 删除分支
git branch -d feature-login   # 安全删除（未合并会警告）
git branch -D feature-login   # 强制删除

# 合并分支
git checkout main
git merge feature-login       # 将 feature-login 合并到 main
git merge --no-ff feature-login  # 禁止快进合并，保留分支历史
```

---

## 四、远程仓库

```bash
# 添加远程仓库
git remote add origin https://github.com/user/repo.git
git remote -v                  # 查看远程仓库

# 拉取与推送
git fetch origin               # 拉取远程更新（不合并）
git pull origin main           # 拉取并合并
git pull --rebase origin main  # 变基方式拉取
git push origin main           # 推送
git push -u origin main        # 推送并设置上游分支
git push --force-with-lease    # 安全强制推送（避免覆盖他人提交）
git push --force               # ⚠️ 强制推送（危险）

# 管理远程
git remote rename origin upstream
git remote remove origin
git remote set-url origin new-url
```

---

## 五、撤销与回退

```bash
# 撤销工作区修改（未暂存）
git checkout -- filename.txt
git restore filename.txt       # 新版命令

# 撤销暂存（已 add，未 commit）
git reset HEAD filename.txt
git restore --staged filename.txt  # 新版命令

# 回退提交（三种模式）
git reset --soft HEAD~1        # 保留修改在暂存区
git reset --mixed HEAD~1       # 保留修改在工作区（默认）
git reset --hard HEAD~1        # 丢弃所有修改（危险！）

# 丢弃工作区修改（危险）
git checkout HEAD -- filename.txt
git restore --source=HEAD --worktree filename.txt

# 恢复误删的提交（用 reflog）
git reflog                     # 查看所有操作历史
git checkout HEAD@{5}          # 恢复到某个操作点
git reset --hard HEAD@{5}
```

---

## 六、GitHub 基础

### 创建与协作流程

```bash
# Fork → Clone → 修改 → Push → Pull Request
git clone https://github.com/your-username/repo.git
git remote add upstream https://github.com/original-owner/repo.git  # 添加上游仓库

# 保持 fork 与上游同步
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

### GitHub 常用操作

- **Create Repository**：新建仓库
- **Fork**：复制他人仓库到自己的账户
- **Pull Request**：请求合并你的分支到主仓库
- **Issues**：跟踪 Bug、功能需求
- **Wiki**：项目文档
- **GitHub Actions**：CI/CD 自动化

### GitHub 个人访问令牌（Token）

```bash
# Settings → Developer settings → Personal access tokens → Generate new token
# 使用 Token 克隆私有仓库
git clone https://github.com/username/repo.git
# 输入用户名，密码填 Token（不是密码）
```

---

## 七、标签管理

```bash
# 创建标签
git tag v1.0.0                 # 轻量标签
git tag -a v1.0.0 -m "版本1.0.0"  # 附注标签（推荐）

# 查看标签
git tag
git tag -l "v1.*"

# 推送标签
git push origin v1.0.0         # 推送单个标签
git push --tags                # 推送所有标签

# 删除标签
git tag -d v1.0.0             # 删除本地
git push origin :refs/tags/v1.0.0  # 删除远程
```

---

## 八、忽略文件

```bash
# .gitignore 文件
node_modules/          # 忽略目录
*.log                  # 忽略日志文件
.env                   # 忽略环境变量文件
dist/                  # 忽略构建产物
.DS_Store             # macOS 系统文件

# 已跟踪的文件需要先移除
git rm --cached .env
```

```bash
# .gitignore 全局配置（用户级）
git config --global core.excludesfile ~/.gitignore_global
```
