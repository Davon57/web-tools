<template>
  <div class="calculator">
    <div class="calculator-container">
      <div class="tool-header">
        <button @click="$router.push('/')" class="back-btn">← 返回主页</button>
        <h2 class="tool-title">🧮 计算器</h2>
        <p class="tool-description">基础数学计算工具，支持加减乘除等运算</p>
      </div>
      
      <div class="calculator-body">
        <!-- 左侧：计算器主体 -->
        <div class="calculator-main">
          <!-- 显示屏 -->
          <div class="display">
            <div class="display-history">{{ history }}</div>
            <div class="display-current">{{ display }}</div>
          </div>
          
          <!-- 按钮区域 -->
          <div class="buttons">
            <!-- 第一行 -->
            <button @click="clear" class="btn btn-function">C</button>
            <button @click="clearEntry" class="btn btn-function">CE</button>
            <button @click="backspace" class="btn btn-function">⌫</button>
            <button @click="inputOperator('/')" class="btn btn-operator">÷</button>
            
            <!-- 第二行 -->
            <button @click="inputNumber('7')" class="btn btn-number">7</button>
            <button @click="inputNumber('8')" class="btn btn-number">8</button>
            <button @click="inputNumber('9')" class="btn btn-number">9</button>
            <button @click="inputOperator('*')" class="btn btn-operator">×</button>
            
            <!-- 第三行 -->
            <button @click="inputNumber('4')" class="btn btn-number">4</button>
            <button @click="inputNumber('5')" class="btn btn-number">5</button>
            <button @click="inputNumber('6')" class="btn btn-number">6</button>
            <button @click="inputOperator('-')" class="btn btn-operator">-</button>
            
            <!-- 第四行 -->
            <button @click="inputNumber('1')" class="btn btn-number">1</button>
            <button @click="inputNumber('2')" class="btn btn-number">2</button>
            <button @click="inputNumber('3')" class="btn btn-number">3</button>
            <button @click="inputOperator('+')" class="btn btn-operator">+</button>
            
            <!-- 第五行 -->
            <button @click="toggleSign" class="btn btn-function">±</button>
            <button @click="inputNumber('0')" class="btn btn-number">0</button>
            <button @click="inputDecimal" class="btn btn-function">.</button>
            <button @click="calculate" class="btn btn-equals">=</button>
          </div>
        </div>
        
        <!-- 右侧：历史记录 -->
        <div class="history-sidebar">
          <div class="history-section">
            <h3>计算历史</h3>
            <div class="history-list" v-if="calculationHistory.length > 0">
              <div 
                v-for="(record, index) in calculationHistory.slice(-10)" 
                :key="index"
                class="history-item"
                @click="useHistoryResult(record.result)"
              >
                <span class="history-expression">{{ record.expression }}</span>
                <span class="history-result">= {{ record.result }}</span>
              </div>
            </div>
            <div v-else class="no-history">
              <p>暂无计算历史</p>
            </div>
            <button 
              v-if="calculationHistory.length > 0" 
              @click="clearHistory" 
              class="clear-history-btn"
            >
              清空历史
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const display = ref('0')
const previousValue = ref(null)
const operator = ref(null)
const waitingForOperand = ref(false)
const calculationHistory = ref([])

const history = computed(() => {
  if (previousValue.value !== null && operator.value) {
    return `${previousValue.value} ${getOperatorSymbol(operator.value)}`
  }
  return ''
})

const getOperatorSymbol = (op) => {
  const symbols = {
    '+': '+',
    '-': '-',
    '*': '×',
    '/': '÷'
  }
  return symbols[op] || op
}

const inputNumber = (num) => {
  if (waitingForOperand.value) {
    display.value = num
    waitingForOperand.value = false
  } else {
    display.value = display.value === '0' ? num : display.value + num
  }
}

const inputDecimal = () => {
  if (waitingForOperand.value) {
    display.value = '0.'
    waitingForOperand.value = false
  } else if (display.value.indexOf('.') === -1) {
    display.value += '.'
  }
}

const inputOperator = (nextOperator) => {
  const inputValue = parseFloat(display.value)
  
  if (previousValue.value === null) {
    previousValue.value = inputValue
  } else if (operator.value) {
    const currentValue = previousValue.value || 0
    const newValue = performCalculation(currentValue, inputValue, operator.value)
    
    display.value = String(newValue)
    previousValue.value = newValue
  }
  
  waitingForOperand.value = true
  operator.value = nextOperator
}

const performCalculation = (firstValue, secondValue, operation) => {
  switch (operation) {
    case '+':
      return firstValue + secondValue
    case '-':
      return firstValue - secondValue
    case '*':
      return firstValue * secondValue
    case '/':
      return secondValue !== 0 ? firstValue / secondValue : 0
    default:
      return secondValue
  }
}

const calculate = () => {
  const inputValue = parseFloat(display.value)
  
  if (previousValue.value !== null && operator.value) {
    const expression = `${previousValue.value} ${getOperatorSymbol(operator.value)} ${inputValue}`
    const newValue = performCalculation(previousValue.value, inputValue, operator.value)
    
    // 添加到历史记录
    calculationHistory.value.push({
      expression,
      result: newValue
    })
    
    display.value = String(newValue)
    previousValue.value = null
    operator.value = null
    waitingForOperand.value = true
  }
}

const clear = () => {
  display.value = '0'
  previousValue.value = null
  operator.value = null
  waitingForOperand.value = false
}

const clearEntry = () => {
  display.value = '0'
}

const backspace = () => {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1)
  } else {
    display.value = '0'
  }
}

const toggleSign = () => {
  if (display.value !== '0') {
    display.value = display.value.startsWith('-') 
      ? display.value.slice(1) 
      : '-' + display.value
  }
}

const useHistoryResult = (result) => {
  display.value = String(result)
  previousValue.value = null
  operator.value = null
  waitingForOperand.value = false
}

const clearHistory = () => {
  calculationHistory.value = []
}
</script>

<style scoped>
.calculator {
  min-height: 100vh;
  width: 100vw;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-sizing: border-box;
}

.calculator-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: calc(100vh - 40px);
  display: flex;
  flex-direction: column;
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
  font-size: 3em;
  color: white;
  margin-bottom: 40px;
  text-align: center;
  font-weight: 700;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
}

.tool-description {
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.1em;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.calculator-body {
  display: flex;
  gap: 30px;
  flex: 1;
  min-height: 0;
}

.calculator-main {
  flex: 2;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.display {
  background: linear-gradient(145deg, #2c3e50, #34495e);
  border-radius: 15px;
  padding: 25px;
  margin-bottom: 25px;
  text-align: right;
  color: white;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.3), 0 5px 15px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.1);
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.display-history {
  font-size: 1.4em;
  color: #bdc3c7;
  min-height: 20px;
  margin-bottom: 10px;
  opacity: 0.8;
}

.display-current {
  font-size: 3em;
  font-weight: 300;
  word-break: break-all;
  text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  letter-spacing: 1px;
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  flex: 1;
  align-content: start;
}

.btn {
  height: 60px;
  border: none;
  border-radius: 15px;
  font-size: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.btn:active {
  transform: translateY(-1px) scale(0.98);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.btn-number {
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  color: #2c3e50;
  font-weight: 500;
}

.btn-number:hover {
  background: linear-gradient(145deg, #f8f9fa, #e9ecef);
  color: #1a252f;
}

.btn-operator {
  background: linear-gradient(145deg, #3498db, #2980b9);
  color: white;
  font-weight: 600;
}

.btn-operator:hover {
  background: linear-gradient(145deg, #2980b9, #21618c);
}

.btn-function {
  background: linear-gradient(145deg, #95a5a6, #7f8c8d);
  color: white;
  font-weight: 600;
}

.btn-function:hover {
  background: linear-gradient(145deg, #7f8c8d, #6c7b7d);
}

.btn-equals {
  background: linear-gradient(145deg, #e74c3c, #c0392b);
  color: white;
  font-weight: 700;
  font-size: 22px;
}

.btn-equals:hover {
  background: linear-gradient(145deg, #c0392b, #a93226);
}

.history-sidebar {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.history-section {
  background: #f8f9fa;
  border-radius: 15px;
  padding: 25px;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.history-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  min-height: 0;
}

.no-history {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-style: italic;
  margin-bottom: 20px;
}

.no-history p {
  margin: 0;
  font-size: 16px;
}

.history-item {
  padding: 10px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #e9ecef;
}

.history-item:hover {
  background: #e3f2fd;
  border-color: #3498db;
}

.history-expression {
  display: block;
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.history-result {
  display: block;
  font-size: 14px;
  color: #2c3e50;
  font-weight: 500;
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

@media (max-width: 768px) {
  .calculator {
    padding: 10px;
  }
  
  .calculator-container {
    padding: 15px;
    height: calc(100vh - 20px);
  }
  
  .calculator-body {
    flex-direction: column;
    gap: 20px;
  }
  
  .calculator-main {
    flex: none;
  }
  
  .history-sidebar {
    flex: none;
    max-height: 300px;
  }
  
  .display-current {
    font-size: 2em;
  }
  
  .btn {
    height: 50px;
    font-size: 16px;
  }
  
  .buttons {
    gap: 10px;
  }
}
</style>