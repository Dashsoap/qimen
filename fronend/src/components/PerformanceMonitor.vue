<template>
  <div v-if="showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <h4>性能监控</h4>
      <button @click="toggleMonitor" class="close-btn">×</button>
    </div>
    
    <div class="monitor-content">
      <div class="metric">
        <span class="label">FPS:</span>
        <span class="value" :class="getFPSClass(fps)">{{ fps }}</span>
      </div>
      
      <div v-if="memoryInfo" class="metric">
        <span class="label">内存:</span>
        <span class="value">{{ memoryInfo.used }}MB / {{ memoryInfo.limit }}MB</span>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: (memoryInfo.usageRatio * 100) + '%' }"
            :class="getMemoryClass(memoryInfo.usageRatio)"
          ></div>
        </div>
      </div>
      
      <div class="metric">
        <span class="label">设备性能:</span>
        <span class="value">{{ devicePerformance }}</span>
      </div>
      
      <div class="metric">
        <span class="label">渲染模式:</span>
        <span class="value">{{ renderMode }}</span>
      </div>
      
      <div v-if="threejsStats" class="threejs-stats">
        <div class="metric">
          <span class="label">几何体:</span>
          <span class="value">{{ threejsStats.geometries }}</span>
        </div>
        <div class="metric">
          <span class="label">材质:</span>
          <span class="value">{{ threejsStats.materials }}</span>
        </div>
        <div class="metric">
          <span class="label">纹理:</span>
          <span class="value">{{ threejsStats.textures }}</span>
        </div>
      </div>
      
      <div class="actions">
        <button @click="forceGC" class="action-btn">强制GC</button>
        <button @click="forceRecovery" class="action-btn recovery-btn">恢复渲染</button>
        <button @click="clearStats" class="action-btn">清除统计</button>
      </div>
    </div>
  </div>
  
  <!-- 悬浮触发按钮 -->
  <div v-else class="monitor-trigger" @click="toggleMonitor">
    <span class="fps-indicator" :class="getFPSClass(fps)">{{ fps }}</span>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import performanceManager from '../utils/performance.js';
import mobileOptimizer from '../utils/mobile-optimization.js';

// 响应式数据
const showMonitor = ref(false);
const fps = ref(0);
const memoryInfo = ref(null);
const devicePerformance = ref(mobileOptimizer.devicePerformance);
const renderMode = ref(mobileOptimizer.isMobile ? '移动端' : '桌面端');
const threejsStats = ref(null);

// FPS监控器
let fpsMonitor = null;
let monitorInterval = null;

// 切换监控器显示
const toggleMonitor = () => {
  showMonitor.value = !showMonitor.value;
};

// 获取FPS样式类
const getFPSClass = (fpsValue) => {
  if (fpsValue >= 50) return 'fps-good';
  if (fpsValue >= 30) return 'fps-medium';
  return 'fps-poor';
};

// 获取内存样式类
const getMemoryClass = (ratio) => {
  if (ratio < 0.5) return 'memory-good';
  if (ratio < 0.7) return 'memory-medium';
  return 'memory-poor';
};

// 强制垃圾回收
const forceGC = () => {
  performanceManager.forceGC();
  console.log('🗑️ 已执行强制垃圾回收');
};

// 强制恢复渲染
const forceRecovery = () => {
  if (window.debugHelper) {
    window.debugHelper.forceRecovery();
    console.log('🔧 已执行强制恢复');
  } else {
    console.warn('调试助手不可用');
  }
};

// 清除统计
const clearStats = () => {
  if (threejsStats.value) {
    threejsStats.value = null;
  }
  console.log('📊 已清除统计数据');
};

// 更新Three.js统计信息
const updateThreeJSStats = () => {
  try {
    const renderer = window.__THREE_RENDERER__;
    if (renderer && renderer.info && renderer.info.memory) {
      threejsStats.value = {
        geometries: renderer.info.memory.geometries || 0,
        materials: renderer.info.memory.textures || 0,
        textures: renderer.info.memory.textures || 0,
        calls: renderer.info.render?.calls || 0,
        triangles: renderer.info.render?.triangles || 0,
        points: renderer.info.render?.points || 0
      };
    } else {
      threejsStats.value = null;
    }
  } catch (error) {
    // 静默处理错误，避免控制台污染
    threejsStats.value = null;
  }
};

onMounted(() => {
  // 初始化FPS监控
  fpsMonitor = mobileOptimizer.createFPSMonitor();
  
  // 定期更新性能信息
  monitorInterval = setInterval(() => {
    // 更新FPS
    fps.value = fpsMonitor();
    
    // 更新内存信息
    memoryInfo.value = performanceManager.getMemoryInfo();
    
    // 更新Three.js统计
    updateThreeJSStats();
  }, 1000);
  
  // 监听性能事件
  performanceManager.addObserver((event, data) => {
    console.log(`性能事件: ${event}`, data);
  });
});

onUnmounted(() => {
  if (monitorInterval) {
    clearInterval(monitorInterval);
  }
});
</script>

<style scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 300px;
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  color: #d4af37;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  z-index: 9999;
  backdrop-filter: blur(10px);
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
}

.monitor-header h4 {
  margin: 0;
  font-size: 14px;
  color: #ffd700;
}

.close-btn {
  background: none;
  border: none;
  color: #d4af37;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #ffd700;
}

.monitor-content {
  padding: 15px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.label {
  color: #d4af37;
}

.value {
  font-weight: bold;
}

.fps-good { color: #4caf50; }
.fps-medium { color: #ff9800; }
.fps-poor { color: #f44336; }

.progress-bar {
  width: 100px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
  margin-left: 10px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.memory-good { background: #4caf50; }
.memory-medium { background: #ff9800; }
.memory-poor { background: #f44336; }

.threejs-stats {
  border-top: 1px solid rgba(212, 175, 55, 0.2);
  padding-top: 10px;
  margin-top: 10px;
}

.actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid rgba(212, 175, 55, 0.2);
}

.action-btn {
  flex: 1;
  padding: 6px 12px;
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 4px;
  color: #d4af37;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(212, 175, 55, 0.3);
  border-color: rgba(255, 215, 0, 0.5);
  color: #ffd700;
}

.recovery-btn {
  background: rgba(255, 69, 0, 0.2);
  border-color: rgba(255, 69, 0, 0.3);
  color: #ff4500;
}

.recovery-btn:hover {
  background: rgba(255, 69, 0, 0.3);
  border-color: rgba(255, 140, 0, 0.5);
  color: #ff8c00;
}

.monitor-trigger {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 30px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 9999;
  backdrop-filter: blur(5px);
  transition: all 0.3s ease;
}

.monitor-trigger:hover {
  border-color: rgba(255, 215, 0, 0.5);
  background: rgba(0, 0, 0, 0.9);
}

.fps-indicator {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  font-weight: bold;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .performance-monitor {
    width: 280px;
    top: 10px;
    right: 10px;
  }
  
  .monitor-trigger {
    top: 10px;
    right: 10px;
  }
}
</style> 