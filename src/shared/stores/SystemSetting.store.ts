import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSettingStore = defineStore(
  'machine:setting',
  () => {
    // State
    const isCollapse = ref(false)
    const isRefresh = ref(false)

    // Actions
    const setIsCollapse = (value: boolean) => {
      isCollapse.value = value
    }

    const getIsCollapse = () => {
      return isCollapse.value
    }

    const setIsRefresh = (value: boolean) => {
      isRefresh.value = value
    }

    const getIsRefresh = () => {
      return isRefresh.value
    }

    const clearInfo = () => {
      isCollapse.value = false
      isRefresh.value = false
    }

    return {
      // State
      isCollapse,
      isRefresh,

      // Actions
      setIsCollapse,
      getIsCollapse,
      setIsRefresh,
      getIsRefresh,
      clearInfo
    }
  },
  {
    persist: {
      storage: localStorage,
      pick: ['isCollapse', 'isRefresh']
    }
  }
)

export default useSettingStore
