import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import { useIamUserStore } from '@/modules/iam/stores/IamUser.store'
import { findFirstVisibleRoutePath } from './utils/route-helper'

/**
 * 不需要认证的白名单路由
 */
export const PUBLIC_PAGES = new Set(['/login', '/auth2/callback', '/register', '/forgot-password'])

/**
 * 设置路由过渡效果
 */
export const setRouteTransition = (to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) => {
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

/**
 * 检查认证状态
 */
export const checkAuth = async (to: RouteLocationNormalized) => {
  const isPublicPage = PUBLIC_PAGES.has(to.path)
  if (isPublicPage) {
    return { allow: true }
  }

  const userStore = useIamUserStore()
  if (!userStore.isAuthenticated) {
    // 如果未登录，清空标签页
    const { useTabStore } = await import('@/modules/common/stores/Tab.store')
    const tabStore = useTabStore()
    tabStore.clearTabs()

    const authSuccess = await userStore.initAsyncRoute()
    if (!authSuccess) {
      return { allow: false, redirect: `/login?redirect=${to.path}` }
    }
    return { allow: true, replace: true }
  }

  return { allow: true }
}

/**
 * 处理路由重定向
 */
export const handleRedirects = (to: RouteLocationNormalized) => {
  const userStore = useIamUserStore()

  // 已认证用户访问登录页
  if (to.path === '/login' && userStore.isAuthenticated) {
    return to.query.redirect ? (to.query.redirect as string) : '/layout'
  }

  // 处理布局路由重定向
  if (to.path === '/layout') {
    return to.query.redirect ? (to.query.redirect as string) : '/home'
  }

  // 当前路由有子路由时，查找第一个可见子路由
  const matchedRoute = to.matched[to.matched.length - 1]
  if (matchedRoute?.children?.length) {
    const firstVisibleChild = findFirstVisibleRoutePath(matchedRoute.children)
    if (firstVisibleChild) {
      return firstVisibleChild
    }
  }

  return null
}
