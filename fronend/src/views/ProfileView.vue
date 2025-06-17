<template>
  <div class="profile-container">
    <div class="profile-card">
      <div class="profile-header">
        <h1>我的账户</h1>
        <div class="profile-status">
          <span class="status-indicator" :class="{ online: isAuthenticated, offline: !isAuthenticated }"></span>
          <span class="status-text">{{ statusText }}</span>
        </div>
      </div>

      <!-- 已登录状态 -->
      <div v-if="isAuthenticated" class="user-info">
        <div class="user-avatar">
          <div class="avatar-placeholder">
            {{ userInitial }}
          </div>
        </div>
        
        <div class="user-details">
          <h3>{{ user?.username || '用户' }}</h3>
          <p class="user-email">{{ user?.email || '邮箱未设置' }}</p>
          <p class="login-time">登录时间: {{ formatDate(user?.lastLogin) }}</p>
        </div>

        <div class="user-actions">
          <button @click="refreshProfile" class="action-btn secondary" :disabled="isLoading">
            <span v-if="isLoading">刷新中...</span>
            <span v-else>刷新信息</span>
          </button>
          <button @click="handleLogout" class="action-btn danger">
            退出登录
          </button>
        </div>
      </div>

      <!-- 未登录状态 -->
      <div v-else class="guest-info">
        <div class="guest-avatar">
          <div class="avatar-placeholder guest">
            ?
          </div>
        </div>
        
        <div class="guest-details">
          <h3>未登录</h3>
          <p class="guest-description">
            登录后可以享受完整的奇门遁甲功能，包括个人起盘记录、收藏功能等。
          </p>
        </div>

        <div class="guest-actions">
          <button @click="goToLogin" class="action-btn primary">
            立即登录
          </button>
          <button @click="goToRegister" class="action-btn secondary">
            注册新账户
          </button>
        </div>
      </div>

      <!-- 功能模块 -->
      <div class="feature-sections">
        <div class="feature-section">
          <h4>🔮 奇门功能</h4>
          <div class="feature-list">
            <div class="feature-item" :class="{ disabled: !isAuthenticated }">
              <span class="feature-name">个人起盘记录</span>
              <span class="feature-status">{{ isAuthenticated ? '可用' : '需登录' }}</span>
            </div>
            <div class="feature-item" :class="{ disabled: !isAuthenticated }">
              <span class="feature-name">收藏夹</span>
              <span class="feature-status">{{ isAuthenticated ? '可用' : '需登录' }}</span>
            </div>
            <div class="feature-item">
              <span class="feature-name">基础查询</span>
              <span class="feature-status">免费</span>
            </div>
          </div>
        </div>

        <div class="feature-section">
          <h4>⚙️ 账户设置</h4>
          <div class="feature-list">
            <div class="feature-item" :class="{ disabled: !isAuthenticated }" @click="isAuthenticated && showSettings()">
              <span class="feature-name">个人信息</span>
              <span class="feature-status">{{ isAuthenticated ? '可编辑' : '需登录' }}</span>
            </div>
            <div class="feature-item" :class="{ disabled: !isAuthenticated }">
              <span class="feature-name">隐私设置</span>
              <span class="feature-status">{{ isAuthenticated ? '可配置' : '需登录' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提示消息 -->
    <div v-if="message" class="message" :class="messageType">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const message = ref('')
const messageType = ref('')

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const isLoading = computed(() => authStore.isLoading)

const statusText = computed(() => {
  return isAuthenticated.value ? '已登录' : '未登录'
})

const userInitial = computed(() => {
  if (user.value?.username) {
    return user.value.username.charAt(0).toUpperCase()
  }
  return 'U'
})

const formatDate = (dateString) => {
  if (!dateString) return '未知'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN')
}

const showMessage = (text, type = 'info') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

const refreshProfile = async () => {
  const success = await authStore.checkAuth()
  if (success) {
    showMessage('信息刷新成功', 'success')
  } else {
    showMessage('刷新失败，请重新登录', 'error')
  }
}

const handleLogout = () => {
  authStore.logout()
  showMessage('已退出登录', 'info')
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/login') // 假设登录页面包含注册功能
}

const showSettings = () => {
  showMessage('设置功能开发中...', 'info')
}

onMounted(async () => {
  // 如果有token，尝试获取用户信息
  if (isAuthenticated.value && !user.value) {
    await authStore.checkAuth()
  }
})
</script>

<style scoped>
.profile-container {
  font-family: "FangSong", "STKaiti", "SimSun", serif;
  color: #d4af37;
  background: #000000;
  padding: 20px 15px 40px;
  margin: 0;
  position: relative;
  min-height: calc(100vh - 100px);
  -webkit-tap-highlight-color: transparent;
}

.profile-container::before {
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

.profile-card {
  max-width: 800px;
  margin: 0 auto;
  background-color: rgba(10, 10, 10, 0.8);
  border: 1px solid #85754e;
  border-radius: 2px;
  padding: 30px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  color: #d4af37;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 1s ease-out forwards;
}

.profile-card::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 1px solid #85754e;
  pointer-events: none;
  z-index: 0;
}

.profile-card::after {
  content: '';
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border: 1px solid #d4af37;
  pointer-events: none;
  z-index: 0;
}

.profile-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
  padding: 25px 0;
}

.profile-header::before,
.profile-header::after {
  content: "";
  position: absolute;
  height: 2px;
  width: 70%;
  left: 15%;
}

.profile-header::before {
  top: 0;
  background: linear-gradient(to right, transparent, #85754e 20%, #d4af37 50%, #85754e 80%, transparent);
}

.profile-header::after {
  bottom: 0;
  background: linear-gradient(to right, transparent, #85754e 20%, #d4af37 50%, #85754e 80%, transparent);
}

.profile-header h1 {
  margin: 0 0 15px 0;
  font-size: 32px;
  font-weight: normal;
  letter-spacing: 12px;
  color: #d4af37;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.4);
  animation: titleGlow 3s infinite alternate ease-in-out;
}

.profile-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.status-indicator.online {
  background: #d4af37;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.5);
}

.status-indicator.offline {
  background: #85754e;
  box-shadow: 0 0 10px rgba(133, 117, 78, 0.5);
}

.status-text {
  font-size: 15px;
  font-weight: normal;
  color: #a38a36;
  letter-spacing: 4px;
  font-style: italic;
}

/* 用户信息样式 */
.user-info, .guest-info {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
  padding: 25px;
  background-color: rgba(10, 10, 10, 0.8);
  border: 1px solid #85754e;
  border-radius: 2px;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
  animation: fadeInUp 1s ease-out forwards;
  animation-delay: 0.2s;
}

.user-avatar, .guest-avatar {
  margin-bottom: 20px;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(10, 10, 10, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin: 0 auto;
  border: 3px solid #85754e;
  transition: all 0.3s ease;
  color: #d4af37;
  box-shadow: 0 0 15px rgba(212, 175, 55, 0.2);
}

.avatar-placeholder.guest {
  background: rgba(10, 10, 10, 0.5);
  color: #85754e;
  border-color: rgba(133, 117, 78, 0.5);
}

.user-details h3, .guest-details h3 {
  margin: 0 0 15px 0;
  font-size: 24px;
  font-weight: normal;
  color: #d4af37;
  letter-spacing: 6px;
}

.user-email, .login-time, .guest-description {
  margin: 8px 0;
  color: #a38a36;
  font-size: 14px;
  letter-spacing: 1px;
}

.guest-description {
  line-height: 1.7;
  max-width: 400px;
  margin: 15px auto;
  text-align: justify;
}

/* 按钮样式 */
.user-actions, .guest-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 25px;
}

.action-btn {
  padding: 12px 24px;
  border: 1px solid #85754e;
  border-radius: 2px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  min-width: 120px;
  font-family: "FangSong", "STKaiti", serif;
  letter-spacing: 3px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.4);
  position: relative;
  overflow: hidden;
}

.action-btn.primary {
  background: linear-gradient(45deg, #85754e, #d4af37, #85754e);
  background-size: 200% 200%;
  color: #000;
  animation: buttonGradient 8s ease infinite;
}

.action-btn.primary:hover {
  background-position: 100% 50%;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
}

.action-btn.secondary {
  background: rgba(10, 10, 10, 0.9);
  color: #d4af37;
  border: 1px solid #85754e;
}

.action-btn.secondary:hover {
  background: rgba(133, 117, 78, 0.2);
  border-color: #d4af37;
  transform: translateY(-2px);
}

.action-btn.danger {
  background: rgba(133, 117, 78, 0.8);
  color: #d4af37;
  border: 1px solid #85754e;
}

.action-btn.danger:hover {
  background: rgba(133, 117, 78, 1);
  border-color: #d4af37;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(133, 117, 78, 0.4);
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* 功能模块样式 */
.feature-sections {
  position: relative;
  z-index: 1;
}

.feature-section {
  background-color: rgba(8, 8, 8, 0.9);
  border: 1px solid #85754e;
  border-radius: 2px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.4);
  position: relative;
}

.feature-section h4 {
  margin: 0 0 15px 0;
  font-size: 18px;
  font-weight: normal;
  color: #d4af37;
  letter-spacing: 3px;
  position: relative;
  padding-left: 15px;
}

.feature-section h4::before {
  content: "『";
  position: absolute;
  left: 0;
  color: #85754e;
}

.feature-section h4::after {
  content: "』";
  margin-left: 5px;
  color: #85754e;
}

.feature-list {
  space-y: 10px;
}

.feature-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border: 1px solid rgba(133, 117, 78, 0.3);
  background-color: rgba(10, 10, 10, 0.5);
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.feature-item:hover:not(.disabled) {
  background: rgba(133, 117, 78, 0.2);
  border-color: #d4af37;
  transform: translateX(5px);
}

.feature-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: rgba(10, 10, 10, 0.3);
}

.feature-item:last-child {
  margin-bottom: 0;
}

.feature-name {
  font-size: 14px;
  color: #d4af37;
  letter-spacing: 1px;
}

.feature-status {
  font-size: 12px;
  color: #a38a36;
  font-weight: 500;
}

/* 消息提示 */
.message {
  position: fixed;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 2px;
  color: #d4af37;
  font-weight: 500;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid #85754e;
  font-family: "FangSong", "STKaiti", serif;
  letter-spacing: 2px;
}

.message.success {
  background: rgba(10, 10, 10, 0.95);
  border-color: #d4af37;
}

.message.error {
  background: rgba(10, 10, 10, 0.95);
  border-color: #85754e;
  color: #85754e;
}

.message.info {
  background: rgba(10, 10, 10, 0.95);
  border-color: #d4af37;
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes titleGlow {
  0% { text-shadow: 0 0 5px rgba(212, 175, 55, 0.2); }
  100% { text-shadow: 0 0 15px rgba(212, 175, 55, 0.5), 0 0 30px rgba(212, 175, 55, 0.2); }
}

@keyframes buttonGradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 15px;
  }

  .profile-card {
    padding: 20px;
  }

  .profile-header h1 {
    font-size: 2rem;
  }

  .user-actions, .guest-actions {
    flex-direction: column;
    align-items: center;
  }

  .action-btn {
    width: 100%;
    max-width: 250px;
  }

  .feature-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style> 