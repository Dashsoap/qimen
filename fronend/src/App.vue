<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
import performanceManager from './utils/performance.js'

onMounted(() => {
  // 性能管理器会自动处理页面可见性和内存管理
  performanceManager.addObserver((event, data) => {
    console.log(`性能事件: ${event}`, data)
  })
})

onUnmounted(() => {
  // 清理性能管理器
  performanceManager.destroy()
})
</script>

<template>
  <div class="app-container">
    <!-- 主内容区域 -->
    <main class="main-content">
      <RouterView />
    </main>

    <!-- 神秘底部导航栏 -->
    <nav class="mystical-nav">
      <!-- 背景装饰 -->
      <div class="nav-bg-effect"></div>
      <div class="nav-particles"></div>
      
      <RouterLink to="/home" class="nav-item" active-class="active">
        <div class="nav-icon-wrapper">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="nav-glow"></div>
        </div>
        <span class="nav-text">首页</span>
      </RouterLink>

      <RouterLink to="/qimen" class="nav-item mystical-highlight" active-class="active">
        <div class="nav-icon-wrapper">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M12 1V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 21V23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M4.22 4.22L5.64 5.64" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M18.36 18.36L19.78 19.78" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M1 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M21 12H23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M4.22 19.78L5.64 18.36" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="nav-glow mystical-glow"></div>
        </div>
        <span class="nav-text">奇门</span>
      </RouterLink>

      <RouterLink to="/about" class="nav-item" active-class="active">
        <div class="nav-icon-wrapper">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="nav-glow"></div>
        </div>
        <span class="nav-text">关于</span>
      </RouterLink>

      <RouterLink to="/profile" class="nav-item" active-class="active">
        <div class="nav-icon-wrapper">
          <div class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="nav-glow"></div>
        </div>
        <span class="nav-text">我的</span>
      </RouterLink>
    </nav>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(180deg, #000000 0%, #0a0a0a 50%, #000000 100%);
  position: relative;
}

.app-container::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(212, 175, 55, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(139, 69, 19, 0.02) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(75, 0, 130, 0.01) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 90px;
  position: relative;
  z-index: 1;
}

/* 神秘底部导航栏 */
.mystical-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, 
    rgba(0, 0, 0, 0.98) 0%, 
    rgba(10, 10, 10, 0.98) 50%, 
    rgba(0, 0, 0, 0.98) 100%
  );
  backdrop-filter: blur(20px) saturate(180%);
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 8px 12px 8px;
  z-index: 1000;
  box-shadow: 
    0 -8px 32px rgba(0, 0, 0, 0.8),
    0 -1px 0 rgba(212, 175, 55, 0.1),
    inset 0 1px 0 rgba(212, 175, 55, 0.1);
  position: relative;
  overflow: hidden;
}

.nav-bg-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(212, 175, 55, 0.02) 25%, 
    rgba(139, 69, 19, 0.02) 50%,
    rgba(212, 175, 55, 0.02) 75%, 
    transparent 100%
  );
  animation: mysticalShimmer 8s infinite ease-in-out;
}

.nav-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(1px 1px at 20% 30%, rgba(212, 175, 55, 0.3), transparent),
    radial-gradient(1px 1px at 40% 70%, rgba(139, 69, 19, 0.2), transparent),
    radial-gradient(1px 1px at 60% 40%, rgba(212, 175, 55, 0.3), transparent),
    radial-gradient(1px 1px at 80% 80%, rgba(139, 69, 19, 0.2), transparent);
  background-size: 100px 100px, 120px 120px, 80px 80px, 150px 150px;
  animation: floatingParticles 20s infinite linear;
  opacity: 0.6;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  text-decoration: none;
  color: rgba(212, 175, 55, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
  min-width: 64px;
  position: relative;
  z-index: 2;
}

.nav-icon-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}

.nav-icon {
  width: 24px;
  height: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.nav-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
}

.mystical-glow {
  background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, rgba(212, 175, 55, 0.3) 50%, transparent 70%);
  animation: mysticalPulse 3s infinite ease-in-out;
}

.nav-text {
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.5px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 悬停效果 */
.nav-item:hover {
  color: rgba(212, 175, 55, 0.9);
  transform: translateY(-2px);
}

.nav-item:hover .nav-icon {
  transform: scale(1.2) rotate(5deg);
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.5));
}

.nav-item:hover .nav-glow {
  width: 40px;
  height: 40px;
  opacity: 1;
}

/* 激活状态 */
.nav-item.active {
  color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  box-shadow: 
    0 4px 16px rgba(212, 175, 55, 0.2),
    inset 0 1px 0 rgba(212, 175, 55, 0.2);
}

.nav-item.active .nav-icon {
  transform: scale(1.15);
  color: #ffd700;
  filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.6));
}

.nav-item.active .nav-glow {
  width: 48px;
  height: 48px;
  opacity: 1;
}

.nav-item.active .nav-text {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.3);
}

/* 奇门页面特殊效果 */
.mystical-highlight:hover {
  color: #ffd700;
}

.mystical-highlight.active {
  background: linear-gradient(135deg, 
    rgba(255, 215, 0, 0.15) 0%, 
    rgba(212, 175, 55, 0.1) 100%
  );
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 
    0 4px 20px rgba(255, 215, 0, 0.3),
    inset 0 1px 0 rgba(255, 215, 0, 0.3);
}

.mystical-highlight.active .nav-icon {
  animation: mysticalRotate 4s infinite linear;
  color: #ffd700;
  filter: drop-shadow(0 0 16px rgba(255, 215, 0, 0.8));
}

/* 动画效果 */
@keyframes mysticalShimmer {
  0%, 100% { opacity: 0.3; transform: translateX(-100%); }
  50% { opacity: 0.8; transform: translateX(100%); }
}

@keyframes floatingParticles {
  0% { transform: translateY(0) rotate(0deg); }
  100% { transform: translateY(-10px) rotate(360deg); }
}

@keyframes mysticalPulse {
  0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
}

@keyframes mysticalRotate {
  0% { transform: scale(1.15) rotate(0deg); }
  100% { transform: scale(1.15) rotate(360deg); }
}

/* 安全区域适配 */
@supports (padding: max(0px)) {
  .mystical-nav {
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}

/* 响应式调整 */
@media (max-width: 480px) {
  .nav-item {
    padding: 6px 8px;
    min-width: 56px;
  }
  
  .nav-icon-wrapper {
    width: 28px;
    height: 28px;
  }
  
  .nav-icon {
    width: 20px;
    height: 20px;
  }
  
  .nav-text {
    font-size: 10px;
  }
}

/* 平板横屏优化 */
@media (min-width: 768px) and (orientation: landscape) {
  .mystical-nav {
    max-width: 500px;
    left: 50%;
    transform: translateX(-50%);
    border-radius: 24px 24px 0 0;
    margin-bottom: 0;
  }
}
</style>

<style>
/* 全局神秘主题 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  background: #000000;
  color: #d4af37;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  background: #000000;
}

/* 移除默认样式冲突 */
.router-view-container {
  margin-top: 0 !important;
  padding: 0 !important;
}

/* 自定义滚动条 - 神秘风格 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.8);
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.6), rgba(139, 69, 19, 0.6));
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(255, 215, 0, 0.8), rgba(212, 175, 55, 0.8));
}

/* 性能优化：动画暂停 */
.pause-animations * {
  animation-play-state: paused !important;
  transition: none !important;
}

.pause-animations *::before,
.pause-animations *::after {
  animation-play-state: paused !important;
  transition: none !important;
}

/* 减少动画复杂度以降低内存使用 */
@media (max-width: 768px) {
  .nav-particles {
    opacity: 0.3; /* 降低粒子效果透明度 */
  }
  
  .nav-bg-effect {
    opacity: 0.5; /* 降低背景效果 */
  }
  
  .mystical-glow {
    animation-duration: 6s; /* 减慢动画速度 */
  }
  
  .mystical-highlight.active .nav-icon {
    animation-duration: 8s; /* 减慢旋转动画 */
  }
}

/* 低内存模式：进一步简化效果 */
@media (max-width: 480px) {
  .nav-particles {
    display: none; /* 完全关闭粒子效果 */
  }
  
  .nav-bg-effect {
    display: none; /* 关闭背景效果 */
  }
  
  .app-container::before {
    display: none; /* 关闭复杂背景 */
  }
}
</style>
