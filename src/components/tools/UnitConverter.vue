<template>
  <div class="unit-converter">
    <div class="converter-container">
      <div class="tool-header">
        <button @click="$router.push('/')" class="back-btn">← 返回主页</button>
        <h2 class="tool-title">📏 单位转换器</h2>
        <p class="tool-description">支持长度、重量、温度、面积、体积等多种单位转换</p>
      </div>
      
      <div class="converter-body">
        <div class="converter-layout">
          <!-- 左侧：主要转换器 -->
          <div class="converter-left">
            <!-- 转换类型选择 -->
            <div class="category-selector">
              <h3>选择转换类型</h3>
              <div class="category-buttons">
                <button 
                  v-for="category in categories" 
                  :key="category.key"
                  @click="selectCategory(category.key)"
                  :class="['category-btn', { active: selectedCategory === category.key }]"
                >
                  {{ category.icon }} {{ category.name }}
                </button>
              </div>
            </div>
            
            <!-- 转换器主体 -->
            <div class="converter-main" v-if="selectedCategory">
              <div class="conversion-row">
                <!-- 输入部分 -->
                <div class="input-section">
                  <label>从</label>
                  <div class="input-group">
                    <input 
                      v-model="inputValue" 
                      type="number" 
                      placeholder="输入数值"
                      @input="convert"
                      class="value-input"
                    >
                    <select v-model="fromUnit" @change="convert" class="unit-select">
                      <option 
                        v-for="unit in getCurrentUnits()" 
                        :key="unit.key" 
                        :value="unit.key"
                      >
                        {{ unit.name }} ({{ unit.symbol }})
                      </option>
                    </select>
                  </div>
                </div>
                
                <!-- 交换按钮 -->
                <div class="swap-section">
                  <button @click="swapUnits" class="swap-btn" title="交换单位">
                    ⇄
                  </button>
                </div>
                
                <!-- 输出部分 -->
                <div class="output-section">
                  <label>到</label>
                  <div class="input-group">
                    <input 
                      v-model="outputValue" 
                      type="text" 
                      readonly
                      class="value-input output"
                    >
                    <select v-model="toUnit" @change="convert" class="unit-select">
                      <option 
                        v-for="unit in getCurrentUnits()" 
                        :key="unit.key" 
                        :value="unit.key"
                      >
                        {{ unit.name }} ({{ unit.symbol }})
                      </option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 右侧：转换历史 -->
          <div class="converter-right">
            <!-- 转换历史 -->
            <div class="history-section" v-if="conversionHistory.length > 0">
              <h3>转换历史</h3>
              <div class="history-list">
                <div 
                  v-for="(record, index) in conversionHistory.slice(-5)" 
                  :key="index"
                  class="history-item"
                  @click="useHistoryConversion(record)"
                >
                  <div class="history-conversion">
                    {{ record.inputValue }} {{ record.fromUnit }} = {{ record.outputValue }} {{ record.toUnit }}
                  </div>
                  <div class="history-category">{{ record.category }}</div>
                </div>
              </div>
              <button @click="clearHistory" class="clear-history-btn">清空历史</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const inputValue = ref('')
const outputValue = ref('')
const selectedCategory = ref('')
const fromUnit = ref('')
const toUnit = ref('')
const conversionHistory = ref([])

const categories = [
  { key: 'length', name: '长度', icon: '📏' },
  { key: 'weight', name: '重量', icon: '⚖️' },
  { key: 'temperature', name: '温度', icon: '🌡️' },
  { key: 'area', name: '面积', icon: '📐' },
  { key: 'volume', name: '体积', icon: '🥤' },
  { key: 'speed', name: '速度', icon: '🚗' },
  { key: 'time', name: '时间', icon: '⏰' }
]

const units = {
  length: [
    { key: 'mm', name: '毫米', symbol: 'mm', toMeter: 0.001 },
    { key: 'cm', name: '厘米', symbol: 'cm', toMeter: 0.01 },
    { key: 'm', name: '米', symbol: 'm', toMeter: 1 },
    { key: 'km', name: '千米', symbol: 'km', toMeter: 1000 },
    { key: 'in', name: '英寸', symbol: 'in', toMeter: 0.0254 },
    { key: 'ft', name: '英尺', symbol: 'ft', toMeter: 0.3048 },
    { key: 'yd', name: '码', symbol: 'yd', toMeter: 0.9144 },
    { key: 'mi', name: '英里', symbol: 'mi', toMeter: 1609.344 }
  ],
  weight: [
    { key: 'mg', name: '毫克', symbol: 'mg', toKg: 0.000001 },
    { key: 'g', name: '克', symbol: 'g', toKg: 0.001 },
    { key: 'kg', name: '千克', symbol: 'kg', toKg: 1 },
    { key: 't', name: '吨', symbol: 't', toKg: 1000 },
    { key: 'oz', name: '盎司', symbol: 'oz', toKg: 0.0283495 },
    { key: 'lb', name: '磅', symbol: 'lb', toKg: 0.453592 }
  ],
  temperature: [
    { key: 'c', name: '摄氏度', symbol: '°C' },
    { key: 'f', name: '华氏度', symbol: '°F' },
    { key: 'k', name: '开尔文', symbol: 'K' }
  ],
  area: [
    { key: 'mm2', name: '平方毫米', symbol: 'mm²', toM2: 0.000001 },
    { key: 'cm2', name: '平方厘米', symbol: 'cm²', toM2: 0.0001 },
    { key: 'm2', name: '平方米', symbol: 'm²', toM2: 1 },
    { key: 'km2', name: '平方千米', symbol: 'km²', toM2: 1000000 },
    { key: 'in2', name: '平方英寸', symbol: 'in²', toM2: 0.00064516 },
    { key: 'ft2', name: '平方英尺', symbol: 'ft²', toM2: 0.092903 },
    { key: 'acre', name: '英亩', symbol: 'acre', toM2: 4046.86 }
  ],
  volume: [
    { key: 'ml', name: '毫升', symbol: 'ml', toLiter: 0.001 },
    { key: 'l', name: '升', symbol: 'L', toLiter: 1 },
    { key: 'm3', name: '立方米', symbol: 'm³', toLiter: 1000 },
    { key: 'floz', name: '液体盎司', symbol: 'fl oz', toLiter: 0.0295735 },
    { key: 'cup', name: '杯', symbol: 'cup', toLiter: 0.236588 },
    { key: 'gal', name: '加仑', symbol: 'gal', toLiter: 3.78541 }
  ],
  speed: [
    { key: 'ms', name: '米每秒', symbol: 'm/s', toMs: 1 },
    { key: 'kmh', name: '千米每小时', symbol: 'km/h', toMs: 0.277778 },
    { key: 'mph', name: '英里每小时', symbol: 'mph', toMs: 0.44704 },
    { key: 'knot', name: '节', symbol: 'knot', toMs: 0.514444 }
  ],
  time: [
    { key: 'ms', name: '毫秒', symbol: 'ms', toSecond: 0.001 },
    { key: 's', name: '秒', symbol: 's', toSecond: 1 },
    { key: 'min', name: '分钟', symbol: 'min', toSecond: 60 },
    { key: 'h', name: '小时', symbol: 'h', toSecond: 3600 },
    { key: 'd', name: '天', symbol: 'd', toSecond: 86400 },
    { key: 'w', name: '周', symbol: 'w', toSecond: 604800 },
    { key: 'y', name: '年', symbol: 'y', toSecond: 31536000 }
  ]
}

const getCurrentUnits = () => {
  return units[selectedCategory.value] || []
}

const selectCategory = (category) => {
  selectedCategory.value = category
  const currentUnits = getCurrentUnits()
  if (currentUnits.length > 0) {
    fromUnit.value = currentUnits[0].key
    toUnit.value = currentUnits[1]?.key || currentUnits[0].key
  }
  convert()
}

const convert = () => {
  if (!inputValue.value || isNaN(inputValue.value) || !selectedCategory.value) {
    outputValue.value = ''
    return
  }
  
  const result = convertValue(parseFloat(inputValue.value), fromUnit.value, toUnit.value)
  outputValue.value = formatResult(result)
  
  // 添加到历史记录
  if (result !== null && inputValue.value) {
    const fromUnitObj = getCurrentUnits().find(u => u.key === fromUnit.value)
    const toUnitObj = getCurrentUnits().find(u => u.key === toUnit.value)
    
    conversionHistory.value.push({
      inputValue: inputValue.value,
      outputValue: outputValue.value,
      fromUnit: fromUnitObj?.symbol || fromUnit.value,
      toUnit: toUnitObj?.symbol || toUnit.value,
      category: categories.find(c => c.key === selectedCategory.value)?.name || selectedCategory.value
    })
  }
}

const convertValue = (value, from, to) => {
  if (from === to) return value
  
  const category = selectedCategory.value
  
  if (category === 'temperature') {
    return convertTemperature(value, from, to)
  }
  
  const fromUnit = getCurrentUnits().find(u => u.key === from)
  const toUnit = getCurrentUnits().find(u => u.key === to)
  
  if (!fromUnit || !toUnit) return null
  
  // 根据不同类别使用不同的基准单位
  let baseValue
  if (category === 'length') {
    baseValue = value * fromUnit.toMeter
    return baseValue / toUnit.toMeter
  } else if (category === 'weight') {
    baseValue = value * fromUnit.toKg
    return baseValue / toUnit.toKg
  } else if (category === 'area') {
    baseValue = value * fromUnit.toM2
    return baseValue / toUnit.toM2
  } else if (category === 'volume') {
    baseValue = value * fromUnit.toLiter
    return baseValue / toUnit.toLiter
  } else if (category === 'speed') {
    baseValue = value * fromUnit.toMs
    return baseValue / toUnit.toMs
  } else if (category === 'time') {
    baseValue = value * fromUnit.toSecond
    return baseValue / toUnit.toSecond
  }
  
  return null
}

const convertTemperature = (value, from, to) => {
  if (from === to) return value
  
  // 先转换为摄氏度
  let celsius
  if (from === 'c') celsius = value
  else if (from === 'f') celsius = (value - 32) * 5/9
  else if (from === 'k') celsius = value - 273.15
  
  // 再从摄氏度转换为目标单位
  if (to === 'c') return celsius
  else if (to === 'f') return celsius * 9/5 + 32
  else if (to === 'k') return celsius + 273.15
  
  return null
}

const formatResult = (value) => {
  if (value === null || isNaN(value)) return ''
  
  // 根据数值大小决定小数位数
  if (Math.abs(value) >= 1000000) {
    return value.toExponential(6)
  } else if (Math.abs(value) >= 1) {
    return parseFloat(value.toFixed(6)).toString()
  } else {
    return parseFloat(value.toFixed(8)).toString()
  }
}



const swapUnits = () => {
  const temp = fromUnit.value
  fromUnit.value = toUnit.value
  toUnit.value = temp
  
  const tempValue = inputValue.value
  inputValue.value = outputValue.value
  
  convert()
}

const useHistoryConversion = (record) => {
  // 根据历史记录设置转换
  const category = categories.find(c => c.name === record.category)
  if (category) {
    selectCategory(category.key)
    
    // 设置单位
    const currentUnits = getCurrentUnits()
    const fromUnitObj = currentUnits.find(u => u.symbol === record.fromUnit)
    const toUnitObj = currentUnits.find(u => u.symbol === record.toUnit)
    
    if (fromUnitObj && toUnitObj) {
      fromUnit.value = fromUnitObj.key
      toUnit.value = toUnitObj.key
      inputValue.value = record.inputValue
      convert()
    }
  }
}

const clearHistory = () => {
  conversionHistory.value = []
}

onMounted(() => {
  // 默认选择长度转换
  selectCategory('length')
})
</script>

<style scoped>
.unit-converter {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  overflow-y: auto;
}

.unit-converter .converter-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.9));
  backdrop-filter: blur(10px);
  border-radius: 25px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.converter-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

.converter-left {
  min-height: 400px;
}

.converter-right {
  height: 600px;
  overflow: hidden;
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
  margin-bottom: 15px;
  text-align: center;
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.tool-description {
  text-align: center;
  color: #6c757d;
  margin-bottom: 40px;
  font-size: 1.2rem;
  font-weight: 500;
  line-height: 1.6;
}

.category-selector {
  margin-bottom: 40px;
  padding: 30px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.8), rgba(248, 249, 250, 0.8));
  backdrop-filter: blur(5px);
  border-radius: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.category-selector h3 {
  color: #2c3e50;
  margin-bottom: 25px;
  font-size: 1.8rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.category-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.category-btn {
  padding: 18px 24px;
  border: 3px solid rgba(233, 236, 239, 0.5);
  border-radius: 15px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(248, 249, 250, 0.9));
  backdrop-filter: blur(5px);
  color: #495057;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.category-btn:hover {
  border-color: rgba(0, 123, 255, 0.8);
  background: linear-gradient(145deg, rgba(227, 242, 253, 0.9), rgba(187, 222, 251, 0.9));
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 30px rgba(0, 123, 255, 0.2);
}

.category-btn.active {
  border-color: #007bff;
  background: linear-gradient(145deg, #007bff, #0056b3);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(0, 123, 255, 0.3);
}

.conversion-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 20px;
  align-items: end;
  margin-bottom: 30px;
}

.input-section,
.output-section {
  display: flex;
  flex-direction: column;
}

.input-section label,
.output-section label {
  color: #495057;
  margin-bottom: 8px;
  font-weight: 500;
}

.input-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.value-input {
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.value-input:focus {
  outline: none;
  border-color: #3498db;
}

.value-input.output {
  background: #f8f9fa;
  color: #495057;
}

.unit-select {
  padding: 12px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
}

.unit-select:focus {
  outline: none;
  border-color: #3498db;
}

.swap-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.swap-btn {
  width: 50px;
  height: 50px;
  border: 2px solid #3498db;
  border-radius: 50%;
  background: white;
  color: #3498db;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.swap-btn:hover {
  background: #3498db;
  color: white;
  transform: rotate(180deg);
}



.history-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.history-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.history-list {
  overflow-y: auto;
  flex: 1;
  margin-bottom: 15px;
  padding-right: 5px;
}

.history-list::-webkit-scrollbar {
  width: 4px;
}

.history-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.history-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.history-item {
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.history-item:hover {
  background: #e3f2fd;
  border-color: #3498db;
}

.history-conversion {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.history-category {
  font-size: 12px;
  color: #7f8c8d;
}

.clear-history-btn {
  width: 100%;
  padding: 8px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;
}

.clear-history-btn:hover {
  background: #c0392b;
}

@media (max-width: 1024px) {
  .converter-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .converter-right {
    height: 400px;
  }
}

@media (max-width: 768px) {
  .conversion-row {
    grid-template-columns: 1fr;
    gap: 15px;
  }
  
  .swap-section {
    order: 3;
  }
  
  .input-group {
    grid-template-columns: 1fr;
  }
  
  .category-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .converter-right {
    height: 300px;
  }
}
</style>