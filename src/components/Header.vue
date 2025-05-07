<template>
  <header class="header-nav">
    <div class="nav-container">
      <div class="logo">
        <!-- 可以放置logo图片 -->
        <span>太极奇门</span>
      </div>
      
      <div class="menu-toggle" @click="toggleMenu" :class="{ active: menuActive }">
        <span></span>
        <span></span>
        <span></span>
      </div>
      
      <ul class="nav-links" :class="{ active: menuActive }">
        <li><RouterLink to="/home" active-class="active">首页</RouterLink></li>
        <li><RouterLink to="/qimen" active-class="active">奇门</RouterLink></li>
        <li><RouterLink to="/about" active-class="active">关于</RouterLink></li>
      </ul>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {
      menuActive: false
    }
  },
  methods: {
    toggleMenu() {
      this.menuActive = !this.menuActive
    }
  }
}
</script>

<style>
@import '../assets/header.css';
</style> 