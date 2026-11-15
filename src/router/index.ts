import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { constantRoute } from './routes/constant'
import { registerRouteDefinitions } from '@/shared/utils/RouteLookup.util'
import { asyncRoute } from './modules'
import { installGuards } from './guards'
import { setConstantRoutes, setRouter } from '@/shared/router/instance'
import 'nprogress/nprogress.css'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [...constantRoute] as RouteRecordRaw[],
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { top: 0, behavior: 'smooth' }
  }
})

setConstantRoutes(constantRoute)
setRouter(router)
registerRouteDefinitions(asyncRoute)
installGuards(router)

export default router
