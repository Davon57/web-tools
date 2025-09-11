# Axios 封装使用指南

本项目对 axios 进行了完整的封装，提供了统一的请求管理、错误处理、拦截器配置等功能。

## 文件结构

```
src/api/
├── request.js      # axios 基础配置和拦截器
├── index.js        # API 接口管理和方法封装
├── example.js      # 使用示例
└── README.md       # 使用文档
```

## 核心功能

### 1. 基础配置 (request.js)

- **自动添加 token**: 从 localStorage 读取 token 并添加到请求头
- **请求超时**: 默认 10 秒超时
- **统一错误处理**: 自动处理常见 HTTP 状态码错误
- **请求/响应日志**: 开发环境下的请求日志记录
- **数据格式统一**: 自动处理后端返回的标准格式数据

### 2. API 方法封装 (index.js)

提供了常用的 HTTP 方法封装：
- `api.get(url, params)` - GET 请求
- `api.post(url, data)` - POST 请求
- `api.put(url, data)` - PUT 请求
- `api.delete(url, params)` - DELETE 请求
- `api.patch(url, data)` - PATCH 请求
- `api.upload(url, formData)` - 文件上传
- `api.download(url, params)` - 文件下载

## 快速开始

### 1. 环境配置

在项目根目录创建环境配置文件：

**.env.development** (开发环境)
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=Web工具箱 - 开发环境
```

**.env.production** (生产环境)
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_APP_TITLE=Web工具箱
```

### 2. 基本使用

```javascript
import { api } from '@/api'

// GET 请求
const getUserList = async () => {
  try {
    const users = await api.get('/users', { page: 1, limit: 10 })
    console.log(users)
  } catch (error) {
    console.error('获取用户列表失败:', error.message)
  }
}

// POST 请求
const createUser = async (userData) => {
  try {
    const result = await api.post('/users', userData)
    console.log('创建成功:', result)
  } catch (error) {
    console.error('创建失败:', error.message)
  }
}
```

### 3. 业务 API 使用

```javascript
import { userAPI, newsAPI } from '@/api'

// 用户登录
const login = async (loginForm) => {
  try {
    const response = await userAPI.login(loginForm)
    localStorage.setItem('token', response.token)
    return response
  } catch (error) {
    throw error
  }
}

// 获取新闻列表（聚合数据真实API）
const getNews = async () => {
  try {
    const news = await newsAPI.getNewsList({ page: 1, limit: 20 })
    return news
  } catch (error) {
    console.error('获取新闻失败:', error.message)
  }
}

// 获取不同分类的新闻
const getTechNews = async () => {
  try {
    const techNews = await newsAPI.getTechNews()
    return techNews
  } catch (error) {
    console.error('获取科技新闻失败:', error.message)
  }
}

const getSportsNews = async () => {
  try {
    const sportsNews = await newsAPI.getSportsNews()
    return sportsNews
  } catch (error) {
    throw error
  }
}
```

### 4. 在 Vue 组件中使用

```vue
<template>
  <div>
    <button @click="handleLogin" :loading="loading">登录</button>
    <div v-for="item in newsList" :key="item.id">
      {{ item.title }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { userAPI, newsAPI } from '@/api'

const loading = ref(false)
const newsList = ref([])

// 登录处理
const handleLogin = async () => {
  loading.value = true
  try {
    await userAPI.login({
      username: 'admin',
      password: '123456'
    })
    // 登录成功处理
  } catch (error) {
    // 错误提示
    console.error(error.message)
  } finally {
    loading.value = false
  }
}

// 获取新闻列表
const fetchNews = async () => {
  try {
    const news = await newsAPI.getNewsList()
    newsList.value = news
  } catch (error) {
    console.error('获取新闻失败:', error.message)
  }
}

onMounted(() => {
  fetchNews()
})
</script>
```

## 高级功能

### 1. 文件上传

```javascript
import { fileAPI } from '@/api'

const handleFileUpload = async (file) => {
  try {
    const response = await fileAPI.uploadFile(file)
    console.log('上传成功:', response.url)
  } catch (error) {
    console.error('上传失败:', error.message)
  }
}
```

### 2. 文件下载

```javascript
import { fileAPI } from '@/api'

const handleDownload = async (fileId, fileName) => {
  try {
    const blob = await fileAPI.downloadFile(fileId)
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载失败:', error.message)
  }
}
```

### 3. 自定义拦截器

如需自定义拦截器，可以直接修改 `request.js` 文件：

```javascript
// 请求拦截器 - 添加自定义逻辑
request.interceptors.request.use(
  config => {
    // 添加自定义请求头
    config.headers['X-Custom-Header'] = 'custom-value'
    
    // 显示全局加载状态
    // showLoading()
    
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 添加自定义逻辑
request.interceptors.response.use(
  response => {
    // 隐藏全局加载状态
    // hideLoading()
    
    return response.data
  },
  error => {
    // 隐藏全局加载状态
    // hideLoading()
    
    // 自定义错误处理
    if (error.response?.status === 401) {
      // 跳转到登录页
      // router.push('/login')
    }
    
    return Promise.reject(error)
  }
)
```

## 错误处理

封装已经提供了完整的错误处理机制：

- **网络错误**: 自动识别网络连接问题
- **HTTP 状态码错误**: 自动处理 400、401、403、404、500 等常见错误
- **业务错误**: 根据后端返回的 code 字段判断业务逻辑错误
- **超时错误**: 请求超时自动提示

## 注意事项

1. **Token 管理**: 封装会自动从 localStorage 读取 token，确保登录后正确保存 token
2. **环境变量**: 确保在 `.env` 文件中正确配置 API 基础 URL
3. **错误处理**: 建议在组件中使用 try-catch 捕获错误并给用户友好提示
4. **类型安全**: 如果使用 TypeScript，建议为 API 响应数据定义类型接口

## 扩展 API

要添加新的业务 API，在 `index.js` 中按以下格式添加：

```javascript
// 新业务模块 API
export const newModuleAPI = {
  // 获取列表
  getList(params) {
    return api.get('/new-module/list', params)
  },
  
  // 创建记录
  create(data) {
    return api.post('/new-module', data)
  },
  
  // 更新记录
  update(id, data) {
    return api.put(`/new-module/${id}`, data)
  },
  
  // 删除记录
  delete(id) {
    return api.delete(`/new-module/${id}`)
  }
}
```

## 聚合数据新闻API说明

本项目已集成聚合数据的新闻头条API，提供真实的新闻数据获取功能。

### API配置

- **API提供商**: 聚合数据 (https://www.juhe.cn/)
- **接口地址**: http://v.juhe.cn/toutiao/index
- **API Key**: 71c9f16333e0e328f0d13ba2a6f2d83f

### 支持的新闻分类

| 分类代码 | 分类名称 | API方法 |
|---------|---------|--------|
| top | 头条 | `newsAPI.getNewsList()` |
| keji | 科技 | `newsAPI.getTechNews()` |
| tiyu | 体育 | `newsAPI.getSportsNews()` |
| yule | 娱乐 | `newsAPI.getEntertainmentNews()` |
| caijing | 财经 | `newsAPI.getFinanceNews()` |
| junshi | 军事 | `newsAPI.getMilitaryNews()` |
| lishi | 历史 | `newsAPI.getHistoryNews()` |
| meishi | 美食 | `newsAPI.getFoodNews()` |
| lvyou | 旅游 | `newsAPI.getTravelNews()` |
| youxi | 游戏 | `newsAPI.getGameNews()` |
| shishang | 时尚 | `newsAPI.getFashionNews()` |

### 使用示例

```javascript
import { newsAPI } from '@/api'

// 获取头条新闻
const getTopNews = async () => {
  try {
    const result = await newsAPI.getNewsList()
    if (result.success) {
      console.log('新闻数据:', result.data)
      return result.data
    } else {
      console.error('获取新闻失败:', result.message)
    }
  } catch (error) {
    console.error('API调用失败:', error.message)
  }
}

// 获取科技新闻
const getTechNews = async () => {
  try {
    const result = await newsAPI.getTechNews()
    if (result.success) {
      return result.data
    }
  } catch (error) {
    console.error('获取科技新闻失败:', error.message)
  }
}
```

### 返回数据格式

```javascript
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "title": "新闻标题",
      "date": "2024-01-15 10:30:00",
      "author_name": "来源名称",
      "url": "https://example.com/news/1",
      "thumbnail_pic_s": "缩略图URL",
      "thumbnail_pic_s02": "缩略图URL2",
      "thumbnail_pic_s03": "缩略图URL3"
    }
  ]
}
```

### 注意事项

1. **API限制**: 聚合数据API有调用频率限制，请合理使用
2. **错误处理**: 当API调用失败时，组件会自动回退到模拟数据
3. **图片资源**: 新闻图片可能存在跨域问题，建议添加错误处理
4. **数据更新**: 新闻数据实时更新，建议设置合适的刷新频率

### 在Vue组件中使用

```vue
<template>
  <div>
    <div v-for="news in newsList" :key="news.id">
      <h3>{{ news.title }}</h3>
      <p>{{ news.author_name }} - {{ news.date }}</p>
      <img :src="news.thumbnail_pic_s" @error="handleImageError" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { newsAPI } from '@/api'

const newsList = ref([])
const loading = ref(false)

const loadNews = async () => {
  loading.value = true
  try {
    const result = await newsAPI.getNewsList()
    if (result.success) {
      newsList.value = result.data
    }
  } catch (error) {
    console.error('加载新闻失败:', error)
  } finally {
    loading.value = false
  }
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

onMounted(() => {
  loadNews()
})
</script>
  
  // 创建记录
  create(data) {
    return api.post('/new-module', data)
  },
  
  // 更新记录
  update(id, data) {
    return api.put(`/new-module/${id}`, data)
  },
  
  // 删除记录
  delete(id) {
    return api.delete(`/new-module/${id}`)
  }
}
```

这样就完成了 axios 的完整封装，可以在项目中愉快地使用了！