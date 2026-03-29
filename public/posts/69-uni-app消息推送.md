# uni-app 消息推送

## 目录
1. [消息推送概述](#消息推送概述)
2. [uni-push 集成](#uni-push-集成)
3. [个推 SDK 集成](#个推-sdk-集成)
4. [本地通知](#本地通知)
5. [服务端推送](#服务端推送)
6. [消息处理](#消息处理)
7. [常见问题](#常见问题)

---

## 消息推送概述

### 推送方式对比

| 方式 | 平台 | 特点 |
|------|------|------|
| **uni-push** | App/小程序 | 官方方案，免费，集成简单 |
| **个推** | App | 国内主流，稳定性高 |
| **JPush（极光）** | App | 老牌推送，覆盖广 |
| **FCM** | Android/iOS | 谷歌官方，国内受限 |
| **APNs** | iOS | 苹果官方，必须集成 |
| **小程序订阅消息** | 微信/支付宝 | 小程序专属 |

### 推送流程

```
┌─────────────────────────────────────────────────┐
│                  推送全链路                        │
│                                                   │
│  用户设备  ←──── 推送服务商 ←──── 后端服务          │
│    │              (个推/JPush)      │              │
│    │                               │              │
│   注册 Token ──────────────────→ 存储 Token        │
│    │                               │              │
│   接收消息 ←──── 推送平台 ←──── 推送 API           │
└─────────────────────────────────────────────────┘
```

---

## uni-push 集成

### 1. 配置 manifest.json

```json
{
  "app-plus": {
    "distribute": {
      "sdkConfigs": {
        "push": {
          "unipush": {
            "appid": "__UNI__xxxx",
            "appkey": "你的appkey",
            "appsecret": "你的appsecret"
          }
        }
      }
    }
  }
}
```

### 2. 初始化推送

```javascript
// utils/push.js - uni-push 封装

/**
 * 初始化推送服务
 */
export function initPush() {
  // 获取推送标识
  const pushClientId = uni.getStorageSync('pushClientId')
  
  if (!pushClientId) {
    // 首次获取 clientId（推送 token）
    uni.getPushClientId({
      success(res) {
        console.log('[Push] clientId:', res.cid)
        uni.setStorageSync('pushClientId', res.cid)
        // 上报 token 到自己的服务器
        uploadPushToken(res.cid)
      },
      fail(err) {
        console.error('[Push] 获取 clientId 失败:', err)
      }
    })
  }

  // 监听推送消息
  listenPushMessage()
}

/**
 * 上报推送 token 到服务器
 */
async function uploadPushToken(cid) {
  try {
    await uni.$http.post('/api/user/push-token', {
      token: cid,
      platform: uni.getSystemInfoSync().uniPlatform,
      deviceId: uni.getSystemInfoSync().deviceId
    })
  } catch (err) {
    console.error('上报推送 token 失败:', err)
  }
}

/**
 * 监听推送消息
 */
export function listenPushMessage() {
  uni.onPushMessage((res) => {
    console.log('[Push] 收到推送消息:', res)
    
    const { type, data } = res
    
    switch (type) {
      case 'receive':
        // App 在前台，收到透传消息
        handleForegroundPush(data)
        break
      case 'click':
        // 用户点击通知栏消息
        handlePushClick(data)
        break
    }
  })
}

/**
 * 处理前台推送
 */
function handleForegroundPush(data) {
  const payload = parsePushPayload(data)
  
  // 显示应用内消息提示
  uni.showModal({
    title: payload.title || '新消息',
    content: payload.content,
    showCancel: false,
    confirmText: '查看',
    success() {
      navigateByPush(payload)
    }
  })

  // 更新消息角标
  updateBadge()
}

/**
 * 处理推送点击（从通知栏进入）
 */
function handlePushClick(data) {
  const payload = parsePushPayload(data)
  
  // 延迟执行，等待 App 启动
  setTimeout(() => {
    navigateByPush(payload)
  }, 500)
}

/**
 * 根据推送内容导航
 */
function navigateByPush(payload) {
  if (!payload.path) return
  
  uni.navigateTo({
    url: payload.path,
    fail() {
      // 跳转失败尝试 switchTab
      uni.switchTab({ url: payload.path })
    }
  })
}

/**
 * 解析推送 payload
 */
function parsePushPayload(data) {
  try {
    if (typeof data === 'string') {
      return JSON.parse(data)
    }
    return data
  } catch {
    return { content: String(data) }
  }
}
```

### 3. App.vue 中初始化

```javascript
// App.vue
import { initPush } from '@/utils/push'

export default {
  onLaunch(options) {
    // 处理冷启动时的推送点击
    if (options.referrerInfo?.extraData) {
      handlePushClick(options.referrerInfo.extraData)
    }
    
    // 初始化推送
    initPush()
  },
  
  onShow() {
    // App 进入前台，清除角标
    uni.setTabBarBadge({ index: 0, text: '' })
    plus?.runtime?.setBadgeNumber(0)
  }
}
```

---

## 个推 SDK 集成

### 1. manifest.json 配置

```json
{
  "app-plus": {
    "distribute": {
      "sdkConfigs": {
        "push": {
          "igexin": {
            "appid": "你的个推AppID",
            "appkey": "你的AppKey",
            "appsecret": "你的AppSecret"
          }
        }
      }
    }
  }
}
```

### 2. 获取推送 CID

```javascript
// 个推与 uni-push 接口相同，都使用 uni.getPushClientId
export function getGtCid() {
  return new Promise((resolve, reject) => {
    uni.getPushClientId({
      success: (res) => resolve(res.cid),
      fail: reject
    })
  })
}
```

---

## 本地通知

### 创建本地通知

```javascript
// utils/local-notification.js

/**
 * 创建本地通知
 * @param {Object} options
 */
export function showLocalNotification(options) {
  const {
    title,
    content,
    payload = {},
    delay = 0, // 延迟秒数
    sound = true
  } = options

  // #ifdef APP-PLUS
  const Android = plus.android
  const activity = Android.runtimeMainActivity()
  
  // 使用 plus.push 创建本地通知
  plus.push.createMessage(content, JSON.stringify(payload), {
    title,
    delay,
    sound: sound ? 'system' : 'none',
    vibrate: true,
    icon: '/static/notification-icon.png'
  })
  // #endif

  // #ifdef MP-WEIXIN
  // 微信小程序没有本地通知，使用订阅消息代替
  console.warn('微信小程序不支持本地通知，请使用订阅消息')
  // #endif
}

/**
 * 取消所有本地通知
 */
export function cancelAllNotifications() {
  // #ifdef APP-PLUS
  plus.push.clearAllMessage()
  // #endif
}

/**
 * 设置应用角标数字
 */
export function setBadgeNumber(num) {
  // #ifdef APP-PLUS
  plus.runtime.setBadgeNumber(num)
  // #endif

  // #ifdef MP-WEIXIN
  wx.setTabBarBadge({ index: 0, text: num > 0 ? String(num) : '' })
  // #endif
}
```

---

## 微信订阅消息（小程序）

```javascript
// utils/subscribe-message.js

/**
 * 微信小程序订阅消息
 * @param {Array} tmplIds - 消息模板 ID 列表
 */
export async function subscribeMessage(tmplIds) {
  return new Promise((resolve, reject) => {
    // #ifdef MP-WEIXIN
    wx.requestSubscribeMessage({
      tmplIds,
      success(res) {
        // res 中每个模板的状态：accept/reject/ban/filter
        const accepted = tmplIds.filter(id => res[id] === 'accept')
        resolve(accepted)
      },
      fail(err) {
        // 用户未授权
        if (err.errCode === 20004) {
          uni.showModal({
            title: '开启通知',
            content: '请允许接收消息通知，以便及时获取重要信息',
            confirmText: '去设置',
            success({ confirm }) {
              if (confirm) {
                wx.openSetting()
              }
            }
          })
        }
        reject(err)
      }
    })
    // #endif
  })
}

/**
 * 在关键操作前请求订阅（需要用户手势触发）
 */
export async function requestSubscribeBeforeAction(tmplIds, action) {
  try {
    await subscribeMessage(tmplIds)
  } catch (err) {
    console.warn('用户拒绝订阅消息')
  }
  
  // 无论订阅成功与否，继续执行业务
  return action()
}
```

---

## 服务端推送

### Node.js 服务端推送示例

```javascript
// server/push-service.js
const GtPush = require('getui-sdk-nodejs') // 个推 SDK

class PushService {
  constructor() {
    this.gt = new GtPush({
      appId: process.env.GT_APP_ID,
      appKey: process.env.GT_APP_KEY,
      appSecret: process.env.GT_APP_SECRET,
      masterSecret: process.env.GT_MASTER_SECRET
    })
  }

  /**
   * 推送给单个设备
   */
  async pushToSingle(cid, title, content, payload = {}) {
    const template = this.gt.getTransmissionTemplate({
      transmissionType: 1,
      transmissionContent: JSON.stringify({
        title,
        content,
        ...payload
      })
    })

    const message = this.gt.getSingleMessage({
      isOffline: true,
      offlineExpireTime: 3600000, // 离线保留1小时
      data: template
    })

    const target = this.gt.getSingleTarget({ clientId: cid })

    try {
      const result = await this.gt.pushMessageToSingle({ message, target })
      console.log('推送成功:', result)
      return result
    } catch (err) {
      console.error('推送失败:', err)
      throw err
    }
  }

  /**
   * 批量推送
   */
  async pushToList(cids, title, content, payload = {}) {
    const template = this.gt.getTransmissionTemplate({
      transmissionContent: JSON.stringify({ title, content, ...payload })
    })

    const message = this.gt.getListMessage({
      isOffline: true,
      offlineExpireTime: 3600000,
      data: template
    })

    const taskId = await this.gt.getContentId({ message })
    
    const targets = cids.map(cid => this.gt.getSingleTarget({ clientId: cid }))
    
    return this.gt.pushMessageToList({ taskId, targetList: targets })
  }

  /**
   * 全量推送
   */
  async pushToAll(title, content, payload = {}) {
    const template = this.gt.getTransmissionTemplate({
      transmissionContent: JSON.stringify({ title, content, ...payload })
    })

    const message = this.gt.getAppMessage({
      isOffline: true,
      offlineExpireTime: 86400000,
      data: template,
      speed: 10000 // 每秒推送数量
    })

    return this.gt.pushMessageToApp({ message })
  }
}

module.exports = new PushService()
```

---

## 常见问题

### 1. iOS 推送权限申请

```javascript
// App 启动时申请推送权限（iOS）
function requestPushPermission() {
  // #ifdef APP-PLUS
  const push = plus.push
  const platform = plus.os.name.toLowerCase()
  
  if (platform === 'ios') {
    // iOS 需要主动申请
    push.register(
      (cid) => {
        console.log('iOS 推送注册成功, CID:', cid)
        uploadPushToken(cid)
      },
      (err) => {
        console.error('iOS 推送注册失败:', err)
        // 引导用户去设置页开启通知
        showPermissionGuide()
      }
    )
  }
  // #endif
}

function showPermissionGuide() {
  uni.showModal({
    title: '开启推送通知',
    content: '您已关闭推送通知，开启后可及时收到消息',
    confirmText: '去开启',
    success({ confirm }) {
      if (confirm) {
        // #ifdef APP-PLUS
        // 跳转到系统设置
        plus.runtime.openURL(
          'app-settings:' // iOS 跳转 App 设置
        )
        // #endif
      }
    }
  })
}
```

### 2. 推送消息去重

```javascript
// 使用消息 ID 去重，避免重复处理
const processedMsgIds = new Set()

function handlePushMessage(data) {
  const { msgId } = data
  
  if (msgId && processedMsgIds.has(msgId)) {
    return // 已处理过，跳过
  }
  
  if (msgId) processedMsgIds.add(msgId)
  
  // 处理消息...
  
  // 超过 100 条清理旧 ID
  if (processedMsgIds.size > 100) {
    const first = processedMsgIds.values().next().value
    processedMsgIds.delete(first)
  }
}
```

### 3. 后台推送与前台推送区分

```javascript
uni.onPushMessage((res) => {
  const isBackground = res.type === 'click' // 从通知栏点击进入
  const isForeground = res.type === 'receive' // 应用在前台收到

  if (isForeground) {
    // 前台：显示应用内弹窗或角标
    showInAppNotification(res.data)
  } else {
    // 后台点击：直接跳转目标页
    navigateByPush(parsePushPayload(res.data))
  }
})
```
