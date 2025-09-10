<template>
  <div class="tool-container">
    <h2 class="tool-title">图片转Base64</h2>
    <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
      <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" style="display: none">
      <div v-if="!imagePreview" class="upload-placeholder">
        <i class="upload-icon">📁</i>
        <p>点击选择图片或拖拽图片到此处</p>
        <p class="upload-hint">支持 JPG、PNG、GIF、WebP 格式</p>
      </div>
      <div v-else class="image-preview">
        <img :src="imagePreview" alt="预览图片" />
        <button @click.stop="clearImage" class="clear-btn">×</button>
      </div>
    </div>
    
    <div v-if="base64Result" class="result-section">
      <h3>Base64结果</h3>
      <div class="result-container">
        <textarea v-model="base64Result" readonly class="result-textarea"></textarea>
        <div class="result-actions">
          <button @click="copyToClipboard" class="copy-btn">复制</button>
          <button @click="downloadResult" class="download-btn">下载</button>
        </div>
      </div>
      <div class="result-info">
        <span>大小: {{ formatFileSize(base64Result.length) }}</span>
        <span>格式: {{ imageFormat }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useToolsStore } from '@/stores/counter'

const toolsStore = useToolsStore()
const fileInput = ref(null)
const imagePreview = ref('')
const base64Result = ref('')
const imageFormat = ref('')

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processImage(file)
  }
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    processImage(file)
  }
}

const processImage = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
    base64Result.value = e.target.result
    imageFormat.value = file.type
    toolsStore.addToolHistory('图片转Base64')
  }
  reader.readAsDataURL(file)
}

const clearImage = () => {
  imagePreview.value = ''
  base64Result.value = ''
  imageFormat.value = ''
  fileInput.value.value = ''
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(base64Result.value)
    alert('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const downloadResult = () => {
  const blob = new Blob([base64Result.value], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'base64-result.txt'
  a.click()
  URL.revokeObjectURL(url)
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.tool-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.tool-title {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.upload-area {
  border: 2px dashed #3498db;
  border-radius: 10px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.upload-area:hover {
  border-color: #2980b9;
  background: #e3f2fd;
}

.upload-placeholder {
  color: #7f8c8d;
}

.upload-icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.upload-hint {
  font-size: 14px;
  color: #95a5a6;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.image-preview img {
  max-width: 300px;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.clear-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.result-section {
  margin-top: 30px;
}

.result-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.result-container {
  position: relative;
}

.result-textarea {
  width: 100%;
  height: 200px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  resize: vertical;
  background: #f8f9fa;
}

.result-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.copy-btn, .download-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.copy-btn {
  background: #3498db;
  color: white;
}

.copy-btn:hover {
  background: #2980b9;
}

.download-btn {
  background: #27ae60;
  color: white;
}

.download-btn:hover {
  background: #229954;
}

.result-info {
  margin-top: 10px;
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #7f8c8d;
}
</style>