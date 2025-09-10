<template>
  <div class="car-loan-calculator">
    <div class="calculator-container">
      <h2 class="tool-title">🚗 车贷计算器</h2>
      <p class="tool-description">计算汽车贷款月供、总利息和还款计划，支持新车和二手车贷款计算</p>
      
      <div class="calculator-body">
        <!-- 车贷参数设置 -->
        <div class="params-section">
          <h3>车贷参数</h3>
          
          <div class="car-type-selector">
            <label>车辆类型</label>
            <div class="type-options">
              <button 
                @click="setCarType('new')"
                :class="['type-btn', { active: carType === 'new' }]"
              >
                🆕 新车
              </button>
              <button 
                @click="setCarType('used')"
                :class="['type-btn', { active: carType === 'used' }]"
              >
                🔄 二手车
              </button>
            </div>
          </div>
          
          <div class="param-group">
            <label>车辆价格 (万元)</label>
            <div class="input-with-slider">
              <input 
                v-model="carPrice" 
                type="number" 
                min="0" 
                step="0.1"
                placeholder="请输入车辆价格"
                @input="calculate"
                class="param-input"
              >
              <input 
                v-model="carPrice" 
                type="range" 
                min="5" 
                max="200" 
                step="0.5"
                @input="calculate"
                class="param-slider"
              >
            </div>
          </div>
          
          <div class="param-group">
            <label>首付金额 (万元)</label>
            <div class="input-with-slider">
              <input 
                v-model="downPayment" 
                type="number" 
                min="0" 
                step="0.1"
                @input="calculate"
                class="param-input"
              >
              <input 
                v-model="downPayment" 
                type="range" 
                min="0" 
                :max="carPrice"
                step="0.1"
                @input="calculate"
                class="param-slider"
              >
            </div>
            <div class="param-info">
              首付比例: {{ downPaymentRatio.toFixed(1) }}% | 贷款金额: {{ loanAmount.toFixed(2) }} 万元
            </div>
          </div>
          
          <div class="param-group">
            <label>贷款期限</label>
            <div class="loan-term-options">
              <button 
                v-for="term in availableTerms" 
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
                max="8" 
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
                max="15" 
                step="0.01"
                @input="calculate"
                class="param-slider"
              >
            </div>
            <div class="rate-presets">
              <button 
                v-for="rate in ratePresets" 
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
          
          <!-- 附加费用 -->
          <div class="additional-costs">
            <h4>附加费用</h4>
            <div class="cost-group">
              <label>购置税 (万元)</label>
              <input 
                v-model="purchaseTax" 
                type="number" 
                min="0" 
                step="0.01"
                @input="calculate"
                class="cost-input"
              >
              <button @click="calculatePurchaseTax" class="auto-calc-btn">
                自动计算
              </button>
            </div>
            
            <div class="cost-group">
              <label>保险费 (万元)</label>
              <input 
                v-model="insurance" 
                type="number" 
                min="0" 
                step="0.01"
                @input="calculate"
                class="cost-input"
              >
              <button @click="calculateInsurance" class="auto-calc-btn">
                自动计算
              </button>
            </div>
            
            <div class="cost-group">
              <label>上牌费 (万元)</label>
              <input 
                v-model="licenseFee" 
                type="number" 
                min="0" 
                step="0.001"
                @input="calculate"
                class="cost-input"
              >
            </div>
            
            <div class="cost-group">
              <label>其他费用 (万元)</label>
              <input 
                v-model="otherFees" 
                type="number" 
                min="0" 
                step="0.01"
                @input="calculate"
                class="cost-input"
              >
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
          
          <!-- 购车总成本 -->
          <div class="total-cost-section">
            <h4>购车总成本分析</h4>
            <div class="cost-breakdown">
              <div class="cost-item">
                <span class="cost-label">车辆价格:</span>
                <span class="cost-value">{{ (carPrice * 10000).toLocaleString() }} 元</span>
              </div>
              <div class="cost-item">
                <span class="cost-label">首付金额:</span>
                <span class="cost-value">{{ (downPayment * 10000).toLocaleString() }} 元</span>
              </div>
              <div class="cost-item">
                <span class="cost-label">贷款利息:</span>
                <span class="cost-value">{{ totalInterest.toLocaleString() }} 元</span>
              </div>
              <div class="cost-item">
                <span class="cost-label">购置税:</span>
                <span class="cost-value">{{ (purchaseTax * 10000).toLocaleString() }} 元</span>
              </div>
              <div class="cost-item">
                <span class="cost-label">保险费:</span>
                <span class="cost-value">{{ (insurance * 10000).toLocaleString() }} 元</span>
              </div>
              <div class="cost-item">
                <span class="cost-label">上牌费:</span>
                <span class="cost-value">{{ (licenseFee * 10000).toLocaleString() }} 元</span>
              </div>
              <div class="cost-item">
                <span class="cost-label">其他费用:</span>
                <span class="cost-value">{{ (otherFees * 10000).toLocaleString() }} 元</span>
              </div>
              <div class="cost-item total">
                <span class="cost-label">购车总成本:</span>
                <span class="cost-value">{{ totalCarCost.toLocaleString() }} 元</span>
              </div>
            </div>
          </div>
          
          <!-- 还款详情 -->
          <div class="payment-details">
            <h4>还款详情</h4>
            <div class="details-grid">
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
              <div class="detail-item">
                <span class="detail-label">月供占收入比:</span>
                <span class="detail-value">
                  <input 
                    v-model="monthlyIncome" 
                    type="number" 
                    placeholder="月收入"
                    class="income-input"
                  >
                  <span v-if="monthlyIncome">{{ incomeRatio.toFixed(1) }}%</span>
                </span>
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
        </div>
        
        <!-- 贷款方案对比 -->
        <div class="comparison-section">
          <h3>贷款方案对比</h3>
          
          <div class="comparison-scenarios">
            <div class="scenario-controls">
              <h4>对比方案设置</h4>
              <div class="scenario-inputs">
                <div class="scenario-group">
                  <label>方案二期限 (年)</label>
                  <select v-model="comparisonTerm" @change="calculateComparison">
                    <option v-for="term in availableTerms" :key="term" :value="term">
                      {{ term }}年
                    </option>
                  </select>
                </div>
                <div class="scenario-group">
                  <label>方案二利率 (%)</label>
                  <input 
                    v-model="comparisonRate" 
                    type="number" 
                    min="0" 
                    max="20" 
                    step="0.01"
                    @input="calculateComparison"
                    class="scenario-input"
                  >
                </div>
              </div>
            </div>
            
            <div class="comparison-table" v-if="comparisonData">
              <table>
                <thead>
                  <tr>
                    <th>方案</th>
                    <th>期限</th>
                    <th>利率</th>
                    <th>月供</th>
                    <th>总利息</th>
                    <th>总还款</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>当前方案</td>
                    <td>{{ loanTerm }}年</td>
                    <td>{{ annualRate }}%</td>
                    <td>{{ monthlyPayment }} 元</td>
                    <td>{{ totalInterest.toLocaleString() }} 元</td>
                    <td>{{ totalPayment.toLocaleString() }} 元</td>
                  </tr>
                  <tr>
                    <td>对比方案</td>
                    <td>{{ comparisonTerm }}年</td>
                    <td>{{ comparisonRate }}%</td>
                    <td>{{ comparisonData.monthlyPayment.toLocaleString() }} 元</td>
                    <td>{{ comparisonData.totalInterest.toLocaleString() }} 元</td>
                    <td>{{ comparisonData.totalPayment.toLocaleString() }} 元</td>
                  </tr>
                </tbody>
              </table>
              
              <div class="comparison-analysis">
                <div class="analysis-item" :class="{ positive: comparisonData.monthlySavings > 0, negative: comparisonData.monthlySavings < 0 }">
                  <span class="analysis-label">月供差额:</span>
                  <span class="analysis-value">
                    {{ comparisonData.monthlySavings > 0 ? '+' : '' }}{{ comparisonData.monthlySavings.toLocaleString() }} 元
                  </span>
                </div>
                <div class="analysis-item" :class="{ positive: comparisonData.interestSavings > 0, negative: comparisonData.interestSavings < 0 }">
                  <span class="analysis-label">利息差额:</span>
                  <span class="analysis-value">
                    {{ comparisonData.interestSavings > 0 ? '+' : '' }}{{ comparisonData.interestSavings.toLocaleString() }} 元
                  </span>
                </div>
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
                <span class="history-car-price">车价: {{ record.carPrice }}万</span>
                <span class="history-down-payment">首付: {{ record.downPayment }}万</span>
                <span class="history-loan">贷款: {{ record.loanAmount.toFixed(2) }}万/{{ record.loanTerm }}年</span>
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

const carType = ref('new')
const carPrice = ref(20)
const downPayment = ref(6)
const loanTerm = ref(3)
const annualRate = ref(7.5)
const paymentMethod = ref('equal-payment')
const scheduleView = ref('yearly')
const monthlyIncome = ref(null)
const comparisonTerm = ref(5)
const comparisonRate = ref(8.0)
const comparisonData = ref(null)
const calculationHistory = ref([])

// 附加费用
const purchaseTax = ref(1.7)
const insurance = ref(0.8)
const licenseFee = ref(0.05)
const otherFees = ref(0.2)

const availableTerms = [1, 2, 3, 4, 5, 6, 7, 8]

const ratePresets = [
  { name: '银行', value: 7.5, description: '银行车贷利率' },
  { name: '厂商', value: 6.8, description: '厂商金融利率' },
  { name: '信用卡', value: 12.0, description: '信用卡分期利率' },
  { name: '消费贷', value: 10.5, description: '消费贷款利率' }
]

const loanAmount = computed(() => {
  return Math.max(0, carPrice.value - downPayment.value)
})

const downPaymentRatio = computed(() => {
  if (carPrice.value === 0) return 0
  return (downPayment.value / carPrice.value) * 100
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

const incomeRatio = computed(() => {
  if (!monthlyIncome.value) return 0
  return (parseFloat(monthlyPayment.value) / monthlyIncome.value) * 100
})

const totalCarCost = computed(() => {
  return (carPrice.value + purchaseTax.value + insurance.value + licenseFee.value + otherFees.value) * 10000 + totalInterest.value
})

const displaySchedule = computed(() => {
  if (scheduleView.value === 'yearly') {
    return generateYearlySchedule()
  } else {
    return generateMonthlySchedule().slice(0, 36) // 只显示前3年
  }
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

const setCarType = (type) => {
  carType.value = type
  // 根据车型调整默认参数
  if (type === 'new') {
    annualRate.value = 7.5
    purchaseTax.value = carPrice.value * 0.085 // 新车购置税约8.5%
  } else {
    annualRate.value = 9.0 // 二手车利率通常更高
    purchaseTax.value = 0 // 二手车无购置税
  }
  calculate()
}

const setLoanTerm = (term) => {
  loanTerm.value = term
  calculate()
}

const setRate = (rate) => {
  annualRate.value = rate
  calculate()
}

const calculatePurchaseTax = () => {
  if (carType.value === 'new') {
    // 新车购置税 = 车价 / 1.13 * 0.1
    purchaseTax.value = parseFloat((carPrice.value / 1.13 * 0.1).toFixed(3))
  } else {
    purchaseTax.value = 0
  }
  calculate()
}

const calculateInsurance = () => {
  // 简化的保险费计算：车价的3-5%
  const rate = carType.value === 'new' ? 0.04 : 0.035
  insurance.value = parseFloat((carPrice.value * rate).toFixed(3))
  calculate()
}

const calculate = () => {
  // 保存计算历史
  if (loanAmount.value && annualRate.value && loanTerm.value) {
    const record = {
      timestamp: Date.now(),
      carType: carType.value,
      carPrice: carPrice.value,
      downPayment: downPayment.value,
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

const calculateComparison = () => {
  if (!loanAmount.value || !comparisonRate.value || !comparisonTerm.value) return
  
  const principal = loanAmount.value * 10000
  const rate = comparisonRate.value / 100 / 12
  const months = comparisonTerm.value * 12
  
  let comparisonMonthlyPayment, comparisonTotalInterest
  
  if (rate === 0) {
    comparisonMonthlyPayment = principal / months
    comparisonTotalInterest = 0
  } else {
    comparisonMonthlyPayment = principal * rate * Math.pow(1 + rate, months) / (Math.pow(1 + rate, months) - 1)
    comparisonTotalInterest = comparisonMonthlyPayment * months - principal
  }
  
  const comparisonTotalPayment = principal + comparisonTotalInterest
  
  comparisonData.value = {
    monthlyPayment: Math.round(comparisonMonthlyPayment),
    totalInterest: Math.round(comparisonTotalInterest),
    totalPayment: Math.round(comparisonTotalPayment),
    monthlySavings: Math.round(comparisonMonthlyPayment - parseFloat(monthlyPayment.value)),
    interestSavings: Math.round(comparisonTotalInterest - totalInterest.value)
  }
}

const exportSchedule = (format) => {
  const schedule = generateMonthlySchedule()
  
  if (format === 'csv') {
    let csv = '期数,日期,应还款额,应还本金,应还利息,剩余本金\n'
    schedule.forEach(item => {
      csv += `${item.period},${item.date},${item.payment},${item.principal},${item.interest},${item.remainingPrincipal}\n`
    })
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '车贷还款计划表.csv'
    link.click()
  }
}

const loadHistoryRecord = (record) => {
  carType.value = record.carType
  carPrice.value = record.carPrice
  downPayment.value = record.downPayment
  loanTerm.value = record.loanTerm
  annualRate.value = record.annualRate
  paymentMethod.value = record.paymentMethod
  calculate()
}

const clearHistory = () => {
  calculationHistory.value = []
}

// 监听车价变化，自动调整首付和附加费用
watch(carPrice, (newPrice) => {
  // 自动调整购置税和保险费
  if (carType.value === 'new') {
    purchaseTax.value = parseFloat((newPrice / 1.13 * 0.1).toFixed(3))
  }
  insurance.value = parseFloat((newPrice * (carType.value === 'new' ? 0.04 : 0.035)).toFixed(3))
})

onMounted(() => {
  calculatePurchaseTax()
  calculateInsurance()
  calculate()
  calculateComparison()
})
</script>

<style scoped>
.car-loan-calculator {
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
.comparison-section h3,
.history-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 18px;
}

.car-type-selector {
  margin-bottom: 25px;
}

.car-type-selector label {
  display: block;
  color: #495057;
  margin-bottom: 10px;
  font-weight: 500;
}

.type-options {
  display: flex;
  gap: 10px;
}

.type-btn {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.type-btn:hover {
  border-color: #3498db;
}

.type-btn.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
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

.additional-costs {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.additional-costs h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.cost-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.cost-group label {
  min-width: 80px;
  font-size: 14px;
  color: #495057;
}

.cost-input {
  flex: 1;
  padding: 8px;
  border: 2px solid #e9ecef;
  border-radius: 4px;
  font-size: 14px;
}

.auto-calc-btn {
  padding: 6px 12px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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
  background: linear-gradient(135deg, #e74c3c, #c0392b);
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

.total-cost-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 25px;
}

.total-cost-section h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.cost-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cost-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #ecf0f1;
}

.cost-item.total {
  border-top: 2px solid #3498db;
  border-bottom: none;
  font-weight: bold;
  color: #2c3e50;
  margin-top: 10px;
  padding-top: 15px;
}

.cost-label {
  color: #7f8c8d;
  font-size: 14px;
}

.cost-value {
  color: #2c3e50;
  font-weight: 500;
  font-size: 14px;
}

.payment-details {
  background: white;
  border-radius: 8px;
  padding: 20px;
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
  align-items: center;
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.income-input {
  width: 80px;
  padding: 4px 8px;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  font-size: 12px;
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

.comparison-section {
  grid-column: 1 / -1;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 25px;
  margin-top: 30px;
}

.scenario-controls {
  margin-bottom: 20px;
}

.scenario-controls h4 {
  color: #2c3e50;
  margin-bottom: 15px;
}

.scenario-inputs {
  display: flex;
  gap: 20px;
}

.scenario-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.scenario-group label {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.scenario-group select,
.scenario-input {
  padding: 8px;
  border: 2px solid #e9ecef;
  border-radius: 4px;
  font-size: 14px;
}

.comparison-table {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.comparison-table table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
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

.comparison-analysis {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.analysis-item {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  background: #ecf0f1;
}

.analysis-item.positive {
  background: #d4edda;
  color: #155724;
}

.analysis-item.negative {
  background: #f8d7da;
  color: #721c24;
}

.analysis-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}

.analysis-value {
  font-size: 18px;
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
  color: #e74c3c;
}

.history-total {
  color: #f39c12;
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
  
  .scenario-inputs {
    flex-direction: column;
  }
  
  .comparison-analysis {
    flex-direction: column;
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .type-options {
    flex-direction: column;
  }
  
  .schedule-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .view-options,
  .export-options {
    justify-content: center;
  }
  
  .history-item {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .cost-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>