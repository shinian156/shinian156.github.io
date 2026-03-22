import { createRouter, createWebHashHistory } from 'vue-router'
import { type RouteRecordRaw } from 'vue-router'

// 定义路由
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页'
    }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/About.vue'),
    meta: {
      title: '关于'
    }
  },
  {
    path: '/article/:id',
    name: 'article',
    component: () => import('../views/Article.vue'),
    meta: {
      title: '文章详情'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 前端技术知识库`
  }

  // 路由切换时滚动到顶部
  window.scrollTo(0, 0)

  next()
})

export default router
