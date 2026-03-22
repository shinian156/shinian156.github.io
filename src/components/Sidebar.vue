<template>
  <aside class="sidebar">
    <div class="sidebar-section">
      <h3 class="sidebar-title">📚 技术分类</h3>
      <ul class="category-list">
        <li v-for="category in categories" :key="category.name" class="category-item">
          <div class="category-header" @click="toggleCategory(category.name)">
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
            <span class="toggle-icon">{{ category.expanded ? '▼' : '▶' }}</span>
          </div>
          <ul v-if="category.expanded" class="article-list">
            <li v-for="article in category.articles" :key="article.id">
              <router-link :to="`/article/${article.id}`" class="article-link">
                {{ article.title }}
              </router-link>
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="sidebar-section">
      <h3 class="sidebar-title">🔥 热门文章</h3>
      <ul class="hot-articles">
        <li v-for="article in hotArticles" :key="article.id">
          <router-link :to="`/article/${article.id}`" class="article-link">
            {{ article.title }}
          </router-link>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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
    expanded: true,
    articles: [
      { id: '01-Vue', title: 'Vue' },
      { id: '05-Vue-Router', title: 'Vue Router' },
      { id: '02-Vuex-Pinia', title: 'Vuex 与 Pinia 对比' },
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
      { id: '21-构建工具', title: '构建工具' }
    ]
  },
  {
    name: 'App 开发',
    icon: '📱',
    expanded: false,
    articles: [
      { id: '27-uni-app', title: 'uni-app' },
      { id: '28-Flutter', title: 'Flutter' },
      { id: '22-App上架应用商店流程', title: 'App 上架流程' }
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
      { id: '39-NodeCLI', title: 'Node.js 搭建 CLI' },
      { id: '60-Vue3CLI从0到1', title: 'Vue3 CLI 从 0 到 1' }
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
    name: '量化交易',
    icon: '📈',
    expanded: false,
    articles: [
      { id: '29-量化交易入门', title: '量化交易入门' },
      { id: '30-量化交易策略实战', title: '量化交易策略实战' }
    ]
  }
])

const hotArticles = ref<Article[]>([
  { id: '06-JavaScript', title: 'JavaScript 核心原理' },
  { id: '01-Vue', title: 'Vue 3 核心原理' },
  { id: '13-ECharts数据可视化', title: 'ECharts 数据可视化' },
  { id: '18-前端性能优化', title: '前端性能优化实战' },
  { id: '09-TypeScript', title: 'TypeScript 类型系统' }
])

const toggleCategory = (name: string) => {
  const category = categories.value.find(c => c.name === name)
  if (category) {
    category.expanded = !category.expanded
  }
}
</script>

<style scoped>
.sidebar {
  width: 300px;
  flex-shrink: 0;
  position: sticky;
  top: 20px;
  z-index: 10;
}

.sidebar-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
  padding-bottom: 10px;
  border-bottom: 2px solid #42b883;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  margin-bottom: 10px;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.2s;
  user-select: none;
}

.category-header:hover {
  background: #f5f5f5;
}

.category-icon {
  font-size: 1.2rem;
}

.category-name {
  flex: 1;
  font-weight: 500;
  color: #333;
}

.toggle-icon {
  font-size: 0.8rem;
  color: #666;
  transition: transform 0.2s;
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 5px 0 0 0;
  background: #f9f9f9;
  border-radius: 6px;
  overflow: hidden;
}

.article-list li {
  padding: 8px 15px;
  border-left: 3px solid transparent;
  transition: all 0.2s;
  position: relative;
}

.article-list li:hover {
  border-left-color: #42b883;
  background: white;
}

.article-link {
  color: #555;
  text-decoration: none;
  font-size: 0.9rem;
  display: block;
  transition: color 0.2s;
  pointer-events: auto;
  cursor: pointer;
  position: relative;
  z-index: 10;
}

.article-link:hover {
  color: #42b883;
}

.hot-articles {
  list-style: none;
  padding: 0;
  margin: 0;
}

.hot-articles li {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

.hot-articles li:last-child {
  border-bottom: none;
}

.hot-articles .article-link {
  font-size: 0.9rem;
  color: #666;
  position: relative;
  z-index: 10;
}

.hot-articles .article-link:hover {
  color: #42b883;
}

@media (max-width: 1024px) {
  .sidebar {
    width: 280px;
  }

  .sidebar-section {
    padding: 18px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
  }

  .sidebar-section {
    padding: 15px;
    border-radius: 6px;
  }

  .sidebar-title {
    font-size: 1rem;
    margin-bottom: 12px;
  }

  .category-header {
    padding: 8px 10px;
    gap: 6px;
  }

  .category-icon {
    font-size: 1.1rem;
  }

  .category-name {
    font-size: 0.95rem;
  }

  .toggle-icon {
    font-size: 0.75rem;
  }

  .article-list li {
    padding: 6px 12px;
  }

  .article-link {
    font-size: 0.85rem;
  }

  .hot-articles li {
    padding: 6px 0;
  }

  .hot-articles .article-link {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .sidebar-section {
    padding: 12px;
  }

  .sidebar-title {
    font-size: 0.95rem;
  }

  .category-header {
    padding: 6px 8px;
  }

  .article-list li,
  .hot-articles li {
    padding: 5px 10px;
  }

  .article-link {
    font-size: 0.8rem;
  }
}
</style>
