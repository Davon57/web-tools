<template>
  <div class="calculator">
    <div class="calculator-container">
      <h2 class="tool-title">🧮 计算器</h2>
      <p class="tool-description">基础数学计算工具，支持加减乘除等运算</p>
      
      <div class="calculator-body">
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
        
        <!-- 历史记录 -->
        <div class="history-section" v-if="calculationHistory.length > 0">
          <h3>计算历史</h3>
          <div class="history-list">
            <div 
              v-for="(record, index) in calculationHistory.slice(-5)" 
              :key="index"
              class="history-item"
              @click="useHistoryResult(record.result)"
            >
              <span class="history-expression">{{ record.expression }}</span>
              <span class="history-result">= {{ record.result }}</span>
            </div>
          </div>
          <button @click="clearHistory" class="clear-history-btn">清空历史</button>
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
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.calculator-container {
  background: white;
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.tool-title {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 10px;
  text-align: center;
}

.tool-description {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 30px;
}

.calculator-body {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 30px;
}

.display {
  background: #2c3e50;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: right;
  color: white;
  grid-column: 1 / -1;
}

.display-history {
  font-size: 14px;
  color: #bdc3c7;
  min-height: 20px;
  margin-bottom: 10px;
}

.display-current {
  font-size: 32px;
  font-weight: bold;
  word-break: break-all;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.btn {
  height: 60px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn:active {
  transform: translateY(0);
}

.btn-number {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-number:hover {
  background: #d5dbdb;
}

.btn-operator {
  background: #3498db;
  color: white;
}

.btn-operator:hover {
  background: #2980b9;
}

.btn-function {
  background: #95a5a6;
  color: white;
}

.btn-function:hover {
  background: #7f8c8d;
}

.btn-equals {
  background: #e74c3c;
  color: white;
}

.btn-equals:hover {
  background: #c0392b;
}

.history-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
}

.history-section h3 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 16px;
}

.history-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
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
  .calculator-body {
    grid-template-columns: 1fr;
  }
  
  .display-current {
    font-size: 24px;
  }
  
  .btn {
    height: 50px;
    font-size: 16px;
  }
}
</style>