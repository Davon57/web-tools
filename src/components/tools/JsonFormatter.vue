<template>
  <div class="tool-container">
    <h2 class="tool-title">JSON 格式化工具</h2>
    
    <div class="input-section">
      <h3>输入 JSON</h3>
      <div class="input-actions">
        <button @click="formatJson" class="format-btn" :disabled="!inputJson.trim()">格式化</button>
        <button @click="minifyJson" class="minify-btn" :disabled="!inputJson.trim()">压缩</button>
        <button @click="clearInput" class="clear-btn">清空</button>
        <button @click="loadSample" class="sample-btn">示例数据</button>
      </div>
      <textarea 
        v-model="inputJson" 
        placeholder="粘贴或输入 JSON 数据..."
        class="json-textarea input-textarea"
      ></textarea>
      <div v-if="error" class="error-message">
        <i>⚠️</i> {{ error }}
      </div>
    </div>
    
    <div v-if="outputJson" class="output-section">
      <h3>格式化结果</h3>
      <div class="output-actions">
        <button @click="copyToClipboard" class="copy-btn">复制</button>
        <button @click="downloadJson" class="download-btn">下载</button>
        <button @click="validateJson" class="validate-btn">验证</button>
      </div>
      <textarea 
        v-model="outputJson" 
        readonly 
        class="json-textarea output-textarea"
      ></textarea>
      
      <div v-if="jsonStats" class="json-stats">
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">字符数:</span>
            <span class="stat-value">{{ jsonStats.characters }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">行数:</span>
            <span class="stat-value">{{ jsonStats.lines }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">对象数:</span>
            <span class="stat-value">{{ jsonStats.objects }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">数组数:</span>
            <span class="stat-value">{{ jsonStats.arrays }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">键值对:</span>
            <span class="stat-value">{{ jsonStats.properties }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">深度:</span>
            <span class="stat-value">{{ jsonStats.depth }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="json-tree-section" v-if="parsedJson">
      <h3>树形视图</h3>
      <div class="tree-container">
        <JsonTreeNode :data="parsedJson" :key-name="'root'" :level="0" />
      </div>
    </div>
    
    <div class="tools-section">
      <h3>JSON 工具</h3>
      <div class="tools-grid">
        <div class="tool-item" @click="escapeJson">
          <div class="tool-name">转义 JSON</div>
          <div class="tool-desc">将 JSON 转换为字符串格式</div>
        </div>
        <div class="tool-item" @click="unescapeJson">
          <div class="tool-name">反转义 JSON</div>
          <div class="tool-desc">将字符串格式转换为 JSON</div>
        </div>
        <div class="tool-item" @click="sortKeys">
          <div class="tool-name">排序键名</div>
          <div class="tool-desc">按字母顺序排序对象键名</div>
        </div>
        <div class="tool-item" @click="removeComments">
          <div class="tool-name">移除注释</div>
          <div class="tool-desc">移除 JSON 中的注释（非标准）</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolsStore } from '@/stores/counter'
import JsonTreeNode from './JsonTreeNode.vue'

const toolsStore = useToolsStore()
const inputJson = ref('')
const outputJson = ref('')
const error = ref('')
const parsedJson = ref(null)

const jsonStats = computed(() => {
  if (!outputJson.value) return null
  
  const text = outputJson.value
  const lines = text.split('\n').length
  const characters = text.length
  
  try {
    const obj = JSON.parse(text)
    const stats = analyzeJson(obj)
    return {
      characters,
      lines,
      ...stats
    }
  } catch {
    return { characters, lines, objects: 0, arrays: 0, properties: 0, depth: 0 }
  }
})

const analyzeJson = (obj, depth = 0) => {
  let objects = 0
  let arrays = 0
  let properties = 0
  let maxDepth = depth
  
  if (Array.isArray(obj)) {
    arrays++
    obj.forEach(item => {
      const childStats = analyzeJson(item, depth + 1)
      objects += childStats.objects
      arrays += childStats.arrays
      properties += childStats.properties
      maxDepth = Math.max(maxDepth, childStats.depth)
    })
  } else if (obj && typeof obj === 'object') {
    objects++
    const keys = Object.keys(obj)
    properties += keys.length
    
    keys.forEach(key => {
      const childStats = analyzeJson(obj[key], depth + 1)
      objects += childStats.objects
      arrays += childStats.arrays
      properties += childStats.properties
      maxDepth = Math.max(maxDepth, childStats.depth)
    })
  }
  
  return { objects, arrays, properties, depth: maxDepth }
}

const formatJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed, null, 2)
    parsedJson.value = parsed
    error.value = ''
    toolsStore.addToolHistory('JSON格式化')
  } catch (err) {
    error.value = `JSON 解析错误: ${err.message}`
    outputJson.value = ''
    parsedJson.value = null
  }
}

const minifyJson = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    outputJson.value = JSON.stringify(parsed)
    parsedJson.value = parsed
    error.value = ''
    toolsStore.addToolHistory('JSON压缩')
  } catch (err) {
    error.value = `JSON 解析错误: ${err.message}`
    outputJson.value = ''
    parsedJson.value = null
  }
}

const clearInput = () => {
  inputJson.value = ''
  outputJson.value = ''
  error.value = ''
  parsedJson.value = null
}

const loadSample = () => {
  inputJson.value = `{
  "name": "张三",
  "age": 30,
  "city": "北京",
  "hobbies": ["读书", "游泳", "编程"],
  "address": {
    "street": "长安街",
    "number": 123,
    "zipcode": "100000"
  },
  "married": true,
  "children": null
}`
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(outputJson.value)
    alert('已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const downloadJson = () => {
  const blob = new Blob([outputJson.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'formatted.json'
  a.click()
  URL.revokeObjectURL(url)
}

const validateJson = () => {
  try {
    JSON.parse(outputJson.value)
    alert('✅ JSON 格式正确')
  } catch (err) {
    alert(`❌ JSON 格式错误: ${err.message}`)
  }
}

const escapeJson = () => {
  if (outputJson.value) {
    inputJson.value = JSON.stringify(outputJson.value)
    outputJson.value = ''
    parsedJson.value = null
  }
}

const unescapeJson = () => {
  try {
    const unescaped = JSON.parse(inputJson.value)
    if (typeof unescaped === 'string') {
      inputJson.value = unescaped
      formatJson()
    }
  } catch (err) {
    error.value = '反转义失败: 输入不是有效的转义 JSON'
  }
}

const sortKeys = () => {
  try {
    const parsed = JSON.parse(inputJson.value)
    const sorted = sortObjectKeys(parsed)
    outputJson.value = JSON.stringify(sorted, null, 2)
    parsedJson.value = sorted
    error.value = ''
  } catch (err) {
    error.value = `JSON 解析错误: ${err.message}`
  }
}

const sortObjectKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys)
  } else if (obj && typeof obj === 'object') {
    const sorted = {}
    Object.keys(obj).sort().forEach(key => {
      sorted[key] = sortObjectKeys(obj[key])
    })
    return sorted
  }
  return obj
}

const removeComments = () => {
  // 简单的注释移除（处理 // 和 /* */ 注释）
  let cleaned = inputJson.value
    .replace(/\/\*[\s\S]*?\*\//g, '') // 移除 /* */ 注释
    .replace(/\/\/.*$/gm, '') // 移除 // 注释
  
  inputJson.value = cleaned
  formatJson()
}
</script>

<style scoped>
.tool-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tool-title {
  color: #2c3e50;
  margin-bottom: 30px;
  text-align: center;
}

.input-section, .output-section, .json-tree-section, .tools-section {
  margin-bottom: 30px;
}

.input-section h3, .output-section h3, .json-tree-section h3, .tools-section h3 {
  color: #34495e;
  margin-bottom: 15px;
}

.input-actions, .output-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.format-btn, .minify-btn, .copy-btn, .download-btn, .validate-btn, .clear-btn, .sample-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.format-btn {
  background: #3498db;
  color: white;
}

.format-btn:hover:not(:disabled) {
  background: #2980b9;
}

.minify-btn {
  background: #e67e22;
  color: white;
}

.minify-btn:hover:not(:disabled) {
  background: #d35400;
}

.copy-btn {
  background: #27ae60;
  color: white;
}

.copy-btn:hover {
  background: #229954;
}

.download-btn {
  background: #8e44ad;
  color: white;
}

.download-btn:hover {
  background: #7d3c98;
}

.validate-btn {
  background: #f39c12;
  color: white;
}

.validate-btn:hover {
  background: #e67e22;
}

.clear-btn, .sample-btn {
  background: #95a5a6;
  color: white;
}

.clear-btn:hover, .sample-btn:hover {
  background: #7f8c8d;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.json-textarea {
  width: 100%;
  height: 300px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  line-height: 1.5;
}

.input-textarea {
  border-color: #3498db;
}

.output-textarea {
  background: #f8f9fa;
  border-color: #27ae60;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 10px;
  border-radius: 5px;
  border-left: 4px solid #e74c3c;
  margin-top: 10px;
}

.json-stats {
  margin-top: 15px;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.stat-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.tree-container {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  max-height: 400px;
  overflow-y: auto;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.tool-item {
  background: white;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-item:hover {
  border-color: #3498db;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
}

.tool-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.tool-desc {
  font-size: 12px;
  color: #7f8c8d;
}
</style>