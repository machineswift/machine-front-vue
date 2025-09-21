import App from '@/App.vue'
import router from '@/router'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import '@/styles/index.scss'
import 'virtual:svg-icons-register'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { permissionDirective } from '@/modules/common/directive/Permission.directive'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import { useIamUserStore } from '@/modules/iam/stores/IamUser.store'

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

const app = createApp(App)

// 使用 Pinia
app.use(pinia)

// 初始化路由
const userStore = useIamUserStore()
userStore.initAsyncRoute()

// 然后注册全局组件
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(`el-icon-${key}`, component)
}

// 权限指令
app.use(permissionDirective)

app.use(ElementPlus, {
  locale: zhCn
})
app.use(router)

app.mount('#app')
