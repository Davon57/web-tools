<template>
  <div class="whiteboard-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-actions">
        <button @click="goHome" class="home-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <span>返回主页</span>
        </button>
        
        <button @click="clearCanvas" class="action-button" :disabled="isLoading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
          </svg>
          <span>清空画布</span>
        </button>
        
        <button @click="exportImage" class="action-button" :disabled="isLoading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>导出图片</span>
        </button>
      </div>
      
      <div class="toolbar-title">
        <h1>智能白板</h1>
        <p class="subtitle">基于 Excalidraw 的现代化绘图工具</p>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-container">
      <div class="excalidraw-wrapper">
        <!-- 加载状态指示器 -->
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-content">
            <div class="loading-spinner">
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
            </div>
            <h3 class="loading-title">正在加载智能白板</h3>
            <div class="loading-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
              </div>
              <p class="progress-text">{{ loadingProgress }}%</p>
            </div>
            <p class="loading-description">
              {{ getLoadingMessage() }}
            </p>
            <div class="loading-tips">
              <p>💡 提示：首次加载可能需要较长时间，请耐心等待</p>
            </div>
          </div>
        </div>

        <!-- 错误状态 -->
        <div v-if="loadingError && !isLoading" class="error-overlay">
          <div class="error-content">
            <div class="error-icon">⚠️</div>
            <h3>白板加载失败</h3>
            <p class="error-message">{{ loadingError }}</p>
            <div class="error-actions">
              <button @click="retryInit" class="retry-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23,4 23,10 17,10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                重试加载
              </button>
              <button @click="goHome" class="home-button-error">返回主页</button>
            </div>
            <details class="error-details">
              <summary>技术详情</summary>
              <pre>{{ errorDetails }}</pre>
            </details>
          </div>
        </div>
        
        <div ref="excalidrawContainer" class="excalidraw-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const excalidrawContainer = ref(null)
let excalidrawAPI = null
let reactRoot = null

// 加载状态管理
const isLoading = ref(true)
const loadingError = ref(null)
const loadingProgress = ref(0)
const retryCount = ref(0)
const maxRetries = 2
const errorDetails = ref('')

// 获取加载消息
const getLoadingMessage = () => {
  if (loadingProgress.value < 10) return '正在检查网络连接...'
  if (loadingProgress.value < 30) return '正在加载 React 框架...'
  if (loadingProgress.value < 50) return '正在加载 ReactDOM...'
  if (loadingProgress.value < 70) return '正在加载 Excalidraw 核心库...'
  if (loadingProgress.value < 85) return '正在加载样式文件...'
  if (loadingProgress.value < 100) return '正在初始化编辑器...'
  return '加载完成！'
}

// 导航方法
const goHome = () => {
  router.push('/')
}

// 清空画布
const clearCanvas = () => {
  if (excalidrawAPI) {
    try {
      // 使用 Excalidraw API 清空画布
      excalidrawAPI.updateScene({
        elements: [],
        appState: {
          ...excalidrawAPI.getAppState(),
        }
      })
      ElMessage.success('画布已清空')
    } catch (error) {
      console.warn('清空画布失败:', error)
      ElMessage.error('清空画布失败')
    }
  }
}

// 导出图片
const exportImage = async () => {
  try {
    if (!excalidrawAPI) {
      console.error('Excalidraw API not initialized')
      ElMessage.error('白板未初始化，无法导出图片')
      return
    }

    const elements = excalidrawAPI.getSceneElements()
    if (elements.length === 0) {
      ElMessage.warning('画布为空，请先绘制一些内容再导出')
      return
    }

    console.log('开始导出图片...')
    
    // 动态导入 Excalidraw 的导出函数
    const { exportToBlob } = await import('@excalidraw/excalidraw')
    
    // 导出为 PNG 格式
    const blob = await exportToBlob({
      elements: elements,
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
      mimeType: 'image/png',
      quality: 1,
      exportPadding: 20
    })

    if (!blob) {
      throw new Error('导出失败：无法生成图片')
    }

    // 创建下载链接
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `whiteboard-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`
    
    // 触发下载
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 清理URL对象
    URL.revokeObjectURL(url)
    
    console.log('图片导出成功')
    ElMessage.success('图片导出成功！')
    
  } catch (error) {
    console.error('导出图片失败:', error)
    ElMessage.error(`导出图片失败: ${error.message}`)
  }
}

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 简化的网络状态检查（仅检查浏览器在线状态）
const checkNetworkStatus = () => {
  return { 
    isOnline: navigator.onLine, 
    online: navigator.onLine, // 保持兼容性
    message: navigator.onLine ? '浏览器在线' : '浏览器离线' 
  }
}

// 简化的动态导入（减少重试复杂度）
const importWithRetry = async (moduleName, importFn, maxRetries = 2) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`正在导入 ${moduleName}...`)
      const module = await importFn()
      console.log(`成功导入 ${moduleName}`)
      return module
    } catch (error) {
      console.warn(`导入 ${moduleName} 失败 (第 ${i + 1} 次):`, error)
      if (i === maxRetries - 1) {
        throw new Error(`导入 ${moduleName} 失败: ${error.message}`)
      }
      await delay(500) // 减少延迟时间
    }
  }
}

// 重试初始化
const retryInit = () => {
  loadingError.value = null
  errorDetails.value = ''
  retryCount.value = 0
  initExcalidraw()
}

// 初始化 Excalidraw
const initExcalidraw = async () => {
  try {
    isLoading.value = true
    loadingError.value = null
    loadingProgress.value = 0
    
    console.log('开始初始化 Excalidraw...')
    
    // 检查网络状态
    const networkStatus = checkNetworkStatus()
    console.log('网络状态:', networkStatus.message)
    
    if (!networkStatus.isOnline) {
      throw new Error('网络连接不可用，请检查网络设置')
    }
    
    loadingProgress.value = 10
    
    // 等待容器元素准备就绪
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // 验证容器元素
    if (!excalidrawContainer.value) {
      throw new Error('白板容器元素未找到')
    }
    
    // 清空容器内容
    excalidrawContainer.value.innerHTML = ''
    
    // 分步骤加载依赖
    console.log('正在加载 React...')
    const React = await importWithRetry('React', () => import('react'), maxRetries)
    loadingProgress.value = 30
    
    console.log('正在加载 ReactDOM...')
    const ReactDOM = await importWithRetry('ReactDOM', () => import('react-dom/client'), maxRetries)
    loadingProgress.value = 50
    
    console.log('正在加载 Excalidraw...')
    const { Excalidraw } = await importWithRetry('Excalidraw', () => import('@excalidraw/excalidraw'), maxRetries)
    loadingProgress.value = 70
    
    console.log('正在创建 Excalidraw 组件...')
    
    // 设置初始状态
    const initialData = {
      elements: [],
      appState: {
        viewBackgroundColor: '#ffffff',
        currentItemFontFamily: 1,
        currentItemFontSize: 20,
        currentItemStrokeColor: '#1e1e1e',
        currentItemBackgroundColor: 'transparent',
        currentItemFillStyle: 'hachure',
        currentItemStrokeWidth: 1,
        currentItemStrokeStyle: 'solid',
        currentItemRoughness: 1,
        currentItemOpacity: 100,
        gridSize: null,
        colorPalette: {},
        zenModeEnabled: false,
        gridModeEnabled: false
      }
    }
    
    // 创建 Excalidraw 组件
    const ExcalidrawComponent = React.createElement(Excalidraw, {
      initialData,
      excalidrawAPI: (api) => {
        excalidrawAPI = api
        console.log('Excalidraw API 已成功初始化')
        
        // 延迟设置加载完成状态，确保组件完全渲染
        setTimeout(() => {
          loadingProgress.value = 100
          isLoading.value = false
          ElMessage.success('白板加载成功！')
        }, 500)
      },
      isCollaborating: false,
      langCode: 'zh-CN',
      renderTopRightUI: () => null,
      theme: 'light',
      UIOptions: {
        canvasActions: {
          loadScene: false,
          saveToActiveFile: false,
          export: false,
          toggleTheme: false
        }
      }
    })
    
    loadingProgress.value = 85
    
    // 创建 React 根节点并渲染
    if (reactRoot) {
      reactRoot.unmount()
    }
    
    reactRoot = ReactDOM.createRoot(excalidrawContainer.value)
    reactRoot.render(ExcalidrawComponent)
    
    console.log('Excalidraw 初始化完成')
    
  } catch (error) {
    console.error('初始化 Excalidraw 失败:', error)
    isLoading.value = false
    loadingError.value = error.message
    retryCount.value++
    
    // 收集详细的错误信息
    const details = {
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      retryCount: retryCount.value,
      networkOnline: navigator.onLine,
      location: window.location.href,
      containerExists: !!excalidrawContainer.value,
      containerDimensions: excalidrawContainer.value ? {
        width: excalidrawContainer.value.offsetWidth,
        height: excalidrawContainer.value.offsetHeight
      } : null
    }
    
    errorDetails.value = JSON.stringify(details, null, 2)
    console.error('详细错误信息:', details)
  }
}

// 组件生命周期
onMounted(() => {
  console.log('Whiteboard 组件已挂载，开始初始化...')
  initExcalidraw()
  
  // 监听网络状态变化
  window.addEventListener('online', () => {
    console.log('网络已连接')
    if (loadingError.value) {
      retryInit()
    }
  })
  
  window.addEventListener('offline', () => {
    console.log('网络已断开')
  })
})

onUnmounted(() => {
  console.log('Whiteboard 组件即将卸载，清理资源...')
  
  // 清理 React 根节点
  if (reactRoot) {
    try {
      reactRoot.unmount()
      reactRoot = null
    } catch (error) {
      console.warn('清理 React 根节点失败:', error)
    }
  }
  
  // 清理 API 引用
  excalidrawAPI = null
  
  // 移除事件监听器
  window.removeEventListener('online', retryInit)
  window.removeEventListener('offline', () => {})
})
</script>

<style scoped>
.whiteboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  position: relative;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.toolbar-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.home-button, .action-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.home-button:hover, .action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.6);
}

.home-button:active, .action-button:active {
  transform: translateY(0);
}

.home-button:disabled, .action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.toolbar-title {
  text-align: center;
  margin: 0 20px;
}

.toolbar-title h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: #666;
  font-weight: 400;
}

.canvas-container {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: stretch; /* 改为 stretch 以确保子元素填满高度 */
  min-height: 0; /* 确保 flex 子元素可以缩小 */
}

.excalidraw-wrapper {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  display: flex; /* 添加 flex 布局 */
  flex-direction: column; /* 垂直方向布局 */
  min-height: 500px; /* 设置最小高度 */
}

.excalidraw-container {
  width: 100%;
  height: 100%;
  flex: 1; /* 添加 flex: 1 确保填满父容器 */
  position: relative;
  /* 确保 Excalidraw 内部样式不被覆盖 */
  box-sizing: content-box;
}

/* 重置 Excalidraw 内部元素的样式 */
.excalidraw-container * {
  box-sizing: border-box;
}

/* 确保 Excalidraw 画布正确显示 */
.excalidraw-container .excalidraw {
  width: 100% !important;
  height: 100% !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
}

/* 修复 Excalidraw 工具栏样式 */
.excalidraw-container .excalidraw .App-toolbar {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
  margin: 10px !important;
}

/* 修复 Excalidraw 侧边栏样式 */
.excalidraw-container .excalidraw .App-menu {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}

/* 加载状态指示器样式 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  max-width: 400px;
  padding: 40px;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
}

.spinner-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.spinner-ring:nth-child(2) {
  width: 60px;
  height: 60px;
  top: 10px;
  left: 10px;
  border-top-color: #764ba2;
  animation-duration: 1s;
  animation-direction: reverse;
}

.spinner-ring:nth-child(3) {
  width: 40px;
  height: 40px;
  top: 20px;
  left: 20px;
  border-top-color: #667eea;
  animation-duration: 0.8s;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-title {
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.loading-progress {
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.loading-description {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #666;
  line-height: 1.5;
}

.loading-tips {
  padding: 16px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.loading-tips p {
  margin: 0;
  font-size: 14px;
  color: #555;
  line-height: 1.4;
}

/* 错误状态样式 */
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.error-content {
  text-align: center;
  max-width: 500px;
  padding: 40px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-content h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 24px;
}

.error-message {
  margin: 0 0 24px 0;
  color: #666;
  line-height: 1.5;
  font-size: 16px;
}

.error-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.retry-button, .home-button-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.home-button-error {
  background: #f5f5f5;
  color: #666;
}

.retry-button:hover, .home-button-error:hover {
  transform: translateY(-1px);
}

.error-details {
  text-align: left;
  margin-top: 20px;
}

.error-details summary {
  cursor: pointer;
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.error-details pre {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #333;
  overflow: auto;
  max-height: 200px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    padding: 16px 20px;
    gap: 16px;
  }
  
  .toolbar-title {
    margin: 0 16px;
  }
  
  .toolbar-title h1 {
    font-size: 24px;
  }
  
  .subtitle {
    font-size: 12px;
  }
  
  .home-button, .action-button {
    padding: 10px 16px;
  }
  
  .canvas-container {
    padding: 16px;
  }
  
  .excalidraw-wrapper {
    border-radius: 12px;
  }
}

@media (max-width: 480px) {
  .whiteboard-container {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }
  
  .toolbar {
    padding: 12px 16px;
  }
  
  .toolbar-actions {
    gap: 8px;
  }
  
  .action-button span, .home-button span {
    display: none;
  }
  
  .home-button, .action-button {
    padding: 10px;
    min-width: 44px;
    justify-content: center;
  }
  
  .canvas-container {
    padding: 12px;
  }
  
  .excalidraw-wrapper {
    border-radius: 8px;
  }
}
</style>