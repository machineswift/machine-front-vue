import { nextTick, onBeforeUnmount, ref, type Ref } from 'vue'

export type ElementRef = Ref<unknown>

export interface SplitCardHeightOptions {
  /** 右侧数据卡片（表格所在卡片） */
  dataCardRef: ElementRef
  /** 左侧树卡片；只有表格的页面可不传 */
  treeCardRef?: ElementRef
  /** 树容器（树卡片内部实际滚动区域），用于按输入框/间距扣减的自定义公式 */
  treeBodyRef?: Ref<HTMLElement | null>
  /** 树搜索框，配合 treeBodyRef 扣减高度 */
  treeInputRef?: ElementRef
  /** 表格上方的操作按钮区，用于扣减高度 */
  operationButtonsRef?: Ref<HTMLElement | null>
  /** 表格下方分页区，用于扣减高度 */
  paginationRef?: Ref<HTMLElement | null>
  /** 树卡片除 body 外需要扣减的高度（工具栏/内边距等） */
  treeReserve?: number | (() => number)
  /** 需要触发重新计算的容器（页面、右栏、搜索卡片等） */
  observeRefs?: ElementRef[]
  minTableHeight?: number
  minTreeHeight?: number
  contentSpacing?: number
}

/** Element Plus 组件实例或原生元素统一取根 DOM */
export function resolveElement(target: unknown): HTMLElement | null {
  if (target instanceof HTMLElement) return target
  if (target && typeof target === 'object' && '$el' in target) {
    const el = (target as { $el?: Element }).$el
    return el instanceof HTMLElement ? el : null
  }
  return null
}

const readCardBody = (target: unknown): HTMLElement | null => {
  const element = resolveElement(target)
  const body = element?.querySelector('.el-card__body')
  return body instanceof HTMLElement ? body : null
}

/**
 * 左右分栏页（树 + 表格）的高度计算与 ResizeObserver 复用。
 * 只负责尺寸，不关心业务；页面只保留 ref 与业务 watch。
 */
export function useSplitCardHeights(options: SplitCardHeightOptions) {
  const {
    dataCardRef,
    treeCardRef,
    treeBodyRef,
    treeInputRef,
    operationButtonsRef,
    paginationRef,
    treeReserve = 140,
    observeRefs = [],
    minTableHeight = 320,
    minTreeHeight = 400,
    contentSpacing = 16
  } = options

  const tableHeight = ref(0)
  const tableHeightReady = ref(false)
  const treeHeight = ref(0)
  const treeHeightReady = ref(false)

  let resizeObserver: ResizeObserver | null = null

  const calculateTableHeight = async () => {
    await nextTick()
    const cardBody = readCardBody(dataCardRef.value)
    if (!cardBody) return

    const operationButtonsHeight = operationButtonsRef?.value?.offsetHeight || 50
    const paginationHeight = paginationRef?.value?.offsetHeight || 60
    const nextHeight = Math.max(minTableHeight, cardBody.clientHeight - operationButtonsHeight - paginationHeight - contentSpacing)

    if (tableHeight.value !== nextHeight) {
      tableHeight.value = nextHeight
    }
    if (!tableHeightReady.value && tableHeight.value > 0) {
      tableHeightReady.value = true
    }
  }

  const calculateTreeHeight = async () => {
    await nextTick()
    const body = treeBodyRef?.value ?? readCardBody(treeCardRef?.value)
    if (!body) return

    let reserved = typeof treeReserve === 'function' ? treeReserve() : treeReserve
    if (treeBodyRef?.value) {
      reserved = (resolveElement(treeInputRef?.value)?.offsetHeight || 32) + 10
    }
    const nextHeight = Math.max(minTreeHeight, body.clientHeight - reserved - contentSpacing)

    if (treeHeight.value !== nextHeight) {
      treeHeight.value = nextHeight
    }
    if (!treeHeightReady.value && treeHeight.value > 0) {
      treeHeightReady.value = true
    }
  }

  const calculateAll = async () => {
    await Promise.all([calculateTableHeight(), calculateTreeHeight()])
  }

  const setupResizeObserver = () => {
    resizeObserver?.disconnect()
    const targets = [...observeRefs.map(resolveElement), resolveElement(dataCardRef.value), resolveElement(treeCardRef?.value), treeBodyRef?.value].filter(
      (element): element is HTMLElement => element instanceof HTMLElement
    )
    if (targets.length === 0) return

    resizeObserver = new ResizeObserver(() => {
      void calculateAll()
    })
    targets.forEach(target => resizeObserver?.observe(target))
  }

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  return {
    tableHeight,
    tableHeightReady,
    treeHeight,
    treeHeightReady,
    calculateTableHeight,
    calculateTreeHeight,
    calculateAll,
    setupResizeObserver
  }
}
