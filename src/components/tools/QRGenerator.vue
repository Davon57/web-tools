<template>
  <div class="qr-generator">
    <div class="generator-container">
      <div class="tool-header">
        <button @click="$router.push('/')" class="back-btn">← 返回主页</button>
        <h2 class="tool-title">📱 二维码生成器</h2>
        <p class="tool-description">快速生成各种类型的二维码，支持文本、网址、WiFi、联系人等</p>
      </div>
      
      <div class="generator-body">
        <!-- 左侧：输入控制区域 -->
        <div class="generator-left">
          <!-- 二维码类型选择 -->
          <div class="type-selector">
            <h3>选择二维码类型</h3>
            <div class="type-buttons">
              <button 
                v-for="type in qrTypes" 
                :key="type.key"
                @click="selectType(type.key)"
                :class="['type-btn', { active: selectedType === type.key }]"
              >
                {{ type.icon }} {{ type.name }}
              </button>
            </div>
          </div>
          
          <!-- 输入区域 -->
          <div class="input-section">
            <!-- 文本类型 -->
          <div v-if="selectedType === 'text'" class="input-group">
            <label>输入文本内容</label>
            <textarea 
              v-model="textContent" 
              placeholder="输入要生成二维码的文本内容..."
              @input="generateQR"
              class="text-input"
            ></textarea>
          </div>
          
          <!-- 网址类型 -->
          <div v-if="selectedType === 'url'" class="input-group">
            <label>输入网址</label>
            <input 
              v-model="urlContent" 
              type="url" 
              placeholder="https://example.com"
              @input="generateQR"
              class="url-input"
            >
          </div>
          
          <!-- WiFi类型 -->
          <div v-if="selectedType === 'wifi'" class="wifi-form">
            <div class="form-row">
              <div class="input-group">
                <label>网络名称 (SSID)</label>
                <input 
                  v-model="wifiData.ssid" 
                  type="text" 
                  placeholder="WiFi网络名称"
                  @input="generateQR"
                >
              </div>
              <div class="input-group">
                <label>密码</label>
                <input 
                  v-model="wifiData.password" 
                  type="text" 
                  placeholder="WiFi密码"
                  @input="generateQR"
                >
              </div>
            </div>
            <div class="form-row">
              <div class="input-group">
                <label>加密类型</label>
                <select v-model="wifiData.security" @change="generateQR">
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">无密码</option>
                </select>
              </div>
              <div class="input-group">
                <label class="checkbox-label">
                  <input 
                    v-model="wifiData.hidden" 
                    type="checkbox" 
                    @change="generateQR"
                  >
                  隐藏网络
                </label>
              </div>
            </div>
          </div>
          
          <!-- 联系人类型 -->
          <div v-if="selectedType === 'contact'" class="contact-form">
            <div class="form-row">
              <div class="input-group">
                <label>姓名</label>
                <input 
                  v-model="contactData.name" 
                  type="text" 
                  placeholder="联系人姓名"
                  @input="generateQR"
                >
              </div>
              <div class="input-group">
                <label>电话</label>
                <input 
                  v-model="contactData.phone" 
                  type="tel" 
                  placeholder="电话号码"
                  @input="generateQR"
                >
              </div>
            </div>
            <div class="form-row">
              <div class="input-group">
                <label>邮箱</label>
                <input 
                  v-model="contactData.email" 
                  type="email" 
                  placeholder="邮箱地址"
                  @input="generateQR"
                >
              </div>
              <div class="input-group">
                <label>公司</label>
                <input 
                  v-model="contactData.organization" 
                  type="text" 
                  placeholder="公司名称"
                  @input="generateQR"
                >
              </div>
            </div>
            <div class="input-group">
              <label>地址</label>
              <textarea 
                v-model="contactData.address" 
                placeholder="联系地址"
                @input="generateQR"
                rows="2"
              ></textarea>
            </div>
          </div>
          
          <!-- 邮件类型 -->
          <div v-if="selectedType === 'email'" class="email-form">
            <div class="form-row">
              <div class="input-group">
                <label>收件人</label>
                <input 
                  v-model="emailData.to" 
                  type="email" 
                  placeholder="收件人邮箱"
                  @input="generateQR"
                >
              </div>
              <div class="input-group">
                <label>主题</label>
                <input 
                  v-model="emailData.subject" 
                  type="text" 
                  placeholder="邮件主题"
                  @input="generateQR"
                >
              </div>
            </div>
            <div class="input-group">
              <label>邮件内容</label>
              <textarea 
                v-model="emailData.body" 
                placeholder="邮件正文内容..."
                @input="generateQR"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>
        <!-- input-section 闭合 -->
        </div>
        
        <!-- 右侧：二维码预览和历史记录 -->
        <div class="generator-right">
          <!-- 二维码显示和设置 -->
          <div class="qr-display-section">
            <div class="qr-settings">
            <h3>二维码设置</h3>
            <div class="settings-row">
              <div class="setting-group">
                <label>尺寸</label>
                <select v-model="qrSettings.size" @change="generateQR">
                  <option value="200">小 (200x200)</option>
                  <option value="300">中 (300x300)</option>
                  <option value="400">大 (400x400)</option>
                  <option value="500">超大 (500x500)</option>
                </select>
              </div>
              <div class="setting-group">
                <label>容错级别</label>
                <select v-model="qrSettings.errorLevel" @change="generateQR">
                  <option value="L">低 (7%)</option>
                  <option value="M">中 (15%)</option>
                  <option value="Q">较高 (25%)</option>
                  <option value="H">高 (30%)</option>
                </select>
              </div>
            </div>
            <div class="settings-row">
              <div class="setting-group">
                <label>前景色</label>
                <input 
                  v-model="qrSettings.foreground" 
                  type="color" 
                  @change="generateQR"
                  class="color-input"
                >
              </div>
              <div class="setting-group">
                <label>背景色</label>
                <input 
                  v-model="qrSettings.background" 
                  type="color" 
                  @change="generateQR"
                  class="color-input"
                >
              </div>
            </div>
          </div>
          
          <!-- 二维码预览 -->
          <div class="qr-preview">
            <div class="qr-container" v-if="qrDataURL">
              <img :src="qrDataURL" :alt="'二维码'" class="qr-image">
              <div class="qr-actions">
                <button @click="downloadQR" class="download-btn">
                  📥 下载二维码
                </button>
                <button @click="copyQRToClipboard" class="copy-btn">
                  📋 复制图片
                </button>
              </div>
            </div>
            <div v-else class="qr-placeholder">
              <div class="placeholder-content">
                <div class="placeholder-icon">📱</div>
                <p>请输入内容生成二维码</p>
              </div>
            </div>
          </div>
          
          <!-- 生成历史 -->
          <div class="history-section" v-if="qrHistory.length > 0">
            <h3>生成历史</h3>
            <div class="history-list">
              <div 
                v-for="(record, index) in qrHistory.slice(-6)" 
                :key="index"
                class="history-item"
                @click="useHistoryRecord(record)"
              >
                <div class="history-qr">
                  <img :src="record.dataURL" alt="历史二维码" class="history-qr-image">
                </div>
                <div class="history-info">
                  <div class="history-type">{{ getTypeName(record.type) }}</div>
                  <div class="history-content">{{ record.preview }}</div>
                  <div class="history-time">{{ formatTime(record.timestamp) }}</div>
                </div>
              </div>
            </div>
            <button @click="clearHistory" class="clear-history-btn">清空历史</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const selectedType = ref('text')
const textContent = ref('')
const urlContent = ref('')
const qrDataURL = ref('')
const qrHistory = ref([])

const wifiData = ref({
  ssid: '',
  password: '',
  security: 'WPA',
  hidden: false
})

const contactData = ref({
  name: '',
  phone: '',
  email: '',
  organization: '',
  address: ''
})

const emailData = ref({
  to: '',
  subject: '',
  body: ''
})

const qrSettings = ref({
  size: 300,
  errorLevel: 'M',
  foreground: '#000000',
  background: '#ffffff'
})

const qrTypes = [
  { key: 'text', name: '文本', icon: '📝' },
  { key: 'url', name: '网址', icon: '🔗' },
  { key: 'wifi', name: 'WiFi', icon: '📶' },
  { key: 'contact', name: '联系人', icon: '👤' },
  { key: 'email', name: '邮件', icon: '📧' }
]

const selectType = (type) => {
  selectedType.value = type
  generateQR()
}

const getCurrentContent = () => {
  switch (selectedType.value) {
    case 'text':
      return textContent.value
    case 'url':
      return urlContent.value
    case 'wifi':
      return `WIFI:T:${wifiData.value.security};S:${wifiData.value.ssid};P:${wifiData.value.password};H:${wifiData.value.hidden ? 'true' : 'false'};;`
    case 'contact':
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${contactData.value.name}\nTEL:${contactData.value.phone}\nEMAIL:${contactData.value.email}\nORG:${contactData.value.organization}\nADR:${contactData.value.address}\nEND:VCARD`
    case 'email':
      return `mailto:${emailData.value.to}?subject=${encodeURIComponent(emailData.value.subject)}&body=${encodeURIComponent(emailData.value.body)}`
    default:
      return ''
  }
}

const getPreviewContent = () => {
  switch (selectedType.value) {
    case 'text':
      return textContent.value.substring(0, 50) + (textContent.value.length > 50 ? '...' : '')
    case 'url':
      return urlContent.value
    case 'wifi':
      return `WiFi: ${wifiData.value.ssid}`
    case 'contact':
      return `联系人: ${contactData.value.name}`
    case 'email':
      return `邮件: ${emailData.value.to}`
    default:
      return ''
  }
}

const generateQR = async () => {
  const content = getCurrentContent()
  if (!content.trim()) {
    qrDataURL.value = ''
    return
  }
  
  try {
    // 使用 QR Server API 生成二维码
    const params = new URLSearchParams({
      data: content,
      size: `${qrSettings.value.size}x${qrSettings.value.size}`,
      ecc: qrSettings.value.errorLevel,
      color: qrSettings.value.foreground.replace('#', ''),
      bgcolor: qrSettings.value.background.replace('#', '')
    })
    
    const url = `https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`
    qrDataURL.value = url
    
    // 添加到历史记录
    const historyRecord = {
      type: selectedType.value,
      content: content,
      preview: getPreviewContent(),
      dataURL: url,
      timestamp: Date.now(),
      settings: { ...qrSettings.value }
    }
    
    // 避免重复添加相同内容
    const existingIndex = qrHistory.value.findIndex(item => 
      item.type === selectedType.value && item.content === content
    )
    
    if (existingIndex >= 0) {
      qrHistory.value.splice(existingIndex, 1)
    }
    
    qrHistory.value.push(historyRecord)
    
    // 限制历史记录数量
    if (qrHistory.value.length > 20) {
      qrHistory.value = qrHistory.value.slice(-20)
    }
    
  } catch (error) {
    console.error('生成二维码失败:', error)
  }
}

const downloadQR = () => {
  if (!qrDataURL.value) return
  
  const link = document.createElement('a')
  link.href = qrDataURL.value
  link.download = `qrcode-${selectedType.value}-${Date.now()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const copyQRToClipboard = async () => {
  if (!qrDataURL.value) return
  
  try {
    const response = await fetch(qrDataURL.value)
    const blob = await response.blob()
    
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ])
      alert('二维码已复制到剪贴板')
    } else {
      // 降级方案：复制链接
      await navigator.clipboard.writeText(qrDataURL.value)
      alert('二维码链接已复制到剪贴板')
    }
  } catch (error) {
    console.error('复制失败:', error)
    alert('复制失败，请手动保存图片')
  }
}

const useHistoryRecord = (record) => {
  selectedType.value = record.type
  qrSettings.value = { ...record.settings }
  
  // 根据类型设置对应的数据
  switch (record.type) {
    case 'text':
      textContent.value = record.content
      break
    case 'url':
      urlContent.value = record.content
      break
    // WiFi, contact, email 的数据恢复比较复杂，这里简化处理
    default:
      break
  }
  
  qrDataURL.value = record.dataURL
}

const getTypeName = (type) => {
  const typeObj = qrTypes.find(t => t.key === type)
  return typeObj ? typeObj.name : type
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) {
    return '刚刚'
  } else if (diff < 3600000) {
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) {
    return `${Math.floor(diff / 3600000)}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

const clearHistory = () => {
  qrHistory.value = []
}

onMounted(() => {
  // 默认生成示例二维码
  textContent.value = '欢迎使用二维码生成器！'
  generateQR()
})
</script>

<style scoped>
.qr-generator {
  padding: 20px;
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-sizing: border-box;
}

.generator-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
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
  font-size: 2.5em;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 700;
  letter-spacing: 1px;
}

.tool-description {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 30px;
}

.generator-body {
  display: flex;
  gap: 30px;
  flex: 1;
  min-height: 0;
}

.generator-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.generator-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.type-selector {
  margin-bottom: 30px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  padding: 30px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.type-selector h3 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.5em;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

.type-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 15px;
}

.type-btn {
  padding: 15px 20px;
  border: 2px solid #dee2e6;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 12px;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.type-btn:hover {
  border-color: #007bff;
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 25px rgba(0, 123, 255, 0.2);
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
}

.type-btn.active {
  border-color: #007bff;
  background: linear-gradient(145deg, #e7f3ff, #cce7ff);
  color: #0056b3;
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.25);
  transform: translateY(-2px);
}

.input-section {
  margin-bottom: 30px;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  color: #495057;
  margin-bottom: 8px;
  font-weight: 500;
}

.text-input,
.url-input,
input[type="text"],
input[type="email"],
input[type="tel"],
textarea,
select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #ced4da;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
}

.text-input {
  min-height: 100px;
  resize: vertical;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.15), inset 0 2px 5px rgba(0, 0, 0, 0.05);
  background: #ffffff;
  transform: translateY(-1px);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 25px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.qr-display-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  padding: 25px;
  border-radius: 15px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.qr-settings h3 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.5em;
  font-weight: 600;
  border-bottom: 2px solid #e9ecef;
  padding-bottom: 10px;
}

.settings-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  color: #495057;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.color-input {
  width: 100%;
  height: 40px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
}

.qr-preview {
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-container {
  text-align: center;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  padding: 25px;
  border-radius: 15px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.qr-image {
  max-width: 100%;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.qr-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.download-btn,
.copy-btn {
  padding: 12px 24px;
  margin: 0 8px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.download-btn {
  background: linear-gradient(145deg, #28a745, #20c997);
  color: white;
}

.download-btn:hover {
  background: linear-gradient(145deg, #20c997, #17a2b8);
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 10px 25px rgba(40, 167, 69, 0.3);
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

.qr-placeholder {
  width: 300px;
  height: 300px;
  border: 2px dashed #bdc3c7;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-content {
  text-align: center;
  color: #7f8c8d;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.history-section {
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 15px;
  padding: 25px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.history-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.history-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
}

.history-item:hover {
  background: #e3f2fd;
  border-color: #3498db;
}

.history-qr {
  flex-shrink: 0;
}

.history-qr-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-type {
  font-size: 12px;
  color: #3498db;
  font-weight: 500;
  margin-bottom: 4px;
}

.history-content {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-time {
  font-size: 12px;
  color: #7f8c8d;
}

.clear-history-btn {
  width: 100%;
  padding: 10px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s ease;
}

.clear-history-btn:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
  .qr-generator {
    padding: 15px;
  }
  
  .generator-container {
    padding: 20px;
    height: calc(100vh - 30px);
  }
  
  .generator-body {
    flex-direction: column;
    gap: 20px;
  }
  
  .generator-left,
  .generator-right {
    flex: none;
  }
  
  .generator-right {
    max-height: 50vh;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .settings-row {
    grid-template-columns: 1fr;
  }
  
  .type-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .qr-actions {
    flex-direction: column;
  }
}
</style>