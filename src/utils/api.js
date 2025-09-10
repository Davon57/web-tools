import axios from 'axios'

// 创建axios实例
const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 可以在这里添加token等认证信息
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    return response.data
  },
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

// 封装常用的HTTP方法
export const http = {
  get(url, params) {
    return api.get(url, { params })
  },
  
  post(url, data) {
    return api.post(url, data)
  },
  
  put(url, data) {
    return api.put(url, data)
  },
  
  delete(url) {
    return api.delete(url)
  }
}

export default api