<template>
  <div class="konva-whiteboard-container">
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

        <button @click="undo" class="action-button" :disabled="!canUndo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7v6h6"/>
            <path d="m21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"/>
          </svg>
          <span>撤销</span>
        </button>

        <button @click="redo" class="action-button" :disabled="!canRedo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 7v6h-6"/>
            <path d="m3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"/>
          </svg>
          <span>重做</span>
        </button>
      </div>
      
      <div class="toolbar-title">
        <h1>智能白板</h1>
        <p class="subtitle">基于 Konva.js 的现代化绘图工具</p>
      </div>
    </div>

    <!-- 绘图工具栏 -->
    <div class="drawing-toolbar">
      <div class="tool-group">
        <button 
          v-for="tool in drawingTools" 
          :key="tool.name"
          @click="selectTool(tool.name)"
          :class="['tool-button', { active: currentTool === tool.name }]"
          :title="tool.label"
        >
          <component :is="tool.icon" />
          <span>{{ tool.label }}</span>
        </button>
      </div>

      <div class="tool-group">
        <div class="color-picker">
          <label>颜色:</label>
          <input 
            type="color" 
            v-model="strokeColor" 
            @change="updateStrokeColor"
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
            @input="updateStrokeWidth"
            class="width-slider"
          />
          <span class="width-value">{{ strokeWidth }}px</span>
        </div>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="canvas-container" ref="canvasContainer">
      <div ref="konvaContainer" class="konva-container"></div>
    </div>

    <!-- 文本输入对话框 -->
    <div v-if="showTextDialog" class="text-dialog-overlay" @click="cancelTextInput">
      <div class="text-dialog" @click.stop>
        <h3>输入文本内容</h3>
        <input 
          v-model="textInput" 
          type="text" 
          placeholder="请输入文本内容..."
          class="text-input"
          @keyup.enter="confirmTextInput"
          @keyup.escape="cancelTextInput"
          ref="textInputRef"
        />
        <div class="dialog-buttons">
          <button @click="cancelTextInput" class="cancel-button">取消</button>
          <button @click="confirmTextInput" class="confirm-button">确定</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import Konva from 'konva'

const router = useRouter()

// 响应式数据
const canvasContainer = ref(null)
const konvaContainer = ref(null)
let stage = null
let layer = null
let isDrawing = false
let lastLine = null

// 绘图状态
const currentTool = ref('pen')
const strokeColor = ref('#000000')
const strokeWidth = ref(2)

// 历史记录
const history = ref([])
const historyStep = ref(-1)
const canUndo = ref(false)
const canRedo = ref(false)

// 文本输入对话框
const showTextDialog = ref(false)
const textInput = ref('')
const textInputRef = ref(null)
let pendingTextPosition = null

// 绘图工具配置
const drawingTools = [
  {
    name: 'pen',
    label: '画笔',
    icon: 'PenIcon'
  },
  {
    name: 'rectangle',
    label: '矩形',
    icon: 'RectangleIcon'
  },
  {
    name: 'circle',
    label: '圆形',
    icon: 'CircleIcon'
  },
  {
    name: 'line',
    label: '直线',
    icon: 'LineIcon'
  },
  {
    name: 'text',
    label: '文本',
    icon: 'TextIcon'
  }
]

// 工具图标组件
const PenIcon = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  `
}

const RectangleIcon = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
    </svg>
  `
}

const CircleIcon = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  `
}

const LineIcon = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="7" y1="17" x2="17" y2="7"/>
    </svg>
  `
}

const TextIcon = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="4,7 4,4 20,4 20,7"/>
      <line x1="9" y1="20" x2="15" y2="20"/>
      <line x1="12" y1="4" x2="12" y2="20"/>
    </svg>
  `
}

// 初始化 Konva 画布
const initKonva = async () => {
  try {
    await nextTick()
    
    if (!konvaContainer.value) {
      throw new Error('Konva 容器未找到')
    }

    const containerRect = canvasContainer.value.getBoundingClientRect()
    const width = containerRect.width
    const height = containerRect.height - 20 // 减去一些边距

    // 创建舞台
    stage = new Konva.Stage({
      container: konvaContainer.value,
      width: width,
      height: height
    })

    // 创建图层
    layer = new Konva.Layer()
    stage.add(layer)

    // 添加白色背景矩形（确保导出时有白色背景）
    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: '#ffffff',
      listening: false // 不响应事件，提高性能
    })
    layer.add(background)
    background.moveToBottom() // 确保背景在最底层

    // 添加事件监听器
    setupEventListeners()
    
    // 保存初始状态
    saveState()
    
    ElMessage.success('Konva 白板初始化成功！')
    
  } catch (error) {
    console.error('初始化 Konva 失败:', error)
    ElMessage.error(`初始化失败: ${error.message}`)
  }
}

// 设置事件监听器
const setupEventListeners = () => {
  stage.on('mousedown touchstart', handleMouseDown)
  stage.on('mousemove touchmove', handleMouseMove)
  stage.on('mouseup touchend', handleMouseUp)
}

// 当前绘制的形状
let currentShape = null
let startPos = null

// 鼠标按下事件
const handleMouseDown = (e) => {
  isDrawing = true
  const pos = stage.getPointerPosition()
  startPos = { x: pos.x, y: pos.y }
  
  switch (currentTool.value) {
    case 'pen':
      // 创建新的线条
      lastLine = new Konva.Line({
        stroke: strokeColor.value,
        strokeWidth: strokeWidth.value,
        globalCompositeOperation: 'source-over',
        lineCap: 'round',
        lineJoin: 'round',
        points: [pos.x, pos.y, pos.x, pos.y]
      })
      layer.add(lastLine)
      break
      
    case 'rectangle':
      // 创建矩形
      currentShape = new Konva.Rect({
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        stroke: strokeColor.value,
        strokeWidth: strokeWidth.value,
        fill: 'transparent'
      })
      layer.add(currentShape)
      break
      
    case 'circle':
      // 创建圆形
      currentShape = new Konva.Circle({
        x: pos.x,
        y: pos.y,
        radius: 0,
        stroke: strokeColor.value,
        strokeWidth: strokeWidth.value,
        fill: 'transparent'
      })
      layer.add(currentShape)
      break
      
    case 'line':
      // 创建直线
      currentShape = new Konva.Line({
        points: [pos.x, pos.y, pos.x, pos.y],
        stroke: strokeColor.value,
        strokeWidth: strokeWidth.value,
        lineCap: 'round'
      })
      layer.add(currentShape)
      break
      
    case 'text':
      // 显示文本输入对话框
      pendingTextPosition = { x: pos.x, y: pos.y }
      textInput.value = ''
      showTextDialog.value = true
      // 等待 DOM 更新后聚焦输入框
      nextTick(() => {
        if (textInputRef.value) {
          textInputRef.value.focus()
        }
      })
      isDrawing = false
      return
  }
}

// 鼠标移动事件
const handleMouseMove = (e) => {
  if (!isDrawing) return
  
  const pos = stage.getPointerPosition()
  
  switch (currentTool.value) {
    case 'pen':
      if (lastLine) {
        // 更新线条路径
        const newPoints = lastLine.points().concat([pos.x, pos.y])
        lastLine.points(newPoints)
      }
      break
      
    case 'rectangle':
      if (currentShape && startPos) {
        const width = pos.x - startPos.x
        const height = pos.y - startPos.y
        currentShape.width(Math.abs(width))
        currentShape.height(Math.abs(height))
        currentShape.x(width < 0 ? pos.x : startPos.x)
        currentShape.y(height < 0 ? pos.y : startPos.y)
      }
      break
      
    case 'circle':
      if (currentShape && startPos) {
        const radius = Math.sqrt(
          Math.pow(pos.x - startPos.x, 2) + Math.pow(pos.y - startPos.y, 2)
        )
        currentShape.radius(radius)
      }
      break
      
    case 'line':
      if (currentShape && startPos) {
        currentShape.points([startPos.x, startPos.y, pos.x, pos.y])
      }
      break
  }
  
  layer.batchDraw()
}

// 鼠标抬起事件
const handleMouseUp = () => {
  if (!isDrawing) return
  
  isDrawing = false
  lastLine = null
  currentShape = null
  startPos = null
  
  // 保存状态到历史记录
  saveState()
}

// 选择工具
const selectTool = (toolName) => {
  currentTool.value = toolName
}

// 更新描边颜色
const updateStrokeColor = () => {
  // 颜色更新逻辑
}

// 更新描边宽度
const updateStrokeWidth = () => {
  // 宽度更新逻辑
}

// 保存状态到历史记录
const saveState = () => {
  historyStep.value++
  
  // 删除当前步骤之后的历史记录
  if (historyStep.value < history.value.length) {
    history.value.length = historyStep.value
  }
  
  // 保存当前状态
  history.value.push(stage.toJSON())
  
  // 限制历史记录数量
  if (history.value.length > 50) {
    history.value.shift()
    historyStep.value--
  }
  
  updateUndoRedoState()
}

// 更新撤销重做状态
const updateUndoRedoState = () => {
  canUndo.value = historyStep.value > 0
  canRedo.value = historyStep.value < history.value.length - 1
}

// 撤销操作
const undo = () => {
  if (!canUndo.value || historyStep.value <= 0) return
  
  historyStep.value--
  const state = history.value[historyStep.value]
  
  // 清空当前图层
  layer.destroyChildren()
  
  // 从 JSON 恢复状态
  const stageData = JSON.parse(state)
  if (stageData.children && stageData.children[0] && stageData.children[0].children) {
    stageData.children[0].children.forEach(childData => {
      const node = Konva.Node.create(childData)
      layer.add(node)
    })
  }
  
  layer.draw()
  updateUndoRedoState()
}

// 重做操作
const redo = () => {
  if (!canRedo.value || historyStep.value >= history.value.length - 1) return
  
  historyStep.value++
  const state = history.value[historyStep.value]
  
  // 清空当前图层
  layer.destroyChildren()
  
  // 从 JSON 恢复状态
  const stageData = JSON.parse(state)
  if (stageData.children && stageData.children[0] && stageData.children[0].children) {
    stageData.children[0].children.forEach(childData => {
      const node = Konva.Node.create(childData)
      layer.add(node)
    })
  }
  
  layer.draw()
  updateUndoRedoState()
}

// 清空画布
const clearCanvas = () => {
  if (!layer) return
  
  layer.destroyChildren()
  layer.draw()
  saveState()
  ElMessage.success('画布已清空')
}

// 导出图片
const exportImage = () => {
  if (!stage) {
    ElMessage.error('画布未初始化')
    return
  }
  
  try {
    const dataURL = stage.toDataURL({ 
      pixelRatio: 2,
      backgroundColor: '#ffffff'
    })
    
    // 创建下载链接
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

// 返回主页
const goHome = () => {
  router.push('/')
}

// 处理文本输入确认
const confirmTextInput = () => {
  if (textInput.value.trim() && pendingTextPosition) {
    const textNode = new Konva.Text({
      x: pendingTextPosition.x,
      y: pendingTextPosition.y,
      text: textInput.value.trim(),
      fontSize: strokeWidth.value * 8, // 根据笔刷大小调整字体大小
      fill: strokeColor.value,
      fontFamily: 'Arial, sans-serif'
    })
    layer.add(textNode)
    layer.draw()
    saveState()
  }
  
  // 重置状态
  showTextDialog.value = false
  textInput.value = ''
  pendingTextPosition = null
}

// 取消文本输入
const cancelTextInput = () => {
  showTextDialog.value = false
  textInput.value = ''
  pendingTextPosition = null
}

// 窗口大小调整处理
const handleResize = () => {
  if (!stage || !canvasContainer.value) return
  
  const containerRect = canvasContainer.value.getBoundingClientRect()
  stage.width(containerRect.width)
  stage.height(containerRect.height - 20)
  stage.draw()
}

// 组件生命周期
onMounted(() => {
  initKonva()
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
.konva-whiteboard-container {
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

.action-button:disabled {
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

.drawing-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 30px;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tool-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.tool-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  color: #666;
}

.tool-button:hover {
  border-color: #667eea;
  color: #667eea;
}

.tool-button.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-color: #667eea;
  color: white;
}

.color-picker, .stroke-width {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input {
  width: 40px;
  height: 30px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.width-slider {
  width: 100px;
}

.width-value {
  font-size: 12px;
  color: #666;
  min-width: 35px;
}

.canvas-container {
  flex: 1;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: stretch;
  min-height: 0;
}

.konva-container {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .toolbar {
    padding: 16px 20px;
  }
  
  .drawing-toolbar {
    padding: 12px 20px;
    flex-direction: column;
    gap: 12px;
  }
  
  .tool-group {
    flex-wrap: wrap;
  }
  
  .canvas-container {
    padding: 16px;
  }
}

@media (max-width: 480px) {
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
  
  .tool-button span {
    display: none;
  }
  
  .tool-button {
    padding: 8px;
  }
}

/* 文本输入对话框样式 */
.text-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.text-dialog {
  background: white;
  border-radius: 16px;
  padding: 24px;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: dialogFadeIn 0.2s ease-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.text-dialog h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.text-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
  margin-bottom: 20px;
  box-sizing: border-box;
}

.text-input:focus {
  border-color: #667eea;
}

.dialog-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-button, .confirm-button {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-button {
  background: #f5f5f5;
  color: #666;
}

.cancel-button:hover {
  background: #e0e0e0;
}

.confirm-button {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.confirm-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}
</style>