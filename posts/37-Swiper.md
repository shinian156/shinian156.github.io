# Swiper 轮播库完整指南

> 最流行的移动端触摸轮播库，支持 Vue/React/原生 JS

## 一、简介与安装

Swiper 是功能最强大的触摸/鼠标滑动轮播库，支持无限循环、自动播放、懒加载、缩略图等几乎所有轮播需求。

```bash
npm install swiper
```

---

## 二、在 Vue 3 中使用

```vue
<template>
  <Swiper
    :modules="modules"
    :slides-per-view="1"
    :space-between="30"
    :loop="true"
    :autoplay="{ delay: 3000, disableOnInteraction: false }"
    :pagination="{ clickable: true }"
    :navigation="true"
    @swiper="onSwiper"
    @slideChange="onSlideChange"
  >
    <SwiperSlide v-for="(item, index) in slides" :key="index">
      <img :src="item.image" :alt="item.title" class="slide-img" />
      <div class="slide-caption">{{ item.title }}</div>
    </SwiperSlide>
  </Swiper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'

// 引入样式
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const modules = [Navigation, Pagination, Autoplay, EffectFade]

const slides = ref([
  { image: '/img/slide1.jpg', title: '幻灯片一' },
  { image: '/img/slide2.jpg', title: '幻灯片二' },
  { image: '/img/slide3.jpg', title: '幻灯片三' }
])

const swiperInstance = ref(null)

function onSwiper(swiper) {
  swiperInstance.value = swiper
}

function onSlideChange(swiper) {
  console.log('当前索引：', swiper.activeIndex)
}
</script>

<style scoped>
.slide-img {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

.slide-caption {
  position: absolute;
  bottom: 20px;
  left: 20px;
  color: white;
  font-size: 1.2rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
</style>
```

---

## 三、核心参数详解

### 基础配置

```js
const swiperOptions = {
  // 每次显示的 slide 数量
  slidesPerView: 1,           // 固定数量
  // slidesPerView: 'auto',   // 根据宽度自适应

  // slide 之间的间距（px）
  spaceBetween: 20,

  // 初始激活的 slide 索引
  initialSlide: 0,

  // 方向
  direction: 'horizontal',   // 'horizontal' | 'vertical'

  // 是否循环
  loop: true,

  // 速度（ms）
  speed: 600,

  // 抓取光标
  grabCursor: true,

  // 居中当前 slide
  centeredSlides: true
}
```

### 自动播放

```js
autoplay: {
  delay: 3000,                    // 间隔时间（ms）
  disableOnInteraction: false,    // 用户操作后是否停止自动播放
  pauseOnMouseEnter: true,        // 鼠标悬停暂停
  reverseDirection: false         // 反向播放
}
```

### 分页器（Pagination）

```js
pagination: {
  clickable: true,               // 点击分页点跳转
  type: 'bullets',               // 'bullets' | 'fraction' | 'progressbar'
  // type 为 fraction 时显示 1/5 样式
  dynamicBullets: true           // 动态大小的分页点
}
```

### 导航按钮

```js
navigation: {
  nextEl: '.swiper-button-next',
  prevEl: '.swiper-button-prev',
  hideOnClick: false
}
```

---

## 四、切换效果

```js
import { EffectFade, EffectCube, EffectCoverflow, EffectFlip, EffectCards } from 'swiper/modules'
import 'swiper/css/effect-fade'
import 'swiper/css/effect-cube'
import 'swiper/css/effect-coverflow'
import 'swiper/css/effect-cards'

// 淡入淡出
effect: 'fade'

// 3D 立方体
effect: 'cube'
cubeEffect: {
  shadow: true,
  slideShadows: true,
  shadowOffset: 20,
  shadowScale: 0.94
}

// 封面流（类似 iTunes）
effect: 'coverflow'
coverflowEffect: {
  rotate: 50,
  stretch: 0,
  depth: 100,
  modifier: 1,
  slideShadows: true
}

// 卡片堆叠
effect: 'cards'
```

---

## 五、多列布局

```vue
<template>
  <!-- 商品列表轮播：桌面3列，平板2列，手机1列 -->
  <Swiper
    :breakpoints="{
      640: { slidesPerView: 1, spaceBetween: 10 },
      768: { slidesPerView: 2, spaceBetween: 20 },
      1024: { slidesPerView: 3, spaceBetween: 30 }
    }"
  >
    <SwiperSlide v-for="item in products" :key="item.id">
      <ProductCard :data="item" />
    </SwiperSlide>
  </Swiper>
</template>
```

---

## 六、懒加载

```vue
<template>
  <Swiper :lazy="true" :preload-images="false" :modules="[Lazy]">
    <SwiperSlide v-for="item in slides" :key="item.id">
      <!-- data-src 而不是 src，swiper-lazy 类名必填 -->
      <img class="swiper-lazy" :data-src="item.url" />
      <!-- 加载占位符 -->
      <div class="swiper-lazy-preloader swiper-lazy-preloader-white"></div>
    </SwiperSlide>
  </Swiper>
</template>

<script setup lang="ts">
import { Lazy } from 'swiper/modules'
import 'swiper/css/lazy'
</script>
```

---

## 七、缩略图导航

```vue
<template>
  <!-- 主轮播 -->
  <Swiper
    :thumbs="{ swiper: thumbsSwiper }"
    :modules="[Thumbs]"
    class="main-swiper"
  >
    <SwiperSlide v-for="img in images" :key="img">
      <img :src="img" />
    </SwiperSlide>
  </Swiper>

  <!-- 缩略图 -->
  <Swiper
    @swiper="setThumbsSwiper"
    :slides-per-view="5"
    :space-between="10"
    :watch-slides-progress="true"
    :modules="[Thumbs]"
    class="thumb-swiper"
  >
    <SwiperSlide v-for="img in images" :key="img">
      <img :src="img" class="thumb-img" />
    </SwiperSlide>
  </Swiper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Thumbs } from 'swiper/modules'

const thumbsSwiper = ref(null)
const setThumbsSwiper = (swiper) => {
  thumbsSwiper.value = swiper
}
</script>
```

---

## 八、编程式控制

```vue
<script setup lang="ts">
import { ref } from 'vue'

const swiper = ref(null)

// 跳转到指定 slide
function goToSlide(index: number) {
  swiper.value?.slideTo(index, 600)  // index, speed
}

// 下一张 / 上一张
function next() { swiper.value?.slideNext() }
function prev() { swiper.value?.slidePrev() }

// 暂停/恢复自动播放
function pauseAutoplay() { swiper.value?.autoplay.stop() }
function resumeAutoplay() { swiper.value?.autoplay.start() }
</script>

<template>
  <Swiper @swiper="swiper = $event">...</Swiper>
  <div class="controls">
    <button @click="prev">上一张</button>
    <button @click="goToSlide(0)">回到第一张</button>
    <button @click="next">下一张</button>
  </div>
</template>
```

---

## 九、自定义样式

```css
/* 覆盖 Swiper 默认样式 */
:deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  background: rgba(255, 255, 255, 0.6);
  opacity: 1;
}

:deep(.swiper-pagination-bullet-active) {
  background: #fff;
  width: 24px;
  border-radius: 4px;
  transition: width 0.3s;
}

:deep(.swiper-button-next),
:deep(.swiper-button-prev) {
  color: white;
  background: rgba(0, 0, 0, 0.3);
  width: 44px;
  height: 44px;
  border-radius: 50%;
}

:deep(.swiper-button-next::after),
:deep(.swiper-button-prev::after) {
  font-size: 18px;
}
```

---

## 十、常见问题

**Q: loop 模式下图片数量不够怎么办？**
```js
// 设置 loopedSlides 来复制 slides
loopedSlides: 5
```

**Q: 图片宽度不一致怎么处理？**
```js
slidesPerView: 'auto'  // 让每个 slide 保持原始宽度
```

**Q: 垂直方向的进度条？**
```js
direction: 'vertical'
pagination: { type: 'progressbar' }
```
