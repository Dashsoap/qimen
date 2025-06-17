import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials) => {
    isLoading.value = true
    try {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      // 检查是否成功获取响应
      if (!response.ok) {
        let errorMessage = '登录失败'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (parseError) {
          // 如果无法解析错误响应，使用默认错误消息
          errorMessage = `登录失败 (${response.status})`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
      
      return { success: true, message: data.message || '登录成功' }
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = '登录失败，请重试'
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = '无法连接到服务器，请检查网络连接或联系管理员'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      return { success: false, message: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    try {
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      // 检查是否成功获取响应
      if (!response.ok) {
        let errorMessage = '注册失败'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (parseError) {
          // 如果无法解析错误响应，使用默认错误消息
          errorMessage = `注册失败 (${response.status})`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      
      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
      
      return { success: true, message: data.message || '注册成功' }
    } catch (error) {
      console.error('Register error:', error)
      let errorMessage = '注册失败，请重试'
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMessage = '无法连接到服务器，请检查网络连接或联系管理员'
      } else if (error.message) {
        errorMessage = error.message
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
      const response = await fetch('http://localhost:3001/auth/profile', {
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