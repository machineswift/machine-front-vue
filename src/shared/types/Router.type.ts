import type { RouteRecordRaw, RouteMeta } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    code?: string
    title?: string
    icon?: string
    hidden?: boolean
    keepAlive?: boolean
    transition?: string | false
    isModal?: boolean
    isDynamic?: boolean
    requiresAuth?: boolean
  }
}

export type ExtendedRouteRecordRaw = Omit<RouteRecordRaw, 'meta' | 'children'> & {
  meta?: RouteMeta
  children?: ExtendedRouteRecordRaw[]
}
