<template>
  <div class="mortgage-calculator">
    <div class="calculator-container">
      <h2 class="tool-title">🏠 房贷计算器</h2>
      <p class="tool-description">计算房屋贷款月供、总利息和还款计划，支持等额本息和等额本金两种还款方式</p>
      
      <div class="calculator-body">
        <!-- 贷款参数设置 -->
        <div class="params-section">
          <h3>贷款参数</h3>
          
          <div class="param-group">
            <label>房屋总价 (万元)</label>
            <div class="input-with-slider">
              <input 
                v-model="housePrice" 
                type="number" 
                min="0" 
                step="0.1"
                placeholder="请输入房屋总价"
                @input="calculate"
                class="param-input"
              >
              <input 
                v-model="housePrice" 
                type="range" 
                min="50" 
                max="2000" 
                step="1"
                @input="calculate"
                class="param-slider"
              >
            </div>
          </div>
          
          <div class="param-group">
            <label>首付比例 (%)</label>
            <div class="input-with-slider">
              <input 
                v-model="downPaymentRatio" 
                type="number" 
                min="0" 
                max="100" 
                step="0.1"
                @input="calculate"
                class="param-input"
              >
              <input 
                v-model="downPaymentRatio" 
                type="range" 
                min="10" 
                max="80" 
                step="1"
                @input="calculate"
                class="param-slider"
              >
            </div>
            <div class="param-info">
              首付金额: {{ downPaymentAmount.toFixed(2) }} 万元
            </div>
          </div>
          
          <div class="param-group">
            <label>贷款金额 (万元)</label>
            <div class="input-with-slider">
              <input 
                v-model="loanAmount" 
                type="number" 
                min="0" 
                step="0.1"
                @input="calculate"
                class="param-input"
              >
              <input 
                v-model="loanAmount" 
                type="range" 
                min="10" 
                max="1500" 
                step="1"
                @input="calculate"
                class="param-slider"
              >
            </div>
          </div>
          
          <div class="param-group">
            <label>贷款年限</label>
            <div class="loan-term-options">
              <button 
                v-for="term in commonTerms" 
                :key="term"
                @click="setLoanTerm(term)"
                :class="['term-btn', { active: loanTerm === term }]"
              >
                {{ term }}年
              </button>
            </div>
            <div class="custom-term">
              <input 
                v-model="loanTerm" 
                type="number" 
                min="1" 
                max="30" 
                @input="calculate"
                class="term-input"
              >
              <span>年</span>
            </div>
          </div>
          
          <div class="param-group">
            <label>年利率 (%)</label>
            <div class="input-with-slider">
              <input 
                v-model="annualRate" 
                type="number" 
                min="0" 
                max="20" 
                step="0.01"
                @input="calculate"
                class="param-input"
              >
              <input 
                v-model="annualRate" 
                type="range" 
                min="3" 
                max="8" 
                step="0.01"
                @input="calculate"
                class="param-slider"
              >
            </div>
            <div class="rate-presets">
              <button 
                v-for="rate in commonRates" 
                :key="rate.name"
                @click="setRate(rate.value)"
                :class="['rate-btn', { active: Math.abs(annualRate - rate.value) < 0.01 }]"
                :title="rate.description"
              >
                {{ rate.name }}
              </button>
            </div>
          </div>
          
          <div class="param-group">
            <label>还款方式</label>
            <div class="payment-method">
              <label class="method-option">
                <input 
                  v-model="paymentMethod" 
                  type="radio" 
                  value="equal-payment"
                  @change="calculate"
                >
                <span class="method-text">
                  <strong>等额本息</strong>
                  <small>每月还款金额相同</small>
                </span>
              </label>
              
              <label class="method-option">
                <input 
                  v-model="paymentMethod" 
                  type="radio" 
                  value="equal-principal"
                  @change="calculate"
                >
                <span class="method-text">
                  <strong>等额本金</strong>
                  <small>每月本金相同，利息递减</small>
                </span>
              </label>
            </div>
          </div>
        </div>
        
        <!-- 计算结果 -->
        <div class="results-section">
          <h3>计算结果</h3>
          
          <div class="result-cards">
            <div class="result-card primary">
              <div class="result-label">月供金额</div>
              <div class="result-value">{{ monthlyPayment }}</div>
              <div class="result-unit">元/月</div>
            </div>
            
            <div class="result-card">
              <div class="result-label">贷款总额</div>
              <div class="result-value">{{ (loanAmount * 10000).toLocaleString() }}</div>
              <div class="result-unit">元</div>
            </div>
            
            <div class="result-card">
              <div class="result-label">支付利息</div>
              <div class="result-value">{{ totalInterest.toLocaleString() }}</div>
              <div class="result-unit">元</div>
            </div>
            
            <div class="result-card">
              <div class="result-label">还款总额</div>
              <div class="result-value">{{ totalPayment.toLocaleString() }}</div>
              <div class="result-unit">元</div>
            </div>
          </div>
          
          <!-- 还款详情 -->
          <div class="payment-details">
            <h4>还款详情</h4>
            <div class="details-grid">
              <div class="detail-item">
                <span class="detail-label">首付金额:</span>
                <span class="detail-value">{{ (downPaymentAmount * 10000).toLocaleString() }} 元</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">贷款期限:</span>
                <span class="detail-value">{{ loanTerm }} 年 ({{ loanTerm * 12 }} 个月)</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">月利率:</span>
                <span class="detail-value">{{ (annualRate / 12).toFixed(4) }}%</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">利息占比:</span>
                <span class="detail-value">{{ interestRatio.toFixed(2) }}%</span>
              </div>
            </div>
          </div>
          
          <!-- 对比分析 -->
          <div class="comparison-section" v-if="comparisonData">
            <h4>还款方式对比</h4>
            <div class="comparison-table">
              <table>
                <thead>
                  <tr>
                    <th>还款方式</th>
                    <th>月供范围</th>
                    <th>总利息</th>
                    <th>总还款</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>等额本息</td>
                    <td>{{ comparisonData.equalPayment.monthlyPayment }} 元</td>
                    <td>{{ comparisonData.equalPayment.totalInterest.toLocaleString() }} 元</td>
                    <td>{{ comparisonData.equalPayment.totalPayment.toLocaleString() }} 元</td>
                  </tr>
                  <tr>
                    <td>等额本金</td>
                    <td>{{ comparisonData.equalPrincipal.monthlyRange }}</td>
                    <td>{{ comparisonData.equalPrincipal.totalInterest.toLocaleString() }} 元</td>
                    <td>{{ comparisonData.equalPrincipal.totalPayment.toLocaleString() }} 元</td>
                  </tr>
                </tbody>
              </table>
              <div class="comparison-note">
                等额本金比等额本息少付利息: {{ (comparisonData.equalPayment.totalInterest - comparisonData.equalPrincipal.totalInterest).toLocaleString() }} 元
              </div>
            </div>
          </div>
        </div>
        
        <!-- 还款计划表 -->
        <div class="schedule-section">
          <h3>还款计划表</h3>
          
          <div class="schedule-controls">
            <div class="view-options">
              <button 
                @click="scheduleView = 'yearly'"
                :class="['view-btn', { active: scheduleView === 'yearly' }]"
              >
                按年查看
              </button>
              <button 
                @click="scheduleView = 'monthly'"
                :class="['view-btn', { active: scheduleView === 'monthly' }]"
              >
                按月查看
              </button>
            </div>
            
            <div class="export-options">
              <button @click="exportSchedule('csv')" class="export-btn">
                导出CSV
              </button>
              <button @click="exportSchedule('excel')" class="export-btn">
                导出Excel
              </button>
            </div>
          </div>
          
          <div class="schedule-table-container">
            <table class="schedule-table">
              <thead>
                <tr>
                  <th>{{ scheduleView === 'yearly' ? '年份' : '期数' }}</th>
                  <th>{{ scheduleView === 'yearly' ? '年份' : '日期' }}</th>
                  <th>应还款额</th>
                  <th>应还本金</th>
                  <th>应还利息</th>
                  <th>剩余本金</th>
                </tr>
              </thead>
              <tbody>
                <tr 
                  v-for="(item, index) in displaySchedule" 
                  :key="index"
                  :class="{ 'highlight-row': item.isHighlight }"
                >
                  <td>{{ item.period }}</td>
                  <td>{{ item.date }}</td>
                  <td class="amount">{{ item.payment.toLocaleString() }}</td>
                  <td class="amount">{{ item.principal.toLocaleString() }}</td>
                  <td class="amount">{{ item.interest.toLocaleString() }}</td>
                  <td class="amount">{{ item.remainingPrincipal.toLocaleString() }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="schedule-summary">
            <div class="summary-item">
              <span class="summary-label">累计还款:</span>
              <span class="summary-value">{{ accumulatedPayment.toLocaleString() }} 元</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">累计利息:</span>
              <span class="summary-value">{{ accumulatedInterest.toLocaleString() }} 元</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">剩余本金:</span>
              <span class="summary-value">{{ remainingPrincipal.toLocaleString() }} 元</span>
            </div>
          </div>
        </div>
        
        <!-- 提前还款计算 -->
        <div class="prepayment-section">
          <h3>提前还款计算</h3>
          
          <div class="prepayment-form">
            <div class="prepay-group">
              <label>提前还款时间 (第几个月)</label>
              <input 
                v-model="prepaymentMonth" 
                type="number" 
                min="1" 
                :max="loanTerm * 12"
                class="prepay-input"
              >
            </div>
            
            <div class="prepay-group">
              <label>提前还款金额 (万元)</label>
              <input 
                v-model="prepaymentAmount" 
                type="number" 
                min="0" 
                step="0.1"
                class="prepay-input"
              >
            </div>
            
            <div class="prepay-group">
              <label>还款方式调整</label>
              <div class="prepay-options">
                <label class="prepay-option">
                  <input 
                    v-model="prepaymentType" 
                    type="radio" 
                    value="reduce-term"
                  >
                  <span>缩短还款期限</span>
                </label>
                <label class="prepay-option">
                  <input 
                    v-model="prepaymentType" 
                    type="radio" 
                    value="reduce-payment"
                  >
                  <span>减少月供金额</span>
                </label>
              </div>
            </div>
            
            <button @click="calculatePrepayment" class="calculate-prepay-btn">
              计算提前还款
            </button>
          </div>
          
          <div class="prepayment-results" v-if="prepaymentResults">
            <h4>提前还款效果</h4>
            <div class="prepay-comparison">
              <div class="prepay-before">
                <h5>提前还款前</h5>
                <div class="prepay-item">
                  <span>剩余期限:</span>
                  <span>{{ prepaymentResults.before.remainingMonths }} 个月</span>
                </div>
                <div class="prepay-item">
                  <span>月供金额:</span>
                  <span>{{ prepaymentResults.before.monthlyPayment.toLocaleString() }} 元</span>
                </div>
                <div class="prepay-item">
                  <span>剩余利息:</span>
                  <span>{{ prepaymentResults.before.remainingInterest.toLocaleString() }} 元</span>
                </div>
              </div>
              
              <div class="prepay-after">
                <h5>提前还款后</h5>
                <div class="prepay-item">
                  <span>剩余期限:</span>
                  <span>{{ prepaymentResults.after.remainingMonths }} 个月</span>
                </div>
                <div class="prepay-item">
                  <span>月供金额:</span>
                  <span>{{ prepaymentResults.after.monthlyPayment.toLocaleString() }} 元</span>
                </div>
                <div class="prepay-item">
                  <span>剩余利息:</span>
                  <span>{{ prepaymentResults.after.remainingInterest.toLocaleString() }} 元</span>
                </div>
              </div>
            </div>
            
            <div class="prepay-savings">
              <div class="savings-item primary">
                <span class="savings-label">节省利息:</span>
                <span class="savings-value">{{ prepaymentResults.savings.interest.toLocaleString() }} 元</span>
              </div>
              <div class="savings-item">
                <span class="savings-label">缩短期限:</span>
                <span class="savings-value">{{ prepaymentResults.savings.months }} 个月</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 计算历史 -->
        <div class="history-section" v-if="calculationHistory.length > 0">
          <h3>计算历史</h3>
          <div class="history-list">
            <div 
              v-for="(record, index) in calculationHistory.slice(-5)" 
              :key="index"
              class="history-item"
            >
              <div class="history-params">
                <span class="history-house-price">房价: {{ record.housePrice }}万</span>
                <span class="history-down-payment">首付: {{ record.downPaymentRatio }}%</span>
                <span class="history-loan">贷款: {{ record.loanAmount }}万/{{ record.loanTerm }}年</span>
                <span class="history-rate">利率: {{ record.annualRate }}%</span>
              </div>
              <div class="history-result">
                <span class="history-monthly">月供: {{ record.monthlyPayment }}</span>
                <span class="history-total">总利息: {{ record.totalInterest.toLocaleString() }}元</span>
              </div>
              <button @click="loadHistoryRecord(record)" class="load-history-btn">
                使用此参数
              </button>
            </div>
          </div>
          <button @click="clearHistory" class="clear-history-btn">
            清空历史
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

const housePrice = ref(300)
const downPaymentRatio = ref(30)
const loanAmount = ref(210)
const loanTerm = ref(30)
const annualRate = ref(4.9)
const paymentMethod = ref('equal-payment')
const scheduleView = ref('yearly')
const prepaymentMonth = ref(60)
const prepaymentAmount = ref(50)
const prepaymentType = ref('reduce-term')
const prepaymentResults = ref(null)
const calculationHistory = ref([])
const paymentSchedule = ref([])

const commonTerms = [10, 15, 20, 25, 30]
const commonRates = [
  { name: '基准', value: 4.9, description: '央行基准利率' },
  { name: '首套', value: 4.9, description: '首套房贷利率' },
  { name: '二套', value: 5.4, description: '二套房贷利率' },
  { name: '公积金', value: 3.25, description: '公积金贷款利率' }
]

const downPaymentAmount = computed(() => {
  return housePrice.value * downPaymentRatio.value / 100
})

const monthlyRate = computed(() => {
  return annualRate.value / 100 / 12
})

const totalMonths = computed(() => {
  return loanTerm.value * 12
})

const monthlyPayment = computed(() => {
  if (!loanAmount.value || !annualRate.value || !loanTerm.value) return '0'
  
  const principal = loanAmount.value * 10000
  const rate = monthlyRate.value
  const months = totalMonths.value
  
  if (paymentMethod.value === 'equal-payment') {
    // 等额本息
    if (rate === 0) return (principal / months).toFixed(2)
    const payment = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1)
    return payment.toFixed(2)
  } else {
    // 等额本金 - 首月还款
    const monthlyPrincipal = principal / months
    const firstMonthInterest = principal * rate
    return (monthlyPrincipal + firstMonthInterest).toFixed(2)
  }
})

const totalInterest = computed(() => {
  if (!loanAmount.value || !annualRate.value || !loanTerm.value) return 0
  
  const principal = loanAmount.value * 10000
  const rate = monthlyRate.value
  const months = totalMonths.value
  
  if (paymentMethod.value === 'equal-payment') {
    // 等额本息
    if (rate === 0) return 0
    const monthlyPay = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1)
    return Math.round(monthlyPay * months - principal)
  } else {
    // 等额本金
    return Math.round(principal * rate * (months + 1) / 2)
  }
})

const totalPayment = computed(() => {
  return loanAmount.value * 10000 + totalInterest.value
})

const interestRatio = computed(() => {
  if (totalPayment.value === 0) return 0
  return (totalInterest.value / totalPayment.value) * 100
})

const comparisonData = computed(() => {
  if (!loanAmount.value || !annualRate.value || !loanTerm.value) return null
  
  const principal = loanAmount.value * 10000
  const rate = monthlyRate.value
  const months = totalMonths.value
  
  // 等额本息计算
  let equalPaymentMonthly = 0
  let equalPaymentTotal = 0
  if (rate === 0) {
    equalPaymentMonthly = principal / months
    equalPaymentTotal = principal
  } else {
    equalPaymentMonthly = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1)
    equalPaymentTotal = equalPaymentMonthly * months
  }
  
  // 等额本金计算
  const monthlyPrincipal = principal / months
  const equalPrincipalTotal = principal + principal * rate * (months + 1) / 2
  const firstMonth = monthlyPrincipal + principal * rate
  const lastMonth = monthlyPrincipal + monthlyPrincipal * rate
  
  return {
    equalPayment: {
      monthlyPayment: equalPaymentMonthly.toFixed(2),
      totalInterest: Math.round(equalPaymentTotal - principal),
      totalPayment: Math.round(equalPaymentTotal)
    },
    equalPrincipal: {
      monthlyRange: `${firstMonth.toFixed(2)} ~ ${lastMonth.toFixed(2)} 元`,
      totalInterest: Math.round(equalPrincipalTotal - principal),
      totalPayment: Math.round(equalPrincipalTotal)
    }
  }
})

const displaySchedule = computed(() => {
  if (scheduleView.value === 'yearly') {
    return generateYearlySchedule()
  } else {
    return generateMonthlySchedule().slice(0, 60) // 只显示前5年
  }
})

const accumulatedPayment = computed(() => {
  return displaySchedule.value.reduce((sum, item) => sum + item.payment, 0)
})

const accumulatedInterest = computed(() => {
  return displaySchedule.value.reduce((sum, item) => sum + item.interest, 0)
})

const remainingPrincipal = computed(() => {
  const schedule = displaySchedule.value
  return schedule.length > 0 ? schedule[schedule.length - 1].remainingPrincipal : loanAmount.value * 10000
})

const generateMonthlySchedule = () => {
  const schedule = []
  const principal = loanAmount.value * 10000
  const rate = monthlyRate.value
  const months = totalMonths.value
  let remainingPrincipal = principal
  
  const startDate = new Date()
  
  for (let i = 1; i <= months; i++) {
    let monthlyPrincipal, monthlyInterest, monthlyPayment
    
    if (paymentMethod.value === 'equal-payment') {
      // 等额本息
      if (rate === 0) {
        monthlyPayment = principal / months
        monthlyPrincipal = monthlyPayment
        monthlyInterest = 0
      } else {
        monthlyPayment = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1)
        monthlyInterest = remainingPrincipal * rate
        monthlyPrincipal = monthlyPayment - monthlyInterest
      }
    } else {
      // 等额本金
      monthlyPrincipal = principal / months
      monthlyInterest = remainingPrincipal * rate
      monthlyPayment = monthlyPrincipal + monthlyInterest
    }
    
    remainingPrincipal -= monthlyPrincipal
    
    const paymentDate = new Date(startDate)
    paymentDate.setMonth(paymentDate.getMonth() + i)
    
    schedule.push({
      period: i,
      date: paymentDate.toLocaleDateString('zh-CN'),
      payment: Math.round(monthlyPayment),
      principal: Math.round(monthlyPrincipal),
      interest: Math.round(monthlyInterest),
      remainingPrincipal: Math.round(Math.max(0, remainingPrincipal))
    })
  }
  
  return schedule
}

const generateYearlySchedule = () => {
  const monthlySchedule = generateMonthlySchedule()
  const yearlySchedule = []
  
  for (let year = 1; year <= loanTerm.value; year++) {
    const startMonth = (year - 1) * 12
    const endMonth = Math.min(year * 12, monthlySchedule.length)
    
    let yearlyPayment = 0
    let yearlyPrincipal = 0
    let yearlyInterest = 0
    
    for (let i = startMonth; i < endMonth; i++) {
      yearlyPayment += monthlySchedule[i].payment
      yearlyPrincipal += monthlySchedule[i].principal
      yearlyInterest += monthlySchedule[i].interest
    }
    
    const lastMonth = monthlySchedule[endMonth - 1]
    
    yearlySchedule.push({
      period: year,
      date: `第${year}年`,
      payment: Math.round(yearlyPayment),
      principal: Math.round(yearlyPrincipal),
      interest: Math.round(yearlyInterest),
      remainingPrincipal: lastMonth ? lastMonth.remainingPrincipal : 0
    })
  }
  
  return yearlySchedule
}

const setLoanTerm = (term) => {
  loanTerm.value = term
  calculate()
}

const setRate = (rate) => {
  annualRate.value = rate
  calculate()
}

const calculate = () => {
  // 自动调整贷款金额
  if (housePrice.value && downPaymentRatio.value) {
    const maxLoan = housePrice.value - downPaymentAmount.value
    if (loanAmount.value > maxLoan) {
      loanAmount.value = maxLoan
    }
  }
  
  // 保存计算历史
  if (loanAmount.value && annualRate.value && loanTerm.value) {
    const record = {
      timestamp: Date.now(),
      housePrice: housePrice.value,
      downPaymentRatio: downPaymentRatio.value,
      loanAmount: loanAmount.value,
      loanTerm: loanTerm.value,
      annualRate: annualRate.value,
      paymentMethod: paymentMethod.value,
      monthlyPayment: monthlyPayment.value,
      totalInterest: totalInterest.value
    }
    
    calculationHistory.value.push(record)
    
    // 限制历史记录数量
    if (calculationHistory.value.length > 20) {
      calculationHistory.value = calculationHistory.value.slice(-20)
    }
  }
}

const calculatePrepayment = () => {
  if (!prepaymentMonth.value || !prepaymentAmount.value) return
  
  const monthlySchedule = generateMonthlySchedule()
  const prepayMonth = prepaymentMonth.value - 1
  
  if (prepayMonth >= monthlySchedule.length) return
  
  const beforePrepay = monthlySchedule[prepayMonth]
  const prepayAmountYuan = prepaymentAmount.value * 10000
  
  // 计算提前还款前的情况
  const remainingMonthsBefore = monthlySchedule.length - prepayMonth
  const remainingInterestBefore = monthlySchedule.slice(prepayMonth).reduce((sum, item) => sum + item.interest, 0)
  
  // 计算提前还款后的情况
  const newPrincipal = beforePrepay.remainingPrincipal - prepayAmountYuan
  const rate = monthlyRate.value
  
  let newMonthlyPayment, newRemainingMonths, newRemainingInterest
  
  if (prepaymentType.value === 'reduce-term') {
    // 缩短期限，月供不变
    const originalMonthlyPayment = parseFloat(monthlyPayment.value)
    if (rate === 0) {
      newRemainingMonths = Math.ceil(newPrincipal / originalMonthlyPayment)
    } else {
      newRemainingMonths = Math.ceil(Math.log(1 + (newPrincipal * rate) / originalMonthlyPayment) / Math.log(1 + rate))
    }
    newMonthlyPayment = originalMonthlyPayment
    newRemainingInterest = newMonthlyPayment * newRemainingMonths - newPrincipal
  } else {
    // 减少月供，期限不变
    newRemainingMonths = remainingMonthsBefore
    if (rate === 0) {
      newMonthlyPayment = newPrincipal / newRemainingMonths
      newRemainingInterest = 0
    } else {
      newMonthlyPayment = newPrincipal * rate * Math.pow(1 + rate, newRemainingMonths) / (Math.pow(1 + rate, newRemainingMonths) - 1)
      newRemainingInterest = newMonthlyPayment * newRemainingMonths - newPrincipal
    }
  }
  
  prepaymentResults.value = {
    before: {
      remainingMonths: remainingMonthsBefore,
      monthlyPayment: parseFloat(monthlyPayment.value),
      remainingInterest: Math.round(remainingInterestBefore)
    },
    after: {
      remainingMonths: Math.max(0, newRemainingMonths),
      monthlyPayment: Math.round(newMonthlyPayment),
      remainingInterest: Math.round(Math.max(0, newRemainingInterest))
    },
    savings: {
      interest: Math.round(remainingInterestBefore - Math.max(0, newRemainingInterest)),
      months: remainingMonthsBefore - Math.max(0, newRemainingMonths)
    }
  }
}

const exportSchedule = (format) => {
  const schedule = paymentMethod.value === 'equal-payment' ? generateMonthlySchedule() : generateMonthlySchedule()
  
  if (format === 'csv') {
    let csv = '期数,日期,应还款额,应还本金,应还利息,剩余本金\n'
    schedule.forEach(item => {
      csv += `${item.period},${item.date},${item.payment},${item.principal},${item.interest},${item.remainingPrincipal}\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '房贷还款计划表.csv'
    link.click()
  }
  // Excel导出需要额外的库支持，这里简化处理
}

const loadHistoryRecord = (record) => {
  housePrice.value = record.housePrice
  downPaymentRatio.value = record.downPaymentRatio
  loanAmount.value = record.loanAmount
  loanTerm.value = record.loanTerm
  annualRate.value = record.annualRate
  paymentMethod.value = record.paymentMethod
  calculate()
}

const clearHistory = () => {
  calculationHistory.value = []
}

// 监听房价和首付比例变化，自动调整贷款金额
watch([housePrice, downPaymentRatio], () => {
  if (housePrice.value && downPaymentRatio.value) {
    loanAmount.value = housePrice.value - downPaymentAmount.value
  }
})

onMounted(() => {
  calculate()
})
</script>

<style scoped>
.mortgage-calculator {
  padding: 20px;
  max-width: 1400px;
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
  grid-template-columns: 400px 1fr;
  gap: 30px;
}

.params-section h3,
.results-section h3,
.schedule-section h3,
.prepayment-section h3,
.history-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
}

.param-group {
  margin-bottom: 25px;
}

.param-group label {
  display: block;
  color: #495057;
  margin-bottom: 10px;
  font-weight: 500;
}

.input-with-slider {
  display: flex;
  gap: 15px;
  align-items: center;
  margin-bottom: 8px;
}

.param-input {
  width: 120px;
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
}

.param-slider {
  flex: 1;
}

.param-info {
  font-size: 12px;
  color: #6c757d;
  margin-top: 5px;
}

.loan-term-options {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.term-btn {
  padding: 8px 16px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.term-btn:hover {
  border-color: #3498db;
}

.term-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.custom-term {
  display: flex;
  align-items: center;
  gap: 8px;
}

.term-input {
  width: 80px;
  padding: 8px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
}

.rate-presets {
  display: flex;
  gap: 8px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.rate-btn {
  padding: 6px 12px;
  border: 2px solid #e9ecef;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
}

.rate-btn:hover {
  border-color: #2ecc71;
}

.rate-btn.active {
  background: #2ecc71;
  color: white;
  border-color: #2ecc71;
}

.payment-method {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.method-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
  padding: 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.method-option:hover {
  border-color: #3498db;
  background: #f8f9fa;
}

.method-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.method-text strong {
  color: #2c3e50;
}

.method-text small {
  color: #7f8c8d;
  font-size: 12px;
}

.results-section {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 25px;
}

.result-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin-bottom: 25px;
}

.result-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.result-card.primary {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  grid-column: 1 / -1;
}

.result-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.result-card.primary .result-label {
  color: rgba(255, 255, 255, 0.9);
}

.result-value {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 4px;
}

.result-card.primary .result-value {
  color: white;
  font-size: 32px;
}

.result-unit {
  font-size: 12px;
  color: #95a5a6;
}

.result-card.primary .result-unit {
  color: rgba(255, 255, 255, 0.8);
}

.payment-details {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
}

.payment-details h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #ecf0f1;
}

.detail-label {
  color: #7f8c8d;
  font-size: 14px;
}

.detail-value {
  color: #2c3e50;
  font-weight: 500;
  font-size: 14px;
}

.comparison-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.comparison-section h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.comparison-table th,
.comparison-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.comparison-table th {
  background: #f8f9fa;
  color: #495057;
  font-weight: 500;
}

.comparison-note {
  background: #e8f5e8;
  color: #2ecc71;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}

.schedule-section {
  grid-column: 1 / -1;
  margin-top: 30px;
}

.schedule-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.view-options {
  display: flex;
  gap: 10px;
}

.view-btn {
  padding: 8px 16px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.view-btn:hover {
  border-color: #3498db;
}

.view-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.export-options {
  display: flex;
  gap: 10px;
}

.export-btn {
  padding: 8px 16px;
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.schedule-table-container {
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  margin-bottom: 20px;
}

.schedule-table {
  width: 100%;
  border-collapse: collapse;
}

.schedule-table th,
.schedule-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ecf0f1;
}

.schedule-table th {
  background: #f8f9fa;
  color: #495057;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 1;
}

.schedule-table .amount {
  text-align: right;
  font-family: 'Courier New', monospace;
}

.highlight-row {
  background: #fff3cd;
}

.schedule-summary {
  display: flex;
  justify-content: space-around;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
}

.summary-item {
  text-align: center;
}

.summary-label {
  display: block;
  color: #7f8c8d;
  font-size: 14px;
  margin-bottom: 5px;
}

.summary-value {
  color: #2c3e50;
  font-weight: bold;
  font-size: 16px;
}

.prepayment-section {
  grid-column: 1 / -1;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 25px;
  margin-top: 30px;
}

.prepayment-form {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.prepay-group label {
  display: block;
  color: #495057;
  margin-bottom: 8px;
  font-weight: 500;
}

.prepay-input {
  width: 100%;
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 6px;
}

.prepay-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prepay-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.calculate-prepay-btn {
  grid-column: 1 / -1;
  padding: 12px 24px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.prepayment-results {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.prepayment-results h4 {
  color: #2c3e50;
  margin-bottom: 20px;
}

.prepay-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.prepay-before,
.prepay-after {
  padding: 15px;
  border-radius: 6px;
}

.prepay-before {
  background: #ffeaa7;
}

.prepay-after {
  background: #d1f2eb;
}

.prepay-before h5,
.prepay-after h5 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.prepay-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.prepay-savings {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.savings-item {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  background: white;
}

.savings-item.primary {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
  color: white;
}

.savings-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.savings-value {
  font-size: 20px;
  font-weight: bold;
}

.history-section {
  grid-column: 1 / -1;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 25px;
  margin-top: 30px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.history-item {
  background: white;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-params {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.history-params span {
  font-size: 12px;
  color: #7f8c8d;
  background: #ecf0f1;
  padding: 4px 8px;
  border-radius: 4px;
}

.history-result {
  display: flex;
  gap: 15px;
  align-items: center;
}

.history-monthly {
  font-weight: bold;
  color: #3498db;
}

.history-total {
  color: #e74c3c;
  font-size: 14px;
}

.load-history-btn {
  padding: 6px 12px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.clear-history-btn {
  padding: 10px 20px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .calculator-body {
    grid-template-columns: 1fr;
  }
  
  .result-cards {
    grid-template-columns: 1fr;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .prepayment-form {
    grid-template-columns: 1fr;
  }
  
  .prepay-comparison {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .schedule-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .view-options,
  .export-options {
    justify-content: center;
  }
  
  .schedule-summary {
    flex-direction: column;
    gap: 10px;
  }
  
  .history-item {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .prepay-savings {
    flex-direction: column;
    gap: 15px;
  }
}
</style>