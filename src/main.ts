import App from '@/App.vue'
import router from '@/router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import '@/styles/index.scss'
import '@/styles/portal/index.scss'
import 'virtual:svg-icons-register'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { permissionDirective } from '@/shared/directives/Permission.directive'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import { useIamUserStore } from '@/shared/stores/IamUser.store'

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

const app = createApp(App)

app.use(pinia)
app.use(ElementPlus, { locale: zhCn })
app.use(permissionDirective)

// 自动注册 Element Plus 全部图标，支持模板中 `el-icon-XXX` 字符串引用（路由 meta.icon / 门户卡片 icon）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(`el-icon-${key}`, component)
}

// 初始化异步路由后再挂载应用
const userStore = useIamUserStore(pinia)
userStore
  .initAsyncRoute()
  .catch(() => {
    // 忽略初始化失败，路由守卫会处理未登录等情况
  })
  .finally(() => {
    app.use(router)
    app.mount('#app')
  })
