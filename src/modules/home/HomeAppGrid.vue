<template>
  <div ref="pagerEl" class="home-grid-pager">
    <div class="home-grid-track" :style="trackStyle">
      <div v-for="(pageApps, pi) in pages" :key="pi" class="home-grid-page" :aria-hidden="pi !== page">
        <HomeAppIcon v-for="app in pageApps" :key="app.code" :app="app" :size="80" class="home-grid-item" @click="handleOpen" @contextmenu="openContextMenu" />
      </div>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div v-if="menuVisible" class="home-context-menu" :style="{ left: menuX + 'px', top: menuY + 'px' }" @click.stop>
        <button class="home-context-item" @click="runMenuAction('open')">
          <el-icon><Top /></el-icon>
          <span>打开</span>
        </button>
        <button v-if="!menuInDock" class="home-context-item" @click="runMenuAction('toggle')">
          <el-icon><Plus /></el-icon>
          <span>添加到程序坞</span>
        </button>
        <button v-else class="home-context-item is-danger" @click="runMenuAction('toggle')">
          <el-icon><Minus /></el-icon>
          <span>从程序坞移除</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
  import { Plus, Minus, Top } from '@element-plus/icons-vue'
  import HomeAppIcon from './HomeAppIcon.vue'
  import type { HomeAppItem } from '@/shared/types/HomeApp.type'

  /** 网格布局参数 */
  const GRID_GAP_V = 22
  const GRID_MAX_ROWS = 6
  /** 图标项高度估算值（measure 后按实际值修正） */
  const GRID_ITEM_H_DEFAULT = 92

  const props = defineProps<{
    apps: HomeAppItem[]
    dockCodes: string[]
    /** 当前页码（受控，由外部指示点驱动） */
    page?: number
  }>()

  const emit = defineEmits<{
    (e: 'update:page', page: number): void
    (e: 'page-count', count: number): void
    (e: 'open', app: HomeAppItem): void
    (e: 'toggle', app: HomeAppItem): void
  }>()

  const pagerEl = ref<HTMLElement>()
  const cols = ref(1)
  const rowsMax = ref(GRID_MAX_ROWS)
  let itemHeight = GRID_ITEM_H_DEFAULT
  let resizeObserver: ResizeObserver | undefined

  /** 每页应用数 = 列数 × 行数 */
  const pageSize = computed(() => cols.value * rowsMax.value)

  /** 按页切分应用列表（app 过多时不滚动，自动分多页） */
  const pages = computed<HomeAppItem[][]>(() => {
    const size = Math.max(1, pageSize.value)
    const result: HomeAppItem[][] = []
    for (let i = 0; i < props.apps.length; i += size) {
      result.push(props.apps.slice(i, i + size))
    }
    return result
  })

  /** 页面数量变化时通知外部（用于显示指示点） */
  watch(pages, list => emit('page-count', list.length), { immediate: true })

  /** 页码越界时钳制到合法范围 */
  watch(
    [pages, () => props.page],
    () => {
      const max = Math.max(0, pages.value.length - 1)
      const clamped = Math.min(props.page ?? 0, max)
      if (clamped !== props.page) emit('update:page', clamped)
    },
    { immediate: true }
  )

  /** 测量容器宽度/高度，计算每页行列数 */
  const measure = () => {
    const el = pagerEl.value
    if (!el) return
    const height = el.clientHeight
    const page = el.querySelector<HTMLElement>('.home-grid-page')
    // 列数以浏览器 auto-fill 实际渲染的列数为准，保证分页与显示完全一致
    if (page) {
      const columnCount = getComputedStyle(page).gridTemplateColumns.split(' ').filter(Boolean).length
      if (columnCount > 0) cols.value = columnCount
      // 用真实图标项高度，避免估算偏差导致换行溢出
      const measured = page.querySelector<HTMLElement>('.home-grid-item')?.offsetHeight
      if (measured && measured > 0) itemHeight = measured
    }
    rowsMax.value = Math.max(1, Math.min(GRID_MAX_ROWS, Math.floor((height + GRID_GAP_V) / (itemHeight + GRID_GAP_V))))
  }

  /** 页面滑动过渡（translateX 百分比相对轨道自身宽度 = 容器宽度） */
  const trackStyle = computed(() => ({ transform: `translateX(${-((props.page ?? 0) * 100)}%)` }))

  const inDockSet = computed(() => new Set(props.dockCodes))

  const handleOpen = (app: HomeAppItem) => emit('open', app)

  // ========== 右键菜单 ==========
  const menuVisible = ref(false)
  const menuX = ref(0)
  const menuY = ref(0)
  const menuApp = ref<HomeAppItem | null>(null)
  const menuInDock = computed(() => (menuApp.value ? inDockSet.value.has(menuApp.value.code) : false))

  const openContextMenu = (event: MouseEvent, app: HomeAppItem) => {
    menuApp.value = app
    menuX.value = event.clientX
    menuY.value = event.clientY
    menuVisible.value = true
  }

  const closeContextMenu = () => {
    menuVisible.value = false
    menuApp.value = null
  }

  const runMenuAction = (action: 'open' | 'toggle') => {
    if (menuApp.value) {
      if (action === 'open') {
        emit('open', menuApp.value)
      } else {
        emit('toggle', menuApp.value)
      }
    }
    closeContextMenu()
  }

  const handleOutsideClick = (event: MouseEvent) => {
    if (!menuVisible.value) return
    const target = event.target as HTMLElement
    if (!target.closest('.home-context-menu')) {
      closeContextMenu()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleOutsideClick)
    measure()
    if (typeof ResizeObserver !== 'undefined' && pagerEl.value) {
      resizeObserver = new ResizeObserver(measure)
      resizeObserver.observe(pagerEl.value)
    }
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleOutsideClick)
    resizeObserver?.disconnect()
  })
</script>

<style scoped lang="scss">
  .home-grid-pager {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }

  .home-grid-track {
    display: flex;
    height: 100%;
    will-change: transform;
    transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* 每页为自适应网格：列数随宽度 auto-fill 占满整行，行数按容器高度自动填充，内容靠上排列 */
  .home-grid-page {
    flex: 0 0 100%;
    height: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
    grid-auto-rows: min-content;
    align-content: start;
    justify-items: center;
    gap: 22px 16px;
    padding: 12px 24px;
    box-sizing: border-box;
  }

  /* 右键菜单 */
  .home-context-menu {
    position: fixed;
    z-index: 3000;
    min-width: 150px;
    padding: 6px;
    border-radius: 10px;
    background: var(--el-bg-color-overlay);
    border: 1px solid var(--el-border-color-light);
    box-shadow: var(--el-box-shadow-light);

    .home-context-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 12px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--el-text-color-primary);
      font-size: 13px;
      text-align: left;
      cursor: pointer;

      &:hover {
        background: var(--el-fill-color-light);
      }

      &.is-danger {
        color: var(--el-color-danger);
      }
    }
  }
</style>
