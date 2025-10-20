<template>
  <div class="password-strength-checker">
    <!-- 头部 -->
    <el-card class="header-card" shadow="hover">
      <div class="header-content">
        <h1>🔐 密码强度检测工具</h1>
        <p>实时评估密码安全性，提供专业的强度分析和改进建议</p>
      </div>
    </el-card>

    <!-- 主要内容区域 -->
    <el-row :gutter="32" class="main-content">
      <!-- 左侧：密码输入和检测 -->
      <el-col :span="16">
        <el-card shadow="hover" class="input-card">
          <template #header>
            <div class="card-header">
              <span>密码检测</span>
              <el-button 
                type="danger" 
                size="small" 
                @click="clearPassword"
                :icon="Delete"
                class="clear-password-btn"
              >
                清空
              </el-button>
            </div>
          </template>

          <!-- 密码输入框 -->
          <el-input
            v-model="password"
            type="password"
            placeholder="请输入要检测的密码..."
            size="large"
            show-password
            clearable
            @input="onPasswordChange"
            class="password-input"
          />

          <!-- 密码强度指示器 -->
          <div v-if="password" class="strength-section">
            <div class="strength-header">
              <span class="strength-label">密码强度：</span>
              <el-tag 
                :type="strengthTagType" 
                size="large"
                class="strength-tag"
              >
                {{ strengthLevel }}
              </el-tag>
            </div>
            
            <el-progress 
              :percentage="strengthPercentage"
              :color="strengthColor"
              :stroke-width="8"
              class="strength-progress"
            />

            <!-- 简单分析信息 -->
            <div class="simple-analysis">
              <div class="analysis-info">
                <span class="info-item">长度: {{ password.length }}位</span>
                <span class="info-item">包含: {{ getPasswordComposition() }}</span>
              </div>
            </div>
          </div>

          <!-- 简单改进建议 -->
          <div v-if="suggestions.length > 0" class="simple-suggestions">
            <h4>改进建议：</h4>
            <ul class="suggestion-list">
              <li v-for="(suggestion, index) in suggestions.slice(0, 3)" :key="index">
                {{ suggestion }}
              </li>
            </ul>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：密码生成器 -->
      <el-col :span="8">
        <el-card shadow="hover" class="generator-card">
          <template #header>
            <div class="card-header">
              <span>密码生成器</span>
            </div>
          </template>

          <!-- 生成按钮 -->
          <div class="generator-buttons">
            <el-row :gutter="12">
              <el-col :span="12">
                <el-button 
                  type="primary" 
                  size="large"
                  @click="generateSimplePassword"
                  :icon="Refresh"
                  class="generate-btn"
                >
                  生成密码
                </el-button>
              </el-col>
              <el-col :span="12">
                <el-button 
                  type="success" 
                  size="large"
                  @click="generateStrongPassword"
                  :icon="Lock"
                  class="generate-btn"
                >
                  生成强密码
                </el-button>
              </el-col>
            </el-row>
          </div>

          <!-- 生成的密码显示 -->
          <div v-if="generatedPassword" class="generated-password-section">
            <h4>生成的密码</h4>
            <el-input
              v-model="generatedPassword"
              readonly
              size="large"
              class="generated-input"
            >
              <template #append>
                <el-button 
                  @click="copyPassword"
                  :icon="CopyDocument"
                  type="primary"
                >
                  复制
                </el-button>
                <el-button 
                  @click="useGeneratedPassword"
                  :icon="Check"
                  type="success"
                >
                  使用
                </el-button>
              </template>
            </el-input>
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
import { 
  Delete, 
  View, 
  Hide, 
  Refresh, 
  Lock, 
  Setting, 
  CopyDocument, 
  Check, 
  Close, 
  HomeFilled,
  InfoFilled
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 响应式数据
const password = ref('')
const generatedPassword = ref('')

// 密码分析结果
const analysisResults = ref([])
const suggestions = ref([])

// 计算属性
const strengthLevel = computed(() => {
  if (!password.value) return '未检测'
  
  const score = calculatePasswordScore(password.value)
  if (score >= 80) return '强'
  if (score >= 60) return '中等'
  if (score >= 40) return '较弱'
  return '弱'
})

const strengthPercentage = computed(() => {
  if (!password.value) return 0
  return Math.min(100, calculatePasswordScore(password.value))
})

const strengthTagType = computed(() => {
  const level = strengthLevel.value
  if (level === '强') return 'success'
  if (level === '中等') return 'warning'
  if (level === '较弱') return 'danger'
  return 'info'
})

const strengthColor = computed(() => {
  const level = strengthLevel.value
  if (level === '强') return '#67C23A'
  if (level === '中等') return '#E6A23C'
  if (level === '较弱') return '#F56C6C'
  return '#909399'
})

// 密码强度计算函数
const calculatePasswordScore = (pwd) => {
  let score = 0
  
  // 长度评分 (最高30分)
  if (pwd.length >= 12) score += 30
  else if (pwd.length >= 8) score += 20
  else if (pwd.length >= 6) score += 10
  else score += 5
  
  // 字符多样性评分 (最高40分)
  const hasLower = /[a-z]/.test(pwd)
  const hasUpper = /[A-Z]/.test(pwd)
  const hasNumbers = /\d/.test(pwd)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
  
  const charTypes = [hasLower, hasUpper, hasNumbers, hasSpecial].filter(Boolean).length
  score += charTypes * 10
  
  // 复杂度评分 (最高30分)
  if (pwd.length > 0) {
    const uniqueChars = new Set(pwd).size
    const complexity = uniqueChars / pwd.length
    score += Math.floor(complexity * 30)
  }
  
  // 常见模式检测 (扣分)
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc/i,
    /(.)\1{2,}/, // 连续重复字符
  ]
  
  commonPatterns.forEach(pattern => {
    if (pattern.test(pwd)) score -= 10
  })
  
  return Math.max(0, Math.min(100, score))
}

// 分析密码详情
const analyzePassword = (pwd) => {
  const results = []
  const suggestionList = []
  
  // 长度检查
  const lengthPassed = pwd.length >= 8
  results.push({
    name: '密码长度',
    passed: lengthPassed,
    description: lengthPassed ? `长度为 ${pwd.length} 字符，符合要求` : `长度为 ${pwd.length} 字符，建议至少8位`
  })
  if (!lengthPassed) {
    suggestionList.push('增加密码长度至少8位字符')
  }
  
  // 字符类型检查
  const hasLower = /[a-z]/.test(pwd)
  const hasUpper = /[A-Z]/.test(pwd)
  const hasNumbers = /\d/.test(pwd)
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
  
  results.push({
    name: '小写字母',
    passed: hasLower,
    description: hasLower ? '包含小写字母' : '缺少小写字母'
  })
  if (!hasLower) suggestionList.push('添加小写字母 (a-z)')
  
  results.push({
    name: '大写字母',
    passed: hasUpper,
    description: hasUpper ? '包含大写字母' : '缺少大写字母'
  })
  if (!hasUpper) suggestionList.push('添加大写字母 (A-Z)')
  
  results.push({
    name: '数字',
    passed: hasNumbers,
    description: hasNumbers ? '包含数字' : '缺少数字'
  })
  if (!hasNumbers) suggestionList.push('添加数字 (0-9)')
  
  results.push({
    name: '特殊字符',
    passed: hasSpecial,
    description: hasSpecial ? '包含特殊字符' : '缺少特殊字符'
  })
  if (!hasSpecial) suggestionList.push('添加特殊字符 (!@#$%^&*等)')
  
  // 常见模式检查
  const hasCommonPattern = /123456|password|qwerty|abc/i.test(pwd)
  results.push({
    name: '避免常见模式',
    passed: !hasCommonPattern,
    description: hasCommonPattern ? '包含常见的不安全模式' : '未发现常见的不安全模式'
  })
  if (hasCommonPattern) {
    suggestionList.push('避免使用常见的密码模式如123456、password等')
  }
  
  // 重复字符检查
  const hasRepeating = /(.)\1{2,}/.test(pwd)
  results.push({
    name: '避免重复字符',
    passed: !hasRepeating,
    description: hasRepeating ? '包含连续重复字符' : '无连续重复字符'
  })
  if (hasRepeating) {
    suggestionList.push('避免连续重复相同字符')
  }
  
  analysisResults.value = results
  suggestions.value = suggestionList
}

// 密码生成函数
const generatePassword = (config) => {
  const charSets = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  }
  
  // 排除相似字符
  if (config.excludeSimilar) {
    charSets.lowercase = charSets.lowercase.replace(/[oil]/g, '')
    charSets.uppercase = charSets.uppercase.replace(/[OIL]/g, '')
    charSets.numbers = charSets.numbers.replace(/[01]/g, '')
  }
  
  // 排除歧义字符
  if (config.excludeAmbiguous) {
    charSets.symbols = charSets.symbols.replace(/[{}[\]()\/\\~,;.<>]/g, '')
  }
  
  let charset = ''
  const requiredChars = []
  
  // 构建字符集并确保每种类型至少有一个字符
  config.charTypes.forEach(type => {
    if (charSets[type]) {
      charset += charSets[type]
      const chars = charSets[type]
      requiredChars.push(chars[Math.floor(Math.random() * chars.length)])
    }
  })
  
  if (!charset) {
    ElMessage.error('请至少选择一种字符类型')
    return ''
  }
  
  let result = requiredChars.join('')
  
  // 填充剩余长度
  for (let i = result.length; i < config.length; i++) {
    result += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // 打乱字符顺序
  return result.split('').sort(() => Math.random() - 0.5).join('')
}

// 事件处理函数
const onPasswordChange = () => {
  if (password.value) {
    analyzePassword(password.value)
  } else {
    analysisResults.value = []
    suggestions.value = []
  }
}

const clearPassword = () => {
  password.value = ''
  generatedPassword.value = ''
  analysisResults.value = []
  suggestions.value = []
}

const generateSimplePassword = () => {
  const config = {
    length: 12,
    charTypes: ['lowercase', 'uppercase', 'numbers'],
    excludeSimilar: false,
    excludeAmbiguous: false
  }
  generatedPassword.value = generatePassword(config)
}

const generateStrongPassword = () => {
  const config = {
    length: 16,
    charTypes: ['lowercase', 'uppercase', 'numbers', 'symbols'],
    excludeSimilar: true,
    excludeAmbiguous: true
  }
  generatedPassword.value = generatePassword(config)
}

const copyPassword = async () => {
  try {
    await navigator.clipboard.writeText(generatedPassword.value)
    ElMessage.success('密码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const useGeneratedPassword = () => {
  password.value = generatedPassword.value
  onPasswordChange()
  ElMessage.success('已使用生成的密码')
}
// 获取密码组成信息
const getPasswordComposition = () => {
  if (!password.value) return ''
  
  const components = []
  if (/[a-z]/.test(password.value)) components.push('小写字母')
  if (/[A-Z]/.test(password.value)) components.push('大写字母')
  if (/\d/.test(password.value)) components.push('数字')
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password.value)) components.push('特殊字符')
  
  return components.join('、')
}

const goHome = () => {
  window.location.href = '/'
}

// 监听密码变化
watch(password, onPasswordChange)
</script>

<style scoped>
.password-strength-checker {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

.password-strength-checker > * {
  width: 100%;
  max-width: 1600px;
}

.header-card {
  margin-bottom: 32px;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.header-content {
  text-align: center;
  padding: 24px 0;
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 2.4rem;
  color: #303133;
  font-weight: 700;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-content p {
  margin: 0;
  color: #606266;
  font-size: 1.1rem;
  line-height: 1.5;
  font-weight: 500;
}

.main-content {
  margin-bottom: 32px;
}

.input-card, .generator-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  height: fit-content;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: #303133;
}

.password-input {
  margin-bottom: 24px;
}

.strength-section {
  margin-bottom: 24px;
  padding: 24px;
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  border-radius: 16px;
  border: 2px solid rgba(102, 126, 234, 0.2);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.1);
}

.strength-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.strength-label {
  font-weight: 600;
  color: #303133;
  font-size: 1rem;
}

.strength-tag {
  font-weight: 600;
  font-size: 0.9rem;
}

.strength-progress {
  margin-bottom: 8px;
}

.analysis-section {
  margin-bottom: 24px;
}

.analysis-section h4 {
  margin: 0 0 16px 0;
  color: #303133;
  font-weight: 600;
  font-size: 1.1rem;
}

.analysis-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: 1fr;
}

.analysis-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 8px;
  border-left: 4px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

.analysis-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.criterion-content {
  flex: 1;
}

.criterion-name {
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
  font-size: 0.95rem;
}

.criterion-desc {
  color: #606266;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* 简单分析信息样式 */
.simple-analysis {
  margin-top: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.analysis-info {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.info-item {
  font-size: 0.9rem;
  color: #606266;
  font-weight: 500;
}

/* 简单建议样式 */
.simple-suggestions {
  margin-top: 16px;
  padding: 12px;
  background: #fef0e6;
  border-radius: 8px;
  border-left: 4px solid #e6a23c;
}

.simple-suggestions h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #e6a23c;
  font-weight: 600;
}

.suggestion-list {
  margin: 0;
  padding-left: 16px;
  list-style-type: disc;
}

.suggestion-list li {
  font-size: 0.9rem;
  color: #606266;
  margin-bottom: 4px;
  line-height: 1.4;
}

.suggestions-section {
  margin-top: 16px;
  text-align: center;
}

/* 清空按钮样式 */
.clear-password-btn {
  font-size: 14px!important;
  padding: 5px 10px !important;
}

.generator-buttons {
  margin-bottom: 24px;
}

.generator-buttons .el-row {
  margin-bottom: 12px;
}

.generator-buttons .el-row:last-child {
  margin-bottom: 0;
}

.generate-btn {
  width: 100%;
  height: 48px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.generated-password-section {
  margin-bottom: 16px;
}

.generated-password-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-weight: 600;
  font-size: 1.1rem;
}

.generated-input {
  margin-bottom: 12px;
}

:deep(.generated-input .el-input-group__append) {
  padding: 0;
}

:deep(.generated-input .el-input-group__append .el-button) {
  margin-left: 8px;
  margin-right: 4px;
}

:deep(.generated-input .el-input-group__append .el-button:first-child) {
  margin-left: 12px;
}

.config-hint {
  display: block;
  margin-top: 6px;
  font-size: 0.85rem;
}

.footer-actions {
  text-align: center;
  margin-top: 32px;
}

:deep(.el-card) {
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: none;
  padding: 20px 24px;
  border-radius: 16px 16px 0 0;
}

:deep(.el-card__header .card-header span) {
  color: #ffffff;
  font-weight: 700;
  font-size: 1.2rem;
}

:deep(.el-card__body) {
  padding: 32px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

:deep(.el-progress-bar__outer) {
  border-radius: 6px;
  height: 8px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 6px;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  border: none;
  color: #ffffff !important;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
  color: #ffffff !important;
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%);
  border: none;
  color: #ffffff !important;
}

:deep(.el-button--success:hover) {
  background: linear-gradient(135deg, #85ce61 0%, #67c23a 100%);
  color: #ffffff !important;
}

:deep(.el-button--info) {
  background: linear-gradient(135deg, #909399 0%, #82848a 100%);
  border: none;
  color: #ffffff !important;
}

:deep(.el-button--info:hover) {
  background: linear-gradient(135deg, #a6a9ad 0%, #909399 100%);
  color: #ffffff !important;
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 600;
  padding: 4px 12px;
}

:deep(.el-alert) {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

:deep(.el-checkbox) {
  margin-right: 0;
}

:deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e4e7ed;
  border-radius: 12px 12px 0 0;
  padding: 20px 24px;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  font-size: 1.2rem;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

:deep(.el-slider__runway) {
  border-radius: 4px;
}

:deep(.el-slider__button) {
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .password-strength-checker {
    padding: 16px;
  }
  
  .header-content h1 {
    font-size: 1.8rem;
  }
  
  .header-content p {
    font-size: 1rem;
  }
  
  :deep(.el-col) {
    margin-bottom: 16px;
  }
  
  .generator-buttons {
    gap: 8px;
  }
  
  .generate-btn {
    height: 40px;
    font-size: 0.85rem;
  }
  
  /* 清空按钮响应式 */
  .clear-password-btn {
    font-size: 0.7rem !important;
    padding: 4px 8px !important;
  }
  
  /* 复制和使用按钮响应式 */
  :deep(.generated-input .el-input-group__append .el-button) {
    font-size: 0.8rem;
    padding: 8px 12px;
    margin-left: 6px;
    margin-right: 2px;
  }
  
  :deep(.generated-input .el-input-group__append .el-button:first-child) {
    margin-left: 8px;
  }
}

@media (max-width: 480px) {
  .password-strength-checker {
    padding: 12px;
  }
  
  .header-content h1 {
    font-size: 1.6rem;
  }
  
  :deep(.el-card__body) {
    padding: 16px;
  }
  
  :deep(.el-dialog) {
    margin: 5vh auto;
    width: 90%;
  }
  
  .generate-btn {
    height: 36px;
    font-size: 0.8rem;
  }
  
  /* 更小屏幕下的清空按钮优化 */
  .clear-password-btn {
    font-size: 0.65rem !important;
    padding: 3px 6px !important;
  }
  
  :deep(.generated-input .el-input-group__append .el-button) {
    font-size: 0.75rem;
    padding: 6px 8px;
    margin-left: 4px;
    margin-right: 2px;
  }
  
  :deep(.generated-input .el-input-group__append .el-button:first-child) {
    margin-left: 6px;
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
.clear-password-btn :deep(.el-button) {
  font-size: 12px !important;
}

.generate-btn :deep(.el-button) {
  font-size: 14px !important;
}

.copy-btn :deep(.el-button) {
  font-size: 12px !important;
}

.footer-actions :deep(.el-button) {
  font-size: 14px !important;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.generated-password-section {
  margin-bottom: 16px;
}

.generated-password-section h4 {
  margin: 0 0 12px 0;
  color: #303133;
  font-weight: 600;
  font-size: 1.1rem;
}

.generated-input {
  margin-bottom: 12px;
}

:deep(.generated-input .el-input-group__append) {
  padding: 0;
}

:deep(.generated-input .el-input-group__append .el-button) {
  margin-left: 8px;
  margin-right: 4px;
}

:deep(.generated-input .el-input-group__append .el-button:first-child) {
  margin-left: 12px;
}

.config-hint {
  display: block;
  margin-top: 6px;
  font-size: 0.85rem;
}

.footer-actions {
  text-align: center;
  margin-top: 32px;
}

:deep(.el-card) {
  border: none;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-bottom: none;
  padding: 20px 24px;
  border-radius: 16px 16px 0 0;
}

:deep(.el-card__header .card-header span) {
  color: #ffffff;
  font-weight: 700;
  font-size: 1.2rem;
}

:deep(.el-card__body) {
  padding: 32px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

:deep(.el-progress-bar__outer) {
  border-radius: 6px;
  height: 8px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 6px;
}

:deep(.el-button--primary) {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  border: none;
  color: #ffffff !important;
}

:deep(.el-button--primary:hover) {
  background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
  color: #ffffff !important;
}

:deep(.el-button--success) {
  background: linear-gradient(135deg, #67c23a 0%, #5daf34 100%);
  border: none;
  color: #ffffff !important;
}

:deep(.el-button--success:hover) {
  background: linear-gradient(135deg, #85ce61 0%, #67c23a 100%);
  color: #ffffff !important;
}

:deep(.el-button--info) {
  background: linear-gradient(135deg, #909399 0%, #82848a 100%);
  border: none;
  color: #ffffff !important;
}

:deep(.el-button--info:hover) {
  background: linear-gradient(135deg, #a6a9ad 0%, #909399 100%);
  color: #ffffff !important;
}

:deep(.el-tag) {
  border-radius: 6px;
  font-weight: 600;
  padding: 4px 12px;
}

:deep(.el-alert) {
  border-radius: 8px;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

:deep(.el-checkbox) {
  margin-right: 0;
}

:deep(.el-dialog) {
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 1px solid #e4e7ed;
  border-radius: 12px 12px 0 0;
  padding: 20px 24px;
}

:deep(.el-dialog__title) {
  font-weight: 600;
  font-size: 1.2rem;
  color: #303133;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  background: #f8f9fa;
  border-radius: 0 0 12px 12px;
}

:deep(.el-slider__runway) {
  border-radius: 4px;
}

:deep(.el-slider__button) {
  border: 2px solid #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #303133;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .password-strength-checker {
    padding: 16px;
  }
  
  .header-content h1 {
    font-size: 1.8rem;
  }
  
  .header-content p {
    font-size: 1rem;
  }
  
  :deep(.el-col) {
    margin-bottom: 16px;
  }
  
  .generator-buttons {
    gap: 8px;
  }
  
  .generate-btn {
    height: 40px;
    font-size: 0.85rem;
  }
  
  /* 清空按钮响应式 */
  .clear-password-btn {
    font-size: 0.7rem !important;
    padding: 4px 8px !important;
  }
  
  /* 复制和使用按钮响应式 */
  :deep(.generated-input .el-input-group__append .el-button) {
    font-size: 0.8rem;
    padding: 8px 12px;
    margin-left: 6px;
    margin-right: 2px;
  }
  
  :deep(.generated-input .el-input-group__append .el-button:first-child) {
    margin-left: 8px;
  }
}

@media (max-width: 480px) {
  .password-strength-checker {
    padding: 12px;
  }
  
  .header-content h1 {
    font-size: 1.6rem;
  }
  
  :deep(.el-card__body) {
    padding: 16px;
  }
  
  :deep(.el-dialog) {
    margin: 5vh auto;
    width: 90%;
  }
  
  .generate-btn {
    height: 36px;
    font-size: 0.8rem;
  }
  
  /* 更小屏幕下的清空按钮优化 */
  .clear-password-btn {
    font-size: 0.65rem !important;
    padding: 3px 6px !important;
  }
  
  :deep(.generated-input .el-input-group__append .el-button) {
    font-size: 0.75rem;
    padding: 6px 8px;
    margin-left: 4px;
    margin-right: 2px;
  }
  
  :deep(.generated-input .el-input-group__append .el-button:first-child) {
    margin-left: 6px;
  }
}
</style>