import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useToolsStore = defineStore('tools', () => {
  // 工具使用历史
  const toolHistory = ref([])
  
  // 收藏的工具
  const favoriteTools = ref([])
  
  // 添加工具使用记录
  function addToolHistory(toolName) {
    const record = {
      name: toolName,
      timestamp: new Date().toISOString()
    }
    toolHistory.value.unshift(record)
    // 只保留最近50条记录
    if (toolHistory.value.length > 50) {
      toolHistory.value = toolHistory.value.slice(0, 50)
    }
  }
  
  // 切换收藏工具
  function toggleFavorite(toolName) {
    const index = favoriteTools.value.indexOf(toolName)
    if (index > -1) {
      favoriteTools.value.splice(index, 1)
    } else {
      favoriteTools.value.push(toolName)
    }
  }
  
  // 检查是否为收藏工具
  function isFavorite(toolName) {
    return favoriteTools.value.includes(toolName)
  }

  return { 
    toolHistory, 
    favoriteTools, 
    addToolHistory, 
    toggleFavorite, 
    isFavorite 
  }
}, {
  persist: true // 启用持久化
})
