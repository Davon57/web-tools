<template>
  <div class="color-picker-container">
    <div class="tool-header">
      <button @click="$router.push('/')" class="back-btn">← 返回主页</button>
      <h2>🎨 颜色选择器</h2>
      <p>选择颜色并获取多种格式的颜色值</p>
    </div>

    <div class="color-picker-content">
      <!-- 左侧：标签页区域 -->
      <div class="color-picker-left">
        <!-- 标签页导航 -->
        <div class="tab-navigation">
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'picker' }"
            @click="activeTab = 'picker'"
          >
            🎨 颜色选择
          </button>
          <button 
            class="tab-btn" 
            :class="{ active: activeTab === 'schemes' }"
            @click="activeTab = 'schemes'"
          >
            🎯 配色方案
          </button>
        </div>
        
        <!-- 标签页内容 -->
        <div class="tab-content">
          <!-- 颜色选择标签页 -->
          <div v-show="activeTab === 'picker'" class="tab-panel">
            <!-- 主要颜色选择区域 -->
            <div class="color-main-section">
              <div class="color-display">
                <div 
                  class="color-preview" 
                  :style="{ backgroundColor: currentColor }"
                ></div>
                <div class="color-input-group">
                  <input 
                    type="color" 
                    v-model="currentColor" 
                    class="color-input"
                    @input="updateColor"
                  >
                  <button 
                    @click="pickColorFromScreen" 
                    class="eyedropper-btn"
                    :disabled="!isEyeDropperSupported"
                    :title="isEyeDropperSupported ? '从屏幕吸取颜色' : '浏览器不支持吸取颜色功能'"
                  >
                    🎯
                  </button>
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
          </div>
          
          <!-- 配色方案标签页 -->
          <div v-show="activeTab === 'schemes'" class="tab-panel">
            <div class="color-schemes-section">
              <h3>管理系统配色方案</h3>
              <div class="schemes-container">
                <div 
                  v-for="(scheme, key) in colorSchemes" 
                  :key="key"
                  class="color-scheme"
                >
                  <div class="scheme-header">
                    <h4>{{ scheme.name }}</h4>
                    <p class="scheme-description">{{ scheme.description }}</p>
                  </div>
                  <div class="scheme-colors">
                    <div 
                      v-for="color in scheme.colors" 
                      :key="color"
                      class="scheme-color"
                      :style="{ backgroundColor: color }"
                      @click="selectPaletteColor(color)"
                      :title="color"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
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

// 标签页状态
const activeTab = ref('picker')

// 检查浏览器是否支持EyeDropper API
const isEyeDropperSupported = ref(false)

// 检查EyeDropper API支持
if ('EyeDropper' in window) {
  isEyeDropperSupported.value = true
}



// 常用颜色调色板
const commonColors = [
  '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
  '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
  '#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF', '#800000',
  '#808000', '#008000', '#008080', '#000080', '#800080', '#FFA500',
  '#FFD700', '#ADFF2F', '#00CED1', '#1E90FF', '#9370DB', '#FF1493'
]

// 管理系统颜色搭配套组
const colorSchemes = ref({
  // 蓝色系 - 专业稳重
  blue: {
    name: '蓝色系',
    description: '专业稳重，适合企业管理系统',
    colors: ['#1890FF', '#40A9FF', '#69C0FF', '#91D5FF', '#BAE7FF', '#E6F7FF']
  },
  // 绿色系 - 清新自然
  green: {
    name: '绿色系',
    description: '清新自然，适合环保或健康类系统',
    colors: ['#52C41A', '#73D13D', '#95DE64', '#B7EB8F', '#D9F7BE', '#F6FFED']
  },
  // 紫色系 - 优雅神秘
  purple: {
    name: '紫色系',
    description: '优雅神秘，适合创意或高端系统',
    colors: ['#722ED1', '#9254DE', '#B37FEB', '#D3ADF7', '#EFDBFF', '#F9F0FF']
  },
  // 橙色系 - 活力温暖
  orange: {
    name: '橙色系',
    description: '活力温暖，适合电商或社交系统',
    colors: ['#FA8C16', '#FFA940', '#FFC069', '#FFD591', '#FFE7BA', '#FFF7E6']
  },
  // 红色系 - 热情醒目
  red: {
    name: '红色系',
    description: '热情醒目，适合警示或重要功能',
    colors: ['#F5222D', '#FF4D4F', '#FF7875', '#FFA39E', '#FFCCC7', '#FFF1F0']
  },
  // 青色系 - 科技现代
  cyan: {
    name: '青色系',
    description: '科技现代，适合数据或技术类系统',
    colors: ['#13C2C2', '#36CFC9', '#5CDBD3', '#87E8DE', '#B5F5EC', '#E6FFFB']
  },
  // 灰色系 - 简约中性
  gray: {
    name: '灰色系',
    description: '简约中性，适合极简风格系统',
    colors: ['#595959', '#8C8C8C', '#BFBFBF', '#D9D9D9', '#F0F0F0', '#FAFAFA']
  },
  // 金色系 - 奢华高贵
  gold: {
    name: '金色系',
    description: '奢华高贵，适合金融或VIP系统',
    colors: ['#FAAD14', '#FFC53D', '#FFD666', '#FFE58F', '#FFF1B8', '#FFFBE6']
  }
});

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
  toolsStore.addToHistory('颜色选择器')
}

// 从HEX输入更新颜色
function updateFromHex(event) {
  const hex = event.target.value
  if (/^#[0-9A-F]{6}$/i.test(hex)) {
    currentColor.value = hex
  }
}

// 选择调色板颜色
function selectPaletteColor(color) {
  currentColor.value = color
  toolsStore.addToHistory('颜色选择器')
}

// 更新渐变
function updateGradient() {
  // 渐变更新时的逻辑
}



// 从屏幕吸取颜色
async function pickColorFromScreen() {
  if (!isEyeDropperSupported.value) {
    alert('您的浏览器不支持吸取颜色功能，请使用Chrome 95+或其他支持EyeDropper API的浏览器')
    return
  }

  try {
    const eyeDropper = new EyeDropper()
    const result = await eyeDropper.open()
    
    if (result && result.sRGBHex) {
      currentColor.value = result.sRGBHex
      toolsStore.addToolHistory('颜色选择器')
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      // 用户取消了操作，不显示错误信息
      return
    } else if (error.name === 'NotAllowedError') {
      alert('浏览器拒绝了颜色选择权限，请检查浏览器设置')
    } else {
      console.error('吸取颜色时发生错误:', error)
      alert('吸取颜色失败，请重试')
    }
    // AbortError表示用户取消了操作，不需要显示错误信息
  }
}

// 复制到剪贴板
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    // 可以添加提示信息
  })
}


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
  gap: 0;
}

/* 标签页导航样式 */
.tab-navigation {
  display: flex;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 15px 15px 0 0;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-bottom: none;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.tab-btn {
  flex: 1;
  padding: 15px 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  color: #6c757d;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
}

.tab-btn:last-child {
  border-right: none;
}

.tab-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

/* 标签页内容样式 */
.tab-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: none;
  border-radius: 0 0 15px 15px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.tab-panel {
  height: 100%;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 优化滚动条样式 */
.tab-panel::-webkit-scrollbar {
  width: 8px;
}

.tab-panel::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.tab-panel::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 4px;
}

.tab-panel::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a67d8, #6b46c1);
}

.color-picker-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.color-main-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.color-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.color-preview {
  width: 120px;
  height: 120px;
  border-radius: 15px;
  border: 3px solid #ecf0f1;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.color-input-group {
  display: flex;
  align-items: center;
  gap: 15px;
}

.color-input {
  width: 80px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-radius: 15px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.eyedropper-btn {
  width: 50px;
  height: 50px;
  background: linear-gradient(145deg, #e74c3c, #c0392b);
  color: white;
  border: none;
  border-radius: 15px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 20px rgba(231, 76, 60, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.eyedropper-btn:hover:not(:disabled) {
  background: linear-gradient(145deg, #c0392b, #a93226);
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 12px 25px rgba(231, 76, 60, 0.4);
}

.eyedropper-btn:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.eyedropper-btn:disabled {
  background: linear-gradient(145deg, #bdc3c7, #95a5a6);
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
  box-shadow: 0 4px 10px rgba(189, 195, 199, 0.2);
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
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  flex: 1;
}

.gradient-section {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  padding: 35px;
  border-radius: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  flex: 1;
}

.palette-section h3,
.gradient-section h3 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.palette-color {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  cursor: pointer;
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.palette-color:hover {
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

/* 颜色套组样式 */
.color-schemes-section {
  flex: 1;
}

.color-schemes-section h3 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.schemes-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.color-scheme {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 20px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.color-scheme:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.8);
}

.scheme-header {
  margin-bottom: 15px;
}

.scheme-header h4 {
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.scheme-description {
  color: #6c757d;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
}

.scheme-colors {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.scheme-color {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  border: 2px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.scheme-color:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 1);
  z-index: 10;
}

.scheme-color:hover::after {
  content: attr(title);
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 20;
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
  
  .color-input-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .eyedropper-btn {
    width: 45px;
    height: 45px;
    font-size: 18px;
  }
  
  .gradient-colors {
    flex-direction: column;
  }
  
  .color-palette {
    grid-template-columns: repeat(auto-fill, minmax(35px, 1fr));
  }
  
  .palette-color {
    width: 35px;
    height: 35px;
  }
  
  .tab-btn {
    padding: 12px 15px;
    font-size: 14px;
  }
  
  .tab-panel {
    padding: 15px;
  }
  
  .color-schemes-section {
    padding: 0;
  }
  
  .color-scheme {
    padding: 15px;
  }
  
  .scheme-header h4 {
    font-size: 1.1rem;
  }
  
  .scheme-description {
    font-size: 0.8rem;
  }
  
  .scheme-color {
    width: 30px;
    height: 30px;
  }
}
</style>