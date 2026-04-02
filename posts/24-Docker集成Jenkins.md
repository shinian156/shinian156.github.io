# Docker 集成 Jenkins 持续集成部署

## 目录

---

## 概述

### CI/CD 流程

```
代码提交 → Git Hook → Jenkins 触发 → 构建 → 测试 → 部署
```

### Docker + Jenkins 优势

- **环境隔离**: 每个项目独立环境
- **可重现性**: 确保构建环境一致
- **快速部署**: 一键部署到服务器
- **资源隔离**: 避免环境污染

---

## 环境准备

### 1. 安装 Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | bash

# 启动 Docker
sudo systemctl start docker
sudo systemctl enable docker

# 添加当前用户到 docker 组
sudo usermod -aG docker $USER
newgrp docker
```

### 2. 验证安装

```bash
docker --version
docker-compose --version
```

---

## Docker 中运行 Jenkins

### 1. 创建数据卷

```bash
# 创建持久化目录
mkdir -p ~/jenkins_home

# 设置权限
chmod 777 ~/jenkins_home
```

### 2. 拉取并运行 Jenkins

```bash
# 拉取 Jenkins 镜像
docker pull jenkins/jenkins:lts

# 运行 Jenkins 容器
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v ~/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

### 3. Docker Compose 方式

```yaml
# docker-compose.yml
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    privileged: true
    user: root
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - ~/jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/bin/docker:/usr/bin/docker
    environment:
      - JAVA_OPTS=-Djenkins.install.runSetupWizard=false
    restart: unless-stopped
```

```bash
# 启动 Jenkins
docker-compose up -d

# 查看日志
docker-compose logs -f jenkins

# 获取初始密码
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

---

## Jenkins 配置

### 1. 首次登录

1. 访问 `http://localhost:8080`
2. 输入初始密码
3. 选择"安装推荐插件"
4. 创建管理员账户

### 2. 安装必要插件

进入 `Manage Jenkins` → `Manage Plugins` → `Available`:

- **Git Plugin**: Git 代码仓库
- **Docker Pipeline**: Docker 集成
- **NodeJS Plugin**: Node.js 环境
- **Publish Over SSH**: SSH 远程部署
- **Pipeline**: Pipeline 脚本支持

### 3. 配置 Node.js

1. `Manage Jenkins` → `Global Tool Configuration`
2. 找到 `NodeJS` 部分
3. 点击 `Add NodeJS`
4. 配置名称和版本

```yaml
Name: Node-18
Install from nodejs.org
Version: 18.17.0
```

### 4. 配置 SSH

```yaml
# Manage Jenkins → Configure System → Publish over SSH
# 添加 SSH Servers

Name: production-server
Hostname: your-server.com
Username: deploy
Password: ********
Remote Directory: /home/deploy
```

---

## Pipeline 脚本

### 1. 前端项目 Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            args '-p 3000:3000'
        }
    }

    environment {
        // 环境变量
        REGISTRY = 'your-registry.com'
        IMAGE_NAME = 'frontend-blog'
        DEPLOY_HOST = 'production-server'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test'
            }
        }

        stage('Docker Build') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def image = docker.build("${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}")
                }
            }
        }

        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                script {
                    docker.withRegistry('https://' + REGISTRY, 'docker-registry-credentials') {
                        def image = docker.build("${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}")
                        image.push()
                        image.push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sshagent(credentials: ['ssh-credentials']) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no deploy@${DEPLOY_HOST} << EOF
                            docker pull ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}
                            docker stop frontend-blog || true
                            docker rm frontend-blog || true
                            docker run -d --name frontend-blog \
                                -p 80:80 \
                                --restart always \
                                ${REGISTRY}/${IMAGE_NAME}:${BUILD_NUMBER}
                            docker image prune -f
                        EOF
                    '''
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Build and Deploy Success!'
        }
        failure {
            echo 'Build or Deploy Failed!'
        }
    }
}
```

### 2. 多环境部署 Pipeline

```groovy
pipeline {
    agent any

    environment {
        REGISTRY = 'your-registry.com'
    }

    stages {
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    env.IMAGE_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
                    def image = docker.build("${REGISTRY}/app:${IMAGE_TAG}")
                    env.FULL_IMAGE = "${REGISTRY}/app:${IMAGE_TAG}"
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sshagent(credentials: ['ssh-staging']) {
                    sh '''
                        ssh deploy@staging-server "docker pull ${FULL_IMAGE}"
                        ssh deploy@staging-server "docker-compose up -d"
                    '''
                }
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to Production?', ok: 'Deploy'
                sshagent(credentials: ['ssh-prod']) {
                    sh '''
                        ssh deploy@prod-server "docker pull ${FULL_IMAGE}"
                        ssh deploy@prod-server "docker-compose up -d"
                    '''
                }
            }
        }
    }
}
```

### 3. Docker Pipeline 插件方式

```groovy
pipeline {
    agent {
        label 'docker-agent'
    }

    stages {
        stage('Build Image') {
            steps {
                script {
                    def customImage = docker.build("my-app:${env.BUILD_ID}", "-f Dockerfile .")
                }
            }
        }

        stage('Test Container') {
            steps {
                script {
                    customImage.withRun('-p 8080:8080') { container ->
                        sh 'sleep 10'
                        sh 'curl http://localhost:8080/health'
                    }
                }
            }
        }

        stage('Push Image') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub') {
                        customImage.push()
                    }
                }
            }
        }
    }
}
```

---

## 自动化部署

### 1. Webhook 配置

#### GitHub Webhook

1. 进入 GitHub 仓库 → Settings → Webhooks
2. 点击 `Add webhook`
3. 配置：

```
Payload URL: http://your-jenkins.com/github-webhook/
Content type: application/json
Events: Just the push event
```

#### Jenkins 配置

1. `Manage Jenkins` → `Configure System`
2. 找到 `GitHub` 部分
3. 添加 GitHub Server
4. 在 Job 配置中勾选 `GitHub hook trigger for GITScm polling`

### 2. GitLab Webhook

```bash
# GitLab 配置
# Settings → Webhooks
URL: http://your-jenkins.com/project/your-job
Trigger: Push events, Merge request events
```

### 3. 自动触发构建

```groovy
pipeline {
    triggers {
        githubPush()
        // 或
        gitlab(triggerOnPush: true, triggerOnMergeRequest: true)
    }
}
```

---

## 最佳实践

### 1. Dockerfile 优化

```dockerfile
# 使用多阶段构建
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. 安全建议

```groovy
// 使用凭据
environment {
    DOCKER_TOKEN = credentials('docker-token')
}

stage('Push') {
    steps {
        sh 'echo $DOCKER_TOKEN | docker login -u username --password-stdin'
    }
}
```

### 3. 错误处理

```groovy
stage('Deploy') {
    steps {
        script {
            try {
                sh 'kubectl apply -f deployment.yaml'
            } catch (Exception e) {
                echo "Deployment failed: ${e.message}"
                currentBuild.result = 'FAILURE'
                slackSend channel: '#alerts', message: "Build failed!"
            }
        }
    }
}
```

### 4. 通知配置

```groovy
post {
    success {
        slackSend channel: '#deployments',
                  message: "Build ${env.BUILD_NUMBER} succeeded! <${env.BUILD_URL}|View Details>"
    }
    failure {
        slackSend channel: '#deployments',
                  message: "Build ${env.BUILD_NUMBER} failed! <${env.BUILD_URL}|View Details>"
        email to: 'team@example.com',
              subject: "Build Failed: ${env.JOB_NAME}",
              body: "Check console output: ${env.BUILD_URL}"
    }
}
```

### 5. 完整示例

```groovy
// Jenkinsfile
@Library('shared-library') _

pipeline {
    agent {
        docker {
            image 'node:18-alpine'
            reuseNode true
        }
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    environment {
        NODE_ENV = 'production'
        REGISTRY = credentials('docker-registry')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }

        stage('Dependencies') {
            steps {
                sh 'npm ci --prefer-offline'
            }
        }

        stage('Code Quality') {
            parallel {
                stage('ESLint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('Type Check') {
                    steps {
                        sh 'npm run type-check'
                    }
                }
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test -- --coverage'
            }
            post {
                always {
                    junit 'reports/*.xml'
                    cobertura coberturaReportFile: 'coverage/cobertura-coverage.xml'
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
                archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
            }
        }

        stage('Docker Build & Push') {
            when {
                branch 'main'
            }
            steps {
                script {
                    def imageName = "myapp:${env.GIT_COMMIT_SHORT}"
                    def dockerImage = docker.build(imageName)

                    docker.withRegistry('https://registry.example.com', 'docker-hub') {
                        dockerImage.push()
                        dockerImage.push('latest')
                    }
                }
            }
        }

        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh '''
                    ssh deploy@staging "cd /app && \\
                    docker-compose pull && \\
                    docker-compose up -d"
                '''
            }
        }

        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                input message: 'Deploy to Production?',
                      ok: 'Deploy',
                      submitter: 'admin,deployer'
                sh '''
                    ssh deploy@production "cd /app && \\
                    docker-compose pull && \\
                    docker-compose up -d"
                '''
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
```

---

## 常见问题

### Q1: Docker in Docker (DinD)

```bash
# 运行 DinD Jenkins
docker run -d \
    --name jenkins \
    --privileged \
    -v /var/run/docker.sock:/var/run/docker.sock \
    jenkins/jenkins:lts
```

### Q2: 权限问题

```bash
# 修改数据目录权限
chown -R 1000:1000 ~/jenkins_home
```

### Q3: 构建慢

```groovy
// 使用缓存
stage('Build') {
    steps {
        sh '''
            docker build --cache-from $PREV_IMAGE -t $IMAGE .
        '''
    }
}
```

---

## 总结

| 组件 | 说明 |
|------|------|
| Jenkins | 持续集成/部署服务器 |
| Docker | 容器化环境 |
| GitHub/GitLab | 代码仓库 + Webhook |
| Pipeline | 自动化脚本 |
| Registry | 镜像仓库 |

---

**知识点:**
- Docker
- Jenkins
- CI/CD
- Pipeline
- 持续集成
- 持续部署
- 自动化运维
