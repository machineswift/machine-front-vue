import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import { constantRoute } from '@/shared/constants/Route.constant'
import { checkAuth, handleRedirects, setRouteTransition } from './guards'
import setting from '@/setting'
import nprogress from 'nprogress'
import 'nprogress/nprogress.css'

/**
 * 配置NProgress
 */
nprogress.configure({ showSpinner: false })

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...constantRoute],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' }
  }
})

router.beforeEach(async (to, _from) => {
  nprogress.start()
  document.title = `${setting.title}-${to.meta.title || ''}`

  // 认证检查
  const authResult = await checkAuth(to)
  if (!authResult.allow) {
    return authResult.redirect
  }

  // 处理重定向
  const redirectPath = handleRedirects(to)
  if (redirectPath) {
    return authResult.replace ? { path: redirectPath, replace: true } : redirectPath
  }
})

router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalizedLoaded) => {
  setRouteTransition(to, from)
  nprogress.done()
})

export default router
