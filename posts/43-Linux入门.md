# Linux 入门完整指南

> 从安装到基础操作，全面掌握 Linux

## 目录
- [一、Linux 简介](#linux-简介)
- [二、文件系统结构](#文件系统结构)
- [三、基础命令](#基础命令)
- [四、用户与权限](#用户与权限)
- [五、软件安装](#软件安装)
- [六、进程管理](#进程管理)
- [七、网络基础](#网络基础)
- [八、SSH 与远程连接](#ssh-与远程连接)
- [九、实用技巧](#实用技巧)

---


## 一、Linux 简介

### 什么是 Linux

Linux 是一个**开源、免费**的操作系统内核，由 Linus Torvalds 于 1991 年创建。基于 Linux 内核的完整操作系统称为 **Linux 发行版**。

### 常见发行版

| 发行版 | 特点 | 适用场景 |
|--------|------|----------|
| Ubuntu | 易用、社区活跃 | 桌面、开发服务器 |
| Debian | 稳定、软件丰富 | 生产服务器 |
| CentOS/Rocky Linux | 企业级稳定 | 生产服务器 |
| Fedora | 最新技术 | 桌面、开发 |
| Kali Linux | 安全渗透测试 | 网络安全 |

### 安装与启动

```bash
# 虚拟机安装（VirtualBox / VMware）
# 下载 ISO → 创建虚拟机 → 挂载 ISO → 安装

# 云服务器购买后连接
ssh root@服务器IP
# 输入密码（或上传公钥）

# 本地安装（WSL for Windows）
wsl --install
wsl --list -v

# macOS 直接使用
# 打开 Terminal，默认就是 bash/zsh
```

---

## 二、文件系统结构

```bash
/                    # 根目录，所有文件的起点
├── bin/             # 常用可执行文件（所有用户可用）
├── sbin/            # 系统管理命令（root 用户）
├── etc/             # 系统配置文件
│   ├── passwd       # 用户账户信息
│   ├── shadow       # 加密密码
│   ├── sysconfig/   # 系统服务配置
│   └── nginx/       # Nginx 配置
├── home/            # 普通用户主目录
│   └── username/    # 用户家目录
├── root/            # root 用户主目录
├── var/             # 经常变化的文件（日志、数据库）
│   ├── log/         # 系统日志
│   ├── www/         # Web 站点目录
│   └── lib/         # 服务数据
├── tmp/             # 临时文件
├── usr/             # 用户程序（/usr/local）
├── boot/            # 启动相关文件
├── dev/             # 设备文件
└── proc/            # 内核信息虚拟文件系统
```

**常用目录速查：**

```bash
~          # 当前用户主目录（等价于 $HOME）
.          # 当前目录
..         # 上一级目录
-          # 上一次所在目录
/          # 根目录
```

---

## 三、基础命令

### 目录操作

---

## 四、用户与权限

### 用户管理

```bash
# 查看用户
whoami              # 当前用户名
who                 # 登录用户列表
id                  # 当前用户详细信息

# 添加/删除用户
useradd -m -s /bin/bash username  # 创建用户
userdel -r username                # 删除用户
passwd username                     # 设置密码

# 切换用户
su - username      # 切换用户（加载环境）
sudo command       # 以 root 权限执行单个命令
sudo -i            # 切换到 root 环境
```

### 权限体系

```bash
# 查看权限
ls -l file.txt
# -rw-r--r--  1 owner group  4096  date  file.txt
#  ↑  ↑  ↑  ↑  ↑    ↑       ↑     ↑     ↑
# 类型 所有者   组    硬链接  大小  时间  文件名
#      权限   权限

# 权限说明
# rwx = 读(4) + 写(2) + 执行(1)
# rwxr-xr-x = 755 = 所有者:rwx 组:r-x 其他:r-x
# rw-r--r-- = 644
# rwx------ = 700
```

```bash
# 修改权限
chmod 755 file.txt          # 数字方式
chmod u+x script.sh         # 给所有者加执行权限
chmod a-w file.txt          # 移除所有用户写权限
chmod -R 644 /var/www/      # 递归修改

# 修改所有者
chown user:group file.txt   # 修改文件所有者和组
chown -R user:group /dir/   # 递归修改
chgrp group file.txt         # 仅修改组
```

---

## 五、软件安装

```bash
# Ubuntu/Debian (apt)
sudo apt update              # 更新软件源
sudo apt upgrade            # 升级所有包
sudo apt install nginx       # 安装软件
sudo apt remove nginx        # 卸载
sudo apt search nginx        # 搜索软件

# CentOS/RHEL (yum/dnf)
sudo yum install nginx
sudo yum update
sudo dnf install nginx

# npm (Node.js)
npm install -g express
npm install express          # 项目本地安装

# Python pip
pip install flask
pip3 install numpy
```

---

## 六、进程管理

```bash
# 查看进程
ps aux                 # 所有进程
ps -ef | grep nginx    # 查找 nginx 进程
top                   # 动态进程监控（q 退出）
htop                  # 增强版进程监控（需安装）

# 终止进程
kill PID              # 温和终止
kill -9 PID           # 强制终止（危险）
killall nginx         # 按名字终止

# 后台运行
command &              # 后台运行
nohup command &        # 持久后台运行（关闭终端也继续）
ctrl+z                 # 挂起当前任务
jobs                   # 查看后台任务
bg 1                   # 把任务1切到后台
fg 1                   # 把任务1切回前台
```

---

## 七、网络基础

```bash
# 查看 IP 和网络信息
ip addr                # 查看 IP 地址
ifconfig              # 老版命令（需安装）
hostname -I            # 仅 IP 地址

# 测试连接
ping -c 4 google.com   # Ping 测试
curl https://baidu.com  # 测试 HTTP 请求
wget https://url/file   # 下载文件

# 端口与连接
netstat -tlnp           # 查看监听端口
ss -tlnp                # 现代版（更快）
lsof -i:8080            # 查看端口占用
```

---

## 八、SSH 与远程连接

```bash
# 基本连接
ssh username@服务器IP
ssh -p 2222 username@服务器IP   # 指定端口

# 免密码登录（公钥认证）
ssh-keygen -t ed25519 -C "your@email.com"
ssh-copy-id username@服务器IP   # 自动上传公钥

# 远程文件传输
scp file.txt username@server:/path/       # 上传
scp username@server:/path/file.txt .        # 下载
scp -r ./local-dir/ username@server:/path/ # 递归传输

# SSH 配置别名（~/.ssh/config）
Host myserver
    HostName 192.168.1.100
    User ubuntu
    Port 22
    IdentityFile ~/.ssh/id_ed25519
# 使用：ssh myserver
```

---

## 九、实用技巧

```bash
# 命令历史
history                # 查看历史命令
!123                  # 执行第123条命令
!!                    # 执行上一条命令
!grep                 # 执行最近一条含 grep 的命令

# 快捷键
Ctrl+C                # 取消当前命令
Ctrl+Z                # 挂起当前任务
Ctrl+D                # 退出当前 Shell
Ctrl+L                # 清屏（等同 clear）
Ctrl+A / Ctrl+E       # 行首 / 行尾
Tab                   # 自动补全（按两下列出所有）
Ctrl+R                # 搜索历史命令

# 压缩与解压
tar -czvf archive.tar.gz dir/     # 压缩
tar -xzvf archive.tar.gz          # 解压
tar -xzvf archive.tar.gz -C /path/ # 解压到指定目录
zip -r archive.zip dir/            # ZIP 压缩
unzip archive.zip                  # 解压 ZIP

# 磁盘使用
df -h                  # 查看磁盘使用
du -sh *               # 查看当前目录各文件大小
du -sh /path           # 查看指定目录大小
```
