<template>
  <div class="qimen-login-bg">
    <!-- 简洁的背景纹理 -->
    <div class="texture-overlay"></div>
    
    <!-- 主登录卡片 -->
    <div class="qimen-login-card">
      <!-- 顶部logo区域 -->
      <div class="brand-header">
        <div class="logo-container">
          <img src="/logo.png" alt="云雀奇门" class="brand-logo" />
        </div>
        <div class="brand-title">云雀奇门遁甲</div>
        <div class="brand-sub">AI智能解盘系统</div>
      </div>
      
      <!-- 表单区域 -->
      <div class="form-section">
        <div class="form-header">
          <h2 class="form-title">{{ isLogin ? '用户登录' : '用户注册' }}</h2>
        </div>
        
        <form @submit.prevent="handleSubmit" class="login-form">
          <!-- 用户名/邮箱输入 -->
          <div class="input-group" :class="{ error: errors.identifier }">
            <label class="input-label">{{ isLogin ? '用户名或邮箱' : '用户名' }}</label>
            <input
              v-model="formData.identifier"
              :placeholder="isLogin ? '请输入用户名或邮箱' : '请输入用户名'"
              class="form-input"
              autocomplete="username"
              maxlength="30"
            />
          </div>
          <div v-if="errors.identifier" class="error-message">{{ errors.identifier }}</div>

          <!-- 邮箱输入（仅注册） -->
          <div v-if="!isLogin" class="input-group" :class="{ error: errors.email }">
            <label class="input-label">邮箱地址</label>
            <input
              v-model="formData.email"
              placeholder="请输入邮箱地址"
              class="form-input"
              autocomplete="email"
              maxlength="50"
            />
          </div>
          <div v-if="errors.email" class="error-message">{{ errors.email }}</div>

          <!-- 密码输入 -->
          <div class="input-group" :class="{ error: errors.password }">
            <label class="input-label">密码</label>
            <div class="password-wrapper">
              <input
                v-model="formData.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="请输入密码"
                class="form-input"
                autocomplete="current-password"
                maxlength="30"
              />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                {{ showPassword ? '隐藏' : '显示' }}
              </button>
            </div>
          </div>
          <div v-if="errors.password" class="error-message">{{ errors.password }}</div>

          <!-- 确认密码（仅注册） -->
          <div v-if="!isLogin" class="input-group" :class="{ error: errors.confirmPassword }">
            <label class="input-label">确认密码</label>
            <input
              v-model="formData.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              class="form-input"
              maxlength="30"
            />
          </div>
          <div v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</div>

          <!-- 提交按钮 -->
          <button class="submit-button" :disabled="isLoading">
            {{ isLoading ? '处理中...' : (isLogin ? '登录' : '注册') }}
          </button>
        </form>
        
        <!-- 切换提示 -->
        <div class="switch-section">
          <div class="switch-tip">
            {{ isLogin ? '还没有账户？' : '已有账户？' }}
            <button type="button" class="switch-btn" @click="toggleMode">
              {{ isLogin ? '立即注册' : '立即登录' }}
            </button>
          </div>
        </div>
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
const isLoading = ref(false)
const showPassword = ref(false)

const formData = reactive({
  email: '',
  identifier: '',
  name: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  email: '',
  identifier: '',
  password: '',
  confirmPassword: ''
})

// 清除所有错误
const clearErrors = () => {
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })
}

// 验证表单
const validateForm = () => {
  clearErrors()
  let isValid = true

  // 验证用户名/邮箱
  if (!formData.identifier.trim()) {
    errors.identifier = `请输入${isLogin.value ? '用户名或邮箱' : '用户名'}`
    isValid = false
  } else if (formData.identifier.trim().length < 3) {
    errors.identifier = '长度不能少于3位'
    isValid = false
  }

  // 验证密码
  if (!formData.password) {
    errors.password = '请输入密码'
    isValid = false
  } else if (formData.password.length < 6) {
    errors.password = '密码长度不能少于6位'
    isValid = false
  }

  // 注册模式下的额外验证
  if (!isLogin.value) {
    // 验证邮箱
    if (!formData.email.trim()) {
      errors.email = '请输入邮箱'
      isValid = false
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = '邮箱格式不正确'
      isValid = false
    }

    // 验证确认密码
    if (!formData.confirmPassword) {
      errors.confirmPassword = '请确认密码'
      isValid = false
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致'
      isValid = false
    }
  }

  return isValid
}

// 提交表单
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    let result
    if (isLogin.value) {
      result = await authStore.login({
        usernameOrEmail: formData.identifier,
        password: formData.password
      })
    } else {
      result = await authStore.register({
        email: formData.email,
        username: formData.identifier,
        name: formData.name,
        password: formData.password
      })
    }

    if (result.success) {
      alert(result.message || (isLogin.value ? '登录成功！' : '注册成功！'))
      router.push('/')
    } else {
      alert(result.message || '操作失败，请重试')
    }
  } catch (error) {
    console.error('Submit error:', error)
    alert('操作失败，请重试')
  } finally {
    isLoading.value = false
  }
}

// 切换登录/注册模式
const toggleMode = () => {
  const currentIdentifier = formData.identifier

  isLogin.value = !isLogin.value
  clearErrors()
  
  if (isLogin.value) {
    Object.assign(formData, {
      email: '',
      identifier: currentIdentifier,
      name: '',
      password: '',
      confirmPassword: ''
    })
  } else {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentIdentifier)
    Object.assign(formData, {
      email: isEmail ? currentIdentifier : '',
      identifier: isEmail ? '' : currentIdentifier,
      name: '',
      password: '',
      confirmPassword: ''
    })
  }
}
</script>

<style scoped>
.qimen-login-bg {
  min-height: 100vh;
  width: 100vw;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: 'PingFang SC', 'Microsoft YaHei', 'Source Han Sans CN', sans-serif;
}

.texture-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(139, 69, 19, 0.03) 0%, transparent 50%);
  pointer-events: none;
}

.qimen-login-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.2);
  padding: 48px 40px;
  max-width: 400px;
  width: 90%;
  position: relative;
}

/* Logo区域 */
.brand-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.logo-container {
  margin-bottom: 16px;
}

.brand-logo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #d4af37;
}

.brand-title {
  font-size: 1.5rem;
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 4px;
  letter-spacing: 2px;
}

.brand-sub {
  color: #7f8c8d;
  font-size: 0.9rem;
  letter-spacing: 1px;
}

/* 表单区域 */
.form-section {
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: 24px;
}

.form-title {
  font-size: 1.3rem;
  color: #2c3e50;
  font-weight: 500;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-group.error .form-input {
  border-color: #e74c3c;
}

.input-label {
  font-size: 0.9rem;
  color: #34495e;
  margin-bottom: 6px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1rem;
  color: #2c3e50;
  background: #fff;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #d4af37;
}

.form-input::placeholder {
  color: #95a5a6;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper .form-input {
  padding-right: 60px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  font-size: 0.85rem;
  padding: 4px 8px;
  border-radius: 3px;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin-top: 4px;
  margin-left: 4px;
}

.submit-button {
  width: 100%;
  background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  padding: 14px 0;
  margin-top: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  letter-spacing: 1px;
}

.submit-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #b8941f 0%, #d4af37 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 切换区域 */
.switch-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #ecf0f1;
}

.switch-tip {
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.switch-btn {
  background: none;
  border: none;
  color: #d4af37;
  font-weight: 500;
  margin-left: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 2px 4px;
  border-radius: 3px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.switch-btn:hover {
  color: #b8941f;
  background: rgba(212, 175, 55, 0.1);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .qimen-login-card {
    padding: 32px 24px;
    margin: 16px;
    max-width: none;
  }
  
  .brand-title {
    font-size: 1.3rem;
  }
  
  .form-title {
    font-size: 1.2rem;
  }
}

@media (max-width: 480px) {
  .qimen-login-card {
    padding: 24px 20px;
  }
  
  .brand-title {
    font-size: 1.2rem;
    letter-spacing: 1px;
  }
  
  .form-input {
    font-size: 16px; /* 防止移动端缩放 */
  }
}
</style> 