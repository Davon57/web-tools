/**
 * TODO看板系统 - IndexedDB数据存储层
 * 提供任务和分类的完整CRUD操作，支持数据备份和恢复
 */

class TodoDatabase {
  constructor() {
    this.dbName = 'TodoKanbanDB'
    this.version = 1
    this.db = null
  }

  /**
   * 初始化数据库
   * @returns {Promise<IDBDatabase>}
   */
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => {
        console.error('数据库打开失败:', request.error)
        reject(new Error('数据库初始化失败'))
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('数据库初始化成功')
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result
        console.log('数据库升级中...')

        // 创建任务表
        if (!db.objectStoreNames.contains('tasks')) {
          const taskStore = db.createObjectStore('tasks', { 
            keyPath: 'id', 
            autoIncrement: false 
          })
          
          // 创建索引
          taskStore.createIndex('status', 'status', { unique: false })
          taskStore.createIndex('priority', 'priority', { unique: false })
          taskStore.createIndex('categoryId', 'categoryId', { unique: false })
          taskStore.createIndex('createdAt', 'createdAt', { unique: false })
          taskStore.createIndex('updatedAt', 'updatedAt', { unique: false })
          taskStore.createIndex('dueDate', 'dueDate', { unique: false })
          
          console.log('任务表创建成功')
        }

        // 创建分类表
        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { 
            keyPath: 'id', 
            autoIncrement: false 
          })
          
          // 创建索引
          categoryStore.createIndex('name', 'name', { unique: true })
          categoryStore.createIndex('createdAt', 'createdAt', { unique: false })
          
          console.log('分类表创建成功')
        }

        // 创建设置表
        if (!db.objectStoreNames.contains('settings')) {
          const settingsStore = db.createObjectStore('settings', { 
            keyPath: 'key' 
          })
          
          console.log('设置表创建成功')
        }
      }
    })
  }

  /**
   * 生成唯一ID
   * @returns {string}
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  /**
   * 获取当前时间戳
   * @returns {string}
   */
  getCurrentTimestamp() {
    return new Date().toISOString()
  }

  // ==================== 任务相关操作 ====================

  /**
   * 创建新任务
   * @param {Object} taskData - 任务数据
   * @returns {Promise<Object>}
   */
  async createTask(taskData) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    const task = {
      id: this.generateId(),
      title: taskData.title,
      description: taskData.description || '',
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium',
      categoryId: taskData.categoryId || null,
      dueDate: taskData.dueDate || null,
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readwrite')
      const store = transaction.objectStore('tasks')
      const request = store.add(task)

      request.onsuccess = () => {
        console.log('任务创建成功:', task.id)
        resolve(task)
      }

      request.onerror = () => {
        console.error('任务创建失败:', request.error)
        reject(new Error('任务创建失败'))
      }
    })
  }

  /**
   * 获取所有任务
   * @returns {Promise<Array>}
   */
  async getAllTasks() {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readonly')
      const store = transaction.objectStore('tasks')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('获取任务列表失败:', request.error)
        reject(new Error('获取任务列表失败'))
      }
    })
  }

  /**
   * 根据ID获取任务
   * @param {string} taskId - 任务ID
   * @returns {Promise<Object|null>}
   */
  async getTaskById(taskId) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readonly')
      const store = transaction.objectStore('tasks')
      const request = store.get(taskId)

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      request.onerror = () => {
        console.error('获取任务失败:', request.error)
        reject(new Error('获取任务失败'))
      }
    })
  }

  /**
   * 根据状态获取任务
   * @param {string} status - 任务状态
   * @returns {Promise<Array>}
   */
  async getTasksByStatus(status) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readonly')
      const store = transaction.objectStore('tasks')
      const index = store.index('status')
      const request = index.getAll(status)

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('根据状态获取任务失败:', request.error)
        reject(new Error('根据状态获取任务失败'))
      }
    })
  }

  /**
   * 根据分类获取任务
   * @param {string} categoryId - 分类ID
   * @returns {Promise<Array>}
   */
  async getTasksByCategory(categoryId) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readonly')
      const store = transaction.objectStore('tasks')
      const index = store.index('categoryId')
      const request = index.getAll(categoryId)

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('根据分类获取任务失败:', request.error)
        reject(new Error('根据分类获取任务失败'))
      }
    })
  }

  /**
   * 更新任务
   * @param {string} taskId - 任务ID
   * @param {Object} updates - 更新数据
   * @returns {Promise<Object>}
   */
  async updateTask(taskId, updates) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    // 先获取现有任务
    const existingTask = await this.getTaskById(taskId)
    if (!existingTask) {
      throw new Error('任务不存在')
    }

    // 合并更新数据
    const updatedTask = {
      ...existingTask,
      ...updates,
      id: taskId, // 确保ID不被覆盖
      updatedAt: this.getCurrentTimestamp()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readwrite')
      const store = transaction.objectStore('tasks')
      const request = store.put(updatedTask)

      request.onsuccess = () => {
        console.log('任务更新成功:', taskId)
        resolve(updatedTask)
      }

      request.onerror = () => {
        console.error('任务更新失败:', request.error)
        reject(new Error('任务更新失败'))
      }
    })
  }

  /**
   * 删除任务
   * @param {string} taskId - 任务ID
   * @returns {Promise<boolean>}
   */
  async deleteTask(taskId) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks'], 'readwrite')
      const store = transaction.objectStore('tasks')
      const request = store.delete(taskId)

      request.onsuccess = () => {
        console.log('任务删除成功:', taskId)
        resolve(true)
      }

      request.onerror = () => {
        console.error('任务删除失败:', request.error)
        reject(new Error('任务删除失败'))
      }
    })
  }

  // ==================== 分类相关操作 ====================

  /**
   * 创建新分类
   * @param {Object} categoryData - 分类数据
   * @returns {Promise<Object>}
   */
  async createCategory(categoryData) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    const category = {
      id: this.generateId(),
      name: categoryData.name,
      color: categoryData.color || '#4f46e5',
      description: categoryData.description || '',
      createdAt: this.getCurrentTimestamp(),
      updatedAt: this.getCurrentTimestamp()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite')
      const store = transaction.objectStore('categories')
      const request = store.add(category)

      request.onsuccess = () => {
        console.log('分类创建成功:', category.id)
        resolve(category)
      }

      request.onerror = () => {
        console.error('分类创建失败:', request.error)
        if (request.error.name === 'ConstraintError') {
          reject(new Error('分类名称已存在'))
        } else {
          reject(new Error('分类创建失败'))
        }
      }
    })
  }

  /**
   * 获取所有分类
   * @returns {Promise<Array>}
   */
  async getAllCategories() {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readonly')
      const store = transaction.objectStore('categories')
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('获取分类列表失败:', request.error)
        reject(new Error('获取分类列表失败'))
      }
    })
  }

  /**
   * 根据ID获取分类
   * @param {string} categoryId - 分类ID
   * @returns {Promise<Object|null>}
   */
  async getCategoryById(categoryId) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readonly')
      const store = transaction.objectStore('categories')
      const request = store.get(categoryId)

      request.onsuccess = () => {
        resolve(request.result || null)
      }

      request.onerror = () => {
        console.error('获取分类失败:', request.error)
        reject(new Error('获取分类失败'))
      }
    })
  }

  /**
   * 更新分类
   * @param {string} categoryId - 分类ID
   * @param {Object} updates - 更新数据
   * @returns {Promise<Object>}
   */
  async updateCategory(categoryId, updates) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    // 先获取现有分类
    const existingCategory = await this.getCategoryById(categoryId)
    if (!existingCategory) {
      throw new Error('分类不存在')
    }

    // 合并更新数据
    const updatedCategory = {
      ...existingCategory,
      ...updates,
      id: categoryId, // 确保ID不被覆盖
      updatedAt: this.getCurrentTimestamp()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories'], 'readwrite')
      const store = transaction.objectStore('categories')
      const request = store.put(updatedCategory)

      request.onsuccess = () => {
        console.log('分类更新成功:', categoryId)
        resolve(updatedCategory)
      }

      request.onerror = () => {
        console.error('分类更新失败:', request.error)
        if (request.error.name === 'ConstraintError') {
          reject(new Error('分类名称已存在'))
        } else {
          reject(new Error('分类更新失败'))
        }
      }
    })
  }

  /**
   * 删除分类
   * @param {string} categoryId - 分类ID
   * @returns {Promise<boolean>}
   */
  async deleteCategory(categoryId) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['categories', 'tasks'], 'readwrite')
      const categoryStore = transaction.objectStore('categories')
      const taskStore = transaction.objectStore('tasks')

      // 先删除分类
      const deleteCategoryRequest = categoryStore.delete(categoryId)

      deleteCategoryRequest.onsuccess = () => {
        // 然后更新所有使用该分类的任务，将其分类设为null
        const taskIndex = taskStore.index('categoryId')
        const getTasksRequest = taskIndex.getAll(categoryId)

        getTasksRequest.onsuccess = () => {
          const tasks = getTasksRequest.result
          let updateCount = 0

          if (tasks.length === 0) {
            console.log('分类删除成功:', categoryId)
            resolve(true)
            return
          }

          tasks.forEach(task => {
            const updatedTask = { ...task, categoryId: null, updatedAt: this.getCurrentTimestamp() }
            const updateRequest = taskStore.put(updatedTask)

            updateRequest.onsuccess = () => {
              updateCount++
              if (updateCount === tasks.length) {
                console.log('分类删除成功，已更新相关任务:', categoryId)
                resolve(true)
              }
            }

            updateRequest.onerror = () => {
              console.error('更新任务分类失败:', updateRequest.error)
              reject(new Error('删除分类时更新任务失败'))
            }
          })
        }

        getTasksRequest.onerror = () => {
          console.error('获取分类相关任务失败:', getTasksRequest.error)
          reject(new Error('删除分类时获取相关任务失败'))
        }
      }

      deleteCategoryRequest.onerror = () => {
        console.error('分类删除失败:', deleteCategoryRequest.error)
        reject(new Error('分类删除失败'))
      }
    })
  }

  // ==================== 数据管理操作 ====================

  /**
   * 导出所有数据
   * @returns {Promise<Object>}
   */
  async exportAllData() {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    try {
      const [tasks, categories] = await Promise.all([
        this.getAllTasks(),
        this.getAllCategories()
      ])

      return {
        version: this.version,
        exportDate: this.getCurrentTimestamp(),
        data: {
          tasks,
          categories
        }
      }
    } catch (error) {
      console.error('导出数据失败:', error)
      throw new Error('导出数据失败')
    }
  }

  /**
   * 导入数据
   * @param {Object} importData - 导入的数据
   * @returns {Promise<Object>}
   */
  async importData(importData) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    // 验证数据格式
    if (!importData.data || !importData.data.tasks || !importData.data.categories) {
      throw new Error('数据格式不正确')
    }

    const { tasks, categories } = importData.data
    const results = {
      tasksImported: 0,
      categoriesImported: 0,
      errors: []
    }

    try {
      // 导入分类
      for (const category of categories) {
        try {
          // 检查分类是否已存在
          const existing = await this.getCategoryById(category.id)
          if (existing) {
            // 更新现有分类
            await this.updateCategory(category.id, {
              name: category.name,
              color: category.color,
              description: category.description
            })
          } else {
            // 创建新分类
            await this.createCategory({
              ...category,
              id: category.id // 保持原有ID
            })
          }
          results.categoriesImported++
        } catch (error) {
          results.errors.push(`分类导入失败 ${category.name}: ${error.message}`)
        }
      }

      // 导入任务
      for (const task of tasks) {
        try {
          // 检查任务是否已存在
          const existing = await this.getTaskById(task.id)
          if (existing) {
            // 更新现有任务
            await this.updateTask(task.id, {
              title: task.title,
              description: task.description,
              status: task.status,
              priority: task.priority,
              categoryId: task.categoryId,
              dueDate: task.dueDate
            })
          } else {
            // 创建新任务
            await this.createTask({
              ...task,
              id: task.id // 保持原有ID
            })
          }
          results.tasksImported++
        } catch (error) {
          results.errors.push(`任务导入失败 ${task.title}: ${error.message}`)
        }
      }

      return results
    } catch (error) {
      console.error('导入数据失败:', error)
      throw new Error('导入数据失败')
    }
  }

  /**
   * 清空所有数据
   * @returns {Promise<boolean>}
   */
  async clearAllData() {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['tasks', 'categories', 'settings'], 'readwrite')
      
      const taskStore = transaction.objectStore('tasks')
      const categoryStore = transaction.objectStore('categories')
      const settingsStore = transaction.objectStore('settings')

      let completedOperations = 0
      const totalOperations = 3

      const checkCompletion = () => {
        completedOperations++
        if (completedOperations === totalOperations) {
          console.log('所有数据清空成功')
          resolve(true)
        }
      }

      // 清空任务
      const clearTasksRequest = taskStore.clear()
      clearTasksRequest.onsuccess = checkCompletion
      clearTasksRequest.onerror = () => {
        console.error('清空任务失败:', clearTasksRequest.error)
        reject(new Error('清空任务失败'))
      }

      // 清空分类
      const clearCategoriesRequest = categoryStore.clear()
      clearCategoriesRequest.onsuccess = checkCompletion
      clearCategoriesRequest.onerror = () => {
        console.error('清空分类失败:', clearCategoriesRequest.error)
        reject(new Error('清空分类失败'))
      }

      // 清空设置
      const clearSettingsRequest = settingsStore.clear()
      clearSettingsRequest.onsuccess = checkCompletion
      clearSettingsRequest.onerror = () => {
        console.error('清空设置失败:', clearSettingsRequest.error)
        reject(new Error('清空设置失败'))
      }
    })
  }

  // ==================== 设置相关操作 ====================

  /**
   * 保存设置
   * @param {string} key - 设置键
   * @param {any} value - 设置值
   * @returns {Promise<boolean>}
   */
  async saveSetting(key, value) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    const setting = {
      key,
      value,
      updatedAt: this.getCurrentTimestamp()
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readwrite')
      const store = transaction.objectStore('settings')
      const request = store.put(setting)

      request.onsuccess = () => {
        resolve(true)
      }

      request.onerror = () => {
        console.error('保存设置失败:', request.error)
        reject(new Error('保存设置失败'))
      }
    })
  }

  /**
   * 获取设置
   * @param {string} key - 设置键
   * @param {any} defaultValue - 默认值
   * @returns {Promise<any>}
   */
  async getSetting(key, defaultValue = null) {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['settings'], 'readonly')
      const store = transaction.objectStore('settings')
      const request = store.get(key)

      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.value : defaultValue)
      }

      request.onerror = () => {
        console.error('获取设置失败:', request.error)
        reject(new Error('获取设置失败'))
      }
    })
  }

  // ==================== 统计相关操作 ====================

  /**
   * 获取任务统计信息
   * @returns {Promise<Object>}
   */
  async getTaskStatistics() {
    if (!this.db) {
      throw new Error('数据库未初始化')
    }

    try {
      const tasks = await this.getAllTasks()
      const categories = await this.getAllCategories()

      const stats = {
        total: tasks.length,
        byStatus: {
          todo: 0,
          'in-progress': 0,
          completed: 0
        },
        byPriority: {
          high: 0,
          medium: 0,
          low: 0
        },
        byCategory: {},
        overdue: 0,
        completedToday: 0,
        completedThisWeek: 0,
        completedThisMonth: 0
      }

      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000))
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      // 初始化分类统计
      categories.forEach(category => {
        stats.byCategory[category.id] = {
          name: category.name,
          count: 0
        }
      })
      stats.byCategory['uncategorized'] = {
        name: '无分类',
        count: 0
      }

      // 统计任务
      tasks.forEach(task => {
        // 按状态统计
        stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1

        // 按优先级统计
        stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1

        // 按分类统计
        const categoryKey = task.categoryId || 'uncategorized'
        if (stats.byCategory[categoryKey]) {
          stats.byCategory[categoryKey].count++
        }

        // 逾期任务统计
        if (task.dueDate && task.status !== 'completed') {
          const dueDate = new Date(task.dueDate)
          if (dueDate < now) {
            stats.overdue++
          }
        }

        // 完成任务时间统计
        if (task.status === 'completed' && task.updatedAt) {
          const completedDate = new Date(task.updatedAt)
          
          if (completedDate >= today) {
            stats.completedToday++
          }
          
          if (completedDate >= weekStart) {
            stats.completedThisWeek++
          }
          
          if (completedDate >= monthStart) {
            stats.completedThisMonth++
          }
        }
      })

      return stats
    } catch (error) {
      console.error('获取统计信息失败:', error)
      throw new Error('获取统计信息失败')
    }
  }

  /**
   * 关闭数据库连接
   */
  close() {
    if (this.db) {
      this.db.close()
      this.db = null
      console.log('数据库连接已关闭')
    }
  }
}

// 创建单例实例
const todoDatabase = new TodoDatabase()

// 导出数据库实例的方法
export const initDB = () => todoDatabase.init()
export const addTask = (taskData) => todoDatabase.createTask(taskData)
export const getTasks = () => todoDatabase.getAllTasks()
export const updateTask = (taskId, updates) => todoDatabase.updateTask(taskId, updates)
export const deleteTask = (taskId) => todoDatabase.deleteTask(taskId)
export const addCategory = (categoryData) => todoDatabase.createCategory(categoryData)
export const getCategories = () => todoDatabase.getAllCategories()
export const updateCategory = (categoryId, updates) => todoDatabase.updateCategory(categoryId, updates)
export const deleteCategory = (categoryId) => todoDatabase.deleteCategory(categoryId)
export const clearAllData = () => todoDatabase.clearAllData()
export const exportData = () => todoDatabase.exportAllData()
export const importData = (data) => todoDatabase.importData(data)

export default todoDatabase