import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { API_BASE_URL } from '../utils/api.js'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
  // 从localStorage恢复用户信息
  const savedUser = localStorage.getItem('user')
  const user = ref(savedUser ? JSON.parse(savedUser) : null)
  const token = ref(localStorage.getItem('token') || null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 设置axios默认headers
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common['Authorization']
    }
  }

  // 初始化时设置token
  if (token.value) {
    setAuthHeader(token.value)
  }

  const login = async (credentials) => {
    isLoading.value = true
    try {
      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/login`,
        data: {
          usernameOrEmail: credentials.usernameOrEmail || credentials.username || credentials.email,
          password: credentials.password
        },
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
      
      if (data.success) {
        token.value = data.data.token
        user.value = data.data.user
        // 同时保存token和用户信息到localStorage
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        setAuthHeader(data.data.token)
        
        return { success: true, message: data.message || '登录成功' }
      } else {
        return { success: false, message: data.message || '登录失败' }
      }
    } catch (error) {
      console.error('Login error:', error)
      let errorMessage = '登录失败，请重试'
      
      if (error.response) {
        // 服务器响应了错误状态码
        const errorData = error.response.data
        errorMessage = errorData?.error || errorData?.message || `登录失败 (${error.response.status})`
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
        url: `${API_BASE_URL}/api/auth/register`,
        data: {
          username: userData.username,
          email: userData.email,
          password: userData.password,
          phone: userData.phone || undefined
        },
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
      
      if (data.success) {
        token.value = data.token
        user.value = data.user
        // 同时保存token和用户信息到localStorage
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        setAuthHeader(data.token)
        
        return { success: true, message: data.message || '注册成功，获得1000积分奖励！' }
      } else {
        return { success: false, message: data.message || '注册失败' }
      }
    } catch (error) {
      console.error('Register error:', error)
      let errorMessage = '注册失败，请重试'
      
      if (error.response) {
        // 服务器响应了错误状态码
        const errorData = error.response.data
        errorMessage = errorData?.error || errorData?.message || `注册失败 (${error.response.status})`
        
        // 处理验证错误
        if (errorData?.details && Array.isArray(errorData.details)) {
          errorMessage = errorData.details.join(', ')
        }
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

  const logout = async () => {
    try {
      // 调用后端登出接口
      if (token.value) {
        await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
          headers: {
            'Authorization': `Bearer ${token.value}`
          }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // 无论如何都清除本地状态
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setAuthHeader(null)
    }
  }

  const checkAuth = async () => {
    // 首先尝试从localStorage恢复状态
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (!savedToken) {
      console.log('没有保存的token')
      return false
    }

    // 如果store中没有token，从localStorage恢复
    if (!token.value && savedToken) {
      token.value = savedToken
      setAuthHeader(savedToken)
    }
    
    // 如果store中没有用户信息，从localStorage恢复
    if (!user.value && savedUser) {
      try {
        user.value = JSON.parse(savedUser)
        console.log('从localStorage恢复用户信息:', user.value)
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
      })

      if (response.data.success) {
        user.value = response.data.user
        // 更新localStorage中的用户信息
        localStorage.setItem('user', JSON.stringify(response.data.user))
        setAuthHeader(token.value)
        console.log('认证检查成功，用户信息已更新')
        return true
      } else {
        console.log('认证检查失败，清除登录状态')
        logout()
        return false
      }
    } catch (error) {
      console.error('Auth check error:', error)
      // 网络错误时不立即清除登录状态，保持本地状态
      if (error.response && error.response.status === 401) {
        logout()
      }
      return false
    }
  }

  // 新增：获取用户积分
  const getPoints = async () => {
    if (!token.value) return null

    try {
      const response = await axios.get(`${API_BASE_URL}/api/points`, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
      })

      if (response.data.success) {
        return response.data.points
      }
      return null
    } catch (error) {
      console.error('Get points error:', error)
      return null
    }
  }

  // 新增：发送短信验证码
  const sendSmsCode = async (phone) => {
    isLoading.value = true
    try {
      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/send-sms`,
        data: { phone },
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
        },
        timeout: 10000,
        transformRequest: [function (data) {
          return JSON.stringify(data);
        }]
      })

      const data = response.data
      
      if (data.success) {
        return { success: true, message: data.message || '验证码发送成功' }
      } else {
        return { success: false, message: data.message || '验证码发送失败' }
      }
    } catch (error) {
      console.error('Send SMS error:', error)
      let errorMessage = '验证码发送失败，请重试'
      
      if (error.response) {
        const errorData = error.response.data
        errorMessage = errorData?.error || errorData?.message || `发送失败 (${error.response.status})`
      } else if (error.request) {
        errorMessage = '无法连接到服务器，请检查网络连接'
      } else {
        errorMessage = error.message || '请求配置错误'
      }
      
      return { success: false, message: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 新增：短信验证码登录
  const loginWithSms = async (credentials) => {
    isLoading.value = true
    try {
      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/login-sms`,
        data: {
          phone: credentials.phone,
          code: credentials.code
        },
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
        },
        timeout: 10000,
        transformRequest: [function (data) {
          return JSON.stringify(data);
        }]
      })

      const data = response.data
      
      if (data.success) {
        token.value = data.data.token
        user.value = data.data.user
        // 同时保存token和用户信息到localStorage
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        setAuthHeader(data.data.token)
        
        return { success: true, message: data.message || '登录成功' }
      } else {
        return { success: false, message: data.message || '登录失败' }
      }
    } catch (error) {
      console.error('SMS Login error:', error)
      let errorMessage = '登录失败，请重试'
      
      if (error.response) {
        const errorData = error.response.data
        errorMessage = errorData?.error || errorData?.message || `登录失败 (${error.response.status})`
      } else if (error.request) {
        errorMessage = '无法连接到服务器，请检查网络连接'
      } else {
        errorMessage = error.message || '请求配置错误'
      }
      
      return { success: false, message: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 新增：手机号注册
  const registerWithSms = async (credentials) => {
    isLoading.value = true
    try {
      const response = await axios({
        method: 'POST',
        url: `${API_BASE_URL}/api/auth/register-sms`,
        data: {
          phone: credentials.phone,
          code: credentials.code
        },
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
        },
        timeout: 10000,
        transformRequest: [function (data) {
          return JSON.stringify(data);
        }]
      })

      const data = response.data
      
      if (data.success) {
        token.value = data.data.token
        user.value = data.data.user
        // 同时保存token和用户信息到localStorage
        localStorage.setItem('token', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))
        setAuthHeader(data.data.token)
        
        return { success: true, message: data.message || '注册成功，获得1000积分奖励！' }
      } else {
        return { success: false, message: data.message || '注册失败' }
      }
    } catch (error) {
      console.error('SMS Register error:', error)
      let errorMessage = '注册失败，请重试'
      
      if (error.response) {
        const errorData = error.response.data
        errorMessage = errorData?.error || errorData?.message || `注册失败 (${error.response.status})`
      } else if (error.request) {
        errorMessage = '无法连接到服务器，请检查网络连接'
      } else {
        errorMessage = error.message || '请求配置错误'
      }
      
      return { success: false, message: errorMessage }
    } finally {
      isLoading.value = false
    }
  }

  // 新增：积分交易
  const pointsTransaction = async (amount, type, description) => {
    if (!token.value) return { success: false, message: '请先登录' }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/points/transaction`, {
        amount,
        type,
        description
      }, {
        headers: {
          'Authorization': `Bearer ${token.value}`,
        },
      })

      return response.data
    } catch (error) {
      console.error('Points transaction error:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || '积分操作失败' 
      }
    }
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    register,
    registerWithSms,
    logout,
    checkAuth,
    getPoints,
    pointsTransaction,
    sendSmsCode,
    loginWithSms,
  }
}) 