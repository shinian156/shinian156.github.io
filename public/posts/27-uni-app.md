# uni-app 跨平台开发

## 目录

---

## 一、uni-app 简介

uni-app 是一个使用 Vue.js 开发所有前端应用的框架，开发者编写一套代码，可发布到 iOS、Android、Web（响应式）、以及各种小程序（微信/支付宝/百度/头条/飞书/钉钉/淘宝/快应用/360 小程序等）。

### 核心优势

| 特性 | 说明 |
|---|---|
| 一套代码，多端运行 | 支持 10+ 平台 |
| Vue 语法 | 学习成本低，前端开发者无缝上手 |
| 丰富的生态 | 插件市场有 10 万+ 插件 |
| 性能优秀 | 支持原生渲染（nvue），媲美原生 App |
| 官方支持 | DCloud 官方维护，生态稳定 |

### 与其他跨平台框架对比

| 框架 | 渲染方式 | 性能 | 学习成本 | 生态 |
|---|---|---|---|---|
| uni-app | webview + 原生 | ★★★★ | ★★★★★ | ★★★★★ |
| Flutter | 自渲染引擎 | ★★★★★ | ★★★ | ★★★★ |
| React Native | 原生组件 | ★★★★ | ★★★ | ★★★★ |
| Taro | webview | ★★★ | ★★★★ | ★★★★ |

---

## 二、环境搭建与项目结构

### 安装 HBuilderX

推荐使用 HBuilderX 作为开发工具（官方 IDE），也可以使用 CLI 方式：

```bash
# CLI 方式创建项目
npx degit dcloudio/uni-preset-vue#vite my-project
cd my-project
npm install
npm run dev:mp-weixin   # 微信小程序
npm run dev:app         # App
npm run dev:h5          # H5
```

### 项目目录结构

```
├── pages/              # 页面文件（必须）
│   ├── index/
│   │   └── index.vue
│   └── detail/
│       └── detail.vue
├── static/             # 静态资源
├── components/         # 公共组件
├── store/              # Pinia / Vuex
├── utils/              # 工具函数
├── api/                # 接口请求
├── App.vue             # 应用配置
├── main.js             # 入口文件
├── manifest.json       # 应用配置（平台差异化）
├── pages.json          # 页面路由配置（核心）
└── uni.scss            # 全局样式变量
```

### pages.json 配置

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "navigationBarBackgroundColor": "#42b883",
        "navigationBarTextStyle": "white"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarTitleText": "uni-app",
    "backgroundColor": "#F8F8F8"
  },
  "tabBar": {
    "color": "#666",
    "selectedColor": "#42b883",
    "list": [
      {
        "pagePath": "pages/index/index",
        "iconPath": "static/tab-home.png",
        "selectedIconPath": "static/tab-home-active.png",
        "text": "首页"
      }
    ]
  }
}
```

---

## 三、页面与组件

### 页面生命周期

uni-app 页面同时支持 Vue 生命周期和 uni-app 页面生命周期：

```javascript
export default {
  // uni-app 特有生命周期
  onLoad(options) {
    // 页面加载，options 为页面参数
    console.log('页面参数:', options)
  },
  onShow() {
    // 页面显示（每次显示都触发）
  },
  onHide() {
    // 页面隐藏
  },
  onUnload() {
    // 页面卸载
  },
  onReady() {
    // 页面初次渲染完成
  },
  onPullDownRefresh() {
    // 下拉刷新
    uni.stopPullDownRefresh()
  },
  onReachBottom() {
    // 触底加载更多
  },
  onShareAppMessage() {
    // 分享
    return {
      title: '分享标题',
      path: '/pages/index/index'
    }
  }
}
```

### 基础组件

uni-app 提供了一套与微信小程序基本一致的基础组件：

```html
<template>
  <view class="container">
    <!-- 视图容器 -->
    <view class="box">普通容器</view>
    <scroll-view scroll-y class="scroll-area">
      <!-- 可滚动区域 -->
    </scroll-view>

    <!-- 文本 -->
    <text class="title">标题</text>

    <!-- 图片 -->
    <image src="/static/logo.png" mode="aspectFit" />

    <!-- 按钮 -->
    <button type="primary" @click="handleClick">点击按钮</button>

    <!-- 输入框 -->
    <input v-model="inputVal" placeholder="请输入内容" />

    <!-- 开关 -->
    <switch :checked="isOn" @change="onSwitchChange" />

    <!-- 选择器 -->
    <picker mode="date" @change="onDateChange">
      <view>选择日期</view>
    </picker>
  </view>
</template>
```

---

## 四、路由与导航

uni-app 的路由由 pages.json 统一管理，通过 API 进行导航：

```javascript
// 跳转到指定页面（保留当前页）
uni.navigateTo({
  url: '/pages/detail/detail?id=123&name=test'
})

// 跳转并关闭当前页
uni.redirectTo({
  url: '/pages/index/index'
})

// 跳转到 tabBar 页面
uni.switchTab({
  url: '/pages/index/index'
})

// 关闭所有页面，跳转到新页面
uni.reLaunch({
  url: '/pages/login/login'
})

// 返回上一页
uni.navigateBack({
  delta: 1  // 返回层数
})
```

### 接收参数

```javascript
// 页面 A 传参
uni.navigateTo({ url: '/pages/detail/detail?id=123' })

// 页面 B 接收
export default {
  onLoad(options) {
    console.log(options.id)  // '123'
  }
}
```

### 页面间通信

```javascript
// 方式1：URL 参数
// 方式2：EventChannel（navigateTo 回调中）
uni.navigateTo({
  url: '/pages/detail/detail',
  events: {
    acceptDataFromOpenedPage(data) {
      console.log('接收数据:', data)
    }
  },
  success(res) {
    res.eventChannel.emit('acceptDataFromOpenerPage', { data: '来自首页' })
  }
})

// 方式3：全局状态（Pinia）
// 方式4：uni.$emit / uni.$on
uni.$emit('updateData', { value: 123 })
uni.$on('updateData', (data) => {
  console.log(data)
})
```

---

## 五、条件编译

条件编译是 uni-app 最重要的特性之一，可针对不同平台写差异化代码：

```javascript
// #ifdef MP-WEIXIN
// 只在微信小程序中编译
wx.login({ ... })
// #endif

// #ifdef APP-PLUS
// 只在 App 中编译
plus.device.getInfo(...)
// #endif

// #ifndef H5
// 非 H5 平台编译
// #endif

// #ifdef H5 || MP-WEIXIN
// H5 或微信小程序
// #endif
```

```html
<!-- 模板中的条件编译 -->
<template>
  <!-- #ifdef MP-WEIXIN -->
  <view>仅微信小程序显示</view>
  <!-- #endif -->

  <!-- #ifndef APP-PLUS -->
  <view>非 App 显示</view>
  <!-- #endif -->
</template>
```

```css
/* 样式中的条件编译 */
/* #ifdef H5 */
.container { max-width: 750px; margin: 0 auto; }
/* #endif */
```

---

## 六、网络请求

### uni.request 封装

```javascript
// utils/request.js
const BASE_URL = 'https://api.example.com'

const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        'Authorization': uni.getStorageSync('token') || ''
      },
      success(res) {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data)
          } else if (res.data.code === 401) {
            uni.navigateTo({ url: '/pages/login/login' })
            reject(res.data)
          } else {
            uni.showToast({ title: res.data.message, icon: 'none' })
            reject(res.data)
          }
        } else {
          reject(res)
        }
      },
      fail(err) {
        uni.showToast({ title: '网络请求失败', icon: 'none' })
        reject(err)
      }
    })
  })
}

export const get = (url, data) => request({ url, method: 'GET', data })
export const post = (url, data) => request({ url, method: 'POST', data })
```

---

## 七、状态管理

uni-app 推荐使用 Pinia（Vue3）或 Vuex（Vue2）进行状态管理：

```javascript
// store/user.js（Pinia）
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    userInfo: null,
    token: uni.getStorageSync('token') || ''
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    nickname: (state) => state.userInfo?.nickname || '游客'
  },
  actions: {
    async login(params) {
      const res = await post('/auth/login', params)
      this.token = res.data.token
      this.userInfo = res.data.userInfo
      uni.setStorageSync('token', this.token)
    },
    logout() {
      this.token = ''
      this.userInfo = null
      uni.removeStorageSync('token')
      uni.reLaunch({ url: '/pages/login/login' })
    }
  }
})
```

---

## 八、原生能力与插件

### 常用原生 API

```javascript
// 存储
uni.setStorageSync('key', 'value')
const val = uni.getStorageSync('key')
uni.removeStorageSync('key')

// 图片选择
uni.chooseImage({
  count: 1,
  sizeType: ['compressed'],
  sourceType: ['album', 'camera'],
  success(res) {
    const tempFilePaths = res.tempFilePaths
    // 上传
    uni.uploadFile({
      url: 'https://api.example.com/upload',
      filePath: tempFilePaths[0],
      name: 'file',
      success(uploadRes) {
        console.log(uploadRes.data)
      }
    })
  }
})

// 获取位置
uni.getLocation({
  type: 'gcj02',
  success(res) {
    console.log('纬度:', res.latitude)
    console.log('经度:', res.longitude)
  }
})

// 扫码
uni.scanCode({
  success(res) {
    console.log('扫码结果:', res.result)
  }
})

// 支付
uni.requestPayment({
  provider: 'wxpay',
  orderInfo: {},
  success(res) {
    console.log('支付成功')
  }
})
```

---

## 九、性能优化

### 1. 合理使用 setData/响应式数据

避免频繁的大量数据更新，只更新需要变化的部分。

### 2. 长列表优化

```html
<!-- 使用虚拟列表 -->
<list-view v-if="list.length > 100">
  <list-item v-for="item in list" :key="item.id">
    {{ item.name }}
  </list-item>
</list-view>
```

### 3. 图片懒加载

```html
<image lazy-load :src="item.img" />
```

### 4. 分包加载

```json
// pages.json
{
  "subPackages": [
    {
      "root": "subpkg",
      "pages": [
        { "path": "pages/detail/detail" }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["subpkg"]
    }
  }
}
```

### 5. nvue 原生渲染

对性能要求极高的页面（如直播间、高帧动画），使用 `.nvue` 文件代替 `.vue`，直接调用原生渲染引擎。

---

## 十、打包与发布

### H5 打包

```bash
npm run build:h5
# dist/build/h5 目录，部署到 Web 服务器即可
```

### 微信小程序打包

```bash
npm run build:mp-weixin
# dist/build/mp-weixin 目录，用微信开发者工具上传
```

### App 打包

1. **云打包**：HBuilderX → 发行 → 原生 App-云打包（无需配置本地环境）
2. **本地打包**：需要 Android Studio / Xcode

```json
// manifest.json App 配置
{
  "app-plus": {
    "icons": {
      "android": { "hdpi": "..." },
      "ios": { "standard": "..." }
    },
    "splashscreen": {
      "iosStyle": "default"
    },
    "distribute": {
      "android": {
        "packagename": "com.example.app",
        "versionName": "1.0.0",
        "versionCode": 100
      }
    }
  }
}
```

---

## 十一、常见问题

**Q1：uni-app 和微信小程序原生开发有何区别？**

uni-app 基于 Vue 语法，一套代码可多端运行；微信小程序原生开发只针对微信平台。性能上微信原生稍优，生态和效率上 uni-app 更佳。

**Q2：样式兼容性问题如何处理？**

- 使用 `rpx` 代替 `px`（`750rpx` = 屏幕宽度）
- 避免使用 `float`、`css3` 渐变（小程序不支持部分特性）
- 使用条件编译针对平台单独处理

**Q3：页面数量限制？**

微信小程序最多同时打开 10 个页面栈，超出时使用 `redirectTo` 或 `reLaunch` 替代 `navigateTo`。

**Q4：如何与原生模块交互？**

通过 `uni.requireNativePlugin()` 调用原生插件，或使用 DCloud 插件市场购买/引入现成插件。

**Q5：uni-app 支持 TypeScript 吗？**

完全支持，CLI 创建项目时选择 TypeScript 模板即可。推荐搭配 uni-app 的 TypeScript 类型声明包使用。
