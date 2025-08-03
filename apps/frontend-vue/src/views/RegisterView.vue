<template>
  <AuthLayout 
    subtitle="加入我们，开启您的奇门之旅"
    action-text="注册"
    :message="message"
    :message-type="messageType"
  >
    <div class="card-header">
      <h2>{{ registerMode === 'password' ? '账号密码注册' : '手机号注册' }}</h2>
      <p>{{ registerMode === 'password' ? '创建您的专属账号' : '验证手机号即可快速注册' }}</p>
    </div>

    <!-- 账号密码注册表单 -->
    <form v-if="registerMode === 'password'" @submit.prevent="handlePasswordRegister" class="register-form">
      <FormInput
        v-model="username"
        label="用户名"
        placeholder="请输入用户名"
        :error="usernameError"
        @blur="validateUsername"
      >
        <template #prefix>
          <UserIcon />
        </template>
      </FormInput>

      <FormInput
        v-model="email"
        label="邮箱"
        type="email"
        placeholder="请输入邮箱地址"
        :error="emailError"
        @blur="validateEmail"
      >
        <template #prefix>
          <EmailIcon />
        </template>
      </FormInput>

      <FormInput
        v-model="password"
        label="密码"
        :type="showPassword ? 'text' : 'password'"
        placeholder="请输入密码（至少6位）"
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

      <FormInput
        v-model="confirmPassword"
        label="确认密码"
        :type="showConfirmPassword ? 'text' : 'password'"
        placeholder="请再次输入密码"
        :error="confirmPasswordError"
        @blur="validateConfirmPassword"
      >
        <template #prefix>
          <LockIcon />
        </template>
        <template #suffix>
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="password-toggle"
          >
            <EyeIcon :closed="!showConfirmPassword" />
          </button>
        </template>
      </FormInput>

      <SubmitButton
        type="submit"
        :disabled="!canPasswordSubmit"
        :loading="isLoading"
        loading-text="注册中..."
      >
        立即注册
      </SubmitButton>
    </form>

    <!-- 手机号注册表单 -->
    <form v-else @submit.prevent="handleSmsRegister" class="register-form">
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
        :loading-text="showCodeInput ? '注册中...' : '发送中...'"
      >
        {{ showCodeInput ? '立即注册' : '获取验证码' }}
      </SubmitButton>
    </form>

    <!-- 注册方式切换 -->
    <div class="divider">
      <span>其他方式</span>
    </div>

    <div class="alternative-actions">
      <button @click="switchRegisterMode" class="alt-btn">
        <PhoneIcon v-if="registerMode === 'password'" size="18" />
        <UserIcon v-else size="18" />
        {{ registerMode === 'password' ? '手机号注册' : '账号密码注册' }}
      </button>
      
      <button @click="goToLogin" class="alt-btn login-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <polyline points="10,17 15,12 10,7" stroke="currentColor" stroke-width="1.5" fill="none"/>
          <line x1="15" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="1.5"/>
        </svg>
        已有账号？立即登录
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
import { UserIcon, LockIcon, PhoneIcon, EmailIcon, EyeIcon } from '../components/icons'

const router = useRouter()
const authStore = useAuthStore()

// 表单数据
const phone = ref('')
const code = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

// 状态管理
const registerMode = ref('password')
const showCodeInput = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const countdown = ref(0)

// 错误信息
const phoneError = ref('')
const codeError = ref('')
const usernameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
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
  return username.value && !usernameError.value && 
         email.value && !emailError.value &&
         password.value && !passwordError.value && 
         confirmPassword.value && !confirmPasswordError.value
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
    usernameError.value = '请输入用户名'
  } else if (username.value.length < 3) {
    usernameError.value = '用户名至少3个字符'
  } else if (username.value.length > 20) {
    usernameError.value = '用户名不能超过20个字符'
  } else {
    usernameError.value = ''
  }
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = '请输入邮箱地址'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = '请输入正确的邮箱格式'
  } else {
    emailError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = '请输入密码'
  } else if (password.value.length < 6) {
    passwordError.value = '密码至少6个字符'
  } else if (password.value.length > 50) {
    passwordError.value = '密码不能超过50个字符'
  } else {
    passwordError.value = ''
  }
  if (confirmPassword.value) {
    validateConfirmPassword()
  }
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = '请确认密码'
  } else if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = '两次输入的密码不一致'
  } else {
    confirmPasswordError.value = ''
  }
}

// 切换注册模式
const switchRegisterMode = () => {
  registerMode.value = registerMode.value === 'password' ? 'sms' : 'password'
  
  // 清空表单数据和错误信息
  phone.value = ''
  code.value = ''
  username.value = ''
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  phoneError.value = ''
  codeError.value = ''
  usernameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''
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

// 处理SMS注册表单提交
const handleSmsRegister = async () => {
  if (!showCodeInput.value) {
    await sendCode()
    return
  }

  validatePhone()
  validateCode()
  
  if (phoneError.value || codeError.value) return

  isLoading.value = true

  try {
    const result = await authStore.registerWithSms({ phone: phone.value, code: code.value })
    if (result.success) {
      showMessage('注册成功！获得1000积分奖励', 'success')
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      showMessage(result.message || '注册失败', 'error')
    }
  } catch (error) {
    showMessage('网络错误，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

// 处理密码注册
const handlePasswordRegister = async () => {
  validateUsername()
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  
  if (usernameError.value || emailError.value || passwordError.value || confirmPasswordError.value) return

  isLoading.value = true

  try {
    const result = await authStore.register({ 
      username: username.value,
      email: email.value,
      password: password.value 
    })
    if (result.success) {
      showMessage('注册成功！获得1000积分奖励', 'success')
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } else {
      showMessage(result.message || '注册失败', 'error')
    }
  } catch (error) {
    showMessage('网络错误，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
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

.register-form {
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

.login-btn {
  background: rgba(212, 175, 55, 0.1);
  border-color: rgba(212, 175, 55, 0.3);
  color: rgba(212, 175, 55, 0.9);
}

.login-btn:hover {
  background: rgba(212, 175, 55, 0.15);
  border-color: rgba(212, 175, 55, 0.4);
  color: #D4AF37;
}
</style>