<template>
  <div class="login-container">
    <div class="cosmic-header">
      <div class="title-wrapper">
        <h2 class="dao-title">{{ isLogin ? '欢迎回来' : '创建账户' }}</h2>
        <div class="dao-subtitle">{{ isLogin ? '登录到云雀奇门' : '注册云雀奇门账户' }}</div>
      </div>
    </div>

    <div class="input-section">
      <form @submit.prevent="handleSubmit" class="login-form">
        <!-- 邮箱字段 - 仅注册时显示 -->
        <div class="input-item" v-if="!isLogin">
          <label class="input-label">邮箱</label>
          <input
            v-model="formData.email"
            type="email"
            class="dao-input"
            placeholder="请输入邮箱地址"
            :class="{ 'error': errors.email }"
          />
          <div class="error-message" v-if="errors.email">{{ errors.email }}</div>
        </div>

        <!-- 用户名/用户名或邮箱 -->
        <div class="input-item">
          <label class="input-label">{{ isLogin ? '用户名或邮箱' : '用户名' }}</label>
          <input
            v-model="formData.identifier"
            type="text"
            class="dao-input"
            :placeholder="isLogin ? '请输入用户名或邮箱' : '请输入用户名'"
            :class="{ 'error': errors.identifier }"
          />
          <div class="error-message" v-if="errors.identifier">{{ errors.identifier }}</div>
        </div>

        <!-- 姓名字段 - 仅注册时显示 -->
        <div class="input-item" v-if="!isLogin">
          <label class="input-label">姓名（可选）</label>
          <input
            v-model="formData.name"
            type="text"
            class="dao-input"
            placeholder="请输入您的姓名"
          />
        </div>

        <!-- 密码 -->
        <div class="input-item">
          <label class="input-label">密码</label>
          <div class="password-wrapper">
            <input
              v-model="formData.password"
              :type="showPassword ? 'text' : 'password'"
              class="dao-input"
              placeholder="请输入密码"
              :class="{ 'error': errors.password }"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '隐藏' : '显示' }}
            </button>
          </div>
          <div class="error-message" v-if="errors.password">{{ errors.password }}</div>
        </div>

        <!-- 确认密码 - 仅注册时显示 -->
        <div class="input-item" v-if="!isLogin">
          <label class="input-label">确认密码</label>
          <input
            v-model="formData.confirmPassword"
            type="password"
            class="dao-input"
            placeholder="请再次输入密码"
            :class="{ 'error': errors.confirmPassword }"
          />
          <div class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</div>
        </div>

        <!-- 提交按钮 -->
        <button
          type="submit"
          class="dao-button"
          :disabled="isLoading"
          :class="{ 'loading': isLoading }"
        >
          <span class="dao-button-text">
            {{ isLoading ? '处理中...' : (isLogin ? '登录' : '注册') }}
          </span>
        </button>
      </form>

      <!-- 切换模式 -->
      <div class="toggle-section">
        <button
          type="button"
          class="toggle-button"
          @click="toggleMode"
        >
          {{ isLogin ? '还没有账户？立即注册' : '已有账户？立即登录' }}
        </button>
      </div>
    </div>

    <!-- 装饰光晕 -->
    <div class="light-orb"></div>
    <div class="light-orb"></div>
    <div class="light-orb"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
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
        identifier: formData.identifier,
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
      // 显示成功消息（可以用简单的alert或者toast）
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
  isLogin.value = !isLogin.value
  clearErrors()
  
  // 清空表单数据
  Object.assign(formData, {
    email: '',
    identifier: '',
    name: '',
    password: '',
    confirmPassword: ''
  })
}

// 鼠标跟随光晕效果
const moveOrbs = (e) => {
  const orbs = document.querySelectorAll('.light-orb')
  const mouseX = e.clientX
  const mouseY = e.clientY

  orbs.forEach((orb, index) => {
    const moveX = (mouseX / window.innerWidth - 0.5) * (index + 1) * 20
    const moveY = (mouseY / window.innerHeight - 0.5) * (index + 1) * 20

    setTimeout(() => {
      orb.style.transform = `translate(${moveX}px, ${moveY}px)`
    }, index * 100)
  })
}

onMounted(() => {
  // 注册鼠标移动事件
  document.addEventListener('mousemove', moveOrbs)
})
</script>

<style scoped>
/* 参考QimenView的整体容器样式 */
.login-container {
  font-family: "FangSong", "STKaiti", "SimSun", serif;
  color: #d4af37;
  background: #000000;
  padding: 20px 15px;
  margin: 0;
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
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
  z-index: -1;
}

/* 参考QimenView的标题样式 */
.cosmic-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  padding: 25px 0;
  animation: fadeInUp 1s ease-out forwards;
}

.cosmic-header::before,
.cosmic-header::after {
  content: "";
  position: absolute;
  height: 2px;
  width: 70%;
  left: 15%;
}

.cosmic-header::before {
  top: 0;
  background: linear-gradient(to right, transparent, #85754e 20%, #d4af37 50%, #85754e 80%, transparent);
}

.cosmic-header::after {
  bottom: 0;
  background: linear-gradient(to right, transparent, #85754e 20%, #d4af37 50%, #85754e 80%, transparent);
}

.dao-title {
  font-size: 32px;
  font-weight: normal;
  letter-spacing: 12px;
  color: #d4af37;
  margin: 0;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
  position: relative;
  display: inline-block;
  animation: titleGlow 3s infinite alternate ease-in-out;
}

.dao-subtitle {
  font-size: 15px;
  margin-top: 12px;
  color: #a38a36;
  letter-spacing: 4px;
  font-style: italic;
}

/* 参考QimenView的输入区域样式 */
.input-section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  max-width: 400px;
  padding: 25px;
  background-color: rgba(10, 10, 10, 0.8);
  border: 1px solid #85754e;
  border-radius: 2px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  animation: fadeInUp 1s ease-out forwards;
  animation-delay: 0.2s;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-item {
  display: flex;
  flex-direction: column;
}

.input-label {
  font-size: 14px;
  color: #a38a36;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

/* 参考QimenView的输入框样式 */
.dao-input {
  border: 1px solid #85754e;
  border-radius: 2px;
  background-color: rgba(10, 10, 10, 0.9);
  color: #f6e27a;
  padding: 12px 15px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease;
  font-family: "FangSong", "STKaiti", serif;
  font-size: 14px;
}

.dao-input:focus {
  outline: none;
  border-color: rgba(243, 215, 126, 0.7);
  box-shadow: 0 0 12px rgba(243, 215, 126, 0.4);
}

.dao-input.error {
  border-color: #ff6b6b;
  box-shadow: 0 0 12px rgba(255, 107, 107, 0.4);
}

.dao-input::placeholder {
  color: #85754e;
}

/* 密码显示/隐藏按钮 */
.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #85754e;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #d4af37;
}

/* 错误消息样式 */
.error-message {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 5px;
  letter-spacing: 0.5px;
}

/* 参考QimenView的按钮样式 */
.dao-button {
  align-self: center;
  min-width: 150px;
  padding: 14px 30px;
  margin-top: 10px;
  background: linear-gradient(45deg, #85754e 0%, #d4af37 50%, #85754e 100%);
  background-size: 200% 200%;
  color: #000;
  border: none;
  font-size: 18px;
  border-radius: 2px;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  font-family: "FangSong", "STKaiti", serif;
  letter-spacing: 5px;
  font-weight: bold;
  animation: buttonGradient 8s ease infinite;
}

.dao-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dao-button:not(:disabled):active {
  transform: scale(0.96);
  box-shadow: 0 0 10px rgba(243, 215, 126, 0.7);
  background-position: 100% 50%;
}

.dao-button-text {
  position: relative;
  z-index: 1;
}

/* 切换按钮 */
.toggle-section {
  text-align: center;
  margin-top: 20px;
}

.toggle-button {
  background: none;
  border: none;
  color: #85754e;
  cursor: pointer;
  font-size: 14px;
  letter-spacing: 1px;
  transition: color 0.3s ease;
  text-decoration: underline;
}

.toggle-button:hover {
  color: #d4af37;
}

/* 参考QimenView的光晕效果 */
.light-orb {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
  pointer-events: none;
  transition: transform 0.8s ease-out;
  z-index: -1;
}

.light-orb:nth-child(4) {
  top: 10%;
  left: 20%;
  animation: float 6s ease-in-out infinite;
}

.light-orb:nth-child(5) {
  top: 70%;
  right: 10%;
  animation: float 8s ease-in-out infinite reverse;
}

.light-orb:nth-child(6) {
  bottom: 20%;
  left: 10%;
  animation: float 7s ease-in-out infinite;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes titleGlow {
  0% {
    text-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
  }
  100% {
    text-shadow: 0 0 20px rgba(212, 175, 55, 0.8), 0 0 30px rgba(212, 175, 55, 0.4);
  }
}

@keyframes buttonGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dao-title {
    font-size: 24px;
    letter-spacing: 8px;
  }
  
  .dao-subtitle {
    font-size: 13px;
    letter-spacing: 3px;
  }
  
  .input-section {
    max-width: 300px;
    padding: 20px;
  }
  
  .dao-button {
    letter-spacing: 3px;
  }
}
</style> 