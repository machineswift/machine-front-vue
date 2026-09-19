<template>
  <div ref="pageContainerRef" class="organization-page">
    <!-- 搜索表单区域 -->
    <el-card ref="searchCardRef" class="box-card-form">
      <el-form :model="currentTabState.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
        <div class="form-items-group">
          <el-form-item label="名称:" prop="name">
            <el-input v-model="currentTabState.searchForm.name" placeholder="请输入组织名称" clearable :disabled="!currentTabState.searchReady" />
          </el-form-item>
          <el-form-item label="编码:" prop="code">
            <el-input v-model="currentTabState.searchForm.code" placeholder="请输入组织编码,至少3位" clearable :disabled="!currentTabState.searchReady" />
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
      <el-tabs v-model="state.activeTab" type="card" @tab-change="handleTabChange">
        <el-tab-pane v-for="tab in state.tabs" :key="tab.code" :label="tab.message" :name="tab.code">
          <!-- 操作按钮 -->
          <div class="operation-buttons">
            <el-button type="primary" @click="handleAdd(null)" v-hasPermission="[PERMISSION_CODE.create]">添加</el-button>
          </div>

          <!-- 数据表格 -->
          <div :ref="el => setTableContainerRef(el, tab.code)" class="table-wrapper">
            <el-table-v2
              v-if="shouldRenderTable"
              v-model:expanded-row-keys="currentTabState.expandedRowKeys"
              :columns="tableColumns"
              :data="currentTabState.displayData"
              :width="tableWidth"
              :height="tableHeight"
              :expand-column-key="expandColumnKey"
              fixed
              row-key="id"
              :row-height="48"
              class="organization-table"
            />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 对话框组件 -->
    <BIamOrganizationCreateDialog v-model="currentTabState.dialogVisible.create" :parent-node="currentTabState.currentNode" @success="handleSuccess" />
    <BIamOrganizationEditDialog
      v-model="currentTabState.dialogVisible.edit"
      :organization-id="currentTabState.currentOrganizationId"
      @success="handleSuccess"
    />
    <BIamOrganizationUpdateParentDialog ref="updateParentDialog" :organization-tree="currentTabState.rootNode" @success="handleSuccess" />
    <BIamOrganizationDetailDialog v-model="currentTabState.dialogVisible.detail" :organization-id="currentTabState.currentOrganizationId" />
  </div>
</template>

<script lang="ts" setup>
  defineOptions({
    name: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ORGANIZATION'
  })
  import { ref, reactive, computed, onMounted, onActivated, watch, h, nextTick, onBeforeUnmount, markRaw, type ComponentPublicInstance, type VNode } from 'vue'
  import Fuse, { type FuseResultMatch } from 'fuse.js'
  import { ElMessage, ElMessageBox, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElTooltip, ElIcon } from 'element-plus'
  import { ArrowDown, Plus, Connection, Delete } from '@element-plus/icons-vue'
  import { useElementSize } from '@vueuse/core'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { BIamOrganizationApi } from '@/modules/biam/organization/api/BIamOrganization.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_IAM_ORG_TYPE } from '@/shared/constants/DictionaryEnum.constant'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { BIamOrganizationExpandTreeResponseVo } from '@/modules/biam/organization/type/BIamOrganization.type'
  import type { HighlightRange } from '@/shared/types/Common.type'
  import type { IamDictionaryEnumInfoResponse } from '@/shared/types/DictionaryEnum.type'
  import BIamOrganizationCreateDialog from '@/modules/biam/organization/BIamOrganizationCreateDialog.vue'
  import BIamOrganizationEditDialog from '@/modules/biam/organization/BIamOrganizationEditDialog.vue'
  import BIamOrganizationDetailDialog from '@/modules/biam/organization/BIamOrganizationDetailDialog.vue'
  import BIamOrganizationUpdateParentDialog from '@/modules/biam/organization/BIamOrganizationUpdateParentDialog.vue'

  interface TabState {
    searchForm: {
      name: string
      code: string
    }
    searchReady: boolean
    isSearching: boolean
    loadedCount: number
    resultShown: number
    resultTotal: number

    allData: BIamOrganizationExpandTreeResponseVo[]
    displayData: BIamOrganizationExpandTreeResponseVo[]
    expandedRowKeys: string[]

    rootNode: BIamOrganizationExpandTreeResponseVo | null

    currentNode: BIamOrganizationExpandTreeResponseVo | null
    currentOrganizationId: string

    dialogVisible: {
      create: boolean
      edit: boolean
      detail: boolean
    }

    /** 扁平化节点（编码按“包含”匹配时需遍历全量节点） */
    flatData: BIamOrganizationExpandTreeResponseVo[]
    nameFuse: Fuse<BIamOrganizationExpandTreeResponseVo> | null
  }

  /** 权限编码集中定义，避免散落在各个渲染函数中 */
  const PERMISSION_CODE = {
    detail: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ORGANIZATION:DETAIL',
    create: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ORGANIZATION:CREATE',
    update: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ORGANIZATION:UPDATE',
    updateParent: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ORGANIZATION:UPDATE_PARENT',
    delete: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:ORGANIZATION:DELETE'
  }

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
      cellRenderer: ({ cellData, rowData }: { cellData: string; rowData: BIamOrganizationExpandTreeResponseVo }) =>
        cellData && rowData.highlight?.name?.length ? h('span', null, renderHighlight(cellData, rowData.highlight.name)) : cellData
    },
    {
      key: 'code',
      title: '编码',
      dataKey: 'code',
      width: 160,
      align: 'left',
      cellRenderer: ({ cellData, rowData }: { cellData: string; rowData: BIamOrganizationExpandTreeResponseVo }) =>
        cellData && rowData.highlight?.code?.length ? h('span', null, renderHighlight(cellData, rowData.highlight.code)) : cellData
    },
    { key: 'organizationNumber', title: '组织数', dataKey: 'organizationNumber', width: 100, align: 'center' },
    { key: 'shopNumber', title: '门店数', dataKey: 'shopNumber', width: 100, align: 'center' },
    { key: 'userNumber', title: '用户数', dataKey: 'userNumber', width: 100, align: 'center' },
    { key: 'sort', title: '排序', dataKey: 'sort', width: 160, align: 'center' },
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
      cellRenderer: ({ rowData }: { rowData: BIamOrganizationExpandTreeResponseVo }) => {
        // 虚拟节点不可操作
        const isVirtualNode = rowData.code?.includes('org_virtual_node')

        if (isVirtualNode) {
          return h(
            ElTooltip,
            { content: '虚拟节点不可操作', placement: 'top' },
            {
              default: () =>
                h('div', { class: 'table-actions' }, [
                  h(ElButton, { size: 'small', disabled: true }, () => '详情'),
                  h(ElButton, { size: 'small', type: 'primary', disabled: true }, () => '编辑'),
                  h(
                    ElDropdown,
                    { trigger: 'click', placement: 'bottom-end', disabled: true },
                    {
                      default: () =>
                        h(ElButton, { size: 'small', type: 'info', disabled: true }, () => [
                          '更多',
                          h(ElIcon, { class: 'el-icon--right' }, { default: () => h(ArrowDown) })
                        ]),
                      dropdown: () =>
                        h(ElDropdownMenu, null, () => [
                          h(ElDropdownItem, { disabled: true }, () => [h(ElIcon, null, { default: () => h(Plus) }), h('span', null, '新增')]),
                          h(ElDropdownItem, { disabled: true }, () => [h(ElIcon, null, { default: () => h(Connection) }), h('span', null, '修改父节点')]),
                          h(ElDropdownItem, { disabled: true, divided: true }, () => [h(ElIcon, null, { default: () => h(Delete) }), h('span', null, '删除')])
                        ])
                    }
                  )
                ])
            }
          )
        }

        return h('div', { class: 'table-actions' }, [
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
                    h('span', null, '修改父节点')
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
    }
  ]

  const shouldRenderTable = ref(true)
  const enumStore = useDictionaryEnumStore()
  const searchCardRef = ref()
  const boxCardData = ref()
  const pageContainerRef = ref<HTMLElement | null>(null)
  const tableHeight = ref(400)
  const tableContainerRefMap = new Map<string, HTMLElement>()
  let resizeObserver: ResizeObserver | null = null
  let isFirstActivation = true
  const { width: containerWidth } = useElementSize(boxCardData)

  // 全局状态
  const state = reactive({
    tabs: [] as IamDictionaryEnumInfoResponse[],
    activeTab: '',
    tabStates: new Map<string, TabState>(),
    initializedTabs: new Set<string>()
  })

  // 计算当前tab的状态
  const currentTabState = computed(() => {
    if (!state.activeTab) {
      return createDefaultTabState()
    }

    if (!state.tabStates.has(state.activeTab)) {
      state.tabStates.set(state.activeTab, createDefaultTabState())
    }

    return state.tabStates.get(state.activeTab)!
  })

  const updateParentDialog = ref<InstanceType<typeof BIamOrganizationUpdateParentDialog>>()
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

  const setTableContainerRef = (el: Element | ComponentPublicInstance | null, tabCode: string) => {
    if (el instanceof HTMLElement) {
      tableContainerRefMap.set(tabCode, el)
      if (tabCode === state.activeTab) {
        updateTableHeight()
      }
      return
    }
    tableContainerRefMap.delete(tabCode)
  }

  let tableHeightScheduled = false

  const updateTableHeight = () => {
    if (tableHeightScheduled) return
    tableHeightScheduled = true

    nextTick(() => {
      tableHeightScheduled = false
      const tableContainer = tableContainerRefMap.get(state.activeTab)
      if (!tableContainer) return
      tableHeight.value = Math.max(tableContainer.clientHeight, 260)
    })
  }

  const setupResizeObserver = () => {
    const pageContainerEl = pageContainerRef.value
    const searchCardEl = resolveElement(searchCardRef.value)
    const dataCardEl = resolveElement(boxCardData.value)
    if (!pageContainerEl || !searchCardEl || !dataCardEl) return

    resizeObserver = new ResizeObserver(() => {
      updateTableHeight()
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
    loadedCount: 0,
    resultShown: 0,
    resultTotal: 0,
    allData: [],
    displayData: [],
    expandedRowKeys: [],
    rootNode: null,
    currentNode: null,
    currentOrganizationId: '',
    dialogVisible: {
      create: false,
      edit: false,
      detail: false
    },
    flatData: [],
    nameFuse: null
  })

  const fetchTabOptions = async () => {
    try {
      state.tabs = await enumStore.getEnumDataAsync(DICT_IAM_ORG_TYPE)
      if (state.tabs.length > 0) {
        state.activeTab = state.tabs[0].code
      }
    } catch (error) {
      console.error('获取组织类型枚举失败', error)
    }
  }

  const fetchOrganizationTree = async () => {
    if (!state.activeTab) return

    const tabState = currentTabState.value

    try {
      tabState.searchReady = false
      const response = await BIamOrganizationApi.treeExpand({ type: state.activeTab })
      tabState.rootNode = markRaw(response)
      tabState.allData = markRaw(response.children || [])
      tabState.displayData = tabState.allData
      initSearchTools(tabState)
      tabState.searchReady = true
      state.initializedTabs.add(state.activeTab)
    } catch (error) {
      console.error('获取组织树数据失败', error)
      ElMessage.error('获取组织数据失败，请稍后重试')
      tabState.searchReady = false
    }
  }

  const initSearchTools = (tabState: TabState) => {
    const flatData = markRaw(TreeDataUtil.collectAllNodes(tabState.allData) || [])
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

  // 收集并合并命中区间（升序、互不重叠），渲染时直接拼接文本节点
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
    let matchedItems: BIamOrganizationExpandTreeResponseVo[] = []
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
    const collectParentIdMap = (nodes: BIamOrganizationExpandTreeResponseVo[]) => {
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
    const buildResultTree = (nodes: BIamOrganizationExpandTreeResponseVo[]): BIamOrganizationExpandTreeResponseVo[] => {
      const result: BIamOrganizationExpandTreeResponseVo[] = []
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

    // 命中多少个就展开多少个父节点，不再截断（否则深层命中会被折叠隐藏）
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

  const handleTabChange = async (tabCode: string) => {
    state.activeTab = tabCode
    // 如果该类型数据尚未加载，则加载数据
    if (!state.initializedTabs.has(tabCode)) {
      await fetchOrganizationTree()
    } else {
      const tabState = currentTabState.value
      if (!tabState.searchReady && tabState.allData.length > 0) {
        tabState.searchReady = true
      }
    }

    //切换强制重新渲染
    shouldRenderTable.value = false
    await nextTick(() => {
      shouldRenderTable.value = true
    })
    resetSearch()
    await nextTick()
    updateTableHeight()
  }

  const handleDetail = (row: BIamOrganizationExpandTreeResponseVo) => {
    const tabState = currentTabState.value
    tabState.currentOrganizationId = row.id
    tabState.dialogVisible.detail = true
  }

  const handleAdd = (row: BIamOrganizationExpandTreeResponseVo | null) => {
    const tabState = currentTabState.value
    tabState.currentNode = row || tabState.rootNode
    tabState.dialogVisible.create = true
  }

  const handleEdit = (row: BIamOrganizationExpandTreeResponseVo) => {
    const tabState = currentTabState.value
    tabState.currentOrganizationId = row.id
    tabState.dialogVisible.edit = true
  }

  const handleChangeParent = (row: BIamOrganizationExpandTreeResponseVo) => {
    updateParentDialog.value?.open({
      id: row.id,
      name: row.name,
      parentId: row.parentId
    })
  }

  const handleDelete = async (row: { id: string }) => {
    try {
      await BIamOrganizationApi.destroy({ id: row.id })
      handleSuccess()
    } catch (error) {
      console.error('删除组织失败', error)
    }
  }

  const handleDeleteConfirm = async (row: { id: string; name: string }) => {
    try {
      await ElMessageBox.confirm(`确定要删除此组织 "${row.name}" 吗? 此操作不可恢复！`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await handleDelete(row)
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除组织失败', error)
      }
    }
  }

  const handleSuccess = () => {
    const tabState = currentTabState.value
    Object.keys(tabState.dialogVisible).forEach(key => {
      tabState.dialogVisible[key as keyof typeof tabState.dialogVisible] = false
    })
    fetchOrganizationTree()
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
    await fetchTabOptions()
    await fetchOrganizationTree()
    await nextTick()
    setupResizeObserver()
    updateTableHeight()
  })

  onActivated(async () => {
    if (isFirstActivation) {
      isFirstActivation = false
      return
    }
    await fetchOrganizationTree()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
    tableContainerRefMap.clear()
  })
</script>

<style scoped lang="scss">
  .organization-page {
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
      padding: 12px;
    }

    :deep(.el-tabs) {
      width: 100%;
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    :deep(.el-tabs__content) {
      flex: 1;
      min-height: 0;
    }

    :deep(.el-tab-pane) {
      height: 100%;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    .operation-buttons {
      margin-bottom: 10px;
    }

    .table-wrapper {
      flex: 1;
      min-height: 0;
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

  // 操作按钮样式 - 需要深度选择器以应用到 JSX 组件
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

  .organization-table {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;

    :deep(.el-table-v2__header-cell),
    :deep(.el-table-v2__row-cell) {
      border-right: 1px solid var(--el-border-color);
    }
  }
</style>
