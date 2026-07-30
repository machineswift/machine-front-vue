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
import {
  // 已注册的图标（保留）
  Expand,
  Fold,
  ArrowRight,
  Refresh,
  FullScreen,
  Setting,
  Sunny,
  Moon,
  SetUp,
  Lock,
  Connection,
  Cpu,
  DataAnalysis,
  Notification,
  View,
  Position,
  Phone,
  Message,
  AlarmClock,
  // 路由配置中缺失的图标（补充）
  House,
  Tools,
  Collection,
  Trophy,
  Shop,
  LocationInformation,
  Picture,
  CollectionTag,
  User,
  Avatar,
  OfficeBuilding,
  Document,
  Notebook,
  Key,
  Monitor,
  Van,
  Menu,
  List,
  Goods,
  Discount,
  Box,
  Tickets,
  Management,
  DocumentAdd,
  UploadFilled,
  Bell,
  UserFilled,
  Finished,
  Operation,
  VideoPlay,
  WarningFilled,
  Money,
  Grid,
  FolderOpened,
  Folder,
  Star,
  Promotion,
  MagicStick,
  DataLine
} from '@element-plus/icons-vue'
import { permissionDirective } from '@/shared/directives/Permission.directive'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import { useIamUserStore } from '@/shared/stores/IamUser.store'

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

const app = createApp(App)

app.use(pinia)
app.use(ElementPlus, { locale: zhCn })
app.use(permissionDirective)

// 注册模板中通过 `el-icon-XXX` 字符串引用的图标（路由 meta.icon / 门户卡片 icon）
const stringIcons: Record<string, unknown> = {
  // 基础
  Expand,
  Fold,
  ArrowRight,
  Refresh,
  FullScreen,
  Setting,
  Sunny,
  Moon,
  SetUp,
  Lock,
  Connection,
  Cpu,
  DataAnalysis,
  Notification,
  View,
  Position,
  Phone,
  Message,
  AlarmClock,
  // 路由菜单图标
  House,
  Tools,
  Collection,
  Trophy,
  Shop,
  LocationInformation,
  Picture,
  CollectionTag,
  User,
  Avatar,
  OfficeBuilding,
  Document,
  Notebook,
  Key,
  Monitor,
  Van,
  Menu,
  List,
  Goods,
  Discount,
  Box,
  Tickets,
  Management,
  DocumentAdd,
  UploadFilled,
  Bell,
  UserFilled,
  Finished,
  Operation,
  VideoPlay,
  WarningFilled,
  Money,
  Grid,
  FolderOpened,
  Folder,
  Star,
  Promotion,
  MagicStick,
  DataLine
}
for (const [key, component] of Object.entries(stringIcons)) {
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
