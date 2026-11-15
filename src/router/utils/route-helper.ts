import type { RouteRecordRaw } from 'vue-router'

/**
 * 查找第一个可见路由路径
 */
export const findFirstVisibleRoutePath = (routes: RouteRecordRaw[]): string | undefined => {
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
 * 过滤隐藏的路由
 */
export const filterHiddenRoutes = <T extends RouteRecordRaw>(routes: T[]): T[] => {
  return routes
    .filter(route => !route.meta?.hidden)
    .map(route => ({
      ...route,
      children: route.children ? filterHiddenRoutes(route.children) : undefined
    })) as T[]
}
