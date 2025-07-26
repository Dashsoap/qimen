<template>
  <div class="example-container">
    <h2>QimenDisk3D 组件示例</h2>
    
    <!-- 控制面板 -->
    <div class="controls">
      <div class="control-group">
        <label>
          <input 
            type="checkbox" 
            v-model="enableControls"
          />
          启用鼠标控制
        </label>
      </div>
      
      <div class="control-group">
        <label>
          <input 
            type="checkbox" 
            v-model="enableClickInteraction"
          />
          启用点击交互
        </label>
      </div>
      
      <div class="control-group">
        <label>
          <input 
            type="checkbox" 
            v-model="enableCameraAnimation"
          />
          启用相机动画
        </label>
      </div>
      
      <div class="control-group">
        <label>
          <input 
            type="checkbox" 
            v-model="enableParticles"
          />
          启用粒子效果
        </label>
      </div>
      
      <div class="control-group">
        <label>背景颜色:</label>
        <select v-model="backgroundColor">
          <option :value="0x000022">深蓝色</option>
          <option :value="0x000000">黑色</option>
          <option :value="0x1a1a2e">深紫色</option>
          <option :value="0x0f3460">海军蓝</option>
        </select>
      </div>
    </div>
    
    <!-- 状态显示 -->
    <div class="status">
      <div class="status-item">
        <span class="label">状态:</span>
        <span class="value" :class="{ ready: isReady, error: hasError }">
          {{ statusText }}
        </span>
      </div>
      
      <div class="status-item" v-if="clickCount > 0">
        <span class="label">点击次数:</span>
        <span class="value">{{ clickCount }}</span>
      </div>
      
      <div class="status-item" v-if="lastError">
        <span class="label">最后错误:</span>
        <span class="value error">{{ lastError }}</span>
      </div>
    </div>
    
    <!-- 3D奇门盘 -->
    <div class="disk-wrapper">
      <QimenDisk3D
        :enable-controls="enableControls"
        :enable-click-interaction="enableClickInteraction"
        :enable-camera-animation="enableCameraAnimation"
        :enable-particles="enableParticles"
        :background-color="backgroundColor"
        container-class="example-disk-container"
        canvas-class="example-disk-canvas"
        @ready="handleReady"
        @click="handleClick"
        @error="handleError"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import QimenDisk3D from './QimenDisk3D.vue'

// 控制参数
const enableControls = ref(true)
const enableClickInteraction = ref(true)
const enableCameraAnimation = ref(true)
const enableParticles = ref(true)
const backgroundColor = ref(0x000022)

// 状态管理
const isReady = ref(false)
const hasError = ref(false)
const clickCount = ref(0)
const lastError = ref('')

// 计算状态文本
const statusText = computed(() => {
  if (hasError.value) return '错误'
  if (isReady.value) return '就绪'
  return '加载中...'
})

// 事件处理
const handleReady = () => {
  console.log('奇门盘已准备就绪')
  isReady.value = true
  hasError.value = false
  lastError.value = ''
}

const handleClick = (event) => {
  console.log('奇门盘被点击', event)
  clickCount.value++
}

const handleError = (error) => {
  console.error('奇门盘错误:', error)
  hasError.value = true
  isReady.value = false
  lastError.value = error.message || '未知错误'
}
</script>

<style scoped>
.example-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #d4af37;
  text-align: center;
  margin-bottom: 30px;
  font-size: 1.8rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group label {
  color: #d4af37;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group input[type="checkbox"] {
  accent-color: #d4af37;
}

.control-group select {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 6px;
  padding: 4px 8px;
  color: #d4af37;
  font-size: 0.9rem;
}

.control-group select:focus {
  outline: none;
  border-color: rgba(212, 175, 55, 0.6);
}

.status {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.status-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-item .label {
  color: rgba(212, 175, 55, 0.8);
  font-weight: 500;
}

.status-item .value {
  color: #ffffff;
  font-weight: 600;
}

.status-item .value.ready {
  color: #4ade80;
}

.status-item .value.error {
  color: #ef4444;
}

.disk-wrapper {
  height: 600px;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid rgba(212, 175, 55, 0.3);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(212, 175, 55, 0.1);
}

:deep(.example-disk-container) {
  width: 100%;
  height: 100%;
}

:deep(.example-disk-canvas) {
  display: block;
  width: 100%;
  height: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .example-container {
    padding: 15px;
  }
  
  .controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .status {
    flex-direction: column;
    gap: 10px;
  }
  
  .disk-wrapper {
    height: 400px;
  }
  
  h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .disk-wrapper {
    height: 300px;
  }
  
  .controls {
    padding: 15px;
  }
  
  .status {
    padding: 10px;
  }
}
</style>