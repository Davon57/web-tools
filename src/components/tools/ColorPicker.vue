<template>
  <div class="color-picker-container">
    <div class="tool-header">
      <h2>🎨 颜色选择器</h2>
      <p>选择颜色并获取多种格式的颜色值</p>
    </div>

    <div class="color-picker-content">
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

        <!-- 颜色值显示 -->
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
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.tool-header {
  text-align: center;
  margin-bottom: 30px;
}

.tool-header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5em;
}

.tool-header p {
  color: #7f8c8d;
  font-size: 1.1em;
}

.color-picker-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.color-main-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 30px;
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
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
  height: 50px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
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
  padding: 10px 15px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.copy-btn:hover {
  background: #2980b9;
}

.palette-section,
.gradient-section,
.history-section {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.palette-section h3,
.gradient-section h3,
.history-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3em;
}

.color-palette,
.color-history {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: 10px;
  margin-bottom: 15px;
}

.palette-color,
.history-color {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid #ecf0f1;
  transition: transform 0.2s;
}

.palette-color:hover,
.history-color:hover {
  transform: scale(1.1);
}

.gradient-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gradient-colors {
  display: flex;
  gap: 20px;
}

.gradient-color-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.gradient-color-item label {
  font-weight: bold;
  color: #2c3e50;
}

.gradient-color-item input[type="color"] {
  width: 50px;
  height: 40px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
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
  padding: 8px 15px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.clear-history-btn:hover {
  background: #c0392b;
}

@media (max-width: 768px) {
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