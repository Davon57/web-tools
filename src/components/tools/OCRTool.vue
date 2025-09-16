<template>
  <div class="ocr-tool">
    <!-- 返回主页按钮 -->
    <div class="header">
      <button @click="$router.push('/')" class="back-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        返回主页
      </button>
    </div>

    <!-- 工具标题 -->
    <div class="tool-header">
      <h1>OCR 文字识别</h1>
      <p>上传图片，自动识别其中的文字内容</p>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 图片上传区域 -->
      <div class="upload-section">
        <div 
          class="upload-area" 
          :class="{ 'drag-over': isDragOver, 'has-image': selectedImage }"
          @drop="handleDrop"
          @dragover.prevent="isDragOver = true"
          @dragleave="isDragOver = false"
          @click="triggerFileInput"
        >
          <input 
            ref="fileInput" 
            type="file" 
            accept="image/*" 
            @change="handleFileSelect" 
            style="display: none"
          >
          
          <div v-if="!selectedImage" class="upload-placeholder">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
            <p>点击或拖拽图片到此处</p>
            <span>支持 JPG、PNG、GIF 等格式</span>
          </div>

          <div v-else class="image-preview">
            <img :src="imagePreview" alt="预览图片" />
            <button @click.stop="clearImage" class="clear-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- 语言选择 -->
        <div class="language-section">
          <label>识别语言：</label>
          <select v-model="selectedLanguage" class="language-select">
            <option value="eng">英文</option>
            <option value="chi_sim">简体中文</option>
            <option value="chi_tra">繁体中文</option>
            <option value="jpn">日文</option>
            <option value="kor">韩文</option>
            <option value="fra">法文</option>
            <option value="deu">德文</option>
            <option value="spa">西班牙文</option>
          </select>
        </div>

        <!-- 识别按钮 -->
        <button 
          @click="performOCR" 
          :disabled="!selectedImage || isProcessing"
          class="ocr-btn"
        >
          <svg v-if="isProcessing" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="loading">
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          {{ isProcessing ? '识别中...' : '开始识别' }}
        </button>
      </div>

      <!-- 结果显示区域 -->
      <div class="result-section" v-if="ocrResult || isProcessing">
        <div class="result-header">
          <h3>识别结果</h3>
          <div class="result-actions" v-if="ocrResult && !isProcessing">
            <button @click="copyResult" class="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              复制
            </button>
            <button @click="downloadResult" class="action-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              下载
            </button>
          </div>
        </div>

        <div class="result-content">
          <div v-if="isProcessing" class="processing-status">
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: progress + '%' }"></div>
            </div>
            <p>{{ progressText }}</p>
          </div>

          <textarea 
            v-else-if="ocrResult"
            v-model="editableResult"
            class="result-text"
            placeholder="识别结果将显示在这里..."
            rows="10"
          ></textarea>

          <div v-if="confidence && !isProcessing" class="confidence-info">
            <span>识别置信度: {{ Math.round(confidence) }}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { createWorker } from 'tesseract.js'

export default {
  name: 'OCRTool',
  setup() {
    const selectedImage = ref(null)
    const imagePreview = ref('')
    const isDragOver = ref(false)
    const fileInput = ref(null)
    const selectedLanguage = ref('eng')
    const isProcessing = ref(false)
    const ocrResult = ref('')
    const editableResult = ref('')
    const confidence = ref(0)
    const progress = ref(0)
    const progressText = ref('')

    // 触发文件选择
    const triggerFileInput = () => {
      fileInput.value.click()
    }

    // 处理文件选择
    const handleFileSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        processFile(file)
      }
    }

    // 处理拖拽上传
    const handleDrop = (event) => {
      event.preventDefault()
      isDragOver.value = false
      
      const files = event.dataTransfer.files
      if (files.length > 0) {
        processFile(files[0])
      }
    }

    // 处理文件
    const processFile = (file) => {
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }

      selectedImage.value = file
      
      // 创建预览
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview.value = e.target.result
      }
      reader.readAsDataURL(file)
    }

    // 清除图片
    const clearImage = () => {
      selectedImage.value = null
      imagePreview.value = ''
      ocrResult.value = ''
      editableResult.value = ''
      confidence.value = 0
      if (fileInput.value) {
        fileInput.value.value = ''
      }
    }

    // 执行OCR识别
    const performOCR = async () => {
      if (!selectedImage.value) return

      isProcessing.value = true
      progress.value = 0
      progressText.value = '初始化识别引擎...'

      try {
        const worker = await createWorker(selectedLanguage.value, 1, {
          logger: m => {
            if (m.status === 'recognizing text') {
              progress.value = Math.round(m.progress * 100)
              progressText.value = `识别中... ${progress.value}%`
            } else {
              progressText.value = m.status
            }
          }
        })

        const { data: { text, confidence: conf } } = await worker.recognize(selectedImage.value)
        
        ocrResult.value = text
        editableResult.value = text
        confidence.value = conf

        await worker.terminate()
      } catch (error) {
        console.error('OCR识别失败:', error)
        alert('识别失败，请重试')
      } finally {
        isProcessing.value = false
        progress.value = 0
        progressText.value = ''
      }
    }

    // 复制结果
    const copyResult = async () => {
      try {
        await navigator.clipboard.writeText(editableResult.value)
        alert('已复制到剪贴板')
      } catch (error) {
        console.error('复制失败:', error)
        alert('复制失败')
      }
    }

    // 下载结果
    const downloadResult = () => {
      const blob = new Blob([editableResult.value], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ocr-result-${new Date().getTime()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    return {
      selectedImage,
      imagePreview,
      isDragOver,
      fileInput,
      selectedLanguage,
      isProcessing,
      ocrResult,
      editableResult,
      confidence,
      progress,
      progressText,
      triggerFileInput,
      handleFileSelect,
      handleDrop,
      clearImage,
      performOCR,
      copyResult,
      downloadResult
    }
  }
}
</script>

<style scoped>
.ocr-tool {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.tool-header {
  text-align: center;
  margin-bottom: 40px;
  color: white;
}

.tool-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.tool-header p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  align-items: start;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

.upload-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  position: relative;
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-area.has-image {
  padding: 0;
  border: none;
}

.upload-placeholder svg {
  color: #999;
  margin-bottom: 15px;
}

.upload-placeholder p {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 5px;
}

.upload-placeholder span {
  color: #666;
  font-size: 0.9rem;
}

.image-preview {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  max-height: 300px;
  object-fit: contain;
  display: block;
}

.clear-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: scale(1.1);
}

.language-section {
  margin-bottom: 20px;
}

.language-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.language-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background: white;
}

.ocr-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.ocr-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.ocr-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.result-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-header h3 {
  color: #333;
  margin: 0;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.action-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.processing-status {
  text-align: center;
  padding: 20px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.processing-status p {
  color: #666;
  margin: 0;
}

.result-text {
  width: 100%;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  min-height: 200px;
  font-family: inherit;
}

.confidence-info {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  text-align: center;
  color: #666;
  font-size: 14px;
}
</style>