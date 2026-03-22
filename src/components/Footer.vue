<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4 class="footer-title">关于我们</h4>
        <p class="footer-text">
          前端技术知识库是一个专注于前端开发技术的学习平台，
          提供系统化的核心知识和技术文章，帮助开发者提升技能。
        </p>
      </div>

      <div class="footer-section">
        <h4 class="footer-title">快速链接</h4>
        <ul class="footer-links">
          <li><router-link to="/">首页</router-link></li>
          <li><router-link to="/about">关于</router-link></li>
          <li><a href="https://github.com" target="_blank">GitHub</a></li>
        </ul>
      </div>

      <div class="footer-section">
        <h4 class="footer-title">技术栈</h4>
        <div class="tech-stack">
          <span class="tech-tag">Vue 3</span>
          <span class="tech-tag">TypeScript</span>
          <span class="tech-tag">Vite</span>
          <span class="tech-tag">Pinia</span>
        </div>
      </div>

      <div class="footer-section">
        <h4 class="footer-title">联系方式</h4>
        <ul class="contact-info">
          <li>📧 contact@example.com</li>
          <li>🌐 www.frontend-blog.com</li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} 前端技术知识库. All rights reserved.</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
.footer {
  background: #2c3e50;
  color: white;
  margin-top: 40px;
}

.footer-content {
  max-width: 1600px;
  margin: 0 auto;
  padding: 40px 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 40px;
}

.footer-section {
  margin-bottom: 20px;
}

.footer-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 15px;
  color: #42b883;
}

.footer-text {
  color: #bdc3c7;
  line-height: 1.6;
  font-size: 0.95rem;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 10px;
}

.footer-links a {
  color: #bdc3c7;
  text-decoration: none;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #42b883;
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  background: rgba(66, 184, 131, 0.2);
  color: #42b883;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s;
}

.tech-tag:hover {
  background: rgba(66, 184, 131, 0.3);
  transform: translateY(-2px);
}

.contact-info {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contact-info li {
  color: #bdc3c7;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .footer {
    margin-top: 20px;
  }

  .footer-content {
    grid-template-columns: 1fr;
    padding: 20px;
    gap: 15px;
  }

  .footer-title {
    font-size: 1rem;
  }

  .footer-text {
    font-size: 0.9rem;
  }

  /* 手机端只显示主要信息 */
  .footer-section:nth-child(2),
  .footer-section:nth-child(3) {
    display: none;
  }

  .tech-stack {
    justify-content: flex-start;
  }

  .contact-info li {
    font-size: 0.85rem;
  }

  .footer-bottom {
    padding: 15px;
    font-size: 0.85rem;
  }
}
</style>
