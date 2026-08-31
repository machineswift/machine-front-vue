<template>
  <div class="tabs-container">
    <div class="tabs-wrapper" ref="tabsWrapperRef">
      <draggable v-model="tabStore.tabs" :animation="200" item-key="fullPath" @end="onDragEnd" class="tabs-list" :disabled="false">
        <div
          v-for="tab in tabStore.tabs"
          :key="tab.fullPath"
          :class="['tab-item', { active: tab.fullPath === tabStore.activeTabPath, fixed: tab.fixed }]"
          @click="handleTabClick(tab)"
          @contextmenu.prevent="handleContextMenu($event, tab)"
        >
          <el-icon v-if="isElIcon(tab.icon)" class="tab-icon">
            <component :is="tab.icon" />
          </el-icon>
          <SvgIcon v-else-if="tab.icon" :name="tab.icon" width="14" height="14" class="tab-icon" />
          <span class="tab-title">{{ tab.title }}</span>
          <!-- 左：悬停时固定/取消固定（覆盖图标位置，大点击区域） -->
          <div class="tab-pin-action" @click.stop>
            <el-icon class="tab-action-icon pin-action-icon" @click="handleToggleFixed(tab)" :title="tab.fixed ? '取消固定' : '固定'">
              <Unlock />
            </el-icon>
          </div>
          <!-- 右：悬停时关闭（仅非固定，靠右不变） -->
          <div v-if="!tab.fixed" class="tab-actions" @click.stop>
            <el-icon class="tab-action-icon close-icon" @click="handleClose(tab)" title="关闭">
              <Close />
            </el-icon>
          </div>
        </div>
      </draggable>
    </div>

    <!-- 右键菜单 -->
    <el-dropdown
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
          <el-dropdown-item :command="{ action: 'refresh', tab: contextMenuTab }">
            <el-icon><Refresh /></el-icon>
            <span>刷新</span>
          </el-dropdown-item>
          <el-dropdown-item divided :command="{ action: 'toggleFixed', tab: contextMenuTab }">
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
  import { useTabStore, type TabItem } from '@/shared/stores/LayoutTab.store'
  import { Close, Lock, Refresh, Unlock } from '@element-plus/icons-vue'
  import { VueDraggable as Draggable } from 'vue-draggable-plus'
  import SvgIcon from '@/shared/components/SvgIcon.vue'

  const router = useRouter()
  const route = useRoute()
  const tabStore = useTabStore()

  const tabsWrapperRef = ref<HTMLElement>()
  const contextMenuTriggerRef = ref<HTMLElement>()
  const contextMenuVisible = ref(false)
  const contextMenuTab = ref<TabItem | null>(null)

  // 判断是否为 el-icon 图标
  const isElIcon = (icon?: string) => !!icon && icon.startsWith('el-icon-')

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

    // 标签来自 store，必然已存在，用 replace 避免历史记录堆积
    tabStore.setActiveTab(tab.fullPath)
    router.replace({ path: tab.path, query: tab.query })
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
          query: activeTab.query
        })
      } else if (tabStore.tabs.length === 0) {
        // 如果没有标签页了，跳转到首页
        router.push('/admin/home')
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
      const trigger = contextMenuTriggerRef.value
      if (trigger) {
        Object.assign(trigger.style, {
          position: 'fixed',
          left: `${event.clientX}px`,
          top: `${event.clientY}px`,
          width: '1px',
          height: '1px',
          pointerEvents: 'none'
        })
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
      case 'refresh': {
        tabStore.refreshTab(tab.fullPath)
        break
      }
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
    padding: 0 76px 0 12px;
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
    }

    &.active {
      border: 3px solid var(--el-border-color-darker);
      border-bottom: none;
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
      border-left: 3px solid var(--el-color-primary);
      padding-left: 8px;
      background: var(--el-color-primary-light-9);

      &.active {
        border-left: 3px solid var(--el-color-primary);
        background: var(--el-color-primary-light-8);
      }
    }
  }

  .tab-icon {
    font-size: 12px;
    flex-shrink: 0;
    transition: opacity 0.15s ease;
  }

  .tab-title {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 12px;
    line-height: 1;
  }

  .tab-pin-action,
  .tab-actions {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s ease;
    z-index: 3;
  }

  .tab-pin-action {
    left: 3px;
  }

  .tab-actions {
    right: 4px;
    padding-left: 8px;
    border-radius: 3px;
    background: linear-gradient(to right, transparent 0%, var(--el-bg-color) 40%);
  }

  .tab-action-icon {
    font-size: 12px;
    padding: 3px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1.5px solid transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    min-height: 20px;

    &:hover {
      border-color: var(--el-border-color-darker);
      border-width: 2px;
      transform: scale(1.1);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    &.close-icon {
      border-radius: 50%;

      &:hover {
        transform: rotate(90deg) scale(1.1);
      }
    }
  }

  .tab-item:hover {
    .tab-icon {
      opacity: 0;
    }

    .tab-pin-action,
    .tab-actions {
      opacity: 1;
      pointer-events: auto;
    }
  }

  .tab-item:not(.fixed):hover .tab-title {
    -webkit-mask-image: linear-gradient(to right, #000 calc(100% - 32px), transparent calc(100% - 10px));
    mask-image: linear-gradient(to right, #000 calc(100% - 32px), transparent calc(100% - 10px));
  }

  .tab-item.fixed + .tab-item:not(.fixed) {
    margin-left: 11px;
  }

  .tab-item.fixed + .tab-item:not(.fixed):not(.active)::before {
    content: '';
    position: absolute;
    left: -11px;
    top: 0;
    bottom: 0;
    width: 3px;
    border-radius: 2px;
    background: var(--el-border-color-darker);
  }
</style>
