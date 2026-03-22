# Linux 用户与权限完整指南

> 用户管理、sudo 权限、ACL 访问控制、特殊权限位

## 目录

- [一、用户与用户组](#用户与用户组)
  - [用户账户文件](#用户账户文件)
  - [用户管理命令](#用户管理命令)
  - [用户组管理](#用户组管理)
- [二、sudo 权限管理](#sudo-权限管理)
  - [sudo 基本使用](#sudo-基本使用)
  - [visudo 与权限配置](#visudo-与权限配置)
- [三、文件权限详解](#文件权限详解)
  - [rwx 权限模型](#rwx-权限模型)
  - [chmod 详解](#chmod-详解)
  - [chown / chgrp](#chown--chgrp)
- [四、特殊权限位](#特殊权限位)
  - [SUID（Set UID）](#suid-set-uid)
  - [SGID（Set GID）](#sgid-set-gid)
  - [Sticky Bit（粘滞位）](#sticky-bit-粘滞位)
- [五、ACL 访问控制列表](#acl-访问控制列表)
- [六、常用权限场景速查](#常用权限场景速查)
- [七、权限问题排查](#权限问题排查)

---


## 一、用户与用户组

### 用户账户文件

```bash
# /etc/passwd — 用户账户信息
# 格式：username:password:uid:gid:comment:home:shell
root:x:0:0:root:/root:/bin/bash
ubuntu:x:1000:1000:Ubuntu User:/home/ubuntu:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin

# /etc/shadow — 加密密码（仅 root 可读）
# 格式：username:encrypted_password:last_change:min_age:max_age:warn:expire:disabled
ubuntu:$6$xyz:19650:0:99999:7:::

# /etc/group — 用户组信息
# 格式：group_name:password:gid:members
sudo:x:27:ubuntu
www-data:x:33:
```

### 用户管理命令

```bash
# 创建用户
useradd -m -s /bin/bash username        # 创建用户 + 主目录 + 默认 shell
useradd -m -d /home/john -s /bin/bash -G sudo,www-data john  # 指定组
useradd -r -s /sbin/nologin mysql       # 创建系统用户（无登录）

# 设置密码
passwd username
passwd                           # 修改当前用户密码
echo "password" | passwd --stdin username  # 非交互设置（脚本用）

# 删除用户
userdel username                 # 删除用户（保留主目录）
userdel -r username             # 删除用户及主目录

# 修改用户
usermod -l newname oldname      # 重命名
usermod -aG sudo username       # 追加到附加组（-a 必须）
usermod -g groupname username    # 修改主组
usermod -s /bin/bash username    # 修改登录 shell
usermod -L username             # 锁定账户（禁止登录）
usermod -U username             # 解锁账户
```

### 用户组管理

```bash
groupadd developers              # 创建组
groupdel developers              # 删除组
groupmod -n newname oldname     # 重命名组

# 查看用户组
groups username                 # 用户所在组
id username                     # UID/GID/所有组
cat /etc/group                  # 所有组信息
```

---

## 二、sudo 权限管理

### sudo 基本使用

```bash
# 普通用户临时获取 root 权限
sudo apt update
sudo -i            # 切换为 root 环境
sudo -u www-data whoami  # 以指定用户身份执行
sudo -l            # 查看当前用户 sudo 权限

# 免密码sudo（当前用户）
echo "$USER ALL=(ALL) NOPASSWD:ALL" | sudo tee /etc/sudoers.d/nopasswd
```

### visudo 与权限配置

```bash
# 编辑 sudoers 文件（语法检查，防止配置错误导致无法sudo）
sudo visudo

# 允许用户执行所有命令
username ALL=(ALL:ALL) ALL

# 允许用户无密码执行 apt
username ALL=(ALL) NOPASSWD: /usr/bin/apt

# 允许用户组无密码 sudo
%sudo ALL=(ALL) NOPASSWD: ALL

# 允许特定命令（仅限 reboot 和 systemctl）
username ALL=(ALL) NOPASSWD: /usr/sbin/reboot, /bin/systemctl
```

**⚠️ 切勿直接编辑 `/etc/sudoers`，必须用 `visudo`**

---

## 三、文件权限详解

### rwx 权限模型

```
权限位：  rwx rwx rwx
          ↑   ↑   ↑
        所有者 组   其他
r (read)    = 4  = 可以读取文件内容、列出目录文件
w (write)   = 2  = 可以修改文件内容、在目录中增删文件
x (execute) = 1  = 可以执行文件、可以进入目录

# 组合示例：
rwx = 7    r-x = 5    rw- = 6    --- = 0
```

### chmod 详解

```bash
# 数字方式（最常用）
chmod 755 script.sh          # rwxr-xr-x（所有者rwx，组和其他r-x）
chmod 644 app.conf           # rw-r--r--
chmod 600 id_rsa             # rw-------（私钥文件）
chmod 700 ~/.ssh             # rwx------（SSH 目录）
chmod 600 ~/.ssh/authorized_keys  # 公钥文件

# 字母方式（更直观）
chmod u+x script.sh          # 所有者加执行权限
chmod g-w file.txt           # 组去掉写权限
chmod o+r file.txt           # 其他用户加读权限
chmod a+x app                # 所有用户加执行
chmod -x app                 # 所有人去掉执行

# 组合
chmod u=rw,go=r file.txt    # 所有者rw，其他r
chmod +x app                 # 所有用户加执行（快捷方式）
```

### chown / chgrp

```bash
# 修改所有者
chown username file.txt
chown -R username /var/www/

# 修改所有者和组
chown username:group file.txt
chown -R www-data:www-data /var/www/html/

# 仅修改组
chgrp groupname file.txt

# 复制权限到另一个文件
chown --reference=file1.txt file2.txt
```

---

## 四、特殊权限位

### SUID（Set UID）

当可执行文件设置了 SUID 位，普通用户执行时会以**文件所有者**的身份运行：

```bash
# /usr/bin/passwd 就是一个例子
ls -l /usr/bin/passwd
# -rwsr-xr-x 1 root root ... /usr/bin/passwd
#    ↑ s（代替x，表示设置了 SUID）

# 设置 SUID
chmod u+s /usr/local/bin/myscript

# SUID 场景：
# 普通用户运行 passwd → 以 root 身份修改 /etc/shadow
# 危险！不要随意设置
```

### SGID（Set GID）

```bash
# 在目录上设置：目录下新建的文件自动继承目录组
chmod g+s /shared/project/

# 查看 SGID
ls -ld /shared/project/
# drwxrwsr-x 2 root root ... /shared/project/
#        ↑ s（代替x，表示设置了 SGID）
```

### Sticky Bit（粘滞位）

```bash
# /tmp 目录：只允许文件所有者删除自己的文件
ls -ld /tmp
# drwxrwxrwt 13 root root ... /tmp/
#           ↑ t（代替x，表示设置了 Sticky Bit）

chmod +t /shared/           # 设置粘滞位
```

---

## 五、ACL 访问控制列表

ACL 提供比传统权限更细粒度的控制：

```bash
# 安装（Ubuntu）
sudo apt install acl

# 查看 ACL
getfacl /path/to/file

# # file: app.conf
# # owner: root
# # group: www-data
# user::rw-
# group::r--
# other::r--

# 设置 ACL
setfacl -m u:www-data:rw /var/log/app.log          # 给用户 ACL
setfacl -m g:developers:rwx /shared/project/       # 给组 ACL
setfacl -m o::r /var/log/app.log                    # 给其他人设置

# 移除 ACL
setfacl -x u:www-data /var/log/app.log              # 移除单个
setfacl -b /var/log/app.log                         # 移除所有 ACL

# 默认 ACL（目录内新建文件自动继承）
setfacl -m d:u:www-data:rw /var/www/html/

# 递归 ACL
setfacl -R -m u:www-data:rwX /var/www/html/
# 注意：X（大写）= 对目录加执行，对文件不加执行（更安全）
```

---

## 六、常用权限场景速查

```bash
# Web 服务文件
chown -R www-data:www-data /var/www/html/   # 所有文件归 www-data
chmod -R 755 /var/www/html/                # 目录755
chmod -R 644 /var/www/html/*.html          # 文件644

# PHP 上传目录（需写权限）
chown www-data:www-data /var/www/html/uploads/
chmod 775 /var/www/html/uploads/           # 组有写权限
# 然后把用户加入 www-data 组
usermod -aG www-data $USER

# SSH 密钥
chmod 700 ~/.ssh/                          # 目录必须是 700
chmod 600 ~/.ssh/id_rsa                    # 私钥 600
chmod 644 ~/.ssh/id_rsa.pub                # 公钥 644

# 脚本文件
chmod +x deploy.sh                        # 可执行
chmod 755 deploy.sh

# 日志文件
touch /var/log/app.log
chown syslog:adm /var/log/app.log         # 常用日志所有者
chmod 640 /var/log/app.log

# 数据库文件（MySQL）
chown -R mysql:mysql /var/lib/mysql/
chmod 700 /var/lib/mysql/                  # 仅 MySQL 可访问
```

---

## 七、权限问题排查

```bash
# 排查步骤
ls -la /path/to/file          # 查看当前权限
id                            # 查看当前用户和组
groups                        # 查看当前用户所在组
getfacl /path/to/file         # 查看完整 ACL

# 常见问题
# 1. 普通用户无法写入 /var/www/html/
#    解决：chown www-data:www-data /var/www/html/ 或 usermod -aG www-data $USER

# 2. SSH 密钥登录失败
#    排查：chmod 700 ~/.ssh && chmod 600 ~/.ssh/authorized_keys

# 3. Apache/PHP 无法创建文件
#    排查：ps aux | grep apache → 看运行用户
#    解决：chown apache:apache /var/www/html/uploads/

# 4. 权限被继承问题
#    find /path -type f -exec chmod 644 {} \;
#    find /path -type d -exec chmod 755 {} \;
```
