<script setup>
import { RouterView } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
import performanceManager from './utils/performance.js'
import { useThemeStore } from './stores/theme'

// 主题管理
const themeStore = useThemeStore()

onMounted(() => {
  // 初始化主题
  themeStore.initTheme()
  
  // 确保body不会产生滚动条
  document.body.style.overflow = 'hidden'
  document.documentElement.style.overflow = 'hidden'
  
  // 性能管理器会自动处理页面可见性和内存管理
  performanceManager.addObserver((event, data) => {
    // 可以在这里处理性能事件
  })
})

onUnmounted(() => {
  // 恢复body滚动
  document.body.style.overflow = ''
  document.documentElement.style.overflow = ''
  
  // 清理性能管理器
  performanceManager.destroy()
})
</script>

<template>
  <div id="app-root">
    <!-- 主内容滚动容器 - 唯一的滚动区域 -->
    <main class="main-scroll-container">
      <RouterView />
    </main>

    <!-- 底部导航栏 -->
    <nav class="bottom-nav">
      <div class="nav-items">
        <router-link to="/home" class="nav-item" active-class="active">
          <div class="nav-icon home-icon">
            <svg width="23" height="22" viewBox="0 0 23 22" fill="none">
              <path d="M11.5 0L23 11H20V22H15V15H8V22H3V11H0L11.5 0Z" fill="currentColor"/>
              <rect x="7.88" y="15.23" width="7.14" height="1.82" fill="#FEFDF7"/>
            </svg>
          </div>
          <span class="nav-text">首页</span>
        </router-link>

        <router-link to="/qimen" class="nav-item" active-class="active">
          <div class="nav-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="currentColor" stroke-width="1.2"/>
              <circle cx="11" cy="11" r="8" fill="rgba(236, 204, 179, 0.3)"/>
              <circle cx="10.21" cy="4.09" r="1.32" fill="currentColor"/>
              <circle cx="9.21" cy="14.82" r="1.32" fill="currentColor"/>
              <rect x="5.89" y="0.01" width="11.25" height="21.99" stroke="currentColor"/>
            </svg>
          </div>
          <span class="nav-text">奇门</span>
        </router-link>

        <router-link to="/settings" class="nav-item" active-class="active">
          <div class="nav-icon">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="currentColor" stroke-width="1.2"/>
              <line x1="10.5" y1="6.5" x2="10.5" y2="10" stroke="currentColor" stroke-width="1.1"/>
              <circle cx="11" cy="6.5" r="0.5" stroke="currentColor" stroke-width="1.1"/>
            </svg>
          </div>
          <span class="nav-text">设置</span>
        </router-link>

        <router-link to="/profile" class="nav-item" active-class="active">
          <div class="nav-icon">
            <svg width="21.5" height="21.5" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="currentColor" stroke-width="1.2"/>
              <path d="M8.01 10.75C8.01 10.75 11.34 10.75 14.67 10.75" stroke="currentColor" stroke-width="1.2"/>
            </svg>
          </div>
          <span class="nav-text">我的</span>
        </router-link>
      </div>
    </nav>
  </div>
</template>

<style scoped>
/* 根容器 - 固定视口高度，不产生滚动 */
#app-root {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: #FEFDF7;
  background-image: url('@/assets/img/bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  overflow: hidden; /* 防止根容器滚动 */
}



/* 主内容滚动容器 - 唯一的滚动区域 */
.main-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  z-index: 1;
  /* 为底部导航栏留出空间 */
  padding-bottom: 90px;
  /* 优化滚动性能 */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* 底部导航栏 - 固定在底部 */
.bottom-nav {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(249, 243, 233, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(211, 132, 78, 0.1);
  z-index: 1000;
}

.nav-items {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 8px 0 4px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-decoration: none;
  color: rgba(117, 60, 21, 0.6);
  transition: all 0.2s ease;
  padding: 8px 12px;
  border-radius: 12px;
}

.nav-item.active {
  color: #D3844E;
  background: rgba(211, 132, 78, 0.1);
}

.nav-item.active .home-icon {
  background: #D3844E;
  color: #FEFDF7;
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-icon {
  border-radius: 6px;
  padding: 2px;
}

.nav-text {
  font-family: 'PingFang SC', sans-serif;
  font-size: 10px;
  font-weight: 500;
}

</style>

<style>
/* 全局样式重置和优化 */
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden; /* 防止body产生滚动条 */
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', sans-serif;
  background: #FEFDF7;
  background-image: url('@/assets/img/bg.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  color: #753C15;
}

#app {
  height: 100vh;
  overflow: hidden; /* 防止app容器滚动 */
  background: transparent; /* 让背景图透过 */
}


/* 自定义滚动条 - 更美观的设计 */
.main-scroll-container::-webkit-scrollbar {
  width: 3px;
}

.main-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.main-scroll-container::-webkit-scrollbar-thumb {
  background: rgba(211, 132, 78, 0.3);
  border-radius: 2px;
  transition: background 0.2s ease;
}

.main-scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(211, 132, 78, 0.5);
}

/* 移动端隐藏滚动条 */
@media (max-width: 768px) {
  .main-scroll-container::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
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
</style>