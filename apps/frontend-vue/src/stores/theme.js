import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  // 主题状态：'dark' 或 'light'
  const currentTheme = ref('dark')
  
  // 从本地存储恢复主题设置
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('qimen-theme')
    if (savedTheme && ['dark', 'light'].includes(savedTheme)) {
      currentTheme.value = savedTheme
    }
  }

  // 计算属性：判断是否为暗色主题
  const isDark = computed(() => currentTheme.value === 'dark')
  const isLight = computed(() => currentTheme.value === 'light')

  // 主题配置
  const themes = {
    dark: {
      name: '夜间模式',
      icon: '🌙',
      primary: '#d4af37',
      primaryLight: '#ffd700',
      background: '#000000',
      backgroundSoft: '#0a0a0a',
      backgroundMute: '#1a1a1a',
      surface: '#2d2d2d',
      text: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.8)',
      textMuted: 'rgba(255, 255, 255, 0.6)',
      border: 'rgba(212, 175, 55, 0.2)',
      borderHover: 'rgba(212, 175, 55, 0.4)',
      shadow: 'rgba(0, 0, 0, 0.8)',
      glow: 'rgba(212, 175, 55, 0.3)'
    },
    light: {
      name: '日间模式',
      icon: '☀️',
      primary: '#8b6914',
      primaryLight: '#b8860b',
      background: '#fdfcf8',
      backgroundSoft: '#f5f2eb',
      backgroundMute: '#ede8db',
      surface: '#ffffff',
      text: '#2c2418',
      textSecondary: '#5a4f3a',
      textMuted: '#8b7355',
      border: 'rgba(139, 105, 20, 0.3)',
      borderHover: 'rgba(139, 105, 20, 0.5)',
      shadow: 'rgba(139, 105, 20, 0.15)',
      glow: 'rgba(139, 105, 20, 0.25)'
    }
  }

  // 获取当前主题配置
  const currentThemeConfig = computed(() => themes[currentTheme.value])

  // 切换主题
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
    saveTheme()
    applyTheme()
  }

  // 设置特定主题
  function setTheme(theme) {
    if (themes[theme]) {
      currentTheme.value = theme
      saveTheme()
      applyTheme()
    }
  }

  // 保存主题到本地存储
  function saveTheme() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('qimen-theme', currentTheme.value)
    }
  }

  // 应用主题到CSS变量
  function applyTheme() {
    if (typeof document !== 'undefined') {
      const config = currentThemeConfig.value
      const root = document.documentElement
      
      // 设置CSS变量
      root.style.setProperty('--theme-primary', config.primary)
      root.style.setProperty('--theme-primary-light', config.primaryLight)
      root.style.setProperty('--theme-background', config.background)
      root.style.setProperty('--theme-background-soft', config.backgroundSoft)
      root.style.setProperty('--theme-background-mute', config.backgroundMute)
      root.style.setProperty('--theme-surface', config.surface)
      root.style.setProperty('--theme-text', config.text)
      root.style.setProperty('--theme-text-secondary', config.textSecondary)
      root.style.setProperty('--theme-text-muted', config.textMuted)
      root.style.setProperty('--theme-border', config.border)
      root.style.setProperty('--theme-border-hover', config.borderHover)
      root.style.setProperty('--theme-shadow', config.shadow)
      root.style.setProperty('--theme-glow', config.glow)

      // 设置主题类名
      root.className = root.className.replace(/theme-\w+/g, '')
      root.classList.add(`theme-${currentTheme.value}`)
    }
  }

  // 初始化主题
  function initTheme() {
    applyTheme()
  }

  return {
    currentTheme,
    isDark,
    isLight,
    currentThemeConfig,
    toggleTheme,
    setTheme,
    initTheme
  }
}) 