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
  import { useTabStore, type TabItem } from '@/common/stores/LayoutTab.store'
  import { Close, Lock, Unlock } from '@element-plus/icons-vue'
  import draggable from 'vuedraggable'
  import SvgIcon from '@/common/components/svgIcon/SvgIcon.vue'

  const router = useRouter()
  const route = useRoute()
  const tabStore = useTabStore()

  const tabsWrapperRef = ref<HTMLElement>()
  const contextMenuRef = ref()
  const contextMenuTriggerRef = ref<HTMLElement>()
  const contextMenuVisible = ref(false)
  const contextMenuTab = ref<TabItem | null>(null)

  // 监听路由变化，自动添加标签页
  watch(
    () => route.fullPath,
    (newPath, oldPath) => {
      if (route.matched.length > 0) {
        // 如果只是切换标签（路由路径相同但可能是 query 不同），且标签已存在，只更新活动标签
        const existingTab = tabStore.tabs.find(tab => tab.fullPath === newPath)
        if (existingTab && oldPath && newPath.split('?')[0] === oldPath.split('?')[0]) {
          // 路由路径相同，只是切换标签，不重新添加
          tabStore.setActiveTab(newPath)
        } else {
          // 新路由，添加标签页
          tabStore.addTab(route)
        }
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

    // 先设置活动标签页
    tabStore.setActiveTab(tab.fullPath)

    // 如果目标标签页已经存在，使用 replace 避免在历史记录中创建新条目
    // 同时确保 query 和 params 同步更新
    const existingTab = tabStore.tabs.find(t => t.fullPath === tab.fullPath)
    if (existingTab) {
      // 更新标签页的 query 和 params 以匹配当前路由状态
      existingTab.query = { ...tab.query }
      existingTab.params = { ...tab.params }

      // 使用 replace 而不是 push，避免触发不必要的路由变化
      router.replace({
        path: tab.path,
        query: tab.query,
        params: tab.params
      })
    } else {
      // 新标签页，使用 push
      router.push({
        path: tab.path,
        query: tab.query,
        params: tab.params
      })
    }
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
    min-height: 50px;
    overflow: hidden;
    display: flex;
    align-items: center;
    padding: 0 12px 0 12px;
    padding-right: 50px; // 为右侧按钮留出空间
    border-bottom: 2px solid var(--el-border-color);
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
      background: var(--el-border-color);
      border-radius: 2px;

      &:hover {
        background: var(--el-border-color-darker);
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
    gap: 4px;
    padding: 2px 10px;
    min-width: 70px;
    max-width: 180px;
    height: 32px;
    border: 2px solid var(--el-border-color);
    border-bottom: none;
    border-radius: 4px 4px 0 0;
    cursor: move;
    user-select: none;
    transition: all 0.2s;
    position: relative;
    white-space: nowrap;
    flex-shrink: 0;
    touch-action: none;
    box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.05);

    // 添加底部连接线
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      border-bottom: 2px solid var(--el-border-color);
      z-index: 1;
    }

    &:hover {
      border-color: var(--el-border-color-darker);
      border-width: 3px;
      transform: translateY(-1px);
      box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.08);

      .tab-actions {
        opacity: 1;
      }
    }

    &.active {
      border: 3px solid var(--el-border-color-darker);
      border-bottom: none;
      height: 32px;
      padding: 4px 12px;
      z-index: 2;
      box-shadow: 0 -3px 6px rgba(0, 0, 0, 0.1);

      &::after {
        display: none;
      }

      .tab-title {
        font-weight: 600;
        font-size: 13px;
      }

      // 添加选中指示器
      &::before {
        content: '';
        position: absolute;
        bottom: -3px;
        left: 50%;
        transform: translateX(-50%);
        width: 30px;
        height: 3px;
        background: var(--el-border-color-darker);
        border-radius: 2px 2px 0 0;
      }
    }

    &.fixed {
      border-left: 3px solid var(--el-border-color-darker);
      padding-left: 8px;

      .tab-icon {
        position: relative;

        &::after {
          content: '';
          position: absolute;
          top: -2px;
          right: -2px;
          width: 5px;
          height: 5px;
          border: 1.5px solid var(--el-border-color-darker);
          border-radius: 50%;
          background: var(--el-bg-color);
        }
      }
    }

    // 固定且激活的标签
    &.fixed.active {
      border-left: 3px solid var(--el-border-color-darker);
      padding-left: 8px;
    }
  }

  .tab-icon {
    font-size: 12px;
    flex-shrink: 0;
  }

  .tab-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    line-height: 1;
  }

  .tab-actions {
    display: flex;
    align-items: center;
    gap: 3px;
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
    margin-left: 3px;
  }

  .tab-action-icon {
    font-size: 11px;
    padding: 2px;
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1.5px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 16px;
    min-height: 16px;

    &:hover {
      border-color: var(--el-border-color-darker);
      border-width: 2px;
      transform: scale(1.1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    &.close-icon {
      border-radius: 50%;

      &:hover {
        border-color: var(--el-border-color-darker);
        border-width: 2px;
        transform: rotate(90deg) scale(1.1);
      }
    }

    &.pin-icon {
      &.pinned {
        opacity: 1;
        border: 2px solid var(--el-border-color-darker);
        border-style: dashed;
      }

      &:hover {
        border-style: solid;
      }
    }
  }

  // 活动标签页始终显示操作按钮
  .tab-item.active .tab-actions {
    opacity: 1;
  }
</style>
