<template>
  <div class="tool-container">
    <div class="tool-header">
      <button @click="$router.push('/')" class="back-btn">← 返回主页</button>
      <h2 class="tool-title">JSON 格式化工具</h2>
    </div>
    
    <div class="formatter-content">
      <div class="formatter-left">
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
      
      <div class="formatter-right">
        <div v-if="formattedCode" class="tree-view-section">
          <h3>树形视图</h3>
          <div class="tree-actions">
            <button @click="copyToClipboard" class="copy-btn">复制结果</button>
            <button @click="copyOriginalJson" class="copy-btn">复制原文</button>
            <button @click="downloadJson" class="download-btn">下载</button>
            <button @click="validateOutputJson" class="validate-btn">验证</button>
          </div>
          <div class="tree-container-vertical">
            <pre class="code-block"><code v-html="highlightedJson"></code></pre>
          </div>
        </div>
        <div v-else class="empty-tree-view">
          <p>格式化后的JSON将在这里显示为树形视图</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useToolsStore } from '@/stores/counter'
import JsonTreeNode from './JsonTreeNode.vue'
import { validateJson, formatValidationErrors } from '@/utils/jsonValidator'
import hljs from 'highlight.js/lib/core'
import jsonLang from 'highlight.js/lib/languages/json'

hljs.registerLanguage('json', jsonLang)

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

const formattedCode = computed(() => {
  if (parsedJson.value !== null) {
    try {
      return JSON.stringify(parsedJson.value, null, 2)
    } catch {
      return outputJson.value || ''
    }
  }
  return outputJson.value || ''
})

const highlightedJson = computed(() => {
  if (!formattedCode.value) return ''
  return hljs.highlight(formattedCode.value, { language: 'json' }).value
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

const copyFormattedJson = async () => {
  try {
    await navigator.clipboard.writeText(outputJson.value)
    alert('已复制格式化JSON')
  } catch (err) {
    console.error('复制失败:', err)
  }
}

const copyOriginalJson = async () => {
  try {
    await navigator.clipboard.writeText(inputJson.value)
    alert('已复制原始JSON')
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

const validateOutputJson = () => {
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
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
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
  text-align: center;
  color: #2c3e50;
  margin-bottom: 40px;
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(0, 123, 255, 0.1);
}

.formatter-content {
  display: flex;
  gap: 30px;
  flex: 1;
  min-height: 0;
  height: 80vh;
}

.formatter-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.formatter-right {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-section, .output-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 35px;
  border-radius: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.json-tree-section, .tools-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 35px;
  border-radius: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.input-section h3, .output-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.json-tree-section h3, .tools-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.6rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.input-actions, .output-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.format-btn, .minify-btn, .copy-btn, .download-btn, .validate-btn, .clear-btn, .sample-btn {
  padding: 15px 30px;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  margin-right: 15px;
  margin-bottom: 15px;
}

.format-btn {
  background: linear-gradient(145deg, #3498db, #2980b9);
  color: white;
}

.format-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #2980b9, #1f618d);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 30px rgba(52, 152, 219, 0.3);
}

.minify-btn {
  background: linear-gradient(145deg, #e67e22, #d35400);
  color: white;
}

.minify-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #d35400, #ba4a00);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 30px rgba(230, 126, 34, 0.3);
}

.copy-btn {
  background: linear-gradient(145deg, #27ae60, #229954);
  color: white;
}

.copy-btn:hover {
  background: linear-gradient(145deg, #229954, #1e8449);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 30px rgba(39, 174, 96, 0.3);
}

.download-btn {
  background: linear-gradient(145deg, #8e44ad, #7d3c98);
  color: white;
}

.download-btn:hover {
  background: linear-gradient(145deg, #7d3c98, #6c3483);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 30px rgba(142, 68, 173, 0.3);
}

.validate-btn {
  background: linear-gradient(145deg, #f39c12, #e67e22);
  color: white;
}

.validate-btn:hover {
  background: linear-gradient(145deg, #e67e22, #d35400);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 30px rgba(243, 156, 18, 0.3);
}

.clear-btn, .sample-btn {
  background: linear-gradient(145deg, #95a5a6, #7f8c8d);
  color: white;
}

.clear-btn:hover, .sample-btn:hover {
  background: linear-gradient(145deg, #7f8c8d, #6c7b7d);
  transform: translateY(-4px) scale(1.05);
  box-shadow: 0 12px 30px rgba(149, 165, 166, 0.3);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.json-textarea {
  width: 100%;
  flex: 1;
  min-height: 300px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 15px;
  line-height: 1.5;
  resize: vertical;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.json-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 4px rgba(0, 123, 255, 0.2), inset 0 2px 8px rgba(0, 0, 0, 0.1);
  background: rgba(255, 255, 255, 1);
}

.input-textarea {
  border-color: #3498db;
}

.output-textarea {
  background: #f8f9fa;
  border-color: #27ae60;
}

.error-message {
  color: #e74c3c;
  background: linear-gradient(145deg, #fdf2f2, #f8d7da);
  padding: 15px 20px;
  border-radius: 12px;
  border-left: 6px solid #e74c3c;
  margin-top: 15px;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.2);
}

.json-stats {
  margin-top: 15px;
  background: linear-gradient(145deg, #e8f5e8, #d4edda);
  color: #2d5a2d;
  padding: 15px 20px;
  border-radius: 12px;
  border-left: 6px solid #28a745;
  font-weight: 600;
  box-shadow: 0 5px 15px rgba(40, 167, 69, 0.2);
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
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 25px;
  max-height: 450px;
  overflow-y: auto;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 15px;
  line-height: 1.6;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
  /* margin-bottom: 30px; */
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

.tree-view-section {
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  padding: 25px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.tree-actions {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.tree-container-vertical {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 20px;
  overflow-y: auto;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 15px;
  line-height: 1.6;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 400px;
}

.empty-tree-view {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  background: rgba(255, 255, 255, 0.8);
  border: 2px dashed rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  color: #7f8c8d;
  font-size: 16px;
  font-style: italic;
}

.tool-name {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.code-block {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  white-space: pre;
  overflow: auto;
  font-family: 'Fira Code', 'Courier New', monospace;
  font-size: 15px;
  line-height: 1.6;
  /* 竖向缩进参考线 */
  background-image: repeating-linear-gradient(
    to right,
    rgba(0, 0, 0, 0.06) 0,
    rgba(0, 0, 0, 0.06) 1px,
    transparent 1px,
    transparent 24px
  );
}

/* highlight.js 颜色优化 */
.hljs-attr { color: #8e44ad; font-weight: 700; }
.hljs-string { color: #27ae60; }
.hljs-number { color: #3498db; }
.hljs-literal { color: #e67e22; }
.hljs-punctuation { color: #7f8c8d; }

.tool-desc {
  font-size: 12px;
  color: #7f8c8d;
}

/* 中等屏幕适配 */
@media (max-width: 1200px) {
  .formatter-content {
    gap: 20px;
  }
  
  .input-section, .output-section,
  .json-tree-section, .tools-section {
    padding: 25px;
  }
}

/* 平板适配 */
@media (max-width: 992px) {
  .tool-container {
    padding: 15px;
  }
  
  .formatter-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .formatter-left,
  .formatter-right {
    flex: none;
    width: 100%;
  }
  
  .tool-title {
    font-size: 2.5rem;
  }
}

/* 手机适配 */
@media (max-width: 768px) {
  .tool-container {
    padding: 10px;
  }

  .formatter-content {
    flex-direction: column;
    gap: 15px;
  }

  .formatter-left,
  .formatter-right {
    flex: none;
    width: 100%;
  }

  .json-textarea {
    min-height: 200px;
    font-size: 14px;
  }

  .tool-title {
    font-size: 2rem;
    margin-bottom: 20px;
  }

  .input-section,
  .output-section,
  .json-tree-section,
  .tools-section {
    padding: 15px;
  }

  .input-actions, .output-actions {
    flex-wrap: wrap;
    gap: 8px;
  }

  .format-btn, .minify-btn, .copy-btn, .download-btn, 
  .validate-btn, .clear-btn, .sample-btn {
    padding: 12px 20px;
    font-size: 14px;
    margin-right: 0;
    margin-bottom: 8px;
    flex: 1;
    min-width: 100px;
  }
  
  .tools-grid {
    grid-template-columns: 1fr;
  }
}

/* 小屏手机适配 */
@media (max-width: 480px) {
  .tool-container {
    padding: 8px;
  }
  
  .tool-title {
    font-size: 1.8rem;
  }
  
  .input-section,
  .output-section,
  .json-tree-section,
  .tools-section {
    padding: 12px;
  }
  
  .json-textarea {
    min-height: 180px;
    padding: 15px;
    font-size: 13px;
  }
}
</style>