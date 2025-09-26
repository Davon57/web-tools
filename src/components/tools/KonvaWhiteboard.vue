<template>
  <div class="konva-whiteboard">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button @click="goHome" class="home-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          <span>返回主页</span>
        </button>
        
        <div class="tool-group">
          <button 
            @click="setTool('pen')" 
            :class="{ active: currentTool === 'pen' }"
            class="tool-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.586 7.586"/>
            </svg>
            <span>画笔</span>
          </button>
          
          <button 
            @click="setTool('eraser')" 
            :class="{ active: currentTool === 'eraser' }"
            class="tool-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 20H7l-3-3 8.5-8.5a2.12 2.12 0 0 1 3 0L20 13.5V20z"/>
              <path d="M16 16L4 4"/>
            </svg>
            <span>橡皮擦</span>
          </button>
          
          <button 
            @click="setTool('line')" 
            :class="{ active: currentTool === 'line' }"
            class="tool-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="7" y1="17" x2="17" y2="7"/>
            </svg>
            <span>直线</span>
          </button>
          
          <button 
            @click="setTool('rectangle')" 
            :class="{ active: currentTool === 'rectangle' }"
            class="tool-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            </svg>
            <span>矩形</span>
          </button>
          
          <button 
            @click="setTool('circle')" 
            :class="{ active: currentTool === 'circle' }"
            class="tool-button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <span>圆形</span>
          </button>
        </div>
      </div>
      
      <div class="toolbar-center">
        <h1>Konva 智能白板</h1>
        <p class="subtitle">基于 Konva 的高性能绘图工具</p>
      </div>
      
      <div class="toolbar-right">
        <div class="color-picker">
          <label>颜色:</label>
          <input 
            type="color" 
            v-model="strokeColor" 
            class="color-input"
          />
        </div>
        
        <div class="stroke-width">
          <label>粗细:</label>
          <input 
            type="range" 
            min="1" 
            max="20" 
            v-model="strokeWidth"
            class="width-slider"
          />
          <span class="width-value">{{ strokeWidth }}</span>
        </div>
        
        <button @click="clearCanvas" class="action-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"/>
          </svg>
          <span>清空</span>
        </button>
        
        <button @click="exportImage" class="action-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <span>导出</span>
        </button>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-container">
      <div 
        ref="canvasContainer" 
        class="canvas-wrapper"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
      >
        <!-- Konva 画布将在这里渲染 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()

// 画布相关
const canvasContainer = ref(null)
let stage = null
let layer = null

// 工具状态
const currentTool = ref('pen')
const strokeColor = ref('#000000')
const strokeWidth = ref(2)

// 绘制状态
const isDrawing = ref(false)
const lastLine = ref(null)
const startPos = ref({ x: 0, y: 0 })

// 导航方法
const goHome = () => {
  router.push('/')
}

// 设置工具
const setTool = (tool) => {
  currentTool.value = tool
  isDrawing.value = false
  lastLine.value = null
}

// 获取鼠标位置
const getPointerPosition = (e) => {
  const rect = canvasContainer.value.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}

// 鼠标按下事件
const handleMouseDown = async (e) => {
  if (!stage || !layer) return
  
  isDrawing.value = true
  const pos = getPointerPosition(e)
  startPos.value = pos
  
  if (currentTool.value === 'pen') {
    // 创建新的线条
    const { default: Konva } = await import('konva')
    lastLine.value = new Konva.Line({
      stroke: strokeColor.value,
      strokeWidth: strokeWidth.value,
      globalCompositeOperation: 'source-over',
      lineCap: 'round',
      lineJoin: 'round',
      points: [pos.x, pos.y, pos.x, pos.y]
    })
    layer.add(lastLine.value)
  } else if (currentTool.value === 'eraser') {
    // 橡皮擦模式
    const { default: Konva } = await import('konva')
    lastLine.value = new Konva.Line({
      stroke: '#ffffff',
      strokeWidth: strokeWidth.value * 2,
      globalCompositeOperation: 'destination-out',
      lineCap: 'round',
      lineJoin: 'round',
      points: [pos.x, pos.y, pos.x, pos.y]
    })
    layer.add(lastLine.value)
  }
}

// 鼠标移动事件
const handleMouseMove = async (e) => {
  if (!isDrawing.value || !stage || !layer) return
  
  const pos = getPointerPosition(e)
  
  if (currentTool.value === 'pen' || currentTool.value === 'eraser') {
    if (lastLine.value) {
      const newPoints = lastLine.value.points().concat([pos.x, pos.y])
      lastLine.value.points(newPoints)
    }
  }
  
  layer.batchDraw()
}

// 鼠标抬起事件
const handleMouseUp = async (e) => {
  if (!isDrawing.value || !stage || !layer) return
  
  const pos = getPointerPosition(e)
  
  if (currentTool.value === 'line') {
    // 绘制直线
    const { default: Konva } = await import('konva')
    const line = new Konva.Line({
      points: [startPos.value.x, startPos.value.y, pos.x, pos.y],
      stroke: strokeColor.value,
      strokeWidth: strokeWidth.value,
      lineCap: 'round'
    })
    layer.add(line)
  } else if (currentTool.value === 'rectangle') {
    // 绘制矩形
    const { default: Konva } = await import('konva')
    const rect = new Konva.Rect({
      x: Math.min(startPos.value.x, pos.x),
      y: Math.min(startPos.value.y, pos.y),
      width: Math.abs(pos.x - startPos.value.x),
      height: Math.abs(pos.y - startPos.value.y),
      stroke: strokeColor.value,
      strokeWidth: strokeWidth.value,
      fill: 'transparent'
    })
    layer.add(rect)
  } else if (currentTool.value === 'circle') {
    // 绘制圆形
    const { default: Konva } = await import('konva')
    const radius = Math.sqrt(
      Math.pow(pos.x - startPos.value.x, 2) + 
      Math.pow(pos.y - startPos.value.y, 2)
    )
    const circle = new Konva.Circle({
      x: startPos.value.x,
      y: startPos.value.y,
      radius: radius,
      stroke: strokeColor.value,
      strokeWidth: strokeWidth.value,
      fill: 'transparent'
    })
    layer.add(circle)
  }
  
  isDrawing.value = false
  lastLine.value = null
  layer.batchDraw()
}

// 清空画布
const clearCanvas = () => {
  if (layer) {
    layer.destroyChildren()
    layer.batchDraw()
    ElMessage.success('画布已清空')
  }
}

// 导出图片
const exportImage = () => {
  if (stage) {
    try {
      const dataURL = stage.toDataURL({ pixelRatio: 2 })
      const link = document.createElement('a')
      link.download = `konva-whiteboard-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`
      link.href = dataURL
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      ElMessage.success('图片导出成功！')
    } catch (error) {
      console.error('导出图片失败:', error)
      ElMessage.error('导出图片失败')
    }
  }
}

// 初始化 Konva
const initKonva = async () => {
  try {
    const { default: Konva } = await import('konva')
    
    if (!canvasContainer.value) {
      throw new Error('画布容器未找到')
    }
    
    // 获取容器尺寸
    const containerRect = canvasContainer.value.getBoundingClientRect()
    const width = containerRect.width || 800
    const height = containerRect.height || 600
    
    // 创建舞台
    stage = new Konva.Stage({
      container: canvasContainer.value,
      width: width,
      height: height
    })
    
    // 创建图层
    layer = new Konva.Layer()
    stage.add(layer)
    
    // 设置背景
    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: '#ffffff'
    })
    layer.add(background)
    layer.batchDraw()
    
    console.log('Konva 白板初始化成功')
    ElMessage.success('白板加载成功！')
    
  } catch (error) {
    console.error('初始化 Konva 失败:', error)
    ElMessage.error('白板加载失败: ' + error.message)
  }
}

// 窗口大小调整
const handleResize = () => {
  if (stage && canvasContainer.value) {
    const containerRect = canvasContainer.value.getBoundingClientRect()
    stage.width(containerRect.width)
    stage.height(containerRect.height)
    stage.batchDraw()
  }
}

// 组件生命周期
onMounted(async () => {
  await nextTick()
  await initKonva()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (stage) {
    stage.destroy()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.konva-whiteboard {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  gap: 16px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.toolbar-center {
  text-align: center;
  flex: 1;
  min-width: 200px;
}

.toolbar-center h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #666;
  font-weight: 400;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.home-button, .tool-button, .action-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.tool-button {
  background: rgba(255, 255, 255, 0.1);
  color: #333;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.tool-button.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.home-button:hover, .tool-button:hover, .action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.tool-group {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.color-picker, .stroke-width {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker label, .stroke-width label {
  font-size: 12px;
  color: #666;
  font-weight: 500;
}

.color-input {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: none;
}

.width-slider {
  width: 80px;
}

.width-value {
  font-size: 12px;
  color: #666;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

.canvas-container {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 0;
}

.canvas-wrapper {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: crosshair;
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .toolbar {
    padding: 12px 16px;
    gap: 12px;
  }
  
  .toolbar-center h1 {
    font-size: 20px;
  }
  
  .tool-group {
    flex-wrap: wrap;
  }
  
  .canvas-container {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .toolbar-left, .toolbar-right {
    justify-content: center;
  }
  
  .tool-group {
    justify-content: center;
  }
  
  .home-button span, .tool-button span, .action-button span {
    display: none;
  }
  
  .home-button, .tool-button, .action-button {
    padding: 10px;
    min-width: 40px;
    justify-content: center;
  }
  
  .canvas-container {
    padding: 12px;
  }
}

@media (max-width: 480px) {
  .toolbar-center h1 {
    font-size: 18px;
  }
  
  .subtitle {
    font-size: 11px;
  }
  
  .canvas-wrapper {
    border-radius: 8px;
  }
}
</style>