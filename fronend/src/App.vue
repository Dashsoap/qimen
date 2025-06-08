<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { ref } from 'vue'

const menuActive = ref(false)
const toggleMenu = () => {
  menuActive.value = !menuActive.value
}
</script>

<template>
  <header class="header-nav">
    <div class="nav-container">
      <div class="logo">
        <span>鬼谷奇门</span>
      </div>

      <div class="menu-toggle" @click="toggleMenu" :class="{ active: menuActive }">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav class="nav-links" :class="{ active: menuActive }">
        <RouterLink to="/home" active-class="active">首页</RouterLink>
        <RouterLink to="/qimen" active-class="active">奇门</RouterLink>
        <RouterLink to="/about" active-class="active">关于</RouterLink>
      </nav>
    </div>
  </header>

  <div class="router-view-container">
    <RouterView />
  </div>
</template>

<style>
/* 导航栏基本样式 */
.header-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(to right, #f8f8f8, #fff);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 0;
  transition: all 0.3s ease;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 5%;
  max-width: 1200px;
  margin: 0 auto;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  display: flex;
  align-items: center;
}

.logo img {
  height: 32px;
  margin-right: 8px;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-links a {
  display: block;
  padding: 1.2rem 1rem;
  color: #333;
  text-decoration: none;
  font-size: 1rem;
  position: relative;
  transition: color 0.3s;
}

.nav-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: #4CAF50;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.nav-links a:hover,
.nav-links a.active {
  color: #4CAF50;
}

.nav-links a:hover::after,
.nav-links a.active::after {
  width: 70%;
}

.menu-toggle {
  display: none;
  cursor: pointer;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
}

.menu-toggle span {
  display: block;
  height: 3px;
  width: 100%;
  border-radius: 3px;
  background: #333;
  transition: all 0.3s ease;
}

/* 路由视图容器，防止内容被fixed header遮挡 */
.router-view-container {
  margin-top: 65px;
  padding: 1rem;
  overflow-y: auto;
}

/* 移动端适配 */
@media screen and (max-width: 767px) {
  .menu-toggle {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    flex-direction: column;
    align-items: center;
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.5s ease;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .nav-links.active {
    max-height: 300px;
  }

  .nav-links a {
    width: 100%;
    text-align: center;
    padding: 1rem;
  }

  .nav-links a::after {
    bottom: 5px;
  }

  /* 汉堡菜单动画 */
  .menu-toggle.active span:nth-child(1) {
    transform: translateY(9px) rotate(45deg);
  }

  .menu-toggle.active span:nth-child(2) {
    opacity: 0;
  }

  .menu-toggle.active span:nth-child(3) {
    transform: translateY(-9px) rotate(-45deg);
  }
}
</style>
