<template>
  <div class="profile-view">
    <!-- 顶部用户信息区域 -->
    <div class="header-section">
      <div class="header-top">
        <button v-if="isAuthenticated && !checkinStatus?.isCheckedIn" 
                @click="doCheckin" 
                class="header-checkin-btn"
                :disabled="isCheckinLoading">
          签到
        </button>
      </div>
      
      <div v-if="isAuthenticated" class="user-profile">
        <div class="user-avatar">
          <span>{{ userInitial }}</span>
        </div>
        <div class="user-info">
          <div class="user-name">{{ user?.username || '用户昵称昵称昵称' }}</div>
          <div class="user-level">Lv1 {{ checkinStatus?.continuousStreak || 3 }}</div>
        </div>
        <div class="profile-arrow">›</div>
      </div>
      
      <div v-else class="guest-profile" @click="goToLogin">
        <div class="guest-avatar">
          <span>?</span>
        </div>
        <div class="guest-info">
          <div class="guest-name">未登录</div>
          <div class="guest-desc">点击登录</div>
        </div>
        <div class="profile-arrow">›</div>
      </div>
    </div>


    <!-- 快捷功能区域 -->
    <div class="quick-actions">
      <div class="action-item" @click="goToRecords">
        <div class="action-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 4h12v12H4V4zm2 2v8h8V6H6z" fill="currentColor"/>
          </svg>
        </div>
        <span>排盘记录</span>
      </div>
      
      <div class="action-item" @click="goToProfile">
        <div class="action-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <path d="M4 20c0-4 3-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
        </div>
        <span>个人档案</span>
      </div>
      
      <div class="action-item" @click="goToLearn">
        <div class="action-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/>
          </svg>
        </div>
        <span>了解奇门</span>
      </div>
      
      <div class="action-item" @click="goToCoins">
        <div class="action-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>
            <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </div>
        <span>我的未币</span>
      </div>
    </div>

    <!-- 更多服务功能列表 -->
    <div class="service-card">
      <div class="service-header">更多服务</div>
      
      <div class="service-item" @click="followWechat">
        <div class="service-icon">💬</div>
        <span class="service-name">关注公众号</span>
        <div class="service-arrow">›</div>
      </div>

      <div class="service-item" @click="redeemCode">
        <div class="service-icon">🎫</div>
        <span class="service-name">会员兑换码</span>
        <div class="service-arrow">›</div>
      </div>

      <div class="service-item" @click="contactService">
        <div class="service-icon">🎧</div>
        <span class="service-name">客服与反馈</span>
        <div class="service-arrow">›</div>
      </div>

      <div class="service-item" @click="goToSettings">
        <div class="service-icon">⚙️</div>
        <span class="service-name">设置</span>
        <div class="service-arrow">›</div>
      </div>

      <div class="service-item" @click="aboutApp">
        <div class="service-icon">ℹ️</div>
        <span class="service-name">关于</span>
        <div class="service-arrow">›</div>
      </div>
    </div>

    <!-- 退出登录按钮 -->
    <!-- <div v-if="isAuthenticated" class="logout-section">
      <button @click="handleLogout" class="logout-btn">退出登录</button>
    </div> -->

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
import { API_ENDPOINTS } from '../utils/api'

const router = useRouter()
const authStore = useAuthStore()
const message = ref('')
const messageType = ref('')

const isAuthenticated = computed(() => authStore.isAuthenticated)
const user = computed(() => authStore.user)
const isLoading = computed(() => authStore.isLoading)

// 积分和签到相关状态
const userPoints = ref(null)
const checkinStatus = ref(null)
const isCheckinLoading = ref(false)

const userInitial = computed(() => {
  if (user.value?.username) {
    return user.value.username.charAt(0).toUpperCase()
  }
  return 'U'
})

const showMessage = (text, type = 'info') => {
  message.value = text
  messageType.value = type
  setTimeout(() => {
    message.value = ''
  }, 3000)
}

// 获取积分信息
const refreshPoints = async () => {
  try {
    const token = authStore.token
    if (!token) return

    const response = await fetch(API_ENDPOINTS.POINTS_GET, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      userPoints.value = data.points
    } else if (response.status === 404) {
      userPoints.value = {
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
        pointsRecords: []
      }
    } else {
      console.error('获取积分失败:', response.status)
    }
  } catch (error) {
    console.error('获取积分错误:', error)
    userPoints.value = {
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
      pointsRecords: []
    }
  }
}

// 获取签到状态
const refreshCheckinStatus = async () => {
  try {
    const token = authStore.token
    if (!token) return

    const response = await fetch(API_ENDPOINTS.CHECKIN_STATUS, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      checkinStatus.value = data.data
    } else {
      console.error('获取签到状态失败:', response.status)
      checkinStatus.value = {
        isCheckedIn: false,
        checkinTime: null,
        continuousStreak: 0,
        todayBonus: 10
      }
    }
  } catch (error) {
    console.error('获取签到状态错误:', error)
    checkinStatus.value = {
      isCheckedIn: false,
      checkinTime: null,
      continuousStreak: 0,
      todayBonus: 10
    }
  }
}

// 执行签到
const doCheckin = async () => {
  if (isCheckinLoading.value) return
  
  isCheckinLoading.value = true
  
  try {
    const token = authStore.token
    if (!token) {
      showMessage('请先登录', 'error')
      return
    }

    const response = await fetch(API_ENDPOINTS.CHECKIN_DO, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })

    if (response.ok) {
      const data = await response.json()
      showMessage(`签到成功！获得${data.data.bonus}积分`, 'success')
      
      await Promise.all([
        refreshPoints(),
        refreshCheckinStatus()
      ])
    } else {
      const errorData = await response.json()
      showMessage(errorData.message || '签到失败', 'error')
    }
  } catch (error) {
    console.error('签到错误:', error)
    showMessage('签到失败，请重试', 'error')
  } finally {
    isCheckinLoading.value = false
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
  router.push('/login')
}

// 功能按钮事件
const inviteFriend = () => {
  showMessage('邀请功能开发中...', 'info')
}

const goToRecords = () => {
  showMessage('排盘记录功能开发中...', 'info')
}

const goToProfile = () => {
  showMessage('个人档案功能开发中...', 'info')
}

const goToLearn = () => {
  showMessage('了解奇门功能开发中...', 'info')
}

const goToCoins = () => {
  showMessage('我的未币功能开发中...', 'info')
}

const followWechat = () => {
  showMessage('关注公众号功能开发中...', 'info')
}

const redeemCode = () => {
  showMessage('会员兑换码功能开发中...', 'info')
}

const contactService = () => {
  showMessage('客服与反馈功能开发中...', 'info')
}

const goToSettings = () => {
  showMessage('设置功能开发中...', 'info')
}

const aboutApp = () => {
  showMessage('关于功能开发中...', 'info')
}

onMounted(async () => {
  try {
    // 首先检查本地存储的登录状态
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    console.log('Profile页面初始化:', {
      hasToken: !!token,
      hasUser: !!savedUser,
      storeAuthenticated: isAuthenticated.value,
      storeUser: user.value
    })
    
    // 如果有token但store中没有用户信息，重新验证
    if (token && !user.value) {
      console.log('检测到token但无用户信息，重新验证...')
      await authStore.checkAuth()
    }
    
    // 如果已登录，获取用户数据
    if (isAuthenticated.value) {
      console.log('用户已登录，获取积分和签到状态...')
      await Promise.all([
        refreshPoints(),
        refreshCheckinStatus()
      ])
    } else {
      console.log('用户未登录')
    }
  } catch (error) {
    console.error('Profile initialization error:', error)
  }
})
</script>

<style scoped>
/* 暖色主题CSS变量 */
:root {
  --bg-primary: #fefdf7;
  --bg-card: #FFFFFF;
  --text-primary: #753c14;
  --text-secondary: #5f3d25;
  --text-muted: #999999;
  --accent-color: #d3844e;
  --accent-light: #f3c165;
  --border-color: #E0E0E0;
  --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.profile-view {
  background: var(--bg-primary);
  font-family: 'Alibaba PuHuiTi 2.0', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: var(--text-primary);
  position: relative;
}

/* 顶部用户信息区域 - 透明背景设计 */
.header-section {
  background: transparent;
  margin: 0 16px;
  padding: 20px;
  position: relative;
}

.header-top {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
}

.header-checkin-btn {
  background: transparent;
  border: none;
  padding: 8px 16px;
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  position: absolute;
  right: 0;
  top: 0;
}

.header-checkin-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.header-checkin-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.user-profile, .guest-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
  margin-top: 20px;
}

.user-profile:hover, .guest-profile:hover {
  opacity: 0.8;
}

.user-avatar, .guest-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  font-size: 20px;
  font-weight: 600;
}

.user-info, .guest-info {
  flex: 1;
}

.user-name, .guest-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.user-level, .guest-desc {
  display: inline-flex;
  align-items: center;
  background: linear-gradient(236deg, rgba(211,132,78,0.3) 0%, rgba(243,193,101,0.3) 100%);
  border-radius: 38px;
  padding: 2px 8px;
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 600;
}

.profile-arrow {
  font-size: 16px;
  color: var(--text-muted);
  transition: all 0.3s ease;
}

.user-profile:hover .profile-arrow, .guest-profile:hover .profile-arrow {
  color: var(--accent-color);
}

/* 简洁卡片设计 */
.simple-card {
  background: 
    linear-gradient(135deg, 
      rgba(47, 40, 32, 0.6) 0%,
      rgba(31, 26, 20, 0.7) 100%
    );
  border: 1px solid rgba(196, 168, 118, 0.15);
  border-radius: 12px;
  margin: 20px 16px;
  padding: 20px;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* 邀请横幅 - 浅色主题 */
.invite-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  margin: 0 16px 16px;
  padding: 20px;
  box-shadow: var(--shadow-light);
}

.invite-content h3 {
  color: var(--text-primary);
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px 0;
}

.invite-content p {
  color: var(--text-secondary);
  font-size: 14px;
  margin: 0;
  line-height: 1.4;
}

.invite-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-light);
  border: 1px solid var(--accent-color);
  border-radius: 20px;
  padding: 10px 16px;
  color: var(--accent-color);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.invite-btn:hover {
  background: var(--accent-color);
  color: white;
}

/* 快捷功能 - 一行4个图标布局 */
.quick-actions {
  display: flex;
  justify-content: space-between;
  background: var(--bg-card);
  border-radius: 16px;
  margin: 16px;
  padding: 20px 38px;
  box-shadow: var(--shadow-light);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 54px;
}

.action-item:hover {
  opacity: 0.8;
}

.action-icon {
  width: 28px;
  height: 28px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 20px;
  margin-bottom: 4px;
}

.action-item:hover .action-icon {
  opacity: 0.8;
}

.action-item span {
  color: var(--text-secondary);
  font-size: 13px;
  text-align: center;
  font-weight: 400;
  line-height: 1.2;
}

/* 更多服务 - 暖色主题设计 */
.service-card {
  background: var(--bg-card);
  margin: 0 16px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-light);
}

.service-header {
  display: none;
}

.service-item {
  display: flex;
  align-items: center;
  padding: 16px 40px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--bg-card);
  position: relative;
}

.service-item:hover {
  opacity: 0.8;
}

.service-item:last-child {
  border-bottom: none;
}

.service-icon {
  width: 24px;
  height: 24px;
  margin-right: 16px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.service-name {
  flex: 1;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 400;
}

.service-arrow {
  color: var(--text-muted);
  font-size: 16px;
  transition: all 0.3s ease;
}

.service-item:hover .service-arrow {
  color: var(--accent-color);
}

/* 退出登录 - 浅色主题 */
.logout-section {
  padding: 24px 16px;
}

.logout-btn {
  width: 100%;
  background: #FFF5F5;
  border: 1px solid #FEB2B2;
  border-radius: 8px;
  padding: 14px;
  color: #E53E3E;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #FED7D7;
  border-color: #FC8181;
}

/* 消息提示 - 浅色主题 */
.message {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  animation: fadeInOut 3s ease-in-out;
  box-shadow: var(--shadow-medium);
}

.message.success {
  background: #F0FDF4;
  border: 1px solid #BBF7D0;
  color: #166534;
}

.message.error {
  background: #FEF2F2;
  border: 1px solid #FECACA;
  color: #DC2626;
}

.message.info {
  background: #EFF6FF;
  border: 1px solid #BFDBFE;
  color: #1D4ED8;
}

@keyframes fadeInOut {
  0%, 100% { 
    opacity: 0; 
    transform: translateX(-50%) translateY(-10px); 
  }
  10%, 90% { 
    opacity: 1; 
    transform: translateX(-50%) translateY(0); 
  }
}

</style>
