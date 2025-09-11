/**
 * API使用示例
 * 展示如何在Vue组件中使用封装的axios
 */

import { api, userAPI, newsAPI, fileAPI } from './index.js'

// 示例1: 在Vue组件中使用通用API方法
export const useApiExample = () => {
  // 获取数据
  const fetchData = async () => {
    try {
      const response = await api.get('/users', { page: 1, limit: 10 })
      console.log('获取用户列表成功:', response)
      return response
    } catch (error) {
      console.error('获取用户列表失败:', error.message)
      throw error
    }
  }

  // 提交数据
  const submitData = async (userData) => {
    try {
      const response = await api.post('/users', userData)
      console.log('创建用户成功:', response)
      return response
    } catch (error) {
      console.error('创建用户失败:', error.message)
      throw error
    }
  }

  return {
    fetchData,
    submitData
  }
}

// 示例2: 在Vue组件中使用业务API
export const useUserExample = () => {
  // 用户登录
  const login = async (loginForm) => {
    try {
      const response = await userAPI.login(loginForm)
      // 保存token
      localStorage.setItem('token', response.token)
      console.log('登录成功:', response)
      return response
    } catch (error) {
      console.error('登录失败:', error.message)
      throw error
    }
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const userInfo = await userAPI.getUserInfo()
      console.log('获取用户信息成功:', userInfo)
      return userInfo
    } catch (error) {
      console.error('获取用户信息失败:', error.message)
      throw error
    }
  }

  return {
    login,
    getUserInfo
  }
}

// 示例3: 在Vue组件中使用新闻API（聚合数据真实接口）
export const useNewsExample = () => {
  // 获取综合新闻列表
  const getNewsList = async (params = {}) => {
    try {
      const newsList = await newsAPI.getNewsList(params)
      console.log('获取综合新闻成功:', newsList)
      return newsList
    } catch (error) {
      console.error('获取综合新闻失败:', error.message)
      throw error
    }
  }

  // 获取科技新闻
  const getTechNews = async (params = {}) => {
    try {
      const techNews = await newsAPI.getTechNews(params)
      console.log('获取科技新闻成功:', techNews)
      return techNews
    } catch (error) {
      console.error('获取科技新闻失败:', error.message)
      throw error
    }
  }

  // 获取体育新闻
  const getSportsNews = async (params = {}) => {
    try {
      const sportsNews = await newsAPI.getSportsNews(params)
      console.log('获取体育新闻成功:', sportsNews)
      return sportsNews
    } catch (error) {
      console.error('获取体育新闻失败:', error.message)
      throw error
    }
  }

  // 获取娱乐新闻
  const getEntertainmentNews = async (params = {}) => {
    try {
      const entertainmentNews = await newsAPI.getEntertainmentNews(params)
      console.log('获取娱乐新闻成功:', entertainmentNews)
      return entertainmentNews
    } catch (error) {
      console.error('获取娱乐新闻失败:', error.message)
      throw error
    }
  }

  // 获取财经新闻
  const getFinanceNews = async (params = {}) => {
    try {
      const financeNews = await newsAPI.getFinanceNews(params)
      console.log('获取财经新闻成功:', financeNews)
      return financeNews
    } catch (error) {
      console.error('获取财经新闻失败:', error.message)
      throw error
    }
  }

  // 获取军事新闻
  const getMilitaryNews = async (params = {}) => {
    try {
      const militaryNews = await newsAPI.getMilitaryNews(params)
      console.log('获取军事新闻成功:', militaryNews)
      return militaryNews
    } catch (error) {
      console.error('获取军事新闻失败:', error.message)
      throw error
    }
  }

  // 获取历史新闻
  const getHistoryNews = async (params = {}) => {
    try {
      const historyNews = await newsAPI.getHistoryNews(params)
      console.log('获取历史新闻成功:', historyNews)
      return historyNews
    } catch (error) {
      console.error('获取历史新闻失败:', error.message)
      throw error
    }
  }

  // 获取美食新闻
  const getFoodNews = async (params = {}) => {
    try {
      const foodNews = await newsAPI.getFoodNews(params)
      console.log('获取美食新闻成功:', foodNews)
      return foodNews
    } catch (error) {
      console.error('获取美食新闻失败:', error.message)
      throw error
    }
  }

  // 获取旅游新闻
  const getTravelNews = async (params = {}) => {
    try {
      const travelNews = await newsAPI.getTravelNews(params)
      console.log('获取旅游新闻成功:', travelNews)
      return travelNews
    } catch (error) {
      console.error('获取旅游新闻失败:', error.message)
      throw error
    }
  }

  // 获取游戏新闻
  const getGameNews = async (params = {}) => {
    try {
      const gameNews = await newsAPI.getGameNews(params)
      console.log('获取游戏新闻成功:', gameNews)
      return gameNews
    } catch (error) {
      console.error('获取游戏新闻失败:', error.message)
      throw error
    }
  }

  // 获取时尚新闻
  const getFashionNews = async (params = {}) => {
    try {
      const fashionNews = await newsAPI.getFashionNews(params)
      console.log('获取时尚新闻成功:', fashionNews)
      return fashionNews
    } catch (error) {
      console.error('获取时尚新闻失败:', error.message)
      throw error
    }
  }

  return {
    getNewsList,
    getTechNews,
    getSportsNews,
    getEntertainmentNews,
    getFinanceNews,
    getMilitaryNews,
    getHistoryNews,
    getFoodNews,
    getTravelNews,
    getGameNews,
    getFashionNews
  }
}

// 示例4: 文件上传下载
export const useFileExample = () => {
  // 文件上传
  const uploadFile = async (file) => {
    try {
      const response = await fileAPI.uploadFile(file)
      console.log('文件上传成功:', response)
      return response
    } catch (error) {
      console.error('文件上传失败:', error.message)
      throw error
    }
  }

  // 文件下载
  const downloadFile = async (fileId, fileName) => {
    try {
      const blob = await fileAPI.downloadFile(fileId)
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName || 'download'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('文件下载成功')
    } catch (error) {
      console.error('文件下载失败:', error.message)
      throw error
    }
  }

  return {
    uploadFile,
    downloadFile
  }
}

// 示例5: 在Vue 3 Composition API中的完整使用示例
/*
<template>
  <div>
    <button @click="handleLogin">登录</button>
    <button @click="handleGetNews">获取新闻</button>
    <input type="file" @change="handleFileUpload" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserExample, useNewsExample, useFileExample } from '@/api/example.js'

const { login } = useUserExample()
const { getNewsList } = useNewsExample()
const { uploadFile } = useFileExample()

const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  try {
    await login({ username: 'admin', password: '123456' })
    // 登录成功后的处理
  } catch (error) {
    // 错误处理
  } finally {
    loading.value = false
  }
}

const handleGetNews = async () => {
  try {
    const news = await getNewsList({ page: 1, limit: 20 })
    // 处理新闻数据
  } catch (error) {
    // 错误处理
  }
}

const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    try {
      await uploadFile(file)
      // 上传成功处理
    } catch (error) {
      // 错误处理
    }
  }
}
</script>
*/