import './assets/main.css'
import './assets/theme.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useThemeStore } from './stores/theme'
import { useAuthStore } from './stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 初始化主题
const themeStore = useThemeStore()
themeStore.initTheme()

// 初始化认证状态
const authStore = useAuthStore()
// 如果有token，验证其有效性
if (authStore.token) {
  authStore.checkAuth().catch(() => {
    // 如果token无效，清除本地状态
    console.log('Token已过期，清除本地状态')
  })
}

app.mount('#app')


