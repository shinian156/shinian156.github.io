# uni-app 集成微信支付宝支付

## 目录
1. [支付概述](#支付概述)
2. [微信支付集成](#微信支付集成)
3. [支付宝支付集成](#支付宝支付集成)
4. [统一支付封装](#统一支付封装)
5. [服务端对接](#服务端对接)
6. [常见问题](#常见问题)

---

## 支付概述

### 支付流程

```
用户点击支付
     │
     ▼
前端调用后端下单接口
     │
     ▼
后端创建订单，调用支付平台 API
     │
     ▼
后端返回支付参数（签名等）
     │
     ▼
前端调用 uni.requestPayment
     │
     ▼
唤起支付 App（微信/支付宝）
     │
     ├─ 用户支付成功 ──▶ 支付平台回调后端 ──▶ 更新订单
     └─ 用户取消/失败 ──▶ 前端处理错误
```

### 环境要求

| 平台 | 微信支付 | 支付宝支付 |
|------|---------|-----------|
| 微信小程序 | ✅ | ❌ |
| 支付宝小程序 | ❌ | ✅ |
| App（Android/iOS） | ✅ | ✅ |
| H5 | ✅（微信内）| ✅（支付宝内）|

---

## 微信支付集成

### 1. 微信小程序支付

```javascript
// utils/payment/wechat.js

/**
 * 微信小程序支付
 * @param {Object} orderData - 后端返回的支付参数
 */
export async function wxMiniPay(orderData) {
  const {
    timeStamp,
    nonceStr,
    package: packageStr,
    signType,
    paySign
  } = orderData

  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'wxpay',
      timeStamp,
      nonceStr,
      package: packageStr,
      signType,
      paySign,
      success(res) {
        console.log('微信支付成功:', res)
        resolve(res)
      },
      fail(err) {
        console.error('微信支付失败:', err)
        // err.errMsg 常见值：
        // 'requestPayment:fail cancel' - 用户取消
        // 'requestPayment:fail' - 支付失败
        reject(err)
      }
    })
  })
}
```

```javascript
// 微信小程序支付 - 完整业务流程
export async function handleWxPay(goodsInfo) {
  try {
    // 1. 显示加载
    uni.showLoading({ title: '正在创建订单...' })

    // 2. 调用后端创建订单接口
    const orderRes = await createOrder({
      goodsId: goodsInfo.id,
      amount: goodsInfo.price,
      payType: 'wechat'
    })

    uni.showLoading({ title: '正在唤起支付...' })

    // 3. 调用微信支付
    await wxMiniPay(orderRes.data.payParams)

    // 4. 支付成功处理
    uni.hideLoading()
    uni.showToast({ title: '支付成功', icon: 'success' })

    // 5. 查询订单状态（防止回调延迟）
    await queryOrderStatus(orderRes.data.orderId)

  } catch (err) {
    uni.hideLoading()
    
    if (err.errMsg && err.errMsg.includes('cancel')) {
      // 用户主动取消
      uni.showToast({ title: '已取消支付', icon: 'none' })
    } else {
      uni.showToast({ title: '支付失败，请重试', icon: 'none' })
    }
  }
}
```

### 2. App 端微信支付

```javascript
// App 端微信支付（需要配置 manifest.json）
export async function wxAppPay(orderData) {
  const {
    appid,
    partnerid,
    prepayid,
    noncestr,
    timestamp,
    sign
  } = orderData

  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'wxpay',
      orderInfo: {
        appid,
        partnerid,
        prepayid,
        package: 'Sign=WXPay',
        noncestr,
        timestamp: String(timestamp),
        sign
      },
      success: resolve,
      fail: reject
    })
  })
}
```

```json
// manifest.json - 配置微信 App 支付
{
  "app-plus": {
    "sdkConfigs": {
      "payment": {
        "weixin": {
          "appid": "wx_your_appid"
        }
      }
    }
  }
}
```

### 3. H5 微信支付（JSAPI）

```javascript
// H5 微信内支付（需要微信授权）
export function wxJSAPIPay(payParams) {
  return new Promise((resolve, reject) => {
    if (typeof WeixinJSBridge === 'undefined') {
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', () => {
          invokePay(payParams, resolve, reject)
        }, false)
      }
    } else {
      invokePay(payParams, resolve, reject)
    }
  })
}

function invokePay(params, resolve, reject) {
  WeixinJSBridge.invoke('getBrandWCPayRequest', {
    appId: params.appId,
    timeStamp: params.timeStamp,
    nonceStr: params.nonceStr,
    package: params.package,
    signType: params.signType,
    paySign: params.paySign
  }, (res) => {
    if (res.err_msg === 'get_brand_wcpay_request:ok') {
      resolve(res)
    } else {
      reject(res)
    }
  })
}
```

---

## 支付宝支付集成

### 1. 支付宝小程序支付

```javascript
// utils/payment/alipay.js

/**
 * 支付宝小程序支付
 * @param {string} tradeNo - 支付宝交易号（后端返回）
 */
export async function aliMiniPay(tradeNo) {
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'alipay',
      orderInfo: tradeNo, // 支付宝小程序直接传 tradeNo
      success: resolve,
      fail: reject
    })
  })
}
```

### 2. App 端支付宝支付

```javascript
/**
 * App 端支付宝支付
 * @param {string} orderInfo - 后端返回的 orderString（支付宝签名字符串）
 */
export async function aliAppPay(orderString) {
  return new Promise((resolve, reject) => {
    uni.requestPayment({
      provider: 'alipay',
      orderInfo: orderString, // 后端返回的完整签名字符串
      success(res) {
        // 解析支付结果
        const result = parseAliResult(res.result)
        if (result.resultStatus === '9000') {
          resolve(result)
        } else {
          reject(result)
        }
      },
      fail: reject
    })
  })
}

/**
 * 解析支付宝返回结果
 */
function parseAliResult(resultStr) {
  try {
    const result = {}
    const pairs = resultStr.split('&')
    pairs.forEach(pair => {
      const [key, value] = pair.split('=')
      result[key] = decodeURIComponent(value || '')
    })
    return result
  } catch (e) {
    return { resultStatus: 'unknown', memo: resultStr }
  }
}
```

```json
// manifest.json - 配置支付宝支付
{
  "app-plus": {
    "sdkConfigs": {
      "payment": {
        "alipay": {
          "__platform__": ["android", "ios"]
        }
      }
    }
  }
}
```

---

## 统一支付封装

### 通用支付模块

```javascript
// utils/payment/index.js

import { wxMiniPay, wxAppPay } from './wechat'
import { aliMiniPay, aliAppPay } from './alipay'

// 支付状态枚举
export const PayStatus = {
  SUCCESS: 'success',
  CANCEL: 'cancel',
  FAIL: 'fail'
}

/**
 * 统一支付入口
 * @param {Object} options
 * @param {string} options.provider - 支付方式 'wxpay' | 'alipay'
 * @param {Object} options.orderData - 后端返回的支付参数
 * @param {string} options.orderId - 订单 ID（用于查询）
 */
export async function pay({ provider, orderData, orderId }) {
  const platform = uni.getSystemInfoSync().uniPlatform

  try {
    let result

    if (provider === 'wxpay') {
      if (platform === 'mp-weixin') {
        result = await wxMiniPay(orderData)
      } else if (platform === 'app') {
        result = await wxAppPay(orderData)
      }
    } else if (provider === 'alipay') {
      if (platform === 'mp-alipay') {
        result = await aliMiniPay(orderData.tradeNo)
      } else if (platform === 'app') {
        result = await aliAppPay(orderData.orderString)
      }
    }

    // 支付成功后轮询订单状态
    await pollOrderStatus(orderId)

    return { status: PayStatus.SUCCESS, result }

  } catch (err) {
    const errMsg = err?.errMsg || err?.memo || ''

    if (errMsg.includes('cancel') || errMsg.includes('用户取消')) {
      return { status: PayStatus.CANCEL, error: err }
    }

    return { status: PayStatus.FAIL, error: err }
  }
}

/**
 * 轮询订单状态（防止支付回调延迟）
 */
async function pollOrderStatus(orderId, maxRetry = 5, interval = 2000) {
  for (let i = 0; i < maxRetry; i++) {
    await sleep(interval)
    
    const res = await queryOrder(orderId)
    if (res.data.status === 'paid') {
      return res.data
    }
  }
  throw new Error('订单状态查询超时')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
```

### 支付选择器组件

```vue
<!-- components/PaymentSheet.vue -->
<template>
  <uni-popup ref="popup" type="bottom">
    <view class="payment-sheet">
      <view class="sheet-header">
        <text class="amount">¥{{ amount }}</text>
        <text class="close" @click="close">✕</text>
      </view>

      <view class="payment-options">
        <!-- 微信支付 -->
        <view
          v-if="showWxPay"
          class="payment-item"
          :class="{ selected: selectedPay === 'wxpay' }"
          @click="selectedPay = 'wxpay'"
        >
          <image src="/static/icons/wechat-pay.png" class="pay-icon" />
          <text class="pay-name">微信支付</text>
          <view class="radio" :class="{ checked: selectedPay === 'wxpay' }"></view>
        </view>

        <!-- 支付宝 -->
        <view
          v-if="showAliPay"
          class="payment-item"
          :class="{ selected: selectedPay === 'alipay' }"
          @click="selectedPay = 'alipay'"
        >
          <image src="/static/icons/alipay.png" class="pay-icon" />
          <text class="pay-name">支付宝</text>
          <view class="radio" :class="{ checked: selectedPay === 'alipay' }"></view>
        </view>
      </view>

      <button
        class="confirm-btn"
        :loading="paying"
        @click="confirmPay"
      >
        {{ paying ? '支付中...' : '立即支付' }}
      </button>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, computed } from 'vue'
import { pay, PayStatus } from '@/utils/payment'

const props = defineProps({
  amount: { type: Number, required: true },
  orderId: { type: String, required: true },
  orderData: { type: Object, required: true }
})

const emit = defineEmits(['success', 'cancel', 'fail'])

const popup = ref(null)
const selectedPay = ref('wxpay')
const paying = ref(false)

// 根据平台显示可用支付方式
const platform = uni.getSystemInfoSync().uniPlatform
const showWxPay = computed(() =>
  ['mp-weixin', 'app'].includes(platform)
)
const showAliPay = computed(() =>
  ['mp-alipay', 'app'].includes(platform)
)

function open() {
  popup.value?.open()
}

function close() {
  popup.value?.close()
}

async function confirmPay() {
  paying.value = true

  const result = await pay({
    provider: selectedPay.value,
    orderData: props.orderData[selectedPay.value],
    orderId: props.orderId
  })

  paying.value = false

  if (result.status === PayStatus.SUCCESS) {
    close()
    emit('success', result)
    uni.showToast({ title: '支付成功', icon: 'success' })
  } else if (result.status === PayStatus.CANCEL) {
    emit('cancel')
  } else {
    emit('fail', result.error)
    uni.showToast({ title: '支付失败，请重试', icon: 'none' })
  }
}

defineExpose({ open, close })
</script>
```

---

## 服务端对接

### Node.js 后端示例（Koa2）

```javascript
// routes/payment.js
const Router = require('koa-router')
const WxPay = require('wechatpay-node-v3')
const AlipaySdk = require('alipay-sdk').default

const router = new Router({ prefix: '/api/payment' })

// 微信支付实例
const wxPay = new WxPay({
  appid: process.env.WX_APPID,
  mchid: process.env.WX_MCHID,
  publicKey: fs.readFileSync('./certs/wx_public.pem'),
  privateKey: fs.readFileSync('./certs/wx_private.pem')
})

// 支付宝 SDK 实例
const aliSdk = new AlipaySdk({
  appId: process.env.ALI_APPID,
  privateKey: process.env.ALI_PRIVATE_KEY,
  alipayPublicKey: process.env.ALI_PUBLIC_KEY
})

// 创建微信小程序订单
router.post('/wx/mini/create', async (ctx) => {
  const { goodsId, openid } = ctx.request.body

  const goods = await Goods.findById(goodsId)
  const order = await Order.create({
    userId: ctx.state.user.id,
    goodsId,
    amount: goods.price,
    status: 'pending'
  })

  // 调用微信统一下单
  const wxResult = await wxPay.transactions_jsapi({
    description: goods.name,
    out_trade_no: order.id,
    notify_url: `${process.env.BASE_URL}/api/payment/wx/notify`,
    amount: { total: Math.round(goods.price * 100) }, // 单位：分
    payer: { openid }
  })

  ctx.body = {
    code: 0,
    data: {
      orderId: order.id,
      payParams: wxResult // 直接返回给前端
    }
  }
})

// 微信支付回调
router.post('/wx/notify', async (ctx) => {
  const { headers, rawBody } = ctx.request

  try {
    // 验证签名
    const result = await wxPay.verifySign({
      timestamp: headers['Wechatpay-Timestamp'],
      nonce: headers['Wechatpay-Nonce'],
      body: rawBody,
      serial: headers['Wechatpay-Serial'],
      signature: headers['Wechatpay-Signature']
    })

    const { out_trade_no, trade_state } = result

    if (trade_state === 'SUCCESS') {
      await Order.update(
        { status: 'paid', paidAt: new Date() },
        { where: { id: out_trade_no } }
      )
    }

    ctx.body = { code: 'SUCCESS', message: 'OK' }
  } catch (err) {
    ctx.status = 500
    ctx.body = { code: 'FAIL', message: err.message }
  }
})

// 支付宝 App 支付
router.post('/ali/app/create', async (ctx) => {
  const { goodsId } = ctx.request.body

  const goods = await Goods.findById(goodsId)
  const order = await Order.create({ ... })

  // 生成支付宝签名字符串
  const orderString = aliSdk.sign('alipay.trade.app.pay', {
    bizContent: {
      out_trade_no: order.id,
      product_code: 'QUICK_MSECURITY_PAY',
      total_amount: goods.price.toFixed(2),
      subject: goods.name,
      notify_url: `${process.env.BASE_URL}/api/payment/ali/notify`
    }
  })

  ctx.body = {
    code: 0,
    data: { orderId: order.id, orderString }
  }
})

module.exports = router
```

---

## 常见问题

### 1. 微信签名错误

```javascript
// 问题：支付签名验证失败
// 常见原因：
// - timeStamp 类型不对（需要 string）
// - package 字段格式错误（需要 prepay_id=xxx）
// - appId 大小写错误（前端用 appId，后端 paySign 用 appid）

// 正确的前端支付参数格式
const payParams = {
  appId: 'wx_xxxx',         // 注意大小写
  timeStamp: String(ts),    // 必须是字符串
  nonceStr: nonce,
  package: `prepay_id=${prepayId}`, // 固定格式
  signType: 'RSA',
  paySign: sign
}
```

### 2. 支付宝 resultStatus 含义

```javascript
const ALI_PAY_STATUS = {
  '9000': '支付成功',
  '8000': '正在处理中（可能成功）',
  '4000': '支付失败',
  '5000': '重复请求',
  '6001': '用户取消',
  '6002': '网络连接出错',
  '6004': '支付结果未知（处理中）'
}
```

### 3. iOS 支付审核要求

```
苹果 App Store 审核规定：
- 虚拟商品必须使用 Apple In-App Purchase（IAP）
- 实物商品可以使用微信/支付宝
- 违规可能导致 App 被下架

解决方案：
- iOS 端虚拟商品使用 uni.requestPayment({ provider: 'appleiap' })
- Android 端使用微信/支付宝
```

```javascript
// iOS IAP 支付示例
if (uni.getSystemInfoSync().platform === 'ios') {
  uni.requestPayment({
    provider: 'appleiap',
    orderInfo: productId, // App Store 商品 ID
    success: (res) => {
      // 将收据发送到后端验证
      verifyAppleReceipt(res.transactionReceipt)
    }
  })
}
```
