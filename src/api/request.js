import axios from 'axios'

// 创建axios实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // 基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // 可以在这里添加token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 显示加载状态
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    
    return config
  },
  error => {
    // 对请求错误做些什么
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    console.log('响应成功:', response.status, response.config.url)
    
    // 统一处理响应数据格式
    const { data } = response
    
    // 如果后端返回的数据格式是 { code, data, message }
    if (data && typeof data === 'object' && 'code' in data) {
      if (data.code === 200 || data.code === 0) {
        return data.data || data
      } else {
        // 业务错误
        const errorMsg = data.message || '请求失败'
        console.error('业务错误:', errorMsg)
        return Promise.reject(new Error(errorMsg))
      }
    }
    
    // 直接返回数据
    return data
  },
  error => {
    // 对响应错误做点什么
    console.error('响应错误:', error)
    
    let errorMessage = '网络错误'
    
    if (error.response) {
      // 服务器返回了错误状态码
      const { status, data } = error.response
      
      switch (status) {
        case 400:
          errorMessage = data?.message || '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          // 可以在这里处理token过期，跳转到登录页
          localStorage.removeItem('token')
          // window.location.href = '/login'
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = data?.message || `请求失败 (${status})`
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      errorMessage = '网络连接超时'
    } else {
      // 其他错误
      errorMessage = error.message || '请求失败'
    }
    
    // 可以在这里统一显示错误提示
    // ElMessage.error(errorMessage)
    
    return Promise.reject(new Error(errorMessage))
  }
)

export default request