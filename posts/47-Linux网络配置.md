# Linux 网络配置完整指南

> IP 地址、网卡配置、DNS、防火墙、网络诊断

## 目录
- [一、网络基础配置](#网络基础配置)
- [二、临时配置网络](#临时配置网络)
- [三、永久网络配置](#永久网络配置)
- [四、防火墙 ufw / iptables / firewalld](#防火墙-ufw--iptables--firewalld)
- [五、网络诊断命令](#网络诊断命令)
- [六、SSH 隧道与代理](#ssh-隧道与代理)
- [七、网络故障排查流程](#网络故障排查流程)
- [八、实用网络配置示例](#实用网络配置示例)

---


## 一、网络基础配置

### 查看网络信息

```bash
# 查看 IP 地址
ip addr                         # 完整网络信息
ip addr show eth0               # 指定网卡
ip -4 addr                      # 仅 IPv4
hostname -I                     # 仅 IP（无其他信息）

# ifconfig（老版，需安装）
apt install net-tools
ifconfig
ifconfig eth0

# 查看网关
ip route
route -n

# 查看 DNS
cat /etc/resolv.conf
# nameserver 8.8.8.8
# nameserver 8.8.4.4

# 查看主机名
hostname
cat /etc/hostname
```

---

## 二、临时配置网络

```bash
# 临时设置 IP（重启后失效）
ip addr add 192.168.1.100/24 dev eth0
ip addr del 192.168.1.100/24 dev eth0

# 临时设置网关
ip route add default via 192.168.1.1
ip route del default via 192.168.1.1

# 启用/禁用网卡
ip link set eth0 up
ip link set eth0 down

# 临时修改 DNS（重启后失效）
echo "nameserver 8.8.8.8" > /etc/resolv.conf
```

---

## 三、永久网络配置

### Ubuntu（Netplan）

```bash
# Ubuntu 18+ 使用 Netplan
cat /etc/netplan/00-installer-config.yaml
# network:
#   version: 2
#   renderer: networkd
#   ethernets:
#     eth0:
#       addresses:
#         - 192.168.1.100/24
#       gateway4: 192.168.1.1
#       nameservers:
#         addresses:
#           - 8.8.8.8
#           - 8.8.4.4
#       dhcp4: true

# 静态 IP 配置示例
cat /etc/netplan/01-netcfg.yaml
network:
  version: 2
  ethernets:
    eth0:
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 1.1.1.1
      dhcp4: false

# 应用配置
sudo netplan apply
sudo netplan --debug apply   # 调试模式
```

### CentOS/Rocky Linux

```bash
# /etc/sysconfig/network-scripts/ifcfg-eth0
cat /etc/sysconfig/network-scripts/ifcfg-eth0
# TYPE="Ethernet"
# BOOTPROTO="static"
# NAME="eth0"
# DEVICE="eth0"
# ONBOOT="yes"
# IPADDR=192.168.1.100
# NETMASK=255.255.255.0
# GATEWAY=192.168.1.1
# DNS1=8.8.8.8
# DNS2=1.1.1.1

# 重启网络
sudo systemctl restart network
```

---

## 四、防火墙 ufw / iptables / firewalld

### ufw（Ubuntu 推荐）

```bash
# 基本操作
sudo ufw status                  # 查看状态
sudo ufw enable                  # 启用防火墙
sudo ufw disable                 # 禁用防火墙
sudo ufw reset                   # 重置所有规则

# 规则管理
sudo ufw allow 80/tcp            # 允许 80 端口
sudo ufw deny 22/tcp            # 拒绝 22 端口
sudo ufw allow 1000:2000/udp     # 允许端口范围
sudo ufw allow from 192.168.1.0/24 to any port 22  # 允许 IP 段

# 删除规则
sudo ufw status numbered         # 显示规则编号
sudo ufw delete 3               # 删除第3条规则
sudo ufw delete allow 80/tcp   # 删除允许 80 的规则

# 应用配置文件
sudo ufw allow /etc/ufw/applications.d/nginx.ini

# 日志
sudo ufw logging on
sudo ufw logging low|medium|high|off
```

### iptables（通用）

```bash
# 查看规则
sudo iptables -L -n -v           # 详细查看
sudo iptables -L -n --line-numbers  # 带行号

# 基本链：INPUT（入站）OUTPUT（出站）FORWARD（转发）
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT    # 允许80
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT    # 允许22
sudo iptables -A INPUT -j DROP                          # 默认拒绝

# 保存规则（重启后生效）
sudo apt install iptables-persistent
sudo netfilter-persistent save

# 清空规则
sudo iptables -F
sudo iptables -X
sudo iptables -t nat -F
```

### firewalld（CentOS/Rocky）

```bash
sudo firewall-cmd --state              # 查看状态
sudo firewall-cmd --list-all           # 列出规则
sudo firewall-cmd --add-port=80/tcp   # 临时开放端口
sudo firewall-cmd --permanent --add-port=80/tcp  # 永久开放
sudo firewall-cmd --reload             # 重载规则
sudo firewall-cmd --list-services      # 查看允许的服务
sudo firewall-cmd --add-service=http   # 开放 http 服务
```

---

## 五、网络诊断命令

### 连通性测试

```bash
ping -c 4 baidu.com             # Ping 测试
ping -i 0.5 baidu.com           # 每0.5秒
ping -s 1000 baidu.com          # 大包 Ping
traceroute baidu.com            # 路由追踪（UDP）
traceroute -I baidu.com        # ICMP 追踪
tracert baidu.com               # Windows 命令

mtr baidu.com                   # 实时路由 + Ping（最强）
# mtr -r baidu.com              # 生成报告
```

### 端口与连接

```bash
# 测试端口连通性
nc -zv 192.168.1.1 80          # TCP 扫描
nc -zv 192.168.1.1 1-1000      # 扫描端口范围

# 端口扫描
nmap -sT localhost              # TCP 连接扫描
nmap -sU localhost              # UDP 扫描
nmap -p 80,443 example.com     # 指定端口
nmap -O example.com             # 系统检测
nmap -A example.com             # 全面检测

# 连接状态
ss -tlnp                        # 监听端口（推荐）
netstat -tlnp                   # 老版
ss -s                           # 连接统计
```

### 流量与抓包

```bash
# tcpdump（抓包）
sudo tcpdump -i eth0             # 监听网卡
sudo tcpdump -i eth0 port 80    # 只抓 HTTP
sudo tcpdump -i eth0 host 192.168.1.1  # 过滤 IP
sudo tcpdump -i eth0 -w /tmp/capture.pcap  # 保存到文件
sudo tcpdump -r /tmp/capture.pcap          # 读取文件

# 常用过滤
tcpdump -i eth0 'tcp port 80'          # HTTP
tcpdump -i eth0 'tcp[tcpflags] == tcp-syn'  # SYN 包
tcpdump -i eth0 'src 192.168.1.100'    # 源 IP

# 查看流量
iftop -i eth0                    # 实时带宽
nethogs                          # 按进程
watch -n 1 '/sbin/ifconfig eth0 | grep bytes'
```

### DNS 查询

```bash
dig example.com                  # 完整 DNS 查询
dig example.com A                # A 记录
dig example.com MX              # 邮件记录
dig +short example.com          # 仅返回结果
nslookup example.com             # 老版命令
host example.com                # 简单查询
```

---

## 六、SSH 隧道与代理

```bash
# 本地端口转发（访问远程内网服务）
ssh -L 8080:localhost:80 user@server
# 访问本地 8080 → 跳转到 server 的 80

# 远程端口转发（从远程访问本地）
ssh -R 8080:localhost:80 user@server

# 动态 SOCKS 代理
ssh -D 1080 user@server
# 浏览器/应用配置 SOCKS5 代理 localhost:1080 即可

# SSH 跳板机
ssh -J user1@jump-server user2@target-server
```

---

## 七、网络故障排查流程

```bash
# 1. 检查物理连接
ip link show eth0               # UP/DOWN 状态
ethtool eth0                    # 网卡详细信息

# 2. 检查 IP 配置
ip addr
ip route

# 3. 测试网关
ping -c 2 192.168.1.1          # Ping 网关
traceroute 8.8.8.8            # 测试外网

# 4. 测试 DNS
ping baidu.com
dig baidu.com

# 5. 检查防火墙
sudo ufw status
sudo iptables -L -n

# 6. 检查端口监听
ss -tlnp | grep :80
```

---

## 八、实用网络配置示例

```bash
# 多网卡路由
ip route add 10.0.0.0/8 via 192.168.1.1 dev eth1

# 添加静态路由
ip route add 172.16.0.0/12 via 192.168.2.1

# 修改 MTU（解决大文件传输问题）
ip link set eth0 mtu 1400

# 网卡别名（多 IP）
ip addr add 192.168.1.101/24 dev eth0 label eth0:1

# 绑定 IP 到网卡（防 ARP 欺骗）
arp -s 192.168.1.1 aa:bb:cc:dd:ee:ff
```
