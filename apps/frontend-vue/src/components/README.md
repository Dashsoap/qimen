# QimenDisk3D 组件使用说明

## 概述

`QimenDisk3D` 是一个基于 Three.js 的 3D 奇门遁甲盘组件，提供了丰富的视觉效果和交互功能。

## 功能特性

- 🎨 **3D 渲染**: 使用 Three.js 渲染精美的 3D 奇门盘
- 🎭 **动画效果**: 支持旋转动画、粒子效果、光源动画等
- 🎮 **交互控制**: 支持鼠标控制、点击交互
- 📱 **响应式设计**: 自适应不同屏幕尺寸
- ⚡ **性能优化**: 内置性能监控和优化机制
- 🎯 **事件系统**: 完整的事件回调支持

## 基本使用

```vue
<template>
  <div class="container">
    <QimenDisk3D
      :enable-controls="true"
      :enable-click-interaction="true"
      :enable-camera-animation="true"
      :enable-particles="true"
      :background-color="0x000022"
      @ready="handleReady"
      @click="handleClick"
      @error="handleError"
    />
  </div>
</template>

<script setup>
import QimenDisk3D from '@/components/QimenDisk3D.vue'

const handleReady = () => {
  console.log('奇门盘已准备就绪')
}

const handleClick = (event) => {
  console.log('奇门盘被点击', event)
}

const handleError = (error) => {
  console.error('奇门盘错误:', error)
}
</script>
```

## Props 属性

| 属性名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `enableControls` | Boolean | `true` | 是否启用鼠标控制 |
| `enableClickInteraction` | Boolean | `true` | 是否启用点击交互 |
| `enableCameraAnimation` | Boolean | `true` | 是否启用相机动画 |
| `enableParticles` | Boolean | `true` | 是否启用粒子效果 |
| `backgroundColor` | Number | `0x000022` | 背景颜色（十六进制） |
| `containerClass` | String | `''` | 容器CSS类名 |
| `canvasClass` | String | `''` | Canvas CSS类名 |

## 事件

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `ready` | - | 组件初始化完成时触发 |
| `click` | `event` | 点击奇门盘时触发 |
| `error` | `error` | 发生错误时触发 |

## 高级用法

### 自定义样式

```vue
<template>
  <QimenDisk3D
    container-class="my-disk-container"
    canvas-class="my-disk-canvas"
  />
</template>

<style scoped>
:deep(.my-disk-container) {
  border-radius: 10px;
  overflow: hidden;
}

:deep(.my-disk-canvas) {
  filter: brightness(1.2);
}
</style>
```

### 禁用特定功能

```vue
<template>
  <!-- 只显示静态奇门盘，无交互 -->
  <QimenDisk3D
    :enable-controls="false"
    :enable-click-interaction="false"
    :enable-camera-animation="false"
    :enable-particles="false"
  />
</template>
```

### 监听所有事件

```vue
<template>
  <QimenDisk3D
    @ready="onReady"
    @click="onClick"
    @error="onError"
  />
</template>

<script setup>
const onReady = () => {
  console.log('奇门盘准备完成')
  // 可以在这里执行初始化后的操作
}

const onClick = (event) => {
  console.log('点击位置:', event)
  // 处理点击事件，比如显示详细信息
}

const onError = (error) => {
  console.error('渲染错误:', error)
  // 处理错误，比如显示错误提示
}
</script>
```

## 性能优化

组件内置了多种性能优化机制：

1. **自动性能检测**: 根据设备性能自动调整渲染质量
2. **内存管理**: 自动清理Three.js资源，防止内存泄漏
3. **帧率控制**: 在低性能设备上自动限制帧率
4. **页面可见性检测**: 页面不可见时暂停渲染

## 注意事项

1. **资源清理**: 组件会自动处理Three.js资源的清理，无需手动管理
2. **性能监控**: 建议配合`PerformanceMonitor`组件使用
3. **移动端适配**: 组件已针对移动端进行优化
4. **浏览器兼容**: 需要支持WebGL的现代浏览器

## 故障排除

### 常见问题

**Q: 奇门盘不显示或显示异常**
A: 检查浏览器是否支持WebGL，或尝试更新显卡驱动

**Q: 性能较差或卡顿**
A: 组件会自动优化，也可以手动禁用一些特效来提升性能

**Q: 移动端显示问题**
A: 确保容器有明确的宽高设置

### 调试模式

```vue
<template>
  <QimenDisk3D
    @ready="onReady"
    @error="onError"
  />
</template>

<script setup>
const onReady = () => {
  // 检查Three.js全局变量
  console.log('Renderer:', window.__THREE_RENDERER__)
  console.log('Scene:', window.__THREE_SCENE__)
}

const onError = (error) => {
  console.error('详细错误信息:', error)
}
</script>
```

## 更新日志

### v1.0.0
- 初始版本发布
- 支持完整的3D奇门盘渲染
- 内置性能优化和错误处理
- 支持多种交互和动画效果
