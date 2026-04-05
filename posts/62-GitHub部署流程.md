# GitHub 完整部署流程

> 从项目创建到自动化部署，手把手教你将前端项目部署到 GitHub Pages。

## 目录
- [一、创建 GitHub 仓库](#一创建-github-仓库)
- [二、本地项目初始化](#二本地项目初始化)
- [三、配置 GitHub Actions 自动部署](#三配置-github-actions-自动部署)
- [四、配置 GitHub Pages](#四配置-github-pages)
- [五、常见问题](#五常见问题)

---

## 一、创建 GitHub 仓库

### 用户仓库 vs 普通仓库

| 类型 | 仓库名 | 访问地址 |
|:---|:---|:---|
| **用户页** | `username.github.io` | `https://username.github.io/` |
| **项目页** | 任意名称 | `https://username.github.io/repo/` |

**推荐**：使用用户仓库 (`username.github.io`)，可直接通过根域名访问。

### 创建步骤

1. 登录 GitHub → New repository
2. Repository name: `username.github.io`
3. Visibility: Public
4. 不勾选任何初始化选项

---

## 二、本地项目初始化

```bash
cd your-project
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/username/repo.git
git push -u origin main
```

---

## 三、配置 GitHub Actions 自动部署

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - run: npm ci
      - run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          publish_branch: gh-pages
```

---

## 四、配置 GitHub Pages

1. 仓库 **Settings** → **Pages**
2. **Source**: Branch `gh-pages` + `/ (root)`
3. 保存后等待 1-2 分钟
4. 访问 `https://username.github.io/`

---

## 五、常见问题

### 1. 部署后页面空白

**原因**：资源路径问题

**解决**：确保 `vite.config.ts` 设置 `base: './'`

### 2. 404 错误

**原因**：Pages 未启用或分支选择错误

**解决**：确认 Pages 启用并选择 `gh-pages` 分支

### 3. Token 权限不足 (403)

**解决**：workflow 中添加权限：

```yaml
permissions:
  contents: write
  pages: write
  id-token: write
```

### 4. 构建产物未部署

**原因**：未正确配置部署步骤

**解决**：使用 `peaceiris/actions-gh-pages@v3` 推送 `gh-pages` 分支

---

## 六、自定义域名

1. **Settings** → **Pages** → Custom domain 输入域名
2. DNS 添加 CNAME 记录：
   - 类型: CNAME
   - 名称: www
   - 值: `username.github.io`
3. 勾选 **Enforce HTTPS**

---

## 总结

| 步骤 | 操作 |
|:---|:---|
| 1 | 创建仓库 `username.github.io` |
| 2 | 本地 Git init + remote |
| 3 | 配置 `.github/workflows/deploy.yml` |
| 4 | Settings → Pages → gh-pages 分支 |
| 5 | 自动部署完成 |
