import { ref } from 'vue'
import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash-es'
import type { RouteRecordRaw } from 'vue-router'
import { getRouter, getConstantRoutes } from '@/shared/router/instance'
import { PermissionUtil } from '@/shared/utils/Permission.util'
import { getIamGateway } from '@/shared/api/ports/IamGateway'
import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'
import type { PermissionTreeNode } from '@/shared/types/Permission.type'
import { useIamUserStore } from '@/shared/stores/IamUser.store'

export const useIamAccessStore = defineStore('machine:iamAccess', () => {
  const menuRouters = ref<ExtendedRouteRecordRaw[]>([])
  const routeLoading = ref(false)
  const routeError = ref<Error | null>(null)
  let routeLoadingPromise: Promise<boolean> | null = null
  let routeInitPromise: Promise<boolean> | null = null

  const resetConstantRoutes = () => {
    const router = getRouter()
    getConstantRoutes().forEach(route => {
      if (route.name) {
        router.addRoute(route as RouteRecordRaw)
      }
    })
    menuRouters.value = router.getRoutes()
  }

  const setAsyncRoute = async (): Promise<boolean> => {
    if (routeLoading.value && routeLoadingPromise) {
      return routeLoadingPromise
    }

    routeLoading.value = true
    routeError.value = null

    routeLoadingPromise = (async (): Promise<boolean> => {
      const userStore = useIamUserStore()
      const router = getRouter()
      try {
        const constantRouteClone = cloneDeep(getConstantRoutes())
        const permissionTree: PermissionTreeNode[] = await getIamGateway().getPermissionTree()

        if (permissionTree.length === 0) {
          routeError.value = new Error('权限树为空')
          return false
        }

        const filterButtonTree = PermissionUtil.removeButtonNodes(permissionTree)
        const filterPermissionTree = PermissionUtil.filterByPermissionCodes(filterButtonTree, userStore.permissions.permissionCodeList)
        const permissionTreeRoutes = PermissionUtil.convertPermissionTreeToRoutes(filterPermissionTree)

        const findRouteByCode = (routes: ExtendedRouteRecordRaw[], code: string): ExtendedRouteRecordRaw | undefined => {
          for (const route of routes) {
            if (route.meta?.code === code) return route
            if (route.children) {
              const found = findRouteByCode(route.children, code)
              if (found) return found
            }
          }
          return undefined
        }
        const layoutRoute = findRouteByCode(constantRouteClone, 'ADMIN:LAYOUT')
        if (layoutRoute) {
          ;(layoutRoute.children ??= []).push(...permissionTreeRoutes)
        }

        // 同名 top-level 记录会连同其子路由一起被替换，动态子路由不需要 name
        constantRouteClone.forEach((route: ExtendedRouteRecordRaw) => {
          router.addRoute(route as RouteRecordRaw)
        })

        menuRouters.value = router.getRoutes()
        return true
      } catch (error) {
        routeError.value = error as Error
        console.error('路由加载失败:', {
          error,
          user: userStore.currentUser?.username,
          timestamp: new Date().toISOString()
        })
        return false
      } finally {
        routeLoading.value = false
        routeLoadingPromise = null
      }
    })()

    return routeLoadingPromise
  }

  const initAsyncRoute = async (): Promise<boolean> => {
    if (routeInitPromise) return routeInitPromise

    routeInitPromise = (async () => {
      const userStore = useIamUserStore()
      if (!userStore.auth.refreshToken) return false

      try {
        if (!userStore.isTokenValid()) {
          await userStore.refreshToken()
        }

        const [userInfo, permissionInfo] = await Promise.all([getIamGateway().getCurrentUser(), getIamGateway().getFunctionPermission()])

        userStore.setUserInfo(userInfo)
        userStore.setPermissionInfo(permissionInfo)
        await setAsyncRoute()
        userStore.setAuthenticated(true)
        return true
      } catch (error) {
        userStore.clearAuthInfo()
        throw error
      }
    })().finally(() => {
      routeInitPromise = null
    })

    return routeInitPromise
  }

  return {
    menuRouters,
    routeLoading,
    routeError,
    resetConstantRoutes,
    setAsyncRoute,
    initAsyncRoute
  }
})

export default useIamAccessStore
