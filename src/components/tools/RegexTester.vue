<template>
  <div class="tool-container">
    <div class="tool-header">
      <button @click="$router.push('/')" class="back-btn">← 返回主页</button>
      <h2 class="tool-title">正则表达式测试器</h2>
    </div>
    
    <div class="tester-content">
      <div class="tester-left">
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
      </div>
      
      <div class="tester-right">
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
        
        <div class="common-patterns-section">
          <button @click="showPatternsModal = true" class="patterns-btn">
            <i>📋</i> 常用正则表达式
          </button>
        </div>
      </div>
    </div>
    
    <!-- 常用正则表达式弹窗 -->
    <div v-if="showPatternsModal" class="modal-overlay" @click="showPatternsModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>常用正则表达式</h3>
          <button @click="showPatternsModal = false" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="patterns-grid">
            <div v-for="pattern in commonPatterns" :key="pattern.name" class="pattern-item" @click="usePattern(pattern)">
              <div class="pattern-name">{{ pattern.name }}</div>
              <div class="pattern-regex">{{ pattern.regex }}</div>
              <div class="pattern-desc">{{ pattern.description }}</div>
            </div>
          </div>
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
const showPatternsModal = ref(false)

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
  showPatternsModal.value = false
}
</script>

<style scoped>
.tool-container {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  padding: 20px 20px 30px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.95));
  backdrop-filter: blur(10px);
  position: relative;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.tester-content {
  display: flex;
  gap: 30px;
  flex: 1;
}

.tester-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.tester-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
  overflow-y: auto;
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

.regex-section {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.9));
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.test-text-section, .results-section, .common-patterns {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.9));
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.regex-section h3, .test-text-section h3, .results-section h3, .common-patterns h3 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.regex-input-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.regex-input {
  width: 100%;
  padding: 18px;
  border: 3px solid rgba(0, 123, 255, 0.3);
  border-radius: 15px;
  font-size: 18px;
  font-family: 'Fira Code', 'Courier New', monospace;
  background: linear-gradient(145deg, rgba(248, 249, 250, 0.9), rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(5px);
  box-shadow: inset 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
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
  flex: 1;
  min-height: 200px;
  padding: 18px;
  border: 3px solid rgba(0, 123, 255, 0.2);
  border-radius: 15px;
  font-size: 16px;
  resize: vertical;
  background: linear-gradient(145deg, rgba(248, 249, 250, 0.9), rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(5px);
  box-shadow: inset 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  font-family: 'Fira Code', 'Courier New', monospace;
}

.error-message {
  background: linear-gradient(145deg, rgba(254, 238, 238, 0.9), rgba(252, 226, 226, 0.9));
  color: #dc3545;
  padding: 20px;
  border-radius: 15px;
  border-left: 6px solid #dc3545;
  box-shadow: 0 10px 25px rgba(220, 53, 69, 0.1);
  backdrop-filter: blur(5px);
  font-weight: 600;
}

.matches-container {
  background: linear-gradient(145deg, rgba(248, 249, 250, 0.9), rgba(233, 236, 239, 0.9));
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 18px;
  border: 2px solid rgba(222, 226, 230, 0.5);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.matches-summary {
  font-weight: 700;
  color: #28a745;
  margin-bottom: 20px;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #28a745, #20c997);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.match-item {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.9));
  backdrop-filter: blur(5px);
  padding: 20px;
  margin-bottom: 15px;
  border-radius: 15px;
  border-left: 6px solid #007bff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.match-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 12px;
  color: #7f8c8d;
}

.match-content {
  font-family: 'Fira Code', 'Courier New', monospace;
  background: linear-gradient(145deg, rgba(232, 244, 253, 0.9), rgba(207, 236, 255, 0.9));
  backdrop-filter: blur(5px);
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 12px;
  border: 2px solid rgba(0, 123, 255, 0.2);
  font-size: 16px;
}

.match-groups {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.match-group {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.group-label {
  font-weight: bold;
  color: #8e44ad;
}

.group-content {
  font-family: 'Fira Code', 'Courier New', monospace;
  background: linear-gradient(145deg, rgba(243, 229, 245, 0.9), rgba(233, 213, 255, 0.9));
  backdrop-filter: blur(3px);
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid rgba(142, 68, 173, 0.3);
  white-space: nowrap;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
}

.no-matches {
  background: linear-gradient(145deg, rgba(255, 243, 205, 0.9), rgba(254, 235, 179, 0.9));
  color: #856404;
  padding: 20px;
  border-radius: 15px;
  border-left: 6px solid #ffc107;
  backdrop-filter: blur(5px);
  box-shadow: 0 10px 25px rgba(255, 193, 7, 0.1);
  font-weight: 600;
}

.highlighted-text {
  margin-top: 20px;
}

.highlighted-content {
  background: linear-gradient(145deg, rgba(248, 249, 250, 0.9), rgba(233, 236, 239, 0.9));
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 18px;
  border: 2px solid rgba(222, 226, 230, 0.5);
  font-family: 'Fira Code', 'Courier New', monospace;
  white-space: pre-wrap;
  line-height: 1.6;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  font-size: 16px;
}

:deep(.highlight) {
  background: #ffeb3b;
  padding: 2px 4px;
  border-radius: 3px;
  font-weight: bold;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.pattern-item {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.9));
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 18px;
  border: 2px solid rgba(222, 226, 230, 0.5);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.pattern-item:hover {
  border-color: rgba(0, 123, 255, 0.8);
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 123, 255, 0.2);
  background: linear-gradient(145deg, rgba(227, 242, 253, 0.9), rgba(187, 222, 251, 0.9));
}

.pattern-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.pattern-regex {
  font-family: 'Fira Code', 'Courier New', monospace;
  background: linear-gradient(145deg, rgba(248, 249, 250, 0.9), rgba(233, 236, 239, 0.9));
  backdrop-filter: blur(5px);
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 10px;
  font-size: 14px;
  border: 2px solid rgba(0, 123, 255, 0.1);
  font-weight: 600;
}

.pattern-desc {
  font-size: 12px;
  color: #7f8c8d;
}

.common-patterns-section {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.patterns-btn {
  background: linear-gradient(145deg, #007bff, #0056b3);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 15px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 20px rgba(0, 123, 255, 0.3);
  display: flex;
  align-items: center;
  gap: 10px;
}

.patterns-btn:hover {
  background: linear-gradient(145deg, #0056b3, #004085);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 25px rgba(0, 123, 255, 0.4);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.95));
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  max-width: 90vw;
  max-height: 80vh;
  width: 800px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px;
  border-bottom: 1px solid rgba(222, 226, 230, 0.5);
  background: linear-gradient(145deg, rgba(248, 249, 250, 0.9), rgba(233, 236, 239, 0.9));
}

.modal-header h3 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(220, 53, 69, 0.1);
  color: #dc3545;
  transform: scale(1.1);
}

.modal-body {
  padding: 30px;
  max-height: 60vh;
  overflow-y: auto;
}

.modal-body .patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.modal-body .pattern-item {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.9));
  backdrop-filter: blur(10px);
  padding: 25px;
  border-radius: 18px;
  border: 2px solid rgba(222, 226, 230, 0.5);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.modal-body .pattern-item:hover {
  border-color: rgba(0, 123, 255, 0.8);
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 123, 255, 0.2);
  background: linear-gradient(145deg, rgba(227, 242, 253, 0.9), rgba(187, 222, 251, 0.9));
}

@media (max-width: 768px) {
  .tool-container {
    padding: 15px;
  }
  
  .tester-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .tester-left, .tester-right {
    flex: none;
  }
  
  .tester-right {
    overflow-y: visible;
  }
  
  .regex-section, .test-text-section, .results-section {
    padding: 20px;
  }
  
  .tool-title {
    font-size: 2.5rem;
  }
  
  .test-textarea {
    min-height: 150px;
  }
  
  .modal-content {
    width: 95vw;
    max-height: 85vh;
  }
  
  .modal-body .patterns-grid {
    grid-template-columns: 1fr;
  }
  
  .patterns-btn {
    padding: 12px 24px;
    font-size: 14px;
  }
  
  .match-groups {
    flex-direction: column;
    gap: 8px;
  }
  
  .group-content {
    max-width: none;
    white-space: normal;
  }
}
</style>