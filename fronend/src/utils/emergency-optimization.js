import * as THREE from 'three';

// 紧急性能优化工具
class EmergencyOptimizer {
  constructor() {
    this.emergencyMode = false;
    this.fpsHistory = [];
    this.memoryHistory = [];
    this.degradationLevel = 0; // 0-3, 降级等级
  }

  // 检查是否需要紧急优化
  checkEmergencyConditions(fps, memoryUsage) {
    // 添加有效性检查
    if (typeof fps !== 'number' || fps <= 0 || isNaN(fps)) {
      fps = 60; // 默认值
    }
    if (typeof memoryUsage !== 'number' || memoryUsage < 0 || isNaN(memoryUsage)) {
      memoryUsage = 0; // 默认值
    }
    
    this.fpsHistory.push(fps);
    this.memoryHistory.push(memoryUsage);
    
    // 保持最近5秒的历史记录（减少历史记录长度）
    if (this.fpsHistory.length > 5) {
      this.fpsHistory.shift();
      this.memoryHistory.shift();
    }
    
    // 需要至少3个数据点才开始检查
    if (this.fpsHistory.length < 3) {
      return this.emergencyMode;
    }
    
    // 计算平均FPS
    const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
    const avgMemory = this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length;
    
    // 更宽松的紧急条件检查
    const emergencyConditions = [
      avgFPS < 10, // 平均FPS低于10（更宽松）
      avgMemory > 0.9, // 内存使用超过90%（更宽松）
      fps < 5, // 当前FPS极低（更宽松）
      memoryUsage > 0.95 // 当前内存极高（更宽松）
    ];
    
    const emergencyCount = emergencyConditions.filter(Boolean).length;
    
    // 需要更多条件同时满足才启用紧急模式
    if (emergencyCount >= 3 && !this.emergencyMode && this.degradationLevel < 3) {
      this.enableEmergencyMode();
    } else if (emergencyCount === 0 && this.emergencyMode) {
      this.disableEmergencyMode();
    }
    
    return this.emergencyMode;
  }

  // 启用紧急模式
  enableEmergencyMode() {
    this.emergencyMode = true;
    this.degradationLevel++;
    
    console.warn('🚨 启用紧急性能优化模式 - 等级:', this.degradationLevel);
    
    // 应用紧急优化
    this.applyEmergencyOptimizations();
    
    // 通知用户
    this.notifyUser();
  }

  // 禁用紧急模式
  disableEmergencyMode() {
    console.log('✅ 性能恢复，退出紧急优化模式');
    this.emergencyMode = false;
    // 注意：不重置degradationLevel，避免反复切换
  }

  // 应用紧急优化
  applyEmergencyOptimizations() {
    const optimizations = {
      1: this.level1Optimizations.bind(this),
      2: this.level2Optimizations.bind(this),
      3: this.level3Optimizations.bind(this)
    };

    if (optimizations[this.degradationLevel]) {
      optimizations[this.degradationLevel]();
    }
  }

  // 等级1优化：基础降级
  level1Optimizations() {
    console.log('🔧 应用等级1优化：降低渲染质量');
    
    // 降低像素比
    const renderer = window.__THREE_RENDERER__;
    if (renderer) {
      renderer.setPixelRatio(0.8);
    }
    
    // 隐藏粒子系统
    this.hideParticles();
    
    // 减少动画频率
    this.reduceAnimationFrequency(0.7);
  }

  // 等级2优化：中等降级
  level2Optimizations() {
    console.log('🔧 应用等级2优化：大幅降低质量');
    
    const renderer = window.__THREE_RENDERER__;
    if (renderer) {
      renderer.setPixelRatio(0.6);
    }
    
    // 禁用抗锯齿
    this.disableAntialiasing();
    
    // 减少更多动画
    this.reduceAnimationFrequency(0.5);
    
    // 降低辉光效果
    this.reduceBloomEffect();
  }

  // 等级3优化：最大降级
  level3Optimizations() {
    console.log('🔧 应用等级3优化：最小渲染模式');
    
    const renderer = window.__THREE_RENDERER__;
    if (renderer) {
      renderer.setPixelRatio(0.5);
    }
    
    // 停止所有非必要动画
    this.stopNonEssentialAnimations();
    
    // 使用最简单的材质
    this.switchToBasicMaterials();
    
    // 降低渲染频率到20FPS
    this.limitRenderRate(20);
  }

  // 隐藏粒子系统
  hideParticles() {
    const scene = window.__THREE_SCENE__;
    if (scene) {
      scene.traverse((child) => {
        if (child.type === 'Points') {
          child.visible = false;
        }
      });
    }
  }

  // 减少动画频率
  reduceAnimationFrequency(factor) {
    // 通过GSAP的timeScale减慢动画（但不能过慢）
    if (window.gsap && factor >= 0.3) { // 最低不能低于30%速度
      window.gsap.globalTimeline.timeScale(factor);
      console.log(`🐌 动画速度调整为: ${factor * 100}%`);
    }
  }

  // 禁用抗锯齿
  disableAntialiasing() {
    const renderer = window.__THREE_RENDERER__;
    if (renderer && renderer.capabilities) {
      // Three.js渲染器创建后无法直接禁用抗锯齿
      // 但可以通过其他方式优化
      console.log('💡 注意：抗锯齿需要重新创建渲染器才能禁用');
    }
  }

  // 降低辉光效果
  reduceBloomEffect() {
    const composer = window.__THREE_COMPOSER__;
    if (composer && composer.passes) {
      composer.passes.forEach(pass => {
        if (pass.constructor.name === 'UnrealBloomPass') {
          pass.strength *= 0.5;
          pass.radius *= 0.5;
        }
      });
    }
  }

  // 停止非必要动画
  stopNonEssentialAnimations() {
    if (window.gsap) {
      // 暂停大部分动画，只保留基础旋转（最低速度限制）
      window.gsap.globalTimeline.timeScale(0.5); // 改为50%，避免完全停止
      console.log('⏸️ 非必要动画已减慢到50%');
    }
  }

  // 切换到基础材质
  switchToBasicMaterials() {
    const scene = window.__THREE_SCENE__;
    if (scene) {
      scene.traverse((child) => {
        if (child.material && child.material.type !== 'MeshBasicMaterial') {
          // 创建基础材质替换复杂材质
          const basicMaterial = new THREE.MeshBasicMaterial({
            color: child.material.color || 0xffffff
          });
          child.material = basicMaterial;
        }
      });
    }
  }

  // 限制渲染频率
  limitRenderRate(targetFPS) {
    this.targetFrameTime = 1000 / targetFPS;
    this.lastFrameTime = 0;
    
    // 这个需要在渲染循环中实现
    window.__EMERGENCY_FRAME_LIMIT__ = this.targetFrameTime;
  }

  // 通知用户
  notifyUser() {
    // 创建临时通知
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: #ffd700;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #d4af37;
        z-index: 10000;
        text-align: center;
        font-family: Arial, sans-serif;
      ">
        <h4 style="margin: 0 0 10px 0;">⚡ 性能优化</h4>
        <p style="margin: 0;">检测到性能问题，已自动降低渲染质量</p>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // 3秒后移除通知
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  // 重置优化
  reset() {
    this.emergencyMode = false;
    this.degradationLevel = 0;
    this.fpsHistory = [];
    this.memoryHistory = [];
    
    // 恢复动画时间尺度
    if (window.gsap) {
      window.gsap.globalTimeline.timeScale(1);
    }
    
    console.log('🔄 紧急优化器已重置');
  }

  // 获取当前状态
  getStatus() {
    return {
      emergencyMode: this.emergencyMode,
      degradationLevel: this.degradationLevel,
      avgFPS: this.fpsHistory.length ? 
        this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length : 0,
      avgMemory: this.memoryHistory.length ? 
        this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length : 0
    };
  }
}

// 创建全局实例
const emergencyOptimizer = new EmergencyOptimizer();

export default emergencyOptimizer; 