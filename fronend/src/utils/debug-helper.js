// 调试助手工具
class DebugHelper {
  constructor() {
    this.lastRenderTime = Date.now();
    this.renderCount = 0;
    this.stuckThreshold = 2000; // 2秒没有渲染就认为卡住了
    this.checkInterval = null;
    this.isDebugging = false;
    this.recoveryAttempted = false; // 防止重复恢复
  }

  // 启动调试模式
  startDebugging() {
    if (this.isDebugging) return;
    
    this.isDebugging = true;
    console.log('🔍 启动调试模式');
    
    // 定期检查是否卡住
    this.checkInterval = setInterval(() => {
      this.checkIfStuck();
    }, 1000);
    
    // 监听GSAP动画状态
    this.monitorGSAP();
    
    // 监听Three.js渲染状态
    this.monitorThreeJS();
  }

  // 停止调试模式
  stopDebugging() {
    if (!this.isDebugging) return;
    
    this.isDebugging = false;
    console.log('🔍 停止调试模式');
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // 记录渲染帧
  recordRender() {
    this.lastRenderTime = Date.now();
    this.renderCount++;
  }

  // 检查是否卡住
  checkIfStuck() {
    const currentTime = Date.now();
    const timeSinceLastRender = currentTime - this.lastRenderTime;
    
    if (timeSinceLastRender > this.stuckThreshold) {
      console.error('🚨 检测到渲染卡住！', {
        timeSinceLastRender: `${timeSinceLastRender}ms`,
        totalRenders: this.renderCount,
        lastRenderTime: new Date(this.lastRenderTime).toLocaleTimeString()
      });
      
      // 生成诊断报告
      this.generateDiagnostics();
      
      // 只在第一次检测到时尝试恢复，避免循环
      if (!this.recoveryAttempted) {
        this.recoveryAttempted = true;
        console.log('🔧 首次检测到卡住，尝试恢复...');
        this.attemptRecovery();
        
        // 5秒后重置标志，允许下次恢复
        setTimeout(() => {
          this.recoveryAttempted = false;
        }, 5000);
      }
    }
  }

  // 监听GSAP状态
  monitorGSAP() {
    if (!window.gsap) return;
    
    const timeline = window.gsap.globalTimeline;
    const originalTimeScale = timeline.timeScale();
    
    console.log('🎬 GSAP初始状态:', {
      timeScale: originalTimeScale,
      paused: timeline.paused(),
      duration: timeline.duration(),
      progress: timeline.progress()
    });
    
    // 监听timeScale变化
    let lastTimeScale = originalTimeScale;
    setInterval(() => {
      const currentTimeScale = timeline.timeScale();
      if (currentTimeScale !== lastTimeScale) {
        console.log('🎬 GSAP timeScale changed:', {
          from: lastTimeScale,
          to: currentTimeScale,
          paused: timeline.paused()
        });
        lastTimeScale = currentTimeScale;
      }
    }, 1000);
  }

  // 监听Three.js状态
  monitorThreeJS() {
    let lastRenderCalls = 0;
    
    setInterval(() => {
      const renderer = window.__THREE_RENDERER__;
      if (renderer && renderer.info) {
        const currentRenderCalls = renderer.info.render.calls;
        
        if (currentRenderCalls === lastRenderCalls) {
          console.warn('⚠️ Three.js渲染可能停止了', {
            renderCalls: currentRenderCalls,
            triangles: renderer.info.render.triangles,
            geometries: renderer.info.memory.geometries,
            textures: renderer.info.memory.textures
          });
        }
        
        lastRenderCalls = currentRenderCalls;
      }
    }, 2000);
  }

  // 生成诊断报告
  generateDiagnostics() {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      
      // 页面状态
      pageVisible: !document.hidden,
      
      // GSAP状态
      gsap: window.gsap ? {
        timeScale: window.gsap.globalTimeline.timeScale(),
        paused: window.gsap.globalTimeline.paused(),
        progress: window.gsap.globalTimeline.progress()
      } : 'Not available',
      
      // Three.js状态
      renderer: window.__THREE_RENDERER__ ? {
        renderCalls: window.__THREE_RENDERER__.info.render.calls,
        triangles: window.__THREE_RENDERER__.info.render.triangles,
        geometries: window.__THREE_RENDERER__.info.memory.geometries,
        textures: window.__THREE_RENDERER__.info.memory.textures
      } : 'Not available',
      
      // 内存状态
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : 'Not available',
      
      // 紧急优化器状态
      emergency: window.emergencyOptimizer ? 
        window.emergencyOptimizer.getStatus() : 'Not available'
    };
    
    console.error('🔍 卡住诊断报告:', diagnostics);
    
    return diagnostics;
  }

  // 尝试恢复
  attemptRecovery() {
    console.log('🔧 尝试恢复渲染...');
    
    try {
      // 1. 重置GSAP
      if (window.gsap) {
        window.gsap.globalTimeline.timeScale(1);
        console.log('✅ GSAP timeScale重置为1');
      }
      
      // 2. 清除紧急帧率限制
      if (window.__EMERGENCY_FRAME_LIMIT__) {
        delete window.__EMERGENCY_FRAME_LIMIT__;
        console.log('✅ 清除紧急帧率限制');
      }
      
      // 3. 重置紧急优化器
      if (window.emergencyOptimizer) {
        window.emergencyOptimizer.reset();
        console.log('✅ 重置紧急优化器');
      }
      
      // 4. 强制垃圾回收（如果可用）
      if (window.gc) {
        window.gc();
        console.log('✅ 强制垃圾回收');
      }
      
      // 5. 直接重启渲染循环（不触发可见性事件，避免递归）
      if (window.__THREE_RESTART_RENDER__) {
        window.__THREE_RESTART_RENDER__();
        console.log('✅ 直接重启渲染循环');
      } else {
        console.log('⚠️ 渲染重启函数不可用');
      }
      
    } catch (error) {
      console.error('❌ 恢复失败:', error);
    }
  }

  // 手动触发恢复
  forceRecovery() {
    console.log('🔧 手动强制恢复...');
    this.attemptRecovery();
  }

  // 获取当前状态
  getStatus() {
    return {
      isDebugging: this.isDebugging,
      lastRenderTime: this.lastRenderTime,
      renderCount: this.renderCount,
      timeSinceLastRender: Date.now() - this.lastRenderTime
    };
  }
}

// 创建全局实例
const debugHelper = new DebugHelper();

// 在开发环境中自动启动调试
if (import.meta.env.DEV) {
  debugHelper.startDebugging();
}

// 将调试助手暴露到全局
window.debugHelper = debugHelper;

export default debugHelper; 