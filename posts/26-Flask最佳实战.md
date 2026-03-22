# Flask 最佳实战

## 目录

1. [Flask 简介与安装](#一flask-简介与安装)
2. [路由与视图](#二路由与视图)
3. [请求与响应](#三请求与响应)
4. [蓝图（Blueprint）模块化](#四蓝图blueprint模块化)
5. [数据库集成（Flask-SQLAlchemy）](#五数据库集成flask-sqlalchemy)
6. [用户认证（JWT）](#六用户认证jwt)
7. [RESTful API 最佳实践](#七restful-api-最佳实践)
8. [错误处理与日志](#八错误处理与日志)
9. [项目结构与部署](#九项目结构与部署)
10. [高频知识点汇总](#十高频知识点汇总)

---

## 一、Flask 简介与安装

### 什么是 Flask？

Flask 是一个轻量级 Python Web 框架，基于 Werkzeug WSGI 工具包和 Jinja2 模板引擎构建。特点：

- **微框架**：核心简洁，功能通过扩展添加
- **灵活性高**：不强制项目结构，按需组织
- **学习曲线平缓**：适合快速构建 API 和中小型 Web 应用
- **生态丰富**：Flask-SQLAlchemy、Flask-JWT-Extended、Flask-CORS 等

### 安装

```bash
# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# 安装 Flask 及常用扩展
pip install flask flask-sqlalchemy flask-jwt-extended flask-cors flask-migrate

# 生成依赖文件
pip freeze > requirements.txt
```

### Hello World

```python
from flask import Flask

app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello, Flask!"

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
```

---

## 二、路由与视图

### 1. 路由定义

```python
from flask import Flask, jsonify

app = Flask(__name__)

# 基本路由
@app.route("/")
def index():
    return "首页"

# 带参数的路由
@app.route("/user/<int:user_id>")
def get_user(user_id):
    return jsonify({"id": user_id, "name": f"User {user_id}"})

# 可选参数
@app.route("/posts/", defaults={"page": 1})
@app.route("/posts/<int:page>")
def get_posts(page):
    return jsonify({"page": page})

# 多种 HTTP 方法
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        return jsonify({"message": "登录成功"})
    return jsonify({"message": "请提交登录信息"})
```

### 2. 路由参数类型

```python
# 路由变量类型转换器
@app.route("/int/<int:n>")     # 整数
@app.route("/float/<float:f>") # 浮点数
@app.route("/path/<path:p>")   # 路径（包含 /）
@app.route("/uuid/<uuid:uid>") # UUID
@app.route("/str/<string:s>")  # 字符串（默认）
```

### 3. URL 构建（url_for）

```python
from flask import url_for

with app.test_request_context():
    print(url_for("get_user", user_id=1))  # /user/1
    print(url_for("get_posts", page=2))    # /posts/2
    print(url_for("static", filename="style.css"))  # /static/style.css
```

---

## 三、请求与响应

### 1. 请求对象

```python
from flask import request, jsonify

@app.route("/api/data", methods=["POST"])
def receive_data():
    # JSON 数据
    data = request.get_json()
    name = data.get("name", "")

    # 表单数据
    username = request.form.get("username")
    password = request.form.get("password")

    # URL 查询参数
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    # 请求头
    token = request.headers.get("Authorization")
    content_type = request.content_type

    # 文件上传
    file = request.files.get("avatar")
    if file and file.filename:
        filename = secure_filename(file.filename)
        file.save(os.path.join(UPLOAD_FOLDER, filename))

    return jsonify({"status": "ok"})
```

### 2. 响应构建

```python
from flask import jsonify, make_response, Response

# 返回 JSON
@app.route("/api/user")
def api_user():
    return jsonify({
        "id": 1,
        "name": "Alice",
        "email": "alice@example.com"
    })

# 自定义状态码和响应头
@app.route("/api/create", methods=["POST"])
def create():
    response = make_response(jsonify({"message": "创建成功"}), 201)
    response.headers["X-Custom-Header"] = "value"
    return response

# 统一响应格式（最佳实践）
def success_response(data=None, message="操作成功", code=200):
    return jsonify({
        "code": code,
        "message": message,
        "data": data
    }), code

def error_response(message="操作失败", code=400):
    return jsonify({
        "code": code,
        "message": message,
        "data": None
    }), code
```

---

## 四、蓝图（Blueprint）模块化

蓝图是组织大型 Flask 应用的核心机制，将不同功能模块拆分到独立文件。

### 1. 创建蓝图

```python
# blueprints/user.py
from flask import Blueprint, jsonify, request

user_bp = Blueprint("user", __name__, url_prefix="/api/users")

@user_bp.route("/", methods=["GET"])
def list_users():
    return jsonify({"users": []})

@user_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    return jsonify({"id": user_id})

@user_bp.route("/", methods=["POST"])
def create_user():
    data = request.get_json()
    return jsonify({"message": "用户创建成功", "user": data}), 201
```

```python
# blueprints/auth.py
from flask import Blueprint, jsonify, request

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    # 验证逻辑...
    return jsonify({"token": "xxx"})

@auth_bp.route("/logout", methods=["POST"])
def logout():
    return jsonify({"message": "已退出"})
```

### 2. 注册蓝图

```python
# app.py
from flask import Flask
from blueprints.user import user_bp
from blueprints.auth import auth_bp

def create_app(config=None):
    app = Flask(__name__)

    if config:
        app.config.from_object(config)

    # 注册蓝图
    app.register_blueprint(user_bp)
    app.register_blueprint(auth_bp)

    return app

app = create_app()
```

---

## 五、数据库集成（Flask-SQLAlchemy）

### 1. 配置与初始化

```python
# config.py
class Config:
    SECRET_KEY = "your-secret-key"
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"
    # SQLALCHEMY_DATABASE_URI = "mysql+pymysql://user:pass@localhost/dbname"
    # SQLALCHEMY_DATABASE_URI = "postgresql://user:pass@localhost/dbname"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

# extensions.py
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

# app.py
from extensions import db, migrate

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    migrate.init_app(app, db)

    return app
```

### 2. 定义模型

```python
# models/user.py
from extensions import db
from datetime import datetime

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # 关联关系
    posts = db.relationship("Post", backref="author", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "created_at": self.created_at.isoformat()
        }

    def __repr__(self):
        return f"<User {self.username}>"

class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
```

### 3. CRUD 操作

```python
from models.user import User
from extensions import db

# 创建
def create_user(username, email, password):
    user = User(username=username, email=email, password_hash=hash_password(password))
    db.session.add(user)
    db.session.commit()
    return user

# 查询
def get_user_by_id(user_id):
    return User.query.get_or_404(user_id)

def get_users(page=1, per_page=10, **filters):
    query = User.query.filter_by(**filters)
    return query.paginate(page=page, per_page=per_page, error_out=False)

# 更新
def update_user(user_id, **kwargs):
    user = User.query.get_or_404(user_id)
    for key, value in kwargs.items():
        if hasattr(user, key):
            setattr(user, key, value)
    db.session.commit()
    return user

# 删除
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()

# 数据库迁移命令
# flask db init     # 初始化迁移目录
# flask db migrate  # 生成迁移脚本
# flask db upgrade  # 执行迁移
```

---

## 六、用户认证（JWT）

### 1. 配置 JWT

```python
# config.py
from datetime import timedelta

class Config:
    JWT_SECRET_KEY = "jwt-secret-key"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

# extensions.py
from flask_jwt_extended import JWTManager
jwt = JWTManager()

# app.py
jwt.init_app(app)
```

### 2. 登录与令牌颁发

```python
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
from werkzeug.security import generate_password_hash, check_password_hash

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "用户名已存在"}), 400

    user = User(
        username=username,
        email=email,
        password_hash=generate_password_hash(password)
    )
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "注册成功", "user": user.to_dict()}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data.get("username")).first()

    if not user or not check_password_hash(user.password_hash, data.get("password")):
        return jsonify({"message": "用户名或密码错误"}), 401

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)

    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": user.to_dict()
    })

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access_token = create_access_token(identity=user_id)
    return jsonify({"access_token": access_token})
```

### 3. 保护路由

```python
from flask_jwt_extended import jwt_required, get_jwt_identity

@user_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    return jsonify(user.to_dict())

@user_bp.route("/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"message": "无权限执行此操作"}), 403

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "用户已删除"})
```

---

## 七、RESTful API 最佳实践

### 1. 请求参数验证

```python
from functools import wraps
from flask import request, jsonify

def validate_json(*required_fields):
    """验证请求 JSON 中是否包含必要字段"""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            data = request.get_json()
            if not data:
                return jsonify({"message": "请求体必须是 JSON"}), 400
            missing = [field for field in required_fields if field not in data]
            if missing:
                return jsonify({"message": f"缺少必要字段: {', '.join(missing)}"}), 400
            return f(*args, **kwargs)
        return wrapper
    return decorator

@user_bp.route("/", methods=["POST"])
@validate_json("username", "email", "password")
def create_user():
    data = request.get_json()
    # data 已验证包含所有必要字段
    ...
```

### 2. 分页响应

```python
def paginate_response(query, page, per_page, schema_fn=None):
    """通用分页响应"""
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    items = pagination.items

    if schema_fn:
        items = [schema_fn(item) for item in items]

    return jsonify({
        "items": items,
        "total": pagination.total,
        "pages": pagination.pages,
        "current_page": page,
        "per_page": per_page,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev
    })

@user_bp.route("/", methods=["GET"])
def list_users():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 10, type=int), 100)
    return paginate_response(User.query, page, per_page, lambda u: u.to_dict())
```

### 3. CORS 跨域处理

```python
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    # 允许所有来源（开发环境）
    CORS(app)

    # 生产环境配置（指定来源）
    CORS(app, resources={
        r"/api/*": {
            "origins": ["https://yourdomain.com", "https://app.yourdomain.com"],
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    return app
```

---

## 八、错误处理与日志

### 1. 统一错误处理

```python
from flask import jsonify

# 注册错误处理器
@app.errorhandler(400)
def bad_request(e):
    return jsonify({"code": 400, "message": "请求参数错误", "data": None}), 400

@app.errorhandler(401)
def unauthorized(e):
    return jsonify({"code": 401, "message": "未授权，请先登录", "data": None}), 401

@app.errorhandler(403)
def forbidden(e):
    return jsonify({"code": 403, "message": "无权限访问", "data": None}), 403

@app.errorhandler(404)
def not_found(e):
    return jsonify({"code": 404, "message": "资源不存在", "data": None}), 404

@app.errorhandler(500)
def internal_error(e):
    db.session.rollback()  # 回滚数据库事务
    return jsonify({"code": 500, "message": "服务器内部错误", "data": None}), 500

# 自定义业务异常
class BusinessError(Exception):
    def __init__(self, message, code=400):
        super().__init__(message)
        self.message = message
        self.code = code

@app.errorhandler(BusinessError)
def handle_business_error(e):
    return jsonify({"code": e.code, "message": e.message, "data": None}), e.code
```

### 2. 日志配置

```python
import logging
from logging.handlers import RotatingFileHandler

def setup_logging(app):
    if not app.debug:
        # 文件日志（滚动）
        handler = RotatingFileHandler(
            "logs/app.log",
            maxBytes=10 * 1024 * 1024,  # 10MB
            backupCount=5
        )
        handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            "[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
        )
        handler.setFormatter(formatter)
        app.logger.addHandler(handler)
        app.logger.setLevel(logging.INFO)

    app.logger.info("Flask 应用启动")

# 使用日志
@app.route("/api/test")
def test():
    app.logger.info(f"请求来自 {request.remote_addr}")
    app.logger.warning("这是一条警告")
    app.logger.error("这是一条错误")
    return jsonify({"status": "ok"})
```

---

## 九、项目结构与部署

### 1. 推荐项目结构

```
my-flask-app/
├── app/
│   ├── __init__.py          # create_app 工厂函数
│   ├── extensions.py        # db, jwt, migrate 等扩展
│   ├── config.py            # 配置类
│   ├── models/              # 数据模型
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── post.py
│   ├── blueprints/          # 蓝图（路由）
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   └── post.py
│   └── utils/               # 工具函数
│       ├── __init__.py
│       ├── validators.py
│       └── helpers.py
├── migrations/              # 数据库迁移文件
├── tests/                   # 测试
├── logs/                    # 日志
├── .env                     # 环境变量（不提交 git）
├── .env.example             # 环境变量示例
├── requirements.txt
├── wsgi.py                  # WSGI 入口
└── Dockerfile
```

### 2. 工厂函数模式

```python
# app/__init__.py
from flask import Flask
from .extensions import db, jwt, migrate
from .blueprints.auth import auth_bp
from .blueprints.user import user_bp
from .config import config_map

def create_app(env="development"):
    app = Flask(__name__)
    app.config.from_object(config_map[env])

    # 初始化扩展
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # 注册蓝图
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)

    # 注册错误处理
    register_error_handlers(app)

    return app
```

### 3. 环境配置

```python
# app/config.py
import os
from dotenv import load_dotenv

load_dotenv()

class BaseConfig:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(BaseConfig):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = os.getenv("DEV_DATABASE_URL", "sqlite:///dev.db")

class ProductionConfig(BaseConfig):
    DEBUG = False
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

config_map = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
}
```

### 4. Gunicorn + Nginx 部署

```bash
# 安装 gunicorn
pip install gunicorn

# wsgi.py
from app import create_app
app = create_app("production")

if __name__ == "__main__":
    app.run()

# 启动 Gunicorn（多工作进程）
gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
```

```nginx
# nginx.conf
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /static {
        alias /path/to/your/app/static;
        expires 30d;
    }
}
```

### 5. Docker 部署

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "wsgi:app"]
```

```yaml
# docker-compose.yml
version: "3.8"
services:
  web:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db/mydb
      - SECRET_KEY=production-secret
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: mydb
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 十、高频知识点汇总

1. **Flask 和 Django 的区别？**
   - Flask：微框架，轻量灵活，按需引入扩展，适合 API 和中小型应用
   - Django：全功能框架，内置 ORM、Admin、Auth，适合大型项目

2. **Flask 应用上下文和请求上下文的区别？**
   - 应用上下文（`g`, `current_app`）：生命周期与应用一致
   - 请求上下文（`request`, `session`）：每个 HTTP 请求独立

3. **`before_request` 和 `after_request` 的用途？**
   ```python
   @app.before_request
   def check_auth():
       # 每个请求前执行，可用于权限验证
       token = request.headers.get("Authorization")
       if not token and request.endpoint not in ("auth.login", "auth.register"):
           return jsonify({"message": "未授权"}), 401

   @app.after_request
   def add_headers(response):
       # 每个响应后执行，可统一添加响应头
       response.headers["X-Content-Type-Options"] = "nosniff"
       return response
   ```

4. **如何防止 SQL 注入？**
   - 使用 SQLAlchemy ORM，它会自动参数化查询
   - 避免直接拼接 SQL 字符串
   - 使用 `text()` 时必须使用绑定参数：`db.session.execute(text("SELECT * FROM users WHERE id = :id"), {"id": user_id})`

5. **Flask-Migrate 数据库迁移流程？**
   ```bash
   flask db init      # 初始化（仅首次）
   flask db migrate -m "Add user table"  # 检测模型变化，生成迁移脚本
   flask db upgrade   # 执行迁移，更新数据库
   flask db downgrade # 回滚一个版本
   ```

6. **如何处理文件上传？**
   ```python
   from werkzeug.utils import secure_filename
   import os

   UPLOAD_FOLDER = "/uploads"
   ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "pdf"}

   def allowed_file(filename):
       return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

   @app.route("/upload", methods=["POST"])
   def upload():
       file = request.files.get("file")
       if not file or not allowed_file(file.filename):
           return jsonify({"message": "文件类型不支持"}), 400
       filename = secure_filename(file.filename)
       file.save(os.path.join(UPLOAD_FOLDER, filename))
       return jsonify({"url": f"/uploads/{filename}"})
   ```

7. **Flask 中的 `g` 对象是什么？**
   - `g` 是请求上下文中的全局对象，每个请求独立
   - 常用于在 `before_request` 中存储当前用户信息：
   ```python
   @app.before_request
   @jwt_required(optional=True)
   def load_current_user():
       user_id = get_jwt_identity()
       g.current_user = User.query.get(user_id) if user_id else None
   ```

8. **如何编写 Flask 单元测试？**
   ```python
   import pytest
   from app import create_app
   from extensions import db

   @pytest.fixture
   def app():
       app = create_app("testing")
       with app.app_context():
           db.create_all()
           yield app
           db.drop_all()

   @pytest.fixture
   def client(app):
       return app.test_client()

   def test_register(client):
       response = client.post("/api/auth/register", json={
           "username": "testuser",
           "email": "test@test.com",
           "password": "password123"
       })
       assert response.status_code == 201
       assert response.json["message"] == "注册成功"
   ```

9. **生产环境注意事项？**
   - 关闭 `DEBUG` 模式
   - 使用强随机 `SECRET_KEY` 和 `JWT_SECRET_KEY`
   - 数据库使用连接池（`SQLALCHEMY_POOL_SIZE`）
   - 使用 HTTPS（配置 SSL 证书）
   - 设置请求速率限制（Flask-Limiter）
   - 敏感配置通过环境变量注入，不硬编码

10. **Flask 性能优化技巧？**
    - 使用 Redis 缓存热点数据（Flask-Caching）
    - 数据库查询添加适当索引
    - 使用 `select_related` 避免 N+1 查询（`joinedload`）
    - 异步任务使用 Celery 处理（发邮件、生成报表等）
    - 启用 Gzip 压缩响应
    ```python
    from flask_caching import Cache
    cache = Cache(config={"CACHE_TYPE": "redis", "CACHE_REDIS_URL": "redis://localhost:6379"})

    @app.route("/api/hot-data")
    @cache.cached(timeout=300)  # 缓存 5 分钟
    def hot_data():
        return jsonify(fetch_expensive_data())
    ```
