<template>
  <div class="tool-container">
    <div class="tool-wrapper">
      <div class="tool-header">
        <button 
          @click="$router.push('/')" 
          class="tool-back-btn"
          aria-label="返回主页"
          title="返回主页"
        >← 返回主页</button>
        <h1 class="tool-title" id="calculator-title">
          <span class="tool-icon" aria-hidden="true">🧮</span> 
          <span class="tool-text">计算器</span>
        </h1>
        <p class="tool-description" id="calculator-description">基础数学计算工具，支持加减乘除等运算</p>
      </div>
      
      <div class="tool-body">
        <!-- 左侧：计算器主体 -->
        <div class="tool-main">
          <!-- 显示屏 -->
          <div 
            class="calculator-display" 
            role="region" 
            aria-labelledby="calculator-title"
            aria-describedby="calculator-description"
          >
            <div 
              class="calculator-display-history" 
              aria-label="计算历史"
              aria-live="polite"
            >{{ history }}</div>
            <div 
              class="calculator-display-current" 
              aria-label="当前显示值"
              aria-live="assertive"
              role="status"
            >{{ display }}</div>
          </div>
          
          <!-- 按钮区域 -->
          <div class="calculator-buttons" role="grid" aria-label="计算器按钮">
            <!-- 第一行 -->
            <button 
              @click="animateButton($event, clear)" 
              class="calculator-btn calculator-btn-function interactive"
              aria-label="清除所有"
              title="清除所有 (快捷键: Escape)"
            >C</button>
            <button 
              @click="animateButton($event, clearEntry)" 
              class="calculator-btn calculator-btn-function interactive"
              aria-label="清除当前输入"
              title="清除当前输入 (快捷键: Delete)"
            >CE</button>
            <button 
              @click="animateButton($event, backspace)" 
              class="calculator-btn calculator-btn-function interactive"
              aria-label="退格"
              title="退格 (快捷键: Backspace)"
            >⌫</button>
            <button 
              @click="animateButton($event, () => inputOperator('/'))" 
              class="calculator-btn calculator-btn-operator interactive"
              aria-label="除法"
              title="除法 (快捷键: /)"
            >÷</button>
            
            <!-- 第二行 -->
            <button @click="animateButton($event, () => inputNumber('7'))" class="calculator-btn calculator-btn-number interactive" aria-label="数字7" title="数字7 (快捷键: 7)">7</button>
            <button @click="animateButton($event, () => inputNumber('8'))" class="calculator-btn calculator-btn-number interactive" aria-label="数字8" title="数字8 (快捷键: 8)">8</button>
            <button @click="animateButton($event, () => inputNumber('9'))" class="calculator-btn calculator-btn-number interactive" aria-label="数字9" title="数字9 (快捷键: 9)">9</button>
            <button @click="animateButton($event, () => inputOperator('*'))" class="calculator-btn calculator-btn-operator interactive" aria-label="乘法" title="乘法 (快捷键: *)">×</button>
            
            <!-- 第三行 -->
            <button @click="animateButton($event, () => inputNumber('4'))" class="calculator-btn calculator-btn-number interactive" aria-label="数字4" title="数字4 (快捷键: 4)">4</button>
            <button @click="animateButton($event, () => inputNumber('5'))" class="calculator-btn calculator-btn-number interactive" aria-label="数字5" title="数字5 (快捷键: 5)">5</button>
            <button @click="animateButton($event, () => inputNumber('6'))" class="calculator-btn calculator-btn-number interactive" aria-label="数字6" title="数字6 (快捷键: 6)">6</button>
            <button @click="animateButton($event, () => inputOperator('-'))" class="calculator-btn calculator-btn-operator interactive" aria-label="减法" title="减法 (快捷键: -)">-</button>
            
            <!-- 第四行 -->
            <button @click="animateButton($event, () => inputNumber('1'))" class="calculator-btn calculator-btn-number interactive" aria-label="数字1" title="数字1 (快捷键: 1)">1</button>
            <button @click="animateButton($event, () => inputNumber('2'))" class="calculator-btn calculator-btn-number interactive" aria-label="数字2" title="数字2 (快捷键: 2)">2</button>
            <button @click="animateButton($event, () => inputNumber('3'))" class="calculator-btn calculator-btn-number interactive" aria-label="数字3" title="数字3 (快捷键: 3)">3</button>
            <button @click="animateButton($event, () => inputOperator('+'))" class="calculator-btn calculator-btn-operator interactive" aria-label="加法" title="加法 (快捷键: +)">+</button>
            
            <!-- 第五行 -->
            <button @click="animateButton($event, toggleSign)" class="calculator-btn calculator-btn-function interactive" aria-label="正负号切换" title="正负号切换">±</button>
            <button @click="animateButton($event, () => inputNumber('0'))" class="calculator-btn calculator-btn-number interactive" aria-label="数字0" title="数字0 (快捷键: 0)">0</button>
            <button @click="animateButton($event, inputDecimal)" class="calculator-btn calculator-btn-function interactive" aria-label="小数点" title="小数点 (快捷键: .)">.</button>
            <button @click="animateButton($event, calculate)" class="calculator-btn calculator-btn-equals interactive hover-glow" aria-label="等于" title="计算结果 (快捷键: Enter或=)">=</button>
          </div>
        </div>
        
        <!-- 右侧：历史记录 -->
        <div class="tool-sidebar">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { notification } from '../../utils/notification.js'

const display = ref('0')
const previousValue = ref(null)
const operator = ref(null)
const waitingForOperand = ref(false)
const isAnimating = ref(false)
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
      if (secondValue === 0) {
        throw new Error('除数不能为零')
      }
      return firstValue / secondValue
    default:
      return secondValue
  }
}

const calculate = () => {
  const inputValue = parseFloat(display.value)
  
  if (previousValue.value !== null && operator.value) {
    try {
      const expression = `${previousValue.value} ${getOperatorSymbol(operator.value)} ${inputValue}`
      const newValue = performCalculation(previousValue.value, inputValue, operator.value)
      
      // 检查结果是否有效
      if (!isFinite(newValue)) {
        throw new Error('计算结果无效')
      }
      
      // 添加到历史记录
      calculationHistory.value.push({
        expression,
        result: newValue
      })
      
      display.value = String(newValue)
      previousValue.value = null
      operator.value = null
      waitingForOperand.value = true
      
      // 显示成功通知
      notification.success('计算完成', 2000)
      
    } catch (error) {
      // 显示错误通知
      notification.error(error.message, 3000)
      
      // 重置计算器状态
      clear()
    }
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

// 按钮动画函数
const animateButton = (event, callback) => {
  const button = event.target;
  
  // 添加按下动画
  button.classList.add('scale-95');
  
  // 创建涟漪效果
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.width = ripple.style.height = size + 'px';
  ripple.style.left = x + 'px';
  ripple.style.top = y + 'px';
  ripple.classList.add('ripple');
  
  button.appendChild(ripple);
  
  // 执行回调函数
  setTimeout(() => {
    if (typeof callback === 'function') {
      callback();
    }
    button.classList.remove('scale-95');
  }, 100);
  
  // 清理涟漪效果
  setTimeout(() => {
    if (ripple.parentNode) {
      ripple.parentNode.removeChild(ripple);
    }
  }, 600);
};

// 显示动画
const animateDisplay = () => {
  const display = document.querySelector('.calculator-display-current');
  if (display) {
    display.classList.add('pulse');
    setTimeout(() => {
      display.classList.remove('pulse');
    }, 300);
  }
};

// 键盘事件处理
const handleKeydown = (event) => {
  const key = event.key
  
  // 阻止默认行为
  if (['Enter', 'Escape', 'Backspace'].includes(key) || /[0-9+\-*/.=]/.test(key)) {
    event.preventDefault()
  }
  
  // 数字键
  if (/[0-9]/.test(key)) {
    inputNumber(key)
    animateDisplay()
  }
  // 运算符
  else if (key === '+') {
    inputOperator('+')
    animateDisplay()
  }
  else if (key === '-') {
    inputOperator('-')
    animateDisplay()
  }
  else if (key === '*') {
    inputOperator('*')
    animateDisplay()
  }
  else if (key === '/') {
    inputOperator('/')
    animateDisplay()
  }
  // 小数点
  else if (key === '.') {
    inputDecimal()
    animateDisplay()
  }
  // 等号或回车
  else if (key === '=' || key === 'Enter') {
    calculate()
    animateDisplay()
  }
  // 清除
  else if (key === 'Escape') {
    clear()
    animateDisplay()
  }
  // 退格
  else if (key === 'Backspace') {
    backspace()
    animateDisplay()
  }
}

// 组件挂载时添加键盘监听
onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

// 组件卸载时移除键盘监听
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>