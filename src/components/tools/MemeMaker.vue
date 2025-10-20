<template>
  <div class="meme-maker-container">
    <div class="meme-maker">
      <div class="meme-header">
        <!-- 返回主页按钮 -->
        <button class="back-home-btn" @click="goHome">
          <span class="back-icon">←</span>
          返回主页
        </button>
        
        <h2 class="meme-title">
          <span class="meme-icon">😂</span>
          表情包制作器
        </h2>
        <p class="meme-description">上传图片，添加文字，制作专属表情包</p>
      </div>

      <div class="meme-content">
        <!-- 左侧工具面板 -->
        <div class="tools-panel">
          <!-- 图片上传区域 -->
          <div class="tool-section">
            <h3 class="section-title">📷 图片上传</h3>
            <div class="upload-area" @click="triggerFileInput" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
              <input 
                ref="fileInput" 
                type="file" 
                accept="image/*" 
                @change="handleFileUpload" 
                style="display: none"
              >
              <div v-if="!imageUrl" class="upload-placeholder">
                <span class="upload-icon">📁</span>
                <p>点击或拖拽上传图片</p>
                <p class="upload-hint">支持 JPG、PNG、GIF 格式</p>
              </div>
              <div v-else class="uploaded-image">
                <img :src="imageUrl" alt="上传的图片" />
                <button class="change-image-btn" @click.stop="triggerFileInput">更换图片</button>
              </div>
            </div>
          </div>

          <!-- 文字编辑区域 -->
          <div class="tool-section">
            <h3 class="section-title">✏️ 文字编辑</h3>
            
            <!-- 文字内容 -->
            <div class="text-input-group">
              <label>上方文字</label>
              <textarea 
                v-model="topText" 
                placeholder="输入上方文字..."
                rows="2"
                @input="updatePreview"
              ></textarea>
            </div>
            
            <div class="text-input-group">
              <label>下方文字</label>
              <textarea 
                v-model="bottomText" 
                placeholder="输入下方文字..."
                rows="2"
                @input="updatePreview"
              ></textarea>
            </div>

            <!-- 文字样式控制 -->
            <div class="text-style-controls">
              <div class="control-group">
                <label>字体大小</label>
                <input 
                  type="range" 
                  v-model="fontSize" 
                  min="20" 
                  max="80" 
                  @input="updatePreview"
                >
                <span class="value-display">{{ fontSize }}px</span>
              </div>

              <div class="control-group">
                <label>文字颜色</label>
                <input 
                  type="color" 
                  v-model="textColor" 
                  @change="updatePreview"
                >
              </div>

              <div class="control-group">
                <label>描边颜色</label>
                <input 
                  type="color" 
                  v-model="strokeColor" 
                  @change="updatePreview"
                >
              </div>

              <div class="control-group">
                <label>描边宽度</label>
                <input 
                  type="range" 
                  v-model="strokeWidth" 
                  min="0" 
                  max="10" 
                  @input="updatePreview"
                >
                <span class="value-display">{{ strokeWidth }}px</span>
              </div>
            </div>
          </div>

          <!-- 基础编辑工具 -->
          <div class="tool-section">
            <h3 class="section-title">🔧 基础编辑</h3>
            <div class="edit-controls">
              <button class="edit-btn" @click="rotateImage(-90)">↺ 左转90°</button>
              <button class="edit-btn" @click="rotateImage(90)">↻ 右转90°</button>
              <button class="edit-btn" @click="flipHorizontal">↔️ 水平翻转</button>
              <button class="edit-btn" @click="resetImage">🔄 重置</button>
            </div>
          </div>

          <!-- 下载按钮 -->
          <div class="tool-section">
            <button class="download-btn" @click="downloadMeme" :disabled="!imageUrl">
              <span class="download-icon">💾</span>
              下载表情包
            </button>
          </div>
        </div>

        <!-- 右侧预览区域 -->
        <div class="preview-panel">
          <h3 class="section-title">👀 实时预览</h3>
          <div class="preview-container">
            <canvas 
              v-if="imageUrl"
              ref="previewCanvas" 
              class="preview-canvas"
              :width="canvasWidth"
              :height="canvasHeight"
            ></canvas>
            <div v-if="!imageUrl" class="preview-placeholder">
              <span class="placeholder-icon">🖼️</span>
              <p>请先上传图片</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

// 路由实例
const router = useRouter()

// 返回主页
const goHome = () => {
  router.push('/')
}

// 响应式数据
const fileInput = ref(null)
const previewCanvas = ref(null)
const imageUrl = ref('')
const originalImage = ref(null)
const topText = ref('')
const bottomText = ref('')
const fontSize = ref(40)
const textColor = ref('#FFFFFF')
const strokeColor = ref('#000000')
const strokeWidth = ref(3)
const canvasWidth = ref(500)
const canvasHeight = ref(500)
const rotation = ref(0)
const flipH = ref(false)

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    processImageFile(file)
  }
}

// 处理拖拽上传
const handleDrop = (event) => {
  event.preventDefault()
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processImageFile(files[0])
  }
}

// 处理图片文件
const processImageFile = (file) => {
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件！')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
    loadImage(e.target.result)
  }
  reader.readAsDataURL(file)
}

// 加载图片
const loadImage = (src) => {
  const img = new Image()
  img.onload = () => {
    originalImage.value = img
    // 调整画布尺寸以适应图片
    const maxSize = 500
    const ratio = Math.min(maxSize / img.width, maxSize / img.height)
    canvasWidth.value = img.width * ratio
    canvasHeight.value = img.height * ratio
    
    nextTick(() => {
      updatePreview()
    })
  }
  img.src = src
}

// 更新预览
const updatePreview = () => {
  if (!originalImage.value || !previewCanvas.value) return

  const canvas = previewCanvas.value
  const ctx = canvas.getContext('2d')
  
  // 清空画布
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // 保存当前状态
  ctx.save()
  
  // 应用变换
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotation.value * Math.PI) / 180)
  ctx.scale(flipH.value ? -1 : 1, 1)
  
  // 绘制图片
  ctx.drawImage(
    originalImage.value,
    -canvas.width / 2,
    -canvas.height / 2,
    canvas.width,
    canvas.height
  )
  
  // 恢复状态
  ctx.restore()
  
  // 绘制文字
  drawText(ctx)
}

// 绘制文字
const drawText = (ctx) => {
  ctx.font = `bold ${fontSize.value}px Arial, sans-serif`
  ctx.textAlign = 'center'
  ctx.fillStyle = textColor.value
  ctx.strokeStyle = strokeColor.value
  ctx.lineWidth = strokeWidth.value
  
  // 上方文字
  if (topText.value) {
    const lines = topText.value.split('\n')
    lines.forEach((line, index) => {
      const y = 50 + (index * (fontSize.value + 10))
      if (strokeWidth.value > 0) {
        ctx.strokeText(line, canvasWidth.value / 2, y)
      }
      ctx.fillText(line, canvasWidth.value / 2, y)
    })
  }
  
  // 下方文字
  if (bottomText.value) {
    const lines = bottomText.value.split('\n')
    lines.forEach((line, index) => {
      const y = canvasHeight.value - 30 - ((lines.length - 1 - index) * (fontSize.value + 10))
      if (strokeWidth.value > 0) {
        ctx.strokeText(line, canvasWidth.value / 2, y)
      }
      ctx.fillText(line, canvasWidth.value / 2, y)
    })
  }
}

// 旋转图片
const rotateImage = (angle) => {
  rotation.value = (rotation.value + angle) % 360
  updatePreview()
}

// 水平翻转
const flipHorizontal = () => {
  flipH.value = !flipH.value
  updatePreview()
}

// 重置图片
const resetImage = () => {
  rotation.value = 0
  flipH.value = false
  updatePreview()
}

// 下载表情包
const downloadMeme = () => {
  if (!previewCanvas.value) return
  
  const canvas = previewCanvas.value
  const link = document.createElement('a')
  link.download = `meme_${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

onMounted(() => {
  // 组件挂载后的初始化
})
</script>

<style scoped>
/* 容器样式 */
.meme-maker-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1rem;
  overflow-y: auto;
}

/* 主容器 */
.meme-maker {
  max-width: 1400px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.meme-header {
  position: relative;
  text-align: center;
  padding: 2rem 2rem 1rem 2rem;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
}

/* 返回按钮样式 */
.back-home-btn {
  position: absolute;
  top: 2rem;
  left: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.2rem;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 2px solid rgba(102, 126, 234, 0.2);
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-home-btn:hover {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateX(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
}

.back-icon {
  font-size: 1.1rem;
  font-weight: bold;
}

.meme-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #2d3748;
  margin: 0 0 0.8rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.meme-icon {
  font-size: 3.2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.meme-description {
  font-size: 1.2rem;
  color: #4a5568;
  margin: 0;
  opacity: 0.8;
  font-weight: 500;
}

.meme-content {
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 2rem;
  padding: 2rem;
  min-height: 700px;
}

/* 工具面板样式 */
.tools-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 1.8rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.3);
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.tool-section {
  margin-bottom: 2.5rem;
}

.tool-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 1.2rem 0;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

/* 上传区域样式 */
.upload-area {
  border: 3px dashed #cbd5e0;
  border-radius: 16px;
  padding: 2.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.4s ease;
  background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
  position: relative;
  overflow: hidden;
}

.upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.08), transparent);
  transition: left 0.6s ease;
}

.upload-area:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.1);
}

.upload-area:hover::before {
  left: 100%;
}

.upload-placeholder {
  color: #4a5568;
}

.upload-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 1.2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.upload-placeholder p {
  margin: 0.5rem 0;
  font-weight: 600;
}

.upload-hint {
  font-size: 0.95rem;
  color: #718096;
  font-weight: 400 !important;
}

.uploaded-image {
  position: relative;
}

.uploaded-image img {
  max-width: 100%;
  max-height: 180px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.change-image-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.change-image-btn:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: scale(1.05);
}

/* 文字输入样式 */
.text-input-group {
  margin-bottom: 1.5rem;
}

.text-input-group label {
  display: block;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.6rem;
  font-size: 0.95rem;
}

.text-input-group textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  resize: vertical;
  min-height: 70px;
  transition: all 0.3s ease;
  background: #fafafa;
  font-family: inherit;
}

.text-input-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  background: white;
}

/* 样式控制 */
.text-style-controls {
  display: grid;
  gap: 1.2rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.control-group label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  min-width: 80px;
}

.control-group input[type="range"] {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  outline: none;
  cursor: pointer;
}

.control-group input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #667eea;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3);
}

.control-group input[type="color"] {
  width: 45px;
  height: 35px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  background: none;
}

.value-display {
  font-size: 0.85rem;
  color: #667eea;
  font-weight: 600;
  min-width: 50px;
  text-align: center;
  background: white;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

/* 编辑控制按钮 */
.edit-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.8rem;
}

.edit-btn {
  padding: 0.8rem;
  background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4a5568;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
  border-color: #cbd5e0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 下载按钮 */
.download-btn {
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.25);
  position: relative;
  overflow: hidden;
}

.download-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.6s ease;
}

.download-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 35px rgba(102, 126, 234, 0.35);
}

.download-btn:hover:not(:disabled)::before {
  left: 100%;
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.15);
}

.download-icon {
  font-size: 1.3rem;
}

/* 预览面板样式 */
.preview-panel {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  padding: 1.8rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(226, 232, 240, 0.3);
}

.preview-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 550px;
  background: linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%);
  border-radius: 16px;
  border: 2px solid #e2e8f0;
  overflow: hidden;
}

.preview-canvas {
  max-width: 100%;
  max-height: 550px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transition: all 0.3s ease;
}

.preview-canvas:hover {
  transform: scale(1.02);
}

.preview-placeholder {
  text-align: center;
  color: #718096;
}

.placeholder-icon {
  font-size: 5rem;
  display: block;
  margin-bottom: 1.5rem;
  opacity: 0.6;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.preview-placeholder p {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .meme-content {
    grid-template-columns: 350px 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 1024px) {
  .meme-maker-container {
    padding: 0.5rem;
  }
  
  .meme-content {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .tools-panel {
    order: 2;
    position: static;
  }
  
  .preview-panel {
    order: 1;
  }
  
  .meme-title {
    font-size: 2.2rem;
  }
  
  .meme-icon {
    font-size: 2.8rem;
  }
  
  .back-home-btn {
    position: static;
    margin-bottom: 1rem;
    align-self: flex-start;
  }
  
  .meme-header {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 768px) {
  .meme-maker-container {
    padding: 0.25rem;
  }
  
  .meme-content {
    padding: 1rem;
  }
  
  .meme-title {
    font-size: 1.8rem;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .meme-icon {
    font-size: 2.5rem;
  }
  
  .edit-controls {
    grid-template-columns: 1fr;
  }
  
  .control-group {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  
  .control-group label {
    min-width: auto;
    text-align: center;
  }
}

/* 滚动条美化 */
.meme-maker-container::-webkit-scrollbar {
  width: 8px;
}

.meme-maker-container::-webkit-scrollbar-track {
  background: rgba(226, 232, 240, 0.3);
  border-radius: 4px;
}

.meme-maker-container::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(102, 126, 234, 0.5));
  border-radius: 4px;
}

.meme-maker-container::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.5), rgba(102, 126, 234, 0.7));
}
</style>