import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import todoDatabase from '@/utils/todoDatabase.js'

export const useTodoStore = defineStore('todo', () => {
  // 数据库实例
  const db = todoDatabase
  
  // 响应式数据
  const todoLists = ref([])
  const isLoading = ref(false)
  const error = ref(null)
  
  // 计算属性
  const totalTasks = computed(() => {
    return todoLists.value.reduce((total, list) => total + list.tasks.length, 0)
  })
  
  const completedTasks = computed(() => {
    return todoLists.value.reduce((total, list) => {
      return total + list.tasks.filter(task => task.completed).length
    }, 0)
  })
  
  // 初始化数据库并加载数据
  const initializeStore = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      // 初始化数据库
      await db.init()
      
      // 加载所有分类（清单）
      const categories = await db.getAllCategories()
      
      // 如果没有分类，创建默认分类
      if (categories.length === 0) {
        const defaultCategory = {
          id: Date.now(),
          name: '我的待办',
          color: '#667eea',
          description: '默认待办清单',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        await db.createCategory(defaultCategory)
        categories.push(defaultCategory)
      }
      
      // 加载所有任务
      const tasks = await db.getAllTasks()
      
      // 直接使用IndexedDB数据结构，减少数据转换
      todoLists.value = categories.map(category => ({
        id: category.id,
        name: category.name,
        color: category.color || '#667eea',
        tasks: tasks.filter(task => task.categoryId === category.id)
      }))
      
    } catch (err) {
      console.error('初始化待办事项存储失败:', err)
      error.value = err.message
      
      // 如果数据库初始化失败，使用默认数据
      todoLists.value = [{
        id: 1,
        name: '我的待办',
        color: '#667eea',
        tasks: []
      }]
    } finally {
      isLoading.value = false
    }
  }
  
  // 添加新清单
  const addList = async (name) => {
    try {
      const newCategory = {
        id: Date.now(),
        name: name.trim(),
        color: '#667eea',
        description: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await db.createCategory(newCategory)
      
      todoLists.value.push({
        id: newCategory.id,
        name: newCategory.name,
        color: newCategory.color,
        tasks: []
      })
      
      return newCategory.id
    } catch (err) {
      console.error('添加清单失败:', err)
      error.value = err.message
      throw err
    }
  }
  
  // 更新清单
  const updateList = async (listId, name) => {
    try {
      const list = todoLists.value.find(l => l.id === listId)
      if (!list) throw new Error('清单不存在')
      
      const updatedCategory = {
        id: listId,
        name: name.trim(),
        color: list.color,
        description: '',
        updatedAt: new Date().toISOString()
      }
      
      await db.updateCategory(listId, updatedCategory)
      
      list.name = name.trim()
    } catch (err) {
      console.error('更新清单失败:', err)
      error.value = err.message
      throw err
    }
  }
  
  // 删除清单
  const deleteList = async (listId) => {
    try {
      // 删除清单下的所有任务
      const list = todoLists.value.find(l => l.id === listId)
      if (list) {
        for (const task of list.tasks) {
          await db.deleteTask(task.id)
        }
      }
      
      // 删除清单
      await db.deleteCategory(listId)
      
      const index = todoLists.value.findIndex(l => l.id === listId)
      if (index > -1) {
        todoLists.value.splice(index, 1)
      }
    } catch (err) {
      console.error('删除清单失败:', err)
      error.value = err.message
      throw err
    }
  }
  
  // 添加任务
  const addTask = async (listId, text, date = null) => {
    try {
      const list = todoLists.value.find(l => l.id === listId)
      if (!list) throw new Error('清单不存在')
      
      const taskDate = date || new Date().toISOString().split('T')[0]
      const newTask = {
        id: Date.now(),
        title: text.trim(),
        description: '',
        status: 'pending',
        priority: 'medium',
        categoryId: listId,
        dueDate: taskDate + 'T23:59:59.999Z',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      await db.createTask(newTask)
      
      // 直接使用IndexedDB数据结构，无需转换
      list.tasks.push(newTask)
      return newTask
    } catch (err) {
      console.error('添加任务失败:', err)
      error.value = err.message
      throw err
    }
  }
  
  // 更新任务
  const updateTask = async (taskId, updates) => {
    try {
      // 查找任务
      let targetTask = null
      for (const list of todoLists.value) {
        targetTask = list.tasks.find(t => t.id === taskId)
        if (targetTask) break
      }
      
      if (!targetTask) throw new Error('任务不存在')
      
      // 准备数据库更新数据
      const dbUpdates = {
        id: taskId,
        updatedAt: new Date().toISOString()
      }
      
      // 处理各种更新 - 直接使用IndexedDB字段名
      if ('text' in updates) {
        dbUpdates.title = updates.text.trim()
        targetTask.title = updates.text.trim()
      }
      
      if ('completed' in updates) {
        dbUpdates.status = updates.completed ? 'completed' : 'pending'
        targetTask.status = updates.completed ? 'completed' : 'pending'
      }
      
      if ('pinned' in updates) {
        dbUpdates.priority = updates.pinned ? 'high' : 'medium'
        targetTask.priority = updates.pinned ? 'high' : 'medium'
      }
      
      if ('date' in updates) {
        dbUpdates.dueDate = updates.date + 'T23:59:59.999Z'
        targetTask.dueDate = updates.date + 'T23:59:59.999Z'
      }
      
      await db.updateTask(taskId, dbUpdates)
      
    } catch (err) {
      console.error('更新任务失败:', err)
      error.value = err.message
      throw err
    }
  }
  
  // 删除任务
  const deleteTask = async (taskId) => {
    try {
      await db.deleteTask(taskId)
      
      // 从UI数据中移除
      for (const list of todoLists.value) {
        const index = list.tasks.findIndex(t => t.id === taskId)
        if (index > -1) {
          list.tasks.splice(index, 1)
          break
        }
      }
    } catch (err) {
      console.error('删除任务失败:', err)
      error.value = err.message
      throw err
    }
  }
  
  // 切换任务完成状态
  const toggleTask = async (task) => {
    await updateTask(task.id, { completed: task.status !== 'completed' })
  }
  
  // 切换任务置顶状态
  const togglePin = async (task) => {
    await updateTask(task.id, { pinned: task.priority !== 'high' })
  }
  
  // 搜索任务
  const searchTasks = (query) => {
    if (!query.trim()) return []
    
    const results = []
    const searchTerm = query.toLowerCase()
    
    todoLists.value.forEach(list => {
      list.tasks.forEach(task => {
        if (task.title.toLowerCase().includes(searchTerm)) {
          results.push({
            ...task,
            listName: list.name,
            listId: list.id
          })
        }
      })
    })
    
    return results
  }
  
  // 获取指定日期的任务
  const getTasksForDate = (dateString) => {
    const tasks = []
    todoLists.value.forEach(list => {
      list.tasks.forEach(task => {
        const taskDate = task.dueDate ? task.dueDate.split('T')[0] : null
        if (taskDate === dateString) {
          tasks.push({
            ...task,
            listName: list.name,
            listId: list.id
          })
        }
      })
    })
    
    return tasks
  }
  
  // 检查指定日期是否有任务
  const hasTasksOnDate = (dateString) => {
    return todoLists.value.some(list => 
      list.tasks.some(task => {
        const taskDate = task.dueDate ? task.dueDate.split('T')[0] : null
        return taskDate === dateString
      })
    )
  }
  
  return {
    // 状态
    todoLists,
    isLoading,
    error,
    
    // 计算属性
    totalTasks,
    completedTasks,
    
    // 方法
    initializeStore,
    addList,
    updateList,
    deleteList,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    togglePin,
    searchTasks,
    getTasksForDate,
    hasTasksOnDate
  }
})