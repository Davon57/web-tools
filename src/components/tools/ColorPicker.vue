<template>
  <div class="tool-container">
    <div class="tool-wrapper">
      <div class="tool-header">
        <button @click="$router.push('/')" class="tool-back-btn" aria-label="返回主页" title="返回主页">← 返回主页</button>
        <h1 class="tool-title" id="colorpicker-title">
          <span class="tool-icon" aria-hidden="true">🎨</span>
          <span class="tool-text">颜色选择器</span>
        </h1>
        <p class="tool-description" id="colorpicker-description">选择颜色并获取多种格式的颜色值</p>
      </div>

      <div class="tool-body">
        <!-- 左侧：标签页区域 -->
        <div class="tool-main">
          <!-- 标签页导航 -->
          <div class="color-picker-tabs" role="tablist" aria-labelledby="colorpicker-title">
            <button class="color-picker-tab" :class="{ active: activeTab === 'picker' }" @click="activeTab = 'picker'"
              role="tab" :aria-selected="activeTab === 'picker'" aria-controls="picker-panel" id="picker-tab">
              <span aria-hidden="true">🎨</span> 颜色选择
            </button>
            <button class="color-picker-tab" :class="{ active: activeTab === 'schemes' }" @click="activeTab = 'schemes'"
              role="tab" :aria-selected="activeTab === 'schemes'" aria-controls="schemes-panel" id="schemes-tab">
              <span aria-hidden="true">🎯</span> 配色方案
            </button>
            <button class="color-picker-tab" :class="{ active: activeTab === 'gradient' }" @click="activeTab = 'gradient'"
              role="tab" :aria-selected="activeTab === 'gradient'" aria-controls="gradient-panel" id="gradient-tab">
              <span aria-hidden="true">🌈</span> 渐变色生成
            </button>
          </div>

          <!-- 标签页内容 -->
          <div class="tab-content">
            <!-- 颜色选择标签页 -->
            <div v-show="activeTab === 'picker'" class="tab-panel" role="tabpanel" id="picker-panel"
              aria-labelledby="picker-tab" :aria-hidden="activeTab !== 'picker'">
              <!-- 主要颜色选择区域 -->
              <div class="color-main-section">
                <div class="color-display">
                  <div class="color-preview-large interactive" :class="{ 'pulse': isColorChanging }"
                    :style="{ backgroundColor: currentColor }" role="img" :aria-label="`当前选择的颜色: ${currentColor}`"
                    :title="`当前颜色: ${currentColor}`"></div>
                  <div class="color-input-group">
                    <input type="color" v-model="currentColor" class="form-input" @input="updateColor"
                      aria-label="颜色选择器" :title="`当前颜色: ${currentColor}`">
                    <button @click="pickColorFromScreen" class="btn btn-secondary interactive hover-glow"
                      :disabled="!isEyeDropperSupported"
                      :aria-label="isEyeDropperSupported ? '从屏幕吸取颜色' : '浏览器不支持吸取颜色功能'"
                      :title="isEyeDropperSupported ? '从屏幕吸取颜色' : '浏览器不支持吸取颜色功能'">
                      <span aria-hidden="true">🎯</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 调色板 -->
              <div class="palette-section">
                <h3 id="palette-title">常用颜色</h3>
                <div class="color-palette-grid" role="grid" aria-labelledby="palette-title">
                  <div v-for="color in commonColors" :key="color" class="color-palette-item interactive hover-lift"
                    :class="{ 'scale-95': isAnimating && currentColor === color }" :style="{ backgroundColor: color }"
                    @click="selectPaletteColor(color)" :title="color" role="gridcell" :aria-label="`选择颜色 ${color}`"
                    tabindex="0" @keydown.enter="selectPaletteColor(color)"
                    @keydown.space.prevent="selectPaletteColor(color)"></div>
                </div>
              </div>
            </div>

            <!-- 配色方案标签页 -->
            <div v-show="activeTab === 'schemes'" class="tab-panel" role="tabpanel" id="schemes-panel"
              aria-labelledby="schemes-tab" :aria-hidden="activeTab !== 'schemes'">
              <div class="color-schemes-section">
                <h3 id="schemes-title">管理系统配色方案</h3>
                <div class="schemes-container" role="region" aria-labelledby="schemes-title">
                  <div v-for="(scheme, key) in colorSchemes" :key="key" class="color-scheme" role="group"
                    :aria-labelledby="`scheme-${key}-title`">
                    <div class="scheme-header">
                      <h4 :id="`scheme-${key}-title`">{{ scheme.name }}</h4>
                      <p class="scheme-description" :id="`scheme-${key}-desc`">{{ scheme.description }}</p>
                    </div>
                    <div class="scheme-colors" role="group" :aria-labelledby="`scheme-${key}-title`"
                      :aria-describedby="`scheme-${key}-desc`">
                      <div v-for="color in scheme.colors" :key="color" class="scheme-color interactive hover-lift"
                        :class="{ 'scale-95': isAnimating && currentColor === color }"
                        :style="{ backgroundColor: color }" @click="selectPaletteColor(color)" :title="color"
                        role="button" :aria-label="`选择颜色 ${color}`" tabindex="0"
                        @keydown.enter="selectPaletteColor(color)" @keydown.space.prevent="selectPaletteColor(color)">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 渐变色生成标签页 -->
            <div v-show="activeTab === 'gradient'" class="tab-panel" role="tabpanel" id="gradient-panel"
              aria-labelledby="gradient-tab" :aria-hidden="activeTab !== 'gradient'">
              <div class="gradient-section">
                <h3 id="gradient-title">渐变色生成器</h3>
                <div class="gradient-controls" role="region" aria-labelledby="gradient-title">
                  <div class="gradient-inputs">
                    <div class="form-group">
                      <label class="form-label" for="gradient-start">起始颜色:</label>
                      <input type="color" v-model="gradientStart" class="form-input" id="gradient-start"
                        aria-label="渐变起始颜色" @input="updateGradient">
                    </div>
                    <div class="form-group">
                      <label class="form-label" for="gradient-end">结束颜色:</label>
                      <input type="color" v-model="gradientEnd" class="form-input" id="gradient-end"
                        aria-label="渐变结束颜色" @input="updateGradient">
                    </div>
                  </div>
                  <div class="gradient-preview" :style="{ background: gradientCSS }" role="img"
                    :aria-label="`渐变预览: 从 ${gradientStart} 到 ${gradientEnd}`"></div>
                  <div class="form-group">
                    <label class="form-label" for="gradient-css">CSS 渐变:</label>
                    <textarea v-model="gradientCSS" class="form-input" readonly id="gradient-css"
                      aria-label="CSS渐变代码"></textarea>
                    <button @click="copyToClipboard(gradientCSS)" class="btn btn-primary" aria-label="复制CSS渐变代码"
                      title="复制CSS渐变代码">
                      <span aria-hidden="true">📋</span> 复制
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：颜色值和历史记录 -->
        <div class="tool-sidebar">
          <!-- 颜色值显示 -->
          <div class="color-values-section">
            <h3 id="color-values-title">颜色值</h3>
            <div class="color-values" role="region" aria-labelledby="color-values-title">
              <div class="form-group">
                <label class="form-label" for="hex-input">HEX:</label>
                <div class="input-with-copy">
                  <input type="text" :value="colorFormats.hex" @input="updateFromHex" class="form-input" readonly
                    id="hex-input" aria-label="HEX颜色值">
                  <button @click="copyToClipboard(colorFormats.hex)" class="btn btn-sm" aria-label="复制HEX颜色值"
                    title="复制HEX颜色值">
                    <span aria-hidden="true">📋</span>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="rgb-input">RGB:</label>
                <div class="input-with-copy">
                  <input type="text" :value="colorFormats.rgb" class="form-input" readonly id="rgb-input"
                    aria-label="RGB颜色值">
                  <button @click="copyToClipboard(colorFormats.rgb)" class="btn btn-sm" aria-label="复制RGB颜色值"
                    title="复制RGB颜色值">
                    <span aria-hidden="true">📋</span>
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label" for="hsl-input">HSL:</label>
                <div class="input-with-copy">
                  <input type="text" :value="colorFormats.hsl" class="form-input" readonly id="hsl-input"
                    aria-label="HSL颜色值">
                  <button @click="copyToClipboard(colorFormats.hsl)" class="btn btn-sm" aria-label="复制HSL颜色值"
                    title="复制HSL颜色值">
                    <span aria-hidden="true">📋</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 历史记录 -->
          <div class="history-section">
            <h3>使用历史</h3>
            <div class="history-list">
              <div v-for="item in toolsStore.toolHistory.slice(0, 5)" :key="item.timestamp" class="history-item">
                 <span class="history-tool">{{ item.name }}</span>
                 <span class="history-time">{{ new Date(item.timestamp).toLocaleString() }}</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToolsStore } from '@/stores/counter'
import { showNotification } from '@/utils/notification'

const router = useRouter()
const toolsStore = useToolsStore()

// 响应式数据
const activeTab = ref('picker')
const isAnimating = ref(false)
const isColorChanging = ref(false)
const currentColor = ref('#3498db')
const gradientStart = ref('#ff6b6b')
const gradientEnd = ref('#4ecdc4')

// 检查浏览器是否支持EyeDropper API
const isEyeDropperSupported = ref(false)

// 检查EyeDropper API支持
onMounted(() => {
  if (typeof window !== 'undefined' && 'EyeDropper' in window) {
    isEyeDropperSupported.value = true
  }
})

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
    description: '科技现代，适合科技或数据类系统',
    colors: ['#13C2C2', '#36CFC9', '#5CDBD3', '#87E8DE', '#B5F5EC', '#E6FFFB']
  }
})

// 计算属性
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

// 颜色预览动画
const animateColorPreview = () => {
  if (typeof document !== 'undefined') {
    const preview = document.querySelector('.color-preview-large');
    if (preview) {
      preview.classList.add('pulse');
      setTimeout(() => {
        preview.classList.remove('pulse');
      }, 300);
    }
  }
};

// 更新颜色
function updateColor() {
  isColorChanging.value = true;
  animateColorPreview();
  toolsStore.addToolHistory('颜色选择器');
  showNotification.success('颜色已更新');
  
  setTimeout(() => {
    isColorChanging.value = false;
  }, 300);
}

// 从HEX输入更新颜色
function updateFromHex(event) {
  const hex = event.target.value;
  // 验证HEX格式（支持3位和6位）
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (hexRegex.test(hex)) {
    // 将3位HEX转换为6位
    let normalizedHex = hex;
    if (hex.length === 4) {
      normalizedHex = '#' + hex[1] + hex[1] + hex[2] + hex[2] + hex[3] + hex[3];
    }
    currentColor.value = normalizedHex;
    updateColor();
  } else if (hex.length >= 4) {
    showNotification.warning('请输入有效的HEX颜色值（如：#FF0000 或 #F00）');
  }
}

// 选择调色板颜色
function selectPaletteColor(color) {
  if (isAnimating.value) return;
  
  isAnimating.value = true;
  currentColor.value = color;
  animateColorPreview();
  toolsStore.addToolHistory('颜色选择器');
  showNotification.success(`已选择颜色：${color}`);
  
  setTimeout(() => {
    isAnimating.value = false;
  }, 300);
}

// 更新渐变
function updateGradient() {
  showNotification.info('渐变色已更新');
}

// 从屏幕吸取颜色
async function pickColorFromScreen() {
  if (!isEyeDropperSupported.value) {
    showNotification.error('您的浏览器不支持吸取颜色功能，请使用Chrome 95+或其他支持EyeDropper API的浏览器');
    return;
  }

  try {
    showNotification.info('请点击屏幕上的任意位置来吸取颜色');
    const eyeDropper = new EyeDropper();
    const result = await eyeDropper.open();
    
    if (result && result.sRGBHex) {
      currentColor.value = result.sRGBHex;
      animateColorPreview();
      toolsStore.addToolHistory('颜色选择器');
      showNotification.success(`成功吸取颜色：${result.sRGBHex}`);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      // 用户取消了操作，不显示错误信息
      return;
    } else if (error.name === 'NotAllowedError') {
      showNotification.error('浏览器拒绝了颜色选择权限，请检查浏览器设置');
    } else {
      console.error('吸取颜色时发生错误:', error);
      showNotification.error('吸取颜色失败，请重试');
    }
  }
}

// 复制到剪贴板
function copyToClipboard(text) {
  if (!text) {
    showNotification.warning('没有可复制的内容');
    return;
  }
  
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showNotification.success(`已复制到剪贴板：${text}`);
      
      // 添加复制按钮动画效果
      if (typeof document !== 'undefined') {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
          if (button.textContent.includes('复制')) {
            button.classList.add('scale-95');
            setTimeout(() => {
              button.classList.remove('scale-95');
            }, 150);
          }
        });
      }
    }).catch(() => {
      showNotification.error('复制失败，请手动复制');
    });
  } else {
    // 降级方案：使用传统的复制方法
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showNotification.success(`已复制到剪贴板：${text}`);
    } catch (error) {
      showNotification.error('复制失败，请手动复制');
    }
  }
}
</script>

<style scoped>
/* ColorPicker组件的特定样式已在统一的组件样式系统中定义 */
</style>