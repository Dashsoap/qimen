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

        <!-- 积分和签到区域 -->
        <div class="points-section">
          <div class="points-display">
            <div class="points-card">
              <div class="points-header">
                <h4>💰 我的积分</h4>
                <button @click="refreshPoints" class="refresh-btn" :disabled="isLoading">
                  <span v-if="isLoading">刷新中...</span>
                  <span v-else>刷新</span>
                </button>
              </div>
              <div class="points-balance">
                <span class="balance-number">{{ userPoints?.balance || 0 }}</span>
                <span class="balance-label">积分</span>
              </div>
              <div class="points-stats">
                <div class="stat-item">
                  <span class="stat-label">总获得</span>
                  <span class="stat-value">{{ userPoints?.totalEarned || 0 }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">总消费</span>
                  <span class="stat-value">{{ userPoints?.totalSpent || 0 }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 签到区域 -->
          <div class="checkin-section">
            <div class="checkin-card">
              <div class="checkin-header">
                <h4>📅 每日签到</h4>
                <span class="streak-badge">连续{{ checkinStatus?.continuousStreak || 0 }}天</span>
              </div>
              <div class="checkin-content">
                <div v-if="checkinStatus?.isCheckedIn" class="checked-in">
                  <div class="checkin-icon">✅</div>
                  <div class="checkin-text">
                    <p>今日已签到</p>
                    <p class="checkin-time">{{ formatTime(checkinStatus.checkinTime) }}</p>
                  </div>
                </div>
                <div v-else class="not-checked-in">
                  <button @click="doCheckin" class="checkin-btn" :disabled="isCheckinLoading">
                    <span v-if="isCheckinLoading">签到中...</span>
                    <span v-else>签到领取 +{{ checkinStatus?.todayBonus || 10 }}积分</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
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

      <!-- 个人命理档案 -->
      <div v-if="isAuthenticated" class="divination-profile">
        <div class="profile-section">
          <h4>📊 个人命理档案</h4>
          <div class="profile-info">
            <div class="profile-form">
              <div class="form-group">
                <label>出生年份</label>
                <select v-model="personalInfo.birthYear" @change="updateProfile">
                  <option value="">请选择</option>
                  <option v-for="year in getYearOptions()" :key="year" :value="year">
                    {{ year }}年
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>出生月份</label>
                <select v-model="personalInfo.birthMonth" @change="updateProfile">
                  <option value="">请选择</option>
                  <option v-for="month in 12" :key="month" :value="month">
                    {{ month }}月
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>出生日期</label>
                <select v-model="personalInfo.birthDay" @change="updateProfile">
                  <option value="">请选择</option>
                  <option v-for="day in getDayOptions()" :key="day" :value="day">
                    {{ day }}日
                  </option>
                </select>
              </div>
              
              <div class="form-group">
                <label>出生时辰</label>
                <select v-model="personalInfo.birthHour" @change="updateProfile">
                  <option value="">请选择</option>
                  <option v-for="(time, index) in hourOptions" :key="index" :value="index">
                    {{ time }}
                  </option>
                </select>
              </div>
            </div>
            
            <div v-if="isProfileComplete" class="destiny-analysis">
              <h5>命理分析</h5>
              <div class="analysis-grid">
                <div class="analysis-item">
                  <span class="analysis-label">生肖</span>
                  <span class="analysis-value">{{ destinyInfo.zodiac }}</span>
                </div>
                <div class="analysis-item">
                  <span class="analysis-label">五行</span>
                  <span class="analysis-value">{{ destinyInfo.element }}</span>
                </div>
                <div class="analysis-item">
                  <span class="analysis-label">属性</span>
                  <span class="analysis-value">{{ destinyInfo.attribute }}</span>
                </div>
                <div class="analysis-item">
                  <span class="analysis-label">宜忌</span>
                  <span class="analysis-value">{{ destinyInfo.suitable }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 历史运势变化 -->
        <div class="fortune-history">
          <h4>📈 历史运势变化</h4>
          <div class="history-chart">
            <div class="chart-container">
              <div class="chart-header">
                <span>运势指数</span>
                <div class="chart-legend">
                  <div class="legend-item">
                    <div class="legend-color overall"></div>
                    <span>总体运势</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color career"></div>
                    <span>事业运</span>
                  </div>
                  <div class="legend-item">
                    <div class="legend-color wealth"></div>
                    <span>财运</span>
                  </div>
                </div>
              </div>
              <div class="chart-content">
                <div v-for="(month, index) in fortuneHistory" :key="index" class="chart-month">
                  <div class="month-label">{{ month.month }}</div>
                  <div class="bars">
                    <div class="bar overall" :style="{ height: month.overall + '%' }"></div>
                    <div class="bar career" :style="{ height: month.career + '%' }"></div>
                    <div class="bar wealth" :style="{ height: month.wealth + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 个性化建议 -->
        <div class="personalized-advice">
          <h4>💡 个性化建议</h4>
          <div class="advice-cards">
            <div class="advice-card">
              <div class="advice-header">
                <span class="advice-icon">🎯</span>
                <h5>近期建议</h5>
              </div>
              <div class="advice-content">
                <p>{{ currentAdvice.recent }}</p>
              </div>
            </div>
            
            <div class="advice-card">
              <div class="advice-header">
                <span class="advice-icon">⚠️</span>
                <h5>注意事项</h5>
              </div>
              <div class="advice-content">
                <p>{{ currentAdvice.warning }}</p>
              </div>
            </div>
            
            <div class="advice-card">
              <div class="advice-header">
                <span class="advice-icon">🔮</span>
                <h5>问卜方向</h5>
              </div>
              <div class="advice-content">
                <p>{{ currentAdvice.direction }}</p>
              </div>
            </div>
          </div>
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

// 个人命理档案数据
const personalInfo = ref({
  birthYear: '',
  birthMonth: '',
  birthDay: '',
  birthHour: ''
})

// 时辰选项
const hourOptions = [
  '子时 (23:00-01:00)',
  '丑时 (01:00-03:00)',
  '寅时 (03:00-05:00)',
  '卯时 (05:00-07:00)',
  '辰时 (07:00-09:00)',
  '巳时 (09:00-11:00)',
  '午时 (11:00-13:00)',
  '未时 (13:00-15:00)',
  '申时 (15:00-17:00)',
  '酉时 (17:00-19:00)',
  '戌时 (19:00-21:00)',
  '亥时 (21:00-23:00)'
]

// 命理分析结果
const destinyInfo = ref({
  zodiac: '',
  element: '',
  attribute: '',
  suitable: ''
})

// 历史运势数据
const fortuneHistory = ref([])

// 个性化建议
const currentAdvice = ref({
  recent: '',
  warning: '',
  direction: ''
})

// 计算属性
const isProfileComplete = computed(() => {
  return personalInfo.value.birthYear && 
         personalInfo.value.birthMonth && 
         personalInfo.value.birthDay && 
         personalInfo.value.birthHour !== ''
})

// 获取年份选项
const getYearOptions = () => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear - 80; year <= currentYear; year++) {
    years.push(year)
  }
  return years.reverse()
}

// 获取日期选项
const getDayOptions = () => {
  if (!personalInfo.value.birthMonth || !personalInfo.value.birthYear) return []
  const month = parseInt(personalInfo.value.birthMonth)
  const year = parseInt(personalInfo.value.birthYear)
  const daysInMonth = new Date(year, month, 0).getDate()
  const days = []
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }
  return days
}

// 更新个人档案
const updateProfile = () => {
  if (isProfileComplete.value) {
    calculateDestiny()
    generateFortuneHistory()
    generatePersonalizedAdvice()
  }
}

// 计算命理信息
const calculateDestiny = () => {
  const year = parseInt(personalInfo.value.birthYear)
  const zodiacAnimals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪']
  const zodiacIndex = (year - 1900) % 12
  
  const elements = ['金', '木', '水', '火', '土']
  const attributes = ['阳', '阴']
  const suitables = ['求财', '婚嫁', '出行', '谈判', '学习', '祈福']
  
  destinyInfo.value = {
    zodiac: zodiacAnimals[zodiacIndex],
    element: elements[Math.floor(year / 2) % 5],
    attribute: attributes[year % 2],
    suitable: suitables[Math.floor(year / 10) % 6]
  }
}

// 生成运势历史
const generateFortuneHistory = () => {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const history = []
  
  for (let i = 0; i < 12; i++) {
    const seed = parseInt(personalInfo.value.birthYear) + i
    history.push({
      month: months[i],
      overall: 30 + (seed % 40) + 20,
      career: 25 + ((seed * 2) % 45) + 15,
      wealth: 35 + ((seed * 3) % 35) + 20
    })
  }
  
  fortuneHistory.value = history
}

// 生成个性化建议
const generatePersonalizedAdvice = () => {
  const recentAdvices = [
    '近期宜保持低调，专注于个人提升和积累',
    '适合进行重要决策，但需多方征求意见',
    '人际关系良好，可以寻求合作机会',
    '财运较佳，可考虑适当投资理财',
    '健康需要关注，建议调整作息规律'
  ]
  
  const warnings = [
    '避免与人发生争执，以和为贵',
    '投资需谨慎，切勿盲目跟风',
    '出行注意安全，选择吉利方位',
    '工作中避免锋芒毕露，韬光养晦',
    '情感方面需要更多耐心和理解'
  ]
  
  const directions = [
    '可多问卜事业发展和财运方面的问题',
    '适合咨询人际关系和合作事宜',
    '宜询问健康养生和生活调理',
    '可问卜重要决策的时机选择',
    '适合咨询感情婚姻相关问题'
  ]
  
  const year = parseInt(personalInfo.value.birthYear)
  const index = year % 5
  
  currentAdvice.value = {
    recent: recentAdvices[index],
    warning: warnings[index],
    direction: directions[index]
  }
}

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
    // 同时刷新积分和签到状态
    if (isAuthenticated.value) {
      await Promise.all([
        refreshPoints(),
        refreshCheckinStatus()
      ])
    }
  } else {
    showMessage('刷新失败，请重新登录', 'error')
  }
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
      // 积分记录不存在，显示默认值
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
    // 设置默认值避免显示错误
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
      // 设置默认签到状态
      checkinStatus.value = {
        isCheckedIn: false,
        checkinTime: null,
        continuousStreak: 0,
        todayBonus: 10
      }
    }
  } catch (error) {
    console.error('获取签到状态错误:', error)
    // 设置默认签到状态
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
      
      // 更新状态
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

// 格式化时间显示
const formatTime = (timeString) => {
  if (!timeString) return ''
  const date = new Date(timeString)
  return date.toLocaleString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
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
  
  // 加载积分和签到状态
  if (isAuthenticated.value) {
    await Promise.all([
      refreshPoints(),
      refreshCheckinStatus()
    ])
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

/* 积分和签到区域样式 */
.points-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
}

@media (max-width: 768px) {
  .points-section {
    grid-template-columns: 1fr;
  }
}

.points-card, .checkin-card {
  background: rgba(10, 10, 10, 0.9);
  border: 1px solid #85754e;
  border-radius: 8px;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

.points-card::before, .checkin-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.points-header, .checkin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.points-header h4, .checkin-header h4 {
  margin: 0;
  font-size: 18px;
  color: #d4af37;
  letter-spacing: 2px;
}

.refresh-btn {
  background: transparent;
  border: 1px solid #85754e;
  color: #d4af37;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.points-balance {
  text-align: center;
  margin: 20px 0;
}

.balance-number {
  font-size: 36px;
  font-weight: bold;
  color: #d4af37;
  text-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.balance-label {
  font-size: 14px;
  color: #a38a36;
  margin-left: 5px;
}

.points-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #a38a36;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #d4af37;
}

.streak-badge {
  background: linear-gradient(45deg, #d4af37, #85754e);
  color: #000;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
}

.checkin-content {
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checked-in {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #d4af37;
}

.checkin-icon {
  font-size: 32px;
}

.checkin-text p {
  margin: 0;
  line-height: 1.4;
}

.checkin-text .checkin-time {
  font-size: 12px;
  color: #a38a36;
}

.checkin-btn {
  background: linear-gradient(45deg, #d4af37, #85754e);
  color: #000;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.checkin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.checkin-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.not-checked-in {
  text-align: center;
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

/* 个人命理档案样式 */
.divination-profile {
  position: relative;
  z-index: 1;
  margin-bottom: 30px;
}

.profile-section {
  background-color: rgba(8, 8, 8, 0.9);
  border: 1px solid #85754e;
  border-radius: 2px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.4);
}

.profile-section h4 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: normal;
  color: #d4af37;
  letter-spacing: 3px;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(133, 117, 78, 0.3);
}

.profile-info {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.profile-form {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #d4af37;
  font-size: 14px;
  font-weight: 500;
}

.form-group select {
  background: rgba(10, 10, 10, 0.8);
  border: 1px solid #85754e;
  border-radius: 4px;
  padding: 10px;
  color: #d4af37;
  font-size: 14px;
  font-family: inherit;
}

.form-group select:focus {
  outline: none;
  border-color: #d4af37;
}

.destiny-analysis {
  flex: 1;
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  padding: 20px;
}

.destiny-analysis h5 {
  margin: 0 0 15px 0;
  color: #d4af37;
  font-size: 16px;
  text-align: center;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.analysis-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
}

.analysis-label {
  color: rgba(212, 175, 55, 0.8);
  font-size: 13px;
}

.analysis-value {
  color: #d4af37;
  font-weight: 600;
  font-size: 14px;
}

/* 历史运势变化样式 */
.fortune-history {
  background-color: rgba(8, 8, 8, 0.9);
  border: 1px solid #85754e;
  border-radius: 2px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.4);
}

.fortune-history h4 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: normal;
  color: #d4af37;
  letter-spacing: 3px;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(133, 117, 78, 0.3);
}

.chart-container {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  padding: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-header span {
  color: #d4af37;
  font-weight: 600;
  font-size: 16px;
}

.chart-legend {
  display: flex;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-color.overall {
  background: linear-gradient(45deg, #d4af37, #ffd700);
}

.legend-color.career {
  background: linear-gradient(45deg, #85754e, #d4af37);
}

.legend-color.wealth {
  background: linear-gradient(45deg, #ffd700, #ff8c00);
}

.chart-content {
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: end;
  height: 200px;
}

.chart-month {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.month-label {
  color: #d4af37;
  font-size: 12px;
  margin-bottom: 8px;
}

.bars {
  display: flex;
  gap: 2px;
  align-items: end;
  height: 160px;
}

.bar {
  width: 6px;
  border-radius: 2px 2px 0 0;
  transition: all 0.3s ease;
}

.bar.overall {
  background: linear-gradient(to top, #d4af37, #ffd700);
}

.bar.career {
  background: linear-gradient(to top, #85754e, #d4af37);
}

.bar.wealth {
  background: linear-gradient(to top, #ffd700, #ff8c00);
}

/* 个性化建议样式 */
.personalized-advice {
  background-color: rgba(8, 8, 8, 0.9);
  border: 1px solid #85754e;
  border-radius: 2px;
  padding: 25px;
  margin-bottom: 20px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.4);
}

.personalized-advice h4 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: normal;
  color: #d4af37;
  letter-spacing: 3px;
  text-align: center;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(133, 117, 78, 0.3);
}

.advice-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.advice-card {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
}

.advice-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateY(-2px);
}

.advice-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.advice-icon {
  font-size: 1.2rem;
  filter: drop-shadow(0 0 5px rgba(212, 175, 55, 0.5));
}

.advice-header h5 {
  margin: 0;
  color: #d4af37;
  font-size: 16px;
  font-weight: 600;
}

.advice-content p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  margin: 0;
  font-size: 14px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .profile-info {
    flex-direction: column;
    gap: 20px;
  }
  
  .profile-form {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .analysis-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-content {
    height: 150px;
  }
  
  .bars {
    height: 120px;
  }
  
  .advice-cards {
    grid-template-columns: 1fr;
  }
  
  .chart-legend {
    flex-direction: column;
    gap: 8px;
  }
}
</style> 