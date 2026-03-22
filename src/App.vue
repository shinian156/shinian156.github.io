<template>
  <div class="app">
    <Header />
    <div class="container">
      <router-view :key="$route.fullPath" />
      <Sidebar />
    </div>
    <Footer />
    <MobileNav />
  </div>
</template>

<script setup lang="ts">
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import Footer from './components/Footer.vue'
import MobileNav from './components/MobileNav.vue'
</script>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  display: flex;
  flex: 1;
  margin: 0;
  padding: 20px;
  gap: 20px;
  width: 100%;
  position: relative;
  z-index: 1;
}

/* 主内容区样式 - 填满左侧空间 */
.container > :deep(.home),
.container > :deep(.article),
.container > :deep(.about) {
  flex: 1;
  min-width: 0;
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: hidden;
}

/* 确保 router-view 容器占满空间 */
.container > :deep(div) {
  flex: 1;
  min-width: 0;
}

/* 为移动端导航预留空间 */
@media (max-width: 768px) {
  .app {
    padding-bottom: 60px;
  }
}

/* 平板设备 */
@media (max-width: 1024px) {
  .container {
    padding: 15px;
    gap: 15px;
  }

  .container > :deep(.home),
  .container > :deep(.article),
  .container > :deep(.about) {
    padding: 25px;
  }
}

/* 手机设备 */
@media (max-width: 768px) {
  .container {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
  }

  .container > :deep(.home),
  .container > :deep(.article),
  .container > :deep(.about) {
    padding: 0;
    border-radius: 8px;
    border: none;
    box-shadow: none;
    background: transparent;
  }

  /* 侧边栏在手机端隐藏 */
  .container > :deep(.sidebar) {
    display: none;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .container {
    padding: 10px;
    gap: 10px;
  }
}
</style>
