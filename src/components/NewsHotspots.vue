<template>
  <div class="news-hotspots">
    <div class="hotspots-header">
      <h2 class="hotspots-title">🔥 新闻热点</h2>
    </div>

    <!-- 网格布局的新闻分类 -->
    <div class="news-grid">
      <div 
        v-for="category in categories" 
        :key="category.id"
        class="news-category-card"
      >
        <div class="card-header">
          <h3 class="card-title">
            {{ category.icon }} {{ category.name }}
          </h3>
          <div class="sort-controls">
            <button 
              :class="['sort-btn', { active: sortType[category.id] === 'time' }]"
              @click="setSortType(category.id, 'time')"
              title="按时间排序"
            >
              🕒
            </button>
            <button 
              :class="['sort-btn', { active: sortType[category.id] === 'hot' }]"
              @click="setSortType(category.id, 'hot')"
              title="按热度排序"
            >
              🔥
            </button>
          </div>
        </div>

        <!-- 加载状态 -->
        <div v-if="categoryLoading[category.id]" class="loading-container">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="categoryErrors[category.id]" class="error-container">
          <div class="error-icon">❌</div>
          <p>{{ categoryErrors[category.id] }}</p>
          <button @click="refreshCategory(category.id)" class="retry-btn">重试</button>
        </div>

        <!-- 新闻列表 -->
        <div v-else class="news-list">
          <div 
            v-for="(news, index) in getNewsByCategory(category.id)" 
            :key="news.id"
            class="news-item"
            @click="openNews(news)"
          >
            <div class="news-rank">{{ index + 1 }}</div>
            <div class="news-content">
              <h4 class="news-title">{{ news.title }}</h4>
              <div class="news-meta">
                <span class="news-time">{{ formatTime(news.publishedAt) }}</span>
                <span class="news-hot" v-if="news.hotScore">
                  🔥 {{ formatHotScore(news.hotScore) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新闻详情弹窗 -->
    <div v-if="selectedNews" class="news-modal" @click="closeNews">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedNews.title }}</h3>
          <button @click="closeNews" class="close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="news-meta">
            <span class="news-source">{{ selectedNews.source }}</span>
            <span class="news-time">{{ formatTime(selectedNews.publishedAt) }}</span>
          </div>
          <p class="news-content">{{ selectedNews.content || selectedNews.summary }}</p>
          <div class="modal-actions">
            <a :href="selectedNews.url" target="_blank" class="read-more-btn">
              阅读原文 🔗
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { newsAPI } from '@/api'

// 响应式数据
const loading = ref(false)
const categoryLoading = reactive({})
const categoryErrors = reactive({})
const newsData = reactive({})
const selectedNews = ref(null)
const sortType = reactive({}) // 每个分类的排序类型：'time' 或 'hot'

// 新闻分类配置 - 精简版
const categories = [
  { id: 'weibo', name: '推荐', icon: '📰', color: '#ff6b6b' },
  { id: 'baidu', name: '科技', icon: '🔍', color: '#4ecdc4' }
]

// 模拟新闻数据 - 精简版
const mockNewsData = {
  weibo: [
    {
      id: 'wb1',
      title: 'OpenAI发布GPT-4 Turbo，AI能力再次突破',
      summary: 'OpenAI宣布推出GPT-4 Turbo，在性能和成本方面都有显著提升',
      content: 'OpenAI今日正式发布GPT-4 Turbo，这是GPT-4系列的最新版本，在保持高质量输出的同时显著提升处理速度。',
      source: '新浪科技',
      publishedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      url: 'https://tech.sina.com.cn/news/1',
      hotScore: 985432
    },
    {
      id: 'wb2', 
      title: '苹果iPhone 15系列全球热销，Pro版本供不应求',
      summary: '苹果iPhone 15系列发布后销量火爆，Pro和Pro Max版本尤其受欢迎',
      source: '新浪数码',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      url: 'https://digital.sina.com.cn/news/2',
      hotScore: 876543
    },
    {
      id: 'wb3',
      title: 'Vue 3.4正式发布，性能优化和新特性详解',
      summary: 'Vue 3.4带来了显著的性能提升和多个实用新特性',
      source: '前端资讯',
      publishedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      url: 'https://tech.sina.com.cn/vue/1',
      hotScore: 543210
    },
    {
      id: 'wb4',
      title: '《三体》电视剧版获得高分好评',
      summary: '改编自刘慈欣科幻小说的电视剧版《三体》获得观众好评',
      source: '娱乐新闻',
      publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      url: 'https://ent.sina.com.cn/tv/1',
      hotScore: 432109
    },
    {
      id: 'wb5',
      title: '2024年科技趋势预测：AI、量子计算、元宇宙',
      summary: '专家预测2024年最值得关注的科技发展趋势',
      source: '科技前沿',
      publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      url: 'https://tech.sina.com.cn/trend/1',
      hotScore: 321098
    }
  ],
  baidu: [
    {
      id: 'bd1',
      title: '百度文心一言4.0发布，中文AI能力大幅提升',
      summary: '百度发布文心一言4.0版本，在中文理解和生成方面表现出色',
      source: '百度AI',
      publishedAt: new Date(Date.now() - 30 * 60 * 1000),
      url: 'https://ai.baidu.com/news/1',
      hotScore: 765432
    },
    {
      id: 'bd2',
      title: '百度Apollo自动驾驶技术新突破',
      summary: '百度Apollo在自动驾驶领域取得重要技术突破，L4级别测试成功',
      source: '百度科技',
      publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      url: 'https://apollo.baidu.com/news/1',
      hotScore: 654321
    },
    {
      id: 'bd3',
      title: '百度搜索算法升级，提升用户体验',
      summary: '百度搜索引擎算法全面升级，搜索结果更加精准和个性化',
      source: '百度搜索',
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      url: 'https://search.baidu.com/news/1',
      hotScore: 543210
    }
  ]
}

// 初始化加载状态
categories.forEach(cat => {
  categoryLoading[cat.id] = false
  categoryErrors[cat.id] = ''
  newsData[cat.id] = []
  sortType[cat.id] = 'time' // 默认按时间排序
})

// 方法
const getNewsByCategory = (categoryId) => {
  const data = newsData[categoryId] || []
  const currentSortType = sortType[categoryId] || 'time'
  
  // 根据排序类型进行排序
  const sortedData = [...data].sort((a, b) => {
    if (currentSortType === 'time') {
      // 按时间排序（最新的在前）
      return new Date(b.publishedAt) - new Date(a.publishedAt)
    } else {
      // 按热度排序（热度高的在前）
      return (b.hotScore || 0) - (a.hotScore || 0)
    }
  })
  
  return sortedData
}

// 设置排序类型
const setSortType = (categoryId, type) => {
  sortType[categoryId] = type
}

// 从本地缓存加载数据
const loadFromCache = (categoryId) => {
  const cacheKey = `news_cache_${categoryId}`
  const cached = localStorage.getItem(cacheKey)
  
  if (cached) {
    try {
      const cacheData = JSON.parse(cached)
      // 检查缓存是否过期（1小时）
      const isExpired = Date.now() - cacheData.timestamp > 60 * 60 * 1000
      
      if (!isExpired && cacheData.data) {
        // 恢复日期对象
        const restoredData = cacheData.data.map(item => ({
          ...item,
          publishedAt: new Date(item.publishedAt)
        }))
        newsData[categoryId] = restoredData
        return true
      }
    } catch (error) {
      console.error('解析缓存数据失败:', error)
      localStorage.removeItem(cacheKey)
    }
  }
  return false
}

const loadCategoryNews = async (categoryId) => {
  categoryLoading[categoryId] = true
  categoryErrors[categoryId] = ''
  
  try {
    // 清空上一次的本地缓存
    const cacheKey = `news_cache_${categoryId}`
    localStorage.removeItem(cacheKey)
    
    let result
    
    // 根据分类ID调用不同的API
    if (categoryId === 'weibo') {
      result = await newsAPI.getNewsList()
    } else if (categoryId === 'baidu') {
      result = await newsAPI.getTechNews()
    } else {
      result = await newsAPI.getNewsList()
    }
    
    if (result.success) {
      // 转换API数据格式以适配组件
      const apiNews = result.data.map((article, index) => ({
        id: `${categoryId}_${index + 1}`,
        title: article.title,
        summary: article.title, // API没有单独的描述字段，使用标题
        content: article.title,
        source: article.author_name || '聚合数据',
        publishedAt: new Date(article.date),
        url: article.url,
        hotScore: Math.floor(Math.random() * 900000) + 100000 // 随机生成热度分数
      }))
      
      // 存储到本地缓存
      const cacheData = {
        data: apiNews,
        timestamp: Date.now()
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
      
      newsData[categoryId] = apiNews
    } else {
      throw new Error(result.message || '获取新闻失败')
    }
  } catch (error) {
    console.error(`Error loading ${categoryId} news:`, error)
    
    // 检查是否为API调用次数限制错误
    const shouldUseCache = error.shouldUseCache || 
                          error.message.includes('调用次数') || 
                          error.message.includes('用完') ||
                          error.message.includes('rate limit')
    
    if (shouldUseCache) {
      // 尝试使用浏览器缓存数据（忽略过期时间）
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try {
          const cacheData = JSON.parse(cached)
          if (cacheData.data && cacheData.data.length > 0) {
            // 恢复日期对象
            const restoredData = cacheData.data.map(item => ({
              ...item,
              publishedAt: new Date(item.publishedAt)
            }))
            newsData[categoryId] = restoredData
            categoryErrors[categoryId] = '接口调用次数已达限制，正在使用缓存数据'
            return
          }
        } catch (cacheError) {
          console.error('解析缓存数据失败:', cacheError)
        }
      }
      
      categoryErrors[categoryId] = '接口调用次数已达限制，且无可用缓存数据'
    } else {
      categoryErrors[categoryId] = error.message || '加载失败，请稍后重试'
    }
    
    // 如果没有缓存数据或不是调用次数限制错误，使用模拟数据作为备选
    const baseNews = mockNewsData[categoryId] || []
    const expandedNews = []
    
    // 为每个分类生成20条新闻
    for (let i = 0; i < 20; i++) {
      const baseIndex = i % baseNews.length
      const baseItem = baseNews[baseIndex]
      if (baseItem) {
        expandedNews.push({
          ...baseItem,
          id: `${baseItem.id}_${i}`,
          title: i === baseIndex ? baseItem.title : `${baseItem.title} (${i + 1})`,
          hotScore: baseItem.hotScore - i * 1000,
          publishedAt: new Date(Date.now() - (i + 1) * 30 * 60 * 1000)
        })
      }
    }
    
    newsData[categoryId] = expandedNews
  } finally {
    categoryLoading[categoryId] = false
  }
}

const refreshCategory = (categoryId) => {
  loadCategoryNews(categoryId)
}

const refreshAllNews = async () => {
  loading.value = true
  const promises = categories.map(cat => loadCategoryNews(cat.id))
  await Promise.all(promises)
  loading.value = false
}

const openNews = (news) => {
  selectedNews.value = news
}

const closeNews = () => {
  selectedNews.value = null
}

const shareNews = (news) => {
  if (navigator.share) {
    navigator.share({
      title: news.title,
      text: news.summary,
      url: news.url
    })
  } else {
    navigator.clipboard.writeText(`${news.title} - ${news.url}`)
    alert('链接已复制到剪贴板')
  }
}

// 移除了activeTab相关的返回值

const formatTime = (date) => {
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else {
    return date.toLocaleDateString()
  }
}

const formatHotScore = (score) => {
  if (score >= 10000) {
    return `${Math.floor(score / 10000)}万`
  }
  return score.toString()
}

// 生命周期
onMounted(() => {
  // 初始加载所有分类的数据，先尝试从缓存加载
  categories.forEach(category => {
    const hasCache = loadFromCache(category.id)
    if (!hasCache) {
      // 如果没有缓存或缓存过期，则从API加载
      loadCategoryNews(category.id)
    }
  })
})
</script>

<style scoped>
.news-hotspots {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.hotspots-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.hotspots-title {
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0;
}



/* 网格布局 */
.news-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  flex: 1;
  align-content: start;
  min-height: calc(100vh - 200px); /* 确保有足够的最小高度 */
}

.news-category-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  min-height: 500px; /* 设置最小高度 */
}

.news-category-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 1px solid #e9ecef;
}

.card-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.sort-controls {
  display: flex;
  gap: 4px;
}

.sort-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
}

.sort-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.sort-btn.active {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}



.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.retry-btn {
  padding: 8px 16px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 12px;
}

.news-list {
  padding: 0;
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.news-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.2s ease;
}

.news-item:hover {
  background: #f8f9fa;
}

.news-item:last-child {
  border-bottom: none;
}

.news-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  font-size: 12px;
  margin-right: 12px;
  flex-shrink: 0;
}

.news-rank:nth-child(1) {
  background: #e74c3c;
}

.news-item:nth-child(2) .news-rank {
  background: #f39c12;
}

.news-item:nth-child(3) .news-rank {
  background: #f1c40f;
}

.news-content {
  flex: 1;
  min-width: 0;
}

.news-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  margin: 0 0 6px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #7f8c8d;
}

.news-time {
  color: #95a5a6;
  font-size: 10px;
  background: #ecf0f1;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 400;
}

.news-source {
  font-weight: 500;
  color: #3498db;
}

.news-hot {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 500;
}

.news-summary {
  font-size: 13px;
  color: #7f8c8d;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-actions {
  display: flex;
  align-items: center;
  margin-left: 12px;
}

.share-btn {
  padding: 6px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.share-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

/* 新闻详情弹窗 */
.news-modal {
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
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
  flex: 1;
  margin-right: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #2c3e50;
}

.modal-body {
  padding: 20px;
}

.modal-body .news-meta {
  margin-bottom: 16px;
  font-size: 14px;
}

.modal-body .news-content {
  line-height: 1.6;
  color: #2c3e50;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: center;
}

.read-more-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background: #3498db;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.read-more-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

/* PC端大屏幕优化 */
@media (min-width: 1600px) {
  .news-hotspots {
    max-width: 1600px;
    padding: 40px;
  }
  
  .news-grid {
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    padding: 30px;
  }
}

/* 中等屏幕优化 */
@media (min-width: 1200px) and (max-width: 1599px) {
  .news-grid {
    grid-template-columns: 1fr 1fr;
    gap: 26px;
  }
}

/* 平板端适配 */
@media (min-width: 769px) and (max-width: 1199px) {
  .news-hotspots {
    padding: 24px;
  }
  
  .news-grid {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 20px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .news-hotspots {
    padding: 16px;
  }
  
  .hotspots-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .news-grid {
    grid-template-columns: 1fr;
    gap: 12px;
    padding: 12px;
  }
  
  .news-category-card {
    margin-bottom: 12px;
  }
  
  .card-header {
    padding: 10px 12px;
  }
  
  .card-title {
    font-size: 15px;
  }
  
  .news-list {
    max-height: 240px;
  }
  
  .news-item {
    padding: 6px 10px;
  }
  
  .news-rank {
    width: 18px;
    height: 18px;
    font-size: 9px;
    margin-right: 10px;
  }
  
  .news-title {
    font-size: 12px;
  }
  
  .news-meta {
    font-size: 10px;
    gap: 4px;
  }
  
  .modal-content {
    margin: 10px;
    max-height: 90vh;
  }
  
  .modal-header, .modal-body {
    padding: 16px;
  }
}
</style>