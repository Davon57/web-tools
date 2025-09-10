<script setup>
import { ref } from 'vue'
import { useToolsStore } from '@/stores/counter'
import ImageToBase64 from '@/components/tools/ImageToBase64.vue'
import RegexTester from '@/components/tools/RegexTester.vue'
import JsonFormatter from '@/components/tools/JsonFormatter.vue'
import ColorPicker from '@/components/tools/ColorPicker.vue'

const toolsStore = useToolsStore()
const currentView = ref('home') // home, category, tool
const currentCategory = ref('')
const currentTool = ref('')

// 工具分类数据
const categories = [
  {
    id: 'web-tools',
    name: 'Web工具箱',
    icon: '🛠️',
    description: '开发者必备的Web开发工具集合',
    color: '#3498db',
    tools: [
      { id: 'image-base64', name: '图片转Base64', icon: '🖼️', component: ImageToBase64, desc: '将图片文件转换为Base64编码字符串' },
      { id: 'regex-tester', name: '正则表达式', icon: '🔍', component: RegexTester, desc: '测试和验证正则表达式匹配结果' },
      { id: 'json-formatter', name: 'JSON格式化', icon: '📋', component: JsonFormatter, desc: '格式化、压缩和验证JSON数据' },
      { id: 'color-picker', name: '颜色选择器', icon: '🎨', component: ColorPicker, desc: '颜色选择、格式转换和渐变生成工具' }
    ]
  },
  {
    id: 'life-tools',
    name: '生活工具箱',
    icon: '🏠',
    description: '日常生活中实用的小工具',
    color: '#e74c3c',
    tools: [
      { id: 'calculator', name: '计算器', icon: '🧮', desc: '基础数学计算工具' },
      { id: 'unit-converter', name: '单位转换', icon: '📏', desc: '长度、重量、温度等单位转换' },
      { id: 'qr-generator', name: '二维码生成', icon: '📱', desc: '生成各种类型的二维码' },
      { id: 'password-generator', name: '密码生成器', icon: '🔐', desc: '生成安全的随机密码' }
    ]
  },
  {
    id: 'news-tools',
    name: '新闻资讯',
    icon: '📰',
    description: '获取最新资讯和信息',
    color: '#f39c12',
    tools: [
      { id: 'tech-news', name: '科技新闻', icon: '💻', desc: '最新科技资讯和动态' },
      { id: 'weather', name: '天气查询', icon: '🌤️', desc: '实时天气预报和气象信息' },
      { id: 'stock-info', name: '股票信息', icon: '📈', desc: '股票价格和市场行情' },
      { id: 'currency-rate', name: '汇率查询', icon: '💱', desc: '实时汇率转换工具' }
    ]
  },
  {
    id: 'mini-games',
    name: '小游戏',
    icon: '🎮',
    description: '休闲娱乐小游戏合集',
    color: '#9b59b6',
    tools: [
      { id: 'snake-game', name: '贪吃蛇', icon: '🐍', desc: '经典贪吃蛇游戏' },
      { id: 'tetris', name: '俄罗斯方块', icon: '🧩', desc: '经典俄罗斯方块游戏' },
      { id: 'memory-game', name: '记忆游戏', icon: '🧠', desc: '锻炼记忆力的翻牌游戏' },
      { id: 'puzzle-game', name: '拼图游戏', icon: '🖼️', desc: '图片拼图挑战游戏' }
    ]
  }
]

const selectCategory = (categoryId) => {
  currentView.value = 'category'
  currentCategory.value = categoryId
}

const selectTool = (toolId) => {
  const tool = getAllTools().find(t => t.id === toolId)
  if (tool && tool.component) {
    currentView.value = 'tool'
    currentTool.value = toolId
    toolsStore.addToHistory(tool.name)
  }
}

const goHome = () => {
  currentView.value = 'home'
  currentCategory.value = ''
  currentTool.value = ''
}

const goBack = () => {
  if (currentView.value === 'tool') {
    currentView.value = 'category'
    currentTool.value = ''
  } else if (currentView.value === 'category') {
    currentView.value = 'home'
    currentCategory.value = ''
  }
}

const getAllTools = () => {
  return categories.flatMap(cat => cat.tools)
}

const getCurrentCategory = () => {
  return categories.find(cat => cat.id === currentCategory.value)
}

const getCurrentTool = () => {
  return getAllTools().find(tool => tool.id === currentTool.value)
}
</script>

<template>
  <div id="app">
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title" @click="goHome">
          <span v-if="currentView === 'home'">🧰 综合工具箱</span>
          <span v-else-if="currentView === 'category'">{{ getCurrentCategory()?.icon }} {{ getCurrentCategory()?.name }}</span>
          <span v-else>{{ getCurrentTool()?.icon }} {{ getCurrentTool()?.name }}</span>
        </h1>
        <div class="header-actions" v-if="currentView !== 'home'">
          <button @click="goBack" class="back-btn" v-if="currentView === 'category'">← 返回首页</button>
          <button @click="goBack" class="back-btn" v-else-if="currentView === 'tool'">← 返回分类</button>
        </div>
      </div>
    </header>
    
    <main class="app-main">
      <!-- 首页 - 显示分类 -->
      <div v-if="currentView === 'home'" class="home-page">
        <div class="hero-section">
          <h2 class="hero-title">欢迎使用综合工具箱</h2>
          <p class="hero-subtitle">多种分类工具集合，满足您的各种需求</p>
        </div>
        
        <div class="categories-grid">
          <div 
            v-for="category in categories" 
            :key="category.id"
            @click="selectCategory(category.id)"
            class="category-card"
            :style="{ borderColor: category.color }"
          >
            <div class="category-icon" :style="{ color: category.color }">{{ category.icon }}</div>
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-desc">{{ category.description }}</p>
            <div class="category-count">{{ category.tools.length }} 个工具</div>
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
              @click="selectTool(getAllTools().find(t => t.name === record.name)?.id)"
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
              @click="selectTool(getAllTools().find(t => t.name === favTool)?.id)"
              class="favorite-btn"
            >
              ⭐ {{ favTool }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- 分类页面 - 显示该分类下的工具 -->
      <div v-else-if="currentView === 'category'" class="category-page">
        <div class="category-header">
          <div class="category-info">
            <div class="category-icon-large" :style="{ color: getCurrentCategory()?.color }">{{ getCurrentCategory()?.icon }}</div>
            <div>
              <h2 class="category-title">{{ getCurrentCategory()?.name }}</h2>
              <p class="category-description">{{ getCurrentCategory()?.description }}</p>
            </div>
          </div>
        </div>
        
        <div class="tools-grid">
          <div 
            v-for="tool in getCurrentCategory()?.tools" 
            :key="tool.id"
            @click="selectTool(tool.id)"
            class="tool-card"
            :class="{ 'tool-unavailable': !tool.component }"
          >
            <div class="tool-icon">{{ tool.icon }}</div>
            <h3 class="tool-name">{{ tool.name }}</h3>
            <p class="tool-desc">{{ tool.desc }}</p>
            <div class="tool-status" v-if="!tool.component">即将推出</div>
            <div class="tool-favorite" @click.stop="toolsStore.toggleFavorite(tool.name)" v-if="tool.component">
              {{ toolsStore.isFavorite(tool.name) ? '⭐' : '☆' }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 工具页面 -->
      <component 
        v-else-if="currentView === 'tool' && getCurrentTool()?.component" 
        :is="getCurrentTool()?.component" 
      />
      
      <!-- 工具未实现页面 -->
      <div v-else-if="currentView === 'tool'" class="tool-placeholder">
        <div class="placeholder-content">
          <div class="placeholder-icon">🚧</div>
          <h2>功能开发中</h2>
          <p>{{ getCurrentTool()?.name }} 正在开发中，敬请期待！</p>
          <button @click="goBack" class="back-btn-large">返回分类</button>
        </div>
      </div>
    </main>
    
    <footer class="app-footer">
      <p>&copy; 2024 综合工具箱 - 让生活更便捷</p>
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 50px;
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
  
  .hero-title {
    font-size: 28px;
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
