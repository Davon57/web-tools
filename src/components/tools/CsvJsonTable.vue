<template>
  <div class="csv-json-table-container">
    <!-- 返回主页按钮 -->
    <button class="back-home-btn" @click="goHome" title="返回主页">
      ← 返回主页
    </button>

    <!-- 工具标题 -->
    <div class="tool-header">
      <h1 class="tool-title">📊 CSV/JSON转表格</h1>
      <p class="tool-description">将上传的CSV或JSON数据文件自动转换为可交互的HTML表格</p>
    </div>

    <!-- 文件上传区域 -->
    <div class="upload-section">
      <div class="upload-area" :class="{ 'drag-over': isDragOver }" 
           @drop="handleDrop" 
           @dragover.prevent="isDragOver = true" 
           @dragleave="isDragOver = false"
           @click="triggerFileInput">
        <input ref="fileInput" type="file" accept=".csv,.json" @change="handleFileSelect" style="display: none;">
        <div class="upload-icon">📁</div>
        <div class="upload-text">
          <p class="upload-title">点击或拖拽文件到此处</p>
          <p class="upload-subtitle">支持 CSV 和 JSON 格式文件</p>
        </div>
      </div>
    </div>

    <!-- 样式配置面板 -->
    <div v-if="tableData.length > 0" class="config-panel">
      <h3>🎨 样式配置</h3>
      <div class="config-options">
        <div class="config-group">
          <label>表格主题：</label>
          <select v-model="tableTheme" @change="applyTheme">
            <option value="default">默认</option>
            <option value="dark">深色</option>
            <option value="blue">蓝色</option>
            <option value="green">绿色</option>
          </select>
        </div>
        <div class="config-group">
          <label>每页显示：</label>
          <select v-model="pageSize" @change="updatePagination">
            <option value="10">10条</option>
            <option value="25">25条</option>
            <option value="50">50条</option>
            <option value="100">100条</option>
          </select>
        </div>
        <div class="config-group">
          <label>
            <input type="checkbox" v-model="showStripes"> 斑马纹
          </label>
        </div>
        <div class="config-group">
          <label>
            <input type="checkbox" v-model="showBorder"> 边框
          </label>
        </div>
      </div>
    </div>

    <!-- 表格操作栏 -->
    <div v-if="tableData.length > 0" class="table-controls">
      <div class="search-box">
        <input v-model="searchQuery" placeholder="搜索数据..." class="search-input">
        <button @click="clearSearch" class="clear-btn">清除</button>
      </div>
      <div class="table-info">
        共 {{ filteredData.length }} 条数据
      </div>
    </div>

    <!-- 数据表格 -->
    <div v-if="tableData.length > 0" class="table-container">
      <table class="data-table" 
             :class="{ 
               'striped': showStripes, 
               'bordered': showBorder,
               [`theme-${tableTheme}`]: true 
             }">
        <thead>
          <tr>
            <th v-for="column in columns" :key="column" 
                @click="sortBy(column)" 
                class="sortable-header">
              {{ column }}
              <span class="sort-indicator">
                <span v-if="sortColumn === column">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
                <span v-else>↕</span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in paginatedData" :key="index">
            <td v-for="column in columns" :key="column">
              {{ formatCellValue(row[column]) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页控件 -->
    <div v-if="totalPages > 1" class="pagination">
      <button @click="goToPage(1)" :disabled="currentPage === 1" class="page-btn">首页</button>
      <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="page-btn">上一页</button>
      
      <span class="page-numbers">
        <button v-for="page in visiblePages" :key="page" 
                @click="goToPage(page)" 
                :class="{ active: page === currentPage }" 
                class="page-number">
          {{ page }}
        </button>
      </span>
      
      <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="page-btn">下一页</button>
      <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="page-btn">末页</button>
      
      <span class="page-info">
        第 {{ currentPage }} / {{ totalPages }} 页
      </span>
    </div>

    <!-- 空状态 -->
    <div v-if="tableData.length === 0 && !isLoading" class="empty-state">
      <div class="empty-icon">📄</div>
      <p class="empty-text">请上传CSV或JSON文件开始使用</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>正在解析文件...</p>
    </div>

    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message">
      <div class="error-icon">❌</div>
      <p>{{ errorMessage }}</p>
      <button @click="clearError" class="clear-error-btn">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 响应式数据
const tableData = ref([])
const columns = ref([])
const isDragOver = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')
const fileInput = ref(null)

// 表格配置
const tableTheme = ref('default')
const showStripes = ref(true)
const showBorder = ref(true)
const pageSize = ref(25)
const currentPage = ref(1)
const sortColumn = ref('')
const sortDirection = ref('asc')
const searchQuery = ref('')

// 计算属性
const filteredData = computed(() => {
  if (!searchQuery.value) return tableData.value
  
  const query = searchQuery.value.toLowerCase()
  return tableData.value.filter(row => {
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(query)
    )
  })
})

const sortedData = computed(() => {
  if (!sortColumn.value) return filteredData.value
  
  return [...filteredData.value].sort((a, b) => {
    const aVal = a[sortColumn.value]
    const bVal = b[sortColumn.value]
    
    // 数字排序
    if (!isNaN(aVal) && !isNaN(bVal)) {
      return sortDirection.value === 'asc' ? aVal - bVal : bVal - aVal
    }
    
    // 字符串排序
    const aStr = String(aVal).toLowerCase()
    const bStr = String(bVal).toLowerCase()
    
    if (sortDirection.value === 'asc') {
      return aStr.localeCompare(bStr)
    } else {
      return bStr.localeCompare(aStr)
    }
  })
})

const totalPages = computed(() => {
  return Math.ceil(sortedData.value.length / pageSize.value)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return sortedData.value.slice(start, end)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// 方法
const goHome = () => {
  router.push('/')
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    processFile(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false
  
  const files = event.dataTransfer.files
  if (files.length > 0) {
    processFile(files[0])
  }
}

const processFile = async (file) => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const text = await readFileAsText(file)
    
    if (file.name.toLowerCase().endsWith('.csv')) {
      parseCSV(text)
    } else if (file.name.toLowerCase().endsWith('.json')) {
      parseJSON(text)
    } else {
      throw new Error('不支持的文件格式，请上传CSV或JSON文件')
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file, 'UTF-8')
  })
}

const parseCSV = (text) => {
  const lines = text.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV文件格式不正确，至少需要包含标题行和数据行')
  }
  
  // 解析标题行
  const headers = parseCSVLine(lines[0])
  columns.value = headers
  
  // 解析数据行
  const data = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    if (values.length === headers.length) {
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index]
      })
      data.push(row)
    }
  }
  
  if (data.length === 0) {
    throw new Error('CSV文件中没有有效的数据行')
  }
  
  tableData.value = data
  resetTableState()
}

const parseCSVLine = (line) => {
  const result = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
}

const parseJSON = (text) => {
  try {
    const data = JSON.parse(text)
    
    // 处理数组形式的JSON（原有逻辑）
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error('JSON数组不能为空')
      }
      
      // 提取所有可能的列名
      const allColumns = new Set()
      data.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => allColumns.add(key))
        }
      })
      
      if (allColumns.size === 0) {
        throw new Error('JSON数组中的对象没有有效的属性')
      }
      
      columns.value = Array.from(allColumns)
      tableData.value = data
      resetTableState()
      return
    }
    
    // 处理对象形式的JSON（新增逻辑）
    if (typeof data === 'object' && data !== null) {
      // 查找包含数组的属性
      const arrayProperties = []
      Object.keys(data).forEach(key => {
        if (Array.isArray(data[key]) && data[key].length > 0) {
          // 检查数组中的元素是否为对象
          const firstElement = data[key][0]
          if (typeof firstElement === 'object' && firstElement !== null) {
            arrayProperties.push({
              key: key,
              array: data[key],
              length: data[key].length
            })
          }
        }
      })
      
      if (arrayProperties.length === 0) {
        throw new Error('JSON对象中没有找到包含对象的数组属性')
      }
      
      // 如果有多个数组属性，选择最长的那个
      const selectedProperty = arrayProperties.reduce((prev, current) => 
        current.length > prev.length ? current : prev
      )
      
      const arrayData = selectedProperty.array
      
      // 提取所有可能的列名
      const allColumns = new Set()
      arrayData.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          Object.keys(item).forEach(key => allColumns.add(key))
        }
      })
      
      if (allColumns.size === 0) {
        throw new Error('选中的数组中的对象没有有效的属性')
      }
      
      columns.value = Array.from(allColumns)
      tableData.value = arrayData
      resetTableState()
      
      // 显示提示信息，告知用户使用了哪个属性的数据
      if (arrayProperties.length > 1) {
        console.log(`检测到多个数组属性，已选择 "${selectedProperty.key}" (${selectedProperty.length} 条记录)`)
        // 可以在界面上显示提示
        errorMessage.value = `已自动选择属性 "${selectedProperty.key}" 的数据 (${selectedProperty.length} 条记录)`
        setTimeout(() => {
          errorMessage.value = ''
        }, 3000)
      }
      
      return
    }
    
    throw new Error('JSON文件必须包含一个数组或包含数组属性的对象')
    
  } catch (error) {
    throw new Error('JSON文件格式不正确：' + error.message)
  }
}

const resetTableState = () => {
  currentPage.value = 1
  sortColumn.value = ''
  sortDirection.value = 'asc'
  searchQuery.value = ''
}

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const updatePagination = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const clearError = () => {
  errorMessage.value = ''
}

const formatCellValue = (value) => {
  if (value === null || value === undefined) {
    return ''
  }
  
  // 处理对象和数组
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2)
    } catch (e) {
      return '[复杂对象]'
    }
  }
  
  // 处理布尔值
  if (typeof value === 'boolean') {
    return value ? '是' : '否'
  }
  
  // 处理数字
  if (typeof value === 'number') {
    return value.toLocaleString()
  }
  
  return String(value)
}

const applyTheme = () => {
  // 主题应用逻辑已在CSS中处理
}
</script>

<style scoped>
.csv-json-table-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 20px;
  position: relative;
  overflow-y: auto;
}

.back-home-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.back-home-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tool-header {
  text-align: center;
  margin: 60px 0 40px 0;
}

.tool-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
  font-weight: 700;
}

.tool-description {
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0;
}

.upload-section {
  max-width: 600px;
  margin: 0 auto 40px auto;
}

.upload-area {
  border: 2px dashed #bdc3c7;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

.upload-area:hover,
.upload-area.drag-over {
  border-color: #3498db;
  background: rgba(52, 152, 219, 0.1);
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 15px;
}

.upload-title {
  font-size: 1.2rem;
  color: #2c3e50;
  margin: 0 0 5px 0;
  font-weight: 600;
}

.upload-subtitle {
  color: #7f8c8d;
  margin: 0;
}

.config-panel {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.config-panel h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.config-options {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.config-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-group label {
  font-weight: 500;
  color: #34495e;
}

.config-group select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 250px;
}

.clear-btn {
  padding: 8px 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.clear-btn:hover {
  background: #c0392b;
}

.table-info {
  color: #7f8c8d;
  font-size: 14px;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: auto;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  max-height: 70vh;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  background: #f8f9fa;
  padding: 12px 15px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  position: sticky;
  top: 0;
  z-index: 10;
}

.sortable-header {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.sortable-header:hover {
  background: #e9ecef;
}

.sort-indicator {
  margin-left: 5px;
  font-size: 12px;
  color: #6c757d;
}

.data-table td {
  padding: 10px 15px;
  border-bottom: 1px solid #f1f3f4;
  max-width: 300px;
  word-wrap: break-word;
  white-space: pre-wrap;
  vertical-align: top;
}

.data-table.striped tbody tr:nth-child(even) {
  background: #f8f9fa;
}

.data-table.bordered {
  border: 1px solid #dee2e6;
}

.data-table.bordered th,
.data-table.bordered td {
  border-right: 1px solid #dee2e6;
}

/* 主题样式 */
.data-table.theme-dark {
  background: #2c3e50;
  color: white;
}

.data-table.theme-dark th {
  background: #34495e;
  color: white;
}

.data-table.theme-dark.striped tbody tr:nth-child(even) {
  background: #34495e;
}

.data-table.theme-blue th {
  background: #3498db;
  color: white;
}

.data-table.theme-green th {
  background: #27ae60;
  color: white;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.page-btn,
.page-number {
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  color: #333;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.page-btn:hover:not(:disabled),
.page-number:hover {
  background: #f8f9fa;
  border-color: #3498db;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-number.active {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-info {
  color: #7f8c8d;
  font-size: 14px;
  margin-left: 10px;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.empty-text {
  font-size: 1.1rem;
  margin: 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 8px;
  padding: 15px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-icon {
  font-size: 1.2rem;
}

.clear-error-btn {
  background: #e53e3e;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  cursor: pointer;
  font-size: 12px;
  margin-left: auto;
}

.clear-error-btn:hover {
  background: #c53030;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .csv-json-table-container {
    padding: 10px;
  }
  
  .tool-title {
    font-size: 2rem;
  }
  
  .config-options {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .table-controls {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .page-info {
    margin-left: 0;
    margin-top: 10px;
  }
}
</style>