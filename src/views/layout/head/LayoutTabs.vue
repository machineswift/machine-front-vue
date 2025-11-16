<template>
  <div class="tabs-container">
    <div class="tabs-wrapper" ref="tabsWrapperRef">
      <draggable v-model="tabStore.tabs" :animation="200" item-key="fullPath" @end="onDragEnd" class="tabs-list" :disabled="false">
        <template #item="{ element: tab }">
          <div
            :class="['tab-item', { active: tab.fullPath === tabStore.activeTabPath, fixed: tab.fixed }]"
            @click="handleTabClick(tab)"
            @contextmenu.prevent="handleContextMenu($event, tab)"
          >
            <el-icon v-if="tab.icon && tab.icon.startsWith('el-icon-')" class="tab-icon">
              <component :is="tab.icon" />
            </el-icon>
            <SvgIcon v-if="tab.icon && !tab.icon.startsWith('el-icon-')" :name="tab.icon" width="14" height="14" class="tab-icon" />
            <span class="tab-title">{{ tab.title }}</span>
            <div class="tab-actions" @click.stop>
              <el-icon v-if="tab.fullPath === tabStore.activeTabPath" class="tab-action-icon refresh-icon" @click="handleRefresh(tab)" title="刷新">
                <Refresh />
              </el-icon>
              <el-icon class="tab-action-icon pin-icon" :class="{ pinned: tab.fixed }" @click="handleToggleFixed(tab)" :title="tab.fixed ? '取消固定' : '固定'">
                <Lock v-if="tab.fixed" />
                <Unlock v-else />
              </el-icon>
              <el-icon v-if="!tab.fixed" class="tab-action-icon close-icon" @click="handleClose(tab)" title="关闭">
                <Close />
              </el-icon>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- 右键菜单 -->
    <el-dropdown
      ref="contextMenuRef"
      v-model:visible="contextMenuVisible"
      trigger="click"
      @command="handleContextMenuCommand"
      @visible-change="handleContextMenuVisibleChange"
      :teleported="true"
      :popper-options="{ placement: 'bottom-start', strategy: 'fixed' }"
    >
      <div ref="contextMenuTriggerRef" style="position: fixed; width: 1px; height: 1px; pointer-events: none; opacity: 0; z-index: -1"></div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :command="{ action: 'toggleFixed', tab: contextMenuTab }">
            <el-icon>
              <Lock v-if="contextMenuTab?.fixed" />
              <Unlock v-else />
            </el-icon>
            <span>{{ contextMenuTab?.fixed ? '取消固定' : '固定' }}</span>
          </el-dropdown-item>
          <el-dropdown-item :command="{ action: 'close', tab: contextMenuTab }" :disabled="contextMenuTab?.fixed">
            <el-icon><Close /></el-icon>
            <span>关闭</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import { useTabStore, type TabItem } from '@/modules/common/stores/Tab.store'
  import { useSettingStore } from '@/modules/common/stores/SystemSetting.store'
  import { Refresh, Close, Lock, Unlock } from '@element-plus/icons-vue'
  import draggable from 'vuedraggable'
  import SvgIcon from '@/modules/common/components/svgIcon/SvgIcon.vue'

  const router = useRouter()
  const route = useRoute()
  const tabStore = useTabStore()
  const settingStore = useSettingStore()

  const tabsWrapperRef = ref<HTMLElement>()
  const contextMenuRef = ref()
  const contextMenuTriggerRef = ref<HTMLElement>()
  const contextMenuVisible = ref(false)
  const contextMenuTab = ref<TabItem | null>(null)

  // 监听路由变化，自动添加标签页
  watch(
    () => route.fullPath,
    () => {
      if (route.matched.length > 0) {
        tabStore.addTab(route)
      }
    },
    { immediate: true }
  )

  // 监听活动标签变化，滚动到可见区域
  watch(
    () => tabStore.activeTabPath,
    () => {
      nextTick(() => {
        scrollToActiveTab()
      })
    }
  )

  // 点击外部关闭右键菜单
  const handleClickOutside = (event: MouseEvent) => {
    if (contextMenuVisible.value) {
      const target = event.target as HTMLElement
      if (!target.closest('.el-dropdown__popper') && !target.closest('.tab-item')) {
        contextMenuVisible.value = false
      }
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })

  /**
   * 点击标签页
   */
  const handleTabClick = (tab: TabItem) => {
    if (tab.fullPath === tabStore.activeTabPath) {
      return
    }
    tabStore.setActiveTab(tab.fullPath)
    router.push({
      path: tab.path,
      query: tab.query,
      params: tab.params
    })
  }

  /**
   * 关闭标签页
   */
  const handleClose = (tab: TabItem) => {
    const wasActive = tab.fullPath === tabStore.activeTabPath
    tabStore.closeTab(tab.fullPath)

    // 如果关闭的是当前活动标签页，需要切换到其他标签页
    if (wasActive && tabStore.activeTabPath) {
      const activeTab = tabStore.tabs.find(t => t.fullPath === tabStore.activeTabPath)
      if (activeTab) {
        router.push({
          path: activeTab.path,
          query: activeTab.query,
          params: activeTab.params
        })
      } else if (tabStore.tabs.length === 0) {
        // 如果没有标签页了，跳转到首页
        router.push('/home')
      }
    }
  }

  /**
   * 刷新标签页
   */
  const handleRefresh = (tab: TabItem) => {
    // 如果刷新的是当前标签页，使用全局刷新
    if (tab.fullPath === route.fullPath) {
      settingStore.setIsRefresh(!settingStore.getIsRefresh())
    } else {
      // 刷新其他标签页，先切换到该标签页再刷新
      tabStore.setActiveTab(tab.fullPath)
      router
        .push({
          path: tab.path,
          query: tab.query,
          params: tab.params
        })
        .then(() => {
          settingStore.setIsRefresh(!settingStore.getIsRefresh())
        })
    }
  }

  /**
   * 切换固定状态
   */
  const handleToggleFixed = (tab: TabItem) => {
    tabStore.toggleFixed(tab.fullPath)
  }

  /**
   * 右键菜单
   */
  const handleContextMenu = (event: MouseEvent, tab: TabItem) => {
    event.preventDefault()
    event.stopPropagation()
    contextMenuTab.value = tab

    // 定位触发元素并显示菜单
    nextTick(() => {
      if (contextMenuTriggerRef.value) {
        // 设置触发元素的位置
        const trigger = contextMenuTriggerRef.value
        trigger.style.position = 'fixed'
        trigger.style.left = `${event.clientX}px`
        trigger.style.top = `${event.clientY}px`
        trigger.style.width = '1px'
        trigger.style.height = '1px'
        trigger.style.pointerEvents = 'none'
        contextMenuVisible.value = true
      }
    })
  }

  /**
   * 右键菜单命令处理
   */
  const handleContextMenuCommand = (command: { action: string; tab: TabItem | null }) => {
    if (!command.tab) return

    const { action, tab } = command
    contextMenuVisible.value = false

    switch (action) {
      case 'toggleFixed': {
        handleToggleFixed(tab)
        break
      }
      case 'close': {
        handleClose(tab)
        break
      }
    }
  }

  /**
   * 右键菜单可见性变化
   */
  const handleContextMenuVisibleChange = (visible: boolean) => {
    if (!visible) {
      contextMenuTab.value = null
    }
  }

  /**
   * 拖拽结束
   */
  const onDragEnd = () => {
    // 拖拽后保持固定标签在前
    tabStore.sortTabs()
  }

  /**
   * 滚动到活动标签页
   */
  const scrollToActiveTab = () => {
    if (!tabsWrapperRef.value) return

    const activeTabElement = tabsWrapperRef.value.querySelector('.tab-item.active')
    if (activeTabElement) {
      activeTabElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      })
    }
  }
</script>

<style scoped lang="scss">
  .tabs-container {
    flex: 1;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: 0 10px;
    background: var(--el-bg-color);
  }

  .tabs-wrapper {
    width: 100%;
    height: 100%;
    overflow-x: auto;
    overflow-y: hidden;

    &::-webkit-scrollbar {
      height: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.2);
      border-radius: 2px;

      &:hover {
        background: rgba(0, 0, 0, 0.3);
      }
    }
  }

  .tabs-list {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 4px;
    padding: 0 4px;
  }

  .tab-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    min-width: 80px;
    max-width: 200px;
    height: 32px;
    background: var(--el-bg-color-page);
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    cursor: move;
    user-select: none;
    transition: all 0.2s;
    position: relative;
    white-space: nowrap;
    flex-shrink: 0;
    touch-action: none;

    &:hover {
      background: var(--el-bg-color);
      border-color: var(--el-border-color);

      .tab-actions {
        opacity: 1;
      }
    }

    &.active {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);

      .tab-title {
        font-weight: 500;
      }
    }

    &.fixed {
      .tab-icon {
        color: var(--el-color-warning);
      }
    }
  }

  .tab-icon {
    font-size: 14px;
    flex-shrink: 0;
  }

  .tab-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 13px;
    line-height: 1;
  }

  .tab-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
    margin-left: 4px;
  }

  .tab-action-icon {
    font-size: 12px;
    padding: 2px;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
    }

    &.refresh-icon:hover {
      color: var(--el-color-success);
    }

    &.close-icon:hover {
      color: var(--el-color-danger);
    }

    &.pin-icon.pinned {
      opacity: 1;
      color: var(--el-color-warning);
    }
  }

  // 活动标签页始终显示操作按钮
  .tab-item.active .tab-actions {
    opacity: 1;
  }
</style>
