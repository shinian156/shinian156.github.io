<template>
  <div class="article">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="article" class="article-container">
      <header class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span class="meta-item">
            <span class="meta-icon">📂</span>
            <span class="meta-text">{{ article.category }}</span>
          </span>
          <span class="meta-item">
            <span class="meta-icon">📅</span>
            <span class="meta-text">{{ article.date }}</span>
          </span>
          <span class="meta-item">
            <span class="meta-icon">👁️</span>
            <span class="meta-text">{{ article.views }} 次阅读</span>
          </span>
        </div>
        </header>

      <div class="article-content" v-html="article.content" @click="handleContentClick"></div>

      <div class="article-actions">
        <button @click="share" class="action-btn share-btn">
          <span class="btn-icon">📤</span>
          <span class="btn-text">分享文章</span>
        </button>
      </div>

      <!-- 返回顶部按钮 -->
      <button @click="scrollToTop" class="back-to-top" :class="{ visible: showBackToTop }">
        <span class="back-to-top-icon">↑</span>
      </button>

      <div class="related-articles" v-if="relatedArticles.length > 0">
        <h3 class="related-title">相关文章</h3>
        <ul class="related-list">
          <li v-for="related in relatedArticles" :key="related.id">
            <router-link :to="`/article/${related.id}`" class="related-link">
              {{ related.title }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
    <div v-else class="not-found">
      <div class="not-found-icon">📄</div>
      <h2>文章不存在</h2>
      <p>该文章可能已被删除或移动</p>
      <button @click="goBack" class="action-btn back-btn">返回首页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/atom-one-dark.css'

// 配置 marked - 确保 SVG 等 HTML 元素正确渲染
marked.use({
  breaks: true,
  gfm: true,
  // 允许原始 HTML，不进行任何过滤
  renderer: null, // 使用默认渲染器
})

const route = useRoute()

interface Article {
  id: string
  title: string
  category: string
  date: string
  views: number
  content: string
}

interface Navigation {
  prev: Article | null
  next: Article | null
}

const loading = ref(true)
const article = ref<Article | null>(null)
const showBackToTop = ref(false)

// 简单的 Markdown 解析函数,手动为标题添加 id
const parseMarkdown = (markdown: string): { title: string; content: string } => {
  // 提取第一个 h1 标题
  const titleMatch = markdown.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : '未知标题'

  // 先将 Markdown 转换为 HTML
  let htmlContent = marked(markdown)

  // 手动为标题添加 id
  htmlContent = htmlContent.replace(
    /<h([1-6])>(.*?)<\/h\1>/g,
    (match, level, text) => {
      // 生成 id: 转为小写,空格替换为连字符,移除特殊字符,保留中文
      const id = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')  // 保留中文和字母数字
        .replace(/\s+/g, '-')     // 空格替换为连字符
        .replace(/-+/g, '-')      // 多个连字符合并为一个
        .trim()

      return `<h${level} id="${id}">${text}</h${level}>`
    }
  )

  return { title, content: htmlContent }
}

// 高亮代码块
const highlightCode = () => {
  document.querySelectorAll('pre code').forEach((block: any) => {
    hljs.highlightElement(block)

    // 为每个代码块添加语言标签和复制按钮
    const pre = block.parentElement
    if (pre) {
      // 添加语言标签
      console.log('Block className:', block.className)
      const languageMatch = block.className.match(/(?:^|\s)language-(\w+)/)
      const language = languageMatch ? languageMatch[1].toUpperCase() : 'CODE'
      console.log('Detected language:', language)
      pre.setAttribute('data-lang', language)

      // 添加复制按钮
      if (!pre.querySelector('.copy-btn')) {
        const copyBtn = document.createElement('button')
        copyBtn.className = 'copy-btn'
        copyBtn.textContent = '复制'
        copyBtn.type = 'button'
        copyBtn.setAttribute('aria-label', '复制代码')
        copyBtn.style.display = 'inline-block'  // 确保按钮显示
        copyBtn.style.position = 'absolute'     // 确保绝对定位
        copyBtn.style.zIndex = '100'             // 确保在最上层

        // 调试信息
        console.log('Adding copy button, pre element:', pre)
        console.log('Pre offsetWidth:', pre.offsetWidth, 'clientWidth:', pre.clientWidth)
        console.log('Pre computedStyle:')
        const preStyle = window.getComputedStyle(pre)
        console.log('  position:', preStyle.position)
        console.log('  paddingTop:', preStyle.paddingTop)
        console.log('  paddingRight:', preStyle.paddingRight)
        console.log('  overflow:', preStyle.overflow)
        console.log('  data-lang:', pre.getAttribute('data-lang'))

        copyBtn.addEventListener('click', async (e) => {
          e.preventDefault()
          e.stopPropagation()

          try {
            // 获取代码文本
            let codeText = ''
            if (block.innerText) {
              codeText = block.innerText
            } else if (block.textContent) {
              codeText = block.textContent
            } else {
              codeText = ''
            }

            console.log('Copying code length:', codeText.length)
            console.log('Code preview:', codeText.substring(0, 50) + '...')

            // 尝试使用 navigator.clipboard
            if (navigator.clipboard && navigator.clipboard.writeText) {
              await navigator.clipboard.writeText(codeText)
            } else {
              // 降级方案：使用 document.execCommand
              const textArea = document.createElement('textarea')
              textArea.value = codeText
              textArea.style.position = 'fixed'
              textArea.style.left = '-9999px'
              textArea.style.top = '0'
              document.body.appendChild(textArea)
              textArea.select()
              document.execCommand('copy')
              document.body.removeChild(textArea)
            }

            // 显示复制成功
            copyBtn.textContent = '已复制 ✓'
            copyBtn.style.background = '#35a372'

            setTimeout(() => {
              copyBtn.textContent = '复制'
              copyBtn.style.background = '#42b883'
            }, 2000)
          } catch (err) {
            console.error('复制失败:', err)
            copyBtn.textContent = '复制失败 ✗'
            copyBtn.style.background = '#dc3545'

            setTimeout(() => {
              copyBtn.textContent = '复制'
              copyBtn.style.background = '#42b883'
            }, 2000)
          }
        })

        // 将按钮插入到 pre 元素中
        pre.appendChild(copyBtn)
        console.log('Copy button added to pre element')
      }
    }
  })
}

// 从 Markdown 文件加载文章内容
const loadMarkdownFile = async (filename: string): Promise<string> => {
  try {
    const response = await fetch(`/posts/${filename}.md`)
    if (!response.ok) {
      console.error(`Failed to load markdown file: ${filename}.md - Status: ${response.status}`)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const markdownText = await response.text()
    console.log(`Successfully loaded ${filename}.md, length: ${markdownText.length}`)
    return markdownText
  } catch (error) {
    console.error('Failed to load markdown file:', error)
    return ''
  }
}

// 文章分类映射
const categoryMap: Record<string, string> = {
  // 前端框架
  '01-Vue': '前端框架',
  '05-Vue-Router': '前端框架',
  '02-Vuex-Pinia': '前端框架',
  '06-Vue组件库开发': '前端框架',
  '03-Vue2源码解析': '前端框架',
  '04-Vue3源码解析': '前端框架',
  '73-Vue-SSR服务端渲染': '前端框架',
  // 前端 CSS/JS 库
  '31-TailwindCSS': '前端 CSS/JS 库',
  '32-Animate': '前端 CSS/JS 库',
  '33-Lodash-Underscore': '前端 CSS/JS 库',
  '34-Day.js-Moment': '前端 CSS/JS 库',
  '35-Axios-Fetch': '前端 CSS/JS 库',
  '36-Vueuse': '前端 CSS/JS 库',
  '37-Swiper': '前端 CSS/JS 库',
  '38-工具函数库': '前端 CSS/JS 库',
  // 前端性能优化
  '18-前端性能优化': '前端性能优化',
  '19-代码规范': '前端性能优化',
  // 构建与打包
  '20-包管理工具': '构建与打包',
  '75-Webpack': '构建与打包',
  '76-Vite': '构建与打包',
  '77-Rollup': '构建与打包',
  // 微前端
  '66-微前端框架对比': '微前端',
  '67-从0到1实现微前端': '微前端',
  // App 开发
  '27-uni-app': 'App 开发',
  '28-Flutter': 'App 开发',
  '22-App上架应用商店流程': 'App 开发',
  '68-uni-app集成支付': 'App 开发',
  '69-uni-app消息推送': 'App 开发',
  '70-第三方授权登录': 'App 开发',
  // JavaScript 核心
  '06-JavaScript': 'JavaScript 核心',
  '07-JavaScript高级特性': 'JavaScript 核心',
  '08-ES6': 'JavaScript 核心',
  // TypeScript
  '09-TypeScript': 'TypeScript',
  '10-TypeScript进阶': 'TypeScript',
  // 数据可视化
  '13-ECharts数据可视化': '数据可视化',
  '14-数据大屏开发': '数据可视化',
  '15-三维GIS开发': '数据可视化',
  // AI 与机器学习
  '16-TensorFlow.js': 'AI 与机器学习',
  '17-主流AI开发工具对比': 'AI 与机器学习',
  // Node.js
  '11-Node.js': 'Node.js',
  '12-Koa2后端开发': 'Node.js',
  '74-NestJS后端开发': 'Node.js',
  '39-NodeCLI': 'Node.js',
  '60-Vue3CLI从0到1': 'Node.js',
  '72-Node.js数据库': 'Node.js',
  // Node.js 桌面端
  '71-Electron桌面端从0到1': 'Node.js 桌面端',
  // Python
  '25-Python': 'Python',
  '26-Flask最佳实战': 'Python',
  '26B-爬虫最佳实战': 'Python',
  // Linux
  '43-Linux入门': 'Linux',
  '44-Linux常用命令': 'Linux',
  '45-Linux用户权限': 'Linux',
  '46-Linux进程管理': 'Linux',
  '47-Linux网络配置': 'Linux',
  // 容器化部署
  '23-Docker': '容器化部署',
  '24-Docker集成Jenkins': '容器化部署',
  // 数据结构与算法
  '48-数组与链表': '数据结构与算法',
  '49-栈与队列': '数据结构与算法',
  '50-树与图': '数据结构与算法',
  '51-排序算法': '数据结构与算法',
  '52-动态规划': '数据结构与算法',
  // Kali 及渗透
  '53-Kali入门': 'Kali 及渗透',
  '54-信息收集': 'Kali 及渗透',
  '55-漏洞扫描': 'Kali 及渗透',
  '56-Web渗透': 'Kali 及渗透',
  '57-密码攻击': 'Kali 及渗透',
  '58-社工攻防': 'Kali 及渗透',
  // 前端常用设计模式
  '61-前端设计模式': '前端常用设计模式',
  // Git 与 GitHub
  '40-Git与GitHub': 'Git 与 GitHub',
  '41-GitHub协作': 'Git 与 GitHub',
  '42-Git高级操作': 'Git 与 GitHub',
  '62-GitHub部署流程': 'Git 与 GitHub',
  // 股票分析
  '29-量化交易入门': '股票分析',
  '30-量化交易策略实战': '股票分析',
  '62-常见K线图': '股票分析',
  '63-龙头战法': '股票分析',
  '64-游资操盘手法': '股票分析',
  '65-情绪周期': '股票分析'
}

// 模拟文章数据
const articles: Record<string, Article> = {}

// 文章ID列表，用于确定上下篇
const articleIds = Object.keys(categoryMap)

// 计算上下篇文章
const navigation = computed((): Navigation => {
  if (!article.value) {
    return { prev: null, next: null }
  }

  const currentIndex = articleIds.indexOf(article.value.id)
  if (currentIndex === -1) {
    return { prev: null, next: null }
  }

  let prev: Article | null = null
  let next: Article | null = null

  // 上一篇（上一篇文章）
  if (currentIndex > 0) {
    const prevId = articleIds[currentIndex - 1]
    prev = articles[prevId] || null
  }

  // 下一篇（下一篇文章）
  if (currentIndex < articleIds.length - 1) {
    const nextId = articleIds[currentIndex + 1]
    next = articles[nextId] || null
  }

  return { prev, next }
})

const relatedArticles = computed(() => {
  if (!article.value) return []
  return Object.values(articles)
    .filter(a => a.id !== article.value?.id && a.category === article.value?.category)
    .slice(0, 5)
})

const loadArticle = async (id: string) => {
  loading.value = true
  console.log('Loading article with id:', id)

  try {
    // 加载 Markdown 文件
    const markdownText = await loadMarkdownFile(id)

    if (markdownText) {
      const { title, content } = parseMarkdown(markdownText)
      console.log('Parsed article - title:', title, 'content length:', content.length)

      // 创建或更新文章对象
      if (!articles[id]) {
        articles[id] = {
          id,
          title,
          category: categoryMap[id] || '其他',
          date: '2024-01-15',
          views: Math.floor(Math.random() * 1000) + 500,
          content
        }
      } else {
        articles[id].title = title
        articles[id].content = content
      }

      article.value = articles[id]
      console.log('Article loaded successfully:', article.value?.title)

      // 在内容渲染后高亮代码
      setTimeout(() => {
        highlightCode()
      }, 100)
    } else {
      console.error('Markdown file is empty or failed to load')
    }
  } catch (error) {
    console.error('Failed to load article:', error)
  } finally {
    loading.value = false
  }
}

const share = () => {
  if (navigator.share) {
    navigator.share({
      title: article.value?.title,
      text: article.value?.title,
      url: window.location.href
    })
  } else {
    alert('当前浏览器不支持分享功能')
  }
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

// 平滑滚动到锚点
const scrollToAnchor = (id: string) => {
  const element = document.getElementById(id)
  if (element) {
    const offset = 80 // 顶部偏移量,避免被导航栏遮挡
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - offset

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

// 处理内容区域的点击事件(用于锚点跳转)
const handleContentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement

  // 检查是否点击了锚点链接
  if (target.tagName === 'A' && target.getAttribute('href')?.startsWith('#')) {
    event.preventDefault()
    const anchorId = target.getAttribute('href')?.substring(1)
    if (anchorId) {
      // 解码 URL 编码的锚点 ID (中文会被编码成 %xx 格式)
      const decodedId = decodeURIComponent(anchorId)
      console.log('原始锚点 ID:', anchorId, '解码后:', decodedId)

      scrollToAnchor(decodedId)
    }
  }
}

onMounted(() => {
  const articleId = route.params.id as string
  loadArticle(articleId)
  // 高亮代码块
  highlightCode()
  // 添加滚动监听
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
/* Scoped styles for the component */
.article {
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

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b883;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.article-header {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #42b883;
}

.article-title {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 15px;
  line-height: 1.3;
}

.article-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 0.9rem;
}

.meta-icon {
  font-size: 1.1rem;
}

.meta-text {
  font-size: 0.9rem;
}

.article-content {
  font-size: 1rem;
  line-height: 1.8;
  color: #333;
  padding: 10px 0;
}

.article-content h1 {
  font-size: 1.8rem;
  margin-top: 2.2rem;
  margin-bottom: 1.2rem;
  color: #2c3e50;
  font-weight: 700;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #e0e0e0;
}

.article-content h2 {
  font-size: 1.6rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-weight: 600;
  padding-left: 0.8rem;
  border-left: 4px solid #42b883;
}

.article-content h3 {
  font-size: 1.4rem;
  margin-top: 1.6rem;
  margin-bottom: 0.8rem;
  color: #34495e;
  font-weight: 600;
}

.article-content h4 {
  font-size: 1.2rem;
  margin-top: 1.4rem;
  margin-bottom: 0.6rem;
  color: #34495e;
  font-weight: 600;
}

.article-content p {
  margin-bottom: 1.2rem;
  line-height: 1.8;
  color: #333;
}

.article-content ul,
.article-content ol {
  margin-bottom: 1.2rem;
  padding-left: 1.8rem;
}

.article-content li {
  margin-bottom: 0.6rem;
  line-height: 1.6;
}

.article-content ul li {
  list-style-type: disc;
}

.article-content ol li {
  list-style-type: decimal;
}

.article-content pre {
  background: #1e1e1e;
  padding: 3rem 1.8rem 1.8rem 1.8rem;
  border-radius: 12px;
  overflow-x: auto;
  overflow-y: visible;
  margin: 1.8rem 0;
  border: 1px solid #3c3c3c;
  position: relative;
  line-height: 1.8;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
}

/* 自定义滚动条 */
.article-content pre::-webkit-scrollbar {
  height: 10px;
}

.article-content pre::-webkit-scrollbar-track {
  background: #2d2d2d;
  border-radius: 5px;
}

.article-content pre::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 5px;
}

.article-content pre::-webkit-scrollbar-thumb:hover {
  background: #666;
}

.article-content pre::before {
  content: attr(data-lang);
  position: absolute;
  top: 12px;
  left: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6px 14px;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 6px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
}

/* 复制按钮样式 - PC端 */
.copy-btn {
  position: absolute;
  top: 12px;
  right: 18px;
  padding: 6px 14px;
  background: linear-gradient(135deg, #42b883 0%, #35a372 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  z-index: 10;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(66, 184, 131, 0.4);
  letter-spacing: 0.5px;
}

.copy-btn:hover {
  background: linear-gradient(135deg, #35a372 0%, #2d8a5c 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.5);
}

.copy-btn:active {
  transform: scale(0.95);
}

.article-content code {
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  background: #f6f8fa;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  color: #24292e;
}

.article-content pre code {
  background: transparent !important;
  padding: 0;
  color: #24292e !important;
  display: block;
  line-height: 1.6;
}

/* Highlight.js 深色主题覆盖 - 代码高亮更清晰 */
.article-content pre .hljs {
  background: transparent;
  padding: 0;
  color: #d4d4d4;
}

.article-content pre .hljs-comment,
.article-content pre .hljs-quote {
  color: #6a9955;
  font-style: italic;
}

.article-content pre .hljs-keyword,
.article-content pre .hljs-selector-tag,
.article-content pre .hljs-subst {
  color: #569cd6;
  font-weight: 500;
}

.article-content pre .hljs-number,
.article-content pre .hljs-literal,
.article-content pre .hljs-variable,
.article-content pre .hljs-template-variable {
  color: #b5cea8;
}

.article-content pre .hljs-string,
.article-content pre .hljs-doctag {
  color: #ce9178;
}

.article-content pre .hljs-title,
.article-content pre .hljs-section,
.article-content pre .hljs-type,
.article-content pre .hljs-tag .hljs-name {
  color: #4ec9b0;
}

.article-content pre .hljs-attribute,
.article-content pre .hljs-name {
  color: #9cdcfe;
}

.article-content pre .hljs-built_in,
.article-content pre .hljs-bullet,
.article-content pre .hljs-code {
  color: #dcdcaa;
}

.article-content pre .hljs-regexp,
.article-content pre .hljs-link {
  color: #d16969;
}

.article-content pre .hljs-symbol,
.article-content pre .hljs-variable,
.article-content pre .hljs-template-variable {
  color: #4fc1ff;
}

.article-content pre .hljs-meta,
.article-content pre .hljs-deletion {
  color: #f44747;
}

.article-content pre .hljs-addition {
  color: #b5cea8;
}

.article-content pre .hljs-function {
  color: #dcdcaa;
  font-weight: 500;
}

.article-content pre .hljs-class {
  color: #4ec9b0;
}

.article-content pre .hljs-constant {
  color: #4fc1ff;
}

.article-content pre .hljs-property {
  color: #9cdcfe;
}

.article-content pre .hljs-operator {
  color: #d4d4d4;
}

.article-content pre .hljs-class {
  color: #4ec9b0;
}

.article-content pre .hljs-constant {
  color: #4fc1ff;
}

.article-content pre .hljs-property {
  color: #9cdcfe;
}

.article-content pre .hljs-operator {
  color: #d4d4d4;
}

/* 文章导航 */
.article-navigation {
  display: flex;
  gap: 20px;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #e0e0e0;
}

.nav-link {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s;
  color: inherit;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.nav-link:hover {
  background: #f8f9fa;
  border-color: #42b883;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(66, 184, 131, 0.15);
}

.nav-prev {
  justify-content: flex-start;
}

.nav-next {
  justify-content: flex-end;
  text-align: right;
}

.nav-icon {
  font-size: 1.5rem;
  color: #42b883;
  transition: transform 0.3s;
}

.nav-link:hover .nav-icon {
  transform: scale(1.1);
}

.nav-content {
  flex: 1;
  min-width: 0;
}

.nav-label {
  display: block;
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 6px;
  font-weight: 500;
}

.nav-title {
  display: block;
  font-size: 1rem;
  color: #333;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-link:hover .nav-title {
  color: #42b883;
}

.article-content blockquote {
  margin: 1.2rem 0;
  padding: 1.2rem 1.4rem;
  border-left: 4px solid #42b883;
  background: #f8f9fa;
  color: #666;
  font-style: italic;
}

.article-content strong {
  font-weight: 600;
  color: #2c3e50;
}

.article-content em {
  font-style: italic;
}

.article-content a {
  color: #42b883;
  text-decoration: none;
  transition: color 0.2s;
}

.article-content a:hover {
  color: #35a372;
  text-decoration: underline;
}

/* 表格样式 */
.article-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  overflow: visible;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: white;
}

.article-content thead {
  background: linear-gradient(135deg, #42b883 0%, #35a372 100%);
  color: white;
}

.article-content th {
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #35a372;
}

.article-content tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.article-content tbody tr:nth-child(even) {
  background: #f8f9fa;
}

.article-content tbody tr:hover {
  background: rgba(66, 184, 131, 0.08);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(66, 184, 131, 0.1);
}

.article-content td {
  padding: 14px 20px;
  font-size: 0.95rem;
  color: #333;
  line-height: 1.6;
  border: none;
}

.article-content td:first-child {
  font-weight: 500;
  color: #2c3e50;
}

.article-content tfoot {
  background: #f8f9fa;
}

.article-content tfoot td {
  padding: 12px 20px;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  border-top: 2px solid #e0e0e0;
}

/* 分隔线 */
.article-content hr {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #42b883 50%, transparent 100%);
  margin: 2rem 0;
  opacity: 0.6;
}

/* 图片样式 */
.article-content img {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  margin: 1.5rem 0;
  display: block;
}

/* SVG 样式 - 确保K线图完整显示 */
.article-content svg {
  max-width: 100%;
  width: auto !important;
  height: auto !important;
  overflow: visible !important;
  margin: 1.5rem 0;
  display: block;
}

/* 表格中的 SVG 也要显示完整 */
.article-content table svg {
  overflow: visible !important;
  max-width: none;
  width: auto !important;
  height: auto !important;
}

/* 任务列表 */
.article-content ul.contains-task-list {
  list-style: none;
  padding-left: 0;
}

.article-content .task-list-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  margin-bottom: 8px;
}

.article-content .task-list-item input[type="checkbox"] {
  margin-top: 4px;
  width: 18px;
  height: 18px;
  accent-color: #42b883;
  cursor: pointer;
}

.article-content .task-list-item input[type="checkbox"]:checked + span {
  text-decoration: line-through;
  color: #999;
}

.article-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e0e0e0;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-icon {
  font-size: 1.2rem;
}

.share-btn {
  background: #e0e0e0;
  color: #333;
}

.share-btn:hover {
  background: #d0d0d0;
  transform: translateY(-2px);
}

/* 返回顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: 80px;
  right: 30px;
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, #42b883 0%, #35a372 100%);
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.4);
  transition: all 0.3s;
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-to-top.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.back-to-top:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 6px 16px rgba(66, 184, 131, 0.5);
}

.back-to-top:active {
  transform: translateY(-2px) scale(0.98);
}

.back-to-top-icon {
  display: block;
  line-height: 1;
}

/* 移动端样式调整 */
@media (max-width: 768px) {
  .back-to-top {
    bottom: 80px;
    right: 20px;
    width: 45px;
    height: 45px;
    font-size: 1.5rem;
  }
}

.related-articles {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #e0e0e0;
}

.related-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #333;
}

.related-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.related-list li {
  margin-bottom: 12px;
}

.related-link {
  color: #42b883;
  text-decoration: none;
  font-size: 1.1rem;
  transition: all 0.3s;
  display: block;
  padding: 10px;
  border-radius: 6px;
}

.related-link:hover {
  background: rgba(66, 184, 131, 0.05);
  padding-left: 16px;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #666;
  text-align: center;
}

.not-found-icon {
  font-size: 5rem;
  margin-bottom: 20px;
}

.not-found h2 {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #333;
}

/* 平板设备 */
@media (max-width: 1024px) {
  .article-title {
    font-size: 1.8rem;
  }

  .article-header {
    margin-bottom: 20px;
  }

  .article-meta {
    gap: 15px;
  }

  .article-content h1 {
    font-size: 1.6rem;
  }

  .article-content h2 {
    font-size: 1.4rem;
  }

  .article-content h3 {
    font-size: 1.2rem;
  }
}

/* 手机设备 */
@media (max-width: 768px) {
  .article {
    padding: 0;
  }

  .loading {
    min-height: 300px;
  }

  .article-header {
    padding: 0 5px;
    margin-bottom: 15px;
    padding-bottom: 12px;
  }

  .article-title {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #333;
  }

  .article-meta {
    gap: 12px;
  }

  .meta-item {
    font-size: 0.85rem;
    color: #666;
  }

  .meta-icon {
    font-size: 1rem;
  }

  .article-content {
    font-size: 0.95rem;
    padding: 5px 8px;
    color: #333;
    line-height: 1.7;
  }

  .article-content h1 {
    font-size: 1.4rem;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: #2c3e50;
  }

  .article-content h2 {
    font-size: 1.25rem;
    margin-top: 1.3rem;
    margin-bottom: 0.9rem;
    padding-left: 0.6rem;
    border-left-width: 3px;
    color: #2c3e50;
  }

  .article-content h3 {
    font-size: 1.15rem;
    margin-top: 1.2rem;
    margin-bottom: 0.7rem;
    color: #34495e;
  }

  .article-content h4 {
    font-size: 1.05rem;
    color: #34495e;
  }

  .article-content p {
    margin-bottom: 1rem;
    color: #555;
  }

  .article-content ul,
  .article-content ol {
    padding-left: 1.5rem;
  }

  .article-content li {
    margin-bottom: 0.6rem;
    color: #555;
  }

  .article-content pre {
    padding: 2.5rem 1rem 1rem 1rem;
    font-size: 0.85rem;
    overflow-x: auto;
    overflow-y: visible;
    margin: 1rem 5px;
    background: #f8f9fa !important;
    border: 1px solid #e1e4e8 !important;
    box-shadow: none;
    border-radius: 10px;
    box-sizing: border-box;
    width: calc(100% - 10px);
    position: relative !important;
  }

  .article-content pre::before {
    background: #e1e4e8;
    color: #586069;
    left: 8px;
    font-size: 0.7rem;
    padding: 4px 8px;
  }

  .article-content pre code {
    color: #24292e !important;
  }

  /* 移动端浅色主题 */
  .article-content pre .hljs {
    color: #24292e;
  }

  .article-content pre .hljs-comment,
  .article-content pre .hljs-quote {
    color: #6a737d;
  }

  .article-content pre .hljs-keyword,
  .article-content pre .hljs-selector-tag,
  .article-content pre .hljs-subst {
    color: #d73a49;
  }

  .article-content pre .hljs-number,
  .article-content pre .hljs-literal,
  .article-content pre .hljs-variable,
  .article-content pre .hljs-template-variable {
    color: #005cc5;
  }

  .article-content pre .hljs-string,
  .article-content pre .hljs-doctag {
    color: #032f62;
  }

  .article-content pre .hljs-title,
  .article-content pre .hljs-section,
  .article-content pre .hljs-type,
  .article-content pre .hljs-tag .hljs-name {
    color: #6f42c1;
  }

  .article-content pre .hljs-attribute,
  .article-content pre .hljs-name {
    color: #6f42c1;
  }

  .article-content pre .hljs-built_in,
  .article-content pre .hljs-bullet,
  .article-content pre .hljs-code {
    color: #e36209;
  }

  .article-content pre .hljs-class {
    color: #6f42c1;
  }

  .article-content pre .hljs-constant {
    color: #005cc5;
  }

  .article-content pre .hljs-property {
    color: #6f42c1;
  }

  .article-content pre .hljs-function {
    color: #6f42c1;
  }

  /* 移动端浅色主题 */
  .article-content pre .hljs {
    color: #24292e;
  }

  .article-content pre .hljs-comment,
  .article-content pre .hljs-quote {
    color: #6a737d;
  }

  .article-content pre .hljs-keyword,
  .article-content pre .hljs-selector-tag,
  .article-content pre .hljs-subst {
    color: #d73a49;
  }

  .article-content pre .hljs-number,
  .article-content pre .hljs-literal,
  .article-content pre .hljs-variable,
  .article-content pre .hljs-template-variable {
    color: #005cc5;
  }

  .article-content pre .hljs-string,
  .article-content pre .hljs-doctag {
    color: #032f62;
  }

  .article-content pre .hljs-title,
  .article-content pre .hljs-section,
  .article-content pre .hljs-type,
  .article-content pre .hljs-tag .hljs-name {
    color: #6f42c1;
  }

  .article-content pre .hljs-attribute,
  .article-content pre .hljs-name {
    color: #6f42c1;
  }

  .article-content pre .hljs-built_in,
  .article-content pre .hljs-bullet,
  .article-content pre .hljs-code {
    color: #e36209;
  }

  .article-content pre .hljs-class {
    color: #6f42c1;
  }

  .article-content pre .hljs-constant {
    color: #005cc5;
  }

  .article-content pre .hljs-property {
    color: #6f42c1;
  }

  .article-content pre .hljs-function {
    color: #6f42c1;
  }

  .article-content code {
    font-size: 0.85rem;
  }

  /* 移动端表格样式 */
  .article-content table {
    font-size: 0.85rem;
    margin: 1rem 0;
    border-radius: 6px;
  }

  .article-content th {
    padding: 10px 12px;
    font-size: 0.85rem;
  }

  .article-content td {
    padding: 10px 12px;
    font-size: 0.85rem;
  }

  .article-content blockquote {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
    margin: 0.8rem 0;
  }

  /* 移动端图片 */
  .article-content img {
    border-radius: 6px;
    margin: 1rem 0;
  }

  /* 移动端SVG样式 */
  .article-content svg {
    max-width: 100%;
    height: auto;
    overflow: visible !important;
  }

  .article-actions {
    flex-direction: column;
    gap: 10px;
    margin-top: 30px;
    padding: 0 10px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
    padding: 10px 20px;
  }

  .article-navigation {
    flex-direction: column;
    gap: 12px;
    margin-top: 30px;
    padding-top: 20px;
  }

  .nav-link {
    padding: 15px;
    gap: 10px;
  }

  .nav-icon {
    font-size: 1.3rem;
  }

  .nav-label {
    font-size: 0.8rem;
  }

  .nav-title {
    font-size: 0.95rem;
  }

  .related-articles {
    margin-top: 30px;
    padding-top: 20px;
    padding: 20px 10px 0;
  }

  .related-title {
    font-size: 1.3rem;
    margin-bottom: 15px;
    color: #333;
  }

  .related-list li {
    margin-bottom: 10px;
  }

  .related-link {
    font-size: 1rem;
    padding: 8px;
    color: #42b883;
  }
}
</style>

<style>
/* ============================================================================
   全局样式 - 用于 v-html 渲染的 Markdown 内容
   Vue 的 scoped 样式不会影响 v-html 插入的内容,所以这里使用全局样式
   ============================================================================ */

/* 基础容器样式 */
.article-content {
  font-size: 1rem;
  line-height: 1.8;
  color: #333;
  padding: 10px 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

/* 标题样式 */
.article-content h1 {
  font-size: 1.8rem;
  margin-top: 2.2rem;
  margin-bottom: 1.2rem;
  color: #2c3e50;
  font-weight: 700;
  padding-bottom: 0.8rem;
  border-bottom: 2px solid #e0e0e0;
  letter-spacing: -0.5px;
}

.article-content h2 {
  font-size: 1.6rem;
  margin-top: 2rem;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-weight: 600;
  padding-left: 0.8rem;
  border-left: 4px solid #42b883;
  letter-spacing: -0.3px;
}

.article-content h3 {
  font-size: 1.4rem;
  margin-top: 1.6rem;
  margin-bottom: 0.8rem;
  color: #34495e;
  font-weight: 600;
  letter-spacing: -0.2px;
}

.article-content h4 {
  font-size: 1.2rem;
  margin-top: 1.4rem;
  margin-bottom: 0.6rem;
  color: #34495e;
  font-weight: 600;
}

.article-content h5 {
  font-size: 1.1rem;
  margin-top: 1.2rem;
  margin-bottom: 0.6rem;
  color: #34495e;
  font-weight: 500;
}

.article-content h6 {
  font-size: 1rem;
  margin-top: 1.2rem;
  margin-bottom: 0.6rem;
  color: #34495e;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 段落样式 */
.article-content p {
  margin-bottom: 1.2rem;
  line-height: 1.8;
  color: #333;
  font-weight: 400;
}

/* 列表样式 */
.article-content ul,
.article-content ol {
  margin-bottom: 1.2rem;
  padding-left: 1.8rem;
}

.article-content li {
  margin-bottom: 0.6rem;
  line-height: 1.6;
  color: #333;
}

.article-content ul li {
  list-style-type: disc;
  padding-left: 0.5rem;
}

.article-content ul ul li {
  list-style-type: circle;
}

.article-content ul ul ul li {
  list-style-type: square;
}

.article-content ol li {
  list-style-type: decimal;
  padding-left: 0.5rem;
}

.article-content ol ol li {
  list-style-type: lower-alpha;
}

.article-content ol ol ol li {
  list-style-type: lower-roman;
}

/* 任务列表样式 */
.article-content ul.contains-task-list {
  list-style: none;
  padding-left: 0;
}

.article-content .task-list-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 8px 0;
  margin-bottom: 8px;
  transition: background 0.2s;
}

.article-content .task-list-item:hover {
  background: rgba(66, 184, 131, 0.05);
  padding-left: 8px;
  padding-right: 8px;
  border-radius: 4px;
}

.article-content .task-list-item input[type="checkbox"] {
  margin-top: 4px;
  width: 18px;
  height: 18px;
  accent-color: #42b883;
  cursor: pointer;
  flex-shrink: 0;
}

.article-content .task-list-item input[type="checkbox"]:checked + span {
  text-decoration: line-through;
  color: #999;
}

/* 代码块样式 */
.article-content pre {
  background: #1e1e1e;
  padding: 3rem 1.8rem 1.8rem 1.8rem;
  border-radius: 12px;
  overflow-x: auto;
  overflow-y: visible;
  margin: 1.8rem 0;
  border: 1px solid #3c3c3c;
  position: relative;
  line-height: 1.8;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  font-family: 'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace;
}

/* 自定义滚动条 */
.article-content pre::-webkit-scrollbar {
  height: 10px;
}

.article-content pre::-webkit-scrollbar-track {
  background: #2d2d2d;
  border-radius: 5px;
}

.article-content pre::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 5px;
}

.article-content pre::-webkit-scrollbar-thumb:hover {
  background: #666;
}

.article-content pre::before {
  content: attr(data-lang);
  position: absolute;
  top: 6px;
  left: 10px;
  background: #2d2d2d;
  color: #b0b0b0;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 4px;
  font-family: 'Fira Code', 'Consolas', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 10;
  pointer-events: none;
  white-space: nowrap;
}

/* 内联代码样式 */
.article-content code {
  font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
  font-size: 0.9rem;
  line-height: 1.6;
  background: #f6f8fa;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  color: #e83e8c;
  border: 1px solid #e1e4e8;
}

.article-content pre code {
  background: transparent !important;
  padding: 0;
  border: none !important;
  color: #d4d4d4 !important;
  display: block;
  line-height: 1.6;
}

/* Highlight.js 深色主题覆盖 */
.article-content pre .hljs {
  background: transparent;
  padding: 0;
  color: #d4d4d4;
}

.article-content pre .hljs-comment,
.article-content pre .hljs-quote {
  color: #6a9955;
  font-style: italic;
}

.article-content pre .hljs-keyword,
.article-content pre .hljs-selector-tag,
.article-content pre .hljs-subst {
  color: #569cd6;
  font-weight: 500;
}

.article-content pre .hljs-number,
.article-content pre .hljs-literal,
.article-content pre .hljs-variable,
.article-content pre .hljs-template-variable {
  color: #b5cea8;
}

.article-content pre .hljs-string,
.article-content pre .hljs-doctag {
  color: #ce9178;
}

.article-content pre .hljs-title,
.article-content pre .hljs-section,
.article-content pre .hljs-type,
.article-content pre .hljs-tag .hljs-name {
  color: #4ec9b0;
}

.article-content pre .hljs-attribute,
.article-content pre .hljs-name {
  color: #9cdcfe;
}

.article-content pre .hljs-built_in,
.article-content pre .hljs-bullet,
.article-content pre .hljs-code {
  color: #dcdcaa;
}

.article-content pre .hljs-regexp,
.article-content pre .hljs-link {
  color: #d16969;
}

.article-content pre .hljs-symbol,
.article-content pre .hljs-variable,
.article-content pre .hljs-template-variable {
  color: #4fc1ff;
}

.article-content pre .hljs-meta,
.article-content pre .hljs-deletion {
  color: #f44747;
}

.article-content pre .hljs-addition {
  color: #b5cea8;
}

.article-content pre .hljs-function {
  color: #dcdcaa;
  font-weight: 500;
}

.article-content pre .hljs-class {
  color: #4ec9b0;
}

.article-content pre .hljs-constant {
  color: #4fc1ff;
}

.article-content pre .hljs-property {
  color: #9cdcfe;
}

.article-content pre .hljs-operator {
  color: #d4d4d4;
}

/* 表格样式 */
.article-content table {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
}

.article-content thead {
  background: linear-gradient(135deg, #42b883 0%, #35a372 100%);
  color: white;
}

.article-content th {
  padding: 16px 20px;
  text-align: left;
  font-weight: 600;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #35a372;
}

.article-content tbody tr {
  transition: all 0.2s ease;
  border-bottom: 1px solid #f0f0f0;
}

.article-content tbody tr:nth-child(even) {
  background: #f8f9fa;
}

.article-content tbody tr:hover {
  background: rgba(66, 184, 131, 0.08);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(66, 184, 131, 0.1);
}

.article-content td {
  padding: 14px 20px;
  font-size: 0.95rem;
  color: #333;
  line-height: 1.6;
  border: none;
}

.article-content td:first-child {
  font-weight: 500;
  color: #2c3e50;
}

.article-content tfoot {
  background: #f8f9fa;
}

.article-content tfoot td {
  padding: 12px 20px;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
  border-top: 2px solid #e0e0e0;
}

/* 引用块样式 */
.article-content blockquote {
  margin: 1.2rem 0;
  padding: 1.2rem 1.4rem;
  border-left: 4px solid #42b883;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  color: #666;
  font-style: italic;
  border-radius: 0 8px 8px 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.article-content blockquote p {
  margin: 0;
  color: #666;
}

/* 强调文本 */
.article-content strong {
  font-weight: 700;
  color: #2c3e50;
  font-weight: 600;
}

.article-content b {
  font-weight: 700;
  color: #2c3e50;
}

.article-content em {
  font-style: italic;
  color: #555;
}

.article-content i {
  font-style: italic;
  color: #555;
}

/* 链接样式 */
.article-content a {
  color: #42b883;
  text-decoration: none;
  transition: all 0.2s;
  border-bottom: 1px solid transparent;
  padding-bottom: 2px;
}

.article-content a:hover {
  color: #35a372;
  border-bottom-color: #42b883;
  text-decoration: none;
}

.article-content a:active {
  color: #35a372;
}

/* 分隔线样式 */
.article-content hr {
  border: none;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #42b883 50%, transparent 100%);
  margin: 2rem 0;
  opacity: 0.6;
}

/* 图片样式 */
.article-content img,
.article-content svg {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  margin: 1.5rem 0;
  display: block;
  cursor: pointer;
  transition: all 0.3s;
}

/* SVG 特殊样式 - 确保显示完整 */
.article-content svg {
  max-width: 100%;
  width: auto !important;
  height: auto !important;
  min-height: 40px;
  overflow: visible !important;
}

.article-content img:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
}

/* SVG hover 效果 */
.article-content svg:hover {
  transform: scale(1.01);
}

/* 删除线 */
.article-content del,
.article-content s,
.article-content strike {
  text-decoration: line-through;
  color: #999;
}

/* 上标和下标 */
.article-content sup {
  font-size: 0.75em;
  vertical-align: super;
  color: #666;
}

.article-content sub {
  font-size: 0.75em;
  vertical-align: sub;
  color: #666;
}

/* 键盘快捷键样式 */
.article-content kbd {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 3px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.125);
  color: #24292e;
  display: inline-block;
  font-size: 0.85em;
  font-weight: 700;
  line-height: 1;
  padding: 2px 4px;
  white-space: nowrap;
}

/* 复制按钮样式 */
.article-content pre .copy-btn {
  position: absolute !important;
  top: 15px !important;
  right: 15px !important;
  padding: 6px 12px !important;
  background: #42b883 !important;
  color: #fff !important;
  border: none !important;
  border-radius: 6px !important;
  font-size: 0.75rem !important;
  cursor: pointer !important;
  transition: all 0.2s !important;
  font-family: 'Fira Code', 'Consolas', monospace !important;
  z-index: 100 !important;
  font-weight: 500 !important;
  box-shadow: 0 2px 8px rgba(66, 184, 131, 0.4) !important;
  display: inline-block !important;
  opacity: 1 !important;
  visibility: visible !important;
  max-width: none !important;
  white-space: nowrap !important;
  height: auto !important;
  line-height: 1.2 !important;
}

.article-content .copy-btn:hover {
  background: #35a372 !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.5) !important;
}

.article-content .copy-btn:active {
  transform: scale(0.95) !important;
}

/* ============================================================================
   响应式设计 - 平板设备
   ============================================================================ */
@media (max-width: 1024px) {
  .article-content h1 {
    font-size: 1.6rem;
  }

  .article-content h2 {
    font-size: 1.4rem;
  }

  .article-content h3 {
    font-size: 1.2rem;
  }

  .article-content table th,
  .article-content table td {
    padding: 12px 15px;
  }
}

/* ============================================================================
   响应式设计 - 手机设备
   ============================================================================ */
@media (max-width: 768px) {
  .article-content {
    font-size: 0.95rem;
    padding: 5px 8px;
    line-height: 1.7;
  }

  .article-content h1 {
    font-size: 1.4rem;
    margin-top: 1.5rem;
    margin-bottom: 1rem;
    color: #2c3e50;
  }

  .article-content h2 {
    font-size: 1.25rem;
    margin-top: 1.3rem;
    margin-bottom: 0.9rem;
    padding-left: 0.6rem;
    border-left-width: 3px;
    color: #2c3e50;
  }

  .article-content h3 {
    font-size: 1.15rem;
    margin-top: 1.2rem;
    margin-bottom: 0.7rem;
    color: #34495e;
  }

  .article-content h4 {
    font-size: 1.05rem;
    color: #34495e;
  }

  .article-content p {
    margin-bottom: 1rem;
    color: #555;
  }

  .article-content ul,
  .article-content ol {
    padding-left: 1.5rem;
  }

  .article-content li {
    margin-bottom: 0.6rem;
    color: #555;
  }

  /* 移动端代码块 - 浅色主题 */
  .article-content pre {
    padding: 2.5rem 1rem 1rem 1rem;
    font-size: 0.85rem;
    overflow-x: auto;
    overflow-y: visible;
    margin: 1.5rem 5px 1rem 5px;
    background: #f8f9fa !important;
    border: 1px solid #e1e4e8 !important;
    box-shadow: none;
    border-radius: 10px;
    box-sizing: border-box;
    width: calc(100% - 10px);
    position: relative !important;
  }

  .article-content pre::before {
    background: #e1e4e8;
    color: #586069;
    left: 8px;
    font-size: 0.7rem;
    padding: 4px 8px;
    pointer-events: none;
    white-space: nowrap;
  }

  .article-content pre code {
    color: #24292e !important;
  }

  /* 移动端浅色主题 - 代码高亮 */
  .article-content pre .hljs {
    color: #24292e;
  }

  /* 移动端SVG样式 - 确保K线图完整显示 */
  .article-content svg {
    max-width: 100%;
    height: auto;
    overflow: visible;
  }

  .article-content pre .hljs-comment,
  .article-content pre .hljs-quote {
    color: #6a737d;
  }

  .article-content pre .hljs-keyword,
  .article-content pre .hljs-selector-tag,
  .article-content pre .hljs-subst {
    color: #d73a49;
  }

  .article-content pre .hljs-number,
  .article-content pre .hljs-literal,
  .article-content pre .hljs-variable,
  .article-content pre .hljs-template-variable {
    color: #005cc5;
  }

  .article-content pre .hljs-string,
  .article-content pre .hljs-doctag {
    color: #032f62;
  }

  .article-content pre .hljs-title,
  .article-content pre .hljs-section,
  .article-content pre .hljs-type,
  .article-content pre .hljs-tag .hljs-name {
    color: #6f42c1;
  }

  .article-content pre .hljs-attribute,
  .article-content pre .hljs-name {
    color: #6f42c1;
  }

  .article-content pre .hljs-built_in,
  .article-content pre .hljs-bullet,
  .article-content pre .hljs-code {
    color: #e36209;
  }

  .article-content pre .hljs-class {
    color: #6f42c1;
  }

  .article-content pre .hljs-constant {
    color: #005cc5;
  }

  .article-content pre .hljs-property {
    color: #6f42c1;
  }

  .article-content pre .hljs-function {
    color: #6f42c1;
  }

  .article-content code {
    font-size: 0.85rem;
  }

  /* 移动端表格 */
  .article-content table {
    font-size: 0.85rem;
    margin: 1rem 0;
    border-radius: 6px;
  }

  .article-content th {
    padding: 10px 12px;
    font-size: 0.85rem;
  }

  .article-content td {
    padding: 10px 12px;
    font-size: 0.85rem;
  }

  .article-content blockquote {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
    margin: 0.8rem 0;
  }

  /* 移动端图片 */
  .article-content img {
    border-radius: 6px;
    margin: 1rem 0;
  }

  /* 移动端复制按钮 */
  .article-content pre {
    position: relative !important;
    overflow-y: visible !important;
  }

  .article-content pre .copy-btn {
    position: absolute !important;
    padding: 5px 10px !important;
    font-size: 0.75rem !important;
    top: 15px !important;
    right: 15px !important;
    background: #42b883 !important;
    color: #fff !important;
    border: none !important;
    border-radius: 4px !important;
    box-shadow: 0 2px 6px rgba(66, 184, 131, 0.3) !important;
    z-index: 100 !important;
    display: inline-block !important;
  }
}

/* ============================================================================
   响应式设计 - 小屏手机
   ============================================================================ */
@media (max-width: 480px) {
  .article-content h1 {
    font-size: 1.3rem;
  }

  .article-content h2 {
    font-size: 1.15rem;
  }

  .article-content h3 {
    font-size: 1rem;
  }

  .article-content pre {
    padding: 2.5rem 0.8rem 0.8rem 0.8rem;
    font-size: 0.8rem;
  }

  .article-content table {
    font-size: 0.8rem;
  }

  .article-content th,
  .article-content td {
    padding: 8px 10px;
  }
}
</style>
