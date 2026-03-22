# Linux 常用命令速查

> 日常运维必备命令，覆盖文件、网络、进程、文本处理

## 目录

- [一、文件与目录命令](#文件与目录命令)
  - [基础操作](#基础操作)
  - [复制/移动/重命名](#复制移动重命名)
- [二、文本处理命令](#文本处理命令)
  - [cat / head / tail](#cat--head--tail)
  - [grep 文本搜索](#grep-文本搜索)
  - [awk / sed](#awk--sed)
  - [sort / uniq / wc](#sort--uniq--wc)
- [三、进程与系统监控](#进程与系统监控)
  - [top / htop](#top--htop)
  - [ps / pgrep](#ps--pgrep)
  - [内存与磁盘](#内存与磁盘)
- [四、网络命令](#网络命令)
- [五、系统管理](#系统管理)
- [六、日志查看](#日志查看)
- [七、管道与组合](#管道与组合)
- [八、快捷操作](#快捷操作)

---


## 一、文件与目录命令

### 基础操作

```bash
# 切换与路径
pwd                 # 当前目录
cd /var/log         # 切换到指定目录
cd ~                # 主目录
cd ..               # 上级目录
cd -                # 上次目录

# 列出
ls -la              # 详细信息 + 隐藏文件
ls -lh              # 人性化大小
ls -lt              # 按时间排序
ls -S               # 按大小排序
ls -a               # 含隐藏文件
ls -R               # 递归子目录
ll                  # 等价 ls -la（alias）

# 创建/删除
touch app.log              # 创建空文件
mkdir -p project/src/components  # 递归创建
rm -rf dist/              # 强制递归删除
rmdir empty-dir/          # 删除空目录
```

### 复制/移动/重命名

```bash
cp file.txt /backup/                # 复制到目录
cp -r src/ dist/                    # 递归复制目录
cp *.log /var/log/                  # 复制匹配文件
cp -p file.txt /backup/            # 保留属性

mv file.txt /newpath/               # 移动
mv oldname.txt newname.txt          # 重命名
mv file1.txt file2.txt /target/    # 移动多个文件
```

---

## 二、文本处理命令

### cat / head / tail

```bash
cat file.txt                        # 全文输出
cat -n file.txt                     # 带行号
cat file1.txt file2.txt > all.txt  # 合并文件

head -20 file.txt                   # 前20行
head -n 5 file.txt                  # 前5行
tail -50 file.txt                   # 后50行
tail -f /var/log/nginx/access.log   # 实时追踪日志
tail -n +5 file.txt                 # 从第5行开始到末尾

# 日志查看常用组合
tail -f app.log | grep ERROR        # 实时过滤 ERROR
tail -n 100 app.log | head -20      # 最后100行中的前20行
```

### grep 文本搜索

```bash
grep "error" app.log                # 基本搜索
grep -i "error" app.log             # 忽略大小写
grep -n "error" app.log             # 显示行号
grep -r "TODO" src/                 # 递归搜索目录
grep -v "debug" app.log             # 反向匹配（不包含的）
grep -c "error" app.log             # 统计匹配行数
grep -A5 "error" app.log            # 匹配行及后5行
grep -B3 "error" app.log            # 匹配行及前3行

# 正则搜索
grep -E "error|warning" app.log    # 或匹配
grep -E "^2024" app.log             # 以2024开头
grep "userId=\d+" app.log           # 数字ID
```

### awk / sed

```bash
# awk：列提取与数据处理
awk '{print $1}' file.txt           # 第1列
awk -F: '{print $1, $3}' /etc/passwd  # 指定分隔符
awk 'NR==5' file.txt               # 第5行
awk 'NR>1 && NR<=10' file.txt      # 第2-10行
awk '/error/ {print $0}' app.log   # 含 error 的行
awk '{sum+=$2} END {print sum}' file.txt  # 第2列求和

# sed：流编辑器
sed 's/old/new/g' file.txt         # 全局替换
sed -i 's/old/new/g' file.txt       # 直接修改文件
sed '5d' file.txt                  # 删除第5行
sed '1,3d' file.txt                # 删除1-3行
sed -n '5,10p' file.txt            # 提取5-10行
sed '/error/d' file.txt            # 删除含 error 的行
```

### sort / uniq / wc

```bash
sort file.txt                       # 排序
sort -u file.txt                    # 排序并去重
sort -k2 -t, file.csv              # 按第2列排序
sort -rn file.txt                   # 数字降序

uniq file.txt                       # 去重（相邻相同才去）
uniq -c file.txt                    # 统计重复次数
uniq -d file.txt                    # 只输出重复行

wc file.txt                         # 行数、词数、字符数
wc -l file.txt                      # 只看行数
wc -w file.txt                      # 只看词数
```

---

## 三、进程与系统监控

### top / htop

```bash
top                         # 动态监控进程
# 常用交互：
# q       - 退出
# k       - 杀死进程（输入 PID）
# M       - 按内存排序
# P       - 按 CPU 排序
# 1       - 显示所有 CPU 核心
# top -u www-data          - 查看某用户进程
# top -p PID1,PID2         - 监控特定进程

htop                        # 更友好的界面（需安装）
# apt install htop
```

### ps / pgrep

```bash
ps aux                      # 所有进程（BSD 格式）
ps -ef                      # 所有进程（标准格式）
ps -ef | grep nginx         # 查找 nginx 进程
ps -o pid,ppid,cmd,etime    # 自定义列：PID/父PID/命令/运行时长

pgrep nginx                  # 查找进程 PID
pgrep -u www-data nginx      # 查找某用户的进程
pkill nginx                  # 按名字杀进程
killall node                 # 按名字杀所有进程
```

### 内存与磁盘

```bash
free -h                     # 内存使用（人性化）
free -m                     # MB 为单位
df -h                       # 磁盘使用
df -h --output=source,size,pcent,target  # 自定义列
du -sh *                     # 当前目录各子项大小
du -sh /var/log/            # 指定目录总大小
du -ah --max-depth=1 /home/ # 限制深度
```

---

## 四、网络命令

```bash
# 查看连接
ip addr                     # IP 地址
ip addr show eth0           # 指定网卡
ifconfig                    # 老版（需安装 net-tools）

# 测试连通性
ping -c 4 baidu.com         # Ping（4次）
ping -i 0.5 baidu.com       # 每0.5秒
traceroute baidu.com        # 路由追踪
tracepath baidu.com         # 现代替代

# 端口与连接
ss -tlnp                    # 监听端口（推荐）
netstat -tlnp               # 老版
lsof -i :8080               # 端口被谁占用
lsof -i TCP                 # TCP 连接
fuser 80/tcp                # 端口使用情况

# 下载与传输
curl https://api.example.com          # GET 请求
curl -X POST -d "name=test" url        # POST 请求
curl -H "Authorization: Bearer xxx" url # 带 Header
wget https://example.com/file.zip      # 下载
scp file.txt user@host:/path/          # 远程复制
rsync -avz src/ user@host:/path/       # 增量同步
```

---

## 五、系统管理

```bash
# 系统信息
uname -a                     # 全部系统信息
cat /etc/os-release          # 操作系统版本
hostname                     # 主机名
uptime                       # 运行时间
whoami                       # 当前用户

# 资源限制
ulimit -a                    # 查看所有限制
ulimit -n 65535              # 设置最大文件描述符

# 服务管理
systemctl status nginx       # 查看服务状态
systemctl start nginx         # 启动
systemctl stop nginx          # 停止
systemctl restart nginx       # 重启
systemctl enable nginx        # 开机自启
systemctl disable nginx       # 关闭开机自启
systemctl reload nginx        # 重载配置（不重启）
```

---

## 六、日志查看

```bash
# 系统日志
cat /var/log/syslog          # 系统日志（Ubuntu）
cat /var/log/messages         # 系统日志（CentOS）
cat /var/log/secure           # 安全日志

# Nginx 日志
tail -f /var/log/nginx/access.log     # 访问日志
tail -f /var/log/nginx/error.log       # 错误日志

# Docker 日志
docker logs -f container_name
docker logs --tail 100 container_name
docker logs --since 1h container_name

# journalctl（systemd）
journalctl -u nginx.service           # 指定服务日志
journalctl -f                           # 实时追踪
journalctl --since "1 hour ago"
journalctl -b                           # 本次启动日志
```

---

## 七、管道与组合

```bash
# 管道连接多个命令
cat app.log | grep error | wc -l      # 统计 error 行数
cat app.log | grep -v debug | tail -50 # 排除 debug 取后50行

# 查找大文件
find / -type f -size +100M 2>/dev/null | sort -rh

# 统计访问量最高 IP
cat access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -20

# 清理日志文件
> /var/log/app.log     # 清空日志（保留文件）
find /var/log -name "*.log" -mtime +7 -exec rm {} \;  # 删除7天前日志

# 批量操作
for f in *.txt; do echo "$f"; done     # 遍历文件
for i in {1..10}; do touch "file_$i.txt"; done  # 批量创建
find . -name "*.bak" -exec rm {} \;    # 批量删除
```

---

## 八、快捷操作

```bash
# !! 上一条命令
sudo !!
apt update && sudo !!

# ; 和 &&
echo "1"; echo "2"      # 顺序执行，不考虑结果
make && make install     # 成功才执行下一个
make || echo "失败"

# 命令行编辑
Ctrl+A / Ctrl+E          # 行首 / 行尾
Ctrl+U                   # 删除光标前
Ctrl+K                   # 删除光标后
Ctrl+W                   # 删除光标前一个词
Ctrl+Y                   # 粘贴 Ctrl+U/K 删除的内容

# 输出重定向
command > output.txt     # 覆盖
command >> output.txt    # 追加
command 2> error.txt     # 错误输出
command > all.txt 2>&1   # 标准输出和错误都重定向
command &> all.txt        # 同上（简写）
```
