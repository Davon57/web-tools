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
        
        <button @click="clearCanvas" class="action-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
          </svg>
          <span>清空画布</span>
        </button>
        
        <button @click="exportImage" class="action-button">
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
// 初始化 tldraw
const initTldraw = async () => {
  try {
    // 动态导入 React 和 tldraw
    const React = await import('react')
    const ReactDOM = await import('react-dom/client')
    const { Tldraw } = await import('tldraw')
    
    // 导入 tldraw 样式
    await import('tldraw/tldraw.css')
    
    // 创建 React 组件
    const TldrawComponent = React.createElement(Tldraw, {
      persistenceKey: 'web-tools-whiteboard',
      onMount: (editor) => {
        tldrawEditor = editor
        console.log('tldraw 编辑器已初始化')
      },
      autoFocus: true
    })
    
    // 创建 React 根节点并渲染
    if (tldrawContainer.value) {
      reactRoot = ReactDOM.createRoot(tldrawContainer.value)
      reactRoot.render(TldrawComponent)
    }
    
  } catch (error) {
    console.error('初始化 tldraw 失败:', error)
    // 显示错误信息
    if (tldrawContainer.value) {
      tldrawContainer.value.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #666; font-size: 16px;">
          <div style="text-align: center;">
            <p>白板加载失败</p>
            <p style="font-size: 14px; margin-top: 8px;">请刷新页面重试</p>
          </div>
        </div>
      `
    }
  }
}

// 组件挂载
onMounted(() => {
  initTldraw()
})

// 组件卸载
onUnmounted(() => {
  if (reactRoot) {
    reactRoot.unmount()
    reactRoot = null
  }
  tldrawEditor = null
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
</style>