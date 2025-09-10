<template>
  <div class="tool-container">
    <h2 class="tool-title">正则表达式测试器</h2>
    
    <div class="regex-section">
      <h3>正则表达式</h3>
      <div class="regex-input-container">
        <input 
          v-model="regexPattern" 
          type="text" 
          placeholder="输入正则表达式，例如: \d+"
          class="regex-input"
          @input="testRegex"
        >
        <div class="regex-flags">
          <label><input type="checkbox" v-model="flags.global" @change="testRegex"> g (全局)</label>
          <label><input type="checkbox" v-model="flags.ignoreCase" @change="testRegex"> i (忽略大小写)</label>
          <label><input type="checkbox" v-model="flags.multiline" @change="testRegex"> m (多行)</label>
        </div>
      </div>
    </div>
    
    <div class="test-text-section">
      <h3>测试文本</h3>
      <textarea 
        v-model="testText" 
        placeholder="输入要测试的文本..."
        class="test-textarea"
        @input="testRegex"
      ></textarea>
    </div>
    
    <div v-if="regexPattern" class="results-section">
      <h3>匹配结果</h3>
      <div v-if="error" class="error-message">
        <i>⚠️</i> {{ error }}
      </div>
      <div v-else-if="matches.length > 0" class="matches-container">
        <div class="matches-summary">
          找到 {{ matches.length }} 个匹配项
        </div>
        <div class="matches-list">
          <div v-for="(match, index) in matches" :key="index" class="match-item">
            <div class="match-header">
              <span class="match-index">匹配 {{ index + 1 }}</span>
              <span class="match-position">位置: {{ match.index }} - {{ match.index + match[0].length - 1 }}</span>
            </div>
            <div class="match-content">{{ match[0] }}</div>
            <div v-if="match.length > 1" class="match-groups">
              <div v-for="(group, groupIndex) in match.slice(1)" :key="groupIndex" class="match-group">
                <span class="group-label">分组 {{ groupIndex + 1 }}:</span>
                <span class="group-content">{{ group || '(空)' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="no-matches">
        <i>ℹ️</i> 没有找到匹配项
      </div>
      
      <div class="highlighted-text">
        <h4>高亮显示</h4>
        <div class="highlighted-content" v-html="highlightedText"></div>
      </div>
    </div>
    
    <div class="common-patterns">
      <h3>常用正则表达式</h3>
      <div class="patterns-grid">
        <div v-for="pattern in commonPatterns" :key="pattern.name" class="pattern-item" @click="usePattern(pattern)">
          <div class="pattern-name">{{ pattern.name }}</div>
          <div class="pattern-regex">{{ pattern.regex }}</div>
          <div class="pattern-desc">{{ pattern.description }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolsStore } from '@/stores/counter'

const toolsStore = useToolsStore()
const regexPattern = ref('')
const testText = ref('')
const flags = ref({
  global: true,
  ignoreCase: false,
  multiline: false
})
const matches = ref([])
const error = ref('')

const commonPatterns = [
  { name: '邮箱', regex: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: '匹配邮箱地址' },
  { name: '手机号', regex: '1[3-9]\\d{9}', description: '匹配中国手机号' },
  { name: 'URL', regex: 'https?://[^\\s]+', description: '匹配HTTP/HTTPS链接' },
  { name: 'IP地址', regex: '\\b(?:[0-9]{1,3}\\.){3}[0-9]{1,3}\\b', description: '匹配IPv4地址' },
  { name: '数字', regex: '\\d+', description: '匹配一个或多个数字' },
  { name: '中文', regex: '[\\u4e00-\\u9fa5]+', description: '匹配中文字符' },
  { name: '身份证', regex: '[1-9]\\d{5}(18|19|20)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]', description: '匹配18位身份证号' },
  { name: '日期', regex: '\\d{4}-\\d{2}-\\d{2}', description: '匹配YYYY-MM-DD格式日期' }
]

const testRegex = () => {
  if (!regexPattern.value || !testText.value) {
    matches.value = []
    error.value = ''
    return
  }
  
  try {
    let flagsStr = ''
    if (flags.value.global) flagsStr += 'g'
    if (flags.value.ignoreCase) flagsStr += 'i'
    if (flags.value.multiline) flagsStr += 'm'
    
    const regex = new RegExp(regexPattern.value, flagsStr)
    const result = []
    
    if (flags.value.global) {
      let match
      while ((match = regex.exec(testText.value)) !== null) {
        result.push(match)
        if (match.index === regex.lastIndex) {
          regex.lastIndex++
        }
      }
    } else {
      const match = regex.exec(testText.value)
      if (match) {
        result.push(match)
      }
    }
    
    matches.value = result
    error.value = ''
    
    if (result.length > 0) {
      toolsStore.addToolHistory('正则表达式测试器')
    }
  } catch (err) {
    error.value = err.message
    matches.value = []
  }
}

const highlightedText = computed(() => {
  if (!regexPattern.value || !testText.value || matches.value.length === 0) {
    return testText.value
  }
  
  let result = testText.value
  const sortedMatches = [...matches.value].sort((a, b) => b.index - a.index)
  
  sortedMatches.forEach(match => {
    const before = result.substring(0, match.index)
    const matched = result.substring(match.index, match.index + match[0].length)
    const after = result.substring(match.index + match[0].length)
    result = before + `<mark class="highlight">${matched}</mark>` + after
  })
  
  return result.replace(/\n/g, '<br>')
})

const usePattern = (pattern) => {
  regexPattern.value = pattern.regex
  testRegex()
}
</script>

<style scoped>
.tool-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.tool-title {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.regex-section, .test-text-section, .results-section, .common-patterns {
  margin-bottom: 30px;
}

.regex-section h3, .test-text-section h3, .results-section h3, .common-patterns h3 {
  color: #34495e;
  margin-bottom: 15px;
}

.regex-input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.regex-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #3498db;
  border-radius: 8px;
  font-size: 16px;
  font-family: 'Courier New', monospace;
}

.regex-flags {
  display: flex;
  gap: 20px;
}

.regex-flags label {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
}

.test-textarea {
  width: 100%;
  height: 150px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 5px;
  border-left: 4px solid #e74c3c;
}

.matches-container {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.matches-summary {
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 15px;
}

.match-item {
  background: white;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;
  border-left: 4px solid #3498db;
}

.match-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #7f8c8d;
}

.match-content {
  font-family: 'Courier New', monospace;
  background: #e8f4fd;
  padding: 8px;
  border-radius: 4px;
  margin-bottom: 8px;
}

.match-groups {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.match-group {
  font-size: 14px;
}

.group-label {
  font-weight: bold;
  color: #8e44ad;
}

.group-content {
  font-family: 'Courier New', monospace;
  background: #f3e5f5;
  padding: 2px 6px;
  border-radius: 3px;
  margin-left: 10px;
}

.no-matches {
  background: #fff3cd;
  color: #856404;
  padding: 10px;
  border-radius: 5px;
  border-left: 4px solid #ffc107;
}

.highlighted-text {
  margin-top: 20px;
}

.highlighted-content {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  line-height: 1.5;
}

:deep(.highlight) {
  background: #ffeb3b;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.pattern-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pattern-item:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

.pattern-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.pattern-regex {
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 5px 8px;
  border-radius: 4px;
  margin-bottom: 5px;
  font-size: 12px;
}

.pattern-desc {
  font-size: 12px;
  color: #7f8c8d;
}
</style>