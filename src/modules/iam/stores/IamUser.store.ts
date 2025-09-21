import { ref } from 'vue'
import { defineStore } from 'pinia'
import { cloneDeep } from 'lodash'
import router from '@/router'
import { PermissionUtil } from '@/modules/common/utils/Permission.util'
import { constantRoute } from '@/router/Router.constant'
import type { ExtendedRouteRecordRaw } from '@/modules/common/types/Router.type'
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

    // Actions
    const setAuthInfo = (authInfo: IamAuthLoginResponseVo) => {
      auth.value = {
        ...authInfo,
        lastRefreshTime: Date.now()
      }
      isAuthenticated.value = true
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
        await setAsyncRoute()
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
        router.push({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath }
        })
      }
    }

    const refreshToken = async (): Promise<string> => {
      if (!auth.value.refreshToken) {
        throw new Error('No refresh token available')
      }

      try {
        const authInfo = await IamAuthApi.getAccessToken(auth.value.refreshToken)
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
      try {
        return await refreshToken()
      } catch (error) {
        clearAuthInfo()
        throw error
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

    const setAsyncRoute = async (): Promise<boolean> => {
      const constantRouteClone = cloneDeep(constantRoute)
      const permissionTree: IamPermissionTreeSimpleResponseVo[] = (await IamPermissionApi.treeSimple({ id: 'manage_app' })).children

      if (permissionTree.length === 0) {
        return false
      }

      const filterButtonTree = PermissionUtil.removeButtonNodes(permissionTree)
      const filterPermissionTree = PermissionUtil.filterByPermissionCodes(filterButtonTree, permissions.value.permissionCodeList)
      const permissionTreeRoutes = PermissionUtil.convertPermissionTreeToRoutes(filterPermissionTree)

      const layoutRoute = constantRouteClone.find((route: ExtendedRouteRecordRaw) => route.meta?.code === 'LAYOUT')

      if (layoutRoute) {
        layoutRoute.children.push(...permissionTreeRoutes)
      }

      const existingRoutes = router.getRoutes()
      existingRoutes.forEach((route: RouteRecordNormalized) => {
        if (route.name) router.removeRoute(route.name)
      })

      constantRouteClone.forEach((route: ExtendedRouteRecordRaw) => {
        router.addRoute(route)
      })

      menuRouters.value = router.getRoutes()
      return true
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
      getPermissionInfo
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
