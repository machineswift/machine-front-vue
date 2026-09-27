<template>
  <div class="tree-panel">
    <el-input v-model="searchText" :placeholder="placeholder" clearable class="tree-panel-search" @input="handleSearchInput" @clear="handleSearchClearAll">
      <template #prefix>
        <el-icon><Search /></el-icon>
      </template>
      <template #suffix>
        <span v-if="showMatchCount" class="tree-panel-count">命中 {{ matchCount }}</span>
      </template>
    </el-input>

    <el-tree-v2
      ref="treeRef"
      :data="treeData"
      :props="treeProps"
      :filter-method="panelFilterMethod"
      :height="height"
      :empty-text="emptyText"
      :default-expanded-keys="expandedKeys"
      :current-node-key="modelValue"
      highlight-current
      class="tree-panel-tree"
      @node-click="handleNodeClick"
      @node-expand="handleNodeExpand"
      @node-collapse="handleNodeCollapse"
    >
      <template #default="{ node }">
        <!-- 懒加载占位行：点击加载下一页（根级占位行 = 一级节点分页，其余 = 下级分页） -->
        <span v-if="node.data.__more" class="tree-panel-more" :class="{ 'is-loading': isMoreLoading(node.data) }">
          {{ isMoreLoading(node.data) ? '加载中…' : '加载更多' }}
        </span>
        <span v-else class="tree-panel-node">
          <el-icon v-if="icon" class="tree-panel-icon"><component :is="icon" /></el-icon>
          <span class="tree-panel-name"><HighlightText :text="node.data.name" :ranges="getRanges(node.data.id, 'name')" /></span>
          <span v-if="node.data.code" class="tree-panel-code">
            <HighlightText :text="`(${node.data.code})`" :ranges="codeRanges(node.data.id)" />
          </span>
          <span v-if="excludedIds.has(node.data.id)" class="tree-panel-badge">不可选</span>
        </span>
      </template>
    </el-tree-v2>

    <div v-if="showSearchMore" class="tree-panel-search-more">
      <el-button text type="primary" size="small" :loading="searchState.loading" @click="handleLoadMoreSearch">
        {{ searchState.loading ? '加载中…' : '加载更多命中' }}
      </el-button>
    </div>

    <div v-if="selectedNode" class="tree-panel-selected">
      <span class="tree-panel-selected-label">已选择：</span>
      <el-tag type="primary" closable @close="clear">
        <el-icon v-if="icon"><component :is="icon" /></el-icon>
        <span class="tree-panel-selected-name">{{ selectedNode.name }}</span>
        <span v-if="selectedNode.code" class="tree-panel-selected-code">({{ selectedNode.code }})</span>
      </el-tag>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch, type Component } from 'vue'
  import { ElMessage, ElTreeV2, type TreeNodeData } from 'element-plus'
  import { Search } from '@element-plus/icons-vue'
  import HighlightText from '@/shared/components/HighlightText.vue'
  import { useTreeSearch } from '@/shared/composables/useTreeSearch'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { TreePickerNode } from '@/shared/types/Common.type'

  /** “加载更多”占位行ID前缀 */
  const MORE_NODE_ID_PREFIX = '__more__:'

  /** 根级“加载更多”占位行ID（根节点没有父ID，单独用一个ID） */
  const ROOT_MORE_NODE_ID = '__more_root__'

  /** 懒加载节点：占位行额外带 __more + parentId */
  type LazyNode = TreePickerNode & { parentId?: string; __more?: boolean }

  const props = withDefaults(
    defineProps<{
      modelValue?: string
      roots?: TreePickerNode[]
      excludeId?: string
      excludeMessage?: string
      placeholder?: string
      height?: number
      icon?: Component
      /** 懒加载：只渲染 roots，展开节点时再按需拉下级（需配合 loadChildren） */
      lazy?: boolean
      /** 懒加载：拉取某节点的下级，page 从 1 开始；hasMore 为 true 时末尾保留“加载更多” */
      loadChildren?: (parentId: string, page: number) => Promise<{ records: TreePickerNode[]; hasMore: boolean }>
      /** 懒加载：服务端搜索（page 从 1 开始），返回命中节点（树或扁平列表都会按 id 并入本地树），本地搜索再做高亮/过滤
       *  返回 `{ records, hasMore }` 时树下方会出现“加载更多命中”（只返回数组＝不支持分页） */
      searchNodes?: (keyword: string, page: number) => Promise<TreePickerNode[] | { records: TreePickerNode[]; hasMore: boolean }>
      /** 懒加载：拉取一级节点，page 从 1 开始；传了它则由面板自己管根级分页（不必再传 roots） */
      loadRoots?: (page: number) => Promise<{ records: TreePickerNode[]; hasMore: boolean }>
    }>(),
    {
      modelValue: '',
      roots: () => [],
      excludeId: '',
      excludeMessage: '不能选择该节点',
      placeholder: '输入名称或编码搜索',
      height: 320,
      icon: undefined,
      lazy: false,
      loadChildren: undefined,
      searchNodes: undefined,
      loadRoots: undefined
    }
  )

  const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

  const treeRef = ref<InstanceType<typeof ElTreeV2>>()

  /** 懒加载模式下的可变树（非懒加载直接用 props.roots） */
  const lazyRoots = ref<LazyNode[]>([])
  /** 懒加载进度：父节点ID → 已加载页 / 是否还有下一页 / 是否在加载 */
  const lazyState = reactive<Record<string, { page: number; hasMore: boolean; loading: boolean }>>({})
  /** 根级分页进度（仅 loadRoots 模式使用） */
  const rootState = reactive({ page: 0, hasMore: false, loading: false })
  /** 服务端搜索分页进度（searchNodes 返回 { records, hasMore } 时启用） */
  const searchState = reactive({ keyword: '', page: 0, hasMore: false, loading: false })
  /** 搜索请求序号：关键字/页码变化后丢弃过期响应 */
  let searchSeq = 0
  /** 懒加载下 el-tree-v2 会在 data 变化时重置展开态，因此自己维护一份 */
  const lazyExpandedKeys = ref<string[]>([])
  /** 服务端搜索命中的节点（含父链），过滤时强制可见 */
  const searchedIds = ref<Set<string>>(new Set())

  /**
   * 懒加载 + loadRoots：根列表末尾按需补一个根级占位行
   * 加载中/还没拉过第一页也显示（避免首屏闪一下“暂无数据”，失败时也留一个可重试的“加载更多”）
   */
  const treeData = computed<LazyNode[]>(() => {
    if (!props.lazy) return props.roots
    if (!props.loadRoots) return lazyRoots.value
    const showRootMore = rootState.loading || rootState.hasMore || rootState.page === 0
    return showRootMore ? [...lazyRoots.value, buildRootMoreNode()] : lazyRoots.value
  })

  const isMoreNode = (node: TreePickerNode | undefined): boolean => !!(node as LazyNode | undefined)?.__more

  /** 是否为根级“加载更多”占位行 */
  const isRootMoreNode = (node: LazyNode): boolean => node.id === ROOT_MORE_NODE_ID

  /** 节点的真实下级（排除“加载更多”占位行） */
  const realChildren = (node: LazyNode): LazyNode[] => (node.children ?? ([] as LazyNode[])).filter(child => !isMoreNode(child))

  /** 是否还有未加载的下级：加载过按分页进度，未加载过只要后端标了 hasChildren 就算
   *  ⚠️ 不要加上 `&& !realChildren(node).length`：服务端只返回「命中节点 + 父链」，
   *  节点已有的 children 往往只是命中结果的一部分，要求 children 为空会让这类节点永远拉不出剩余下级 */
  const needMoreNode = (node: LazyNode): boolean => {
    const loadState = lazyState[node.id]
    if (loadState) return loadState.hasMore
    return !!node.hasChildren
  }

  const buildMoreNode = (parentId: string): LazyNode => ({ id: MORE_NODE_ID_PREFIX + parentId, parentId, name: '加载更多', __more: true })

  const buildRootMoreNode = (): LazyNode => ({ id: ROOT_MORE_NODE_ID, name: '加载更多', __more: true })

  /**
   * 按需补“加载更多”占位行（幂等）
   * el-tree-v2 的叶子节点会把展开箭头隐藏，占位行同时起到“让节点可展开”的作用
   */
  const withMoreNode = (node: LazyNode): LazyNode => {
    const children = realChildren(node)
    return { ...node, children: needMoreNode(node) ? [...children, buildMoreNode(node.id)] : children }
  }

  const decorateNodes = (nodes: TreePickerNode[]): LazyNode[] =>
    nodes.map(node => withMoreNode({ ...node, children: node.children?.length ? decorateNodes(node.children) : undefined }))

  /** 在树里不可变地替换某个节点（触发 el-tree-v2 重新 setData） */
  const replaceNode = (nodes: LazyNode[], id: string, updater: (node: LazyNode) => LazyNode): LazyNode[] =>
    nodes.map(node => {
      if (node.id === id) return updater(node)
      if (!node.children?.length) return node
      return { ...node, children: replaceNode(node.children as LazyNode[], id, updater) }
    })

  /** 把服务端返回的树/扁平命中并入本地树（只增不减，保留已加载的下级与展开态） */
  const mergeNodes = (base: LazyNode[], incoming: TreePickerNode[]): LazyNode[] => {
    let merged = base
    incoming.forEach(node => {
      //搜索命中是扁平列表，命中节点可能已经作为下级存在于树里；
      //此时不能再挂一个同 ID 的根节点（el-tree-v2 以 id 为 key，会重复渲染/串展开态），只把它的下级并进去
      if (!TreeDataUtil.findNode(merged, node.id)) {
        merged = [...merged, decorateNodes([node])[0]]
        return
      }

      if (!node.children?.length) return
      const incomingChildren = node.children as TreePickerNode[]
      merged = replaceNode(merged, node.id, target => withMoreNode({ ...target, children: mergeNodes(realChildren(target), incomingChildren) }))
    })
    return merged
  }

  const isLoadingNode = (parentId?: string): boolean => !!parentId && !!lazyState[parentId]?.loading

  /** 占位行是否正在加载（根级 / 下级） */
  const isMoreLoading = (node: LazyNode): boolean => (isRootMoreNode(node) ? rootState.loading : isLoadingNode(node.parentId))

  /** 拉取某节点的下级并替换占位行 */
  const loadNodeChildren = async (parentId: string, page: number) => {
    const loadChildren = props.loadChildren
    if (!loadChildren) return

    if (!lazyState[parentId]) lazyState[parentId] = { page: 0, hasMore: true, loading: false }
    if (lazyState[parentId].loading) return
    lazyState[parentId].loading = true

    try {
      const { records = [], hasMore } = await loadChildren(parentId, page)
      //期间树被整体重建（重开弹窗等）：丢弃过期结果，避免把旧进度写进新树
      if (!TreeDataUtil.findNode(lazyRoots.value, parentId)) return

      lazyState[parentId].page = page
      lazyState[parentId].hasMore = !!hasMore

      lazyRoots.value = replaceNode(lazyRoots.value, parentId, node => {
        const exists = realChildren(node)
        const added = records.filter(record => !exists.some(child => child.id === record.id)).map(record => withMoreNode(record))
        return withMoreNode({ ...node, children: [...exists, ...added] })
      })
    } catch (error) {
      console.error('加载下级节点失败', error)
      ElMessage.error('加载下级节点失败')
    } finally {
      lazyState[parentId].loading = false
    }
  }

  /** 拉取一级节点下一页（仅 loadRoots 模式），已有节点按ID去重后追加 */
  const loadRootPage = async (page: number) => {
    const loadRoots = props.loadRoots
    if (!loadRoots || rootState.loading) return

    rootState.loading = true
    try {
      const { records = [], hasMore } = await loadRoots(page)
      rootState.page = page
      rootState.hasMore = !!hasMore

      const exists = lazyRoots.value
      const added = records.filter(record => !exists.some(node => node.id === record.id)).map(record => withMoreNode(record))
      lazyRoots.value = [...exists, ...added]
    } catch (error) {
      console.error('加载一级节点失败', error)
      ElMessage.error('加载一级节点失败')
    } finally {
      rootState.loading = false
    }
  }

  /** 搜索结果统一成 { records, hasMore }：调用方只返回数组时视为不可分页 */
  const normalizeSearchResult = (result: TreePickerNode[] | { records: TreePickerNode[]; hasMore: boolean }) =>
    Array.isArray(result) ? { records: result, hasMore: false } : { records: result?.records ?? [], hasMore: !!result?.hasMore }

  const resetSearchPaging = () => {
    searchState.keyword = ''
    searchState.page = 0
    searchState.hasMore = false
  }

  /** 懒加载 + 配置了服务端搜索：先把命中路径并入树，本地搜索负责高亮与过滤 */
  const prefetchSearchNodes = async (keyword: string) => {
    const searchNodes = props.searchNodes
    if (!props.lazy || !searchNodes || !keyword) {
      searchSeq += 1
      searchedIds.value = new Set()
      resetSearchPaging()
      return
    }

    //同一关键字且已拉过分页（例如“加载更多命中”后重建高亮）：不再请求，交给本地匹配表重新覆盖
    if (searchState.keyword === keyword && searchState.page > 0) return

    const seq = ++searchSeq
    const { records, hasMore } = normalizeSearchResult(await searchNodes(keyword, 1))
    //关键字已变（异步期间又输入了）：丢弃过期结果，否则分页状态会串到新关键字上
    if (seq !== searchSeq) return

    searchState.keyword = keyword
    searchState.page = 1
    searchState.hasMore = hasMore

    if (!records.length) {
      searchedIds.value = new Set()
      return
    }

    searchedIds.value = new Set(TreeDataUtil.collectAllNodes(records).map(node => node.id))
    lazyRoots.value = mergeNodes(lazyRoots.value, records)
  }

  /** 搜索结果分页：命中路径散落在树里，所以用独立按钮而不是树内占位行 */
  const handleLoadMoreSearch = async () => {
    const searchNodes = props.searchNodes
    const keyword = searchState.keyword
    if (!searchNodes || !keyword || searchState.loading || !searchState.hasMore) return

    const seq = ++searchSeq
    searchState.loading = true
    try {
      const page = searchState.page + 1
      const { records, hasMore } = normalizeSearchResult(await searchNodes(keyword, page))
      //关键字已变或已清空：丢弃本次结果
      if (seq !== searchSeq || searchState.keyword !== keyword) return

      searchState.page = page
      searchState.hasMore = hasMore
      searchedIds.value = new Set([...searchedIds.value, ...TreeDataUtil.collectAllNodes(records).map(node => node.id)])
      lazyRoots.value = mergeNodes(lazyRoots.value, records)
      //新并入的命中要和高亮表一致（同关键字，不会再请求服务端）
      await reapplySearch()
    } catch (error) {
      console.error('加载更多搜索命中失败', error)
      ElMessage.error('加载更多搜索命中失败')
    } finally {
      searchState.loading = false
    }
  }

  // 懒加载模式：每次 roots 变化（重新打开弹窗）重建一份可变的树
  watch(
    () => props.roots,
    value => {
      if (!props.lazy || props.loadRoots) return
      lazyRoots.value = decorateNodes(value ?? [])
    },
    { immediate: true }
  )

  // 懒加载 + loadRoots：一级节点也由面板按分页拉取（传了 loadRoots 就不再吃 roots）
  // 用 onMounted 而不是 watch(() => props.loadRoots)：调用方传内联箭头函数时函数身份每次都变，watch 会重复拉第一页
  onMounted(() => {
    if (props.lazy && props.loadRoots) loadRootPage(1)
  })

  const {
    searchText,
    matchCount,
    showMatchCount,
    isSearching,
    findNode,
    collectSubtreeIds,
    defaultExpandedKeys,
    handleSearchInput,
    handleSearchClear,
    resetSearch,
    filterMethod,
    getRanges,
    codeRanges,
    reapplySearch
  } = useTreeSearch<TreePickerNode>({
    roots: () => treeData.value,
    tree: () => treeRef.value,
    expandedKeys: (): string[] => expandedKeys.value,
    prefetch: prefetchSearchNodes
  })

  const searchExpandedKeys = computed<string[]>(() => defaultExpandedKeys(props.modelValue ? [props.modelValue] : []))
  /**
   * 懒加载自己维护展开态，普通模式仍按“根 + 当前值所在路径”展开
   * 搜索中额外并入命中路径：el-tree-v2 每次 data 变化都会重设展开集，不并进去会让搜索结果折叠
   */
  const expandedKeys = computed<string[]>(() => {
    if (!props.lazy) return searchExpandedKeys.value
    if (!isSearching.value) return lazyExpandedKeys.value
    return [...new Set([...lazyExpandedKeys.value, ...searchedIds.value])]
  })
  const excludedIds = computed(() => collectSubtreeIds(props.excludeId))
  const selectedNode = computed(() => (props.modelValue ? findNode(props.modelValue) : null))
  const emptyText = computed(() => (isSearching.value ? '未找到匹配的节点' : '暂无数据'))
  /** 有未加载的搜索命中时才显示“加载更多命中”（showMatchCount 保证已用当前关键字搜过） */
  const showSearchMore = computed(() => props.lazy && !!props.searchNodes && showMatchCount.value && searchState.hasMore)

  const treeProps = {
    value: 'id',
    label: 'name',
    children: 'children',
    class: (data: TreeNodeData) => (excludedIds.value.has((data as TreePickerNode).id) ? 'is-excluded' : '')
  }

  /** 服务端命中节点（含父链）强制可见，其余走本地模糊/包含匹配 */
  const panelFilterMethod = (query: string, data: TreeNodeData): boolean => {
    const node = data as LazyNode
    if (searchedIds.value.has(node.id)) return true
    //命中节点名下的“加载更多”占位行也要跟着显示：文案本身不匹配关键字，否则搜索时会被过滤掉，
    //搜索命中的节点就永远拉不出剩余下级（只放行命中节点的占位行，避免把无关节点一起拉出来）
    if (node.__more && node.parentId && searchedIds.value.has(node.parentId)) return true
    return filterMethod(query, node)
  }

  /** 展开节点：懒加载时自动拉第一页下级（已加载过的不重复拉） */
  const handleNodeExpand = async (data: TreeNodeData) => {
    if (!props.lazy) return
    const node = data as LazyNode
    if (isMoreNode(node)) return

    if (!lazyExpandedKeys.value.includes(node.id)) {
      lazyExpandedKeys.value = [...lazyExpandedKeys.value, node.id]
    }

    if (!props.loadChildren || lazyState[node.id] || !needMoreNode(node)) return
    await loadNodeChildren(node.id, 1)
  }

  const handleNodeCollapse = (data: TreeNodeData) => {
    if (!props.lazy) return
    const node = data as LazyNode
    // 已展开的下级也要一并移除：否则 el-tree-v2 的 setExpandedKeys 会为了展开这些下级而把本节点重新展开
    const collapsedIds = new Set([node.id, ...TreeDataUtil.collectAllNodes((node.children ?? []) as TreePickerNode[]).map(child => child.id)])
    lazyExpandedKeys.value = lazyExpandedKeys.value.filter(id => !collapsedIds.has(id))
  }

  const handleNodeClick = (data: TreeNodeData) => {
    const node = data as LazyNode

    // 占位行：加载下一页
    if (isMoreNode(node)) {
      if (isRootMoreNode(node)) {
        loadRootPage(rootState.page + 1)
        return
      }

      const parentId = node.parentId
      if (parentId && !isLoadingNode(parentId)) {
        loadNodeChildren(parentId, (lazyState[parentId]?.page ?? 0) + 1)
      }
      return
    }

    if (excludedIds.value.has(node.id)) {
      ElMessage.warning(props.excludeMessage)
      return
    }

    emit('update:modelValue', node.id)
  }

  const clear = () => emit('update:modelValue', '')

  /** 清空搜索：服务端命中的路径已并入树，只需清掉过滤白名单与搜索分页进度 */
  const handleSearchClearAll = () => {
    searchedIds.value = new Set()
    searchSeq += 1
    resetSearchPaging()
    handleSearchClear()
  }

  const reset = () => {
    resetSearch()
    searchedIds.value = new Set()
    searchSeq += 1
    resetSearchPaging()
    // 清空过滤状态，避免下次打开仍是上次的搜索结果
    treeRef.value?.filter('')
    nextTick(() => treeRef.value?.setExpandedKeys(expandedKeys.value))
  }

  onBeforeUnmount(() => resetSearch())

  defineExpose({ reset })
</script>

<style scoped lang="scss">
  .tree-panel {
    width: 100%;
  }

  .tree-panel-search {
    margin-bottom: 8px;
  }

  .tree-panel-count {
    font-size: 12px;
    color: #909399;
  }

  .tree-panel-tree {
    padding: 4px 0;
    border: 1px solid #dcdfe6;
    border-radius: 4px;

    /* 当前节点高亮 + 不可选节点置灰 */
    :deep(.el-tree-node) {
      &.is-current > .el-tree-node__content {
        background-color: #ecf5ff;
      }

      &.is-excluded .tree-panel-node {
        color: #c0c4cc;
        cursor: not-allowed;
      }
    }

    :deep(.el-tree-node__content) {
      padding: 0 8px;

      &:hover {
        background-color: #f5f7fa;
      }
    }
  }

  .tree-panel-node {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    padding-right: 8px;
    font-size: 14px;
  }

  /* 懒加载“加载更多”占位行 */
  .tree-panel-more {
    font-size: 13px;
    color: var(--el-color-primary);

    &.is-loading {
      color: var(--el-text-color-secondary);
    }
  }

  /* 搜索结果分页（命中路径散落在树里，用独立按钮） */
  .tree-panel-search-more {
    margin-top: 6px;
    text-align: center;
  }

  .tree-panel-icon {
    font-size: 14px;
    color: #409eff;
  }

  .tree-panel-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tree-panel-code {
    font-size: 12px;
    color: #909399;
  }

  .tree-panel-badge {
    margin-left: 4px;
    padding: 0 4px;
    font-size: 11px;
    line-height: 16px;
    color: #909399;
    background-color: #f4f4f5;
    border-radius: 2px;
  }

  .tree-panel-selected {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
    margin-top: 8px;
    font-size: 13px;
    color: #606266;
  }

  .tree-panel-selected-label {
    flex: none;
  }

  .tree-panel-selected-name {
    margin-left: 4px;
  }

  .tree-panel-selected-code {
    margin-left: 2px;
    font-size: 12px;
    opacity: 0.85;
  }
</style>
