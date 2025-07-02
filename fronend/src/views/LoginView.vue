<template>
  <div class="login-container">
    <div class="login-card">
      <!-- Logo -->
      <div class="logo-section">
        <img src="/logo.png" alt="鬼谷奇门" class="logo" />
        <h1 class="title">鬼谷奇门遁甲</h1>
      </div>
      
      <!-- 表单 -->
      <form @submit.prevent="handleSubmit" class="form">
        <h2 class="form-title">{{ isLogin ? '登录' : '注册' }}</h2>
        
        <!-- 用户名 -->
        <div class="field">
          <label>用户名</label>
          <input 
            v-model="form.username"
            type="text" 
            placeholder="请输入用户名"
            autocomplete="off"
            required
          />
        </div>
        
        <!-- 邮箱（仅注册） -->
        <div v-if="!isLogin" class="field">
          <label>邮箱</label>
          <input 
            v-model="form.email"
            type="email" 
            placeholder="请输入邮箱"
            autocomplete="off"
            required
          />
        </div>
        
        <!-- 密码 -->
        <div class="field">
          <label>密码</label>
          <input 
            v-model="form.password"
            type="password" 
            placeholder="请输入密码"
            autocomplete="off"
            required
          />
        </div>
        
        <!-- 确认密码（仅注册） -->
        <div v-if="!isLogin" class="field">
          <label>确认密码</label>
          <input 
            v-model="form.confirmPassword"
            type="password" 
            placeholder="请再次输入密码"
            autocomplete="off"
            required
          />
        </div>
        
        <!-- 提交按钮 -->
        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? '请稍候...' : (isLogin ? '登录' : '注册') }}
        </button>
        
        <!-- 错误信息 -->
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
      </form>
      
      <!-- 切换登录/注册 -->
      <div class="switch">
        <span>{{ isLogin ? '没有账号？' : '已有账号？' }}</span>
        <button type="button" @click="toggleMode" class="switch-btn">
          {{ isLogin ? '去注册' : '去登录' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isLogin = ref(true)
const loading = ref(false)
const errorMessage = ref('')

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// 切换模式
const toggleMode = () => {
  isLogin.value = !isLogin.value
  errorMessage.value = ''
  // 保留用户名，清空其他字段
  const username = form.username
  Object.assign(form, {
    username: username,
    email: '',
    password: '',
    confirmPassword: ''
  })
}

// 提交表单
const handleSubmit = async () => {
  errorMessage.value = ''
  
  // 基本验证
  if (!form.username.trim()) {
    errorMessage.value = '请输入用户名'
    return
  }
  
  if (!form.password) {
    errorMessage.value = '请输入密码'
    return
  }
  
  if (form.password.length < 6) {
    errorMessage.value = '密码至少6位'
    return
  }
  
  if (!isLogin.value) {
    if (!form.email.trim()) {
      errorMessage.value = '请输入邮箱'
      return
    }
    
    if (!form.confirmPassword) {
      errorMessage.value = '请确认密码'
      return
    }
    
    if (form.password !== form.confirmPassword) {
      errorMessage.value = '两次密码不一致'
      return
    }
  }
  
  loading.value = true
  
  try {
    let result
    if (isLogin.value) {
      result = await authStore.login({
        usernameOrEmail: form.username,
        password: form.password
      })
    } else {
      result = await authStore.register({
        username: form.username,
        email: form.email,
        password: form.password
      })
    }
    
    if (result.success) {
      router.push('/')
    } else {
      errorMessage.value = result.message || '操作失败'
    }
  } catch (error) {
    console.error('Auth error:', error)
    errorMessage.value = '网络错误，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

.login-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(212, 175, 55, 0.05) 0%, transparent 50%);
  background-size: cover, cover;
  background-position: center, center;
  opacity: 1;
  z-index: 1;
}

.login-card {
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    0 0 30px rgba(212, 175, 55, 0.1);
  backdrop-filter: blur(10px);
  position: relative;
  z-index: 2;
}

.logo-section {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  margin: 0;
  color: #d4af37;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.form {
  margin-bottom: 30px;
}

.form-title {
  text-align: center;
  margin: 0 0 30px 0;
  font-size: 20px;
  color: #d4af37;
  font-weight: 500;
}

.field {
  margin-bottom: 20px;
}

.field label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #d4af37;
  font-weight: 500;
}

.field input {
  width: 100%;
  padding: 14px;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  transition: all 0.3s ease;
}

.field input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.field input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
  background: rgba(0, 0, 0, 0.7);
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #d4af37 0%, #f4d03f 50%, #d4af37 100%);
  color: #000;
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 15px rgba(212, 175, 55, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.6s ease;
}

.submit-btn:hover:not(:disabled)::before {
  left: 100%;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 20px rgba(212, 175, 55, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-color: rgba(212, 175, 55, 0.6);
}

.submit-btn:disabled {
  background: #666;
  border-color: #444;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.5;
}

.error {
  color: #ff6b6b;
  font-size: 14px;
  text-align: center;
  margin-top: 15px;
  padding: 10px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 6px;
}

.switch {
  text-align: center;
  color: rgba(212, 175, 55, 0.8);
  font-size: 14px;
}

.switch-btn {
  background: none;
  border: none;
  color: #d4af37;
  cursor: pointer;
  margin-left: 8px;
  text-decoration: underline;
  font-weight: 500;
  transition: color 0.3s ease;
}

.switch-btn:hover {
  color: #f4d03f;
}

/* 移动端优化 */
@media (max-width: 480px) {
  .login-container {
    padding: 10px;
  }
  
  .login-card {
    padding: 20px;
  }
  
  .field input {
    font-size: 16px; /* 防止iOS缩放 */
  }
}
</style> 