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
import { setUnauthorizedHandler } from '@/shared/utils/Request.util'
import { installBiamGateway } from '@/modules/biam/gateway'
import { installBiamQuickSelect } from '@/modules/biam/quick-select'
import { installDataQuickSelect } from '@/modules/data/quick-select'

// 装配层注入 IAM 端口实现，避免 shared 反向依赖 modules/biam
installBiamGateway()
// 跨模块快速选择器由各自领域注册，页面只通过 shared 的 QuickSelectHost 使用
installBiamQuickSelect()
installDataQuickSelect()

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

const app = createApp(App)

// 兜底错误处理：避免组件内异常只出现在控制台而没有任何统一出口
app.config.errorHandler = (err, _instance, info) => {
  console.error(`[Vue error] ${info}`, err)
}

app.use(pinia)
app.use(ElementPlus, { locale: zhCn })
app.use(permissionDirective)

// 自动注册 Element Plus 全部图标，支持模板中 `el-icon-XXX` 字符串引用（路由 meta.icon / 门户卡片 icon）
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(`el-icon-${key}`, component)
}

app.use(router)
// 认证失效由装配层负责跳转：请求层不再依赖 vue-router 的 inject 上下文
setUnauthorizedHandler(() => {
  const current = router.currentRoute.value
  if (current.path === '/admin/login') return
  router.replace({ path: '/admin/login', query: { redirect: current.fullPath } })
})

// 立即挂载，动态路由由认证守卫在首次导航时注册，避免权限接口慢导致首屏长时间空白
app.mount('#app')
router.isReady().finally(() => {
  document.getElementById('app-boot')?.remove()
})
