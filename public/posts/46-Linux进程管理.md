# Linux 进程与服务管理完整指南

> 进程监控、systemd 服务、日志管理、后台任务

## 目录

- [一、进程基础](#进程基础)
  - [基本概念](#基本概念)
  - [查看进程](#查看进程)
- [二、进程控制](#进程控制)
  - [启动进程](#启动进程)
  - [终止进程](#终止进程)
- [三、systemd 服务管理](#systemd-服务管理)
  - [基本命令](#基本命令)
  - [创建 systemd 服务](#创建-systemd-服务)
  - [服务类型（Type）](#服务类型-type)
- [四、日志管理](#日志管理)
  - [journalctl（systemd 日志）](#journalctl-systemd-日志)
  - [传统日志文件](#传统日志文件)
- [五、定时任务](#定时任务)
  - [cron](#cron)
  - [anacron（处理错过的任务）](#anacron-处理错过的任务)
- [六、后台任务与作业控制](#后台任务与作业控制)
- [七、进程资源限制](#进程资源限制)
- [八、性能监控命令](#性能监控命令)

---


## 一、进程基础

### 基本概念

- **进程（Process）**：正在运行的程序的实例，每个进程有唯一 PID
- **父进程（PPID）**：创建当前进程的进程
- **前台进程**：占用终端的进程
- **后台进程**：不占用终端，在后台运行
- **守护进程（Daemon）**：系统服务进程，如 sshd、nginx

### 查看进程

```bash
# ps 命令
ps aux                     # 所有进程（BSD 风格）
ps -ef                     # 标准风格（显示 PPID）
ps -ef | grep nginx        # 查找 nginx
ps -eo pid,ppid,cmd,etime  # 自定义列：PID/父PID/命令/运行时长

# top（实时监控）
top                         # 默认按 CPU 排序
# 交互：
# M      - 按内存排序
# P      - 按 CPU 排序
# q      - 退出
# k      - 杀进程
# 1      - 显示所有 CPU 核心
# top -u www-data          - 只看某用户进程
# top -p PID1,PID2         - 监控指定进程

# htop（需安装）
apt install htop
htop                        # 彩色界面，支持鼠标
# F9 - 杀掉进程，F3 - 搜索，F4 - 过滤

# 其他
pstree -a                  # 进程树形结构
pidof nginx                # 获取进程 PID
pgrep nginx                # 查找进程 PID
```

---

## 二、进程控制

### 启动进程

```bash
# 前台运行
./app.sh

# 后台运行
./app.sh &                  # 加 & 在后台运行
nohup ./app.sh &            # 关闭终端也继续运行
nohup ./app.sh > app.log 2>&1 &  # 输出重定向

# setsid（彻底后台运行，不受终端影响）
setsid ./app.sh

# screen（终端复用器，后台运行+会话保存）
screen -S myapp              # 创建会话
# Ctrl+A D                  # 分离会话（后台）
screen -r myapp              # 恢复会话
screen -ls                   # 列出所有会话
screen -X -S myapp quit     # 删除会话

# tmux（更现代的替代）
tmux new -s myapp           # 新建会话
# Ctrl+B D                  # 分离
tmux attach -t myapp         # 恢复
tmux ls                     # 列出
```

### 终止进程

```bash
kill PID                     # 温和终止（让进程优雅退出）
kill -2 PID                  # 等价 Ctrl+C（SIGINT）
kill -15 PID                 # 正常终止（SIGTERM，默认）
kill -9 PID                  # 强制杀死（SIGKILL，无法被捕获）

killall nginx               # 按名字杀所有 nginx
killall -9 nginx            # 强制全部杀死
pkill -f "node server.js"   # 按进程名模式杀

# 杀进程前先尝试正常方式
ps aux | grep app
kill $(pidof app)
```

---

## 三、systemd 服务管理

### 基本命令

```bash
# systemctl（现代 Linux 推荐）
systemctl status nginx       # 查看状态
systemctl start nginx        # 启动
systemctl stop nginx         # 停止
systemctl restart nginx      # 重启
systemctl reload nginx       # 重载配置（不中断连接）
systemctl enable nginx       # 开机自启
systemctl disable nginx      # 关闭自启
systemctl is-enabled nginx   # 查看是否自启
systemctl daemon-reload      # 重载 systemd 配置

# 查看服务
systemctl list-units --type=service --all
systemctl list-unit-files   # 所有服务文件
systemctl list-dependencies nginx  # 依赖关系
```

### 创建 systemd 服务

```bash
# /etc/systemd/system/myapp.service
[Unit]
Description=My Node.js Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/myapp
ExecStart=/usr/bin/node /home/ubuntu/myapp/server.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/myapp.log
StandardError=append:/var/log/myapp-error.log

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable myapp
sudo systemctl start myapp
sudo systemctl status myapp
```

### 服务类型（Type）

| Type | 说明 |
|------|------|
| `simple` | 主体进程即为服务 |
| `forking` | 主进程 fork 子进程后退出（传统守护进程） |
| `oneshot` | 执行一次就结束（如 ifconfig） |
| `notify` | 服务启动完成后发送通知 |
| `idle` | 等系统空闲才运行 |

---

## 四、日志管理

### journalctl（systemd 日志）

```bash
journalctl                        # 所有日志
journalctl -u nginx.service        # 指定服务日志
journalctl -u nginx.service --since "1 hour ago"  # 1小时内的
journalctl -f                      # 实时追踪
journalctl -n 50                   # 最近50行
journalctl -b                      # 本次启动日志
journalctl -b -1                   # 上次启动
journalctl --disk-usage            # 查看日志磁盘占用
journalctl --vacuum-size=500M      # 清理旧日志
```

### 传统日志文件

```bash
# /var/log/ 目录结构
/var/log/syslog          # Ubuntu 系统日志
/var/log/messages        # CentOS 系统日志
/var/log/secure          # 安全/认证日志
/var/log/nginx/
    access.log           # 访问日志
    error.log            # 错误日志
/var/log/apache2/
/var/log/mysql/

# 查看日志
tail -f /var/log/syslog
grep -i error /var/log/syslog | tail -50

# 日志轮转（logrotate）
cat /etc/logrotate.d/nginx
# /var/log/nginx/*.log {
#     daily              # 每天轮转
#     missingok          # 缺失不报错
#     rotate 14          # 保留14个版本
#     compress           # 压缩旧日志
#     delaycompress      # 延迟压缩
#     notifempty         # 空文件不轮转
#     create 0640 www-data adm
#     sharedscripts
#     postrotate
#         systemctl reload nginx > /dev/null
#     endscript
# }
```

---

## 五、定时任务

### cron

```bash
# crontab 格式
# ┌───────────── 分钟 (0-59)
# │ ┌─────────── 小时 (0-23)
# │ │ ┌───────── 日 (1-31)
# │ │ │ ┌─────── 月 (1-12)
# │ │ │ │ ┌───── 星期 (0-7, 0和7都是周日)
# │ │ │ │ │ 命令
# * * * * * /command.sh

# 示例
0 * * * * /backup/hourly.sh          # 每小时整点
0 2 * * * /backup/daily.sh            # 每天凌晨2点
0 3 * * 0 /backup/weekly.sh           # 每周日凌晨3点
0 0 1 * * /backup/monthly.sh          # 每月1号
*/5 * * * * /monitor/health.sh        # 每5分钟
0 9-18 * * 1-5 /monitor/workday.sh   # 工作日9点到18点每小时

# 管理
crontab -e                           # 编辑当前用户 crontab
crontab -l                           # 查看当前用户 crontab
crontab -r                           # 删除所有任务（小心！）
crontab -u username -l              # 查看指定用户任务
```

### anacron（处理错过的任务）

```bash
# /etc/anacrontab
# 格式：周期 延迟(分钟) 标识 命令
@daily 10 example.daily /backup/daily.sh
```

---

## 六、后台任务与作业控制

```bash
# 后台任务
./script.sh &                  # 后台运行
jobs                           # 查看后台任务
# [1]+  Running        ./script.sh &
# [2]-  Stopped        ./app.sh

# fg / bg
fg                  # 把后台任务拿到前台
fg %1               # 把任务1拿到前台
bg                  # 把挂起的任务切到后台运行
bg %2               # 把任务2切到后台

# 挂起（Ctrl+Z）
# 当前任务暂停并放到后台

# nohup（持久后台运行）
nohup ./server.sh > server.log 2>&1 &
echo $!                      # 输出新进程 PID
```

---

## 七、进程资源限制

```bash
# ulimit
ulimit -a                     # 查看所有限制
ulimit -n 65535              # 最大打开文件描述符
ulimit -u 4096               # 最大用户进程数

# 永久限制（/etc/security/limits.conf）
# username soft nofile 65535
# username hard nofile 65535
# * soft nofile 65535
# * hard nofile 65535

# cgroup（容器/系统级资源限制）
# /sys/fs/cgroup/ 下管理
```

---

## 八、性能监控命令

```bash
# CPU / 内存
top -Hp PID             # 查看某进程的线程
vmstat 1               # 每秒系统状态（CPU/内存/IO）
mpstat 1               # 每 CPU 核心状态

# 磁盘 IO
iostat -x 1            # 详细 IO 统计
iotop                   # 进程级 IO 监控（需安装）

# 网络
iftop                   # 带宽监控（需安装）
nethogs                 # 按进程看流量（需安装）
watch -n1 'cat /proc/net/dev'  # 网络接口流量

# 综合
htop                    # 全能监控
glances                 # 更全面的监控工具（apt install glances）
```
