# Git 高级操作与 Hooks 完整指南

> 变基、cherry-pick、子模块、Git Hooks 自动化

## 目录
- [一、变基（Rebase）](#变基-rebase)
- [二、Cherry-Pick](#cherry-pick)
- [三、Git 子模块（Submodule）](#git-子模块-submodule)
- [四、Git Stash（暂存）](#git-stash-暂存)
- [五、Git Hooks](#git-hooks)
- [六、高级查询](#高级查询)
- [七、Git 配置别名](#git-配置别名)

---


## 一、变基（Rebase）

### 基本变基

```bash
# 将 feature 分支变基到 develop（保持线性历史）
git checkout feature/user-login
git rebase develop

# 解决冲突后继续变基
git add .
git rebase --continue

# 中止变基
git rebase --abort

# 变基过程中跳过某个提交
git rebase --skip
```

### 交互式变基（压缩提交）

```bash
# 压缩最近 3 个提交为 1 个
git rebase -i HEAD~3

# 编辑界面：
pick abc1234 feat: 添加登录页
pick def5678 fix: 修复登录样式
pick ghi9012 fix: 修复登录样式2

# 修改为：
pick abc1234 feat: 添加登录页
s def5678 fix: 修复登录样式
s ghi9012 fix: 修复登录样式2

# 保存退出后填写合并后的提交信息
```

### 变基原理

```
变基前：
  A--B--C  (main)
       \
        D--E  (feature)

变基后（git rebase main）：
         D'--E'  (feature)
        /
  A--B--C       (main)
```

**⚠️ 黄金法则：不要对已推送到远程的提交进行变基**

---

## 二、Cherry-Pick

挑取特定提交应用到当前分支：

```bash
# 挑取单个提交
git cherry-pick abc1234

# 挑取多个提交
git cherry-pick abc1234 def5678

# 挑取并继续（解决冲突后）
git cherry-pick --continue

# 挑取但不停留（不自动提交）
git cherry-pick -n abc1234

# 挑取范围（左开右闭）
git cherry-pick abc1234..def5678

# 找到某分支独有但当前分支没有的提交
git cherry-pick develop..main
```

**典型场景：**
- 把 hotfix 分支的修复挑到 develop
- 把其他分支的优秀功能移植过来
- 恢复误删的提交

---

## 三、Git 子模块（Submodule）

在仓库中嵌入另一个独立仓库：

```bash
# 添加子模块
git submodule add https://github.com/user/ui-library.git src/ui-library

# .gitmodules 配置
[submodule "src/ui-library"]
    path = src/ui-library
    url = https://github.com/user/ui-library.git

# 克隆含子模块的仓库
git clone --recurse-submodules https://github.com/user/main-repo.git

# 更新子模块（已在仓库中）
git submodule update --remote src/ui-library
git submodule update --init --recursive

# 在子模块中工作
cd src/ui-library
git checkout develop
git add .
git commit -m "更新子模块"
git push

# 返回主仓库，提交子模块引用变更
cd ../..
git add .
git commit -m "更新 ui-library 子模块"
```

---

## 四、Git Stash（暂存）

临时保存未提交的修改：

```bash
# 暂存当前工作
git stash
git stash save "临时保存：修复登录 Bug"

# 查看暂存列表
git stash list
# stash@{0}: WIP on main: abc123 feat: 添加功能
# stash@{1}: On feature: def456 feat: 用户模块

# 应用最新暂存（保留暂存记录）
git stash apply

# 应用最新暂存（删除暂存记录）
git stash pop

# 应用指定暂存
git stash apply stash@{2}

# 查看暂存内容
git stash show
git stash show -p stash@{0}  # 详细 diff

# 删除暂存
git stash drop stash@{0}     # 删除单个
git stash clear              # 清空所有
```

---

## 五、Git Hooks

在 Git 操作的关键节点自动执行脚本：

```
项目目录/.git/hooks/
├── applypatch-msg.sample
├── commit-msg.sample       ← 提交信息检查
├── pre-commit.sample       ← 提交前检查（ESLint/测试）
├── pre-push.sample
├── pre-rebase.sample
├── prepare-commit-msg.sample
└── ...（以 .sample 结尾，需去掉 .sample 启用）
```

### 常用 Hook 类型

| Hook | 时机 | 用途 |
|------|------|------|
| `pre-commit` | `git commit` 前 | ESLint 检查、代码格式、测试 |
| `commit-msg` | 填写提交信息后 | 规范检查（Conventional Commits） |
| `pre-push` | `git push` 前 | 运行测试、CI 检查 |
| `pre-rebase` | `git rebase` 前 | 阻止变基已推送的分支 |
| `post-commit` | `git commit` 后 | 推送通知 |
| `post-receive` | 收到 push 后 | 自动部署 |

### commit-msg 规范检查

```bash
#!/bin/bash
# .git/hooks/commit-msg

commit_msg=$(cat "$1")
pattern="^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}"

if ! [[ $commit_msg =~ $pattern ]]; then
    echo "❌ 提交信息不符合规范"
    echo "格式：type(scope): description"
    echo "示例：feat(auth): 添加登录功能"
    exit 1
fi
```

### pre-commit（代码检查）

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 运行 ESLint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ ESLint 检查失败，请修复后再提交"
    exit 1
fi

echo "🧪 运行单元测试..."
npm run test:unit
if [ $? -ne 0 ]; then
    echo "❌ 测试未通过，请修复后再提交"
    exit 1
fi

echo "✅ 检查通过！"
```

### Husky（管理 Git Hooks）

```bash
# 安装
npm install -D husky lint-staged

# 初始化
npx husky install

# 添加 hook
npx husky add .husky/pre-commit "npm run lint"
npx husky add .husky/commit-msg "npx commitlint --edit $1"
```

```json
// package.json
{
  "lint-staged": {
    "*.{js,vue,ts}": ["eslint --fix", "git add"],
    "*.{css,scss,vue}": ["stylelint --fix", "git add"]
  }
}
```

```yaml
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx lint-staged
```

---

## 六、高级查询

```bash
# 按关键词搜索提交
git log --grep="登录"
git log -S "addUserFunction"  # 搜索包含此字符串的提交

# 查看某次提交的修改文件
git show abc1234 --stat
git show abc1234 --name-only

# 查看某个文件的历史
git log --follow -p filename

# 找出造成问题的提交（二分查找）
git bisect start
git bisect bad                    # 当前版本有 Bug
git bisect good v1.0.0            # 已知良好版本
# Git 自动 checkout 中间版本，测试后标记 good/bad
git bisect good                   # 或 git bisect bad
git bisect reset                  # 结束后回到原分支

# 找出未合并到 develop 的所有分支
git branch --no-merged develop

# 统计贡献
git shortlog -sn                 # 按提交数排名
git shortlog -sn --all --no-merges

# 查看被删除但未清理的引用
git reflog
```

---

## 七、Git 配置别名

```bash
# ~/.gitconfig
[alias]
    st = status
    co = checkout
    br = branch
    ci = commit
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = log --graph --oneline --all
    amend = commit --amend --no-edit
    aliases = config --get-regexp alias

    # 格式化日志
    lg = log --color --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset' --abbrev-commit

    # 撤销所有未提交的修改
    undo = reset --soft HEAD~1

    # 清理已合并的分支
    cleanup = !git branch --merged | grep -v '\\*\\|main\\|develop' | xargs git branch -d
```
