/** 首页 App 数据模型 */
export interface HomeAppItem {
  /** 权限码（路由 meta.code），作为唯一标识 */
  code: string
  /** 名称 */
  title: string
  /** 图标：el-icon-XXX 或 svg 图标名 */
  icon: string
  /** 点击后跳转的路径 */
  path: string
  /** 是否首页（固定在程序坞第一位） */
  isHome?: boolean
}

/** 应用中心入口（程序坞固定首位，类似 macOS 的 Finder） */
export const HOME_APP_ITEM: HomeAppItem = {
  code: 'ADMIN:HOME',
  title: '应用中心',
  icon: 'el-icon-Grid',
  path: '/admin/home',
  isHome: true
}
