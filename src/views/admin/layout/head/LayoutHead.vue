<template>
  <div class="head">
    <!-- 顶部操作栏 -->
    <div class="head_top">
      <div class="head_left">
        <LayoutHeadLeft></LayoutHeadLeft>
      </div>
      <div class="head_right">
        <LayoutHeadRight></LayoutHeadRight>
      </div>
    </div>

    <!-- 标签页栏 -->
    <div class="head_tabs">
      <LayoutTabs></LayoutTabs>

      <!-- 标签页工具栏：更多操作 -->
      <div class="tab-toolbar">
        <el-dropdown trigger="click" @command="handleTabMenuCommand" placement="bottom-end">
          <el-button class="tab-tool-btn" circle text>
            <div class="three-dots-vertical">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="togglePin">固定 / 取消固定</el-dropdown-item>
              <el-dropdown-item divided command="close">关闭当前</el-dropdown-item>
              <el-dropdown-item command="closeOthers">关闭其他标签页</el-dropdown-item>
              <el-dropdown-item command="closeLeft">关闭左侧标签页</el-dropdown-item>
              <el-dropdown-item command="closeRight">关闭右侧标签页</el-dropdown-item>
              <el-dropdown-item divided command="closeAll">关闭全部标签页</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useRouter } from 'vue-router'
  import LayoutHeadLeft from '@/views/admin/layout/head/LayoutHeadLeft.vue'
  import LayoutHeadRight from '@/views/admin/layout/head/LayoutHeadRight.vue'
  import LayoutTabs from '@/views/admin/layout/head/LayoutTabs.vue'
  import { useTabStore } from '@/shared/stores/LayoutTab.store'

  const router = useRouter()
  const tabStore = useTabStore()

  /**
   * 处理标签页菜单命令
   */
  const handleTabMenuCommand = (command: string) => {
    switch (command) {
      case 'togglePin':
        handleTogglePin()
        break
      case 'close':
        handleCloseCurrent()
        break
      case 'closeOthers':
        handleCloseOthers()
        break
      case 'closeLeft':
        handleCloseLeft()
        break
      case 'closeRight':
        handleCloseRight()
        break
      case 'closeAll':
        handleCloseAll()
        break
    }
  }

  /**
   * 固定/取消固定当前标签页
   */
  const handleTogglePin = () => {
    const activeTabPath = tabStore.activeTabPath
    if (activeTabPath) {
      tabStore.toggleFixed(activeTabPath)
    }
  }

  /**
   * 关闭全部标签页（保留固定标签）
   */
  const handleCloseAll = () => {
    const toClose = tabStore.tabs.filter(tab => !tab.fixed).map(tab => tab.fullPath)

    // 从右往左关闭，避免索引变化问题
    toClose.reverse().forEach(fullPath => {
      tabStore.closeTab(fullPath)
    })

    // 跳转到剩余的第一个标签（通常为首页）
    const firstTab = tabStore.tabs[0]
    if (firstTab) {
      tabStore.setActiveTab(firstTab.fullPath)
      router.push({ path: firstTab.path, query: firstTab.query })
    }
  }

  /**
   * 关闭当前标签页
   */
  const handleCloseCurrent = () => {
    const activeTabPath = tabStore.activeTabPath
    if (!activeTabPath) return

    const activeTab = tabStore.tabs.find(tab => tab.fullPath === activeTabPath)
    if (!activeTab) return

    // 如果是固定标签页，不允许关闭
    if (activeTab.fixed) {
      return
    }

    const wasActive = activeTabPath === tabStore.activeTabPath
    tabStore.closeTab(activeTabPath)

    // 如果关闭的是当前活动标签页，需要切换到其他标签页
    if (wasActive && tabStore.activeTabPath) {
      const nextTab = tabStore.tabs.find(t => t.fullPath === tabStore.activeTabPath)
      if (nextTab) {
        router.push({
          path: nextTab.path,
          query: nextTab.query
        })
      } else if (tabStore.tabs.length === 0) {
        // 如果没有标签页了，跳转到首页
        router.push('/admin/home')
      }
    }
  }

  /**
   * 关闭其他标签页（保留当前标签页）
   */
  const handleCloseOthers = () => {
    const activeTabPath = tabStore.activeTabPath
    if (!activeTabPath) return

    // 关闭除了当前标签页之外的所有非固定标签页
    const tabsToClose: string[] = []
    tabStore.tabs.forEach(tab => {
      if (tab.fullPath !== activeTabPath && !tab.fixed) {
        tabsToClose.push(tab.fullPath)
      }
    })

    // 从右往左关闭，避免索引变化问题
    tabsToClose.reverse().forEach(fullPath => {
      tabStore.closeTab(fullPath)
    })

    // 确保当前标签页保持激活状态
    if (tabStore.tabs.find(tab => tab.fullPath === activeTabPath)) {
      const activeTab = tabStore.tabs.find(tab => tab.fullPath === activeTabPath)
      if (activeTab) {
        tabStore.setActiveTab(activeTabPath)
        router.push({
          path: activeTab.path,
          query: activeTab.query
        })
      }
    }
  }

  /**
   * 关闭左侧标签页
   */
  const handleCloseLeft = () => {
    const activeTabPath = tabStore.activeTabPath
    if (!activeTabPath) return

    const activeIndex = tabStore.tabs.findIndex(tab => tab.fullPath === activeTabPath)
    if (activeIndex === -1) return

    // 先收集要关闭的标签路径，避免索引变化问题
    const tabsToClose: string[] = []
    for (let i = 0; i < activeIndex; i++) {
      const tab = tabStore.tabs[i]
      if (!tab.fixed) {
        tabsToClose.push(tab.fullPath)
      }
    }

    // 从右往左关闭，避免索引变化问题
    tabsToClose.reverse().forEach(fullPath => {
      tabStore.closeTab(fullPath)
    })
  }

  /**
   * 关闭右侧标签页
   */
  const handleCloseRight = () => {
    const activeTabPath = tabStore.activeTabPath
    if (!activeTabPath) return

    const activeIndex = tabStore.tabs.findIndex(tab => tab.fullPath === activeTabPath)
    if (activeIndex === -1) return

    // 先收集要关闭的标签路径，避免索引变化问题
    const tabsToClose: string[] = []
    for (let i = activeIndex + 1; i < tabStore.tabs.length; i++) {
      const tab = tabStore.tabs[i]
      if (!tab.fixed) {
        tabsToClose.push(tab.fullPath)
      }
    }

    // 从右往左关闭，避免索引变化问题
    tabsToClose.reverse().forEach(fullPath => {
      tabStore.closeTab(fullPath)
    })
  }
</script>

<style scoped lang="scss">
  .head {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    // 顶部操作栏
    .head_top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 40px;
      padding: 0 12px;
      flex-shrink: 0;
      border-bottom: 2px solid var(--el-border-color);

      .head_left {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        overflow: hidden;
      }

      .head_right {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        gap: 8px;
      }
    }

    // 标签页栏
    .head_tabs {
      flex: 1;
      min-height: 50px;
      height: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      position: relative;

      .tab-toolbar {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        z-index: 10;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 2px;
        padding-left: 10px;
        border-left: 2px solid var(--el-border-color);
        background: var(--el-bg-color);

        .tab-tool-btn {
          width: 18px;
          height: 36px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          border: 2px solid transparent;
          transition: all 0.2s;
          cursor: pointer;
          color: var(--el-text-color-secondary);

          &:hover {
            border-color: var(--el-border-color-darker);
            border-width: 2px;
            transform: scale(1.05);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
            color: var(--el-text-color-primary);
          }

          &:active {
            transform: scale(0.95);
          }
        }

        .three-dots-vertical {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2.5px;
          width: 10px;
          height: 14px;

          span {
            width: 3px;
            height: 3px;
            border-radius: 50%;
            border: 1px solid var(--el-border-color-darker);
            display: block;
            transition: all 0.2s;
          }
        }

        .tab-tool-btn:hover .three-dots-vertical span {
          border-width: 1.5px;
          transform: scale(1.2);
        }
      }
    }
  }
</style>
