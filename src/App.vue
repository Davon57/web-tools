<script setup>
// 使用Vue Router进行页面路由管理
</script>

<template>
  <div id="app">
    <router-view />
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

/* PC端大屏幕优化 */
@media (min-width: 1600px) {
  .header-content {
    max-width: 1800px;
    padding: 0 60px;
  }
  
  .home-page {
    max-width: 1800px;
    padding: 60px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
  }
  
  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 30px;
  }
}

/* 中等屏幕优化 */
@media (min-width: 1200px) and (max-width: 1599px) {
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
  
  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

/* 平板端适配 */
@media (min-width: 769px) and (max-width: 1199px) {
  .header-content {
    padding: 0 30px;
  }
  
  .home-page {
    padding: 30px;
  }
  
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
  }
  
  .tools-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 20px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
    gap: 15px;
  }
  
  .categories-grid {
    grid-template-columns: 1fr;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .home-page, .category-page {
    padding: 20px;
  }
  
  .hero-section {
    padding: 20px 0;
    margin-bottom: 30px;
  }
  
  .hero-title {
    font-size: 26px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  

  
  /* 移动端紧凑工具箱样式 */
  .compact-toolbox {
    position: static;
    margin: 20px 0;
    display: flex;
    justify-content: center;
  }
  
  .toolbox-toggle-btn {
    min-width: 140px;
    font-size: 16px;
    padding: 14px 24px;
  }
  
  .toolbox-dropdown {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    max-width: 350px;
    max-height: 70vh;
  }
  
  .toolbox-section {
    margin-bottom: 30px;
  }
  
  .home-page .recent-section,
  .home-page .favorites-section {
    padding: 20px;
    margin-bottom: 20px;
  }
  
  .category-info {
    flex-direction: column;
    text-align: center;
    gap: 15px;
  }
  
  .category-icon-large {
    font-size: 48px;
  }
  
  .category-title {
    font-size: 24px;
  }
  
  .placeholder-icon {
    font-size: 60px;
  }
}
</style>
