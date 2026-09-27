<template>
  <div ref="pageContainerRef" class="area-page">
    <!-- 搜索表单区域 -->
    <el-card ref="searchCardRef" class="box-card-form">
      <el-form :model="currentTabState.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
        <div class="form-items-group">
          <el-form-item label="名称:" prop="name">
            <el-input v-model="currentTabState.searchForm.name" placeholder="请输入区域名称" clearable :disabled="!currentTabState.searchReady" />
          </el-form-item>
          <el-form-item label="编码:" prop="code">
            <el-input v-model="currentTabState.searchForm.code" placeholder="请输入区域编码,至少3位" clearable :disabled="!currentTabState.searchReady" />
          </el-form-item>
        </div>

        <div class="button-group">
          <el-form-item>
            <span class="search-limit-hint">结果{{ currentTabState.resultShown }}/{{ currentTabState.resultTotal }}条</span>
            <el-button type="primary" @click="handleSearch" :disabled="!currentTabState.searchReady">搜索</el-button>
            <el-button @click="resetSearch" :disabled="!currentTabState.searchReady">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 数据展示区域 -->
    <el-card v-if="currentTabState.searchReady" ref="boxCardData" class="box-card-data">
      <el-tabs v-model="state.activeCountry" type="card" @tab-change="handleCountryChange">
        <el-tab-pane v-for="country in countryOptions" :key="country.code" :label="country.message" :name="country.code">
          <!-- 操作按钮 -->
          <div class="operation-buttons">
            <el-button type="primary" @click="handleAdd(null)" v-hasPermission="[PERMISSION_CODE.create]">添加</el-button>
          </div>

          <!-- 数据表格 -->
          <el-table-v2
            v-if="shouldRenderTable"
            v-model:expanded-row-keys="currentTabState.expandedRowKeys"
            v-loading="currentTabState.loading"
            :columns="tableColumns"
            :data="currentTabState.displayData"
            :width="tableWidth"
            :height="tableHeight"
            :expand-column-key="expandColumnKey"
            :row-height="48"
            fixed
            row-key="id"
            class="area-table"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 对话框组件 -->
    <DataAreaCreateDialog v-model="currentTabState.dialogVisible.create" :parent-node="currentTabState.currentNode" @success="handleSuccess" />
    <DataAreaEditDialog v-model="currentTabState.dialogVisible.edit" :area-data="currentTabState.currentNode" @success="handleSuccess" />
    <DataAreaUpdateParentDialog ref="updateParentDialog" :area-tree="currentTabState.rootNode" @success="handleSuccess" />
    <DataAreaDetailDialog v-model="currentTabState.dialogVisible.detail" :area-id="currentTabState.currentAreaId" />
  </div>
</template>

<script lang="ts" setup>
  defineOptions({
    name: 'MANAGE_APP:SYSTEM:BASIC_DATA:AREA'
  })
  import { ref, reactive, computed, onMounted, onActivated, watch, h, nextTick, onBeforeUnmount, markRaw, type VNode } from 'vue'
  import Fuse, { type FuseResultMatch } from 'fuse.js'
  import { ElMessage, ElMessageBox, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus'
  import { ArrowDown, Plus, Connection, Delete } from '@element-plus/icons-vue'
  import { useElementSize } from '@vueuse/core'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { DataAreaApi } from '@/modules/data/area/api/DataArea.api'
  import { useEnumOptions } from '@/shared/composables/useEnumOptions'
  import { DICT_DATA_COUNTRY } from '@/shared/constants/DictionaryEnum.constant'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { DataAreaExpandTreeResponseVo } from '@/modules/data/area/type/DataArea.type'
  import type { HighlightRange } from '@/shared/types/Common.type'
  import DataAreaCreateDialog from '@/modules/data/area/DataAreaCreateDialog.vue'
  import DataAreaEditDialog from '@/modules/data/area/DataAreaEditDialog.vue'
  import DataAreaDetailDialog from '@/modules/data/area/DataAreaDetailDialog.vue'
  import DataAreaUpdateParentDialog from '@/modules/data/area/DataAreaUpdateParentDialog.vue'

  interface TabState {
    searchForm: {
      name: string
      code: string
    }
    searchReady: boolean
    isSearching: boolean
    /** 是否正在加载数据 */
    loading: boolean
    /** 已加载节点总数 */
    loadedCount: number
    /** 当前实际展示的结果数（受 SEARCH_RESULT_LIMIT 限制） */
    resultShown: number
    /** 命中总数（截断前） */
    resultTotal: number

    allData: DataAreaExpandTreeResponseVo[]
    displayData: DataAreaExpandTreeResponseVo[]
    expandedRowKeys: string[]

    // 树数据
    rootNode: DataAreaExpandTreeResponseVo | null

    // 当前选中节点
    currentNode: DataAreaExpandTreeResponseVo | null
    currentAreaId: string

    // 对话框状态
    dialogVisible: {
      create: boolean
      edit: boolean
      detail: boolean
    }

    /** 扁平化节点（编码按“包含”匹配时需遍历全量节点） */
    flatData: DataAreaExpandTreeResponseVo[]
    nameFuse: Fuse<DataAreaExpandTreeResponseVo> | null
  }

  /** 权限编码集中定义，避免散落在各个渲染函数中 */
  const PERMISSION_CODE = {
    detail: 'MANAGE_APP:SYSTEM:BASIC_DATA:AREA:DETAIL',
    create: 'MANAGE_APP:SYSTEM:BASIC_DATA:AREA:CREATE',
    update: 'MANAGE_APP:SYSTEM:BASIC_DATA:AREA:UPDATE',
    updateParent: 'MANAGE_APP:SYSTEM:BASIC_DATA:AREA:UPDATE_PARENT',
    delete: 'MANAGE_APP:SYSTEM:BASIC_DATA:AREA:DELETE'
  }

  // 单元格渲染函数会被虚拟表格频繁调用，权限结果提前算好（权限变化时自动重算）
  const permission = {
    detail: computed(() => hasPermission([PERMISSION_CODE.detail])),
    create: computed(() => hasPermission([PERMISSION_CODE.create])),
    update: computed(() => hasPermission([PERMISSION_CODE.update])),
    updateParent: computed(() => hasPermission([PERMISSION_CODE.updateParent])),
    delete: computed(() => hasPermission([PERMISSION_CODE.delete]))
  }

  /** 命中区间渲染为 文本 + <span class="highlight">，不使用 innerHTML */
  const renderHighlight = (text: string, ranges: HighlightRange[]): Array<string | VNode> => {
    const nodes: Array<string | VNode> = []
    let cursor = 0
    for (const [start, end] of ranges) {
      if (start > cursor) nodes.push(text.slice(cursor, start))
      nodes.push(h('span', { class: 'highlight' }, text.slice(start, end + 1)))
      cursor = end + 1
    }
    if (cursor < text.length) nodes.push(text.slice(cursor))
    return nodes
  }

  // 组件配置
  const tableColumns = [
    { key: 'id', title: 'ID', dataKey: 'id', width: 200, hidden: true },
    {
      key: 'name',
      title: '名称',
      dataKey: 'name',
      width: 160,
      fixed: true,
      align: 'center',
      cellRenderer: ({ cellData, rowData }: { cellData: string; rowData: DataAreaExpandTreeResponseVo }) =>
        cellData && rowData.highlight?.name?.length ? h('span', null, renderHighlight(cellData, rowData.highlight.name)) : cellData
    },
    {
      key: 'code',
      title: '编码',
      dataKey: 'code',
      width: 200,
      align: 'left',
      cellRenderer: ({ cellData, rowData }: { cellData: string; rowData: DataAreaExpandTreeResponseVo }) =>
        cellData && rowData.highlight?.code?.length ? h('span', null, renderHighlight(cellData, rowData.highlight.code)) : cellData
    },
    { key: 'sort', title: '排序', dataKey: 'sort', width: 120, align: 'center' },
    { key: 'createName', title: '创建人', dataKey: 'createName', width: 120, align: 'center' },
    {
      key: 'createTime',
      title: '创建时间',
      dataKey: 'createTime',
      width: 180,
      align: 'center',
      cellRenderer: ({ cellData }: { cellData: string }) => (cellData ? new Date(cellData).toLocaleString() : '-')
    },
    { key: 'updateName', title: '修改人', dataKey: 'updateName', width: 120, align: 'center' },
    {
      key: 'updateTime',
      title: '修改时间',
      dataKey: 'updateTime',
      width: 180,
      align: 'center',
      cellRenderer: ({ cellData }: { cellData: string }) => (cellData ? new Date(cellData).toLocaleString() : '-')
    },
    {
      key: 'operation',
      title: '操作',
      width: 200,
      align: 'center',
      fixed: 'right',
      cellRenderer: ({ rowData }: { rowData: DataAreaExpandTreeResponseVo }) =>
        h('div', { class: 'table-actions' }, [
          h(ElButton, { size: 'small', disabled: !permission.detail.value, onClick: () => handleDetail(rowData) }, () => '详情'),
          h(ElButton, { size: 'small', type: 'primary', disabled: !permission.update.value, onClick: () => handleEdit(rowData) }, () => '编辑'),
          h(
            ElDropdown,
            {
              trigger: 'click',
              placement: 'bottom-end',
              onCommand: (command: string) => {
                const commandMap: Record<string, () => void> = {
                  add: () => handleAdd(rowData),
                  changeParent: () => handleChangeParent(rowData),
                  delete: () => handleDeleteConfirm(rowData)
                }
                commandMap[command]?.()
              }
            },
            {
              default: () =>
                h(ElButton, { size: 'small', type: 'info' }, () => ['更多', h(ElIcon, { class: 'el-icon--right' }, { default: () => h(ArrowDown) })]),
              dropdown: () =>
                h(ElDropdownMenu, null, () => [
                  h(ElDropdownItem, { command: 'add', disabled: !permission.create.value }, () => [
                    h(ElIcon, null, { default: () => h(Plus) }),
                    h('span', null, '新增')
                  ]),
                  h(ElDropdownItem, { command: 'changeParent', disabled: !permission.updateParent.value }, () => [
                    h(ElIcon, null, { default: () => h(Connection) }),
                    h('span', null, '移动')
                  ]),
                  h(ElDropdownItem, { command: 'delete', divided: true, disabled: !permission.delete.value }, () => [
                    h(ElIcon, null, { default: () => h(Delete) }),
                    h('span', null, '删除')
                  ])
                ])
            }
          )
        ])
    }
  ]

  const shouldRenderTable = ref(true)
  const pageContainerRef = ref<HTMLElement | null>(null)
  const searchCardRef = ref()
  const boxCardData = ref<HTMLElement | null>(null)
  const { width: containerWidth } = useElementSize(boxCardData)
  const tableHeight = ref<number>(680)
  let resizeObserver: ResizeObserver | null = null
  let isFirstActivation = true

  const { options: countryOptions, load: loadCountryOptions } = useEnumOptions(DICT_DATA_COUNTRY)

  const state = reactive({
    activeCountry: '',
    tabStates: new Map<string, TabState>(),
    initializedTabs: new Set<string>()
  })

  const currentTabState = computed(() => {
    if (!state.activeCountry) {
      return createDefaultTabState()
    }

    if (!state.tabStates.has(state.activeCountry)) {
      state.tabStates.set(state.activeCountry, createDefaultTabState())
    }

    return state.tabStates.get(state.activeCountry)!
  })

  const updateParentDialog = ref<InstanceType<typeof DataAreaUpdateParentDialog>>()
  const expandColumnKey = ref('name')
  const tableWidth = computed(() => Math.max(containerWidth.value - 24, 800))

  const resolveElement = (target: unknown): HTMLElement | null => {
    if (target instanceof HTMLElement) return target
    if (target && typeof target === 'object' && '$el' in target) {
      const el = (target as { $el?: Element }).$el
      return el instanceof HTMLElement ? el : null
    }
    return null
  }

  let tableHeightScheduled = false

  const calculateTableHeight = () => {
    if (tableHeightScheduled) return
    tableHeightScheduled = true

    nextTick(() => {
      tableHeightScheduled = false
      const dataCardEl = resolveElement(boxCardData.value)
      if (!dataCardEl) return
      const cardBody = dataCardEl.querySelector('.el-card__body')
      if (!(cardBody instanceof HTMLElement)) return

      const tabsHeaderHeight = (cardBody.querySelector('.el-tabs__header') as HTMLElement | null)?.offsetHeight || 40
      const operationButtonsHeight = (cardBody.querySelector('.operation-buttons') as HTMLElement | null)?.offsetHeight || 36
      const contentSpacing = 24
      tableHeight.value = Math.max(320, cardBody.clientHeight - tabsHeaderHeight - operationButtonsHeight - contentSpacing)
    })
  }

  const setupResizeObserver = () => {
    const pageContainerEl = pageContainerRef.value
    const searchCardEl = resolveElement(searchCardRef.value)
    const dataCardEl = resolveElement(boxCardData.value)
    if (!pageContainerEl || !searchCardEl || !dataCardEl) return

    resizeObserver = new ResizeObserver(() => {
      calculateTableHeight()
    })

    resizeObserver.observe(pageContainerEl)
    resizeObserver.observe(searchCardEl)
    resizeObserver.observe(dataCardEl)
  }

  // 创建默认的tab状态
  const createDefaultTabState = (): TabState => ({
    searchForm: { name: '', code: '' },
    searchReady: false,
    isSearching: false,
    loading: false,
    loadedCount: 0,
    resultShown: 0,
    resultTotal: 0,
    allData: [],
    displayData: [],
    expandedRowKeys: [],
    rootNode: null,
    currentNode: null,
    currentAreaId: '',
    dialogVisible: {
      create: false,
      edit: false,
      detail: false
    },
    flatData: [],
    nameFuse: null
  })

  const fetchCountryOptions = async () => {
    try {
      await loadCountryOptions()
      if (countryOptions.value.length > 0) {
        state.activeCountry = countryOptions.value[0].code
      }
    } catch (error) {
      console.error('获取国家枚举失败', error)
    }
  }

  const fetchAreaTree = async () => {
    if (!state.activeCountry) return

    const tabState = currentTabState.value

    try {
      tabState.loading = true
      const response = await DataAreaApi.treeExpand({ country: state.activeCountry })
      tabState.rootNode = markRaw(response)
      tabState.allData = markRaw(response.children || [])
      tabState.displayData = tabState.allData
      initSearchTools(tabState)
      tabState.searchReady = true
      state.initializedTabs.add(state.activeCountry)
    } catch (error) {
      console.error('获取区域树数据失败', error)
      ElMessage.error('获取区域数据失败，请稍后重试')
    } finally {
      tabState.loading = false
    }
  }

  const initSearchTools = (tabState: TabState) => {
    const flatData = markRaw(TreeDataUtil.collectAllNodes(tabState.allData))
    tabState.flatData = flatData

    tabState.loadedCount = flatData.length
    tabState.resultShown = flatData.length
    tabState.resultTotal = flatData.length

    // 仅名称使用模糊匹配；编码是标识符，走精确包含匹配（见 collectSubstringRanges）
    tabState.nameFuse = new Fuse(flatData, {
      keys: ['name'],
      includeMatches: true,
      includeScore: true,
      threshold: 0.1,
      minMatchCharLength: 1,
      ignoreLocation: true,
      distance: 30,
      findAllMatches: true,
      tokenize: (text: string) => text.split(/\s+/)
    })
  }

  const getHighlightRanges = (matches: readonly FuseResultMatch[] | undefined): HighlightRange[] => {
    if (!matches?.length) return []

    const ranges: HighlightRange[] = []
    matches.forEach(match => match.indices?.forEach(([start, end]) => ranges.push([start, end])))
    if (!ranges.length) return []

    ranges.sort((a, b) => a[0] - b[0])
    const merged: HighlightRange[] = [ranges[0]]
    for (let i = 1; i < ranges.length; i++) {
      const current = ranges[i]
      const last = merged[merged.length - 1]
      if (current[0] <= last[1] + 1) {
        if (current[1] > last[1]) last[1] = current[1]
      } else {
        merged.push(current)
      }
    }
    return merged
  }

  /** 编码命中区间：按“包含”逐段定位（大小写不敏感） */
  const collectSubstringRanges = (text: string, query: string): HighlightRange[] => {
    const ranges: HighlightRange[] = []
    const target = query.toLowerCase()
    if (!target) return ranges

    const source = text.toLowerCase()
    let from = 0
    while (from <= source.length - target.length) {
      const index = source.indexOf(target, from)
      if (index === -1) break
      ranges.push([index, index + target.length - 1])
      from = index + target.length
    }
    return ranges
  }

  const SEARCH_RESULT_LIMIT = 256

  // 执行搜索
  const performSearch = () => {
    const tabState = currentTabState.value
    const { name, code } = tabState.searchForm

    if (!name && !code) {
      resetSearch()
      return
    }

    tabState.isSearching = true
    let matchedItems: DataAreaExpandTreeResponseVo[] = []
    let matchedTotal = 0
    const parentIds = new Set<string>()

    // 名称搜索（模糊匹配）
    const nameResults = name && tabState.nameFuse ? tabState.nameFuse.search(name) : []
    // 编码搜索（精确包含，避免模糊匹配把 0001 命中到 0000）
    const codeKeyword = code.toLowerCase()
    const codeHits = code ? tabState.flatData.filter(node => node.code?.toLowerCase().includes(codeKeyword)) : []

    // 组合搜索结果
    if (name && code) {
      const nameResultIds = new Set(nameResults.map(r => r.item.id))
      const codeIdSet = new Set(codeHits.map(item => item.id))

      // 取交集
      const intersectionIds = new Set([...nameResultIds].filter(id => codeIdSet.has(id)))
      matchedTotal = intersectionIds.size

      matchedItems = nameResults
        .filter(result => intersectionIds.has(result.item.id))
        .slice(0, SEARCH_RESULT_LIMIT)
        .map(nameResult => ({
          ...nameResult.item,
          highlight: {
            name: getHighlightRanges(nameResult.matches),
            code: collectSubstringRanges(nameResult.item.code ?? '', code)
          }
        }))
    } else if (name) {
      matchedTotal = nameResults.length
      matchedItems = nameResults.slice(0, SEARCH_RESULT_LIMIT).map(result => ({
        ...result.item,
        highlight: { name: getHighlightRanges(result.matches) }
      }))
    } else if (code) {
      matchedTotal = codeHits.length
      matchedItems = codeHits.slice(0, SEARCH_RESULT_LIMIT).map(item => ({
        ...item,
        highlight: { code: collectSubstringRanges(item.code ?? '', code) }
      }))
    }

    tabState.resultShown = matchedItems.length
    tabState.resultTotal = matchedTotal

    const parentIdMap = new Map<string, string>()
    const collectParentIdMap = (nodes: DataAreaExpandTreeResponseVo[]) => {
      for (const node of nodes) {
        if (!node.children?.length) continue
        for (const child of node.children) {
          parentIdMap.set(child.id, node.id)
        }
        collectParentIdMap(node.children)
      }
    }
    collectParentIdMap(tabState.allData)

    const matchedIds = new Set<string>()
    matchedItems.forEach(item => {
      matchedIds.add(item.id)
      let parentId: string | undefined = item.parentId
      while (parentId) {
        if (parentIds.has(parentId)) break
        parentIds.add(parentId)
        parentId = parentIdMap.get(parentId)
      }
    })

    // 构建搜索结果树
    const matchedMap = new Map(matchedItems.map(item => [item.id, item]))
    const buildResultTree = (nodes: DataAreaExpandTreeResponseVo[]): DataAreaExpandTreeResponseVo[] => {
      const result: DataAreaExpandTreeResponseVo[] = []
      for (const node of nodes) {
        const isMatched = matchedIds.has(node.id)
        if (!isMatched && !parentIds.has(node.id)) continue

        const newNode = { ...node }
        if (isMatched) {
          const matched = matchedMap.get(node.id)
          if (matched) newNode.highlight = matched.highlight
        }
        if (node.children) newNode.children = buildResultTree(node.children)
        result.push(newNode)
      }
      return result
    }

    tabState.displayData = markRaw(buildResultTree(tabState.allData))
    tabState.expandedRowKeys = Array.from(parentIds)
  }

  // 事件处理
  const handleSearch = () => {
    const tabState = currentTabState.value
    if (tabState.searchForm.code && tabState.searchForm.code.length < 3) {
      ElMessage.warning('编码至少需要3位字符')
      return
    }
    performSearch()
  }

  const resetSearch = () => {
    const tabState = currentTabState.value
    tabState.searchForm.name = ''
    tabState.searchForm.code = ''
    tabState.isSearching = false
    tabState.displayData = tabState.allData
    tabState.expandedRowKeys = []
    tabState.resultShown = tabState.loadedCount
    tabState.resultTotal = tabState.loadedCount
  }

  const refreshPreservingView = async () => {
    const tabState = currentTabState.value
    const previousExpandedKeys = [...tabState.expandedRowKeys]
    await fetchAreaTree()
    if (tabState.isSearching) {
      performSearch()
      return
    }
    const existingIds = new Set(tabState.flatData.map(node => node.id))
    tabState.expandedRowKeys = previousExpandedKeys.filter(id => existingIds.has(id))
  }

  const handleCountryChange = async (countryCode: string) => {
    state.activeCountry = countryCode
    // 如果该国家数据尚未加载，则加载数据
    if (!state.initializedTabs.has(countryCode)) {
      await fetchAreaTree()
    }

    //切换强制重新渲染
    shouldRenderTable.value = false
    await nextTick(() => {
      shouldRenderTable.value = true
    })
    handleSearch()
    calculateTableHeight()
  }

  const handleDetail = (row: DataAreaExpandTreeResponseVo) => {
    const tabState = currentTabState.value
    tabState.currentAreaId = row.id
    tabState.dialogVisible.detail = true
  }

  const handleAdd = (row: DataAreaExpandTreeResponseVo | null) => {
    const tabState = currentTabState.value
    tabState.currentNode = row || tabState.rootNode
    tabState.dialogVisible.create = true
  }

  const handleEdit = (row: DataAreaExpandTreeResponseVo) => {
    const tabState = currentTabState.value
    tabState.currentNode = row
    tabState.dialogVisible.edit = true
  }

  const handleChangeParent = (row: DataAreaExpandTreeResponseVo) => {
    updateParentDialog.value?.open({
      id: row.id,
      name: row.name,
      parentId: row.parentId
    })
  }

  const handleDelete = async (row: { id: string }) => {
    try {
      await DataAreaApi.destroy({ id: row.id })
      handleSuccess()
    } catch (error) {
      console.error('删除区域失败', error)
    }
  }

  const handleDeleteConfirm = async (row: { id: string; name: string }) => {
    try {
      await ElMessageBox.confirm(`确定要删除此区域 "${row.name}" 吗? 此操作不可恢复！`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await handleDelete(row)
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除区域失败', error)
      }
    }
  }

  const handleSuccess = () => {
    const tabState = currentTabState.value
    Object.keys(tabState.dialogVisible).forEach(key => {
      tabState.dialogVisible[key as keyof typeof tabState.dialogVisible] = false
    })
    // 刷新后仍按当前搜索条件过滤，并保留已展开的节点，避免视图跳变
    void refreshPreservingView()
    calculateTableHeight()
  }

  // 监听器
  watch(
    () => currentTabState.value.searchForm,
    ({ name, code }) => {
      if (!name && !code && currentTabState.value.isSearching) {
        resetSearch()
      }
    },
    { deep: true }
  )

  onMounted(async () => {
    await fetchCountryOptions()
    await fetchAreaTree()
    await nextTick()
    setupResizeObserver()
    calculateTableHeight()
  })

  onActivated(async () => {
    if (isFirstActivation) {
      isFirstActivation = false
      return
    }
    // 从其他标签页切回时刷新数据，同时保持搜索条件、结果计数与展开状态
    await refreshPreservingView()
    calculateTableHeight()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })
</script>

<style scoped lang="scss">
  .area-page {
    height: 100%;
    min-height: 0;
    padding: 4px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-sizing: border-box;
  }

  .box-card-form {
    margin: 0;
    flex-shrink: 0;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    .search-form {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;

      .form-items-group {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .el-form-item {
        margin-bottom: 0;

        .el-input {
          width: 200px;
        }
      }

      .button-group {
        margin-left: auto;
        white-space: nowrap;

        .search-limit-hint {
          margin-right: 12px;
          color: var(--el-text-color-secondary);
          font-size: 12px;
        }
      }
    }
  }

  .box-card-data {
    margin: 0;
    flex: 1;
    min-height: 0;
    display: flex;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 12px;
      gap: 8px;
    }

    .operation-buttons {
      margin-bottom: 10px;
    }
  }

  /* 高亮样式 */
  :deep(.highlight) {
    background-color: #fffb8f;
    color: #000;
    font-weight: bold;
    padding: 0 2px;
    border-radius: 2px;
  }

  :deep(.table-actions) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 2px;

    .el-button {
      margin: 0;
      margin-right: 2px;

      &:last-child {
        margin-right: 0;
      }
    }

    .el-dropdown {
      margin-left: 2px;
    }
  }

  .area-table {
    :deep(.el-table-v2__row-cell) {
      padding: 0 8px;
    }
  }
</style>
