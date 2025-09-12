<template>
  <div class="tool-container">
    <div class="tool-header">
      <button @click="$router.push('/')" class="back-btn">← 返回主页</button>
      <h2 class="tool-title">图片转Base64</h2>
    </div>
    
    <div class="converter-content">
      <div class="converter-left">
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
      </div>
      
      <div class="converter-right">
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
  width: 100vw;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
}

.tool-header {
  position: relative;
  text-align: center;
  margin-bottom: 30px;
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
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.back-btn:hover {
  background: linear-gradient(145deg, #5a6268, #495057);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(108, 117, 125, 0.4);
}

.tool-title {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.converter-content {
  display: flex;
  gap: 30px;
  flex: 1;
  min-height: 0;
}

.converter-left {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.converter-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.upload-area {
  border: 3px dashed rgba(0, 123, 255, 0.4);
  border-radius: 20px;
  padding: 60px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(145deg, rgba(248, 249, 250, 0.9), rgba(233, 236, 239, 0.9));
  backdrop-filter: blur(10px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.upload-area:hover {
  border-color: rgba(0, 123, 255, 0.8);
  background: linear-gradient(145deg, rgba(227, 242, 253, 0.9), rgba(187, 222, 251, 0.9));
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 123, 255, 0.2);
}

.upload-placeholder {
  color: #6c757d;
}

.upload-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.upload-hint {
  font-size: 1.1rem;
  color: #6c757d;
  font-weight: 500;
  margin-top: 10px;
}

.image-preview {
  position: relative;
  display: inline-block;
}

.image-preview img {
  max-width: 400px;
  max-height: 400px;
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border: 3px solid rgba(255, 255, 255, 0.5);
  transition: all 0.3s ease;
}

.clear-btn {
  position: absolute;
  top: -15px;
  right: -15px;
  background: linear-gradient(145deg, #dc3545, #c82333);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
  box-shadow: 0 5px 15px rgba(220, 53, 69, 0.3);
  transition: all 0.3s ease;
}

.result-section {
  padding: 30px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-section h3 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.result-container {
  position: relative;
}

.result-textarea {
  width: 100%;
  flex: 1;
  min-height: 200px;
  padding: 20px;
  border: 2px solid rgba(0, 123, 255, 0.2);
  border-radius: 15px;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  background: linear-gradient(145deg, rgba(248, 249, 250, 0.9), rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(5px);
  box-shadow: inset 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.result-actions {
  margin-top: 20px;
  display: flex;
  gap: 15px;
  justify-content: flex-start;
}

.copy-btn, .download-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
}

.copy-btn {
  background: linear-gradient(145deg, #007bff, #0056b3);
  color: white;
}

.copy-btn:hover {
  background: linear-gradient(145deg, #0056b3, #004085);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 123, 255, 0.3);
}

.download-btn {
  background: linear-gradient(145deg, #28a745, #1e7e34);
  color: white;
}

.download-btn:hover {
  background: linear-gradient(145deg, #1e7e34, #155724);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 25px rgba(40, 167, 69, 0.3);
}

.result-info {
  margin-top: 20px;
  display: flex;
  gap: 30px;
  font-size: 1rem;
  color: #6c757d;
  font-weight: 500;
  padding: 15px;
  background: linear-gradient(145deg, rgba(233, 236, 239, 0.5), rgba(248, 249, 250, 0.5));
  border-radius: 12px;
  border: 1px solid rgba(0, 123, 255, 0.1);
}

@media (max-width: 768px) {
  .tool-container {
    padding: 15px;
  }

  .converter-content {
    flex-direction: column;
    gap: 20px;
  }

  .converter-left,
  .converter-right {
    flex: none;
  }

  .upload-area {
    padding: 40px 20px;
  }

  .tool-title {
    font-size: 2rem;
  }

  .result-textarea {
    min-height: 150px;
  }
}
</style>