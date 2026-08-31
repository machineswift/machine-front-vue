<template>
  <div
    ref="dockEl"
    class="home-dock"
    :class="{ 'is-drag-over': dragOver, 'is-magnifying': magnifying, 'is-sorting': sorting }"
    @mousemove="handlePointerMove"
    @mouseleave="handlePointerLeave"
    @dragover.prevent="handleDragOver"
    @dragleave="handleDragLeave"
    @drop.prevent="handleDrop"
  >
    <div
      class="home-dock-item home-dock-item-fixed home-dock-item-search"
      :data-code="HOME_SEARCH_ITEM.code"
      :style="itemOffsetStyle(HOME_SEARCH_ITEM.code)"
      @mouseenter="showTooltip($event, HOME_SEARCH_ITEM)"
      @mouseleave="hideTooltip"
    >
      <HomeAppIcon
        :app="HOME_SEARCH_ITEM"
        :show-title="false"
        :draggable="false"
        :active="searchActive"
        :magnify="magnifyOf(HOME_SEARCH_ITEM.code)"
        :size="48"
        tile-class="home-search-tile"
        tile-background="linear-gradient(135deg, rgb(255 255 255 / 34%), rgb(255 255 255 / 12%))"
        @click="handleSearchClick"
      />
    </div>

    <div
      class="home-dock-item home-dock-item-fixed"
      :data-code="HOME_APP_ITEM.code"
      :style="itemOffsetStyle(HOME_APP_ITEM.code)"
      @mouseenter="showTooltip($event, HOME_APP_ITEM)"
      @mouseleave="hideTooltip"
    >
      <HomeAppIcon
        :app="HOME_APP_ITEM"
        :show-title="false"
        :draggable="false"
        :active="isActive(HOME_APP_ITEM)"
        :magnify="magnifyOf(HOME_APP_ITEM.code)"
        :size="48"
        @click="handleOpen(HOME_APP_ITEM)"
      />
    </div>

    <div class="home-dock-divider"></div>

    <!-- 常用应用列表（可拖拽排序） -->
    <Draggable
      :model-value="dockApps"
      item-key="code"
      :animation="180"
      class="home-dock-list"
      @update:model-value="handleModelUpdate"
      @start="handleSortStart"
      @end="handleSortEnd"
    >
      <div
        v-for="app in dockApps"
        :key="app.code"
        class="home-dock-item"
        :data-code="app.code"
        :style="itemOffsetStyle(app.code)"
        @mouseenter="showTooltip($event, app)"
        @mouseleave="hideTooltip"
      >
        <HomeAppIcon
          :app="app"
          :show-title="false"
          :draggable="false"
          :active="isActive(app)"
          :magnify="magnifyOf(app.code)"
          :size="48"
          @click="handleOpen(app)"
        />
      </div>
    </Draggable>

    <Teleport to="body">
      <Transition name="home-tooltip">
        <div v-if="tooltipVisible" class="home-dock-tooltip" :style="{ left: tooltipX + 'px', top: tooltipY + 'px' }">
          {{ tooltipTitle }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
  import { VueDraggable as Draggable } from 'vue-draggable-plus'
  import HomeAppIcon from './HomeAppIcon.vue'
  import { HOME_APP_ITEM, type HomeAppItem } from '@/shared/types/HomeApp.type'

  /** 程序坞放大效果参数 */
  const HOME_DOCK_MAX_SCALE = 1.7
  const HOME_DOCK_EFFECT_RANGE = 130

  const HOME_SEARCH_ITEM: HomeAppItem = {
    code: 'ADMIN:SEARCH',
    title: '搜索应用',
    icon: 'el-icon-Search',
    path: ''
  }

  const props = defineProps<{
    apps: HomeAppItem[]
    dockCodes: string[]
    currentCode?: string
    searchActive?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'reorder', codes: string[]): void
    (e: 'remove', code: string): void
    (e: 'add', code: string, index: number): void
    (e: 'open', app: HomeAppItem): void
    (e: 'search'): void
  }>()

  const dockEl = ref<HTMLElement>()
  const dragOver = ref(false)
  const sorting = ref(false)

  const appsByCode = computed(() => new Map(props.apps.map(app => [app.code, app])))
  const dockApps = computed<HomeAppItem[]>(() => props.dockCodes.map(code => appsByCode.value.get(code)).filter((app): app is HomeAppItem => Boolean(app)))

  const handleOpen = (app: HomeAppItem) => emit('open', app)

  const handleSearchClick = () => {
    hideTooltip()
    emit('search')
  }

  const isActive = (app: HomeAppItem) => {
    if (!props.currentCode) return false
    if (app.isHome) return props.currentCode === 'ADMIN:HOME'
    return props.currentCode === app.code || props.currentCode.startsWith(app.code + ':')
  }

  const handleModelUpdate = (list: HomeAppItem[]) =>
    emit(
      'reorder',
      list.map(app => app.code)
    )

  const magnifying = ref(false)
  const scaleMap = reactive<Record<string, number>>({})
  const offsetMap = reactive<Record<string, number>>({})
  let magnifyRaf = 0
  let lastPointerX = 0

  const DOCK_TILE_SIZE = 48
  const DOCK_TILE_GAP = 16

  interface DockSlot {
    code: string
    baseCenter: number
  }

  let slots: DockSlot[] = []
  let containerCenter = 0

  const refreshSlots = () => {
    const container = dockEl.value
    if (!container) return
    const containerRect = container.getBoundingClientRect()
    containerCenter = containerRect.left + containerRect.width / 2
    slots = Array.from(container.querySelectorAll<HTMLElement>('.home-dock-item')).map(el => {
      const rect = el.getBoundingClientRect()
      return { code: el.dataset.code ?? '', baseCenter: rect.left + rect.width / 2 }
    })
  }

  const computeScale = (distance: number) => {
    const t = Math.max(0, Math.min(1, 1 - distance / HOME_DOCK_EFFECT_RANGE))
    const smooth = t * t * (3 - 2 * t)
    return 1 + smooth * (HOME_DOCK_MAX_SCALE - 1)
  }

  const applyMagnify = (pointerX: number) => {
    if (!slots.length) refreshSlots()
    if (!slots.length) return
    const scales = slots.map(slot => computeScale(Math.abs(pointerX - slot.baseCenter)))
    const totalWidth = slots.reduce((sum, slot, i) => sum + DOCK_TILE_SIZE * scales[i], 0) + (slots.length - 1) * DOCK_TILE_GAP
    let cursor = containerCenter - totalWidth / 2
    slots.forEach((slot, i) => {
      const width = DOCK_TILE_SIZE * scales[i]
      scaleMap[slot.code] = scales[i]
      offsetMap[slot.code] = cursor + width / 2 - slot.baseCenter
      cursor += width + DOCK_TILE_GAP
    })
  }

  const handlePointerMove = (event: MouseEvent) => {
    if (!dockEl.value || sorting.value) return
    magnifying.value = true
    lastPointerX = event.clientX
    if (magnifyRaf) return
    magnifyRaf = requestAnimationFrame(() => {
      magnifyRaf = 0
      applyMagnify(lastPointerX)
      if (tooltipVisible.value && hoveredCode.value) {
        scheduleTooltipPosition()
      }
    })
  }

  /** 重置放大镜状态（所有图标归位） */
  const resetMagnify = () => {
    for (const key of Object.keys(scaleMap)) scaleMap[key] = 1
    for (const key of Object.keys(offsetMap)) offsetMap[key] = 0
  }

  const handlePointerLeave = () => {
    magnifying.value = false
    hideTooltip()
    resetMagnify()
  }

  onMounted(() => {
    nextTick(refreshSlots)
    window.addEventListener('resize', refreshSlots)
  })
  watch(dockApps, () => nextTick(refreshSlots))

  const magnifyOf = (code: string) => scaleMap[code] || 1

  const itemOffsetStyle = (code: string) => {
    if (sorting.value) return undefined
    const offset = offsetMap[code]
    return offset ? { transform: `translateX(${offset}px)` } : undefined
  }

  const handleDragOver = () => {
    dragOver.value = true
  }

  const handleDragLeave = (event: DragEvent) => {
    const container = dockEl.value
    if (container && event.relatedTarget && container.contains(event.relatedTarget as Node)) {
      return
    }
    dragOver.value = false
  }

  const handleDrop = (event: DragEvent) => {
    dragOver.value = false
    const code = event.dataTransfer?.getData('text/plain')
    if (!code) return
    emit('add', code, computeDropIndex(event))
  }

  const computeDropIndex = (event: DragEvent): number => {
    const container = dockEl.value
    if (!container) return dockApps.value.length
    const items = Array.from(container.querySelectorAll<HTMLElement>('.home-dock-item'))
    for (let i = 0; i < items.length; i++) {
      const rect = items[i].getBoundingClientRect()
      if (event.clientX < rect.left + rect.width / 2) {
        return Math.max(0, i - 1)
      }
    }
    return dockApps.value.length
  }

  /** 拖出超过该边距判定为移除 */
  const REMOVE_MARGIN = 30

  const removing = ref(false)
  let dragCode = ''
  let dragging = false

  const isOutsideDock = (x: number, y: number): boolean => {
    const rect = dockEl.value?.getBoundingClientRect()
    if (!rect) return false
    return x < rect.left - REMOVE_MARGIN || x > rect.right + REMOVE_MARGIN || y < rect.top - REMOVE_MARGIN || y > rect.bottom + REMOVE_MARGIN
  }

  const handleDragMove = (event: MouseEvent) => {
    removing.value = isOutsideDock(event.clientX, event.clientY)
  }

  const handleSortStart = (evt: { item?: HTMLElement }) => {
    dragging = true
    sorting.value = true
    magnifying.value = false
    removing.value = false
    dragCode = evt.item?.dataset?.code ?? ''
    resetMagnify()
    window.addEventListener('dragover', handleDragMove, true)
    window.addEventListener('mousemove', handleDragMove, true)
    window.addEventListener('dragend', handleSortEnd, true)
  }

  const handleSortEnd = () => {
    window.removeEventListener('dragover', handleDragMove, true)
    window.removeEventListener('mousemove', handleDragMove, true)
    window.removeEventListener('dragend', handleSortEnd, true)
    if (dragging && removing.value && dragCode && dragCode !== HOME_APP_ITEM.code) {
      emit('remove', dragCode)
    }
    dragging = false
    sorting.value = false
    removing.value = false
    dragCode = ''
  }

  const tooltipVisible = ref(false)
  const tooltipTitle = ref('')
  const tooltipX = ref(0)
  const tooltipY = ref(0)
  const hoveredCode = ref('')
  let tooltipTimer: ReturnType<typeof setTimeout> | undefined
  let tooltipRaf = 0

  const showTooltip = (_event: MouseEvent, app: HomeAppItem) => {
    hoveredCode.value = app.code
    tooltipTitle.value = app.title
    clearTimeout(tooltipTimer)
    tooltipTimer = setTimeout(() => {
      tooltipVisible.value = true
      updateTooltipPosition(app.code)
    }, 80)
  }

  const hideTooltip = () => {
    hoveredCode.value = ''
    cancelAnimationFrame(tooltipRaf)
    tooltipRaf = 0
    clearTimeout(tooltipTimer)
    tooltipVisible.value = false
  }

  /** 根据图标（放大后的）实际位置定位提示 */
  const updateTooltipPosition = (code: string) => {
    const item = dockEl.value?.querySelector<HTMLElement>(`.home-dock-item[data-code="${code}"]`)
    if (!item) return
    const tile = item.querySelector('.home-app-tile') as HTMLElement | null
    const rect = (tile || item).getBoundingClientRect()
    tooltipX.value = rect.left + rect.width / 2
    tooltipY.value = rect.top
  }

  /** 提示位置跟随放大后的图标 */
  const scheduleTooltipPosition = () => {
    if (tooltipRaf) return
    tooltipRaf = requestAnimationFrame(() => {
      tooltipRaf = 0
      if (tooltipVisible.value && hoveredCode.value) {
        updateTooltipPosition(hoveredCode.value)
      }
    })
  }

  onUnmounted(() => {
    window.removeEventListener('dragover', handleDragMove, true)
    window.removeEventListener('mousemove', handleDragMove, true)
    window.removeEventListener('dragend', handleSortEnd, true)
    window.removeEventListener('resize', refreshSlots)
    cancelAnimationFrame(tooltipRaf)
    cancelAnimationFrame(magnifyRaf)
    clearTimeout(tooltipTimer)
  })
</script>

<style scoped lang="scss">
  .home-dock {
    position: relative;
    display: inline-flex;
    align-items: flex-end;
    gap: 2px;
    padding: 12px 14px 10px;
    border-radius: 26px;
    background: rgb(28 28 30 / 62%);
    backdrop-filter: blur(24px) saturate(180%);
    -webkit-backdrop-filter: blur(24px) saturate(180%);
    border: 1px solid rgb(255 255 255 / 18%);
    box-shadow: 0 18px 40px rgb(0 0 0 / 38%);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &.is-drag-over {
      border-color: rgb(255 255 255 / 55%);
      box-shadow:
        0 0 0 3px rgb(255 255 255 / 25%),
        0 18px 40px rgb(0 0 0 / 38%);
    }

    .home-dock-item {
      position: relative;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      width: 62px;
      height: 54px;
      will-change: transform;
      cursor: pointer;

      &.home-dock-item-fixed {
        cursor: default;
      }

      &.home-dock-item-search :deep(.home-search-tile) {
        border: 1px solid rgb(255 255 255 / 38%);
        box-shadow:
          inset 0 1px 0 rgb(255 255 255 / 40%),
          0 8px 18px rgb(0 0 0 / 24%);
      }
    }

    .home-dock-divider {
      align-self: stretch;
      width: 1px;
      margin: 4px 6px;
      background: rgb(255 255 255 / 22%);
    }

    .home-dock-list {
      display: flex;
      align-items: flex-end;
    }
  }

  /* 程序坞放大镜效果：图标从底部向上放大 */
  .home-dock :deep(.home-app-tile) {
    transform-origin: bottom center;
  }

  /* 鼠标移动过程中使用短过渡，让放大跟手更丝滑 */
  .home-dock.is-magnifying :deep(.home-app-tile) {
    transition: transform 0.05s linear !important;
  }

  /* 槽位随放大水平推动，同样用短过渡跟手 */
  .home-dock.is-magnifying .home-dock-item {
    transition: transform 0.05s linear;
  }

  /* 移出程序坞时图标平滑归位（拖拽排序期间不干预 Sortable） */
  .home-dock:not(.is-magnifying):not(.is-sorting) .home-dock-item {
    transition: transform 0.18s cubic-bezier(0.34, 1.3, 0.64, 1);
  }

  /* 图标名称提示 */
  .home-dock-tooltip {
    position: fixed;
    z-index: 3100;
    padding: 6px 12px;
    border-radius: 8px;
    background: rgb(28 28 30 / 88%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    color: #fff;
    font-size: 12px;
    white-space: nowrap;
    pointer-events: none;
    transform: translate(-50%, -100%) translateY(-14px);
    box-shadow: 0 6px 16px rgb(0 0 0 / 32%);
  }

  .home-tooltip-enter-active,
  .home-tooltip-leave-active {
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;
  }

  .home-tooltip-enter-from,
  .home-tooltip-leave-to {
    opacity: 0;
    transform: translate(-50%, -100%) translateY(-4px);
  }
</style>
