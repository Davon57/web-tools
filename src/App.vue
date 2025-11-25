<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 使用Vue Router进行页面路由管理
const isLoading = ref(true)
const router = useRouter()

// 模拟初始加载
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})

// 路由变化时的加载状态
router.beforeEach((to, from, next) => {
  if (from.name) {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
      next()
    }, 300)
  } else {
    next()
  }
})
</script>

<template>
  <div id="app">
    <!-- 全局加载指示器 -->
    <div v-if="isLoading" class="global-loading">
      <div class="loading-content">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>
    </div>
    
    <!-- 页面过渡动画 -->
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- 全局通知容器 -->
    <div class="notification-container" id="notification-container"></div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.app-title {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  cursor: pointer;
  transition: color 0.3s ease;
}

.app-title:hover {
  color: #3498db;
}

.header-actions {
  display: flex;
  align-items: center;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid #3498db;
  background: transparent;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #3498db;
  font-weight: 500;
  font-size: 14px;
}

.back-btn:hover {
  background: #3498db;
  color: white;
}

.app-main {
  flex: 1;
  padding: 20px;
  height: calc(100vh - 110px); /* 减去header高度 */
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.home-page {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.hero-section {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px 0;
}

.hero-title {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 12px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
}



/* 紧凑工具箱样式 */
.compact-toolbox {
  position: fixed;
  top: 100px;
  right: 30px;
  z-index: 1000;
}

.toolbox-toggle-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
  min-width: 120px;
  justify-content: space-between;
}

.toolbox-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
}

.toolbox-toggle-btn.active {
  background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
}

.dropdown-arrow {
  transition: transform 0.3s ease;
  font-size: 12px;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.toolbox-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
}

.dropdown-header {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #f8f9fa;
  border-radius: 15px 15px 0 0;
}

.dropdown-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 16px;
  font-weight: 600;
}

.category-list {
  padding: 10px 0;
}

.category-dropdown-item {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.category-dropdown-item:hover {
  background-color: #f8f9fa;
}

.category-header-compact {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  gap: 10px;
}

.category-header-compact .category-icon {
  font-size: 18px;
}

.category-header-compact .category-name {
  flex: 1;
  font-weight: 500;
  color: #2c3e50;
}

.category-header-compact .tool-count {
  font-size: 12px;
  color: #7f8c8d;
}

.category-header-compact .expand-icon {
  font-size: 10px;
  color: #bdc3c7;
  transition: transform 0.3s ease;
}

.category-header-compact .expand-icon.rotated {
  transform: rotate(180deg);
}

.tools-dropdown-list {
  background: #f8f9fa;
  border-top: 1px solid #ecf0f1;
}

.tool-dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 40px;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-dropdown-item:hover {
  background-color: #e9ecef;
  padding-left: 45px;
}

.tool-dropdown-item.tool-unavailable {
  opacity: 0.6;
  cursor: not-allowed;
}

.tool-dropdown-item .tool-icon {
  font-size: 14px;
}

.tool-dropdown-item .tool-name {
  flex: 1;
  font-size: 13px;
  color: #2c3e50;
}

.tool-dropdown-item .coming-soon {
  font-size: 10px;
  color: #e74c3c;
  background: #ffeaa7;
  padding: 2px 6px;
  border-radius: 8px;
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.toolbox-section {
  margin-bottom: 50px;
}

/* 首页布局优化 */
.home-page .recent-section,
.home-page .favorites-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.home-page .recent-section h3,
.home-page .favorites-section h3 {
  color: #2c3e50;
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-page .recent-section h3::before {
  content: '🕒';
  font-size: 20px;
}

.home-page .favorites-section h3::before {
  content: '⭐';
  font-size: 20px;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.category-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
  text-align: center;
}

.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.category-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.category-name {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 600;
}

.category-desc {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 15px;
}

.category-count {
  color: #95a5a6;
  font-size: 14px;
  font-weight: 500;
}

.tool-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-color: #3498db;
}

.tool-card.tool-unavailable {
  opacity: 0.6;
  cursor: not-allowed;
}

.tool-card.tool-unavailable:hover {
  transform: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-color: transparent;
}

.tool-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 20px;
}

.tool-name {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
  font-weight: 600;
}

.tool-desc {
  color: #7f8c8d;
  text-align: center;
  line-height: 1.6;
}

.tool-status {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #f39c12;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.tool-favorite {
  position: absolute;
  top: 15px;
  right: 15px;
  font-size: 20px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.tool-favorite:hover {
  transform: scale(1.2);
}

.recent-section, .favorites-section {
  margin-top: 40px;
}

.recent-section h3, .favorites-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 20px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recent-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.recent-name {
  font-weight: 500;
  color: #2c3e50;
}

.recent-time {
  font-size: 12px;
  color: #95a5a6;
}

.favorites-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.favorite-btn {
  padding: 8px 16px;
  background: #f39c12;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  background: #e67e22;
  transform: translateY(-2px);
}

.category-page {
  padding: 40px;
}

.category-header {
  margin-bottom: 40px;
}

.category-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.category-icon-large {
  font-size: 64px;
}

.category-title {
  font-size: 32px;
  color: #2c3e50;
  margin-bottom: 8px;
  font-weight: 700;
}

.category-description {
  font-size: 16px;
  color: #7f8c8d;
  line-height: 1.6;
}

.tool-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px;
}

.placeholder-content {
  text-align: center;
  max-width: 400px;
}

.placeholder-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.placeholder-content h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 10px;
}

.placeholder-content p {
  color: #7f8c8d;
  margin-bottom: 30px;
  line-height: 1.6;
}

.back-btn-large {
  padding: 12px 24px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-btn-large:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.app-footer {
  background: rgba(255, 255, 255, 0.1);
  text-align: center;
  padding: 20px;
  color: white;
  font-size: 14px;
}

/* 超大屏幕优化 (1536px+) */
@media (min-width: 1536px) {
  .header-content {
    max-width: 1800px;
    padding: 0 60px;
    height: 80px;
  }
  
  .app-title {
    font-size: 28px;
  }
  
  .home-page {
    max-width: 1800px;
    padding: 60px;
  }
  
  .hero-title {
    font-size: 42px;
  }
  
  .hero-subtitle {
    font-size: 20px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
    gap: 40px;
  }
  
  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 35px;
  }
  
  .toolbox-dropdown {
    min-width: 350px;
    max-width: 450px;
  }
}

/* 大屏幕优化 (1280px - 1535px) */
@media (min-width: 1280px) and (max-width: 1535px) {
  .header-content {
    max-width: 1600px;
    padding: 0 50px;
    height: 75px;
  }
  
  .app-title {
    font-size: 26px;
  }
  
  .home-page {
    max-width: 1600px;
    padding: 50px;
  }
  
  .hero-title {
    font-size: 38px;
  }
  
  .hero-subtitle {
    font-size: 19px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 35px;
  }
  
  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 30px;
  }
}

/* 桌面端优化 (1024px - 1279px) */
@media (min-width: 1024px) and (max-width: 1279px) {
  .header-content {
    max-width: 1400px;
    padding: 0 40px;
  }
  
  .home-page {
    max-width: 1400px;
    padding: 40px;
  }
  
  .hero-title {
    font-size: 36px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 30px;
  }
  
  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 25px;
  }
}

/* 平板端优化 (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .header-content {
    padding: 0 30px;
    height: 65px;
  }
  
  .app-title {
    font-size: 22px;
  }
  
  .home-page {
    padding: 30px;
  }
  
  .hero-title {
    font-size: 30px;
  }
  
  .hero-subtitle {
    font-size: 17px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 25px;
  }
  
  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }
  
  .compact-toolbox {
    top: 80px;
    right: 20px;
  }
  
  .toolbox-dropdown {
    min-width: 280px;
    max-width: 350px;
  }
}

/* 移动端优化 (481px - 767px) */
@media (min-width: 481px) and (max-width: 767px) {
  .header-content {
    flex-direction: row;
    height: 60px;
    padding: 0 25px;
    gap: 10px;
  }
  
  .app-title {
    font-size: 20px;
  }
  
  .back-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .home-page, .category-page {
    padding: 25px;
  }
  
  .hero-section {
    padding: 25px 0;
    margin-bottom: 25px;
  }
  
  .hero-title {
    font-size: 28px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .tools-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
  }
  
  .compact-toolbox {
    top: 70px;
    right: 15px;
  }
  
  .toolbox-toggle-btn {
    min-width: 130px;
    font-size: 14px;
    padding: 12px 20px;
  }
  
  .toolbox-dropdown {
    min-width: 280px;
    max-width: 320px;
    max-height: 60vh;
  }
  
  .category-info {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .category-icon-large {
    font-size: 45px;
  }
  
  .category-title {
    font-size: 22px;
  }
}

/* 小屏移动端优化 (max-width: 480px) */
@media (max-width: 480px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 12px 15px;
    gap: 12px;
  }
  
  .app-title {
    font-size: 18px;
  }
  
  .back-btn {
    padding: 8px 14px;
    font-size: 12px;
    align-self: center;
  }
  
  .app-main {
    padding: 15px;
    height: calc(100vh - 120px);
  }
  
  .home-page, .category-page {
    padding: 15px;
  }
  
  .hero-section {
    padding: 15px 0;
    margin-bottom: 20px;
  }
  
  .hero-title {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  .hero-subtitle {
    font-size: 14px;
    line-height: 1.5;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  /* 移动端紧凑工具箱样式 */
  .compact-toolbox {
    position: static;
    margin: 15px 0;
    display: flex;
    justify-content: center;
  }
  
  .toolbox-toggle-btn {
    min-width: 120px;
    font-size: 14px;
    padding: 12px 20px;
  }
  
  .toolbox-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 320px;
    max-height: 70vh;
    border-radius: 12px;
  }
  
  .dropdown-header {
    padding: 12px 15px;
    border-radius: 12px 12px 0 0;
  }
  
  .dropdown-header h4 {
    font-size: 16px;
  }
  
  .toolbox-section {
    margin-bottom: 20px;
  }
  
  .home-page .recent-section,
  .home-page .favorites-section {
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 12px;
  }
  
  .category-info {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .category-icon-large {
    font-size: 40px;
  }
  
  .category-title {
    font-size: 20px;
  }
  
  .category-description {
    font-size: 13px;
    line-height: 1.4;
  }
  
  .placeholder-icon {
    font-size: 50px;
  }
}

/* 全局加载指示器样式 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #2c3e50;
  font-size: 16px;
  font-weight: 500;
}

/* 页面过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 通知容器样式 */
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  pointer-events: none;
}

/* 超小屏幕优化 (max-width: 360px) */
@media (max-width: 360px) {
  .header-content {
    padding: 10px 12px;
    gap: 10px;
  }
  
  .app-title {
    font-size: 16px;
  }
  
  .back-btn {
    padding: 6px 12px;
    font-size: 11px;
  }
  
  .app-main {
    padding: 12px;
  }
  
  .home-page, .category-page {
    padding: 12px;
  }
  
  .hero-title {
    font-size: 20px;
  }
  
  .hero-subtitle {
    font-size: 13px;
  }
  
  .toolbox-dropdown {
    width: 95vw;
    max-width: 280px;
  }
  
  .category-icon-large {
    font-size: 35px;
  }
  
  .category-title {
    font-size: 18px;
  }
  
  .placeholder-icon {
    font-size: 45px;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
  }
  
  .loading-text {
    font-size: 14px;
  }
  
  .notification-container {
    top: 10px;
    right: 10px;
  }
}
</style>
