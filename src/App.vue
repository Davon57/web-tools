<script setup>
import { ref } from 'vue'
import { useToolsStore } from '@/stores/counter'
import ImageToBase64 from '@/components/tools/ImageToBase64.vue'
import RegexTester from '@/components/tools/RegexTester.vue'
import JsonFormatter from '@/components/tools/JsonFormatter.vue'
import ColorPicker from '@/components/tools/ColorPicker.vue'

const toolsStore = useToolsStore()
const currentTool = ref('home')

const tools = [
  { id: 'image-base64', name: '图片转Base64', icon: '🖼️', component: ImageToBase64 },
  { id: 'regex-tester', name: '正则表达式', icon: '🔍', component: RegexTester },
  { id: 'json-formatter', name: 'JSON格式化', icon: '📋', component: JsonFormatter },
  { id: 'color-picker', name: '颜色选择器', icon: '🎨', component: ColorPicker }
]

const selectTool = (toolId) => {
  currentTool.value = toolId
}

const goHome = () => {
  currentTool.value = 'home'
}
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title" @click="goHome">🛠️ Web工具箱</h1>
        <div class="header-actions" v-if="currentTool !== 'home'">
          <button @click="goHome" class="back-btn">← 返回首页</button>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <!-- 首页 -->
      <div v-if="currentTool === 'home'" class="home-page">
        <div class="hero-section">
          <h2 class="hero-title">欢迎使用 Web工具箱</h2>
          <p class="hero-subtitle">一站式在线工具集合，提高您的工作效率</p>
        </div>
        
        <div class="tools-grid">
          <div 
            v-for="tool in tools" 
            :key="tool.id"
            @click="selectTool(tool.id)"
            class="tool-card"
          >
            <div class="tool-icon">{{ tool.icon }}</div>
            <h3 class="tool-name">{{ tool.name }}</h3>
            <p class="tool-desc">
              {{ tool.id === 'image-base64' ? '将图片文件转换为Base64编码字符串' : 
                 tool.id === 'regex-tester' ? '测试和验证正则表达式匹配结果' :
                 tool.id === 'json-formatter' ? '格式化、压缩和验证JSON数据' :
                 tool.id === 'color-picker' ? '颜色选择、格式转换和渐变生成工具' : '' }}
            </p>
            <div class="tool-favorite" @click.stop="toolsStore.toggleFavorite(tool.name)">
              {{ toolsStore.isFavorite(tool.name) ? '⭐' : '☆' }}
            </div>
          </div>
        </div>
        
        <!-- 最近使用 -->
        <div v-if="toolsStore.toolHistory.length > 0" class="recent-section">
          <h3>最近使用</h3>
          <div class="recent-list">
            <div 
              v-for="record in toolsStore.toolHistory.slice(0, 5)" 
              :key="record.timestamp"
              class="recent-item"
            >
              <span class="recent-name">{{ record.name }}</span>
              <span class="recent-time">{{ new Date(record.timestamp).toLocaleString() }}</span>
            </div>
          </div>
        </div>
        
        <!-- 收藏工具 -->
        <div v-if="toolsStore.favoriteTools.length > 0" class="favorites-section">
          <h3>收藏工具</h3>
          <div class="favorites-list">
            <button 
              v-for="favTool in toolsStore.favoriteTools" 
              :key="favTool"
              @click="selectTool(tools.find(t => t.name === favTool)?.id)"
              class="favorite-btn"
            >
              ⭐ {{ favTool }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 工具页面 -->
      <component 
        v-else 
        :is="tools.find(t => t.id === currentTool)?.component" 
      />
    </main>
    
    <footer class="app-footer">
      <p>&copy; 2024 Web工具箱 - 让工作更高效</p>
    </footer>
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
  min-height: 100vh;
  display: flex;
  flex-direction: column;
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
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
  background: rgba(255, 255, 255, 0.9);
  margin: 20px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.home-page {
  padding: 40px;
}

.hero-section {
  text-align: center;
  margin-bottom: 50px;
}

.hero-title {
  font-size: 36px;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 700;
}

.hero-subtitle {
  font-size: 18px;
  color: #7f8c8d;
  max-width: 600px;
  margin: 0 auto;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
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

.app-footer {
  background: rgba(255, 255, 255, 0.1);
  text-align: center;
  padding: 20px;
  color: white;
  font-size: 14px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    height: auto;
    padding: 15px 20px;
    gap: 15px;
  }
  
  .nav-menu {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .nav-text {
    display: none;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
  
  .home-page {
    padding: 20px;
  }
  
  .hero-title {
    font-size: 28px;
  }
}
</style>
