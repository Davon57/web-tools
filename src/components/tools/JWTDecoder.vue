<template>
  <div class="jwt-decoder">
    <!-- 头部 -->
    <el-card class="header-card" shadow="hover">
      <div class="header-content">
        <h1>🔓 JWT解码器</h1>
        <p>解析并可视化JWT令牌的Header和Payload，验证令牌结构</p>
      </div>
    </el-card>

    <!-- 主要内容区域 -->
    <el-row :gutter="32" class="main-content">
      <!-- 左侧：JWT输入 -->
      <el-col :span="12">
        <el-card shadow="hover" class="input-card">
          <template #header>
            <div class="card-header">
              <span>JWT令牌输入</span>
              <el-button 
                type="danger" 
                size="small" 
                @click="clearJWT"
                :icon="Delete"
                class="clear-btn"
              >
                清空
              </el-button>
            </div>
          </template>

          <!-- JWT输入框 -->
          <el-input
            v-model="jwtToken"
            type="textarea"
            :rows="8"
            placeholder="请输入JWT令牌..."
            @input="onJWTChange"
            class="jwt-input"
          />

          <!-- JWT结构说明 -->
          <div class="jwt-structure">
            <h4>JWT结构说明</h4>
            <div class="structure-parts">
              <div class="part header-part">
                <span class="part-name">Header</span>
                <span class="part-desc">包含令牌类型和签名算法</span>
              </div>
              <div class="part-separator">.</div>
              <div class="part payload-part">
                <span class="part-name">Payload</span>
                <span class="part-desc">包含声明信息</span>
              </div>
              <div class="part-separator">.</div>
              <div class="part signature-part">
                <span class="part-name">Signature</span>
                <span class="part-desc">用于验证令牌完整性</span>
              </div>
            </div>
          </div>

          <!-- 示例按钮 -->
          <div class="example-section">
            <el-button 
              type="primary" 
              @click="loadExample"
              :icon="Document"
              class="example-btn"
            >
              加载示例JWT
            </el-button>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：解码结果 -->
      <el-col :span="12">
        <el-card shadow="hover" class="result-card">
          <template #header>
            <div class="card-header">
              <span>解码结果</span>
              <el-tag 
                :type="isValidJWT ? 'success' : 'danger'" 
                size="small"
              >
                {{ isValidJWT ? '有效格式' : '无效格式' }}
              </el-tag>
            </div>
          </template>

          <div v-if="!jwtToken.trim()" class="empty-state">
            <el-empty description="请输入JWT令牌进行解码" />
          </div>

          <div v-else-if="!isValidJWT" class="error-state">
            <el-alert
              title="JWT格式错误"
              type="error"
              :description="errorMessage"
              show-icon
              :closable="false"
            />
          </div>

          <div v-else class="decoded-content">
            <!-- Header部分 -->
            <div class="section header-section">
              <h4 class="section-title">
                <span class="section-icon">📋</span>
                Header
                <el-button 
                  size="small" 
                  @click="copyToClipboard(JSON.stringify(decodedHeader, null, 2))"
                  :icon="CopyDocument"
                  class="copy-btn"
                >
                  复制
                </el-button>
              </h4>
              <div class="json-content">
                <pre>{{ JSON.stringify(decodedHeader, null, 2) }}</pre>
              </div>
            </div>

            <!-- Payload部分 -->
            <div class="section payload-section">
              <h4 class="section-title">
                <span class="section-icon">📦</span>
                Payload
                <el-button 
                  size="small" 
                  @click="copyToClipboard(JSON.stringify(decodedPayload, null, 2))"
                  :icon="CopyDocument"
                  class="copy-btn"
                >
                  复制
                </el-button>
              </h4>
              <div class="json-content">
                <pre>{{ JSON.stringify(decodedPayload, null, 2) }}</pre>
              </div>
            </div>

            <!-- 时间信息 -->
            <div v-if="timeInfo" class="section time-section">
              <h4 class="section-title">
                <span class="section-icon">⏰</span>
                时间信息
              </h4>
              <div class="time-info">
                <div v-if="timeInfo.iat" class="time-item">
                  <span class="time-label">签发时间 (iat):</span>
                  <span class="time-value">{{ timeInfo.iat }}</span>
                </div>
                <div v-if="timeInfo.exp" class="time-item">
                  <span class="time-label">过期时间 (exp):</span>
                  <span class="time-value" :class="{ 'expired': timeInfo.isExpired }">
                    {{ timeInfo.exp }}
                    <el-tag v-if="timeInfo.isExpired" type="danger" size="small">已过期</el-tag>
                    <el-tag v-else type="success" size="small">有效</el-tag>
                  </span>
                </div>
                <div v-if="timeInfo.nbf" class="time-item">
                  <span class="time-label">生效时间 (nbf):</span>
                  <span class="time-value">{{ timeInfo.nbf }}</span>
                </div>
              </div>
            </div>

            <!-- Signature部分 -->
            <div class="section signature-section">
              <h4 class="section-title">
                <span class="section-icon">🔐</span>
                Signature
              </h4>
              <div class="signature-content">
                <el-input
                  :value="signaturePart"
                  readonly
                  type="textarea"
                  :rows="3"
                  class="signature-input"
                />
                <p class="signature-note">
                  <el-icon><InfoFilled /></el-icon>
                  签名部分需要密钥才能验证，此工具仅用于解码和查看结构
                </p>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 返回主页按钮 -->
    <div class="footer-actions">
      <el-button 
        type="info" 
        @click="goHome"
        :icon="HomeFilled"
        size="large"
        class="home-btn"
      >
        返回主页
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Delete, Document, CopyDocument, HomeFilled, InfoFilled } from '@element-plus/icons-vue'

const router = useRouter()

// 响应式数据
const jwtToken = ref('')
const decodedHeader = ref(null)
const decodedPayload = ref(null)
const signaturePart = ref('')
const errorMessage = ref('')

// 计算属性
const isValidJWT = computed(() => {
  if (!jwtToken.value.trim()) return false
  const parts = jwtToken.value.split('.')
  return parts.length === 3 && decodedHeader.value && decodedPayload.value
})

const timeInfo = computed(() => {
  if (!decodedPayload.value) return null
  
  const payload = decodedPayload.value
  const info = {}
  
  if (payload.iat) {
    info.iat = new Date(payload.iat * 1000).toLocaleString()
  }
  
  if (payload.exp) {
    const expDate = new Date(payload.exp * 1000)
    info.exp = expDate.toLocaleString()
    info.isExpired = expDate < new Date()
  }
  
  if (payload.nbf) {
    info.nbf = new Date(payload.nbf * 1000).toLocaleString()
  }
  
  return Object.keys(info).length > 0 ? info : null
})

// Base64URL解码函数
const base64UrlDecode = (str) => {
  // 添加填充
  str += new Array(5 - str.length % 4).join('=')
  // 替换URL安全字符
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  // 解码
  return decodeURIComponent(escape(atob(str)))
}

// JWT解码函数
const decodeJWT = (token) => {
  try {
    const parts = token.split('.')
    
    if (parts.length !== 3) {
      throw new Error('JWT必须包含三个部分，用点号分隔')
    }

    // 解码Header
    const headerJson = base64UrlDecode(parts[0])
    const header = JSON.parse(headerJson)
    
    // 解码Payload
    const payloadJson = base64UrlDecode(parts[1])
    const payload = JSON.parse(payloadJson)
    
    // 获取Signature部分
    const signature = parts[2]
    
    return { header, payload, signature }
  } catch (error) {
    throw new Error(`解码失败: ${error.message}`)
  }
}

// JWT输入变化处理
const onJWTChange = () => {
  if (!jwtToken.value.trim()) {
    decodedHeader.value = null
    decodedPayload.value = null
    signaturePart.value = ''
    errorMessage.value = ''
    return
  }

  try {
    const decoded = decodeJWT(jwtToken.value.trim())
    decodedHeader.value = decoded.header
    decodedPayload.value = decoded.payload
    signaturePart.value = decoded.signature
    errorMessage.value = ''
  } catch (error) {
    decodedHeader.value = null
    decodedPayload.value = null
    signaturePart.value = ''
    errorMessage.value = error.message
  }
}

// 清空JWT
const clearJWT = () => {
  jwtToken.value = ''
  decodedHeader.value = null
  decodedPayload.value = null
  signaturePart.value = ''
  errorMessage.value = ''
}

// 加载示例JWT
const loadExample = () => {
  // 示例JWT令牌
  const exampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzUwNjU2MDAsImF1ZCI6InRlc3QtYXVkaWVuY2UiLCJpc3MiOiJ0ZXN0LWlzc3VlciJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
  jwtToken.value = exampleJWT
  onJWTChange()
  ElMessage.success('已加载示例JWT令牌')
}

// 复制到剪贴板
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 返回主页
const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.jwt-decoder {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
}

.header-card {
  margin-bottom: 32px;
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  text-align: center;
  padding: 32px 24px;
}

.header-content h1 {
  margin: 0 0 12px 0;
  font-size: 2.8rem;
  color: #1a1a1a;
  font-weight: 800;
  letter-spacing: -0.8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content p {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
  line-height: 1.6;
  font-weight: 600;
  max-width: 600px;
  margin: 0 auto;
}

.main-content {
  margin-bottom: 32px;
}

.input-card, .result-card {
  border-radius: 16px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  height: fit-content;
  background: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: #ffffff;
}

.jwt-input {
  margin-bottom: 24px;
}

.jwt-structure {
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #f8f9ff 0%, #fff8f9 100%);
  border-radius: 12px;
  border: 2px solid rgba(102, 126, 234, 0.3);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.jwt-structure h4 {
  margin: 0 0 20px 0;
  color: #1a1a1a;
  font-weight: 700;
  font-size: 1.2rem;
  text-align: center;
}

.structure-parts {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.part {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 20px;
  border-radius: 12px;
  min-width: 120px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.part:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.header-part {
  background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%);
  border: 2px solid rgba(255, 107, 107, 0.3);
}

.payload-part {
  background: linear-gradient(135deg, #48cae4 0%, #0077b6 100%);
  border: 2px solid rgba(72, 202, 228, 0.3);
}

.signature-part {
  background: linear-gradient(135deg, #06ffa5 0%, #00d4aa 100%);
  border: 2px solid rgba(6, 255, 165, 0.3);
}

.part-name {
  font-weight: 700;
  color: #ffffff;
  font-size: 1rem;
  margin-bottom: 6px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.part-desc {
  font-size: 0.85rem;
  color: #ffffff;
  text-align: center;
  line-height: 1.4;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.part-separator {
  font-size: 2rem;
  font-weight: 900;
  color: #2c3e50;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.example-section {
  text-align: center;
}

.empty-state, .error-state {
  padding: 50px 20px;
  text-align: center;
}

.decoded-content {
  max-height: 650px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #667eea #f1f1f1;
}

.decoded-content::-webkit-scrollbar {
  width: 8px;
}

.decoded-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.decoded-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
}

.section {
  margin-bottom: 24px;
  padding: 24px;
  border-radius: 12px;
  border: 2px solid #e8ecf0;
  background: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.section:hover {
  border-color: #667eea;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.section-icon {
  margin-right: 10px;
  font-size: 1.3rem;
}

.copy-btn {
  margin-left: auto;
}

.json-content {
  background: linear-gradient(135deg, #f8f9ff 0%, #fff8f9 100%);
  border-radius: 8px;
  padding: 20px;
  border: 2px solid #e8ecf0;
  position: relative;
  overflow: hidden;
}

.json-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.json-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1a1a1a;
  white-space: pre-wrap;
  word-break: break-all;
  font-weight: 500;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #fff8f9 100%);
  border-radius: 10px;
  border-left: 5px solid #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  transition: all 0.3s ease;
}

.time-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.time-label {
  font-weight: 700;
  color: #1a1a1a;
  min-width: 140px;
  font-size: 0.95rem;
}

.time-value {
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 0.95rem;
}

.time-value.expired {
  color: #e74c3c;
  font-weight: 700;
}

.signature-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.signature-note {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  border-radius: 10px;
  color: #e65100;
  font-size: 0.95rem;
  border-left: 5px solid #ff9800;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
}

.footer-actions {
  text-align: center;
  padding: 32px 0;
}

/* Element Plus样式覆盖 */
:deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: none;
  padding: 24px 32px;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-card__header .card-header span) {
  color: #ffffff;
  font-weight: 800;
  font-size: 1.3rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

:deep(.el-card__body) {
  padding: 32px;
  background: #ffffff;
}

:deep(.el-textarea__inner) {
  border-radius: 10px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  border: 2px solid #e8ecf0;
  background: #ffffff;
  color: #1a1a1a;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.el-input__inner) {
  border: 2px solid #e8ecf0;
  border-radius: 8px;
  color: #1a1a1a;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-input__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}



:deep(.el-tag) {
  border-radius: 8px;
  font-weight: 700;
  padding: 6px 16px;
  font-size: 0.85rem;
  border: 2px solid transparent;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.el-tag--success) {
  background: linear-gradient(135deg, #00d4aa 0%, #06ffa5 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 212, 170, 0.3);
}

:deep(.el-tag--danger) {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

:deep(.el-alert) {
  border-radius: 12px;
  border: 2px solid;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-alert--error) {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-color: #f44336;
  color: #c62828;
}

:deep(.el-alert__title) {
  font-weight: 700;
  font-size: 1.1rem;
}

:deep(.el-alert__description) {
  font-weight: 600;
  margin-top: 8px;
}

:deep(.el-empty__description p) {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .jwt-decoder {
    padding: 20px;
  }
  
  .header-content h1 {
    font-size: 2.4rem;
  }
  
  :deep(.el-card__body) {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .jwt-decoder {
    padding: 16px;
  }
  
  .header-content {
    padding: 24px 16px;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .header-content p {
    font-size: 1rem;
  }
  
  :deep(.el-col) {
    margin-bottom: 20px;
  }
  
  .structure-parts {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .part {
    min-width: auto;
    padding: 20px;
  }
  
  .part-separator {
    transform: rotate(90deg);
    margin: 12px 0;
    font-size: 1.8rem;
  }
  
  .section {
    padding: 20px;
  }
  
  .section-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .copy-btn {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .time-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 16px;
  }
  
  .time-label {
    min-width: auto;
    font-size: 0.9rem;
  }
  
  .time-value {
    font-size: 0.9rem;
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  :deep(.el-card__header) {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .jwt-decoder {
    padding: 12px;
  }
  
  .header-content h1 {
    font-size: 1.8rem;
  }
  
  .header-content p {
    font-size: 0.95rem;
  }
  
  .section {
    padding: 16px;
  }
  
  .json-content {
    padding: 16px;
  }
  
  .json-content pre {
    font-size: 0.85rem;
  }
  
  :deep(.el-card__body) {
    padding: 16px;
  }
  
  :deep(.el-card__header) {
    padding: 16px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .jwt-decoder {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
  
  .header-card,
  .input-card,
  .result-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
  }
  
  .section {
    background: rgba(255, 255, 255, 0.98);
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .header-content h1 {
    color: #000000;
    -webkit-text-fill-color: #000000;
  }
  
  .header-content p {
    color: #000000;
  }
  
  .part-name,
  .part-desc {
    color: #000000;
    text-shadow: none;
  }
  
  .json-content pre {
    color: #000000;
  }
  
  .time-label,
  .time-value {
    color: #000000;
  }
  
  .section-title {
    color: #000000;
  }
}

/* 动画优化 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section {
  animation: fadeInUp 0.6s ease-out;
}

.part {
  animation: fadeInUp 0.6s ease-out;
}

.part:nth-child(1) { animation-delay: 0.1s; }
.part:nth-child(3) { animation-delay: 0.2s; }
.part:nth-child(5) { animation-delay: 0.3s; }

/* 打印样式 */
@media print {
  .jwt-decoder {
    background: white;
    padding: 0;
  }
  
  .header-card,
  .input-card,
  .result-card {
    box-shadow: none;
    border: 1px solid #ccc;
  }
  
  .footer-actions {
    display: none;
  }
}

/* 按钮字体大小专门设置 */
:deep(.el-button) {
  font-size: 14px !important;
}

:deep(.el-button--small) {
  font-size: 12px !important;
}

:deep(.el-button--large) {
  font-size: 16px !important;
}

/* 确保按钮文字不受容器字体大小影响 */
.clear-btn :deep(.el-button) {
  font-size: 12px !important;
}

.example-btn :deep(.el-button) {
  font-size: 14px !important;
}

.copy-btn :deep(.el-button) {
  font-size: 12px !important;
}

.footer-actions :deep(.el-button) {
  font-size: 14px !important;
}

.section:hover {
  border-color: #667eea;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.section-icon {
  margin-right: 10px;
  font-size: 1.3rem;
}

.copy-btn {
  margin-left: auto;
}

.json-content {
  background: linear-gradient(135deg, #f8f9ff 0%, #fff8f9 100%);
  border-radius: 8px;
  padding: 20px;
  border: 2px solid #e8ecf0;
  position: relative;
  overflow: hidden;
}

.json-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.json-content pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #1a1a1a;
  white-space: pre-wrap;
  word-break: break-all;
  font-weight: 500;
}

.time-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8f9ff 0%, #fff8f9 100%);
  border-radius: 10px;
  border-left: 5px solid #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
  transition: all 0.3s ease;
}

.time-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.time-label {
  font-weight: 700;
  color: #1a1a1a;
  min-width: 140px;
  font-size: 0.95rem;
}

.time-value {
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 0.95rem;
}

.time-value.expired {
  color: #e74c3c;
  font-weight: 700;
}

.signature-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.signature-note {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%);
  border-radius: 10px;
  color: #e65100;
  font-size: 0.95rem;
  border-left: 5px solid #ff9800;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(255, 152, 0, 0.1);
}

.footer-actions {
  text-align: center;
  padding: 32px 0;
}

/* Element Plus样式覆盖 */
:deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: none;
  padding: 24px 32px;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-card__header .card-header span) {
  color: #ffffff;
  font-weight: 800;
  font-size: 1.3rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

:deep(.el-card__body) {
  padding: 32px;
  background: #ffffff;
}

:deep(.el-textarea__inner) {
  border-radius: 10px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 0.95rem;
  line-height: 1.6;
  border: 2px solid #e8ecf0;
  background: #ffffff;
  color: #1a1a1a;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-textarea__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

:deep(.el-input__inner) {
  border: 2px solid #e8ecf0;
  border-radius: 8px;
  color: #1a1a1a;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-input__inner:focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}



:deep(.el-tag) {
  border-radius: 8px;
  font-weight: 700;
  padding: 6px 16px;
  font-size: 0.85rem;
  border: 2px solid transparent;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

:deep(.el-tag--success) {
  background: linear-gradient(135deg, #00d4aa 0%, #06ffa5 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 212, 170, 0.3);
}

:deep(.el-tag--danger) {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
}

:deep(.el-alert) {
  border-radius: 12px;
  border: 2px solid;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.el-alert--error) {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-color: #f44336;
  color: #c62828;
}

:deep(.el-alert__title) {
  font-weight: 700;
  font-size: 1.1rem;
}

:deep(.el-alert__description) {
  font-weight: 600;
  margin-top: 8px;
}

:deep(.el-empty__description p) {
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.1rem;
}

/* 响应式设计优化 */
@media (max-width: 1200px) {
  .jwt-decoder {
    padding: 20px;
  }
  
  .header-content h1 {
    font-size: 2.4rem;
  }
  
  :deep(.el-card__body) {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .jwt-decoder {
    padding: 16px;
  }
  
  .header-content {
    padding: 24px 16px;
  }
  
  .header-content h1 {
    font-size: 2rem;
  }
  
  .header-content p {
    font-size: 1rem;
  }
  
  :deep(.el-col) {
    margin-bottom: 20px;
  }
  
  .structure-parts {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .part {
    min-width: auto;
    padding: 20px;
  }
  
  .part-separator {
    transform: rotate(90deg);
    margin: 12px 0;
    font-size: 1.8rem;
  }
  
  .section {
    padding: 20px;
  }
  
  .section-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .copy-btn {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .time-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 16px;
  }
  
  .time-label {
    min-width: auto;
    font-size: 0.9rem;
  }
  
  .time-value {
    font-size: 0.9rem;
  }
  
  :deep(.el-card__body) {
    padding: 20px;
  }
  
  :deep(.el-card__header) {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .jwt-decoder {
    padding: 12px;
  }
  
  .header-content h1 {
    font-size: 1.8rem;
  }
  
  .header-content p {
    font-size: 0.95rem;
  }
  
  .section {
    padding: 16px;
  }
  
  .json-content {
    padding: 16px;
  }
  
  .json-content pre {
    font-size: 0.85rem;
  }
  
  :deep(.el-card__body) {
    padding: 16px;
  }
  
  :deep(.el-card__header) {
    padding: 16px;
  }
}

/* 深色模式支持 */
@media (prefers-color-scheme: dark) {
  .jwt-decoder {
    background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  }
  
  .header-card,
  .input-card,
  .result-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
  }
  
  .section {
    background: rgba(255, 255, 255, 0.98);
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .header-content h1 {
    color: #000000;
    -webkit-text-fill-color: #000000;
  }
  
  .header-content p {
    color: #000000;
  }
  
  .part-name,
  .part-desc {
    color: #000000;
    text-shadow: none;
  }
  
  .json-content pre {
    color: #000000;
  }
  
  .time-label,
  .time-value {
    color: #000000;
  }
  
  .section-title {
    color: #000000;
  }
}

/* 动画优化 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section {
  animation: fadeInUp 0.6s ease-out;
}

.part {
  animation: fadeInUp 0.6s ease-out;
}

.part:nth-child(1) { animation-delay: 0.1s; }
.part:nth-child(3) { animation-delay: 0.2s; }
.part:nth-child(5) { animation-delay: 0.3s; }

/* 打印样式 */
@media print {
  .jwt-decoder {
    background: white;
    padding: 0;
  }
  
  .header-card,
  .input-card,
  .result-card {
    box-shadow: none;
    border: 1px solid #ccc;
  }
  
  .footer-actions {
    display: none;
  }
}
</style>