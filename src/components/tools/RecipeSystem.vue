<template>
  <div class="recipe-system">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <button @click="goHome" class="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m12 19-7-7 7-7"/>
            <path d="M19 12H5"/>
          </svg>
          返回
        </button>
        <h1 class="page-title">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          智能菜谱系统
        </h1>
      </div>
      <div class="toolbar-right">
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索菜谱..."
            class="search-input"
            clearable
            :prefix-icon="Search"
            style="width: 300px;"
          />
        </div>
        <div class="recipe-count">
          共 {{ filteredRecipes.length }} 道菜谱
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧分类导航 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <h3>菜谱分类</h3>
        </div>
        <div class="category-list">
          <button 
            @click="selectCategory('')"
            :class="['category-item', { active: selectedCategory === '' }]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            <span>全部分类</span>
            <span class="count">{{ recipes.length }}</span>
          </button>
          <button 
            v-for="category in categories"
            :key="category"
            @click="selectCategory(category)"
            :class="['category-item', { active: selectedCategory === category }]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span>{{ category }}</span>
            <span class="count">{{ getCategoryCount(category) }}</span>
          </button>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">

        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>正在加载菜谱数据...</p>
        </div>

        <!-- 菜谱展示区域 -->
        <div v-else class="recipes-container">
      <div v-if="filteredRecipes.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
        <h3>未找到相关菜谱</h3>
        <p>尝试调整搜索关键词或选择其他分类</p>
      </div>
      
      <div v-else class="recipes-grid">
        <div 
          v-for="recipe in filteredRecipes"
          :key="recipe.id"
          @click="selectRecipe(recipe)"
          class="recipe-card"
        >
          <div class="recipe-image">
            <img 
              :src="getImageUrl(recipe.image)" 
              :alt="recipe.name"
              @error="handleImageError"
              loading="lazy"
            />
            <div class="recipe-category">{{ recipe.category }}</div>
          </div>
          <div class="recipe-content">
            <h3 class="recipe-name">{{ recipe.name }}</h3>
            <div class="recipe-meta">
              <span class="ingredient-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                  <line x1="16" y1="8" x2="2" y2="22"/>
                  <line x1="17.5" y1="15" x2="9" y2="15"/>
                </svg>
                {{ recipe.ingredients.length }} 种配料
              </span>
              <span class="step-count">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                {{ recipe.steps.length }} 个步骤
              </span>
            </div>
            <div class="recipe-ingredients">
              <span 
                v-for="(ingredient, index) in recipe.ingredients.slice(0, 3)"
                :key="index"
                class="ingredient-tag"
              >
                {{ ingredient }}
              </span>
              <span v-if="recipe.ingredients.length > 3" class="more-ingredients">
                +{{ recipe.ingredients.length - 3 }}
              </span>
            </div>
        </div>
      </div>
        </div>
      </div>
    </div>

    <!-- 菜谱详情弹窗 -->
    <div v-if="selectedRecipe" class="recipe-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-image" @click="showImagePreview = true">
            <img 
              :src="getImageUrl(selectedRecipe.image)" 
              :alt="selectedRecipe.name"
              @error="handleImageError"
            />
            <div class="image-overlay">
              <Search :size="24" />
              <span>点击查看大图</span>
            </div>
          </div>
          <div class="modal-info">
            <h2>{{ selectedRecipe.name }}</h2>
            <div class="recipe-tags">
              <span class="category-tag">{{ selectedRecipe.category }}</span>
              <span class="meta-tag">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                  <line x1="16" y1="8" x2="2" y2="22"/>
                  <line x1="17.5" y1="15" x2="9" y2="15"/>
                </svg>
                {{ selectedRecipe.ingredients.length }} 种配料
              </span>
              <span class="meta-tag">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                {{ selectedRecipe.steps.length }} 个步骤
              </span>
            </div>
          </div>
          <button @click="closeModal" class="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
            <div class="detail-section">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/>
                  <line x1="16" y1="8" x2="2" y2="22"/>
                  <line x1="17.5" y1="15" x2="9" y2="15"/>
                </svg>
                配料清单
              </h3>
              <ul class="ingredients-list">
                <li v-for="(ingredient, index) in selectedRecipe.ingredients" :key="index">
                  {{ ingredient }}
                </li>
              </ul>
            </div>
            
            <div class="detail-section">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
                </svg>
                制作步骤
              </h3>
              <ol class="steps-list">
                <li v-for="(step, index) in selectedRecipe.steps" :key="index">
                  {{ step }}
                </li>
              </ol>
            </div>
            
            <div v-if="selectedRecipe.varieties && selectedRecipe.varieties.length > 0" class="detail-section">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
                品类说明
              </h3>
              <ul class="varieties-list">
                <li v-for="(variety, index) in selectedRecipe.varieties" :key="index">
                  {{ variety }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- 图片预览弹窗 -->
  <div v-if="showImagePreview" class="image-preview-modal" @click="showImagePreview = false">
    <div class="image-preview-content" @click.stop>
      <button class="preview-close-button" @click="showImagePreview = false">
        <X :size="24" />
      </button>
      <img 
        :src="getImageUrl(selectedRecipe?.image)" 
        :alt="selectedRecipe?.name"
        class="preview-image"
        @error="handleImageError"
      />
      <div class="image-info">
        <h3>{{ selectedRecipe?.name }}</h3>
        <p>{{ selectedRecipe?.category }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { 
  ArrowLeft, 
  X, 
  ChefHat, 
  Users, 
  Clock,
  Grid3x3,
  Utensils,
  Flame,
  Droplet,
  Snowflake,
  Cloud,
  Zap,
  Leaf,
  Sunrise,
  Coffee,
  Circle,
  CookingPot,
  Thermometer,
  Package
} from 'lucide-vue-next'

const router = useRouter()

// 响应式数据
const recipes = ref([])
const loading = ref(true)
const searchQuery = ref('')
const selectedCategory = ref('')
const selectedRecipe = ref(null)
const showImagePreview = ref(false)

// 导航方法
const goHome = () => {
  router.push('/')
}

// 菜谱数据解析
const parseRecipeContent = (content, filename, category) => {
  const lines = content.split('\n').filter(line => line.trim())
  
  const recipe = {
    id: filename.replace('.md', ''),
    name: '',
    category: category,
    image: '',
    ingredients: [],
    steps: [],
    varieties: []
  }
  
  let currentSection = ''
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // 解析标题
    if (trimmedLine.startsWith('# ')) {
      recipe.name = trimmedLine.substring(2).trim()
    }
    // 解析图片
    else if (trimmedLine.startsWith('![')) {
      const imageMatch = trimmedLine.match(/!\[.*?\]\((.*?)\)/)
      if (imageMatch) {
        // 处理相对路径，转换为正确的静态资源路径
        let imagePath = imageMatch[1]
        if (imagePath.startsWith('../images/')) {
          imagePath = imagePath.replace('../images/', '')
        }
        recipe.image = `/src/food/images/${imagePath}`
      }
    }
    // 解析章节标题
    else if (trimmedLine.startsWith('## ')) {
      currentSection = trimmedLine.substring(3).trim()
    }
    // 解析列表项
    else if (trimmedLine.startsWith('- ')) {
      const content = trimmedLine.substring(2).trim()
      
      if (currentSection === '配料') {
        recipe.ingredients.push(content)
      } else if (currentSection === '步骤') {
        recipe.steps.push(content)
      } else if (currentSection === '品类') {
        recipe.varieties.push(content)
      }
    }
  }
  
  return recipe
}

// 加载菜谱数据
const loadRecipes = async () => {
  try {
    loading.value = true
    
    // 定义菜谱分类
    const categoryFolders = [
      '主食', '炒菜', '蒸菜', '早餐', '凉拌', '卤菜', 
      '汤', '炖菜', '炸品', '烤类', '烫菜', '煮锅', '砂锅菜', '饮品'
    ]
    
    const allRecipes = []
    
    for (const category of categoryFolders) {
      try {
        // 动态导入每个分类文件夹中的所有 .md 文件
        const modules = import.meta.glob('/src/food/**/*.md', { as: 'raw' })
        
        for (const path in modules) {
          if (path.includes(`/food/${category}/`) && path.endsWith('.md') && !path.includes('README.md')) {
            try {
              const content = await modules[path]()
              const filename = path.split('/').pop()
              const recipe = parseRecipeContent(content, filename, category)
              
              if (recipe.name && recipe.ingredients.length > 0) {
                allRecipes.push(recipe)
              }
            } catch (error) {
              console.warn(`Failed to load recipe: ${path}`, error)
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to load category: ${category}`, error)
      }
    }
    
    recipes.value = allRecipes
    ElMessage.success(`成功加载 ${allRecipes.length} 道菜谱`)
    
  } catch (error) {
    console.error('Failed to load recipes:', error)
    ElMessage.error('加载菜谱数据失败')
  } finally {
    loading.value = false
  }
}

// 计算属性
const categories = computed(() => {
  const cats = [...new Set(recipes.value.map(recipe => recipe.category))]
  return cats.sort()
})

const totalRecipes = computed(() => recipes.value.length)

const filteredRecipes = computed(() => {
  let filtered = recipes.value
  
  // 分类筛选
  if (selectedCategory.value) {
    filtered = filtered.filter(recipe => recipe.category === selectedCategory.value)
  }
  
  // 搜索筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(recipe => {
      return recipe.name.toLowerCase().includes(query) ||
             recipe.ingredients.some(ingredient => ingredient.toLowerCase().includes(query)) ||
             recipe.steps.some(step => step.toLowerCase().includes(query))
    })
  }
  
  return filtered
})

// 方法
// 获取分类菜谱数量
const getCategoryCount = (category) => {
  if (category === '全部') {
    return recipes.value.length
  }
  return recipes.value.filter(recipe => recipe.category === category).length
}

const handleSearch = () => {
  // 搜索时无需重置页码，因为已移除分页功能
}

const clearSearch = () => {
  searchQuery.value = ''
}

const selectRecipe = (recipe) => {
  selectedRecipe.value = recipe
}

const closeModal = () => {
  selectedRecipe.value = null
  showImagePreview.value = false
}

const getImageUrl = (imagePath) => {
  if (!imagePath) return getDefaultImage()
  
  // 如果是完整的URL，直接返回
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // 处理相对路径，转换为正确的静态资源路径
  let cleanPath = imagePath
  
  // 如果路径包含 ../images/，提取文件名
  if (cleanPath.includes('../images/')) {
    cleanPath = cleanPath.replace('../images/', '')
  }
  
  // 如果路径包含 /src/food/images/，提取文件名
  if (cleanPath.includes('/src/food/images/')) {
    cleanPath = cleanPath.replace('/src/food/images/', '')
  }
  
  // 使用动态导入来获取正确的图片路径
  try {
    // 使用 import.meta.url 和 new URL 来正确解析图片路径
    const imageUrl = new URL(`../../food/images/${cleanPath}`, import.meta.url).href
    return imageUrl
  } catch (error) {
    console.warn('图片路径解析失败:', imagePath, error)
    return getDefaultImage()
  }
}

const getDefaultImage = () => {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMzUgOTVIMTY1VjEwNUgxMzVWOTVaIiBmaWxsPSIjNkI3MjgwIi8+PC9zdmc+'
}

// 分类点击处理
const selectCategory = (category) => {
  selectedCategory.value = category
}

// 获取分类图标组件
const getCategoryIcon = (category) => {
  const iconMap = {
    '全部': Grid3x3,
    '主食': Utensils,
    '炒菜': Flame,
    '汤': Droplet,
    '凉拌': Snowflake,
    '蒸菜': Cloud,
    '炖菜': CookingPot,
    '烤类': Flame,
    '炸品': Zap,
    '卤菜': Leaf,
    '早餐': Sunrise,
    '饮品': Coffee,
    '砂锅菜': Circle,
    '煮锅': CookingPot,
    '烫菜': Thermometer,
    '配料': Package
  }
  return iconMap[category] || Utensils
}

const handleImageError = (event) => {
  event.target.src = getDefaultImage()
}

// 生命周期
onMounted(() => {
  loadRecipes()
})
</script>

<style scoped>
.recipe-system {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: #5855eb;
  transform: translateY(-1px);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-container {
  position: relative;
}

.search-input {
  border-radius: 12px !important;
}

.search-input .el-input__wrapper {
  border-radius: 12px !important;
  transition: all 0.3s ease !important;
}

.search-input .el-input__wrapper:hover {
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15) !important;
}

.search-input .el-input__wrapper.is-focus {
  border-color: #6366f1 !important;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
}

.recipe-count {
  padding: 0.5rem 1rem;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
}

/* 主要内容区域 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 左侧边栏 */
.sidebar {
  width: 280px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem;
  overflow-y: auto;
  flex-shrink: 0;
}

.sidebar-header {
  margin-bottom: 1.5rem;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-size: 0.9rem;
  color: #4b5563;
}

.category-item:hover {
  background: rgba(99, 102, 241, 0.05);
  border-color: #6366f1;
  transform: translateX(2px);
}

.category-item.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

.category-item svg {
  flex-shrink: 0;
}

.category-item span:first-of-type {
  flex: 1;
}

.category-item .count {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.category-item.active .count {
  background: rgba(255, 255, 255, 0.2);
}

/* 右侧内容区域 */
.content-area {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  height: 100%;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.recipes-container {
  padding: 1.5rem;
  overflow-y: auto;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: white;
  text-align: center;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-state h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.empty-state p {
  margin: 0;
  opacity: 0.8;
  font-size: 1rem;
}

/* 菜谱网格 */
.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.recipe-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.recipe-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.recipe-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.recipe-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.recipe-card:hover .recipe-image img {
  transform: scale(1.05);
}

.recipe-category {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  background: rgba(99, 102, 241, 0.9);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.recipe-content {
  padding: 1.25rem;
}

.recipe-name {
  margin: 0 0 0.75rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
}

.recipe-meta {
  display: flex;
  gap: 1rem;
  color: #6b7280;
  font-size: 0.85rem;
}

.ingredient-count,
.step-count {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.recipe-ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ingredient-tag {
  background: #f0f0f0;
  color: #666;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

.more-ingredients {
  background: #e0e0e0;
  color: #999;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
}

/* 菜谱详情弹窗 */
.recipe-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 900px;
  max-height: 90vh;
  width: 100%;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  position: relative;
}

.modal-image {
  width: 200px;
  height: 150px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.modal-image:hover {
  transform: scale(1.02);
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  color: white;
  font-size: 0.8rem;
  gap: 0.5rem;
}

.modal-image:hover .image-overlay {
  opacity: 1;
}

.modal-info {
  flex: 1;
}

.modal-info h2 {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 700;
}

.recipe-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.category-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.meta-tag {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 2rem;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #1f2937;
}

.ingredients-list,
.varieties-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.5rem;
}

.ingredients-list li,
.varieties-list li {
  background: #f8fafc;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border-left: 3px solid #6366f1;
  font-size: 0.9rem;
}

.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: step-counter;
}

.steps-list li {
  counter-increment: step-counter;
  background: #f8fafc;
  padding: 1rem;
  margin-bottom: 0.75rem;
  border-radius: 10px;
  border-left: 4px solid #6366f1;
  position: relative;
  font-size: 0.95rem;
  line-height: 1.6;
}

.steps-list li::before {
  content: counter(step-counter);
  position: absolute;
  left: -2px;
  top: -2px;
  background: #6366f1;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

/* 图片预览弹窗 */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.image-preview-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.preview-close-button {
  position: absolute;
  top: -3rem;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 0.75rem;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1;
}

.preview-close-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.preview-image {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.image-info {
  text-align: center;
  color: white;
}

.image-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.image-info p {
  margin: 0;
  font-size: 1rem;
  opacity: 0.8;
}

/* 滚动条样式优化 */
.sidebar::-webkit-scrollbar,
.content-area::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-track,
.content-area::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.sidebar::-webkit-scrollbar-thumb,
.content-area::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.3);
  border-radius: 4px;
  transition: background 0.3s ease;
}

.sidebar::-webkit-scrollbar-thumb:hover,
.content-area::-webkit-scrollbar-thumb:hover {
  background: rgba(99, 102, 241, 0.5);
}

/* 平滑滚动 */
.sidebar,
.content-area {
  scroll-behavior: smooth;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    padding: 1rem;
  }
  
  .category-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.5rem;
  }
  
  .search-input {
    width: 250px;
  }
}

@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
  
  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-input {
    width: 200px;
  }
  
  .recipes-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }
  
  .modal-header {
    flex-direction: column;
    text-align: center;
  }
  
  .modal-image {
    width: 100%;
    height: 200px;
  }
  
  .recipe-tags {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .recipe-system {
    font-size: 14px;
  }
  
  .content-area {
    padding: 1rem;
  }
  
  .recipes-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 1rem;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 1.5rem;
  }
  
  .modal-body {
    padding: 1.5rem;
  }
}
</style>