// 移动端性能优化工具
export class MobileOptimizer {
  constructor() {
    this.isMobile = this.detectMobile();
    this.devicePerformance = this.getDevicePerformance();
    this.optimizedSettings = this.getOptimizedSettings();
  }

  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  getDevicePerformance() {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return 'low';

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';
    
    // 根据GPU信息判断性能等级
    if (renderer.includes('Adreno 6') || renderer.includes('Mali-G7') || renderer.includes('A15') || renderer.includes('A16')) {
      return 'high';
    } else if (renderer.includes('Adreno 5') || renderer.includes('Mali-G5') || renderer.includes('A12') || renderer.includes('A13')) {
      return 'medium';
    }
    
    return 'low';
  }

  getOptimizedSettings() {
    const settings = {
      high: {
        pixelRatio: Math.min(window.devicePixelRatio, 2),
        antialias: true,
        shadowMapSize: 1024,
        particleCount: 800,
        bloomStrength: 0.3,
        animationFPS: 60
      },
      medium: {
        pixelRatio: Math.min(window.devicePixelRatio, 1.5),
        antialias: true,
        shadowMapSize: 512,
        particleCount: 400,
        bloomStrength: 0.2,
        animationFPS: 30
      },
      low: {
        pixelRatio: 1,
        antialias: false,
        shadowMapSize: 256,
        particleCount: 200,
        bloomStrength: 0.1,
        animationFPS: 24
      }
    };

    return this.isMobile ? settings[this.devicePerformance] : settings.high;
  }

  // 动态调整渲染质量
  adjustRenderQuality(renderer, scene, camera) {
    if (this.isMobile) {
      // 移动端优化
      renderer.setPixelRatio(this.optimizedSettings.pixelRatio);
      renderer.shadowMap.enabled = this.devicePerformance !== 'low';
      
      // 降低几何体细节
      this.optimizeGeometries(scene);
      
      // 优化材质
      this.optimizeMaterials(scene);
    }
  }

  optimizeGeometries(scene) {
    scene.traverse((child) => {
      if (child.geometry) {
        // 减少几何体分段数
        if (child.geometry.parameters) {
          const params = child.geometry.parameters;
          if (params.widthSegments) params.widthSegments = Math.max(8, params.widthSegments / 2);
          if (params.heightSegments) params.heightSegments = Math.max(8, params.heightSegments / 2);
          if (params.radialSegments) params.radialSegments = Math.max(8, params.radialSegments / 2);
        }
      }
    });
  }

  optimizeMaterials(scene) {
    scene.traverse((child) => {
      if (child.material) {
        if (this.devicePerformance === 'low') {
          // 低性能设备使用基础材质
          child.material.needsUpdate = true;
        }
      }
    });
  }

  // 帧率监控
  createFPSMonitor() {
    let fps = 0;
    let frameCount = 0;
    let lastTime = Date.now();

    return () => {
      frameCount++;
      const currentTime = Date.now();
      
      if (currentTime - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // 如果帧率过低，进一步优化
        if (fps < 20 && this.devicePerformance !== 'low') {
          this.devicePerformance = 'low';
          this.optimizedSettings = this.getOptimizedSettings();
          console.log('Performance downgraded due to low FPS:', fps);
        }
      }
      
      return fps;
    };
  }
}

export default new MobileOptimizer(); 