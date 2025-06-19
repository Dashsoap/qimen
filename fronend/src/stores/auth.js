import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_BASE_URL } from '../utils/api.js'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials) => {
    isLoading.value = true
    try {
      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/auth/login`,
        data: credentials,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
        },
        timeout: 10000, // 10秒超时
        transformRequest: [function (data) {
          return JSON.stringify(data);
        }]
      })

      const data = response.data
      
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
      
      return { success: true, message: data.message || '登录成功' }
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = '登录失败，请重试'
      
      if (error.response) {
        // 服务器响应了错误状态码
        const errorData = error.response.data
        errorMessage = errorData?.message || `登录失败 (${error.response.status})`
      } else if (error.request) {
        // 请求发出了但没有收到响应
        errorMessage = '无法连接到服务器，请检查网络连接或联系管理员'
      } else {
        // 其他错误
        errorMessage = error.message || '请求配置错误'
      }
      
      return { success: false, message: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    try {
      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/auth/register`,
        data: userData,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
        },
        timeout: 10000, // 10秒超时
        transformRequest: [function (data) {
          return JSON.stringify(data);
        }]
      })

      const data = response.data
      
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
      
      return { success: true, message: data.message || '注册成功' }
    } catch (error) {
      console.error('Register error:', error)
      let errorMessage = '注册失败，请重试'
      
      if (error.response) {
        // 服务器响应了错误状态码
        const errorData = error.response.data
        errorMessage = errorData?.message || `注册失败 (${error.response.status})`
      } else if (error.request) {
        // 请求发出了但没有收到响应
        errorMessage = '无法连接到服务器，请检查网络连接或联系管理员'
      } else {
        // 其他错误
        errorMessage = error.message || '请求配置错误'
      }
      
      return { success: false, message: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  const checkAuth = async () => {
    if (!token.value) return false

    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
      })

      if (!response.ok) {
        logout()
        return false
      }

      const data = await response.json()
      user.value = data.user
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  }
}) 