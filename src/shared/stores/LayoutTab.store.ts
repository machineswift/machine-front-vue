import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { RouteLocationNormalized, RouteLocationQuery, RouteParams } from 'vue-router'

export interface TabItem {
  path: string
  fullPath: string
  name?: string
  title: string
  icon?: string
  fixed?: boolean
  keepAlive?: boolean
  query?: RouteLocationQuery
  params?: RouteParams
  // 存储标签页的状态数据（如筛选条件等）
  state?: Record<string, unknown>
}

export const useTabStore = defineStore(
  'machine:tab',
  () => {
    // State
    const tabs = ref<TabItem[]>([])
    const activeTabPath = ref<string>('')

    // Getters
    const activeTab = computed(() => {
      return tabs.value.find(tab => tab.fullPath === activeTabPath.value)
    })

    const fixedTabs = computed(() => {
      return tabs.value.filter(tab => tab.fixed)
    })

    const unfixedTabs = computed(() => {
      return tabs.value.filter(tab => !tab.fixed)
    })

    // Actions
    /**
     * 添加标签页
     */
    const addTab = (route: RouteLocationNormalized) => {
      // 如果路由隐藏，不添加标签页
      if (route.meta?.hidden) {
        return
      }

      const fullPath = route.fullPath
      const existingTab = tabs.value.find(tab => tab.fullPath === fullPath)

      if (!existingTab) {
        const tab: TabItem = {
          path: route.path,
          fullPath,
          name: route.name as string,
          title: (route.meta?.title as string) || route.name || '未命名',
          icon: route.meta?.icon as string,
          fixed: false,
          keepAlive: route.meta?.keepAlive !== false,
          query: route.query,
          params: route.params,
          state: {} // 初始化状态存储
        }
        tabs.value.push(tab)
      }

      setActiveTab(fullPath)
    }

    /**
     * 设置活动标签页
     */
    const setActiveTab = (fullPath: string) => {
      activeTabPath.value = fullPath
    }

    /**
     * 关闭标签页
     */
    const closeTab = (fullPath: string) => {
      const index = tabs.value.findIndex(tab => tab.fullPath === fullPath)
      if (index === -1) return

      const tab = tabs.value[index]

      // 如果是固定标签页，不允许关闭
      if (tab.fixed) {
        return
      }

      tabs.value.splice(index, 1)

      // 如果关闭的是当前活动标签页，需要切换到其他标签页
      if (fullPath === activeTabPath.value) {
        if (tabs.value.length > 0) {
          // 优先切换到右侧的标签页，如果没有则切换到左侧
          const nextTab = tabs.value[index] || tabs.value[index - 1]
          if (nextTab) {
            setActiveTab(nextTab.fullPath)
          }
        }
      }
    }

    /**
     * 固定/取消固定标签页
     */
    const toggleFixed = (fullPath: string) => {
      const tab = tabs.value.find(tab => tab.fullPath === fullPath)
      if (tab) {
        tab.fixed = !tab.fixed
        // 重新排序：固定标签在前，非固定在后
        sortTabs()
      }
    }

    /**
     * 刷新标签页
     */
    const refreshTab = (fullPath: string) => {
      const tab = tabs.value.find(tab => tab.fullPath === fullPath)
      if (tab) {
        // 触发刷新事件，由 LayoutMain 监听处理
        tab.keepAlive = false
        setTimeout(() => {
          tab.keepAlive = true
        }, 100)
      }
    }

    /**
     * 更新标签页顺序（拖拽排序）
     */
    const updateTabOrder = (newTabs: TabItem[]) => {
      // 保持固定标签在前
      const fixed = newTabs.filter(tab => tab.fixed)
      const unfixed = newTabs.filter(tab => !tab.fixed)
      tabs.value = [...fixed, ...unfixed]
    }

    /**
     * 排序标签页（固定标签在前）
     */
    const sortTabs = () => {
      const fixed = tabs.value.filter(tab => tab.fixed)
      const unfixed = tabs.value.filter(tab => !tab.fixed)
      tabs.value = [...fixed, ...unfixed]
    }

    /**
     * 清除所有标签页
     */
    const clearTabs = () => {
      tabs.value = []
      activeTabPath.value = ''
    }

    /**
     * 更新标签页状态
     */
    const updateTabState = (fullPath: string, state: Record<string, unknown>) => {
      const tab = tabs.value.find(tab => tab.fullPath === fullPath)
      if (tab) {
        tab.state = { ...tab.state, ...state }
      }
    }

    /**
     * 获取标签页状态
     */
    const getTabState = (fullPath: string): Record<string, unknown> | undefined => {
      const tab = tabs.value.find(tab => tab.fullPath === fullPath)
      return tab?.state
    }

    return {
      // State
      tabs,
      activeTabPath,

      // Getters
      activeTab,
      fixedTabs,
      unfixedTabs,

      // Actions
      addTab,
      setActiveTab,
      closeTab,
      toggleFixed,
      refreshTab,
      updateTabOrder,
      sortTabs,
      clearTabs,
      updateTabState,
      getTabState
    }
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'machine:tab',
          storage: localStorage,
          paths: ['tabs', 'activeTabPath']
        }
      ]
    }
  }
)

export default useTabStore
