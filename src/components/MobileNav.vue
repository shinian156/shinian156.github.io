<template>
  <div class="mobile-nav" v-show="isMobile">
    <div class="nav-container">
      <div class="nav-item">
        <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
          <span class="nav-icon">🏠</span>
          <span class="nav-text">首页</span>
        </router-link>
      </div>
      <div class="nav-item">
        <button @click="toggleCategories" class="nav-link" :class="{ active: showCategories }">
          <span class="nav-icon">📂</span>
          <span class="nav-text">分类</span>
        </button>
      </div>
      <div class="nav-item">
        <router-link to="/about" class="nav-link" :class="{ active: $route.path === '/about' }">
          <span class="nav-icon">ℹ️</span>
          <span class="nav-text">关于</span>
        </router-link>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div class="drawer-overlay" :class="{ open: showCategories }" @click="showCategories = false"></div>

    <!-- 分类抽屉 -->
    <div class="category-drawer" :class="{ open: showCategories }">
      <div class="drawer-header">
        <h3>📂 技术分类</h3>
        <button @click.stop="showCategories = false" class="close-btn">✕</button>
      </div>
      <div class="drawer-content">
        <ul class="drawer-category-list">
          <li v-for="category in categories" :key="category.name">
            <div class="drawer-category-header" @click.stop="toggleCategory(category.name)">
              <span class="drawer-category-icon">{{ category.icon }}</span>
              <span class="drawer-category-name">{{ category.name }}</span>
              <span class="drawer-toggle-icon">{{ category.expanded ? '▼' : '▶' }}</span>
            </div>
            <ul v-if="category.expanded" class="drawer-article-list">
              <li v-for="article in category.articles" :key="article.id">
                <router-link :to="`/article/${article.id}`" @click.stop="showCategories = false" class="drawer-article-link">
                  {{ article.title }}
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isMobile = ref(false)
const showCategories = ref(false)

interface Article {
  id: string
  title: string
}

interface Category {
  name: string
  icon: string
  expanded: boolean
  articles: Article[]
}

const categories = ref<Category[]>([
  {
    name: '前端框架',
    icon: '🎯',
    expanded: false,
    articles: [
      { id: '01-Vue', title: 'Vue' },
      { id: '05-Vue-Router', title: 'Vue Router' },
      { id: '02-Vuex-Pinia', title: 'Vuex 与 Pinia 对比' },
      { id: '73-Vue-SSR服务端渲染', title: 'Vue SSR 服务端渲染' },
      { id: '06-Vue组件库开发', title: 'Vue 组件库开发' },
      { id: '03-Vue2源码解析', title: 'Vue2 源码解析' },
      { id: '04-Vue3源码解析', title: 'Vue3 源码解析' }
    ]
  },
  {
    name: '前端 CSS/JS 库',
    icon: '🎨',
    expanded: false,
    articles: [
      { id: '31-TailwindCSS', title: 'TailwindCSS' },
      { id: '32-Animate', title: 'CSS 动画库' },
      { id: '33-Lodash-Underscore', title: 'Lodash & Underscore' },
      { id: '34-Day.js-Moment', title: 'Day.js & Moment.js' },
      { id: '35-Axios-Fetch', title: 'Axios & Fetch' },
      { id: '36-Vueuse', title: 'VueUse 工具库' },
      { id: '37-Swiper', title: 'Swiper 轮播库' },
      { id: '38-工具函数库', title: '常用工具函数库' }
    ]
  },
  {
    name: '前端性能优化',
    icon: '⚡',
    expanded: false,
    articles: [
      { id: '18-前端性能优化', title: '前端性能优化' },
      { id: '19-代码规范', title: '代码规范' }
    ]
  },
  {
    name: '构建与打包',
    icon: '⚡',
    expanded: false,
    articles: [
      { id: '20-包管理工具', title: 'npm、pnpm、npx、yarn' },
      { id: '75-Webpack', title: 'Webpack' },
      { id: '76-Vite', title: 'Vite' },
      { id: '77-Rollup', title: 'Rollup' }
    ]
  },
  {
    name: '微前端',
    icon: '🧩',
    expanded: false,
    articles: [
      { id: '66-微前端框架对比', title: '主流微前端框架对比' },
      { id: '67-从0到1实现微前端', title: '从 0 到 1 实现微前端' }
    ]
  },
  {
    name: 'App 开发',
    icon: '📱',
    expanded: false,
    articles: [
      { id: '27-uni-app', title: 'uni-app' },
      { id: '28-Flutter', title: 'Flutter' },
      { id: '22-App上架应用商店流程', title: 'App 上架流程' },
      { id: '68-uni-app集成支付', title: 'uni-app 集成支付' },
      { id: '69-uni-app消息推送', title: 'uni-app 消息推送' },
      { id: '70-第三方授权登录', title: '第三方授权登录' }
    ]
  },
  {
    name: 'JavaScript 核心',
    icon: '⚡',
    expanded: false,
    articles: [
      { id: '06-JavaScript', title: 'JavaScript' },
      { id: '07-JavaScript高级特性', title: 'JavaScript 高级特性' },
      { id: '08-ES6', title: 'ES6' }
    ]
  },
  {
    name: 'TypeScript',
    icon: '📘',
    expanded: false,
    articles: [
      { id: '09-TypeScript', title: 'TypeScript' },
      { id: '10-TypeScript进阶', title: 'TypeScript 进阶' }
    ]
  },
  {
    name: '数据可视化',
    icon: '📊',
    expanded: false,
    articles: [
      { id: '13-ECharts数据可视化', title: 'ECharts' },
      { id: '14-数据大屏开发', title: '数据大屏开发' },
      { id: '15-三维GIS开发', title: '三维GIS 开发' }
    ]
  },
  {
    name: 'AI 与机器学习',
    icon: '🤖',
    expanded: false,
    articles: [
      { id: '16-TensorFlow.js', title: 'TensorFlow.js' },
      { id: '17-主流AI开发工具对比', title: 'AI 开发工具对比' }
    ]
  },
  {
    name: 'Node.js',
    icon: '🟢',
    expanded: false,
    articles: [
      { id: '11-Node.js', title: 'Node.js' },
      { id: '12-Koa2后端开发', title: 'Koa2' },
      { id: '74-NestJS后端开发', title: 'NestJS 后端开发' },
      { id: '39-NodeCLI', title: 'Node.js 搭建 CLI' },
      { id: '60-Vue3CLI从0到1', title: 'Vue3 CLI 从 0 到 1' },
      { id: '72-Node.js数据库', title: 'Node.js 数据库' }
    ]
  },
  {
    name: 'Node.js 桌面端',
    icon: '🖥️',
    expanded: false,
    articles: [
      { id: '71-Electron桌面端从0到1', title: 'Electron 从 0 到 1' }
    ]
  },
  {
    name: 'Python',
    icon: '🐍',
    expanded: false,
    articles: [
      { id: '25-Python', title: 'Python' },
      { id: '26-Flask最佳实战', title: 'Flask 最佳实战' },
      { id: '26B-爬虫最佳实战', title: '爬虫最佳实战' }
    ]
  },
  {
    name: 'Linux',
    icon: '💻',
    expanded: false,
    articles: [
      { id: '43-Linux入门', title: 'Linux 入门' },
      { id: '44-Linux常用命令', title: 'Linux 常用命令' },
      { id: '45-Linux用户权限', title: 'Linux 用户与权限' },
      { id: '46-Linux进程管理', title: 'Linux 进程与服务管理' },
      { id: '47-Linux网络配置', title: 'Linux 网络配置' }
    ]
  },
  {
    name: '容器化部署',
    icon: '🐳',
    expanded: false,
    articles: [
      { id: '23-Docker', title: 'Docker' },
      { id: '24-Docker集成Jenkins', title: 'Docker 集成 Jenkins' }
    ]
  },
  {
    name: 'Git 与 GitHub',
    icon: '🔀',
    expanded: false,
    articles: [
      { id: '40-Git与GitHub', title: 'Git 与 GitHub 基础' },
      { id: '41-GitHub协作', title: 'GitHub 协作流程' },
      { id: '42-Git高级操作', title: 'Git 高级操作与 Hooks' },
      { id: '62-GitHub部署流程', title: 'GitHub 部署流程' }
    ]
  },
  {
    name: '数据结构与算法',
    icon: '📐',
    expanded: false,
    articles: [
      { id: '48-数组与链表', title: '数组与链表' },
      { id: '49-栈与队列', title: '栈与队列' },
      { id: '50-树与图', title: '树与图' },
      { id: '51-排序算法', title: '排序算法' },
      { id: '52-动态规划', title: '动态规划' }
    ]
  },
  {
    name: '前端常用设计模式',
    icon: '🔧',
    expanded: false,
    articles: [
      { id: '61-前端设计模式', title: '前端常用设计模式' }
    ]
  },
  {
    name: 'Kali 及渗透',
    icon: '🛠️',
    expanded: false,
    articles: [
      { id: '53-Kali入门', title: 'Kali Linux 入门' },
      { id: '54-信息收集', title: '信息收集与侦察' },
      { id: '55-漏洞扫描', title: '漏洞扫描与利用' },
      { id: '56-Web渗透', title: 'Web 渗透测试' },
      { id: '57-密码攻击', title: '密码攻击与破解' },
      { id: '58-社工攻防', title: '社会工程学攻防' }
    ]
  },
  {
    name: '股票分析',
    icon: '📈',
    expanded: false,
    articles: [
      { id: '29-量化交易入门', title: '量化交易入门' },
      { id: '30-量化交易策略实战', title: '量化交易策略实战' },
      { id: '62-常见K线图', title: '常见K线图形态' },
      { id: '63-龙头战法', title: '龙头战法' },
      { id: '64-游资操盘手法', title: '游资操盘手法' },
      { id: '65-情绪周期', title: '情绪周期' }
    ]
  }
])

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
}

const toggleCategories = () => {
  showCategories.value = !showCategories.value
}

const toggleCategory = (name: string) => {
  console.log('toggleCategory called with:', name)
  const category = categories.value.find(c => c.name === name)
  if (category) {
    console.log('Toggling category:', category.name, 'from', category.expanded, 'to', !category.expanded)
    category.expanded = !category.expanded
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  border-top: 1px solid #e0e0e0;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0;
  max-width: 100%;
}

.nav-item {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border: none;
  background: none;
  cursor: pointer;
  color: #666;
  text-decoration: none;
  transition: all 0.2s;
  border-radius: 8px;
  min-width: 60px;
}

.nav-link:active {
  transform: scale(0.95);
  background: rgba(66, 184, 131, 0.1);
}

.nav-link:hover {
  background: #f5f5f5;
}

.nav-link.active {
  color: #42b883;
}

.nav-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.nav-text {
  font-size: 0.7rem;
  font-weight: 500;
}

/* 分类抽屉 */
.category-drawer {
  position: fixed;
  bottom: 56px;
  left: 0;
  right: 0;
  max-height: 70vh;
  background: white;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
  transform: translateY(100vh);
  transition: transform 0.3s ease-out;
  z-index: 1001;
  overflow: visible;
  pointer-events: auto;
}

.category-drawer.open {
  transform: translateY(0);
}

/* 遮罩层 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 56px;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.drawer-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.drawer-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:active {
  transform: scale(0.9);
  background: rgba(255, 255, 255, 0.3);
}

.drawer-content {
  overflow-y: auto;
  max-height: calc(70vh - 56px);
  padding: 10px 0;
  position: relative;
  pointer-events: auto;
  z-index: 1002;
}

.drawer-category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.drawer-category-list > li {
  border-bottom: 1px solid #f0f0f0;
}

.drawer-category-list > li:last-child {
  border-bottom: none;
}

.drawer-category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  cursor: pointer;
  background: white;
  transition: background 0.2s;
  position: relative;
  pointer-events: auto;
  z-index: 1003;
}

.drawer-category-header:hover {
  background: #f5f5f5;
}

.drawer-category-header:active {
  background: #eaeaea;
}

.drawer-category-icon {
  font-size: 1.3rem;
}

.drawer-category-name {
  flex: 1;
  font-weight: 500;
  color: #333;
  font-size: 0.95rem;
}

.drawer-toggle-icon {
  font-size: 0.7rem;
  color: #999;
  transition: transform 0.2s;
}

.drawer-article-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #f9f9f9;
}

.drawer-article-list li {
  border-bottom: 1px solid #f0f0f0;
}

.drawer-article-list li:last-child {
  border-bottom: none;
}

.drawer-article-link {
  display: block;
  padding: 10px 20px 10px 40px;
  color: #555;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  cursor: pointer;
  position: relative;
  pointer-events: auto;
  z-index: 1003;
}

.drawer-article-link:active {
  background: #f0f0f0;
  border-left-color: #42b883;
  color: #42b883;
}

.drawer-article-link:hover {
  background: #f8f9fa;
  border-left-color: #42b883;
  color: #42b883;
}

@media (max-width: 480px) {
  .nav-container {
    padding: 6px 0;
  }

  .nav-link {
    padding: 6px;
    min-width: 50px;
  }

  .nav-icon {
    font-size: 1.2rem;
  }

  .nav-text {
    font-size: 0.65rem;
  }

  .drawer-header {
    padding: 12px 15px;
  }

  .drawer-header h3 {
    font-size: 1rem;
  }

  .drawer-category-header {
    padding: 10px 15px;
  }

  .drawer-category-name {
    font-size: 0.9rem;
  }

  .drawer-article-link {
    padding: 8px 15px 8px 35px;
    font-size: 0.85rem;
  }
}
</style>
