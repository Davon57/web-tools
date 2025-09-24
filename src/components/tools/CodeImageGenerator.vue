<template>
  <div class="code-image-generator">
    <div class="header">
      <div class="header-content">
        <button @click="goBack" class="back-button">
          ← 返回主页
        </button>
        <div class="title-section">
          <h2 class="title">📸 代码图片生成器</h2>
          <p class="subtitle">将代码转换为美观的分享图片</p>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 样式设置区域 -->
      <div class="left-section">
        <!-- 控制面板 -->
        <div class="control-panel">
          <h3>🎨 样式设置</h3>
        
          <div class="control-section">
          
          <!-- 语言选择 -->
          <div class="control-group">
            <label>编程语言</label>
            <select v-model="selectedLanguage" @change="updateHighlight">
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="php">PHP</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="typescript">TypeScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
              <option value="yaml">YAML</option>
              <option value="bash">Bash</option>
              <option value="powershell">PowerShell</option>
              <option value="plaintext">纯文本</option>
            </select>
          </div>

          <!-- 主题选择 -->
          <div class="control-group">
            <label>代码主题</label>
            <select v-model="selectedTheme" @change="updateHighlight">
              <option value="github">GitHub</option>
              <option value="github-dark">GitHub Dark</option>
              <option value="vs">Visual Studio</option>
              <option value="vs2015">Visual Studio 2015</option>
              <option value="atom-one-dark">Atom One Dark</option>
              <option value="atom-one-light">Atom One Light</option>
              <option value="monokai">Monokai</option>
              <option value="dracula">Dracula</option>
              <option value="nord">Nord</option>
              <option value="solarized-dark">Solarized Dark</option>
              <option value="solarized-light">Solarized Light</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="tomorrow-night">Tomorrow Night</option>
            </select>
          </div>

          <!-- 背景设置 -->
          <div class="control-group">
            <label>背景样式</label>
            <select v-model="backgroundStyle" @change="updateBackground">
              <option value="gradient1">渐变蓝紫</option>
              <option value="gradient2">渐变橙红</option>
              <option value="gradient3">渐变绿青</option>
              <option value="gradient4">渐变粉紫</option>
              <option value="solid-dark">深色纯色</option>
              <option value="solid-light">浅色纯色</option>
              <option value="transparent">透明背景</option>
            </select>
          </div>

          <!-- 窗口样式 -->
          <div class="control-group">
            <label>窗口样式</label>
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="showWindowControls">
                显示窗口控制按钮
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="showLineNumbers">
                显示行号
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="showShadow">
                显示阴影
              </label>
            </div>
          </div>

          <!-- 尺寸设置 -->
          <div class="control-group">
            <label>图片尺寸</label>
            <div class="size-controls">
              <div class="size-input">
                <label>宽度</label>
                <input type="number" v-model="imageWidth" min="400" max="2000" step="50">
              </div>
              <div class="size-input">
                <label>缩放</label>
                <input type="range" v-model="imageScale" min="1" max="3" step="0.1">
                <span>{{ imageScale }}x</span>
              </div>
            </div>
          </div>
          
          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button @click="generateImage" :disabled="!codeInput.trim() || isGenerating" class="generate-btn">
              <span v-if="isGenerating">🔄 生成中...</span>
              <span v-else>📸 生成图片</span>
            </button>
            <button @click="downloadImage" :disabled="!generatedImageUrl" class="download-btn">
              💾 下载图片
            </button>
            <button @click="clearCode" class="clear-btn">
              🗑️ 清空代码
            </button>
          </div>
          </div>
        </div>
      </div>

      <!-- 代码输入区域 -->
      <div class="preview-area">
        <!-- 代码输入区 -->
        <div class="code-input-section">
          <h3>📝 代码输入</h3>
          <textarea
            v-model="codeInput"
            placeholder="在此粘贴您的代码..."
            class="code-textarea"
            @input="updateHighlight"
          ></textarea>
        </div>

        <!-- 代码预览区 -->
        <div class="code-preview-section">
          <h3>👀 预览效果</h3>
          <div 
            ref="codePreviewContainer"
            class="code-preview-container"
            :class="{ 'with-shadow': showShadow }"
            :style="{ 
              background: getBackgroundStyle(),
              width: imageWidth + 'px'
            }"
          >
            <div class="code-window">
              <!-- 窗口控制按钮 -->
              <div v-if="showWindowControls" class="window-controls">
                <div class="control-button close"></div>
                <div class="control-button minimize"></div>
                <div class="control-button maximize"></div>
              </div>
              
              <!-- 代码内容 -->
              <div class="code-content">
                <pre v-if="showLineNumbers" class="line-numbers"><code v-for="(line, index) in codeLines" :key="index">{{ index + 1 }}</code></pre>
                <pre class="code-block"><code ref="codeBlock" :class="`language-${selectedLanguage}`">{{ codeInput || '// 在左侧输入您的代码\nconsole.log("Hello, World!");' }}</code></pre>
              </div>
            </div>
          </div>
        </div>

        <!-- 生成的图片预览 -->
        <div v-if="generatedImageUrl" class="generated-image-section">
          <h3>✨ 生成结果</h3>
          <div class="image-preview">
            <img :src="generatedImageUrl" alt="Generated Code Image" />
            <div class="image-info">
              <p>图片已生成，点击下载按钮保存到本地</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import hljs from 'highlight.js'
import html2canvas from 'html2canvas'

// 导入highlight.js样式
import 'highlight.js/styles/github.css'

// 路由
const router = useRouter()

// 返回主页
const goBack = () => {
  router.push('/')
}

// 响应式数据
const codeInput = ref('')
const selectedLanguage = ref('javascript')
const selectedTheme = ref('github')
const backgroundStyle = ref('gradient1')
const showWindowControls = ref(true)
const showLineNumbers = ref(true)
const showShadow = ref(true)
const imageWidth = ref(800)
const imageScale = ref(2)
const isGenerating = ref(false)
const generatedImageUrl = ref('')

// DOM引用
const codeBlock = ref(null)
const codePreviewContainer = ref(null)

// 计算属性
const codeLines = computed(() => {
  return codeInput.value.split('\n')
})

// 主题样式映射
const themeStyles = {
  'github': 'github.css',
  'github-dark': 'github-dark.css',
  'vs': 'vs.css',
  'vs2015': 'vs2015.css',
  'atom-one-dark': 'atom-one-dark.css',
  'atom-one-light': 'atom-one-light.css',
  'monokai': 'monokai.css',
  'dracula': 'dracula.css',
  'nord': 'nord.css',
  'solarized-dark': 'solarized-dark.css',
  'solarized-light': 'solarized-light.css',
  'tomorrow': 'tomorrow.css',
  'tomorrow-night': 'tomorrow-night.css'
}

// 主题配置对象 - 定义每个主题的窗口样式
const themeConfigs = {
  'github': {
    type: 'light',
    windowBg: '#ffffff',
    windowBorder: '#d1d9e0',
    controlsBg: '#f6f8fa',
    lineNumbersBg: '#f6f8fa',
    lineNumbersColor: '#656d76'
  },
  'github-dark': {
    type: 'dark',
    windowBg: '#0d1117',
    windowBorder: '#30363d',
    controlsBg: '#161b22',
    lineNumbersBg: '#161b22',
    lineNumbersColor: '#7d8590'
  },
  'vs': {
    type: 'light',
    windowBg: '#ffffff',
    windowBorder: '#e1e4e8',
    controlsBg: '#f3f4f6',
    lineNumbersBg: '#f3f4f6',
    lineNumbersColor: '#6e7681'
  },
  'vs2015': {
    type: 'dark',
    windowBg: '#1e1e1e',
    windowBorder: '#3c3c3c',
    controlsBg: '#2d2d30',
    lineNumbersBg: '#2d2d30',
    lineNumbersColor: '#858585'
  },
  'atom-one-dark': {
    type: 'dark',
    windowBg: '#282c34',
    windowBorder: '#3e4451',
    controlsBg: '#21252b',
    lineNumbersBg: '#21252b',
    lineNumbersColor: '#636d83'
  },
  'atom-one-light': {
    type: 'light',
    windowBg: '#fafafa',
    windowBorder: '#e5e5e6',
    controlsBg: '#f0f0f1',
    lineNumbersBg: '#f0f0f1',
    lineNumbersColor: '#a0a1a7'
  },
  'monokai': {
    type: 'dark',
    windowBg: '#272822',
    windowBorder: '#49483e',
    controlsBg: '#1e1f1c',
    lineNumbersBg: '#1e1f1c',
    lineNumbersColor: '#90908a'
  },
  'dracula': {
    type: 'dark',
    windowBg: '#282a36',
    windowBorder: '#44475a',
    controlsBg: '#21222c',
    lineNumbersBg: '#21222c',
    lineNumbersColor: '#6272a4'
  },
  'nord': {
    type: 'dark',
    windowBg: '#2e3440',
    windowBorder: '#3b4252',
    controlsBg: '#242933',
    lineNumbersBg: '#242933',
    lineNumbersColor: '#616e88'
  },
  'solarized-dark': {
    type: 'dark',
    windowBg: '#002b36',
    windowBorder: '#073642',
    controlsBg: '#001e27',
    lineNumbersBg: '#001e27',
    lineNumbersColor: '#586e75'
  },
  'solarized-light': {
    type: 'light',
    windowBg: '#fdf6e3',
    windowBorder: '#eee8d5',
    controlsBg: '#f7f1e0',
    lineNumbersBg: '#f7f1e0',
    lineNumbersColor: '#93a1a1'
  },
  'tomorrow': {
    type: 'light',
    windowBg: '#ffffff',
    windowBorder: '#e1e1e8',
    controlsBg: '#f5f5f5',
    lineNumbersBg: '#f5f5f5',
    lineNumbersColor: '#8e908c'
  },
  'tomorrow-night': {
    type: 'dark',
    windowBg: '#1d1f21',
    windowBorder: '#373b41',
    controlsBg: '#161719',
    lineNumbersBg: '#161719',
    lineNumbersColor: '#969896'
  }
}

// 获取当前主题配置的计算属性
const currentThemeConfig = computed(() => {
  return themeConfigs[selectedTheme.value] || themeConfigs['github']
})

// 背景样式
const getBackgroundStyle = () => {
  const styles = {
    'gradient1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'gradient2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'gradient3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'gradient4': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    'solid-dark': '#1a1a1a',
    'solid-light': '#f8f9fa',
    'transparent': 'transparent'
  }
  return styles[backgroundStyle.value] || styles.gradient1
}

// 动态加载主题样式
const loadThemeStyle = async (theme) => {
  // 移除旧的主题样式
  const existingLink = document.querySelector('#hljs-theme')
  if (existingLink) {
    existingLink.remove()
  }

  // 加载新的主题样式
  const link = document.createElement('link')
  link.id = 'hljs-theme'
  link.rel = 'stylesheet'
  link.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${themeStyles[theme] || 'github.css'}`
  document.head.appendChild(link)
}

// 更新代码高亮
const updateHighlight = async () => {
  await nextTick()
  if (codeBlock.value) {
    // 清除之前的高亮
    codeBlock.value.removeAttribute('data-highlighted')
    // 应用新的高亮
    hljs.highlightElement(codeBlock.value)
  }
}

// 更新背景
const updateBackground = () => {
  // 背景更新会通过响应式自动处理
}

// 生成图片
const generateImage = async () => {
  if (!codePreviewContainer.value || !codeInput.value.trim()) {
    return
  }

  isGenerating.value = true
  
  try {
    const canvas = await html2canvas(codePreviewContainer.value, {
      scale: imageScale.value,
      backgroundColor: null,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: imageWidth.value,
      height: codePreviewContainer.value.scrollHeight
    })

    // 转换为图片URL
    generatedImageUrl.value = canvas.toDataURL('image/png', 1.0)
  } catch (error) {
    console.error('生成图片失败:', error)
    alert('生成图片失败，请重试')
  } finally {
    isGenerating.value = false
  }
}

// 下载图片
const downloadImage = () => {
  if (!generatedImageUrl.value) return

  const link = document.createElement('a')
  link.download = `code-image-${Date.now()}.png`
  link.href = generatedImageUrl.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 清空代码
const clearCode = () => {
  codeInput.value = ''
  generatedImageUrl.value = ''
  updateHighlight()
}

// 监听主题变化
watch(selectedTheme, (newTheme) => {
  loadThemeStyle(newTheme)
  setTimeout(updateHighlight, 100) // 等待样式加载
})

// 组件挂载
onMounted(() => {
  loadThemeStyle(selectedTheme.value)
  updateHighlight()
})
</script>

<style scoped>
.code-image-generator {
  padding: 20px;
  background: #f8f9fa;
  min-height: 100vh;
  overflow-y: auto;
}

.header {
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.title-section {
  flex: 1;
  text-align: center;
}

.back-button {
  padding: 10px 20px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.back-button:hover {
  background: #5a67d8;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.subtitle {
  font-size: 1.1rem;
  color: #7f8c8d;
}

.main-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 左侧区域样式 */
.left-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

/* 左侧区域样式 */
.left-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 控制面板样式 */
.control-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.control-panel h3 {
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-size: 1.2rem;
}

.control-group {
  margin-bottom: 20px;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #34495e;
}

.control-group select,
.control-group input[type="number"] {
  width: 100%;
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.control-group select:focus,
.control-group input[type="number"]:focus {
  outline: none;
  border-color: #667eea;
}

.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 8px;
  font-weight: normal !important;
  margin-bottom: 0 !important;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.size-controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.size-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.size-input label {
  min-width: 50px;
  margin-bottom: 0 !important;
}

.size-input input[type="range"] {
  flex: 1;
}

.action-buttons {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.action-buttons button {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.generate-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.download-btn {
  background: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
  color: white;
}

.download-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(86, 171, 47, 0.4);
}

.download-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-btn {
  background: linear-gradient(135deg, #ff6b6b 0%, #ffa8a8 100%);
  color: white;
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

/* 预览区域样式 */
.preview-area {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.code-input-section,
.code-preview-section,
.generated-image-section {
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.code-input-section h3,
.code-preview-section h3,
.generated-image-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.2rem;
}

.code-textarea {
  width: 100%;
  height: 200px;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.3s;
}

.code-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.code-preview-container {
  padding: 30px;
  border-radius: 15px;
  margin: 0 auto;
  transition: all 0.3s;
}

.code-preview-container.with-shadow {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.code-window {
  background: v-bind('currentThemeConfig.windowBg');
  border: 1px solid v-bind('currentThemeConfig.windowBorder');
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.window-controls {
  background: v-bind('currentThemeConfig.controlsBg');
  padding: 12px 15px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.control-button {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.control-button.close {
  background: #ff5f57;
}

.control-button.minimize {
  background: #ffbd2e;
}

.control-button.maximize {
  background: #28ca42;
}

.code-content {
  display: flex;
  background: v-bind('currentThemeConfig.windowBg');
  color: #d4d4d4;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

.line-numbers {
  background: v-bind('currentThemeConfig.lineNumbersBg');
  color: v-bind('currentThemeConfig.lineNumbersColor');
  padding: 20px 15px;
  margin: 0;
  text-align: right;
  user-select: none;
  border-right: 1px solid v-bind('currentThemeConfig.windowBorder');
  min-width: 50px;
}

.line-numbers code {
  display: block;
  height: 1.6em;
}

.code-block {
  flex: 1;
  margin: 0;
  padding: 20px;
  overflow-x: auto;
  background: transparent;
}

.code-block code {
  background: transparent !important;
  padding: 0 !important;
}

.image-preview {
  text-align: center;
}

.image-preview img {
  max-width: 100%;
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.image-info {
  margin-top: 15px;
  color: #7f8c8d;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .control-panel {
    position: static;
    max-height: none;
    overflow-y: visible;
  }
}

@media (max-width: 768px) {
  .code-image-generator {
    padding: 15px;
  }
  
  .header-top {
    margin-bottom: 15px;
  }
  
  .back-button {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .control-panel,
  .code-input-section,
  .code-preview-section,
  .generated-image-section {
    padding: 20px;
  }
  
  .code-preview-container {
    padding: 20px;
  }
  
  .imageWidth {
    max-width: 100%;
  }
  
  .main-content {
    gap: 15px;
  }
}
</style>