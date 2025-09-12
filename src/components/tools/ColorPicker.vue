<template>
  <div class="color-picker-container">
    <div class="tool-header">
      <button @click="$router.push('/')" class="back-btn">← 返回主页</button>
      <h2>🎨 颜色选择器</h2>
      <p>选择颜色并获取多种格式的颜色值</p>
    </div>

    <div class="color-picker-content">
      <!-- 左侧：颜色选择和调色板 -->
      <div class="color-picker-left">
        <!-- 主要颜色选择区域 -->
        <div class="color-main-section">
          <div class="color-display">
            <div 
              class="color-preview" 
              :style="{ backgroundColor: currentColor }"
            ></div>
            <input 
              type="color" 
              v-model="currentColor" 
              class="color-input"
              @input="updateColor"
            >
          </div>
        </div>
        
        <!-- 调色板 -->
        <div class="palette-section">
          <h3>常用颜色</h3>
          <div class="color-palette">
            <div 
              v-for="color in commonColors" 
              :key="color"
              class="palette-color"
              :style="{ backgroundColor: color }"
              @click="selectPaletteColor(color)"
              :title="color"
            ></div>
          </div>
        </div>
      </div>
      
      <!-- 右侧：颜色值和历史记录 -->
      <div class="color-picker-right">
        <!-- 颜色值显示 -->
        <div class="color-values-section">
          <h3>颜色值</h3>
          <div class="color-values">
          <div class="color-format">
            <label>HEX:</label>
            <div class="value-group">
              <input 
                type="text" 
                :value="colorFormats.hex" 
                @input="updateFromHex"
                class="color-value-input"
              >
              <button @click="copyToClipboard(colorFormats.hex)" class="copy-btn">复制</button>
            </div>
          </div>

          <div class="color-format">
            <label>RGB:</label>
            <div class="value-group">
              <input 
                type="text" 
                :value="colorFormats.rgb" 
                readonly
                class="color-value-input"
              >
              <button @click="copyToClipboard(colorFormats.rgb)" class="copy-btn">复制</button>
            </div>
          </div>

          <div class="color-format">
            <label>HSL:</label>
            <div class="value-group">
              <input 
                type="text" 
                :value="colorFormats.hsl" 
                readonly
                class="color-value-input"
              >
              <button @click="copyToClipboard(colorFormats.hsl)" class="copy-btn">复制</button>
            </div>
          </div>

          <div class="color-format">
            <label>HSV:</label>
            <div class="value-group">
              <input 
                type="text" 
                :value="colorFormats.hsv" 
                readonly
                class="color-value-input"
              >
              <button @click="copyToClipboard(colorFormats.hsv)" class="copy-btn">复制</button>
            </div>
          </div>
        </div>
        </div>
        
        <!-- 渐变色生成 -->
        <div class="gradient-section">
        <h3>渐变色生成</h3>
        <div class="gradient-controls">
          <div class="gradient-colors">
            <div class="gradient-color-item">
              <label>起始颜色:</label>
              <input type="color" v-model="gradientStart" @input="updateGradient">
            </div>
            <div class="gradient-color-item">
              <label>结束颜色:</label>
              <input type="color" v-model="gradientEnd" @input="updateGradient">
            </div>
          </div>
          <div class="gradient-preview" :style="{ background: gradientCSS }"></div>
          <div class="gradient-output">
            <label>CSS渐变:</label>
            <div class="value-group">
              <textarea 
                :value="gradientCSS" 
                readonly
                class="gradient-textarea"
              ></textarea>
              <button @click="copyToClipboard(gradientCSS)" class="copy-btn">复制</button>
            </div>
          </div>
        </div>
        
        <!-- 颜色历史 -->
        <div class="history-section" v-if="colorHistory.length > 0">
          <h3>颜色历史</h3>
          <div class="color-history">
            <div 
              v-for="(color, index) in colorHistory" 
              :key="index"
              class="history-color"
              :style="{ backgroundColor: color }"
              @click="selectPaletteColor(color)"
              :title="color"
            ></div>
          </div>
          <button @click="clearHistory" class="clear-history-btn">清空历史</button>
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useToolsStore } from '@/stores/counter'

const toolsStore = useToolsStore()

// 当前选中的颜色
const currentColor = ref('#3498db')

// 渐变色设置
const gradientStart = ref('#3498db')
const gradientEnd = ref('#e74c3c')

// 颜色历史
const colorHistory = ref([])

// 常用颜色调色板
const commonColors = [
  '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
  '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
  '#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF', '#800000',
  '#808000', '#008000', '#008080', '#000080', '#800080', '#FFA500',
  '#FFD700', '#ADFF2F', '#00CED1', '#1E90FF', '#9370DB', '#FF1493'
]

// 颜色格式转换
const colorFormats = computed(() => {
  const hex = currentColor.value
  const rgb = hexToRgb(hex)
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
  
  return {
    hex: hex.toUpperCase(),
    rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
    hsv: `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`
  }
})

// 渐变CSS
const gradientCSS = computed(() => {
  return `linear-gradient(45deg, ${gradientStart.value}, ${gradientEnd.value})`
})

// 颜色转换函数
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

function rgbToHsl(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }
  
  return { h: h * 360, s: s * 100, l: l * 100 }
}

function rgbToHsv(r, g, b) {
  r /= 255
  g /= 255
  b /= 255
  
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  
  const h = d === 0 ? 0 : 
    max === r ? ((g - b) / d) % 6 :
    max === g ? (b - r) / d + 2 :
    (r - g) / d + 4
  
  const s = max === 0 ? 0 : d / max
  const v = max
  
  return { h: h * 60, s: s * 100, v: v * 100 }
}

// 更新颜色
function updateColor() {
  addToHistory(currentColor.value)
  toolsStore.addToHistory('颜色选择器')
}

// 从HEX输入更新颜色
function updateFromHex(event) {
  const hex = event.target.value
  if (/^#[0-9A-F]{6}$/i.test(hex)) {
    currentColor.value = hex
    addToHistory(hex)
  }
}

// 选择调色板颜色
function selectPaletteColor(color) {
  currentColor.value = color
  addToHistory(color)
  toolsStore.addToHistory('颜色选择器')
}

// 更新渐变
function updateGradient() {
  // 渐变更新时的逻辑
}

// 添加到历史记录
function addToHistory(color) {
  if (!colorHistory.value.includes(color)) {
    colorHistory.value.unshift(color)
    if (colorHistory.value.length > 20) {
      colorHistory.value = colorHistory.value.slice(0, 20)
    }
  }
}

// 清空历史
function clearHistory() {
  colorHistory.value = []
}

// 复制到剪贴板
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // 可以添加提示信息
  })
}

// 监听颜色变化
watch(currentColor, (newColor) => {
  addToHistory(newColor)
})
</script>

<style scoped>
.color-picker-container {
  width: 100vw;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.tool-header {
  position: relative;
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(0, 123, 255, 0.1);
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

.tool-header h2 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tool-header p {
  color: #6c757d;
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1.6;
}

.color-picker-content {
  display: flex;
  gap: 30px;
  margin-top: 30px;
  flex: 1;
  min-height: 0;
}

.color-picker-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.color-picker-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.color-main-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 40px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 35px;
  border-radius: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.color-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.color-preview {
  width: 200px;
  height: 200px;
  border-radius: 15px;
  border: 3px solid #ecf0f1;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.color-input {
  width: 100px;
  height: 60px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.color-values {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.color-format {
  display: flex;
  align-items: center;
  gap: 15px;
}

.color-format label {
  width: 60px;
  font-weight: bold;
  color: #2c3e50;
}

.value-group {
  display: flex;
  gap: 10px;
  flex: 1;
}

.color-value-input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.copy-btn {
  background: linear-gradient(145deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.copy-btn:hover {
  background: linear-gradient(145deg, #2980b9, #21618c);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.4);
}

.palette-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 35px;
  border-radius: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.gradient-section,
.history-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 35px;
  border-radius: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.palette-section h3,
.gradient-section h3,
.history-section h3 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.color-palette,
.color-history {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.palette-color,
.history-color {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  cursor: pointer;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.palette-color:hover,
.history-color:hover {
  transform: scale(1.15) translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
  border-color: rgba(255, 255, 255, 1);
}

.gradient-controls {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.gradient-colors {
  display: flex;
  gap: 20px;
}

.gradient-color-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.gradient-color-item label {
  font-weight: bold;
  color: #2c3e50;
}

.gradient-color-item input[type="color"] {
  width: 60px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.gradient-preview {
  height: 60px;
  border-radius: 10px;
  border: 2px solid #ecf0f1;
}

.gradient-output {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.gradient-output label {
  font-weight: bold;
  color: #2c3e50;
  margin-top: 10px;
}

.gradient-textarea {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
  resize: vertical;
  min-height: 60px;
}

.clear-history-btn {
  background: linear-gradient(145deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.clear-history-btn:hover {
  background: linear-gradient(145deg, #c0392b, #a93226);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(231, 76, 60, 0.4);
}

@media (max-width: 768px) {
  .color-picker-container {
    padding: 15px;
    min-height: 100vh;
  }
  
  .color-picker-content {
    flex-direction: column;
    gap: 20px;
  }
  
  .color-picker-left,
  .color-picker-right {
    flex: none;
  }
  
  .color-picker-right {
    max-height: 60vh;
    overflow-y: auto;
  }
  
  .color-main-section {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .gradient-colors {
    flex-direction: column;
  }
  
  .color-palette,
  .color-history {
    grid-template-columns: repeat(auto-fill, minmax(35px, 1fr));
  }
  
  .palette-color,
  .history-color {
    width: 35px;
    height: 35px;
  }
}
</style>