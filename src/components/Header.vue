<template>
  <header class="header">
    <div class="container">
      <router-link to="/" class="logo">
        <span class="logo-icon">📚</span>
        <span class="logo-text">前端技术知识库</span>
      </router-link>
      <nav class="nav">
        <router-link to="/" class="nav-link">首页</router-link>
        <router-link to="/about" class="nav-link">关于</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
// Header 组件
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #42b883 0%, #35495e 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: bold;
  transition: transform 0.2s;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  font-size: 2rem;
}

.logo-text {
  background: linear-gradient(to right, #fff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s;
  font-weight: 500;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    gap: 0.8rem;
    padding: 0.8rem 15px;
  }

  .logo {
    font-size: 1.2rem;
    gap: 8px;
  }

  .logo-icon {
    font-size: 1.6rem;
  }

  .logo-text {
    font-size: 1.1rem;
  }

  /* 移动端隐藏导航 */
  .nav {
    display: none;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0.6rem 12px;
  }

  .logo {
    font-size: 1rem;
  }

  .logo-icon {
    font-size: 1.4rem;
  }

  .logo-text {
    font-size: 0.95rem;
  }

  .nav {
    gap: 6px;
  }

  .nav-link {
    padding: 5px 12px;
    font-size: 0.85rem;
  }
}
</style>
