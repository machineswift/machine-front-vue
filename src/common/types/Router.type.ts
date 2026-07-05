import type { RouteRecordRaw } from 'vue-router'

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

export interface ExtendedRouteRecordRaw extends Omit<RouteRecordRaw, 'meta'> {
  meta?: RouteMeta
  children?: ExtendedRouteRecordRaw[]
}
