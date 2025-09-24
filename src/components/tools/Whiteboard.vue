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
        <p class="subtitle">基于 tldraw 的现代化绘图工具</p>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-container">
      <div class="tldraw-wrapper">
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
        
        <div ref="tldrawContainer" class="tldraw-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const tldrawContainer = ref(null)
let tldrawEditor = null
let reactRoot = null

// 添加加载状态管理
const isLoading = ref(true)
const loadingError = ref(null)
const loadingProgress = ref(0)
const retryCount = ref(0)
const maxRetries = 3

// 获取加载消息
const getLoadingMessage = () => {
  if (loadingProgress.value < 10) return '正在检查网络连接...'
  if (loadingProgress.value < 30) return '正在加载 React 框架...'
  if (loadingProgress.value < 50) return '正在加载 ReactDOM...'
  if (loadingProgress.value < 70) return '正在加载 tldraw 核心库...'
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
  if (tldrawEditor) {
    try {
      tldrawEditor.selectAll()
      tldrawEditor.deleteShapes(tldrawEditor.getSelectedShapeIds())
    } catch (error) {
      console.warn('清空画布失败:', error)
    }
  }
}

// 导出图片
const exportImage = async () => {
  try {
    if (!tldrawEditor) {
      console.error('tldraw editor not initialized');
      ElMessage.error('白板未初始化，无法导出图片');
      return;
    }

    // 检查画布是否有内容
    const shapeIds = tldrawEditor.getCurrentPageShapeIds();
    if (shapeIds.size === 0) {
      ElMessage.warning('画布为空，请先绘制一些内容再导出');
      return;
    }

    console.log('开始导出图片...');
    
    // 使用正确的 tldraw API 导出图片
    // 将 Set 转换为数组，并正确传递参数
    const { blob } = await tldrawEditor.toImage([...shapeIds], {
      format: 'png',
      background: true,  // 设置为true以获得白色背景
      scale: 2
    });

    if (!blob) {
      throw new Error('导出失败：无法生成图片');
    }

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whiteboard-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL对象
    URL.revokeObjectURL(url);
    
    console.log('图片导出成功');
    ElMessage.success('图片导出成功！');
    
  } catch (error) {
    console.error('导出图片失败:', error);
    ElMessage.error(`导出图片失败: ${error.message}`);
  }
}

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

// 带重试的动态导入
const importWithRetry = async (moduleName, importFn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`尝试导入 ${moduleName} (第 ${i + 1} 次)`)
      const module = await importFn()
      console.log(`成功导入 ${moduleName}`)
      return module
    } catch (error) {
      console.warn(`导入 ${moduleName} 失败 (第 ${i + 1} 次):`, error)
      
      if (i === maxRetries - 1) {
        throw new Error(`导入 ${moduleName} 失败，已重试 ${maxRetries} 次: ${error.message}`)
      }
      
      // 指数退避延迟
      const delayMs = Math.min(1000 * Math.pow(2, i), 5000)
      console.log(`等待 ${delayMs}ms 后重试...`)
      await delay(delayMs)
    }
  }
}

// 检测网络状态
const checkNetworkStatus = () => {
  return new Promise((resolve) => {
    if (!navigator.onLine) {
      resolve({ online: false, message: '网络连接已断开' })
      return
    }
    
    // 尝试加载一个小的资源来测试网络
    const img = new Image()
    const timeout = setTimeout(() => {
      resolve({ online: false, message: '网络连接超时' })
    }, 5000)
    
    img.onload = () => {
      clearTimeout(timeout)
      resolve({ online: true, message: '网络连接正常' })
    }
    
    img.onerror = () => {
      clearTimeout(timeout)
      resolve({ online: false, message: '网络连接不稳定' })
    }
    
    // 使用一个小的图片来测试网络
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
  })
}

// 改进的初始化函数
const initTldraw = async () => {
  try {
    isLoading.value = true
    loadingError.value = null
    loadingProgress.value = 0
    
    console.log('开始初始化 tldraw...')
    
    // 检查网络状态
    const networkStatus = await checkNetworkStatus()
    if (!networkStatus.online) {
      throw new Error(`网络连接问题: ${networkStatus.message}`)
    }
    
    loadingProgress.value = 10
    
    // 分步骤加载依赖，提供更好的进度反馈
    console.log('正在加载 React...')
    const React = await importWithRetry('React', () => import('react'), maxRetries)
    loadingProgress.value = 30
    
    console.log('正在加载 ReactDOM...')
    const ReactDOM = await importWithRetry('ReactDOM', () => import('react-dom/client'), maxRetries)
    loadingProgress.value = 50
    
    console.log('正在加载 tldraw...')
    const { Tldraw } = await importWithRetry('tldraw', () => import('tldraw'), maxRetries)
    loadingProgress.value = 70
    
    console.log('正在加载 tldraw 样式...')
    await importWithRetry('tldraw CSS', () => import('tldraw/tldraw.css'), maxRetries)
    loadingProgress.value = 85
    
    // 验证容器元素
    if (!tldrawContainer.value) {
      throw new Error('白板容器元素未找到')
    }
    
    console.log('正在创建 React 组件...')
    
    // 创建 React 组件
    const TldrawComponent = React.createElement(Tldraw, {
      persistenceKey: 'web-tools-whiteboard',
      onMount: (editor) => {
        tldrawEditor = editor
        console.log('tldraw 编辑器已成功初始化')
        
        // 添加编辑器事件监听
        editor.on('change', () => {
          // 可以在这里添加自动保存逻辑
        })
        
        loadingProgress.value = 100
        isLoading.value = false
        
        ElMessage.success('白板加载成功！')
      },
      autoFocus: true
    })
    
    // 创建 React 根节点并渲染
    reactRoot = ReactDOM.createRoot(tldrawContainer.value)
    reactRoot.render(TldrawComponent)
    
    console.log('tldraw 初始化完成')
    
  } catch (error) {
    console.error('初始化 tldraw 失败:', error)
    isLoading.value = false
    loadingError.value = error.message
    retryCount.value++
    
    // 显示详细的错误信息
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      retryCount: retryCount.value,
      networkOnline: navigator.onLine
    }
    
    console.error('详细错误信息:', errorDetails)
    
    // 显示用户友好的错误界面
    if (tldrawContainer.value) {
      tldrawContainer.value.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 16px; padding: 20px;">
          <div style="text-align: center; max-width: 500px;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h3 style="margin: 0 0 12px 0; color: #333;">白板加载失败</h3>
            <p style="margin: 0 0 16px 0; color: #666; line-height: 1.5;">
              ${error.message}
            </p>
            <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
              <button onclick="window.location.reload()" 
                      style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                刷新页面
              </button>
              ${retryCount.value < maxRetries ? `
                <button onclick="document.dispatchEvent(new CustomEvent('retry-tldraw'))" 
                        style="padding: 10px 20px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                  重试加载 (${retryCount.value}/${maxRetries})
                </button>
              ` : ''}
            </div>
            <details style="margin-top: 16px; text-align: left; font-size: 12px; color: #999;">
              <summary style="cursor: pointer; margin-bottom: 8px;">技术详情</summary>
              <pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow: auto; white-space: pre-wrap;">
网络状态: ${navigator.onLine ? '在线' : '离线'}
重试次数: ${retryCount.value}/${maxRetries}
时间戳: ${new Date().toLocaleString()}
错误: ${error.message}
              </pre>
            </details>
          </div>
        </div>
      `
    }
    
    // 显示错误提示
    ElMessage.error(`白板加载失败: ${error.message}`)
  }
}

// 重试函数
const retryInit = async () => {
  if (retryCount.value >= maxRetries) {
    ElMessage.error('已达到最大重试次数，请刷新页面')
    return
  }
  
  console.log(`开始第 ${retryCount.value + 1} 次重试...`)
  await initTldraw()
}

// 组件挂载
onMounted(() => {
  initTldraw()
  
  // 监听重试事件
  document.addEventListener('retry-tldraw', retryInit)
  
  // 监听网络状态变化
  window.addEventListener('online', () => {
    console.log('网络已连接，尝试重新初始化...')
    if (loadingError.value) {
      retryInit()
    }
  })
  
  window.addEventListener('offline', () => {
    console.log('网络已断开')
    ElMessage.warning('网络连接已断开，白板功能可能受影响')
  })
})

// 组件卸载
onUnmounted(() => {
  if (reactRoot) {
    try {
      reactRoot.unmount()
    } catch (error) {
      console.warn('卸载 React 根节点失败:', error)
    }
    reactRoot = null
  }
  tldrawEditor = null
  
  // 清理事件监听器
  document.removeEventListener('retry-tldraw', retryInit)
  window.removeEventListener('online', retryInit)
  window.removeEventListener('offline', () => {})
})
</script>

<style scoped>
.whiteboard-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
  align-items: center;
}

.tldraw-wrapper {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.tldraw-container {
  width: 100%;
  height: 100%;
}

/* tldraw 样式覆盖 */
:deep(.tl-container) {
  border-radius: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

:deep(.tl-canvas) {
  border-radius: 16px;
}

/* 优化 tldraw 工具栏样式 */
:deep(.tlui-toolbar) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

:deep(.tlui-toolbar__inner) {
  gap: 4px;
  padding: 8px;
}

:deep(.tlui-button) {
  border-radius: 8px;
  transition: all 0.2s ease;
}

:deep(.tlui-button:hover) {
  background: rgba(102, 126, 234, 0.1);
  transform: scale(1.05);
}

:deep(.tlui-button[data-state="selected"]) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

/* 优化菜单样式 */
:deep(.tlui-menu) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

:deep(.tlui-menu-item) {
  border-radius: 8px;
  margin: 2px;
  transition: all 0.2s ease;
}

:deep(.tlui-menu-item:hover) {
  background: rgba(102, 126, 234, 0.1);
}

/* 优化面板样式 */
:deep(.tlui-panel) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

/* 优化输入框样式 */
:deep(.tlui-input) {
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

:deep(.tlui-input:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* 优化滑块样式 */
:deep(.tlui-slider) {
  border-radius: 8px;
}

:deep(.tlui-slider__thumb) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* 优化颜色选择器 */
:deep(.tlui-color-picker) {
  border-radius: 8px;
}

:deep(.tlui-color-picker__swatch) {
  border-radius: 6px;
  transition: all 0.2s ease;
}

:deep(.tlui-color-picker__swatch:hover) {
  transform: scale(1.1);
}

/* 优化状态栏 */
:deep(.tlui-status-bar) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
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
  
  .tldraw-wrapper {
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
  
  .tldraw-wrapper {
    border-radius: 8px;
  }
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
</style>