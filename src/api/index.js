import request from './request.js'

/**
 * API接口管理
 * 统一管理所有API接口
 */

// 通用请求方法封装
export const api = {
  // GET请求
  get(url, params = {}) {
    return request({
      method: 'GET',
      url,
      params
    })
  },

  // POST请求
  post(url, data = {}) {
    return request({
      method: 'POST',
      url,
      data
    })
  },

  // PUT请求
  put(url, data = {}) {
    return request({
      method: 'PUT',
      url,
      data
    })
  },

  // DELETE请求
  delete(url, params = {}) {
    return request({
      method: 'DELETE',
      url,
      params
    })
  },

  // PATCH请求
  patch(url, data = {}) {
    return request({
      method: 'PATCH',
      url,
      data
    })
  },

  // 文件上传
  upload(url, formData) {
    return request({
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 文件下载
  download(url, params = {}) {
    return request({
      method: 'GET',
      url,
      params,
      responseType: 'blob'
    })
  }
}

// 具体业务API接口
// 示例：用户相关接口
export const userAPI = {
  // 用户登录
  login(data) {
    return api.post('/auth/login', data)
  },

  // 用户注册
  register(data) {
    return api.post('/auth/register', data)
  },

  // 获取用户信息
  getUserInfo() {
    return api.get('/user/info')
  },

  // 更新用户信息
  updateUserInfo(data) {
    return api.put('/user/info', data)
  },

  // 修改密码
  changePassword(data) {
    return api.post('/user/change-password', data)
  }
}

// 示例：新闻相关接口
export const newsAPI = {
  // 聚合数据新闻API配置
  API_KEY: '71c9f16333e0e328f0d13ba2a6f2d83f',
  BASE_URL: 'https://v.juhe.cn/toutiao/index',

  // 由于CORS限制，聚合数据API无法直接从浏览器调用
  // 这里提供一个代理方案的示例
  PROXY_BASE_URL: '/api/proxy/juhe', // 需要后端配置代理

  // 获取新闻列表 - 使用聚合数据真实接口（通过代理）
  async getNewsList(params = {}) {
    const {
      type = 'top', // 新闻类型：top(头条),shehui(社会),guonei(国内),guoji(国际),yule(娱乐),tiyu(体育),junshi(军事),keji(科技),caijing(财经),shishang(时尚)
      page = 1,
      page_size = 30,
      is_filter = 0
    } = params

    try {
      // 使用代理路径避免CORS问题
      const response = await fetch(`${this.PROXY_BASE_URL}/toutiao/index?type=${type}&key=${this.API_KEY}&page=${page}&page_size=${page_size}&is_filter=${is_filter}`)
      const data = await response.json()
      
      if (data.error_code === 0) {
        return {
          success: true,
          data: data.result.data,
          stat: data.result.stat,
          message: data.reason
        }
      } else {
        // 检测具体的错误类型
        const errorInfo = this.analyzeApiError(data.error_code, data.reason)
        throw new Error(errorInfo.message)
      }
    } catch (error) {
      console.error('获取新闻列表失败:', error)
      
      // 分析错误类型，判断是否为调用次数限制
      const errorType = this.getErrorType(error)
      
      return {
        success: false,
        data: [],
        message: error.message || '网络请求失败',
        errorType: errorType,
        shouldUseCache: errorType === 'RATE_LIMIT' || errorType === 'API_QUOTA_EXCEEDED'
      }
    }
  },

  // 分析API错误类型
  analyzeApiError(errorCode, reason) {
    const errorMap = {
      10001: { type: 'INVALID_KEY', message: 'API密钥无效' },
      10002: { type: 'RATE_LIMIT', message: '请求过于频繁，已达到调用次数限制' },
      10003: { type: 'API_QUOTA_EXCEEDED', message: '今日调用次数已用完' },
      10004: { type: 'INVALID_PARAMS', message: '请求参数错误' },
      10005: { type: 'SERVICE_ERROR', message: '服务暂时不可用' }
    }
    
    return errorMap[errorCode] || { type: 'UNKNOWN', message: reason || '未知错误' }
  },

  // 获取错误类型
  getErrorType(error) {
    const message = error.message.toLowerCase()
    
    // 检测调用次数限制相关的错误
    if (message.includes('rate limit') || message.includes('调用次数') || message.includes('quota')) {
      return 'RATE_LIMIT'
    }
    
    if (message.includes('api quota') || message.includes('今日') || message.includes('用完')) {
      return 'API_QUOTA_EXCEEDED'
    }
    
    if (message.includes('network') || message.includes('网络') || message.includes('timeout')) {
      return 'NETWORK_ERROR'
    }
    
    return 'UNKNOWN'
  },

  // 获取热点新闻 (头条新闻)
  getHotNews(params = {}) {
    return this.getNewsList({ ...params, type: 'top' })
  },

  // 获取科技新闻
  getTechNews(params = {}) {
    return this.getNewsList({ ...params, type: 'keji' })
  },

  // 获取体育新闻
  getSportsNews(params = {}) {
    return this.getNewsList({ ...params, type: 'tiyu' })
  },

  // 获取娱乐新闻
  getEntertainmentNews(params = {}) {
    return this.getNewsList({ ...params, type: 'yule' })
  },

  // 获取财经新闻
  getFinanceNews(params = {}) {
    return this.getNewsList({ ...params, type: 'caijing' })
  },

  // 获取国内新闻
  getDomesticNews(params = {}) {
    return this.getNewsList({ ...params, type: 'guonei' })
  },

  // 获取国际新闻
  getInternationalNews(params = {}) {
    return this.getNewsList({ ...params, type: 'guoji' })
  },

  // 获取社会新闻
  getSocialNews(params = {}) {
    return this.getNewsList({ ...params, type: 'shehui' })
  },

  // 获取军事新闻
  getMilitaryNews(params = {}) {
    return this.getNewsList({ ...params, type: 'junshi' })
  },

  // 获取时尚新闻
  getFashionNews(params = {}) {
    return this.getNewsList({ ...params, type: 'shishang' })
  },

  // 根据新闻类型获取新闻
  getNewsByType(type, params = {}) {
    return this.getNewsList({ ...params, type })
  },

  // 获取新闻详情 (通过URL跳转到原文)
  getNewsDetail(url) {
    // 聚合数据API返回的是新闻链接，直接跳转
    if (url) {
      window.open(url, '_blank')
    }
    return Promise.resolve({ success: true, message: '跳转到新闻详情页面' })
  },

  // 搜索新闻 (在获取的新闻中进行本地搜索)
  async searchNews(keyword, params = {}) {
    try {
      const result = await this.getNewsList(params)
      if (result.success && result.data) {
        const filteredNews = result.data.filter(news => 
          news.title.toLowerCase().includes(keyword.toLowerCase()) ||
          (news.author_name && news.author_name.toLowerCase().includes(keyword.toLowerCase()))
        )
        return {
          success: true,
          data: filteredNews,
          message: `找到 ${filteredNews.length} 条相关新闻`
        }
      }
      return result
    } catch (error) {
      console.error('搜索新闻失败:', error)
      return {
        success: false,
        data: [],
        message: error.message || '搜索失败'
      }
    }
  }
}

// 示例：文件相关接口
export const fileAPI = {
  // 上传文件
  uploadFile(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.upload('/file/upload', formData)
  },

  // 下载文件
  downloadFile(fileId) {
    return api.download(`/file/download/${fileId}`)
  },

  // 删除文件
  deleteFile(fileId) {
    return api.delete(`/file/${fileId}`)
  }
}

// 导出默认的request实例
export { default as request } from './request.js'

// 导出所有API
export default {
  api,
  userAPI,
  newsAPI,
  fileAPI
}