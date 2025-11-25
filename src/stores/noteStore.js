import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useNoteStore = defineStore('notes', () => {
  // 笔记列表
  const notes = ref([])
  
  // 当前选中的笔记
  const currentNote = ref(null)
  
  // 搜索关键词
  const searchQuery = ref('')
  
  // 笔记分类
  const categories = ref([
    { id: 'default', name: '默认', color: '#3B82F6' },
    { id: 'work', name: '工作', color: '#10B981' },
    { id: 'personal', name: '个人', color: '#F59E0B' },
    { id: 'ideas', name: '想法', color: '#8B5CF6' },
    { id: 'learning', name: '学习', color: '#EF4444' }
  ])
  
  // 过滤后的笔记列表
  const filteredNotes = computed(() => {
    if (!searchQuery.value.trim()) {
      return notes.value
    }
    
    const query = searchQuery.value.toLowerCase()
    return notes.value.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    )
  })
  
  // 按分类分组的笔记
  const notesByCategory = computed(() => {
    const grouped = {}
    categories.value.forEach(category => {
      grouped[category.id] = filteredNotes.value.filter(note => note.categoryId === category.id)
    })
    return grouped
  })
  
  // 笔记统计
  const notesCount = computed(() => notes.value.length)
  const categoriesCount = computed(() => categories.value.length)
  
  // 创建新笔记
  function createNote(title = '新笔记', categoryId = 'default') {
    const newNote = {
      id: Date.now().toString(),
      title: title.trim() || '新笔记',
      content: '',
      categoryId,
      tags: [],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    notes.value.unshift(newNote)
    currentNote.value = newNote
    return newNote
  }
  
  // 更新笔记
  function updateNote(noteId, updates) {
    const noteIndex = notes.value.findIndex(note => note.id === noteId)
    if (noteIndex === -1) return false
    
    const updatedNote = {
      ...notes.value[noteIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    // 使用 splice 来确保 Vue 响应式系统能检测到变化
    notes.value.splice(noteIndex, 1, updatedNote)
    
    // 如果更新的是当前笔记，同步更新
    if (currentNote.value && currentNote.value.id === noteId) {
      // 直接替换currentNote的引用，确保响应式更新
      currentNote.value = { ...updatedNote }
    }
    
    // 重新排序笔记列表，确保最新编辑的笔记排在前面（除了置顶笔记）
    notes.value.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
    
    return true
  }
  
  // 删除笔记
  function deleteNote(noteId) {
    const noteIndex = notes.value.findIndex(note => note.id === noteId)
    if (noteIndex === -1) return false
    
    notes.value.splice(noteIndex, 1)
    
    // 如果删除的是当前笔记，清空当前笔记
    if (currentNote.value && currentNote.value.id === noteId) {
      currentNote.value = null
    }
    
    return true
  }
  
  // 切换笔记置顶状态
  function togglePin(noteId) {
    const note = notes.value.find(note => note.id === noteId)
    if (!note) return false
    
    updateNote(noteId, { isPinned: !note.isPinned })
    
    // 重新排序，置顶笔记在前
    notes.value.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return new Date(b.updatedAt) - new Date(a.updatedAt)
    })
    
    return true
  }
  
  // 添加标签
  function addTag(noteId, tag) {
    const note = notes.value.find(note => note.id === noteId)
    if (!note || !tag.trim()) return false
    
    const trimmedTag = tag.trim()
    if (note.tags.includes(trimmedTag)) return false
    
    const updatedTags = [...note.tags, trimmedTag]
    updateNote(noteId, { tags: updatedTags })
    return true
  }
  
  // 移除标签
  function removeTag(noteId, tag) {
    const note = notes.value.find(note => note.id === noteId)
    if (!note) return false
    
    const updatedTags = note.tags.filter(t => t !== tag)
    updateNote(noteId, { tags: updatedTags })
    return true
  }
  
  // 创建新分类
  function createCategory(name, color = '#3B82F6') {
    const newCategory = {
      id: Date.now().toString(),
      name: name.trim(),
      color
    }
    
    categories.value.push(newCategory)
    return newCategory
  }
  
  // 删除分类
  function deleteCategory(categoryId) {
    if (categoryId === 'default') return false // 不能删除默认分类
    
    const categoryIndex = categories.value.findIndex(cat => cat.id === categoryId)
    if (categoryIndex === -1) return false
    
    // 将该分类下的笔记移动到默认分类
    notes.value.forEach(note => {
      if (note.categoryId === categoryId) {
        updateNote(note.id, { categoryId: 'default' })
      }
    })
    
    categories.value.splice(categoryIndex, 1)
    return true
  }
  
  // 设置当前笔记
  function setCurrentNote(note) {
    currentNote.value = note
  }
  
  // 清空当前笔记
  function clearCurrentNote() {
    currentNote.value = null
  }
  
  // 搜索笔记
  function searchNotes(query) {
    searchQuery.value = query
  }
  
  // 清空搜索
  function clearSearch() {
    searchQuery.value = ''
  }
  
  // 导出笔记数据
  function exportNotes() {
    return {
      notes: notes.value,
      categories: categories.value,
      exportedAt: new Date().toISOString()
    }
  }
  
  // 导入笔记数据
  function importNotes(data) {
    try {
      if (data.notes && Array.isArray(data.notes)) {
        notes.value = data.notes
      }
      if (data.categories && Array.isArray(data.categories)) {
        categories.value = data.categories
      }
      return true
    } catch (error) {
      console.error('导入笔记失败:', error)
      return false
    }
  }
  
  return {
    // 状态
    notes,
    currentNote,
    searchQuery,
    categories,
    
    // 计算属性
    filteredNotes,
    notesByCategory,
    notesCount,
    categoriesCount,
    
    // 方法
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    addTag,
    removeTag,
    createCategory,
    deleteCategory,
    setCurrentNote,
    clearCurrentNote,
    searchNotes,
    clearSearch,
    exportNotes,
    importNotes
  }
}, {
  persist: true // 启用持久化
})