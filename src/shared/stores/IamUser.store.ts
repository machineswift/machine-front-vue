import { ref } from 'vue'
import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash-es'
import router from '@/router'
import { PermissionUtil } from '@/shared/utils/Permission.util'
import { constantRoute } from '@/shared/constants/Route.constant'
import type { ExtendedRouteRecordRaw } from '@/shared/types/Router.type'
import { IamAuthApi } from '@/modules/iam/auth/api/IamAuth.api'
import { IamCurrentApi } from '@/modules/iam/auth/api/IamCurrent.api'
import { IamPermissionApi } from '@/modules/iam/permission/api/IamPermission.api'
import type { IamAuthLoginResponseVo } from '@/modules/iam/auth/type/IamAuth.type'
import type { IamAuthCurrentUserResponseVo, IamAuthCurrentUserFunctionPermissionResponseVo } from '@/modules/iam/auth/type/IamCurrent.type'
import type { IamPermissionTreeSimpleResponseVo } from '@/modules/iam/permission/type/IamPermission.type'
import type { RouteRecordNormalized } from 'vue-router'

export const useIamUserStore = defineStore(
  'machine:iamUser',
  () => {
    // State
    const auth = ref<IamAuthLoginResponseVo>({
      accessToken: '',
      refreshToken: '',
      expiresIn: 0,
      tokenType: '',
      lastRefreshTime: 0
    })

    const currentUser = ref<IamAuthCurrentUserResponseVo | null>(null)

    const permissions = ref<IamAuthCurrentUserFunctionPermissionResponseVo>({
      roleCodeList: [],
      permissionCodeList: []
    })

    const menuRouters = ref<ExtendedRouteRecordRaw[]>(constantRoute)
    const isAuthenticated = ref(false)
    const loading = ref(false)

    // 路由加载状态管理
    const routeLoading = ref(false)
    const routeError = ref<Error | null>(null)
    let routeLoadingPromise: Promise<boolean> | null = null

    // token刷新并发控制
    let refreshPromise: Promise<string> | null = null

    // Actions
    const setAuthInfo = (authInfo: IamAuthLoginResponseVo) => {
      auth.value = {
        ...authInfo,
        lastRefreshTime: Date.now()
      }
      isAuthenticated.value = true
    }

    /**
     * 删除所有动态路由
     */
    const removeDynamicRoutes = () => {
      const routes = router.getRoutes()
      routes.forEach((route: RouteRecordNormalized) => {
        // 只删除标记为动态路由的路由
        if (route.meta?.isDynamic && route.name) {
          router.removeRoute(route.name)
        }
      })
    }

    const clearAuthInfo = () => {
      auth.value = {
        accessToken: '',
        refreshToken: '',
        expiresIn: 0,
        tokenType: '',
        lastRefreshTime: 0
      }
      currentUser.value = null
      permissions.value = {
        roleCodeList: [],
        permissionCodeList: []
      }
      isAuthenticated.value = false
      // 清除暗黑模式（避免影响登录页样式）
      document.documentElement.className = ''
      // 清除动态路由
      removeDynamicRoutes()
      // 重置路由为静态路由
      menuRouters.value = constantRoute
      routeError.value = null
      // 清空标签页
      import('@/shared/stores/LayoutTab.store').then(({ useTabStore }) => {
        const tabStore = useTabStore()
        tabStore.clearTabs()
      })
    }

    const setUserInfo = (userInfo: IamAuthCurrentUserResponseVo) => {
      currentUser.value = userInfo
    }

    const setPermissionInfo = (permissionInfo: IamAuthCurrentUserFunctionPermissionResponseVo) => {
      permissions.value = permissionInfo
    }

    const login = async (authInfo: IamAuthLoginResponseVo) => {
      try {
        loading.value = true
        menuRouters.value = constantRoute
        setAuthInfo(authInfo)
        const [userInfo, permissionInfo] = await Promise.all([IamCurrentApi.getCurrentUser(), IamCurrentApi.getFunctionPermission()])

        setUserInfo(userInfo)
        setPermissionInfo(permissionInfo)
        const routeReady = await setAsyncRoute()
        if (!routeReady) {
          clearAuthInfo()
          return false
        }
        return true
      } catch (error) {
        clearAuthInfo()
        throw error
      } finally {
        loading.value = false
      }
    }

    const logout = async () => {
      try {
        await IamAuthApi.logout()
      } finally {
        clearAuthInfo()
        router.push('/website')
      }
    }

    const refreshToken = async (): Promise<string> => {
      if (!auth.value.refreshToken) {
        throw new Error('No refresh token available')
      }

      try {
        const authInfo = await IamAuthApi.getAccessToken({
          refreshToken: auth.value.refreshToken
        })
        setAuthInfo({
          ...authInfo,
          refreshToken: auth.value.refreshToken
        })
        return authInfo.accessToken
      } catch (error) {
        clearAuthInfo()
        throw error
      }
    }

    const isTokenValid = (): boolean => {
      if (!auth.value.accessToken || !auth.value.expiresIn) {
        return false
      }
      const expiresAt = auth.value.lastRefreshTime + auth.value.expiresIn * 1000
      const now = Date.now()
      return now < expiresAt - 300000
    }

    const getValidToken = async (): Promise<string> => {
      if (isTokenValid()) {
        return auth.value.accessToken
      }

      // 如果已经有刷新操作在进行中，复用同一个 Promise，避免并发刷新
      if (refreshPromise) {
        return refreshPromise
      }

      try {
        refreshPromise = refreshToken()
        return await refreshPromise
      } catch (error) {
        clearAuthInfo()
        throw error
      } finally {
        refreshPromise = null
      }
    }

    const initAsyncRoute = async (): Promise<boolean> => {
      if (auth.value.refreshToken) {
        try {
          if (!isTokenValid()) {
            await refreshToken()
          }

          const [userInfo, permissionInfo] = await Promise.all([IamCurrentApi.getCurrentUser(), IamCurrentApi.getFunctionPermission()])

          setUserInfo(userInfo)
          setPermissionInfo(permissionInfo)
          await setAsyncRoute()
          isAuthenticated.value = true
          return true
        } catch (error) {
          clearAuthInfo()
          throw error
        }
      }
      return false
    }

    /**
     * 设置动态路由
     * 添加了防重复调用机制和错误处理
     */
    const setAsyncRoute = async (): Promise<boolean> => {
      // 防重复调用：如果正在加载，返回同一个 Promise
      if (routeLoading.value && routeLoadingPromise) {
        return routeLoadingPromise
      }

      routeLoading.value = true
      routeError.value = null

      routeLoadingPromise = (async (): Promise<boolean> => {
        try {
          // 先删除现有的动态路由
          removeDynamicRoutes()

          const constantRouteClone = cloneDeep(constantRoute)
          const permissionTree: IamPermissionTreeSimpleResponseVo[] = (await IamPermissionApi.treeSimple({ id: 'manage_app' })).children

          if (permissionTree.length === 0) {
            routeError.value = new Error('权限树为空')
            return false
          }

          const filterButtonTree = PermissionUtil.removeButtonNodes(permissionTree)
          const filterPermissionTree = PermissionUtil.filterByPermissionCodes(filterButtonTree, permissions.value.permissionCodeList)
          const permissionTreeRoutes = PermissionUtil.convertPermissionTreeToRoutes(filterPermissionTree)

          // 递归查找 ADMIN:LAYOUT（可能在 ADMIN 容器下嵌套）
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
            layoutRoute.children.push(...permissionTreeRoutes)
          }

          // 重新注册所有路由（静态路由 + 动态路由）
          constantRouteClone.forEach((route: ExtendedRouteRecordRaw) => {
            router.addRoute(route)
          })

          menuRouters.value = router.getRoutes()
          return true
        } catch (error) {
          routeError.value = error as Error
          console.error('路由加载失败:', {
            error,
            user: currentUser.value?.username,
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

    const getPermissionInfo = (): IamAuthCurrentUserFunctionPermissionResponseVo => {
      return permissions.value
    }

    return {
      // State
      auth,
      currentUser,
      permissions,
      menuRouters,
      isAuthenticated,
      loading,
      routeLoading,
      routeError,

      // Actions
      setAuthInfo,
      clearAuthInfo,
      setUserInfo,
      setPermissionInfo,
      login,
      logout,
      refreshToken,
      isTokenValid,
      getValidToken,
      initAsyncRoute,
      setAsyncRoute,
      getPermissionInfo,
      removeDynamicRoutes
    }
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'machine:iamUser',
          storage: localStorage,
          paths: ['auth']
        }
      ]
    }
  }
)

export default useIamUserStore
