import type { Router, RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import { routeTransition } from '../transition'
import { checkAuth, handleRedirects } from './auth'
import { applyDocumentTitle } from './title'
import { doneProgress, startProgress } from './progress'

/**
 * 计算并记录当前导航的过渡效果。
 * 只写 routeTransition，不污染路由记录的 meta。
 */
export const setRouteTransition = (to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) => {
  if (!from.matched.length) {
    routeTransition.value = 'fade-scale'
    return
  }
  if (to.meta.transition === false) {
    routeTransition.value = 'none'
    return
  }
  if (typeof to.meta.transition === 'string') {
    routeTransition.value = to.meta.transition
    return
  }

  const toDepth = to.matched.length
  const fromDepth = from.matched.length
  const isBack = toDepth < fromDepth
  const isSameLevel = toDepth === fromDepth

  routeTransition.value = to.path.includes('/detail') ? 'flip' : to.meta.isModal ? 'bounce' : isSameLevel ? 'material' : isBack ? 'slide-right' : 'slide-left'
}

export const installGuards = (router: Router) => {
  router.beforeEach(async to => {
    startProgress()
    applyDocumentTitle(to)

    const authResult = await checkAuth(to)
    if (!authResult.allow) {
      return authResult.redirect
    }

    const redirectPath = handleRedirects(to)
    if (redirectPath) {
      return { path: redirectPath, replace: true }
    }

    return true
  })

  router.afterEach((to, from) => {
    setRouteTransition(to, from)
    doneProgress()
  })
}
