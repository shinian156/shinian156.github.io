# CSS 动画库完整指南

> 涵盖 Animate.css、GSAP、Motion One、AOS、Lottie 等主流动画库

## 目录

- [一、Animate.css —— 开箱即用的纯 CSS 动画](#一animatecss-开箱即用的纯-css-动画)
  - [安装](#安装)
  - [基本使用](#基本使用)
  - [常用动画类](#常用动画类)
  - [控制速度和延迟](#控制速度和延迟)
  - [用 JS 控制动画](#用-js-控制动画)
- [二、GSAP —— 专业级 JS 动画引擎](#二gsap-专业级-js-动画引擎)
  - [安装](#安装)
  - [基础动画](#基础动画)
  - [时间线（Timeline）](#时间线timeline)
  - [ScrollTrigger 滚动触发](#scrolltrigger-滚动触发)
  - [在 Vue 中使用](#在-vue-中使用)
- [三、Motion One —— 基于 Web Animations API 的现代动画库](#三motion-one-基于-web-animations-api-的现代动画库)
- [四、AOS —— 滚动动画库（简单易用）](#四aos-滚动动画库简单易用)
- [五、Lottie —— JSON 驱动的矢量动画](#五lottie-json-驱动的矢量动画)
- [六、CSS 原生动画最佳实践](#六css-原生动画最佳实践)
  - [关键帧动画](#关键帧动画)
  - [过渡动画](#过渡动画)
  - [性能优化原则](#性能优化原则)
- [七、各库对比与选型](#七各库对比与选型)

---
## 一、Animate.css —— 开箱即用的纯 CSS 动画

### 安装

```bash
npm install animate.css
```

```js
// main.ts
import 'animate.css'
```

### 基本使用

```html
<!-- 直接在元素上添加类 -->
<div class="animate__animated animate__fadeIn">淡入效果</div>
<div class="animate__animated animate__bounceInLeft animate__delay-1s">弹入</div>
<div class="animate__animated animate__pulse animate__infinite">无限脉冲</div>
```

### 常用动画类

| 类别 | 动画 |
|------|------|
| 进入 | `fadeIn` `bounceIn` `slideInLeft` `zoomIn` `rotateIn` |
| 退出 | `fadeOut` `bounceOut` `slideOutRight` `zoomOut` |
| 注意力 | `bounce` `flash` `pulse` `shake` `wobble` `heartBeat` |
| 特殊 | `flip` `lightSpeedIn` `rollIn` `jackInTheBox` |

### 控制速度和延迟

```html
<div class="animate__animated animate__fadeIn animate__slower">慢速（3s）</div>
<div class="animate__animated animate__fadeIn animate__fast">快速（0.8s）</div>
<div class="animate__animated animate__fadeIn animate__delay-2s">延迟2s</div>
```

### 用 JS 控制动画

```js
const element = document.querySelector('#myElement')

// 添加动画类后移除（避免重复触发问题）
function animateElement(el, animationName, callback) {
  el.classList.add('animate__animated', `animate__${animationName}`)
  
  el.addEventListener('animationend', () => {
    el.classList.remove('animate__animated', `animate__${animationName}`)
    if (callback) callback()
  }, { once: true })
}

animateElement(element, 'fadeInUp', () => console.log('动画完成'))
```

---

## 二、GSAP —— 专业级 JS 动画引擎

GSAP（GreenSock Animation Platform）是最强大的 JavaScript 动画库，性能极佳，支持复杂时间线动画。

### 安装

```bash
npm install gsap
```

### 基础动画

```js
import { gsap } from 'gsap'

// gsap.to() —— 从当前状态到目标状态
gsap.to('.box', {
  x: 200,        // translateX
  y: 100,        // translateY
  rotation: 360, // 旋转
  scale: 1.5,    // 缩放
  opacity: 0.5,
  duration: 1.5,
  ease: 'power2.out'
})

// gsap.from() —— 从目标状态到当前状态
gsap.from('.title', {
  y: -50,
  opacity: 0,
  duration: 0.8,
  ease: 'back.out(1.7)'
})

// gsap.fromTo() —— 明确起始和结束状态
gsap.fromTo('.card',
  { x: -100, opacity: 0 },
  { x: 0, opacity: 1, duration: 0.6 }
)
```

### 时间线（Timeline）

```js
const tl = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.out' } })

tl.from('.header', { y: -80, opacity: 0 })
  .from('.subtitle', { y: 30, opacity: 0 }, '-=0.2')   // 与上一个动画重叠 0.2s
  .from('.btn', { scale: 0, opacity: 0 }, '+=0.1')       // 延迟 0.1s 开始
  .from('.cards', { y: 40, opacity: 0, stagger: 0.15 })  // 交错动画
```

### ScrollTrigger 滚动触发

```bash
npm install gsap
# ScrollTrigger 是 GSAP 的插件，已包含在包内
```

```js
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// 滚动进入时触发动画
gsap.from('.section', {
  scrollTrigger: {
    trigger: '.section',
    start: 'top 80%',   // 元素顶部到达视口 80% 处触发
    end: 'bottom 20%',
    toggleActions: 'play none none reverse',  // 进入/离开/重进/重离
    markers: true  // 调试用，显示标记线
  },
  x: -100,
  opacity: 0,
  duration: 0.8
})

// 滚动驱动动画（视差效果）
gsap.to('.parallax-bg', {
  scrollTrigger: {
    trigger: '.parallax-bg',
    scrub: true  // 动画与滚动同步
  },
  y: -200
})
```

### 在 Vue 中使用

```vue
<template>
  <div ref="boxRef" class="box">动画盒子</div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'

const boxRef = ref<HTMLElement | null>(null)
let ctx: gsap.Context

onMounted(() => {
  // 用 context 管理动画，便于清理
  ctx = gsap.context(() => {
    gsap.from(boxRef.value, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out'
    })
  })
})

onUnmounted(() => {
  ctx.revert() // 清理所有 GSAP 动画
})
</script>
```

---

## 三、Motion One —— 基于 Web Animations API 的现代动画库

```bash
npm install motion
```

```js
import { animate, scroll, timeline, stagger } from 'motion'

// 基础动画
animate('.box', { x: 200, opacity: [0, 1] }, { duration: 0.5 })

// 时间线
timeline([
  ['.hero', { opacity: [0, 1], y: [30, 0] }],
  ['.title', { opacity: [0, 1] }, { at: '-0.2' }],
  ['.cards', { opacity: [0, 1], y: [20, 0] }, { delay: stagger(0.1) }]
])

// 滚动动画
scroll(animate('.progress-bar', { scaleX: [0, 1] }))
```

---

## 四、AOS —— 滚动动画库（简单易用）

```bash
npm install aos
```

```js
import AOS from 'aos'
import 'aos/dist/aos.css'

AOS.init({
  duration: 800,   // 默认持续时间
  easing: 'ease-out-cubic',
  once: true       // 只触发一次
})
```

```html
<!-- 直接在 HTML 中添加 data 属性 -->
<div data-aos="fade-up">向上淡入</div>
<div data-aos="fade-left" data-aos-delay="200">向左淡入，延迟200ms</div>
<div data-aos="zoom-in" data-aos-duration="1000">缩放进入</div>
<div data-aos="flip-left" data-aos-offset="200">翻转，偏移200px触发</div>
```

---

## 五、Lottie —— JSON 驱动的矢量动画

Lottie 可以播放 After Effects 导出的 JSON 动画，适合复杂的 UI 动效。

```bash
npm install lottie-web
# 或轻量版
npm install @lottiefiles/lottie-player
```

```js
import lottie from 'lottie-web'

const animation = lottie.loadAnimation({
  container: document.getElementById('lottie-container'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/animations/loading.json'  // Lottie JSON 文件路径
})

// 控制播放
animation.play()
animation.pause()
animation.stop()
animation.setSpeed(2)   // 2倍速
animation.setDirection(-1) // 倒放
```

---

## 六、CSS 原生动画最佳实践

### 关键帧动画

```css
/* 定义关键帧 */
@keyframes slideInFromLeft {
  from {
    transform: translateX(-100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}

/* 使用动画 */
.slide-in {
  animation: slideInFromLeft 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.heartbeat {
  animation: heartbeat 1.5s ease-in-out infinite;
}
```

### 过渡动画

```css
/* 平滑过渡 */
.card {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.15);
}
```

### 性能优化原则

```css
/* ✅ 优先使用 transform 和 opacity（不触发重排重绘）*/
.good {
  transition: transform 0.3s, opacity 0.3s;
}

/* ❌ 避免动画 width、height、top、left（触发重排）*/
.bad {
  transition: width 0.3s, margin-top 0.3s;
}

/* 开启 GPU 加速 */
.gpu-accelerated {
  will-change: transform;
  transform: translateZ(0);
}
```

---

## 七、各库对比与选型

| 库 | 特点 | 适用场景 | 包大小 |
|---|---|---|---|
| Animate.css | 零 JS，纯 CSS 类 | 简单进入/退出动画 | ~77kb |
| GSAP | 功能最强，性能最优 | 复杂时间线、商业项目 | ~68kb |
| Motion One | 现代 API，基于 WAAPI | Vue/React 项目 | ~18kb |
| AOS | 极简，滚动触发 | 落地页、展示站点 | ~14kb |
| Lottie | After Effects 动画 | 复杂图形动效 | ~60kb |
