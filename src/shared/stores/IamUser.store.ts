import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getRouter } from '@/shared/router/instance'
import { useSettingStore } from '@/shared/stores/SystemSetting.store'
import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
import { CORE_DICTIONARY_ENUM_NAMES } from '@/shared/constants/DictionaryEnum.constant'
import { getIamGateway } from '@/shared/api/ports/IamGateway'
import type { IamAuthInfo, IamCurrentUser, IamFunctionPermission } from '@/shared/types/Iam.type'

export const useIamUserStore = defineStore(
  'machine:iamUser',
  () => {
    // State
    const auth = ref<IamAuthInfo>({
      accessToken: '',
      refreshToken: '',
      expiresIn: 0,
      tokenType: '',
      lastRefreshTime: 0
    })

    const currentUser = ref<IamCurrentUser | null>(null)

    const permissions = ref<IamFunctionPermission>({
      roleCodeList: [],
      permissionCodeList: []
    })

    const isAuthenticated = ref(false)
    const loading = ref(false)

    // token刷新并发控制
    let refreshPromise: Promise<string> | null = null

    // Actions
    const setAuthInfo = (authInfo: IamAuthInfo) => {
      auth.value = {
        ...authInfo,
        lastRefreshTime: Date.now()
      }
      isAuthenticated.value = true
    }

    const clearAuthInfo = () => {
      useDictionaryEnumStore().clearAllEnumCache()
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
      import('@/shared/stores/IamAccess.store').then(({ useIamAccessStore }) => {
        useIamAccessStore().resetConstantRoutes()
      })
      import('@/shared/stores/LayoutTab.store').then(({ useTabStore }) => {
        const tabStore = useTabStore()
        tabStore.clearTabs()
      })
    }

    const setUserInfo = (userInfo: IamCurrentUser) => {
      currentUser.value = userInfo
    }

    const setPermissionInfo = (permissionInfo: IamFunctionPermission) => {
      permissions.value = permissionInfo
    }

    const setAuthenticated = (value: boolean) => {
      isAuthenticated.value = value
    }

    const login = async (authInfo: IamAuthInfo) => {
      try {
        loading.value = true
        setAuthInfo(authInfo)
        const [userInfo, permissionInfo] = await Promise.all([getIamGateway().getCurrentUser(), getIamGateway().getFunctionPermission()])

        setUserInfo(userInfo)
        setPermissionInfo(permissionInfo)
        const { useIamAccessStore } = await import('@/shared/stores/IamAccess.store')
        const routeReady = await useIamAccessStore().setAsyncRoute()
        if (!routeReady) {
          clearAuthInfo()
          return false
        }
        useDictionaryEnumStore()
          .preloadEnums([...CORE_DICTIONARY_ENUM_NAMES])
          .catch(() => {})
        useSettingStore().setIsCollapse(true)
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
        await getIamGateway().logout()
      } finally {
        clearAuthInfo()
        getRouter().push('/website')
      }
    }

    const refreshToken = async (): Promise<string> => {
      if (!auth.value.refreshToken) {
        throw new Error('No refresh token available')
      }

      try {
        const authInfo = await getIamGateway().refreshAccessToken(auth.value.refreshToken)
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
      const expiresAt = (auth.value.lastRefreshTime ?? 0) + auth.value.expiresIn * 1000
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

    const getPermissionInfo = (): IamFunctionPermission => {
      return permissions.value
    }

    return {
      // State
      auth,
      currentUser,
      permissions,
      isAuthenticated,
      loading,

      // Actions
      setAuthInfo,
      clearAuthInfo,
      setUserInfo,
      setPermissionInfo,
      setAuthenticated,
      login,
      logout,
      refreshToken,
      isTokenValid,
      getValidToken,
      getPermissionInfo
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['auth']
    }
  }
)

export default useIamUserStore
