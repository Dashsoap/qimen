<template>
  <div class="settings-container">
    <!-- 页面标题 -->
    <div class="settings-header">
      <h1 class="settings-title">设置</h1>
      <p class="settings-subtitle">个性化您的应用体验</p>
    </div>

    <!-- 设置内容 -->
    <div class="settings-content">
      <!-- 主题设置区域 -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">主题设置</h2>
          <p class="section-description">选择您喜欢的界面主题</p>
        </div>
        
        <div class="theme-setting-card">
          <!-- 主题切换组件 -->
          <div class="theme-toggle-section">
            <div class="theme-info">
              <h3 class="theme-label">界面主题</h3>
              <p class="theme-desc">{{ currentThemeConfig.description }}</p>
            </div>
            
            <div class="theme-toggle-wrapper">
              <button 
                class="theme-toggle-btn"
                :class="{ 'light-mode': isLight }"
                @click="handleToggle"
                :title="isLight ? '切换到夜间模式' : '切换到日间模式'"
              >
                <!-- 背景动画圆环 -->
                <div class="toggle-bg"></div>
                
                <!-- 图标容器 -->
                <div class="toggle-icon-container">
                  <!-- 太阳图标 -->
                  <div class="sun-icon" :class="{ active: isLight }">
                    <div class="sun-center"></div>
                    <div class="sun-rays">
                      <div v-for="i in 8" :key="i" class="sun-ray" :style="{ transform: `rotate(${i * 45}deg)` }"></div>
                    </div>
                  </div>
                  
                  <!-- 月亮图标 -->
                  <div class="moon-icon" :class="{ active: isDark }">
                    <div class="moon-body"></div>
                    <div class="moon-crater crater-1"></div>
                    <div class="moon-crater crater-2"></div>
                    <div class="moon-crater crater-3"></div>
                  </div>
                </div>
                
                <!-- 神秘光效 -->
                <div class="mystical-glow"></div>
              </button>
              
              <div class="theme-status">
                <span class="current-theme">{{ currentThemeConfig.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 其他设置区域 -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">应用设置</h2>
          <p class="section-description">配置应用的基本功能</p>
        </div>
        
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-label">通知设置</h3>
              <p class="setting-desc">管理推送通知和提醒</p>
            </div>
            <div class="setting-control">
              <span class="setting-status">开发中...</span>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-label">数据同步</h3>
              <p class="setting-desc">云端数据同步设置</p>
            </div>
            <div class="setting-control">
              <span class="setting-status">开发中...</span>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-label">隐私设置</h3>
              <p class="setting-desc">管理您的隐私和数据安全</p>
            </div>
            <div class="setting-control">
              <span class="setting-status">开发中...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 关于区域 -->
      <div class="settings-section">
        <div class="section-header">
          <h2 class="section-title">关于应用</h2>
          <p class="section-description">应用信息和帮助</p>
        </div>
        
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-label">版本信息</h3>
              <p class="setting-desc">当前版本：v1.0.0</p>
            </div>
          </div>
          
          <div class="setting-item">
            <div class="setting-info">
              <h3 class="setting-label">帮助与反馈</h3>
              <p class="setting-desc">获取帮助或提供反馈</p>
            </div>
            <div class="setting-control">
              <span class="setting-status">开发中...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const { isDark, isLight, currentThemeConfig, toggleTheme } = themeStore

function handleToggle() {
  toggleTheme()
  
  // 添加点击动画效果
  const btn = document.querySelector('.theme-toggle-btn')
  if (btn) {
    btn.classList.add('clicked')
    setTimeout(() => {
      btn.classList.remove('clicked')
    }, 300)
  }
}
</script>

<style scoped>
.settings-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
}

.settings-header {
  text-align: center;
  margin-bottom: 40px;
  padding-top: 20px;
}

.settings-title {
  font-size: 2.5rem;
  color: var(--theme-primary);
  margin: 0 0 10px 0;
  font-weight: 700;
  text-shadow: 0 2px 4px var(--theme-shadow);
  background: linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.settings-subtitle {
  font-size: 1.1rem;
  color: var(--theme-text-muted);
  margin: 0;
  font-weight: 400;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.settings-section {
  background: var(--theme-surface);
  border: 1px solid var(--theme-border);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px var(--theme-shadow);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.settings-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px var(--theme-shadow);
  border-color: var(--theme-border-hover);
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--theme-border);
}

.section-title {
  font-size: 1.4rem;
  color: var(--theme-primary);
  margin: 0 0 8px 0;
  font-weight: 600;
}

.section-description {
  font-size: 0.95rem;
  color: var(--theme-text-muted);
  margin: 0;
}

/* 主题设置卡片 */
.theme-setting-card {
  background: var(--theme-background-soft);
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
}

.theme-setting-card:hover {
  border-color: var(--theme-primary);
  box-shadow: 0 4px 16px var(--theme-glow);
}

.theme-toggle-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.theme-info {
  flex: 1;
}

.theme-label {
  font-size: 1.1rem;
  color: var(--theme-text);
  margin: 0 0 8px 0;
  font-weight: 600;
}

.theme-desc {
  font-size: 0.9rem;
  color: var(--theme-text-muted);
  margin: 0;
  line-height: 1.4;
}

.theme-toggle-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.theme-toggle-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.theme-toggle-btn.light-mode {
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--theme-border-hover);
  box-shadow: 0 4px 16px var(--theme-shadow);
}

.theme-toggle-btn:hover {
  transform: translateY(-2px);
  border-color: var(--theme-primary);
  box-shadow: 
    0 8px 25px var(--theme-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.theme-toggle-btn.clicked {
  transform: scale(0.95);
  transition: transform 0.15s ease;
}

.toggle-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(212, 175, 55, 0.1), 
    rgba(139, 69, 19, 0.05)
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.theme-toggle-btn:hover .toggle-bg {
  opacity: 1;
}

.toggle-icon-container {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 太阳图标样式 */
.sun-icon {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  transform: scale(0.5) rotate(-180deg);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.sun-icon.active {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.sun-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ffd700, #daa520);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
}

.sun-rays {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  transform: translate(-50%, -50%);
}

.sun-ray {
  position: absolute;
  top: 2px;
  left: 50%;
  width: 3px;
  height: 10px;
  background: linear-gradient(to bottom, #ffd700, transparent);
  border-radius: 2px;
  transform-origin: 50% 18px;
  animation: sunRayRotate 4s linear infinite;
}

/* 月亮图标样式 */
.moon-icon {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 1;
  transform: scale(1) rotate(0deg);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.moon-icon.active {
  opacity: 1;
  transform: scale(1) rotate(0deg);
}

.theme-toggle-btn.light-mode .moon-icon {
  opacity: 0;
  transform: scale(0.5) rotate(180deg);
}

.moon-body {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #d4af37, #b8860b);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 
    0 0 15px rgba(212, 175, 55, 0.5),
    inset -4px -4px 0 rgba(0, 0, 0, 0.1);
}

.moon-crater {
  position: absolute;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 50%;
}

.crater-1 {
  top: 8px;
  left: 10px;
  width: 4px;
  height: 4px;
}

.crater-2 {
  top: 14px;
  left: 6px;
  width: 3px;
  height: 3px;
}

.crater-3 {
  top: 12px;
  left: 14px;
  width: 2px;
  height: 2px;
}

/* 神秘光效 */
.mystical-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle, var(--theme-glow) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.4s ease;
  pointer-events: none;
}

.theme-toggle-btn:hover .mystical-glow {
  width: 80px;
  height: 80px;
}

.theme-status {
  text-align: center;
}

.current-theme {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--theme-primary);
  letter-spacing: 0.5px;
}

/* 设置列表 */
.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--theme-background-soft);
  border: 1px solid var(--theme-border);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.setting-item:hover {
  border-color: var(--theme-border-hover);
  transform: translateX(4px);
  box-shadow: 0 2px 8px var(--theme-shadow);
}

.setting-info {
  flex: 1;
}

.setting-label {
  font-size: 1rem;
  color: var(--theme-text);
  margin: 0 0 4px 0;
  font-weight: 600;
}

.setting-desc {
  font-size: 0.85rem;
  color: var(--theme-text-muted);
  margin: 0;
  line-height: 1.4;
}

.setting-control {
  display: flex;
  align-items: center;
}

.setting-status {
  font-size: 0.85rem;
  color: var(--theme-text-muted);
  font-style: italic;
}

/* 动画效果 */
@keyframes sunRayRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-container {
    padding: 15px;
  }
  
  .settings-title {
    font-size: 2rem;
  }
  
  .theme-toggle-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 16px;
  }
  
  .theme-toggle-btn {
    width: 70px;
    height: 70px;
  }
  
  .toggle-icon-container {
    width: 35px;
    height: 35px;
  }
  
  .sun-center {
    width: 18px;
    height: 18px;
  }
  
  .moon-body {
    width: 22px;
    height: 22px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .setting-control {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .settings-section {
    padding: 16px;
  }
  
  .theme-toggle-btn {
    width: 60px;
    height: 60px;
  }
  
  .toggle-icon-container {
    width: 30px;
    height: 30px;
  }
  
  .sun-center {
    width: 16px;
    height: 16px;
  }
  
  .moon-body {
    width: 20px;
    height: 20px;
  }
}
</style>