<template>
  <div class="tech-news" :class="{ 'compact-mode': compact }">
    <div class="news-header">
      <h2 class="news-title">💻 科技新闻</h2>
      <div class="news-controls">
        <div class="search-box">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="搜索新闻..."
            class="search-input"
            @input="handleSearch"
          >
          <button class="search-btn" @click="handleSearch">
            🔍
          </button>
        </div>
        <div class="filter-controls">
          <select v-model="selectedCategory" @change="handleCategoryChange" class="category-select">
            <option value="">全部分类</option>
            <option value="ai">人工智能</option>
            <option value="mobile">移动设备</option>
            <option value="web">Web开发</option>
            <option value="blockchain">区块链</option>
            <option value="startup">创业公司</option>
          </select>
          <button @click="refreshNews" class="refresh-btn" :disabled="loading">
            {{ loading ? '⏳' : '🔄' }} 刷新
          </button>
        </div>
      </div>
    </div>

    <div class="news-stats">
      <div class="stat-item">
        <span class="stat-label">总新闻数:</span>
        <span class="stat-value">{{ filteredNews.length }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">最后更新:</span>
        <span class="stat-value">{{ lastUpdated }}</span>
      </div>
    </div>

    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载最新科技新闻...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-icon">❌</div>
      <h3>加载失败</h3>
      <p>{{ error }}</p>
      <button @click="refreshNews" class="retry-btn">重试</button>
    </div>

    <div v-else-if="filteredNews.length === 0" class="empty-container">
      <div class="empty-icon">📰</div>
      <h3>暂无新闻</h3>
      <p>{{ searchQuery ? '没有找到相关新闻' : '暂时没有新闻数据' }}</p>
    </div>

    <div v-else class="news-list">
      <div 
        v-for="article in paginatedNews" 
        :key="article.id"
        class="news-item"
        @click="openArticle(article)"
      >
        <div class="news-image" v-if="article.image">
          <img :src="article.image" :alt="article.title" @error="handleImageError">
        </div>
        <div class="news-content">
          <div class="news-meta">
            <span class="news-category" :class="`category-${article.category}`">
              {{ getCategoryName(article.category) }}
            </span>
            <span class="news-date">{{ formatDate(article.publishedAt) }}</span>
          </div>
          <h3 class="news-headline">{{ article.title }}</h3>
          <p class="news-summary">{{ article.description }}</p>
          <div class="news-footer">
            <span class="news-source">{{ article.source }}</span>
            <div class="news-actions">
              <button @click.stop="toggleBookmark(article)" class="bookmark-btn">
                {{ article.bookmarked ? '⭐' : '☆' }}
              </button>
              <button @click.stop="shareArticle(article)" class="share-btn">
                📤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filteredNews.length > itemsPerPage" class="pagination">
      <button 
        @click="currentPage--" 
        :disabled="currentPage === 1"
        class="page-btn"
      >
        ← 上一页
      </button>
      <span class="page-info">
        第 {{ currentPage }} 页，共 {{ totalPages }} 页
      </span>
      <button 
        @click="currentPage++" 
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        下一页 →
      </button>
    </div>

    <!-- 文章详情弹窗 -->
    <div v-if="selectedArticle" class="article-modal" @click="closeArticle">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedArticle.title }}</h2>
          <button @click="closeArticle" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="article-meta">
            <span class="article-source">{{ selectedArticle.source }}</span>
            <span class="article-date">{{ formatDate(selectedArticle.publishedAt) }}</span>
          </div>
          <img v-if="selectedArticle.image" :src="selectedArticle.image" :alt="selectedArticle.title" class="article-image">
          <div class="article-content">
            <p>{{ selectedArticle.content || selectedArticle.description }}</p>
          </div>
          <div class="article-actions">
            <a :href="selectedArticle.url" target="_blank" class="read-more-btn">
              阅读原文 🔗
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { newsAPI } from '@/api'

// 定义属性
const props = defineProps({
  compact: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const news = ref([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const selectedCategory = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(props.compact ? 6 : 10)
const selectedArticle = ref(null)
const lastUpdated = ref('')

// 模拟新闻数据
const mockNews = [
  {
    id: 1,
    title: 'OpenAI发布GPT-4 Turbo，性能大幅提升',
    description: 'OpenAI宣布推出GPT-4 Turbo模型，在保持高质量输出的同时，显著提升了处理速度和成本效率。',
    content: 'OpenAI今日正式发布了GPT-4 Turbo模型，这是GPT-4系列的最新版本。新模型在多个方面都有显著改进，包括更快的响应速度、更低的使用成本，以及更强的上下文理解能力。据官方测试数据显示，GPT-4 Turbo的处理速度比前一版本提升了约40%，同时成本降低了近30%。',
    category: 'ai',
    source: 'TechCrunch',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    url: 'https://example.com/news/1',
    image: 'https://via.placeholder.com/300x200?text=AI+News',
    bookmarked: false
  },
  {
    id: 2,
    title: '苹果iPhone 15系列销量创新高',
    description: '苹果公司公布iPhone 15系列在全球市场的销售数据，首月销量超过预期，Pro系列尤其受欢迎。',
    content: '苹果公司今日公布了iPhone 15系列的最新销售数据。数据显示，iPhone 15系列在发布首月的全球销量达到了4500万台，比去年同期增长15%。其中，iPhone 15 Pro和Pro Max型号占据了总销量的60%以上。',
    category: 'mobile',
    source: 'Apple Insider',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    url: 'https://example.com/news/2',
    image: 'https://via.placeholder.com/300x200?text=iPhone+15',
    bookmarked: false
  },
  {
    id: 3,
    title: 'React 19正式发布，带来革命性更新',
    description: 'React团队发布了React 19版本，引入了全新的并发特性和性能优化，为开发者带来更好的开发体验。',
    content: 'React 19正式发布，这个版本带来了许多令人兴奋的新特性。包括改进的并发渲染、新的Hooks API、更好的TypeScript支持，以及显著的性能提升。开发团队表示，这些更新将使React应用更加高效和易于维护。',
    category: 'web',
    source: 'React Blog',
    publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    url: 'https://example.com/news/3',
    image: 'https://via.placeholder.com/300x200?text=React+19',
    bookmarked: false
  },
  {
    id: 4,
    title: '比特币突破65000美元大关',
    description: '比特币价格再次突破65000美元，创下今年新高，市场分析师认为这轮上涨主要由机构投资推动。',
    content: '比特币价格在今日早间突破了65000美元大关，创下了2024年的新高。这轮上涨主要得益于机构投资者的大量买入，以及对比特币ETF获批的乐观预期。分析师预测，如果当前趋势持续，比特币有望在年底前挑战历史最高价。',
    category: 'blockchain',
    source: 'CoinDesk',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    url: 'https://example.com/news/4',
    image: 'https://via.placeholder.com/300x200?text=Bitcoin',
    bookmarked: false
  },
  {
    id: 5,
    title: '字节跳动推出全新AI视频生成工具',
    description: '字节跳动发布了基于AI的视频生成工具，用户只需输入文本描述即可生成高质量视频内容。',
    content: '字节跳动今日发布了一款革命性的AI视频生成工具。该工具基于先进的深度学习算法，能够根据用户输入的文本描述自动生成高质量的视频内容。初期测试显示，生成的视频质量已经达到了专业水准。',
    category: 'ai',
    source: '36氪',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    url: 'https://example.com/news/5',
    image: 'https://via.placeholder.com/300x200?text=AI+Video',
    bookmarked: false
  },
  {
    id: 6,
    title: '特斯拉发布新款Model Y，续航里程大幅提升',
    description: '特斯拉发布了2024款Model Y，新车型在续航里程、充电速度和自动驾驶功能方面都有显著改进。',
    content: '特斯拉正式发布了2024款Model Y电动SUV。新车型搭载了最新的4680电池技术，续航里程提升至600公里，比前一代增加了20%。同时，新车还配备了更先进的自动驾驶系统和更快的超级充电技术。',
    category: 'startup',
    source: 'Electrek',
    publishedAt: new Date(Date.now() - 16 * 60 * 60 * 1000),
    url: 'https://example.com/news/6',
    image: 'https://via.placeholder.com/300x200?text=Tesla+Model+Y',
    bookmarked: false
  }
]

// 计算属性
const filteredNews = computed(() => {
  let filtered = news.value
  
  // 分类筛选
  if (selectedCategory.value) {
    filtered = filtered.filter(article => article.category === selectedCategory.value)
  }
  
  // 搜索筛选
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(article => 
      article.title.toLowerCase().includes(query) ||
      article.description.toLowerCase().includes(query) ||
      article.source.toLowerCase().includes(query)
    )
  }
  
  return filtered.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
})

const totalPages = computed(() => {
  return Math.ceil(filteredNews.value.length / itemsPerPage.value)
})

const paginatedNews = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredNews.value.slice(start, end)
})

// 方法
const loadNews = async () => {
  loading.value = true
  error.value = ''
  
  try {
    // 使用真实的聚合数据新闻API
    const result = await newsAPI.getTechNews({
      page: currentPage.value,
      page_size: itemsPerPage.value
    })
    
    if (result.success) {
      // 转换API数据格式以适配组件
      news.value = result.data.map((article, index) => ({
        id: index + 1,
        title: article.title,
        description: article.title, // API没有单独的描述字段，使用标题
        content: article.title,
        category: 'keji', // 科技新闻
        source: article.author_name || '聚合数据',
        publishedAt: new Date(article.date),
        url: article.url,
        image: article.thumbnail_pic_s || article.thumbnail_pic_s02 || article.thumbnail_pic_s03,
        bookmarked: false
      }))
      
      lastUpdated.value = new Date().toLocaleString()
    } else {
      throw new Error(result.message || '获取新闻失败')
    }
  } catch (err) {
    error.value = err.message || '加载新闻失败，请稍后重试'
    console.error('Error loading news:', err)
    
    // 如果API失败，使用模拟数据作为备选
    news.value = mockNews.map(article => ({
      ...article,
      publishedAt: new Date(article.publishedAt)
    }))
    lastUpdated.value = new Date().toLocaleString()
  } finally {
    loading.value = false
  }
}

const refreshNews = () => {
  currentPage.value = 1
  loadNews()
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleCategoryChange = () => {
  currentPage.value = 1
}

const openArticle = (article) => {
  selectedArticle.value = article
}

const closeArticle = () => {
  selectedArticle.value = null
}

const toggleBookmark = (article) => {
  article.bookmarked = !article.bookmarked
}

const shareArticle = (article) => {
  if (navigator.share) {
    navigator.share({
      title: article.title,
      text: article.description,
      url: article.url
    })
  } else {
    // 复制到剪贴板
    navigator.clipboard.writeText(`${article.title} - ${article.url}`)
    alert('链接已复制到剪贴板')
  }
}

const getCategoryName = (category) => {
  const categoryMap = {
    ai: '人工智能',
    mobile: '移动设备',
    web: 'Web开发',
    blockchain: '区块链',
    startup: '创业公司'
  }
  return categoryMap[category] || '其他'
}

const formatDate = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return date.toLocaleDateString()
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

// 监听器
watch([selectedCategory, searchQuery], () => {
  currentPage.value = 1
})

// 生命周期
onMounted(() => {
  loadNews()
})
</script>

<style scoped>
.tech-news {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.news-header {
  margin-bottom: 30px;
}

.news-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.news-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  flex: 1;
  max-width: 400px;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e1e8ed;
  border-radius: 25px 0 0 25px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s;
}

.search-input:focus {
  border-color: #3498db;
}

.search-btn {
  padding: 12px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 0 25px 25px 0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.search-btn:hover {
  background: #2980b9;
}

.filter-controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

.category-select {
  padding: 10px 15px;
  border: 2px solid #e1e8ed;
  border-radius: 20px;
  background: white;
  font-size: 14px;
  outline: none;
  cursor: pointer;
}

.refresh-btn {
  padding: 10px 20px;
  background: #27ae60;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.refresh-btn:hover:not(:disabled) {
  background: #219a52;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.news-stats {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-weight: 500;
  color: #666;
}

.stat-value {
  font-weight: bold;
  color: #2c3e50;
}

.loading-container,
.error-container,
.empty-container {
  text-align: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon,
.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.retry-btn {
  padding: 12px 24px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

.news-list {
  display: grid;
  gap: 25px;
  margin-bottom: 30px;
}

.news-item {
  display: flex;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.news-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.news-image {
  width: 200px;
  height: 150px;
  flex-shrink: 0;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.news-category {
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
}

.category-ai { background: #e3f2fd; color: #1976d2; }
.category-mobile { background: #f3e5f5; color: #7b1fa2; }
.category-web { background: #e8f5e8; color: #388e3c; }
.category-blockchain { background: #fff3e0; color: #f57c00; }
.category-startup { background: #fce4ec; color: #c2185b; }

.news-date {
  font-size: 12px;
  color: #666;
}

.news-headline {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
  line-height: 1.4;
}

.news-summary {
  color: #666;
  line-height: 1.6;
  margin-bottom: 15px;
  flex: 1;
}

.news-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.news-source {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.news-actions {
  display: flex;
  gap: 10px;
}

.bookmark-btn,
.share-btn {
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  transition: background-color 0.3s;
}

.bookmark-btn:hover,
.share-btn:hover {
  background: #f0f0f0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}

.page-btn {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #2980b9;
}

.page-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.page-info {
  font-weight: 500;
  color: #666;
}

.article-modal {
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 15px;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 5px;
}

.modal-body {
  padding: 20px;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.article-image {
  width: 100%;
  max-height: 300px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 20px;
}

.article-content {
  line-height: 1.8;
  color: #333;
  margin-bottom: 30px;
}

.article-actions {
  text-align: center;
}

.read-more-btn {
  display: inline-block;
  padding: 12px 30px;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 25px;
  font-weight: 500;
  transition: background-color 0.3s;
}

.read-more-btn:hover {
  background: #2980b9;
}

/* 紧凑模式样式 */
.tech-news.compact-mode {
  border-radius: 0;
  box-shadow: none;
}

.tech-news.compact-mode .news-header {
  padding: 20px 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.tech-news.compact-mode .news-title {
  font-size: 20px;
}

.tech-news.compact-mode .news-controls {
  margin-top: 15px;
}

.tech-news.compact-mode .search-box {
  max-width: 300px;
}

.tech-news.compact-mode .news-list {
  gap: 15px;
  padding: 20px 25px;
}

.tech-news.compact-mode .news-item {
  padding: 15px;
  border-radius: 10px;
}

.tech-news.compact-mode .news-headline {
  font-size: 16px;
  line-height: 1.4;
}

.tech-news.compact-mode .news-summary {
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tech-news.compact-mode .news-image {
  width: 80px;
  height: 60px;
}

.tech-news.compact-mode .pagination {
  padding: 15px 25px;
  justify-content: center;
}

@media (max-width: 768px) {
  .tech-news {
    padding: 15px;
  }
  
  .news-title {
    font-size: 2rem;
  }
  
  .news-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    max-width: none;
  }
  
  .filter-controls {
    justify-content: center;
  }
  
  .news-item {
    flex-direction: column;
  }
  
  .news-image {
    width: 100%;
    height: 200px;
  }
  
  .news-stats {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .pagination {
    flex-direction: column;
    gap: 10px;
  }
  
  .modal-content {
    margin: 10px;
    max-height: calc(100vh - 20px);
  }
  
  .tech-news.compact-mode .news-image {
    width: 100%;
    height: 150px;
  }
}
</style>