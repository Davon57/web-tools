<template>
  <div class="fullscreen-todo">
    <!-- 顶部输入区域 -->
    <div class="todo-header">
      <div class="input-container">
        <input 
          v-model="newTodoText"
          @keyup.enter="addTodo"
          type="text" 
          placeholder="添加新的待办事项..."
          class="todo-input"
        />
        <button @click="showDatePicker" class="calendar-btn" title="选择日期">
          📅
        </button>
        <button @click="goHome" class="home-btn" title="返回主页">
          🏠
        </button>
      </div>
    </div>

    <!-- 日期选择弹窗 -->
    <div v-if="showDatePickerModal" class="date-picker-overlay" @click="closeDatePicker">
      <div class="date-picker-container" @click.stop>
        <div class="date-picker-header">
          <div class="header-content">
            <div class="header-icon">📅</div>
            <h3 class="header-title">选择截止日期</h3>
          </div>
          <button @click="closeDatePicker" class="close-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="date-picker-body">
          <!-- 快捷日期选择 -->
          <div class="quick-dates">
            <h4 class="section-title">快速选择</h4>
            <div class="quick-date-grid">
              <button @click="setToday" class="quick-date-btn" :class="{ 'active': isSelectedDate(getTodayDate()) }">
                <div class="quick-date-icon">🌅</div>
                <div class="quick-date-text">
                  <span class="quick-date-label">今天</span>
                  <span class="quick-date-value">{{ formatQuickDate(getTodayDate()) }}</span>
                </div>
              </button>
              <button @click="setTomorrow" class="quick-date-btn" :class="{ 'active': isSelectedDate(getTomorrowDate()) }">
                <div class="quick-date-icon">🌤️</div>
                <div class="quick-date-text">
                  <span class="quick-date-label">明天</span>
                  <span class="quick-date-value">{{ formatQuickDate(getTomorrowDate()) }}</span>
                </div>
              </button>
              <button @click="setNextWeek" class="quick-date-btn" :class="{ 'active': isSelectedDate(getNextWeekDate()) }">
                <div class="quick-date-icon">📆</div>
                <div class="quick-date-text">
                  <span class="quick-date-label">下周</span>
                  <span class="quick-date-value">{{ formatQuickDate(getNextWeekDate()) }}</span>
                </div>
              </button>
            </div>
          </div>

          <!-- 自定义日期选择 -->
          <div class="custom-date">
            <h4 class="section-title">自定义日期</h4>
            <div class="date-input-wrapper">
              <input 
                type="date" 
                v-model="selectedTaskDate" 
                class="modern-date-input"
                :min="new Date().toISOString().split('T')[0]"
              />
              <div class="date-input-icon">📅</div>
            </div>
          </div>
        </div>
        
        <div class="date-picker-footer">
          <button @click="closeDatePicker" class="action-btn secondary">取消</button>
          <button @click="confirmDate" class="action-btn primary">确定</button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="todo-main">
      <!-- 左侧边栏 -->
      <div class="sidebar">
        <!-- 任务管理 -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">📋 我的待办</h3>
          <div class="sidebar-content">
            <div class="task-stats">
              <div class="stat-item">
                <span class="stat-number">{{ totalTasks }}</span>
                <span class="stat-label">总任务</span>
              </div>
              <div class="stat-item">
                <span class="stat-number">{{ getCompletedTasksCount() }}</span>
                <span class="stat-label">已完成</span>
              </div>
            </div>
            <!-- 添加已完成任务切换按钮 -->
            <div class="task-view-toggle">
              <button 
                @click="activeTaskTab = 'pending'" 
                class="toggle-btn"
                :class="{ 'active': activeTaskTab === 'pending' }"
              >
                📝 待办
              </button>
              <button 
                @click="activeTaskTab = 'completed'" 
                class="toggle-btn"
                :class="{ 'active': activeTaskTab === 'completed' }"
              >
                ✅已完成
              </button>
            </div>
          </div>
        </div>

        <!-- 日历视图 -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">📅 日历</h3>
          <div class="sidebar-content">
            <button 
              @click="showCalendarView = !showCalendarView" 
              class="calendar-view-btn"
              :class="{ 'active': showCalendarView }"
            >
              {{ showCalendarView ? '📋 返回清单' : '📅 查看日历' }}
            </button>
          </div>
        </div>

        <!-- 搜索功能 -->
        <div class="sidebar-section">
          <h3 class="sidebar-title">🔍 搜索</h3>
          <div class="sidebar-content">
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="搜索任务..."
              class="search-input"
              @input="filterTasks"
            />
            <div v-if="searchResults.length > 0" class="search-results">
              <div 
                v-for="result in searchResults" 
                :key="result.id"
                class="search-result-item"
                @click="highlightTask(result.id)"
              >
                {{ result.text }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧主内容区域 -->
      <div class="main-content">
        <!-- 日历视图 -->
        <div v-if="showCalendarView" class="calendar-view">
          <div class="calendar-header">
            <h2>📅 日历视图</h2>
            <div class="calendar-nav">
              <button @click="prevMonth" class="nav-btn">‹</button>
              <span class="month-year">{{ currentMonthYear }}</span>
              <button @click="nextMonth" class="nav-btn">›</button>
            </div>
          </div>
          
          <div class="full-calendar">
            <div class="calendar-grid">
              <!-- 星期标题 -->
              <div v-for="day in weekDays" :key="day" class="day-header">
                {{ day }}
              </div>
              
              <!-- 日期格子 -->
              <div 
                v-for="date in calendarDates" 
                :key="date.key"
                class="calendar-date"
                :class="{
                  'today': date.isToday,
                  'other-month': !date.isCurrentMonth,
                  'has-tasks': date.hasTasks
                }"
                @click="selectDate(date)"
              >
                <div class="date-number">{{ date.day }}</div>
                <div v-if="date.hasTasks" class="task-list">
                  <div 
                    v-for="task in getTasksForDate(date.date).slice(0, 3)" 
                    :key="task.id"
                    class="task-item-mini"
                    :class="{ 'completed': task.status === 'completed' }"
                    :title="task.title"
                  >
                    {{ task.title.length > 8 ? task.title.substring(0, 8) + '...' : task.title }}
                  </div>
                  <div v-if="getTasksForDate(date.date).length > 3" class="more-tasks">
                    +{{ getTasksForDate(date.date).length - 3 }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 清单视图 -->
        <div v-else class="list-view">
          <!-- 清单管理 -->
          <div class="lists-header">
            <h2>📋 清单管理</h2>
            <button @click="showAddListModal = true" class="add-list-btn">+ 添加清单</button>
          </div>

          <!-- 清单列表 -->
          <div class="lists-container">
            <div 
              v-for="list in todoLists" 
              :key="list.id"
              class="todo-list-card"
              :class="{ 'active': activeListId === list.id }"
              @click="selectList(list.id)"
            >
              <div class="list-header">
                <h3 class="list-title">{{ list.name }}</h3>
                <div class="list-actions">
                  <button @click.stop="editList(list)" class="action-btn edit-btn" title="编辑">✏️</button>
                  <button @click.stop="deleteList(list.id)" class="action-btn delete-btn" title="删除">🗑️</button>
                </div>
              </div>
              <div class="list-stats">
                <span class="task-count">{{ list.tasks.length }} 个任务</span>
                <span class="completed-count">{{ getCompletedCount(list.tasks) }} 已完成</span>
              </div>
            </div>
          </div>

          <!-- 当前选中清单的任务 -->
          <div v-if="activeList" class="active-list-section">
            <div class="section-header">
              <h2>{{ activeList.name }}</h2>
            </div>
            <!-- 任务列表 -->
            <div class="task-items">
              <div 
                v-for="(task, index) in sortedTasks" 
                :key="task.id"
                class="task-item"
                :class="{ 'completed': task.status === 'completed', 'pinned': task.priority === 'high' }"
              >
                <div class="task-content">
                  <div class="task-info">
                    <span class="task-text">{{ task.title }}</span>
                    <span v-if="task.dueDate" class="task-date">📅 {{ task.dueDate.split('T')[0] }}</span>
                  </div>
                </div>
                <div class="task-actions1">
                  <!-- 未完成任务显示所有操作按钮 -->
                  <template v-if="activeTaskTab === 'pending'">
                    <button 
                      @click="toggleTask(task)" 
                      class="action-btn complete-btn" 
                      :class="{ 'completed': task.status === 'completed' }"
                      title="完成"
                    >
                      {{ task.status === 'completed' ? '✅' : '⭕' }}
                    </button>
                    <button 
                      @click="togglePin(task)" 
                      class="action-btn pin-btn" 
                      :class="{ 'pinned': task.priority === 'high' }"
                      title="置顶"
                    >
                      📌
                    </button>
                    <button 
                      @click="editTask(task)" 
                      class="action-btn edit-btn" 
                      title="编辑"
                    >
                      ✏️
                    </button>
                    <button 
                      @click="deleteTask(task.id)" 
                      class="action-btn delete-btn" 
                      title="删除"
                    >
                      🗑️
                    </button>
                  </template>
                  <!-- 已完成任务只显示状态和删除按钮 -->
                  <template v-else>
                    <button 
                      @click="toggleTask(task)" 
                      class="action-btn complete-btn completed" 
                      title="取消完成"
                    >
                      ✅
                    </button>
                    <button 
                      @click="deleteTask(task.id)" 
                      class="action-btn delete-btn" 
                      title="删除"
                    >
                      🗑️
                    </button>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加清单弹窗 -->
    <div v-if="showAddListModal" class="modal-overlay" @click="closeAddListModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加新清单</h3>
          <button @click="closeAddListModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <input 
            v-model="newListName"
            type="text" 
            placeholder="清单名称..."
            class="list-name-input"
            @keyup.enter="addNewList"
          />
        </div>
        <div class="modal-footer">
          <button @click="addNewList" class="confirm-btn">确定</button>
          <button @click="closeAddListModal" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>

    <!-- 编辑清单弹窗 -->
    <div v-if="showEditListModal" class="modal-overlay" @click="closeEditListModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>编辑清单</h3>
          <button @click="closeEditListModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <input 
            v-model="editingListName"
            type="text" 
            placeholder="清单名称..."
            class="list-name-input"
            @keyup.enter="saveListEdit"
          />
        </div>
        <div class="modal-footer">
          <button @click="saveListEdit" class="confirm-btn">确定</button>
          <button @click="closeEditListModal" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>

    <!-- 日期任务弹窗 -->
    <div v-if="showDateTasksModal" class="modal-overlay" @click="closeDateTasksModal">
      <div class="modal-content date-tasks-modal" @click.stop>
        <div class="modal-header">
          <h3>📅 {{ selectedCalendarDate?.date }} 的任务</h3>
          <button @click="closeDateTasksModal" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div v-if="getTasksForDate(selectedCalendarDate?.date).length === 0" class="no-tasks">
            <p>这一天没有安排任务</p>
          </div>
          <div v-else class="date-tasks-list">
            <div 
              v-for="task in getTasksForDate(selectedCalendarDate?.date)" 
              :key="task.id"
              class="date-task-item"
              :class="{ 'completed': task.status === 'completed' }"
            >
              <div class="task-content">
                <div class="task-info">
                  <div class="task-text">{{ task.title }}</div>
                  <div class="task-list-name">来自：{{ task.listName }}</div>
                </div>
              </div>
              <div class="date-task-actions">
                <button 
                  @click="toggleTask(task)" 
                  class="action-btn complete-btn" 
                  :class="{ 'completed': task.status === 'completed' }"
                  title="完成"
                >
                  {{ task.status === 'completed' ? '✅' : '⭕' }}
                </button>
                <button 
                  @click="goToTaskList(task.listId)" 
                  class="goto-list-btn"
                  title="跳转到清单"
                >
                  📋
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 任务编辑弹窗 -->
  <div v-if="showEditTaskModal" class="modal-overlay" @click="closeEditTaskModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>编辑任务</h3>
        <button @click="closeEditTaskModal" class="close-btn">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="editTaskTitle">任务标题</label>
          <input 
            id="editTaskTitle"
            v-model="editTaskTitle" 
            type="text" 
            placeholder="请输入任务标题"
            class="form-input"
            @keyup.enter="saveTaskEdit"
          />
        </div>
        <div class="form-group">
          <label for="editTaskDate">截止日期</label>
          <input 
            id="editTaskDate"
            v-model="editTaskDate" 
            type="date" 
            class="form-input"
          />
        </div>
      </div>
      <div class="modal-footer">
        <button @click="closeEditTaskModal" class="cancel-btn">取消</button>
        <button @click="saveTaskEdit" class="confirm-btn">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useTodoStore } from '@/stores/todoStore.js'

const router = useRouter()
const todoStore = useTodoStore()

// 组件挂载时初始化数据
onMounted(async () => {
  try {
    await todoStore.initializeStore()
  } catch (error) {
    console.error('初始化数据失败:', error)
  }
})

// 响应式数据
const newTodoText = ref('')
const selectedTaskDate = ref('')
const showDatePickerModal = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const showAddListModal = ref(false)
const showEditListModal = ref(false)
const newListName = ref('')
const editingListName = ref('')
const editingListId = ref(null)
const activeListId = ref(null)
const activeTaskTab = ref('pending') // 标签页状态：'pending' 或 'completed'
const showCalendarView = ref(false)
const selectedCalendarDate = ref(null)
const showDateTasksModal = ref(false)
const showEditTaskModal = ref(false)
const editingTask = ref(null)
const editTaskTitle = ref('')
const editTaskDate = ref('')

// 日历相关
const currentDate = ref(new Date())
const weekDays = ['日', '一', '二', '三', '四', '五', '六']

// 使用store中的数据
const todoLists = computed(() => todoStore.todoLists)
const totalTasks = computed(() => todoStore.totalTasks)

// 计算属性
const activeList = computed(() => {
  return todoLists.value.find(list => list.id === activeListId.value)
})

// 按时间排序的任务列表
const sortedTasks = computed(() => {
  if (!activeList.value || !activeList.value.tasks) {
    return []
  }
  
  const currentTime = new Date()
  
  // 根据当前标签页过滤任务
  const filteredTasks = activeList.value.tasks.filter(task => {
    if (activeTaskTab.value === 'pending') {
      return task.status !== 'completed'
    } else {
      return task.status === 'completed'
    }
  })
  
  return [...filteredTasks].sort((a, b) => {
    // 如果任务没有截止日期，放在最后
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    
    const dateA = new Date(a.dueDate)
    const dateB = new Date(b.dueDate)
    
    // 计算距离当前时间的差值（绝对值）
    const diffA = Math.abs(dateA.getTime() - currentTime.getTime())
    const diffB = Math.abs(dateB.getTime() - currentTime.getTime())
    
    // 距离当前时间越近的排在前面
    return diffA - diffB
  })
})

// 未完成任务数量
const pendingTasksCount = computed(() => {
  if (!activeList.value || !activeList.value.tasks) {
    return 0
  }
  return activeList.value.tasks.filter(task => task.status !== 'completed').length
})

const currentMonthYear = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth() + 1
  return `${year}年${month}月`
})

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // 获取当月第一天和最后一天
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  // 获取当月第一天是星期几
  const firstDayWeek = firstDay.getDay()
  
  // 获取上个月需要显示的日期
  const prevMonth = new Date(year, month - 1, 0)
  const prevMonthDays = prevMonth.getDate()
  
  const dates = []
  
  // 添加上个月的日期
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const day = prevMonthDays - i
    const date = new Date(year, month - 1, day)
    dates.push({
      day,
      date: formatDate(date),
      isCurrentMonth: false,
      isToday: false,
      hasTasks: hasTasksOnDate(formatDate(date)),
      key: `prev-${day}`
    })
  }
  
  // 添加当月的日期
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const date = new Date(year, month, day)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    dates.push({
      day,
      date: formatDate(date),
      isCurrentMonth: true,
      isToday,
      hasTasks: hasTasksOnDate(formatDate(date)),
      key: `current-${day}`
    })
  }
  
  // 添加下个月的日期，补齐6行
  const totalCells = 42 // 6行 × 7列
  const remainingCells = totalCells - dates.length
  
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(year, month + 1, day)
    dates.push({
      day,
      date: formatDate(date),
      isCurrentMonth: false,
      isToday: false,
      hasTasks: hasTasksOnDate(formatDate(date)),
      key: `next-${day}`
    })
  }
  
  return dates
})

// 方法
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const hasTasksOnDate = (dateString) => {
  return todoStore.hasTasksOnDate(dateString)
}

const getTasksForDate = (dateString) => {
  return todoStore.getTasksForDate(dateString)
}

const selectDate = (date) => {
  selectedCalendarDate.value = date
  showDateTasksModal.value = true
}

const closeDateTasksModal = () => {
  showDateTasksModal.value = false
  selectedCalendarDate.value = null
}

const goToTaskList = (listId) => {
  showCalendarView.value = false
  activeListId.value = listId
  closeDateTasksModal()
}

const prevMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() - 1)
  currentDate.value = newDate
}

const nextMonth = () => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + 1)
  currentDate.value = newDate
}

const addTodo = async () => {
  if (newTodoText.value.trim() && activeList.value) {
    try {
      // 如果没有选择日期，默认使用今天的日期
      const today = new Date().toISOString().split('T')[0]
      const taskDate = selectedTaskDate.value || today
      
      await todoStore.addTask(activeList.value.id, newTodoText.value.trim(), taskDate)
      
      newTodoText.value = ''
      selectedTaskDate.value = ''
    } catch (error) {
      console.error('添加任务失败:', error)
    }
  }
}

const showDatePicker = () => {
  showDatePickerModal.value = true
}

const closeDatePicker = () => {
  showDatePickerModal.value = false
}

const confirmDate = () => {
  closeDatePicker()
}

// 日期快捷选择函数
const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

const getTomorrowDate = () => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
}

const getNextWeekDate = () => {
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  return nextWeek.toISOString().split('T')[0]
}

const isSelectedDate = (date) => {
  return selectedTaskDate.value === date
}

const formatQuickDate = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}月${day}日`
}

const setToday = () => {
  selectedTaskDate.value = getTodayDate()
}

const setTomorrow = () => {
  selectedTaskDate.value = getTomorrowDate()
}

const setNextWeek = () => {
  selectedTaskDate.value = getNextWeekDate()
}

const selectList = (listId) => {
  activeListId.value = listId
}

const toggleTask = async (task) => {
  try {
    await todoStore.toggleTask(task)
  } catch (error) {
    console.error('切换任务状态失败:', error)
  }
}

const togglePin = async (task) => {
  try {
    await todoStore.togglePin(task)
  } catch (error) {
    console.error('切换置顶状态失败:', error)
  }
}

const editTask = (task) => {
  editingTask.value = task
  editTaskTitle.value = task.title
  editTaskDate.value = task.dueDate || ''
  showEditTaskModal.value = true
}

const saveTaskEdit = async () => {
  if (editTaskTitle.value.trim() && editingTask.value) {
    try {
      const updateData = { 
        title: editTaskTitle.value.trim(),
        dueDate: editTaskDate.value || null
      }
      await todoStore.updateTask(editingTask.value.id, updateData)
      closeEditTaskModal()
    } catch (error) {
      console.error('保存任务编辑失败:', error)
    }
  }
}

const closeEditTaskModal = () => {
  showEditTaskModal.value = false
  editingTask.value = null
  editTaskTitle.value = ''
  editTaskDate.value = ''
}

const deleteTask = async (taskId) => {
  try {
    await todoStore.deleteTask(taskId)
  } catch (error) {
    console.error('删除任务失败:', error)
  }
}

const addNewList = async () => {
  if (newListName.value.trim()) {
    try {
      const newListId = await todoStore.addList(newListName.value.trim())
      newListName.value = ''
      showAddListModal.value = false
      activeListId.value = newListId
    } catch (error) {
      console.error('添加清单失败:', error)
    }
  }
}

const closeAddListModal = () => {
  showAddListModal.value = false
  newListName.value = ''
}

const editList = (list) => {
  editingListId.value = list.id
  editingListName.value = list.name
  showEditListModal.value = true
}

const saveListEdit = async () => {
  if (editingListName.value.trim() && editingListId.value) {
    try {
      await todoStore.updateList(editingListId.value, editingListName.value.trim())
      editingListName.value = ''
      editingListId.value = null
      showEditListModal.value = false
    } catch (error) {
      console.error('保存清单编辑失败:', error)
    }
  }
}

const closeEditListModal = () => {
  showEditListModal.value = false
  editingListId.value = null
  editingListName.value = ''
}

const deleteList = async (listId) => {
  if (todoLists.value.length <= 1) {
    alert('至少需要保留一个清单')
    return
  }
  
  if (confirm('确定要删除这个清单吗？清单中的所有任务也会被删除。')) {
    try {
      await todoStore.deleteList(listId)
      
      // 如果删除的是当前活动清单，切换到第一个清单
      if (activeListId.value === listId) {
        activeListId.value = todoLists.value[0]?.id || null
      }
    } catch (error) {
      console.error('删除清单失败:', error)
    }
  }
}

const getCompletedCount = (tasks) => {
  return tasks.filter(task => task.status === 'completed').length
}

const getCompletedTasksCount = () => {
  let totalCompleted = 0
  todoLists.value.forEach(list => {
    totalCompleted += getCompletedCount(list.tasks)
  })
  return totalCompleted
}

const filterTasks = () => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) {
    searchResults.value = []
    return
  }
  
  const results = []
  todoLists.value.forEach(list => {
    list.tasks.forEach(task => {
      if (task.title.toLowerCase().includes(query)) {
        results.push({
          id: task.id,
          text: task.title,
          listName: list.name
        })
      }
    })
  })
  
  searchResults.value = results
}

const highlightTask = (taskId) => {
  const list = todoLists.value.find(l => l.tasks.some(t => t.id === taskId))
  if (list) {
    activeListId.value = list.id
    searchQuery.value = ''
    searchResults.value = []
  }
}

const goHome = () => {
  router.push('/')
}

// 初始化时选择第一个清单
onMounted(() => {
  if (todoLists.value.length > 0) {
    activeListId.value = todoLists.value[0].id
  }
})
</script>

<style scoped>
.fullscreen-todo {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 顶部输入区域 */
.todo-header {
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.input-container {
  display: flex;
  gap: 10px;
  max-width: 800px;
  margin: 0 auto;
}

.todo-input {
  flex: 1;
  padding: 15px 20px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.todo-input:focus {
  outline: none;
  background: white;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.calendar-btn, .home-btn {
  padding: 15px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.calendar-btn:hover, .home-btn:hover {
  background: white;
  transform: scale(1.1);
}

/* 主要内容区域 */
.todo-main {
  flex: 1;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 20px;
  padding: 20px;
  overflow: hidden;
}

/* 左侧边栏 */
.sidebar {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow-y: auto;
}

.sidebar-section {
  margin-bottom: 30px;
}

.sidebar-title {
  color: #2d3748;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-content {
  background: #f7fafc;
  border-radius: 12px;
  padding: 15px;
}

/* 任务统计 */
.task-stats {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 15px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 12px;
  color: #718096;
  margin-top: 5px;
}

/* 任务视图切换按钮 */
.task-view-toggle {
  display: flex;
  gap: 8px;
}

.toggle-btn {
  flex: 1;
  padding: 8px 12px;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: #cbd5e0;
}

.toggle-btn.active {
  background: #667eea;
  color: white;
}

/* 日历视图按钮 */
.calendar-view-btn {
  width: 100%;
  padding: 12px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.calendar-view-btn:hover {
  background: #5a6fd8;
  transform: translateY(-2px);
}

.calendar-view-btn.active {
  background: #48bb78;
}

/* 搜索功能 */
.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 10px;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
}

.search-results {
  max-height: 200px;
  overflow-y: auto;
}

.search-result-item {
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-result-item:hover {
  background: #edf2f7;
  border-color: #cbd5e0;
}

/* 右侧主内容区域 */
.main-content {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  overflow-y: auto;
}

/* 日历视图样式 */
.calendar-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.calendar-view .calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
}

.calendar-view .calendar-header h2 {
  color: #2d3748;
  margin: 0;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background: #5a6fd8;
  transform: scale(1.1);
}

.month-year {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  min-width: 120px;
  text-align: center;
}

.full-calendar {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  flex: 1;
}

.day-header {
  background: #4a5568;
  color: white;
  padding: 15px 10px;
  text-align: center;
  font-weight: 600;
  font-size: 14px;
}

.calendar-date {
  background: white;
  min-height: 100px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.calendar-date:hover {
  background: #edf2f7;
  transform: scale(1.02);
}

.calendar-date.today {
  background: #e6fffa;
  border: 2px solid #38b2ac;
}

.calendar-date.other-month {
  background: #f7fafc;
  color: #a0aec0;
}

.calendar-date.has-tasks {
  background: #fff5f5;
  border-left: 4px solid #f56565;
}

.date-number {
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 5px;
  flex: 1;
  overflow: hidden;
}

.task-item-mini {
  background: #4299e1;
  color: white;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 10px;
  line-height: 1.2;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.task-item-mini:hover {
  background: #3182ce;
  transform: scale(1.02);
}

.task-item-mini.completed {
  background: #68d391;
  text-decoration: line-through;
  opacity: 0.7;
}

.more-tasks {
  font-size: 9px;
  color: #718096;
  text-align: center;
  margin-top: 2px;
  font-weight: 600;
}

/* 清单视图样式 */
.list-view {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.lists-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
}

.lists-header h2 {
  color: #2d3748;
  margin: 0;
}

.add-list-btn {
  background: #48bb78;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-list-btn:hover {
  background: #38a169;
  transform: translateY(-2px);
}

/* 清单卡片 */
.lists-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.todo-list-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.todo-list-card:hover {
  border-color: #cbd5e0;
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.todo-list-card.active {
  border-color: #667eea;
  background: #f0f4ff;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.list-title {
  color: #2d3748;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.list-actions {
  display: flex;
  gap: 5px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  font-size: 16px;
  min-width: 24px;
}

.action-btn:hover {
  background: #edf2f7;
}

.edit-btn:hover {
  background: #e6fffa;
}

.delete-btn:hover {
  background: #fed7d7;
}

.pin-btn.pinned {
  color: #f6ad55;
}

.list-stats {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #718096;
}

/* 当前清单任务区域 */
.active-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e2e8f0;
}

.section-header h2 {
  color: #2d3748;
  margin: 0;
}

/* 任务项 */
.task-items {
  flex: 1;
  overflow-y: auto;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  margin-bottom: 10px;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
}

.task-item:hover {
  border-color: #4CAF50;
}

.task-item.completed {
  opacity: 0.7;
  background: #f0fff4;
  border-color: #9ae6b4;
}

.task-item.pinned {
  border-left: 4px solid #f6ad55;
  background: #fffaf0;
}

.task-content {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.complete-btn {
  font-size: 16px;
  transition: all 0.3s ease;
}

.complete-btn:hover {
  transform: scale(1.1);
}

.complete-btn.completed {
  color: #48bb78;
}

.task-info {
  flex: 1;
}

.task-text {
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 5px;
}

.task-date {
  font-size: 12px;
  color: #718096;
  background: #edf2f7;
  padding: 2px 8px;
  border-radius: 12px;
}

.task-edit-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #667eea;
  border-radius: 6px;
  font-size: 16px;
  background: white;
}

.task-edit-input:focus {
  outline: none;
  border-color: #5a6fd8;
}

.task-actions {
  display: flex;
  gap: 2px;
}
.task-actions1 {
  display: flex;
  gap: 0px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 15px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  border-bottom: 2px solid #e2e8f0;
  background: #f7fafc;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #718096;
  padding: 5px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #2d3748;
}

.modal-body {
  padding: 25px;
  max-height: 400px;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 25px;
  border-top: 2px solid #e2e8f0;
  background: #f7fafc;
}

.confirm-btn, .cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.confirm-btn {
  background: #48bb78;
  color: white;
}

.confirm-btn:hover {
  background: #38a169;
  transform: translateY(-2px);
}

.cancel-btn {
  background: #e2e8f0;
  color: #2d3748;
}

.cancel-btn:hover {
  background: #cbd5e0;
}

/* 日期选择器样式 */
.date-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.date-picker-container {
  background: white;
  border-radius: 20px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 25px rgba(0, 0, 0, 0.1);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

.date-picker-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.header-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.close-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: white;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.date-picker-body {
  padding: 32px;
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 2px;
}

.quick-dates {
  margin-bottom: 32px;
}

.quick-date-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.quick-date-btn {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.quick-date-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.quick-date-btn:hover::before {
  left: 100%;
}

.quick-date-btn:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.quick-date-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.quick-date-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.quick-date-text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex: 1;
}

.quick-date-label {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.quick-date-value {
  font-size: 14px;
  opacity: 0.8;
}

.custom-date {
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
}

.date-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.modern-date-input {
  width: 100%;
  padding: 16px 20px;
  padding-right: 50px;
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 500;
  background: #f8fafc;
  transition: all 0.3s ease;
  color: #374151;
}

.modern-date-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.date-input-icon {
  position: absolute;
  right: 16px;
  font-size: 20px;
  color: #9ca3af;
  pointer-events: none;
}

.date-picker-footer {
  background: #f9fafb;
  padding: 24px 32px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid #e5e7eb;
}

.action-btn {
  padding: 12px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 24px;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
  color: #374151;
}

.action-btn.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 清单名称输入 */
.list-name-input {
  width: 100%;
  padding: 15px 20px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.list-name-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* 日期任务弹窗样式 */
.date-tasks-modal {
  max-width: 600px;
}

.no-tasks {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.no-tasks p {
  margin: 0;
  font-size: 16px;
}

.date-tasks-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.date-task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.date-task-item:hover {
  border-color: #cbd5e0;
  background: #edf2f7;
}

.date-task-item.completed {
  opacity: 0.7;
  background: #f0fff4;
  border-color: #9ae6b4;
}

.date-task-item .task-content {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.date-task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-task-item .task-info {
  flex: 1;
}

.date-task-item .task-text {
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 5px;
  font-weight: 500;
}

.date-task-item .task-list-name {
  font-size: 12px;
  color: #718096;
  background: #e2e8f0;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.goto-list-btn {
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.goto-list-btn:hover {
  background: #5a6fd8;
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .todo-main {
    grid-template-columns: 250px 1fr;
  }
}

@media (max-width: 768px) {
  .todo-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }
  
  .sidebar {
    order: 2;
  }
  
  .main-content {
    order: 1;
  }
  
  .lists-container {
    grid-template-columns: 1fr;
  }
  
  .full-calendar .calendar-grid {
    gap: 2px;
  }
  
  .full-calendar .calendar-date {
    min-height: 60px;
    padding: 4px;
  }
  
  .date-number {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .todo-header {
    padding: 15px;
  }
  
  .input-container {
    flex-direction: column;
    gap: 10px;
  }
  
  .todo-input {
    padding: 12px 15px;
  }
  
  .calendar-btn, .home-btn {
    width: 100%;
    border-radius: 12px;
  }
  
  .modal-content {
    margin: 20px;
    width: calc(100% - 40px);
  }
}

/* 标签页样式 - 现代化设计 */
.task-tabs {
  display: flex;
  margin-bottom: 24px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  overflow: hidden;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
}

.task-tabs::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.02), rgba(139, 92, 246, 0.02));
  pointer-events: none;
}

.task-tab-btn {
  flex: 1;
  padding: 16px 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  z-index: 1;
  border-radius: 14px;
  margin: 2px;
}

.task-tab-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  opacity: 0;
}

.task-tab-btn:hover::before {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(139, 92, 246, 0.08));
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  opacity: 1;
}

.task-tab-btn:hover {
  color: #6366f1;
  transform: translateY(-1px);
}

.task-tab-btn.active {
  color: white;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.task-tab-btn.active::before {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 
    0 8px 25px rgba(99, 102, 241, 0.25),
    0 3px 10px rgba(139, 92, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  opacity: 1;
}

.task-tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6));
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.4);
}

.tab-icon {
  font-size: 16px;
  transition: transform 0.3s ease;
}

.task-tab-btn:hover .tab-icon {
  transform: scale(1.1);
}

.tab-text {
  font-weight: 600;
  letter-spacing: 0.025em;
}

.task-tab-count {
  background: rgba(148, 163, 184, 0.15);
  backdrop-filter: blur(10px);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
  border: 1px solid rgba(148, 163, 184, 0.1);
  transition: all 0.3s ease;
}

.task-tab-btn:hover .task-tab-count {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.2);
  color: #6366f1;
  transform: scale(1.05);
}

.task-tab-btn.active .task-tab-count {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .task-tabs {
    margin-bottom: 15px;
    border-radius: 16px;
  }
  
  .task-tab-btn {
    padding: 14px 16px;
    font-size: 14px;
  }
  
  .task-tab-btn::before {
    border-radius: 14px;
  }
  
  .task-tab-count {
    font-size: 11px;
    padding: 3px 8px;
    min-width: 20px;
  }
}

@media (max-width: 480px) {
  .task-tabs {
    border-radius: 14px;
  }
  
  .task-tab-btn {
    padding: 12px 14px;
    font-size: 13px;
    gap: 8px;
  }
  
  .task-tab-btn::before {
    border-radius: 12px;
  }
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #a0aec0;
}
</style>