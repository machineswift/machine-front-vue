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
            <el-button type="primary" @click="handleSearch" :disabled="!currentTabState.searchReady">搜索</el-button>
            <el-button @click="resetSearch" :disabled="!currentTabState.searchReady">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 数据展示区域 -->
    <el-card v-if="currentTabState.searchReady" ref="boxCardData" class="box-card-data">
      <el-tabs v-model="state.activeCountry" type="card" @tab-change="handleCountryChange">
        <el-tab-pane v-for="country in state.countryOptions" :key="country.code" :label="country.message" :name="country.code">
          <!-- 操作按钮 -->
          <div class="operation-buttons">
            <el-button type="primary" @click="handleAdd(null)" v-hasPermission="['SYSTEM:BASIC_DATA:AREA:CREATE']">添加</el-button>
          </div>

          <!-- 搜索结果提示 -->
          <div v-if="currentTabState.showSearchNotice" class="search-notice">
            <el-alert type="warning" :closable="false">
              显示前50个匹配结果，共找到 {{ currentTabState.matchedCount }} 个匹配项，搜索耗时 {{ currentTabState.searchTimeCost }} 毫秒
            </el-alert>
          </div>

          <!-- 数据表格 -->
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
            :estimated-row-height="60"
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
  // 定义组件名称，用于 keep-alive 缓存
  defineOptions({
    name: 'SYSTEM:BASIC_DATA:AREA'
  })
  import Fuse from 'fuse.js'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { useElementSize } from '@vueuse/core'
  import { ref, reactive, computed, onMounted, watch, h, nextTick, onBeforeUnmount } from 'vue'
  import { DataAreaApi } from '@/modules/data/area/api/DataArea.api'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import TableActions from '@/modules/data/area/DataAreaTableActions'
  import type { DataAreaExpandTreeResponseVo, IamDictionaryEnumInfoResponse } from '@/modules/data/types'
  import DataAreaCreateDialog from '@/modules/data/area/DataAreaCreateDialog.vue'
  import DataAreaEditDialog from '@/modules/data/area/DataAreaEditDialog.vue'
  import DataAreaDetailDialog from '@/modules/data/area/DataAreaDetailDialog.vue'
  import DataAreaUpdateParentDialog from '@/modules/data/area/DataAreaUpdateParentDialog.vue'

  interface TabState {
    // 搜索相关
    searchForm: {
      name: string
      code: string
    }
    searchReady: boolean
    isSearching: boolean
    matchedCount: number
    searchTimeCost: number
    showSearchNotice: boolean

    // 表格数据
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

    // 搜索工具
    nameFuse: Fuse<DataAreaExpandTreeResponseVo> | null
    codeFuse: Fuse<DataAreaExpandTreeResponseVo> | null
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
        rowData.highlight?.name ? h('span', { innerHTML: rowData.highlight.name }) : cellData
    },
    {
      key: 'code',
      title: '编码',
      dataKey: 'code',
      width: 200,
      align: 'left',
      cellRenderer: ({ cellData, rowData }: { cellData: string; rowData: DataAreaExpandTreeResponseVo }) =>
        rowData.highlight?.code ? h('span', { innerHTML: rowData.highlight.code }) : cellData
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
        h(TableActions, {
          rowData,
          onDetail: () => handleDetail(rowData),
          onAdd: () => handleAdd(rowData),
          onEdit: () => handleEdit(rowData),
          onChangeParent: () => handleChangeParent(rowData),
          onDelete: () => handleDelete(rowData),
          onDeleteConfirm: () => handleDeleteConfirm(rowData)
        })
    }
  ]

  // 状态管理
  const shouldRenderTable = ref(true)
  const enumStore = useDictionaryEnumStore()
  const pageContainerRef = ref<HTMLElement | null>(null)
  const searchCardRef = ref()
  const boxCardData = ref<HTMLElement | null>(null)
  const { width: containerWidth } = useElementSize(boxCardData)
  const tableHeight = ref<number>(680)
  let resizeObserver: ResizeObserver | null = null

  // 全局状态
  const state = reactive({
    countryOptions: [] as IamDictionaryEnumInfoResponse[],
    activeCountry: '',
    tabStates: new Map<string, TabState>(),
    initializedTabs: new Set<string>()
  })

  // 计算当前tab的状态
  const currentTabState = computed(() => {
    if (!state.activeCountry) {
      return createDefaultTabState()
    }

    if (!state.tabStates.has(state.activeCountry)) {
      state.tabStates.set(state.activeCountry, createDefaultTabState())
    }

    return state.tabStates.get(state.activeCountry)!
  })

  // 计算属性
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

  const calculateTableHeight = async () => {
    await nextTick()
    const dataCardEl = resolveElement(boxCardData.value)
    if (!dataCardEl) return
    const cardBody = dataCardEl.querySelector('.el-card__body')
    if (!(cardBody instanceof HTMLElement)) return

    const tabsHeaderHeight = (cardBody.querySelector('.el-tabs__header') as HTMLElement | null)?.offsetHeight || 40
    const operationButtonsHeight = (cardBody.querySelector('.operation-buttons') as HTMLElement | null)?.offsetHeight || 36
    const searchNoticeHeight = (cardBody.querySelector('.search-notice') as HTMLElement | null)?.offsetHeight || 0
    const contentSpacing = 24
    tableHeight.value = Math.max(320, cardBody.clientHeight - tabsHeaderHeight - operationButtonsHeight - searchNoticeHeight - contentSpacing)
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
    matchedCount: 0,
    searchTimeCost: 0,
    showSearchNotice: false,
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
    nameFuse: null,
    codeFuse: null
  })

  // 初始化国家选项
  const fetchCountryOptions = async () => {
    try {
      state.countryOptions = await enumStore.getEnumDataAsync('DataCountryEnum')
      if (state.countryOptions.length > 0) {
        state.activeCountry = state.countryOptions[0].code
      }
    } catch (error) {
      console.error('获取国家枚举失败', error)
    }
  }

  // 获取区域树数据
  const fetchAreaTree = async () => {
    if (!state.activeCountry) return

    const tabState = currentTabState.value

    try {
      const response = await DataAreaApi.treeExpand({ countryCode: state.activeCountry })
      tabState.rootNode = response
      tabState.allData = response.children || []
      tabState.displayData = response.children || []
      initSearchTools(tabState)
      tabState.searchReady = true
      state.initializedTabs.add(state.activeCountry)
    } catch (error) {
      console.error('获取区域树数据失败', error)
    }
  }

  // 初始化搜索工具
  const initSearchTools = (tabState: TabState) => {
    const flatData = TreeDataUtil.collectAllNodes(tabState.allData)

    tabState.nameFuse = new Fuse(flatData, {
      keys: ['name'],
      includeMatches: true,
      includeScore: true,
      threshold: 0.1,
      minMatchCharLength: 1,
      ignoreLocation: true,
      distance: 30,
      findAllMatches: true,
      tokenize: true
    })

    tabState.codeFuse = new Fuse(flatData, {
      keys: ['code'],
      includeMatches: true,
      includeScore: true,
      threshold: 0.3,
      minMatchCharLength: 3,
      ignoreLocation: true,
      distance: 10,
      findAllMatches: true,
      tokenize: true
    })
  }

  // 高亮匹配文本
  const highlightMatch = (text: string, matches: readonly Fuse.FuseResultMatch[] | undefined) => {
    if (!matches?.length) return text

    let result = text
    matches.forEach(match => {
      if (!match.indices?.length) return
      ;[...match.indices]
        .sort((a, b) => b[0] - a[0])
        .forEach(([start, end]) => {
          const matched = result.substring(start, end + 1)
          result = `${result.substring(0, start)}<span class="highlight">${matched}</span>${result.substring(end + 1)}`
        })
    })

    return result
  }

  // 执行搜索
  const performSearch = () => {
    const tabState = currentTabState.value
    const { name, code } = tabState.searchForm

    if (!name && !code) {
      resetSearch()
      return
    }

    tabState.isSearching = true
    const startTime = performance.now()
    let matchedItems: DataAreaExpandTreeResponseVo[] = []
    const parentIds = new Set<string>()

    // 名称搜索
    const nameResults = name && tabState.nameFuse ? tabState.nameFuse.search(name) : []
    // 编码搜索
    const codeResults = code && tabState.codeFuse ? tabState.codeFuse.search(code) : []

    // 组合搜索结果
    if (name && code) {
      const nameResultIds = new Set(nameResults.map(r => r.item.id))
      const codeResultIds = new Set(codeResults.map(r => r.item.id))

      // 取交集
      const intersectionIds = new Set([...nameResultIds].filter(id => codeResultIds.has(id)))
      tabState.matchedCount = intersectionIds.size

      // 创建合并的结果，包含两个搜索的高亮
      matchedItems = nameResults
        .filter(result => intersectionIds.has(result.item.id))
        .map(nameResult => {
          const codeResult = codeResults.find(cr => cr.item.id === nameResult.item.id)
          return {
            ...nameResult.item,
            highlight: {
              name: highlightMatch(nameResult.item.name, nameResult.matches),
              code: codeResult ? highlightMatch(codeResult.item.code, codeResult.matches) : codeResult?.item.code
            }
          }
        })
    } else if (name) {
      tabState.matchedCount = nameResults.length
      matchedItems = nameResults.slice(0, 50).map(result => ({
        ...result.item,
        highlight: { name: highlightMatch(result.item.name, result.matches) }
      }))
    } else if (code) {
      tabState.matchedCount = codeResults.length
      matchedItems = codeResults.slice(0, 50).map(result => ({
        ...result.item,
        highlight: { code: highlightMatch(result.item.code, result.matches) }
      }))
    }

    // 收集所有匹配节点及其父节点ID
    const matchedIds = new Set(
      matchedItems.map(item => {
        let parentId = item.parentId
        while (parentId) {
          parentIds.add(parentId)
          const parent = TreeDataUtil.findNode(tabState.allData, parentId)
          parentId = parent?.parentId
        }
        return item.id
      })
    )

    // 构建搜索结果树
    const buildResultTree = (nodes: DataAreaExpandTreeResponseVo[]): DataAreaExpandTreeResponseVo[] => {
      return nodes
        .filter(node => matchedIds.has(node.id) || parentIds.has(node.id))
        .map(node => {
          const newNode = { ...node }
          if (matchedIds.has(node.id)) {
            const matched = matchedItems.find(item => item.id === node.id)
            if (matched) newNode.highlight = matched.highlight
          }
          if (node.children) newNode.children = buildResultTree(node.children)
          return newNode
        })
    }

    tabState.displayData = buildResultTree(tabState.allData)
    tabState.expandedRowKeys = Array.from(parentIds).slice(0, 50)
    tabState.searchTimeCost = Math.round(performance.now() - startTime)
    tabState.showSearchNotice = tabState.matchedCount > 50
  }

  // 事件处理
  const handleSearch = () => {
    const tabState = currentTabState.value
    if (tabState.searchForm.code && tabState.searchForm.code.length < 3) {
      ElMessage.warning('编码至少需要3位字符')
      return
    }
    performSearch()
    calculateTableHeight()
  }

  const resetSearch = () => {
    const tabState = currentTabState.value
    tabState.searchForm.name = ''
    tabState.searchForm.code = ''
    tabState.isSearching = false
    tabState.matchedCount = 0
    tabState.searchTimeCost = 0
    tabState.showSearchNotice = false
    tabState.displayData = tabState.allData
    tabState.expandedRowKeys = []
    calculateTableHeight()
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
    fetchAreaTree()
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

  watch(
    () => currentTabState.value.showSearchNotice,
    () => {
      calculateTableHeight()
    }
  )

  // 初始化
  onMounted(async () => {
    await fetchCountryOptions()
    if (state.activeCountry) {
      await fetchAreaTree()
    }
    await nextTick()
    setupResizeObserver()
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

    .search-notice {
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

  // 优化表格行高，增加上下间距
  .area-table {
    :deep(.el-virtual-scroll__item) {
      padding: 4px 0;
    }

    :deep(.el-table-v2__row) {
      height: 48px;
    }

    :deep(.el-table-v2__cell) {
      padding: 4px 8px;
    }
  }
</style>
