<template>
  <div class="about">
    <div class="about-content">
      <h1 class="about-title">关于本知识库</h1>
      
      <section class="about-section">
        <h2 class="section-title">📚 项目简介</h2>
        <p class="section-text">
          本知识库是一个专注于前端技术的学习平台,涵盖了从基础到进阶的各个技术领域。
          我们致力于为开发者提供系统化、结构化的技术知识,帮助大家更好地掌握前端开发技能。
        </p>
      </section>

      <section class="about-section">
        <h2 class="section-title">🎯 主要内容</h2>
        <ul class="feature-list">
          <li>
            <strong>前端框架:</strong> Vue.js、Vue Router、Pinia、组件库开发、Vue2/Vue3 源码解析
          </li>
          <li>
            <strong>前端 CSS/JS 库:</strong> TailwindCSS、CSS 动画库、Lodash、Day.js、Axios、VueUse、Swiper
          </li>
          <li>
            <strong>前端性能优化:</strong> 性能优化策略、代码规范与最佳实践
          </li>
          <li>
            <strong>构建与打包:</strong> npm、pnpm、yarn、Vite、Webpack
          </li>
          <li>
            <strong>App 开发:</strong> uni-app、Flutter、App 上架流程
          </li>
          <li>
            <strong>JavaScript 核心:</strong> 原型链、闭包、异步编程、ES6 新特性
          </li>
          <li>
            <strong>TypeScript:</strong> 类型系统、进阶特性、最佳实践
          </li>
          <li>
            <strong>数据可视化:</strong> ECharts、数据大屏开发、三维GIS 开发
          </li>
          <li>
            <strong>AI 与机器学习:</strong> TensorFlow.js、主流AI开发工具对比
          </li>
          <li>
            <strong>Node.js:</strong> Node.js 基础、Koa2 后端开发、CLI 工具开发、Vue3 CLI 从 0 到 1 实战
          </li>
          <li>
            <strong>Python:</strong> Python 核心语法、Flask Web 开发
          </li>
          <li>
            <strong>Linux:</strong> 系统入门、常用命令、用户权限、进程管理、网络配置
          </li>
          <li>
            <strong>容器化部署:</strong> Docker 容器化、Docker 集成 Jenkins CI/CD
          </li>
          <li>
            <strong>Git 与 GitHub:</strong> 版本控制基础、协作流程、GitHub Actions、Hooks
          </li>
          <li>
            <strong>数据结构与算法:</strong> 数组链表、栈队列、树图、排序算法、动态规划
          </li>
          <li>
            <strong>Kali 及渗透:</strong> 渗透测试入门、信息收集、漏洞扫描、Web 渗透、社工攻防
          </li>
          <li>
            <strong>量化交易:</strong> 量化交易入门、策略实战与回测
          </li>
        </ul>
      </section>

      <section class="about-section">
        <h2 class="section-title">📊 当前数据</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-number">{{ totalArticles }}</div>
            <div class="stat-label">篇技术文章</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">17</div>
            <div class="stat-label">大技术领域</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">100+</div>
            <div class="stat-label">核心知识点</div>
          </div>
        </div>
      </section>

      <section class="about-section">
        <h2 class="section-title">💡 使用建议</h2>
        <ol class="suggestion-list">
          <li>按照技术领域分类,系统化学习每个知识点</li>
          <li>每篇文章都包含核心知识点和详细解答</li>
          <li>结合实际项目进行实践,加深理解</li>
          <li>定期回顾,巩固所学知识</li>
          <li>关注热门文章,了解重点技术</li>
        </ol>
      </section>

      <section class="about-section">
        <h2 class="section-title">🔮 未来计划</h2>
        <ul class="feature-list">
          <li>持续更新最新的前端技术知识</li>
          <li>添加实战案例和代码示例</li>
          <li>提供在线练习和测试功能</li>
          <li>增加视频教程和直播分享</li>
          <li>建立技术交流社区</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// 所有文章ID列表，与首页/侧边栏保持一致，新增文章时同步更新
const allArticleIds = [
  // 前端框架
  '01-Vue', '05-Vue-Router', '02-Vuex-Pinia', '06-Vue组件库开发', '03-Vue2源码解析', '04-Vue3源码解析',
  // 前端 CSS/JS 库
  '31-TailwindCSS', '32-Animate', '33-Lodash-Underscore', '34-Day.js-Moment',
  '35-Axios-Fetch', '36-Vueuse', '37-Swiper', '38-工具函数库',
  // 前端性能优化
  '18-前端性能优化', '19-代码规范',
  // 构建与打包
  '20-包管理工具', '21-构建工具',
  // App 开发
  '27-uni-app', '28-Flutter', '22-App上架应用商店流程',
  // JavaScript 核心
  '06-JavaScript', '07-JavaScript高级特性', '08-ES6',
  // TypeScript
  '09-TypeScript', '10-TypeScript进阶',
  // 数据可视化
  '13-ECharts数据可视化', '14-数据大屏开发', '15-三维GIS开发',
  // AI 与机器学习
  '16-TensorFlow.js', '17-主流AI开发工具对比',
  // Node.js
  '11-Node.js', '12-Koa2后端开发', '39-NodeCLI', '60-Vue3CLI从0到1',
  // Python
  '25-Python', '26-Flask最佳实战', '26B-爬虫最佳实战',
  // Linux
  '43-Linux入门', '44-Linux常用命令', '45-Linux用户权限', '46-Linux进程管理', '47-Linux网络配置',
  // 容器化部署
  '23-Docker', '24-Docker集成Jenkins',
  // Git 与 GitHub
  '40-Git与GitHub', '41-GitHub协作', '42-Git高级操作',
  // 数据结构与算法
  '48-数组与链表', '49-栈与队列', '50-树与图', '51-排序算法', '52-动态规划',
  // Kali 及渗透
  '53-Kali入门', '54-信息收集', '55-漏洞扫描', '56-Web渗透', '57-密码攻击', '58-社工攻防',
  // 量化交易
  '29-量化交易入门', '30-量化交易策略实战'
]

const totalArticles = computed(() => allArticleIds.length)
</script>

<style scoped>
.about {
  animation: fadeIn 0.5s ease-in;
  padding: 0;
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

.about-content {
  max-width: 1000px;
  margin: 0 auto;
}

.about-title {
  font-size: 2.2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #42b883;
  position: relative;
}

.about-title::after {
  content: '✨';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.8rem;
  -webkit-text-fill-color: #667eea;
}

.about-section {
  margin-bottom: 25px;
  padding: 25px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid #f0f0f0;
}

.about-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #42b883;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 50px;
  height: 2px;
  background: linear-gradient(90deg, #42b883 0%, #35a372 100%);
}

.section-text {
  font-size: 1rem;
  line-height: 1.8;
  color: #555;
  margin-bottom: 15px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 1rem;
  color: #555;
  line-height: 1.6;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.feature-list li::before {
  content: '✓';
  color: #42b883;
  font-weight: bold;
  flex-shrink: 0;
}

.feature-list li:last-child {
  border-bottom: none;
}

.feature-list strong {
  color: #42b883;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 25px 20px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.stat-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

.stat-label {
  font-size: 0.95rem;
  opacity: 0.95;
  position: relative;
  z-index: 1;
}

.suggestion-list {
  padding-left: 0;
  list-style: none;
  font-size: 1rem;
  line-height: 1.8;
  color: #555;
}

.suggestion-list li {
  margin-bottom: 12px;
  padding: 10px 0;
  border-left: 3px solid #42b883;
  padding-left: 12px;
  background: #f8f9fa;
  border-radius: 0 6px 6px 0;
}

.suggestion-list li::before {
  content: counter(item) '. ';
  counter-increment: item;
  font-weight: bold;
  color: #42b883;
  margin-right: 5px;
}

.suggestion-list {
  counter-reset: item;
}

.contact-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1rem;
  color: #555;
  padding: 15px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eef4 100%);
  border-radius: 10px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.contact-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.contact-icon {
  font-size: 1.8rem;
}

/* 平板设备 */
@media (max-width: 1024px) {
  .about-title {
    font-size: 2rem;
  }

  .stats-grid {
    gap: 15px;
  }

  .stat-card {
    padding: 20px 15px;
  }
}

/* 手机设备 */
@media (max-width: 768px) {
  .about {
    padding: 0;
  }

  .about-title {
    font-size: 1.6rem;
    margin-bottom: 15px;
    padding-left: 5px;
  }

  .about-title::after {
    display: none;
  }

  .about-section {
    padding: 15px 12px;
    margin-bottom: 12px;
  }

  .section-title {
    font-size: 1.2rem;
    margin-bottom: 12px;
  }

  .section-text {
    font-size: 0.95rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stat-card {
    padding: 15px 12px;
  }

  .stat-number {
    font-size: 1.8rem;
  }

  .stat-label {
    font-size: 0.85rem;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .about-title {
    font-size: 1.4rem;
    margin-bottom: 12px;
  }

  .about-section {
    padding: 12px 10px;
  }

  .section-title {
    font-size: 1.1rem;
  }
}

/* 小屏手机 */
@media (max-width: 480px) {
  .about-title {
    font-size: 1.5rem;
  }

  .about-section {
    padding: 15px;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .stat-number {
    font-size: 1.8rem;
  }
}
</style>
