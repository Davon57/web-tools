<template>
  <div class="note-taker">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button @click="goHome" class="home-btn" title="返回主页">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          返回主页
        </button>
        <div class="tool-title">
          <h1>📝 笔记工具</h1>
          <p>记录你的想法和灵感</p>
        </div>
      </div>
      <div class="toolbar-right">
        <button @click="createNewNote" class="create-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          新建笔记
        </button>
        <button @click="showExportModal = true" class="export-btn" title="导出笔记">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="main-content">
      <!-- 左侧边栏 -->
      <div class="sidebar">
        <!-- 搜索框 -->
        <div class="search-section">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="搜索笔记..."
              class="search-input"
            />
            <button v-if="searchQuery" @click="clearSearch" class="clear-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- 分类筛选 -->
        <div class="categories-section">
          <div class="section-header">
            <h3>📁 分类</h3>
            <button @click="showCategoryModal = true" class="add-category-btn" title="添加分类">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
          <div class="categories-list">
            <button 
              v-for="category in categories" 
              :key="category.id"
              @click="selectedCategory = selectedCategory === category.id ? null : category.id"
              class="category-item"
              :class="{ active: selectedCategory === category.id }"
            >
              <span class="category-color" :style="{ backgroundColor: category.color }"></span>
              <span class="category-name">{{ category.name }}</span>
              <span class="category-count">({{ getCategoryNotesCount(category.id) }})</span>
            </button>
          </div>
        </div>

        <!-- 笔记列表 -->
        <div class="notes-section">
          <div class="section-header">
            <h3>📄 笔记列表</h3>
            <span class="notes-count">{{ displayedNotes.length }} 条</span>
          </div>
          <div class="notes-list">
            <div 
              v-for="note in displayedNotes" 
              :key="note.id"
              @click="selectNote(note)"
              class="note-item"
              :class="{ active: currentNote && currentNote.id === note.id }"
            >
              <div class="note-header">
                <h4 class="note-title">{{ note.title }}</h4>
                <div class="note-actions">
                  <button 
                    @click.stop="togglePin(note.id)" 
                    class="pin-btn"
                    :class="{ pinned: note.isPinned }"
                    :title="note.isPinned ? '取消置顶' : '置顶'"
                  >
                    📌
                  </button>
                  <button 
                    @click.stop="deleteNote(note.id)" 
                    class="delete-btn"
                    title="删除笔记"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p class="note-preview">{{ getPreviewText(note.content) }}</p>
              <div class="note-meta">
                <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
                <div class="note-tags">
                  <span 
                    v-for="tag in note.tags.slice(0, 2)" 
                    :key="tag"
                    class="tag"
                  >
                    #{{ tag }}
                  </span>
                  <span v-if="note.tags.length > 2" class="more-tags">
                    +{{ note.tags.length - 2 }}
                  </span>
                </div>
              </div>
            </div>
            <div v-if="displayedNotes.length === 0" class="empty-state">
              <div class="empty-icon">📝</div>
              <p>{{ searchQuery ? '没有找到匹配的笔记' : '还没有笔记，点击新建开始记录吧！' }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧编辑器 -->
      <div class="editor-area">
        <div v-if="!currentNote" class="no-note-selected">
          <div class="welcome-content">
            <div class="welcome-icon">✨</div>
            <h2>欢迎使用笔记工具</h2>
            <p>选择一个笔记开始编辑，或者创建一个新笔记</p>
            <button @click="createNewNote" class="welcome-create-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              创建第一个笔记
            </button>
          </div>
        </div>
        
        <div v-else class="editor-container">
          <!-- 笔记头部 -->
          <div class="note-editor-header">
            <input 
              v-model="currentNote.title"
              @input="saveCurrentNote"
              @blur="saveCurrentNoteImmediately"
              class="note-title-input"
              placeholder="笔记标题..."
            />
            <div class="note-editor-actions">
              <select 
                v-model="currentNote.categoryId"
                @change="saveCurrentNoteImmediately"
                class="category-select"
              >
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
              <button @click="showTagsModal = true" class="tags-btn" title="管理标签">
                🏷️ 标签 ({{ currentNote.tags.length }})
              </button>
            </div>
          </div>
          
          <!-- 笔记内容编辑器 -->
          <div class="note-content-editor">
            <textarea 
              v-model="currentNote.content"
              @input="saveCurrentNote"
              @blur="saveCurrentNoteImmediately"
              class="content-textarea"
              placeholder="开始记录你的想法..."
            ></textarea>
          </div>
          
          <!-- 笔记底部信息 -->
          <div class="note-editor-footer">
            <div class="note-info">
              <span>创建于: {{ formatDate(currentNote.createdAt) }}</span>
              <span>更新于: {{ formatDate(currentNote.updatedAt) }}</span>
              <span>字数: {{ currentNote.content.length }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签管理弹窗 -->
    <div v-if="showTagsModal" class="modal-overlay" @click="showTagsModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>🏷️ 管理标签</h3>
          <button @click="showTagsModal = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="add-tag-section">
            <input 
              v-model="newTag"
              @keyup.enter="addNewTag"
              type="text"
              placeholder="输入新标签..."
              class="tag-input"
            />
            <button @click="addNewTag" class="add-tag-btn">添加</button>
          </div>
          <div class="current-tags">
            <div class="tags-list">
              <span 
                v-for="tag in currentNote.tags" 
                :key="tag"
                class="tag-item"
              >
                #{{ tag }}
                <button @click="removeTag(tag)" class="remove-tag-btn">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分类管理弹窗 -->
    <div v-if="showCategoryModal" class="modal-overlay" @click="showCategoryModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>📁 管理分类</h3>
          <button @click="showCategoryModal = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="add-category-section">
            <input 
              v-model="newCategoryName"
              type="text"
              placeholder="分类名称..."
              class="category-input"
            />
            <input 
              v-model="newCategoryColor"
              type="color"
              class="color-input"
            />
            <button @click="addNewCategory" class="add-category-btn">添加分类</button>
          </div>
          <div class="categories-management">
            <div 
              v-for="category in categories.filter(c => c.id !== 'default')" 
              :key="category.id"
              class="category-management-item"
            >
              <span class="category-color" :style="{ backgroundColor: category.color }"></span>
              <span class="category-name">{{ category.name }}</span>
              <button @click="deleteCategoryConfirm(category.id)" class="delete-category-btn">
                删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 导出弹窗 -->
    <div v-if="showExportModal" class="modal-overlay" @click="showExportModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>📤 导出笔记</h3>
          <button @click="showExportModal = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="export-options">
            <button @click="exportAsJSON" class="export-option-btn">
              <div class="export-icon">📄</div>
              <div class="export-info">
                <h4>导出为 JSON</h4>
                <p>包含所有笔记数据和分类信息</p>
              </div>
            </button>
            <button @click="exportAsMarkdown" class="export-option-btn">
              <div class="export-icon">📝</div>
              <div class="export-info">
                <h4>导出为 Markdown</h4>
                <p>将所有笔记合并为一个 Markdown 文件</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useNoteStore } from '@/stores/noteStore'
import { useToolsStore } from '@/stores/counter'

const router = useRouter()
const noteStore = useNoteStore()
const toolsStore = useToolsStore()

// 响应式数据
const selectedCategory = ref(null)
const showTagsModal = ref(false)
const showCategoryModal = ref(false)
const showExportModal = ref(false)
const newTag = ref('')
const newCategoryName = ref('')
const newCategoryColor = ref('#3B82F6')

// 从 store 获取数据
const { 
  notes, 
  currentNote, 
  searchQuery, 
  categories,
  filteredNotes,
  notesCount,
  createNote,
  updateNote,
  deleteNote: deleteNoteFromStore,
  togglePin: togglePinFromStore,
  addTag,
  removeTag: removeTagFromStore,
  createCategory,
  deleteCategory,
  setCurrentNote,
  clearCurrentNote,
  searchNotes,
  clearSearch: clearSearchFromStore,
  exportNotes
} = noteStore

// 计算属性
const displayedNotes = computed(() => {
  let result = filteredNotes.value
  
  // 安全检查：确保 result 是数组
  if (!Array.isArray(result)) {
    return []
  }
  
  if (selectedCategory.value) {
    result = result.filter(note => note.categoryId === selectedCategory.value)
  }
  
  // 不需要再次排序，因为store中已经处理了排序
  return result
})

// 方法
const goHome = () => {
  router.push('/')
}

const createNewNote = () => {
  const categoryId = selectedCategory.value || 'default'
  createNote('新笔记', categoryId)
  toolsStore.addToolHistory('笔记工具')
}

const selectNote = (note) => {
  setCurrentNote(note)
}

// 防抖保存定时器（使用ref确保响应式）
const saveTimeout = ref(null)

// 防抖保存函数
const saveCurrentNote = () => {
  if (currentNote.value) {
    // 清除之前的定时器
    if (saveTimeout.value) {
      clearTimeout(saveTimeout.value)
    }
    
    // 设置新的定时器，1秒后保存
    saveTimeout.value = setTimeout(() => {
      updateNote(currentNote.value.id, {
        title: currentNote.value.title,
        content: currentNote.value.content,
        categoryId: currentNote.value.categoryId
      })
      saveTimeout.value = null
    }, 1000)
  }
}

// 立即保存函数（用于失焦等场景）
const saveCurrentNoteImmediately = () => {
  if (currentNote.value) {
    // 清除防抖定时器
    if (saveTimeout.value) {
      clearTimeout(saveTimeout.value)
      saveTimeout.value = null
    }
    
    // 立即保存
    updateNote(currentNote.value.id, {
      title: currentNote.value.title,
      content: currentNote.value.content,
      categoryId: currentNote.value.categoryId
    })
  }
}

const deleteNote = (noteId) => {
  if (confirm('确定要删除这个笔记吗？')) {
    deleteNoteFromStore(noteId)
  }
}

const togglePin = (noteId) => {
  togglePinFromStore(noteId)
}

const addNewTag = () => {
  if (newTag.value.trim() && currentNote.value) {
    addTag(currentNote.value.id, newTag.value.trim())
    newTag.value = ''
  }
}

const removeTag = (tag) => {
  if (currentNote.value) {
    removeTagFromStore(currentNote.value.id, tag)
  }
}

const addNewCategory = () => {
  if (newCategoryName.value.trim()) {
    createCategory(newCategoryName.value.trim(), newCategoryColor.value)
    newCategoryName.value = ''
    newCategoryColor.value = '#3B82F6'
  }
}

const deleteCategoryConfirm = (categoryId) => {
  if (confirm('确定要删除这个分类吗？该分类下的笔记将移动到默认分类。')) {
    deleteCategory(categoryId)
  }
}

const clearSearch = () => {
  clearSearchFromStore()
}

const getCategoryNotesCount = (categoryId) => {
  if (!notes.value || !Array.isArray(notes.value)) {
    return 0
  }
  return notes.value.filter(note => note.categoryId === categoryId).length
}

const getPreviewText = (content) => {
  return content.length > 100 ? content.substring(0, 100) + '...' : content || '暂无内容'
}

// 响应式当前时间
const currentTime = ref(new Date())

// 每秒更新当前时间
setInterval(() => {
  currentTime.value = new Date()
}, 1000)

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = currentTime.value // 使用响应式的当前时间
  const diff = now - date
  
  if (diff < 60000) { // 1分钟内
    return '刚刚'
  } else if (diff < 3600000) { // 1小时内
    return `${Math.floor(diff / 60000)}分钟前`
  } else if (diff < 86400000) { // 1天内
    return `${Math.floor(diff / 3600000)}小时前`
  } else if (diff < 604800000) { // 1周内
    return `${Math.floor(diff / 86400000)}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

const exportAsJSON = () => {
  const data = exportNotes()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `notes-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  showExportModal.value = false
}

const exportAsMarkdown = () => {
  let markdown = '# 我的笔记\n\n'
  
  categories.value.forEach(category => {
    const categoryNotes = notes.value.filter(note => note.categoryId === category.id)
    if (categoryNotes.length > 0) {
      markdown += `## ${category.name}\n\n`
      categoryNotes.forEach(note => {
        markdown += `### ${note.title}\n\n`
        markdown += `${note.content}\n\n`
        if (note.tags.length > 0) {
          markdown += `标签: ${note.tags.map(tag => `#${tag}`).join(' ')}\n\n`
        }
        markdown += `---\n\n`
      })
    }
  })
  
  const blob = new Blob([markdown], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `notes-${new Date().toISOString().split('T')[0]}.md`
  a.click()
  URL.revokeObjectURL(url)
  showExportModal.value = false
}

// 监听搜索查询变化
watch(() => noteStore.searchQuery, (newQuery) => {
  searchNotes(newQuery)
})

// 组件挂载时添加工具使用记录
onMounted(() => {
  toolsStore.addToolHistory('笔记工具')
})

// 组件卸载时清理定时器
onUnmounted(() => {
  if (saveTimeout.value) {
    clearTimeout(saveTimeout.value)
    saveTimeout.value = null
  }
})
</script>

<style scoped>
.note-taker {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.home-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.tool-title h1 {
  margin: 0;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
}

.tool-title p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.toolbar-right {
  display: flex;
  gap: 0.5rem;
}

.create-btn, .export-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-btn:hover, .export-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.main-content {
  display: flex;
  height: calc(100vh - 80px);
}

.sidebar {
  width: 350px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-section {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 12px;
  color: #6b7280;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-search {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.clear-search:hover {
  background: #f3f4f6;
}

.categories-section, .notes-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.section-header h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
}

.notes-count {
  font-size: 0.8rem;
  color: #6b7280;
}

.add-category-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.add-category-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.categories-list {
  padding: 0 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem;
  background: none;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  margin-bottom: 0.25rem;
}

.category-item:hover {
  background: #f3f4f6;
}

.category-item.active {
  background: #eff6ff;
  color: #1d4ed8;
}

.category-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.category-name {
  flex: 1;
  font-size: 0.85rem;
}

.category-count {
  font-size: 0.75rem;
  color: #6b7280;
}

.notes-list {
  flex: 1;
  overflow-y: auto;
  padding: 0 1rem 1rem;
}

.note-item {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.note-item:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.note-item.active {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.note-title {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
  flex: 1;
  line-height: 1.3;
}

.note-actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.note-item:hover .note-actions {
  opacity: 1;
}

.pin-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.pin-btn:hover {
  background: #fef3c7;
}

.pin-btn.pinned {
  opacity: 1;
}

.delete-btn:hover {
  background: #fee2e2;
}

.note-preview {
  margin: 0 0 0.5rem 0;
  font-size: 0.8rem;
  color: #6b7280;
  line-height: 1.4;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #9ca3af;
}

.note-tags {
  display: flex;
  gap: 0.25rem;
}

.tag {
  background: #eff6ff;
  color: #1d4ed8;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.7rem;
}

.more-tags {
  color: #6b7280;
  font-size: 0.7rem;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.editor-area {
  flex: 1;
  background: white;
  display: flex;
  flex-direction: column;
}

.no-note-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-content {
  text-align: center;
  max-width: 400px;
}

.welcome-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.welcome-content h2 {
  margin: 0 0 0.5rem 0;
  color: #111827;
  font-size: 1.5rem;
}

.welcome-content p {
  margin: 0 0 1.5rem 0;
  color: #6b7280;
}

.welcome-create-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.welcome-create-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.note-editor-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.note-title-input {
  flex: 1;
  font-size: 1.25rem;
  font-weight: 600;
  border: none;
  outline: none;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.note-title-input:focus {
  background: #f9fafb;
}

.note-editor-actions {
  display: flex;
  gap: 0.5rem;
}

.category-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
}

.tags-btn {
  padding: 0.5rem 1rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.tags-btn:hover {
  background: #e5e7eb;
}

.note-content-editor {
  flex: 1;
  padding: 1.5rem;
}

.content-textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  font-size: 1rem;
  line-height: 1.6;
  font-family: inherit;
}

.note-editor-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.note-info {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6b7280;
}

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
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 1.5rem;
  max-height: 60vh;
  overflow-y: auto;
}

.add-tag-section, .add-category-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.tag-input, .category-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.9rem;
}

.color-input {
  width: 50px;
  height: 38px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
}

.add-tag-btn, .add-category-btn {
  padding: 0.5rem 1rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.add-tag-btn:hover, .add-category-btn:hover {
  background: #2563eb;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: #eff6ff;
  color: #1d4ed8;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  font-size: 0.8rem;
}

.remove-tag-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #1d4ed8;
  padding: 0;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.remove-tag-btn:hover {
  background: rgba(29, 78, 216, 0.1);
}

.categories-management {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-management-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.delete-category-btn {
  margin-left: auto;
  padding: 0.25rem 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.delete-category-btn:hover {
  background: #dc2626;
}

.export-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.export-option-btn {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.export-option-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.export-icon {
  font-size: 1.5rem;
}

.export-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.export-info p {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: 40vh;
  }
  
  .toolbar {
    padding: 0.75rem 1rem;
  }
  
  .toolbar-left {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .tool-title h1 {
    font-size: 1.25rem;
  }
}
</style>