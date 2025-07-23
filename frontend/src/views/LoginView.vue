<template>
  <AuthLayout 
    subtitle="探索古老智慧，洞察天机玄妙"
    action-text="登录"
    :message="message"
    :message-type="messageType"
  >
    <div class="card-header">
      <h2>{{ loginMode === 'password' ? '账号密码登录' : '手机号登录' }}</h2>
      <p>{{ loginMode === 'password' ? '输入账号密码即可登录' : '验证后即可开始您的奇门之旅' }}</p>
    </div>

    <!-- 账号密码登录表单 -->
    <form v-if="loginMode === 'password'" @submit.prevent="handlePasswordLogin" class="login-form">
      <FormInput
        v-model="username"
        label="用户名/邮箱"
        placeholder="请输入用户名或邮箱"
        :error="usernameError"
        @blur="validateUsername"
      >
        <template #prefix>
          <UserIcon />
        </template>
      </FormInput>

      <FormInput
        v-model="password"
        label="密码"
        :type="showPassword ? 'text' : 'password'"
        placeholder="请输入密码"
        :error="passwordError"
        @blur="validatePassword"
      >
        <template #prefix>
          <LockIcon />
        </template>
        <template #suffix>
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="password-toggle"
          >
            <EyeIcon :closed="!showPassword" />
          </button>
        </template>
      </FormInput>

      <SubmitButton
        type="submit"
        :disabled="!canPasswordSubmit"
        :loading="isLoading"
        loading-text="登录中..."
      >
        登录
      </SubmitButton>
    </form>

    <!-- 手机号登录表单 -->
    <form v-else @submit.prevent="handleSmsSubmit" class="login-form">
      <FormInput
        v-model="phone"
        label="手机号码"
        type="tel"
        placeholder="请输入手机号"
        :error="phoneError"
        maxlength="11"
        @blur="validatePhone"
      >
        <template #prefix>
          <PhoneIcon />
        </template>
      </FormInput>

      <CodeInput
        v-if="showCodeInput"
        v-model="code"
        label="验证码"
        :error="codeError"
        :can-send="canSendCode"
        :loading="isLoading"
        :countdown="countdown"
        @blur="validateCode"
        @send-code="sendCode"
      >
        <template #prefix>
          <LockIcon />
        </template>
      </CodeInput>

      <SubmitButton
        type="submit"
        :disabled="!canSmsSubmit"
        :loading="isLoading"
        :loading-text="showCodeInput ? '登录中...' : '发送中...'"
      >
        {{ showCodeInput ? '立即登录' : '获取验证码' }}
      </SubmitButton>
    </form>

    <!-- 登录方式切换 -->
    <div class="divider">
      <span>其他方式</span>
    </div>

    <div class="alternative-actions">
      <button @click="switchLoginMode" class="alt-btn">
        <PhoneIcon v-if="loginMode === 'password'" size="18" />
        <UserIcon v-else size="18" />
        {{ loginMode === 'password' ? '手机号登录' : '账号密码登录' }}
      </button>
      
      <button @click="goToRegister" class="alt-btn register-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <line x1="19" y1="8" x2="19" y2="14" stroke="currentColor" stroke-width="1.5"/>
          <line x1="22" y1="11" x2="16" y2="11" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        立即注册
      </button>
    </div>
  </AuthLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AuthLayout from '../components/layout/AuthLayout.vue'
import FormInput from '../components/common/FormInput.vue'
import SubmitButton from '../components/common/SubmitButton.vue'
import CodeInput from '../components/common/CodeInput.vue'
import { UserIcon, LockIcon, PhoneIcon, EyeIcon } from '../components/icons'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const phone = ref('')
const code = ref('')
const username = ref('')
const password = ref('')

// 状态管理
const loginMode = ref('password')
const showCodeInput = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const countdown = ref(0)

// 错误信息
const phoneError = ref('')
const codeError = ref('')
const usernameError = ref('')
const passwordError = ref('')
const message = ref('')
const messageType = ref('')

// 计算属性
const canSendCode = computed(() => {
  return phone.value && !phoneError.value && countdown.value === 0
})

const canSmsSubmit = computed(() => {
  if (!showCodeInput.value) {
    return phone.value && !phoneError.value
  }
  return phone.value && !phoneError.value && code.value && !codeError.value
})

const canPasswordSubmit = computed(() => {
  return username.value && !usernameError.value && password.value && !passwordError.value
})

// 验证函数
const validatePhone = () => {
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phone.value) {
    phoneError.value = '请输入手机号'
  } else if (!phoneRegex.test(phone.value)) {
    phoneError.value = '请输入正确的手机号格式'
  } else {
    phoneError.value = ''
  }
}

const validateCode = () => {
  const codeRegex = /^\d{6}$/
  if (!code.value) {
    codeError.value = '请输入验证码'
  } else if (!codeRegex.test(code.value)) {
    codeError.value = '请输入6位数字验证码'
  } else {
    codeError.value = ''
  }
}

const validateUsername = () => {
  if (!username.value) {
    usernameError.value = '请输入用户名或邮箱'
  } else if (username.value.length < 3) {
    usernameError.value = '用户名至少3个字符'
  } else {
    usernameError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = '请输入密码'
  } else if (password.value.length < 6) {
    passwordError.value = '密码至少6个字符'
  } else {
    passwordError.value = ''
  }
}

// 切换登录模式
const switchLoginMode = () => {
  loginMode.value = loginMode.value === 'password' ? 'sms' : 'password'
  
  // 清空表单数据和错误信息
  phone.value = ''
  code.value = ''
  username.value = ''
  password.value = ''
  phoneError.value = ''
  codeError.value = ''
  usernameError.value = ''
  passwordError.value = ''
  showCodeInput.value = false
  countdown.value = 0
}

// 显示消息
const showMessage = (text, type = 'info') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 发送验证码
const sendCode = async () => {
  validatePhone()
  if (phoneError.value) return

  isLoading.value = true
  
  try {
    const result = await authStore.sendSmsCode(phone.value)
    if (result.success) {
      showCodeInput.value = true
      startCountdown()
      showMessage('验证码发送成功', 'success')
    } else {
      showMessage(result.message || '验证码发送失败', 'error')
    }
  } catch (error) {
    showMessage('网络错误，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

// 处理SMS登录表单提交
const handleSmsSubmit = async () => {
  if (!showCodeInput.value) {
    await sendCode()
    return
  }

  validatePhone()
  validateCode()
  
  if (phoneError.value || codeError.value) return

  isLoading.value = true

  try {
    const result = await authStore.loginWithSms({ phone: phone.value, code: code.value })
    if (result.success) {
      showMessage('登录成功', 'success')
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      showMessage(result.message || '登录失败', 'error')
    }
  } catch (error) {
    showMessage('网络错误，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

// 处理密码登录
const handlePasswordLogin = async () => {
  validateUsername()
  validatePassword()
  
  if (usernameError.value || passwordError.value) return

  isLoading.value = true

  try {
    const result = await authStore.login({ 
      usernameOrEmail: username.value, 
      password: password.value 
    })
    if (result.success) {
      showMessage('登录成功', 'success')
      setTimeout(() => {
        router.push('/')
      }, 1000)
    } else {
      showMessage(result.message || '登录失败', 'error')
    }
  } catch (error) {
    showMessage('网络错误，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}

// 检查登录状态
onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.card-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: #C4A876;
  letter-spacing: 2px;
}

.card-header p {
  font-size: 13px;
  color: rgba(196, 168, 118, 0.6);
  margin: 0;
  line-height: 1.4;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.password-toggle {
  background: none;
  border: none;
  color: rgba(196, 168, 118, 0.5);
  cursor: pointer;
  padding: 4px;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: rgba(196, 168, 118, 0.8);
}

.divider {
  display: flex;
  align-items: center;
  margin: 24px 0;
  color: rgba(196, 168, 118, 0.4);
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgba(196, 168, 118, 0.2);
}

.divider span {
  padding: 0 16px;
  background: linear-gradient(135deg, 
    rgba(47, 40, 32, 0.8) 0%,
    rgba(31, 26, 20, 0.9) 100%
  );
}

.alternative-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alt-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(196, 168, 118, 0.05);
  border: 1px solid rgba(196, 168, 118, 0.2);
  border-radius: 8px;
  color: rgba(196, 168, 118, 0.8);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  width: 100%;
}

.alt-btn:hover {
  background: rgba(196, 168, 118, 0.1);
  border-color: rgba(196, 168, 118, 0.3);
  color: #C4A876;
}

.register-btn {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.3);
  color: rgba(212, 175, 55, 0.9);
}

.register-btn:hover {
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.4);
  color: #D4AF37;
}
</style>