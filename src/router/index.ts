import { createRouter, createWebHashHistory } from 'vue-router'
import { type RouteLocationNormalized, type RouteLocationNormalizedLoaded, type RouteRecordRaw } from 'vue-router'
import { constantRoute } from '@/router/Router.constant'
import { useIamUserStore } from '@/modules/iam/stores/IamUser.store'
import setting from '@/setting'
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'

// 配置NProgress
nprogress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...constantRoute],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' }
  }
})

// 不需要认证的白名单路由
const PUBLIC_PAGES = new Set(['/login', '/auth2/callback', '/register', '/forgot-password'])

/**
 * 查找第一个可见路由路径
 */
const findFirstVisibleRoutePath = (routes: RouteRecordRaw[]): string | undefined => {
  for (const route of routes) {
    if (route.meta?.hidden) continue

    if (route.component) return route.path
    if (route.children) {
      const childPath = findFirstVisibleRoutePath(route.children)
      if (childPath) return childPath
    }
  }
  return undefined
}

/**
 * 设置路由过渡效果
 */
const setRouteTransition = (to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) => {
  if (!from.matched.length || to.meta.transition === false) {
    return
  }
  if (to.meta.transition !== undefined) {
    return
  }

  const toDepth = to.matched.length
  const fromDepth = from.matched.length

  const isBack = toDepth < fromDepth
  const isSameLevel = toDepth === fromDepth

  // 设置默认过渡效果
  to.meta.transition = to.path.includes('/detail') ? 'flip' : to.meta.isModal ? 'bounce' : isSameLevel ? 'material' : isBack ? 'slide-right' : 'slide-left'
}

router.beforeEach(async (to, _from, next) => {
  nprogress.start()
  document.title = setting.title + '-' + to.meta.title
  const isPublicPage = PUBLIC_PAGES.has(to.path)

  // 认证检查
  const userStore = useIamUserStore()
  if (!isPublicPage && !userStore.isAuthenticated) {
    const authSuccess = await userStore.initAsyncRoute()
    if (!authSuccess) {
      return next(`/login?redirect=${to.path}`)
    }
    return next({ ...to, replace: true })
  }

  // 已认证用户访问登录页
  if (to.path === '/login' && userStore.isAuthenticated) {
    return next(to.query.redirect ? (to.query.redirect as string) : '/layout')
  }

  // 处理布局路由重定向
  if (to.path === '/layout') {
    return next(to.query.redirect ? (to.query.redirect as string) : '/home')
  }

  // 当前路由有子路由时，查找第一个可见子路由
  const matchedRoute = to.matched[to.matched.length - 1]
  if (matchedRoute?.children?.length) {
    const firstVisibleChild = findFirstVisibleRoutePath(matchedRoute.children)
    if (firstVisibleChild) {
      return next(firstVisibleChild)
    }
  }

  next()
})

router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) => {
  setRouteTransition(to, from)
  nprogress.done()
})

export default router
