<template>
  <div class="tool-container">
    <div class="tool-header">
      <button @click="$router.push('/')" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        返回主页
      </button>
      <h1 class="tool-title">图片压缩</h1>
      <p class="tool-description">支持JPG、PNG、GIF等格式，智能压缩保持清晰度</p>
    </div>

    <div class="compressor-content">
      <!-- 上传区域 -->
      <div class="upload-section">
        <div 
          class="upload-area"
          :class="{ 'drag-over': isDragOver, 'has-files': selectedFiles.length > 0 }"
          @drop="handleDrop"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @click="triggerFileInput"
        >
          <input 
            ref="fileInput"
            type="file" 
            multiple 
            accept="image/*"
            @change="handleFileSelect"
            style="display: none"
          >
          
          <div v-if="selectedFiles.length === 0" class="upload-placeholder">
            <div class="upload-icon">📸</div>
            <h3>拖拽图片到此处或点击选择</h3>
            <p>支持 JPG、PNG、GIF、WebP 等格式</p>
            <p>支持批量上传多张图片</p>
          </div>
          
          <div v-else class="files-preview">
            <h3>已选择 {{ selectedFiles.length }} 张图片</h3>
            <div class="files-grid">
              <div 
                v-for="(file, index) in selectedFiles" 
                :key="index"
                class="file-item"
              >
                <img :src="file.preview" :alt="file.name" class="file-thumbnail">
                <div class="file-info">
                  <div class="file-name">{{ file.name }}</div>
                  <div class="file-size">{{ formatFileSize(file.originalSize) }}</div>
                </div>
                <button @click.stop="removeFile(index)" class="remove-btn">×</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 压缩设置 -->
      <div v-if="selectedFiles.length > 0" class="settings-section">
        <div class="settings-card">
          <h3>压缩设置</h3>
          
          <div class="setting-group">
            <label class="setting-label">
              压缩质量: {{ Math.round(compressionQuality * 100) }}%
            </label>
            <input 
              v-model="compressionQuality"
              type="range" 
              min="0.1" 
              max="1" 
              step="0.1"
              class="quality-slider"
            >
            <div class="quality-labels">
              <span>高压缩</span>
              <span>平衡</span>
              <span>高质量</span>
            </div>
          </div>

          <div class="setting-group">
            <label class="setting-label">
              最大宽度 (像素)
            </label>
            <input 
              v-model="maxWidth"
              type="number" 
              min="100" 
              max="4000"
              class="size-input"
              placeholder="不限制"
            >
          </div>

          <div class="setting-group">
            <label class="setting-label">
              最大高度 (像素)
            </label>
            <input 
              v-model="maxHeight"
              type="number" 
              min="100" 
              max="4000"
              class="size-input"
              placeholder="不限制"
            >
          </div>

          <div class="setting-group">
            <label class="setting-checkbox">
              <input 
                v-model="maintainAspectRatio"
                type="checkbox"
              >
              保持宽高比
            </label>
          </div>
        </div>

        <div class="action-buttons">
          <button 
            @click="compressImages"
            :disabled="isCompressing"
            class="compress-btn"
          >
            <span v-if="isCompressing">压缩中...</span>
            <span v-else>开始压缩</span>
          </button>
          
          <button 
            @click="clearAll"
            class="clear-btn"
          >
            清空所有
          </button>
        </div>
      </div>

      <!-- 压缩结果 -->
      <div v-if="compressedFiles.length > 0" class="results-section">
        <div class="results-header">
          <h3>压缩结果</h3>
          <div class="compression-stats">
            <span class="stat-item">
              总压缩率: {{ overallCompressionRatio }}%
            </span>
            <span class="stat-item">
              节省空间: {{ formatFileSize(totalSavedSize) }}
            </span>
          </div>
        </div>

        <div class="results-grid">
          <div 
            v-for="(result, index) in compressedFiles" 
            :key="index"
            class="result-item"
          >
            <div class="result-preview">
              <div class="preview-container">
                <div class="preview-image">
                  <img :src="result.originalPreview" alt="原图">
                  <div class="image-label">原图</div>
                </div>
                <div class="preview-arrow">→</div>
                <div class="preview-image">
                  <img :src="result.compressedPreview" alt="压缩后">
                  <div class="image-label">压缩后</div>
                </div>
              </div>
            </div>
            
            <div class="result-info">
              <div class="result-name">{{ result.name }}</div>
              <div class="size-comparison">
                <span class="original-size">{{ formatFileSize(result.originalSize) }}</span>
                <span class="arrow">→</span>
                <span class="compressed-size">{{ formatFileSize(result.compressedSize) }}</span>
                <span class="compression-ratio">({{ result.compressionRatio }}%)</span>
              </div>
            </div>
            
            <div class="result-actions">
              <button 
                @click="downloadSingle(result)"
                class="download-btn"
              >
                下载
              </button>
            </div>
          </div>
        </div>

        <div class="batch-actions">
          <button 
            @click="downloadAll"
            class="download-all-btn"
          >
            下载全部
          </button>
        </div>
      </div>

      <!-- 进度条 -->
      <div v-if="isCompressing" class="progress-section">
        <div class="progress-bar">
          <div 
            class="progress-fill"
            :style="{ width: compressionProgress + '%' }"
          ></div>
        </div>
        <div class="progress-text">
          正在压缩第 {{ currentProcessingIndex + 1 }} / {{ selectedFiles.length }} 张图片...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolsStore } from '@/stores/counter'
import imageCompression from 'browser-image-compression'

const toolsStore = useToolsStore()

// 响应式数据
const fileInput = ref(null)
const selectedFiles = ref([])
const compressedFiles = ref([])
const isDragOver = ref(false)
const isCompressing = ref(false)
const compressionProgress = ref(0)
const currentProcessingIndex = ref(0)

// 压缩设置
const compressionQuality = ref(0.8)
const maxWidth = ref('')
const maxHeight = ref('')
const maintainAspectRatio = ref(true)

// 计算属性
const overallCompressionRatio = computed(() => {
  if (compressedFiles.value.length === 0) return 0
  
  const totalOriginal = compressedFiles.value.reduce((sum, file) => sum + file.originalSize, 0)
  const totalCompressed = compressedFiles.value.reduce((sum, file) => sum + file.compressedSize, 0)
  
  return Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)
})

const totalSavedSize = computed(() => {
  return compressedFiles.value.reduce((sum, file) => sum + (file.originalSize - file.compressedSize), 0)
})

// 方法
const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = Array.from(event.dataTransfer.files).filter(file => 
    file.type.startsWith('image/')
  )
  
  addFiles(files)
}

const addFiles = async (files) => {
  for (const file of files) {
    // 检查是否已存在
    if (selectedFiles.value.some(f => f.name === file.name && f.size === file.size)) {
      continue
    }
    
    // 创建预览
    const preview = await createImagePreview(file)
    
    selectedFiles.value.push({
      file,
      name: file.name,
      originalSize: file.size,
      preview
    })
  }
}

const createImagePreview = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
  
  // 如果删除的文件已经压缩过，也要从结果中移除
  if (compressedFiles.value[index]) {
    compressedFiles.value.splice(index, 1)
  }
}

const clearAll = () => {
  selectedFiles.value = []
  compressedFiles.value = []
  compressionProgress.value = 0
  currentProcessingIndex.value = 0
}

const compressImages = async () => {
  if (selectedFiles.value.length === 0) return
  
  isCompressing.value = true
  compressionProgress.value = 0
  currentProcessingIndex.value = 0
  compressedFiles.value = []
  
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: Math.max(maxWidth.value || 1920, maxHeight.value || 1920),
    useWebWorker: true,
    quality: compressionQuality.value
  }
  
  // 如果设置了具体尺寸
  if (maxWidth.value) options.maxWidthOrHeight = Math.min(options.maxWidthOrHeight, maxWidth.value)
  if (maxHeight.value) options.maxWidthOrHeight = Math.min(options.maxWidthOrHeight, maxHeight.value)
  
  try {
    for (let i = 0; i < selectedFiles.value.length; i++) {
      currentProcessingIndex.value = i
      const fileData = selectedFiles.value[i]
      
      // 压缩图片
      const compressedFile = await imageCompression(fileData.file, options)
      
      // 创建压缩后的预览
      const compressedPreview = await createImagePreview(compressedFile)
      
      // 计算压缩率
      const compressionRatio = Math.round(((fileData.originalSize - compressedFile.size) / fileData.originalSize) * 100)
      
      compressedFiles.value.push({
        name: fileData.name,
        originalSize: fileData.originalSize,
        compressedSize: compressedFile.size,
        originalPreview: fileData.preview,
        compressedPreview,
        compressedFile,
        compressionRatio
      })
      
      // 更新进度
      compressionProgress.value = Math.round(((i + 1) / selectedFiles.value.length) * 100)
    }
  } catch (error) {
    console.error('压缩失败:', error)
    alert('压缩过程中出现错误，请重试')
  } finally {
    isCompressing.value = false
  }
}

const downloadSingle = (result) => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(result.compressedFile)
  link.download = `compressed_${result.name}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

const downloadAll = () => {
  compressedFiles.value.forEach(result => {
    setTimeout(() => downloadSingle(result), 100)
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 组件挂载时记录使用
toolsStore.addToolHistory('图片压缩')
</script>

<style scoped>
.tool-container {
  width: 100%;
  max-width: 100vw;
  height: 100vh;
  padding: 20px;
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.tool-header {
  position: relative;
  text-align: center;
  margin-bottom: 20px;
}

.back-btn {
  position: absolute;
  left: 0;
  top: 0;
  background: linear-gradient(145deg, #6c757d, #5a6268);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
}

.back-btn:hover {
  background: linear-gradient(145deg, #5a6268, #495057);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(108, 117, 125, 0.4);
}

.tool-title {
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tool-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

.compressor-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

/* 上传区域 */
.upload-section {
  width: 100%;
}

.upload-area {
  border: 3px dashed #dee2e6;
  border-radius: 15px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-area:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.upload-area.drag-over {
  border-color: #28a745;
  background: #f8fff9;
  transform: scale(1.02);
}

.upload-area.has-files {
  border-color: #007bff;
  background: #f8f9ff;
}

.upload-placeholder {
  width: 100%;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.upload-placeholder h3 {
  color: #495057;
  margin-bottom: 8px;
  font-size: 1.3rem;
}

.upload-placeholder p {
  color: #6c757d;
  margin: 5px 0;
}

.files-preview {
  width: 100%;
}

.files-preview h3 {
  color: #495057;
  margin-bottom: 15px;
}

.files-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.file-item {
  position: relative;
  background: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.file-item:hover {
  transform: translateY(-2px);
}

.file-thumbnail {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}

.file-info {
  text-align: left;
}

.file-name {
  font-weight: 600;
  color: #495057;
  font-size: 0.9rem;
  margin-bottom: 5px;
  word-break: break-all;
}

.file-size {
  color: #6c757d;
  font-size: 0.8rem;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

/* 设置区域 */
.settings-section {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.settings-card {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.settings-card h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.setting-group {
  margin-bottom: 15px;
}

.setting-label {
  display: block;
  color: #495057;
  font-weight: 600;
  margin-bottom: 8px;
}

.quality-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #dee2e6;
  outline: none;
  margin-bottom: 10px;
}

.quality-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #007bff;
  cursor: pointer;
}

.quality-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #6c757d;
}

.size-input {
  width: 100%;
  padding: 10px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.size-input:focus {
  outline: none;
  border-color: #007bff;
}

.setting-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.setting-checkbox input {
  width: 18px;
  height: 18px;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 200px;
}

.compress-btn {
  background: linear-gradient(145deg, #28a745, #20c997);
  color: white;
  border: none;
  padding: 15px 25px;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
}

.compress-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #20c997, #17a2b8);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
}

.compress-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-btn {
  background: linear-gradient(145deg, #6c757d, #5a6268);
  color: white;
  border: none;
  padding: 12px 25px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: linear-gradient(145deg, #5a6268, #495057);
  transform: translateY(-2px);
}

/* 结果区域 */
.results-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f8f9fa;
}

.results-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
}

.compression-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  background: #e3f2fd;
  color: #1976d2;
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.results-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: transform 0.2s ease;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.result-preview {
  flex-shrink: 0;
}

.preview-container {
  display: flex;
  align-items: center;
  gap: 15px;
}

.preview-image {
  position: relative;
  text-align: center;
}

.preview-image img {
  width: 70px;
  height: 70px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #dee2e6;
}

.image-label {
  font-size: 0.7rem;
  color: #6c757d;
  margin-top: 5px;
}

.preview-arrow {
  font-size: 1.5rem;
  color: #007bff;
  font-weight: bold;
}

.result-info {
  flex: 1;
}

.result-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 1rem;
}

.size-comparison {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.original-size {
  color: #dc3545;
}

.arrow {
  color: #6c757d;
}

.compressed-size {
  color: #28a745;
  font-weight: 600;
}

.compression-ratio {
  background: #d4edda;
  color: #155724;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.result-actions {
  flex-shrink: 0;
}

.download-btn {
  background: linear-gradient(145deg, #007bff, #0056b3);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.download-btn:hover {
  background: linear-gradient(145deg, #0056b3, #004085);
  transform: translateY(-2px);
}

.batch-actions {
  text-align: center;
  padding-top: 20px;
  border-top: 2px solid #f8f9fa;
}

.download-all-btn {
  background: linear-gradient(145deg, #17a2b8, #138496);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(23, 162, 184, 0.3);
}

.download-all-btn:hover {
  background: linear-gradient(145deg, #138496, #117a8b);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(23, 162, 184, 0.4);
}

/* 进度条 */
.progress-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  color: #495057;
  font-weight: 600;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .tool-container {
    padding: 15px;
  }
  
  .tool-title {
    font-size: 2rem;
  }
  
  .upload-area {
    padding: 30px 20px;
  }
  
  .files-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .settings-section {
    flex-direction: column;
  }
  
  .action-buttons {
    min-width: auto;
  }
  
  .result-item {
    flex-direction: column;
    text-align: center;
  }
  
  .preview-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .preview-arrow {
    transform: rotate(90deg);
  }
  
  .compression-stats {
    flex-direction: column;
    gap: 10px;
  }
}
</style>