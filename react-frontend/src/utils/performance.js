// 性能优化工具
class PerformanceManager {
  constructor() {
    this.isLowMemory = false
    this.animationsPaused = false
    this.observers = []
    this.memoryCheckInterval = null
    
    this.init()
  }
  
  init() {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    
    // 监听内存压力（如果支持）
    if (this.supportsMemoryAPI()) {
      this.startMemoryMonitoring()
    }
    
    // 监听应用暂停/恢复事件（Cordova）
    if (window.cordova) {
      document.addEventListener('pause', this.handleAppPause.bind(this), false)
      document.addEventListener('resume', this.handleAppResume.bind(this), false)
    }
  }
  
  // 检查是否支持内存API
  supportsMemoryAPI() {
    return 'memory' in performance && performance.memory
  }
  
  // 开始内存监控
  startMemoryMonitoring() {
    this.memoryCheckInterval = setInterval(() => {
      const memInfo = performance.memory
      const memoryUsageRatio = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit
      
      // 内存使用超过70%时启动低内存模式
      if (memoryUsageRatio > 0.7 && !this.isLowMemory) {
        this.enableLowMemoryMode()
      }
      // 内存使用低于50%时恢复正常模式
      else if (memoryUsageRatio < 0.5 && this.isLowMemory) {
        this.disableLowMemoryMode()
      }
    }, 3000)
  }
  
  // 启用低内存模式
  enableLowMemoryMode() {
    this.isLowMemory = true
    document.body.classList.add('low-memory-mode')
    this.pauseAnimations()
    this.notifyObservers('lowMemory', true)
    
    console.log('🔥 启用低内存模式')
  }
  
  // 禁用低内存模式
  disableLowMemoryMode() {
    this.isLowMemory = false
    document.body.classList.remove('low-memory-mode')
    this.resumeAnimations()
    this.notifyObservers('lowMemory', false)
    
    console.log('✅ 恢复正常内存模式')
  }
  
  // 暂停动画
  pauseAnimations() {
    if (this.animationsPaused) return
    
    this.animationsPaused = true
    document.body.classList.add('pause-animations')
    this.notifyObservers('animationsPaused', true)
  }
  
  // 恢复动画
  resumeAnimations() {
    if (!this.animationsPaused) return
    
    this.animationsPaused = false
    document.body.classList.remove('pause-animations')
    this.notifyObservers('animationsPaused', false)
  }
  
  // 页面可见性变化处理
  handleVisibilityChange() {
    if (document.hidden) {
      this.pauseAnimations()
      this.notifyObservers('visibility', false)
    } else {
      // 延迟恢复动画，给页面一些时间加载
      setTimeout(() => {
        if (!this.isLowMemory) {
          this.resumeAnimations()
        }
        this.notifyObservers('visibility', true)
      }, 100)
    }
  }
  
  // 应用暂停处理
  handleAppPause() {
    this.pauseAnimations()
    this.notifyObservers('appPause', true)
    console.log('📱 应用已暂停')
  }
  
  // 应用恢复处理
  handleAppResume() {
    // 延迟恢复，确保应用完全激活
    setTimeout(() => {
      if (!this.isLowMemory && !document.hidden) {
        this.resumeAnimations()
      }
      this.notifyObservers('appResume', true)
    }, 500)
    console.log('📱 应用已恢复')
  }
  
  // 添加观察者
  addObserver(callback) {
    this.observers.push(callback)
  }
  
  // 移除观察者
  removeObserver(callback) {
    const index = this.observers.indexOf(callback)
    if (index > -1) {
      this.observers.splice(index, 1)
    }
  }
  
  // 通知观察者
  notifyObservers(event, data) {
    this.observers.forEach(callback => {
      try {
        callback(event, data)
      } catch (error) {
        console.error('性能管理器观察者错误:', error)
      }
    })
  }
  
  // 获取内存信息
  getMemoryInfo() {
    if (!this.supportsMemoryAPI()) {
      return null
    }
    
    const mem = performance.memory
    return {
      used: Math.round(mem.usedJSHeapSize / 1024 / 1024), // MB
      total: Math.round(mem.totalJSHeapSize / 1024 / 1024), // MB
      limit: Math.round(mem.jsHeapSizeLimit / 1024 / 1024), // MB
      usageRatio: mem.usedJSHeapSize / mem.jsHeapSizeLimit
    }
  }
  
  // 强制垃圾回收（仅在开发模式）
  forceGC() {
    if (window.gc && typeof window.gc === 'function') {
      window.gc()
      console.log('🗑️ 执行垃圾回收')
    }
  }
  
  // 清理资源
  destroy() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange.bind(this))
    
    if (window.cordova) {
      document.removeEventListener('pause', this.handleAppPause.bind(this))
      document.removeEventListener('resume', this.handleAppResume.bind(this))
    }
    
    if (this.memoryCheckInterval) {
      clearInterval(this.memoryCheckInterval)
    }
    
    this.observers = []
  }
}

// 创建全局实例
const performanceManager = new PerformanceManager()

export default performanceManager 