import type { Router } from 'vue-router'
import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'

/**
 * 路由实例的持有者。
 *
 * 存在的意义是打破 `router/index -> guards -> store -> router/index` 的静态循环依赖：
 * store 等共享层只依赖这个轻量模块，真正的 Router 实例由 router/index 在创建后注入。
 */
let routerInstance: Router | null = null

export function setRouter(instance: Router): void {
  routerInstance = instance
}

export function getRouter(): Router {
  if (!routerInstance) {
    throw new Error('Router 尚未初始化：请先在 router/index.ts 中调用 setRouter(router)')
  }
  return routerInstance
}

/**
 * 静态路由表的持有者。
 *
 * 路由配置属于 router 层；shared 只保存引用，避免 store 反向 import `@/router`。
 * 由 router/index.ts 在创建路由后注入。
 */
let constantRoutes: ExtendedRouteRecordRaw[] = []

export function setConstantRoutes(routes: ExtendedRouteRecordRaw[]): void {
  constantRoutes = routes
}

export function getConstantRoutes(): ExtendedRouteRecordRaw[] {
  return constantRoutes
}
