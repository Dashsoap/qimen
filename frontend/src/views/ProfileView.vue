<template>
  <div class="profile-view">
    <!-- 顶部用户信息区域 -->
    <div class="header-section">
      <div class="header-top">
        <h1>我的</h1>
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

    <!-- 邀请好友横幅 -->
    <div class="invite-banner">
      <div class="invite-content">
        <h3>邀好友 赢好礼</h3>
        <p>新朋友可得5次免费排盘机会</p>
      </div>
      <button class="invite-btn" @click="inviteFriend">
        立即邀请
        <span class="invite-arrow">›</span>
      </button>
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
    <div v-if="isAuthenticated" class="logout-section">
      <button @click="handleLogout" class="logout-btn">退出登录</button>
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
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap');

.profile-view {
  min-height: 100vh;
  background: 
    linear-gradient(180deg, #1A1611 0%, #0F0C08 50%, #1A1611 100%);
  font-family: 'Noto Serif SC', serif;
  color: #C4A876;
  position: relative;
}

/* 简约纹理背景 */
.profile-view::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="subtle" patternUnits="userSpaceOnUse" width="40" height="40"><rect width="40" height="40" fill="none"/><line x1="0" y1="20" x2="40" y2="20" stroke="%23C4A876" stroke-width="0.1" opacity="0.05"/><line x1="20" y1="0" x2="20" y2="40" stroke="%23C4A876" stroke-width="0.1" opacity="0.05"/></pattern></defs><rect width="100" height="100" fill="url(%23subtle)"/></svg>');
  pointer-events: none;
  z-index: 0;
}

/* 顶部用户信息区域 - 严肃设计 */
.header-section {
  background: 
    linear-gradient(135deg, 
      rgba(47, 40, 32, 0.8) 0%,
      rgba(31, 26, 20, 0.9) 100%
    );
  border-bottom: 1px solid rgba(196, 168, 118, 0.2);
  padding: 28px 20px 32px;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.5);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-top h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #C4A876;
  letter-spacing: 3px;
  position: relative;
}

.header-top h1::after {
  content: '✦';
  position: absolute;
  right: -20px;
  top: -5px;
  font-size: 14px;
  color: #C4A876;
  animation: twinkle 2s ease-in-out infinite;
}

@keyframes twinkle {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

.header-checkin-btn {
  background: rgba(196, 168, 118, 0.1);
  border: 1px solid rgba(196, 168, 118, 0.3);
  border-radius: 4px;
  padding: 8px 18px;
  color: #C4A876;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.header-checkin-btn:hover:not(:disabled) {
  background: rgba(196, 168, 118, 0.15);
  border-color: rgba(196, 168, 118, 0.4);
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
  padding: 12px 16px;
  border-radius: 8px;
  background: rgba(196, 168, 118, 0.03);
  border: 1px solid rgba(196, 168, 118, 0.08);
}

.user-profile:hover, .guest-profile:hover {
  background: rgba(196, 168, 118, 0.06);
  border-color: rgba(196, 168, 118, 0.15);
}

.user-avatar, .guest-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: 
    linear-gradient(135deg, rgba(196, 168, 118, 0.2), rgba(196, 168, 118, 0.1));
  border: 2px solid rgba(196, 168, 118, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #C4A876;
  font-size: 20px;
  font-weight: 600;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.user-avatar, .guest-avatar {
  position: relative;
}

.user-name, .guest-name {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #C4A876;
}

.user-level, .guest-desc {
  font-size: 14px;
  color: rgba(196, 168, 118, 0.7);
}

.profile-arrow {
  font-size: 16px;
  color: rgba(196, 168, 118, 0.5);
  transition: all 0.3s ease;
}

.user-profile:hover .profile-arrow, .guest-profile:hover .profile-arrow {
  color: rgba(196, 168, 118, 0.8);
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

/* 邀请横幅 - 简洁设计 */
.invite-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.invite-banner::before {
  content: '❋';
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 12px;
  color: rgba(212, 175, 55, 0.4);
}

.invite-banner::after {
  content: '❋';
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 12px;
  color: rgba(212, 175, 55, 0.4);
}

.invite-content h3 {
  color: #C4A876;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px 0;
  letter-spacing: 1px;
}

.invite-content p {
  color: rgba(196, 168, 118, 0.7);
  font-size: 13px;
  margin: 0;
  line-height: 1.4;
}

.invite-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(196, 168, 118, 0.08);
  border: 1px solid rgba(196, 168, 118, 0.2);
  border-radius: 6px;
  padding: 10px 16px;
  color: #C4A876;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.invite-btn:hover {
  background: rgba(196, 168, 118, 0.12);
  border-color: rgba(196, 168, 118, 0.3);
}

/* 快捷功能 - 简洁设计 */
.quick-actions {
  display: flex;
  justify-content: space-around;
  background: 
    linear-gradient(135deg, 
      rgba(47, 40, 32, 0.6) 0%,
      rgba(31, 26, 20, 0.7) 100%
    );
  border: 1px solid rgba(196, 168, 118, 0.15);
  border-radius: 12px;
  margin: 0 16px 20px;
  padding: 24px 20px;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  padding: 12px;
  border-radius: 8px;
}

.action-item:hover {
  background: rgba(196, 168, 118, 0.05);
}

.action-icon {
  width: 36px;
  height: 36px;
  color: #C4A876;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(196, 168, 118, 0.2);
  border-radius: 50%;
  background: rgba(196, 168, 118, 0.03);
  transition: all 0.3s ease;
}

.action-item:hover .action-icon {
  border-color: rgba(196, 168, 118, 0.3);
  background: rgba(196, 168, 118, 0.06);
}

.action-item span {
  color: #C4A876;
  font-size: 13px;
  text-align: center;
  font-weight: 500;
}

/* 更多服务 - 严肃设计 */
.service-card {
  background: 
    linear-gradient(135deg, 
      rgba(47, 40, 32, 0.7) 0%,
      rgba(31, 26, 20, 0.8) 100%
    );
  border: 1px solid rgba(196, 168, 118, 0.2);
  margin: 0 16px;
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #D4AF37, transparent);
}

.service-header {
  background: 
    linear-gradient(135deg, rgba(196, 168, 118, 0.15), rgba(196, 168, 118, 0.1));
  color: #C4A876;
  padding: 16px 20px;
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(196, 168, 118, 0.1);
}

.service-header::before {
  content: '◆';
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  opacity: 0.7;
}

.service-header::after {
  content: '◆';
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  opacity: 0.7;
}

.service-item {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(196, 168, 118, 0.08);
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.1);
}

.service-item:hover {
  background: rgba(196, 168, 118, 0.05);
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
  color: rgba(196, 168, 118, 0.8);
}

.service-name {
  flex: 1;
  color: #C4A876;
  font-size: 15px;
  font-weight: 500;
}

.service-arrow {
  color: rgba(196, 168, 118, 0.5);
  font-size: 16px;
  transition: all 0.3s ease;
}

.service-item:hover .service-arrow {
  color: rgba(196, 168, 118, 0.8);
}

/* 退出登录 - 严肃设计 */
.logout-section {
  padding: 24px 16px;
}

.logout-btn {
  width: 100%;
  background: rgba(139, 69, 19, 0.2);
  border: 1px solid rgba(205, 92, 92, 0.4);
  border-radius: 8px;
  padding: 14px;
  color: rgba(205, 92, 92, 0.9);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.logout-btn:hover {
  background: rgba(139, 69, 19, 0.3);
  border-color: rgba(205, 92, 92, 0.6);
  color: #CD5C5C;
}

/* 消息提示 - 简洁设计 */
.message {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  z-index: 1000;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: fadeInOut 3s ease-in-out;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.message.success {
  background: rgba(46, 125, 50, 0.9);
  border-color: rgba(46, 125, 50, 0.3);
  color: #E8F5E8;
}

.message.error {
  background: rgba(211, 47, 47, 0.9);
  border-color: rgba(211, 47, 47, 0.3);
  color: #FFEBEE;
}

.message.info {
  background: rgba(196, 168, 118, 0.9);
  border-color: rgba(196, 168, 118, 0.3);
  color: #1A1611;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .header-section {
    padding: 24px 16px 28px;
  }
  
  .header-top h1 {
    font-size: 22px;
    letter-spacing: 2px;
  }
  
  .simple-card, .invite-banner, .quick-actions, .service-card {
    margin: 16px 12px;
    padding: 16px;
  }
  
  .logout-section {
    padding: 20px 12px;
  }
}

@media (max-width: 375px) {
  .header-top h1 {
    font-size: 20px;
    letter-spacing: 1.5px;
  }
  
  .header-checkin-btn {
    padding: 6px 14px;
    font-size: 12px;
  }
  
  .action-item span {
    font-size: 12px;
  }
  
  .service-name {
    font-size: 14px;
  }
  
  .simple-card, .invite-banner, .quick-actions, .service-card {
    margin: 12px 8px;
    padding: 12px;
  }
}

/* 移除过多动画效果，保持庄重 */
* {
  transition-duration: 0.3s !important;
}

/* 简约的悬停效果 */
.header-section, .simple-card, .invite-banner, .quick-actions, .service-card {
  transition: all 0.3s ease;
}

/* 移除浮动动画，保持稳重 */
.profile-view::after {
  display: none;
}
</style> 