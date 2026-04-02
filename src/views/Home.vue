<template>
  <div class="home">
    <div class="hero">
      <h1 class="hero-title">前端技术知识库</h1>
      <p class="hero-subtitle">系统化学习前端开发，从基础到进阶</p>
      <div class="hero-stats">
        <div class="stat-item">
          <div class="stat-number">{{ totalArticles }}</div>
          <div class="stat-label">篇文档</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">{{ categories.length }}</div>
          <div class="stat-label">大技术领域</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">100+</div>
          <div class="stat-label">核心知识点</div>
        </div>
      </div>
    </div>

    <div class="content">
      <div class="categories">
        <div
          v-for="category in categories"
          :key="category.name"
          class="category-card"
        >
          <div class="category-header">
            <span class="category-icon">{{ category.icon }}</span>
            <h2 class="category-title">{{ category.name }}</h2>
          </div>
          <ul class="article-list">
            <li v-for="article in category.articles" :key="article.id">
              <router-link :to="`/article/${article.id}`" class="article-link">
                <span class="article-title">{{ article.title }}</span>
                <span class="article-arrow">→</span>
              </router-link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Article {
  id: string
  title: string
}

interface Category {
  name: string
  icon: string
  articles: Article[]
}

const categories = ref<Category[]>([
  {
    name: '前端框架',
    icon: '🎯',
    articles: [
      { id: '01-Vue', title: 'Vue' },
      { id: '05-Vue-Router', title: 'Vue Router' },
      { id: '02-Vuex-Pinia', title: 'Vuex 与 Pinia 对比' },
      { id: '73-Vue-SSR服务端渲染', title: 'Vue SSR 服务端渲染' },
      { id: '78-Vue通用业务组件开发', title: 'Vue 通用业务组件开发' },
      { id: '06-Vue组件库开发', title: 'Vue 组件库开发' },
      { id: '03-Vue2源码解析', title: 'Vue2 源码解析' },
      { id: '04-Vue3源码解析', title: 'Vue3 源码解析' }
    ]
  },
  {
    name: '前端 CSS/JS 库',
    icon: '🎨',
    articles: [
      { id: '31-TailwindCSS', title: 'TailwindCSS' },
      { id: '32-Animate', title: 'CSS 动画库' },
      { id: '33-Lodash-Underscore', title: 'Lodash & Underscore' },
      { id: '34-Day.js-Moment', title: 'Day.js & Moment.js' },
      { id: '35-Axios-Fetch', title: 'Axios & Fetch' },
      { id: '79-form-create表单生成器', title: 'form-create 表单生成器' },
      { id: '36-Vueuse', title: 'VueUse 工具库' },
      { id: '37-Swiper', title: 'Swiper 轮播库' },
      { id: '38-工具函数库', title: '常用工具函数库' }
    ]
  },
  {
    name: '前端性能优化',
    icon: '⚡',
    articles: [
      { id: '18-前端性能优化', title: '前端性能优化' },
      { id: '19-代码规范', title: '代码规范' }
    ]
  },
  {
    name: '构建与打包',
    icon: '⚡',
    articles: [
      { id: '20-包管理工具', title: 'npm、pnpm、npx、yarn' },
      { id: '75-Webpack5', title: 'Webpack 5 完全指南' },
      { id: '76-Vite原理', title: 'Vite 原理深度解析' },
      { id: '77-Rollup', title: 'Rollup 打包原理' }
    ]
  },
  {
    name: '微前端',
    icon: '🧩',
    articles: [
      { id: '66-微前端框架对比', title: '主流微前端框架对比' },
      { id: '67-从0到1实现微前端', title: '从 0 到 1 实现微前端' }
    ]
  },
  {
    name: 'App 开发',
    icon: '📱',
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
    articles: [
      { id: '06-JavaScript', title: 'JavaScript' },
      { id: '07-JavaScript高级特性', title: 'JavaScript 高级特性' },
      { id: '08-ES6', title: 'ES6' }
    ]
  },
  {
    name: 'TypeScript',
    icon: '📘',
    articles: [
      { id: '09-TypeScript', title: 'TypeScript' },
      { id: '10-TypeScript进阶', title: 'TypeScript 进阶' }
    ]
  },
  {
    name: '数据可视化',
    icon: '📊',
    articles: [
      { id: '13-ECharts数据可视化', title: 'ECharts' },
      { id: '14-数据大屏开发', title: '数据大屏开发' },
      { id: '15-三维GIS开发', title: '三维GIS 开发' }
    ]
  },
  {
    name: 'AI 与机器学习',
    icon: '🤖',
    articles: [
      { id: '16-TensorFlow.js', title: 'TensorFlow.js' },
      { id: '17-主流AI开发工具对比', title: 'AI 开发工具对比' }
    ]
  },
  {
    name: 'Node.js',
    icon: '🟢',
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
    articles: [
      { id: '71-Electron桌面端从0到1', title: 'Electron 从 0 到 1' }
    ]
  },
  {
    name: 'Python',
    icon: '🐍',
    articles: [
      { id: '25-Python', title: 'Python' },
      { id: '26-Flask最佳实战', title: 'Flask 最佳实战' },
      { id: '26B-爬虫最佳实战', title: '爬虫最佳实战' }
    ]
  },
  {
    name: 'Linux',
    icon: '💻',
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
    articles: [
      { id: '23-Docker', title: 'Docker' },
      { id: '24-Docker集成Jenkins', title: 'Docker 集成 Jenkins' }
    ]
  },
  {
    name: 'Git 与 GitHub',
    icon: '🔀',
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
    articles: [
      { id: '61-前端设计模式', title: '前端常用设计模式' }
    ]
  },
  {
    name: 'Kali 及渗透',
    icon: '🛠️',
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

// 动态计算文章总数
const totalArticles = computed(() =>
  categories.value.reduce((sum, cat) => sum + cat.articles.length, 0)
)
</script>

<style scoped>
.home {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 40px;
  text-align: center;
  border-radius: 12px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.hero-subtitle {
  font-size: 1.3rem;
  opacity: 0.95;
  margin-bottom: 40px;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
  flex-wrap: wrap;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.categories {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 30px;
}

.category-card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  border: 1px solid #f0f0f0;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  border-color: #42b883;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #42b883;
}

.category-icon {
  font-size: 2rem;
}

.category-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.article-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.article-list li {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.article-list li:last-child {
  border-bottom: none;
}

.article-link {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #555;
  text-decoration: none;
  transition: all 0.3s;
  padding: 8px 12px;
  border-radius: 6px;
}

.article-link:hover {
  color: #42b883;
  background: rgba(66, 184, 131, 0.05);
  padding-left: 16px;
}

.article-title {
  font-size: 0.95rem;
}

.article-arrow {
  font-size: 1.2rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s;
}

.article-link:hover .article-arrow {
  opacity: 1;
  transform: translateX(0);
}

@media (max-width: 1024px) {
  .categories {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .home {
    padding: 0;
  }

  .hero {
    padding: 20px 15px;
    margin-bottom: 15px;
    border-radius: 10px;
  }

  .hero-title {
    font-size: 1.6rem;
    margin-bottom: 10px;
  }

  .hero-subtitle {
    font-size: 0.95rem;
    margin-bottom: 25px;
  }

  .hero-stats {
    gap: 20px;
  }

  .stat-number {
    font-size: 1.6rem;
  }

  .stat-label {
    font-size: 0.8rem;
  }

  .categories {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 0;
  }

  .category-card {
    padding: 12px;
    border-radius: 10px;
  }

  .category-header {
    margin-bottom: 10px;
    padding-bottom: 8px;
  }

  .category-icon {
    font-size: 1.3rem;
  }

  .category-title {
    font-size: 1.1rem;
  }

  .article-list li {
    padding: 8px 0;
  }

  .article-title {
    font-size: 0.95rem;
    color: #555;
  }

  .article-arrow {
    font-size: 1rem;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .hero {
    padding: 15px 12px;
    margin-bottom: 12px;
    border-radius: 8px;
  }

  .hero-title {
    font-size: 1.4rem;
  }

  .hero-subtitle {
    font-size: 0.9rem;
  }

  .categories {
    gap: 8px;
  }

  .category-card {
    padding: 10px;
    border-radius: 8px;
  }
}
</style>
