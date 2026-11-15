import type { RouteLocationNormalized } from 'vue-router'
import { useIamUserStore } from '@/shared/stores/IamUser.store'
import { useIamAccessStore } from '@/shared/stores/IamAccess.store'
import { useTabStore } from '@/shared/stores/LayoutTab.store'
import { findFirstVisibleRoutePath } from '../utils/route-helper'

const AUTH_INIT_TIMEOUT = 10_000

let initPromise: Promise<boolean> | null = null

const withTimeout = <T>(promise: Promise<T>, timeout: number, message: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), timeout)
    promise.then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      error => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}

const initializeAuthRoutes = (store: ReturnType<typeof useIamAccessStore>): Promise<boolean> => {
  if (!initPromise) {
    initPromise = withTimeout(store.initAsyncRoute(), AUTH_INIT_TIMEOUT, '认证初始化超时').finally(() => {
      initPromise = null
    })
  }
  return initPromise
}

/**
 * 认证守卫：公开路由直接放行；受保护路由在守卫内完成动态路由注册，避免阻塞应用挂载。
 */
export const checkAuth = async (to: RouteLocationNormalized) => {
  const isCatchAll = to.matched.some(r => r.name === 'ANY')
  if (isCatchAll) {
    return { allow: true }
  }

  const userStore = useIamUserStore()

  // 公开页：登录页带持久化 token 时先恢复会话，便于 handleRedirects 跳回首页
  if (to.meta.public) {
    if (to.path === '/admin/login' && userStore.auth.refreshToken && !userStore.isAuthenticated) {
      try {
        await initializeAuthRoutes(useIamAccessStore())
      } catch {
        // 初始化失败按未登录处理，登录页正常展示
      }
      return { allow: true }
    }
    return { allow: true }
  }

  if (!userStore.isAuthenticated) {
    useTabStore().clearTabs()
    try {
      const ready = await initializeAuthRoutes(useIamAccessStore())
      if (!ready) {
        return { allow: false, redirect: `/admin/login?redirect=${to.path}` }
      }
    } catch {
      return { allow: false, redirect: `/admin/login?redirect=${to.path}` }
    }
    // 动态路由在本次导航之后才注册，按原地址重新解析一次
    return { allow: false, redirect: to.fullPath }
  }

  return { allow: true }
}

/**
 * 重定向守卫：登录页回跳、布局入口、父路由自动落到第一个可见子路由。
 */
export const handleRedirects = (to: RouteLocationNormalized) => {
  const userStore = useIamUserStore()

  if (to.path === '/admin/login' && userStore.isAuthenticated) {
    return to.query.redirect ? (to.query.redirect as string) : '/admin/home'
  }

  const matchedRoute = to.matched[to.matched.length - 1]
  if (matchedRoute?.children?.length) {
    const hasDefaultChild = matchedRoute.children.some(c => c.path === '' || c.path === '/')
    if (!hasDefaultChild) {
      const firstVisibleChild = findFirstVisibleRoutePath(matchedRoute.children)
      if (firstVisibleChild) {
        return firstVisibleChild
      }
    }
  }

  return null
}
