<template>
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
      
      <!-- 文字提示 -->
      <span class="toggle-text">{{ currentThemeConfig.name }}</span>
    </button>
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
  btn.classList.add('clicked')
  setTimeout(() => {
    btn.classList.remove('clicked')
  }, 300)
}
</script>

<style scoped>
.theme-toggle-wrapper {
  position: relative;
  z-index: 100;
}

.theme-toggle-btn {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(212, 175, 55, 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  overflow: hidden;
  min-width: 80px;
  min-height: 80px;
  gap: 8px;
}

.theme-toggle-btn.light-mode {
  background: rgba(255, 255, 255, 0.95);
  border-color: var(--theme-border-hover);
  color: var(--theme-text);
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
  width: 32px;
  height: 32px;
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
  width: 16px;
  height: 16px;
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
  width: 2px;
  height: 8px;
  background: linear-gradient(to bottom, #ffd700, transparent);
  border-radius: 1px;
  transform-origin: 50% 14px;
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
  width: 20px;
  height: 20px;
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
  top: 6px;
  left: 8px;
  width: 3px;
  height: 3px;
}

.crater-2 {
  top: 12px;
  left: 4px;
  width: 2px;
  height: 2px;
}

.crater-3 {
  top: 10px;
  left: 12px;
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
  width: 60px;
  height: 60px;
}

/* 文字提示 */
.toggle-text {
  font-size: 11px;
  font-weight: 500;
  color: var(--theme-primary);
  letter-spacing: 0.5px;
  text-align: center;
  transition: color 0.3s ease;
  user-select: none;
}

.theme-toggle-btn.light-mode .toggle-text {
  color: var(--theme-primary);
}

/* 动画效果 */
@keyframes sunRayRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 移动端优化 */
@media (max-width: 768px) {
  .theme-toggle-btn {
    min-width: 70px;
    min-height: 70px;
    padding: 10px 12px;
  }
  
  .toggle-icon-container {
    width: 28px;
    height: 28px;
  }
  
  .sun-center {
    width: 14px;
    height: 14px;
  }
  
  .moon-body {
    width: 18px;
    height: 18px;
  }
  
  .toggle-text {
    font-size: 10px;
  }
}

/* 超小屏幕优化 */
@media (max-width: 480px) {
  .theme-toggle-btn {
    min-width: 60px;
    min-height: 60px;
    padding: 8px 10px;
  }
  
  .toggle-icon-container {
    width: 24px;
    height: 24px;
  }
  
  .sun-center {
    width: 12px;
    height: 12px;
  }
  
  .moon-body {
    width: 16px;
    height: 16px;
  }
  
  .toggle-text {
    font-size: 9px;
  }
}

/* 主题适配 */
.theme-light .theme-toggle-btn {
  background: var(--theme-surface);
  border-color: var(--theme-border-hover);
  box-shadow: 0 4px 16px var(--theme-shadow);
}

.theme-light .theme-toggle-btn:hover {
  background: var(--theme-background-soft);
  box-shadow: 
    0 8px 25px var(--theme-glow),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  border-color: var(--theme-primary);
}
</style> 