<template>
  <div class="auth-view">
    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>
    </div>

    <!-- 主要内容区域 -->
    <div class="auth-container">
      <!-- 顶部Logo和标题 -->
      <div class="header-section">
        <div class="logo-container">
          <div class="logo-symbol">
            <span class="symbol-text">奇</span>
          </div>
        </div>
        <h1 class="app-title">鬼谷奇门</h1>
        <p class="app-subtitle">{{ subtitle }}</p>
      </div>

      <!-- 内容卡片 -->
      <div class="auth-card">
        <slot></slot>
      </div>

      <!-- 底部信息 -->
      <div class="footer-info">
        <p class="terms-text">
          {{ actionText }}即表示同意
          <a href="#" class="terms-link">《用户协议》</a>
          和
          <a href="#" class="terms-link">《隐私政策》</a>
        </p>
        <div class="app-info">
          <span class="version">v1.0.0</span>
          <span class="divider-dot">•</span>
          <span class="company">鬼谷奇门</span>
        </div>
      </div>
    </div>

    <!-- 消息提示 -->
    <div v-if="message" class="message" :class="messageType">
      <div class="message-icon">
        <svg v-if="messageType === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
        <svg v-else-if="messageType === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="8" x2="12.01" y2="8" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <span>{{ message }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  subtitle: {
    type: String,
    default: '探索古老智慧，洞察天机玄妙'
  },
  actionText: {
    type: String,
    default: '使用'
  },
  message: String,
  messageType: {
    type: String,
    default: 'info'
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&display=swap');

.auth-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #1A1611 0%, #0F0C08 50%, #1A1611 100%);
  font-family: 'Noto Serif SC', serif;
  color: #C4A876;
  position: relative;
  overflow-x: hidden;
}

.background-decoration {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 0;
}

.decoration-circle {
  position: absolute;
  border: 1px solid rgba(196, 168, 118, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  right: -50px;
  animation-delay: 0s;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: -30px;
  animation-delay: 2s;
}

.circle-3 {
  width: 100px;
  height: 100px;
  top: 60%;
  right: 20px;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.3; }
  50% { transform: translateY(-20px) rotate(180deg); opacity: 0.6; }
}

.auth-container {
  position: relative;
  z-index: 1;
  max-width: 400px;
  margin: 0 auto;
  padding: 40px 20px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.header-section {
  text-align: center;
  margin-bottom: 40px;
}

.logo-container {
  margin-bottom: 20px;
}

.logo-symbol {
  position: relative;
  display: inline-block;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(196, 168, 118, 0.2), rgba(196, 168, 118, 0.1));
  border: 2px solid rgba(196, 168, 118, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 0 20px rgba(196, 168, 118, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.2);
}

.symbol-text {
  font-size: 32px;
  font-weight: 700;
  color: #C4A876;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.app-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #C4A876;
  letter-spacing: 4px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.app-subtitle {
  font-size: 14px;
  color: rgba(196, 168, 118, 0.7);
  margin: 0;
  letter-spacing: 1px;
  line-height: 1.5;
}

.auth-card {
  background: linear-gradient(135deg, 
    rgba(47, 40, 32, 0.8) 0%,
    rgba(31, 26, 20, 0.9) 100%
  );
  border: 1px solid rgba(196, 168, 118, 0.2);
  border-radius: 16px;
  padding: 32px 28px;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(196, 168, 118, 0.1);
  margin-bottom: 24px;
}

.footer-info {
  text-align: center;
  margin-top: 32px;
  color: rgba(196, 168, 118, 0.5);
}

.terms-text {
  font-size: 12px;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.terms-link {
  color: rgba(196, 168, 118, 0.7);
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #C4A876;
}

.app-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
}

.divider-dot {
  opacity: 0.5;
}

.message {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
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
  .auth-container {
    padding: 32px 16px;
  }
  
  .header-section {
    margin-bottom: 32px;
  }
  
  .app-title {
    font-size: 24px;
    letter-spacing: 3px;
  }
  
  .auth-card {
    padding: 24px 20px;
  }
}

@media (max-width: 375px) {
  .auth-container {
    padding: 24px 12px;
  }
  
  .app-title {
    font-size: 22px;
    letter-spacing: 2px;
  }
  
  .auth-card {
    padding: 20px 16px;
  }
}
</style>