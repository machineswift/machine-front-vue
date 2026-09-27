<template>
  <div ref="pageContainerRef" class="permission-page">
    <!-- 搜索卡片 -->
    <el-card ref="searchCardRef" class="box-card-form">
      <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
        <div class="form-items-group">
          <el-form-item label="名称:" prop="name">
            <el-input v-model="state.searchForm.name" placeholder="请输入权限名称" clearable />
          </el-form-item>
          <el-form-item label="编码:" prop="code">
            <el-input v-model="state.searchForm.code" placeholder="请输入权限编码" clearable />
          </el-form-item>
          <el-form-item label="图标:" prop="icon">
            <el-input v-model="state.searchForm.icon" placeholder="请输入权限图标" clearable />
          </el-form-item>
        </div>

        <div class="button-group">
          <el-form-item>
            <span class="search-limit-hint">结果{{ state.resultShown }}/{{ state.resultTotal }}条</span>
            <el-button type="primary" @click="handleSearch" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION:TREE_EXPAND']">搜索</el-button>
            <el-button @click="resetSearch" v-hasPermission="['MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION:TREE_EXPAND']">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card ref="dataCardRef" class="box-card-data">
      <div v-show="tableHeightReady" class="table-wrapper">
        <el-table-v2
          v-model:expanded-row-keys="state.expandedRowKeys"
          :columns="tableColumns"
          :data="state.tableDataToShow"
          :width="tableWidth"
          :height="tableHeight"
          :expand-column-key="expandColumnKey"
          :indent-size="16"
          :icon-size="14"
          :row-height="44"
          fixed
          row-key="id"
          class="permission-table"
          v-loading="state.loading"
        >
          <template #empty>
            <div class="table-empty">暂无数据</div>
          </template>
        </el-table-v2>
      </div>

      <!-- 骨架屏占位 -->
      <div v-show="!tableHeightReady" class="table-placeholder">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>

    <!-- 对话框组件 -->
    <BIamPermissionCreateDialog v-model="state.dialogs.create.visible" :parent-node="state.currentRow!" @success="handleDialogSuccess" />
    <BIamPermissionEditDialog v-model="state.dialogs.edit.visible" :permission-id="state.currentId" @success="handleDialogSuccess" />
    <BIamPermissionDetailDialog v-model="state.dialogs.detail.visible" :permission-id="state.currentId" />
    <BIamPermissionUpdateParentDialog ref="updateParentDialogRef" :permission-tree="state.treeData" @success="handleDialogSuccess" />
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION'
  })
  import { ref, reactive, onMounted, onActivated, onBeforeUnmount, nextTick, h, watch, markRaw, defineComponent, resolveComponent, type VNode } from 'vue'
  import Fuse, { type FuseResultMatch } from 'fuse.js'
  import { ElMessage, ElMessageBox, ElTag, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus'
  import { ArrowDown, Plus, Connection, Delete } from '@element-plus/icons-vue'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import { BIamPermissionApi } from '@/modules/biam/permission/api/BIamPermission.api'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { BIamPermissionTreeExpandResponseVo } from '@/modules/biam/permission/type/BIamPermission.type'
  import type { HighlightRange } from '@/shared/types/Common.type'
  import BIamPermissionCreateDialog from '@/modules/biam/permission/BIamPermissionCreateDialog.vue'
  import BIamPermissionEditDialog from '@/modules/biam/permission/BIamPermissionEditDialog.vue'
  import BIamPermissionUpdateParentDialog from '@/modules/biam/permission/BIamPermissionUpdateParentDialog.vue'
  import BIamPermissionDetailDialog from '@/modules/biam/permission/BIamPermissionDetailDialog.vue'
  import SvgIcon from '@/shared/components/SvgIcon.vue'
  import { useDictionaryEnumStore } from '@/shared/stores/DictionaryEnum.store'
  import { DICT_IAM_PERMISSION_RESOURCE_TYPE, DICT_IAM_DATA_PERMISSION_SCOPE_TYPE } from '@/shared/constants/DictionaryEnum.constant'

  /** el-tag 支持的 type 取值 */
  type TagType = 'primary' | 'success' | 'info' | 'warning' | 'danger'

  const RESOURCE_TYPE_TAG_MAP: Record<string, TagType> = {
    APP: 'primary',
    MODULE: 'success',
    DIRECTORY: 'info',
    MENU: 'warning',
    BUTTON: 'danger'
  }

  const enumStore = useDictionaryEnumStore()
  const searchFormRef = ref()
  const updateParentDialogRef = ref()
  const searchCardRef = ref()
  const dataCardRef = ref()
  const pageContainerRef = ref<HTMLElement | null>(null)

  // 表格尺寸 - 初始为0，等计算完成后再显示
  const tableHeight = ref<number>(0)
  const tableWidth = ref<number>(0)
  const tableHeightReady = ref<boolean>(false)
  // 树形展开所在列
  const expandColumnKey = 'name'
  let resizeObserver: ResizeObserver | null = null
  let isFirstCalculation = true
  let isFirstActivation = true

  const resolveCardElement = (target: unknown): HTMLElement | null => {
    if (target instanceof HTMLElement) return target
    if (target && typeof target === 'object' && '$el' in target) {
      const el = (target as { $el?: Element }).$el
      return el instanceof HTMLElement ? el : null
    }
    return null
  }

  const updateTableSize = async () => {
    await nextTick()
    const dataCardEl = resolveCardElement(dataCardRef.value)
    if (!dataCardEl) return
    const cardBody = dataCardEl.querySelector('.el-card__body')
    if (!(cardBody instanceof HTMLElement)) return

    // 去掉卡片的 12px 内边距，保障表格恰好铺满内容区（最小尺寸避免极小视口下不可用）
    const contentHeight = cardBody.clientHeight - 24
    const contentWidth = cardBody.clientWidth - 24
    tableHeight.value = Math.max(260, contentHeight)
    tableWidth.value = Math.max(320, contentWidth)

    // 首次拿到真实尺寸后再显示表格（容器若被隐藏，尺寸变化时 ResizeObserver 会再次触发）
    if (isFirstCalculation && contentHeight > 0 && contentWidth > 0) {
      tableHeightReady.value = true
      isFirstCalculation = false
    }
  }

  const setupResizeObserver = () => {
    const pageContainerEl = pageContainerRef.value
    const searchCardEl = resolveCardElement(searchCardRef.value)
    const dataCardEl = resolveCardElement(dataCardRef.value)
    if (!pageContainerEl || !searchCardEl || !dataCardEl) return

    resizeObserver = new ResizeObserver(() => {
      updateTableSize()
    })

    resizeObserver.observe(pageContainerEl)
    resizeObserver.observe(searchCardEl)
    resizeObserver.observe(dataCardEl)
  }

  // 组件状态
  const state = reactive({
    loading: false,
    isSearching: false,
    searchForm: {
      name: '',
      code: '',
      icon: ''
    },
    loadedCount: 0,
    resultShown: 0,
    resultTotal: 0,
    currentId: '',
    currentRow: null as BIamPermissionTreeExpandResponseVo | null,
    expandedRowKeys: [] as string[],
    tableData: [] as BIamPermissionTreeExpandResponseVo[],
    tableDataToShow: [] as BIamPermissionTreeExpandResponseVo[],
    treeData: null as BIamPermissionTreeExpandResponseVo | null,
    /** 扁平化节点（编码按“包含”匹配时需遍历全量节点） */
    flatData: [] as BIamPermissionTreeExpandResponseVo[],
    nameFuse: null as Fuse<BIamPermissionTreeExpandResponseVo> | null,
    iconFuse: null as Fuse<BIamPermissionTreeExpandResponseVo> | null,
    dialogs: {
      create: { visible: false },
      edit: { visible: false },
      detail: { visible: false },
      updateParent: { visible: false }
    }
  })

  type SearchFieldKey = 'name' | 'code' | 'icon'

  /** 单字段命中：节点 + 该字段需高亮的区间 */
  interface FieldHit {
    item: BIamPermissionTreeExpandResponseVo
    ranges: HighlightRange[]
  }

  const SEARCH_RESULT_LIMIT = 256

  /** 建索引（仅名称/图标使用模糊匹配；编码是标识符，走精确包含匹配） */
  const createFuseIndex = (flatData: BIamPermissionTreeExpandResponseVo[], keys: string[], threshold: number, minMatchCharLength: number, distance: number) =>
    new Fuse(flatData, {
      keys,
      includeMatches: true,
      includeScore: true,
      threshold,
      minMatchCharLength,
      ignoreLocation: true,
      distance,
      findAllMatches: true,
      tokenize: (text: string) => text.split(/\s+/)
    })

  const initSearchTools = () => {
    const flatData = markRaw(TreeDataUtil.collectAllNodes(state.tableData))
    state.flatData = flatData

    // 未搜索时表格展示全部数据，结果与总数相同
    state.loadedCount = flatData.length
    state.resultShown = flatData.length
    state.resultTotal = flatData.length

    state.nameFuse = createFuseIndex(flatData, ['name'], 0.1, 1, 30)
    state.iconFuse = createFuseIndex(flatData, ['icon'], 0.1, 1, 30)
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

  // 表格操作
  const setDefaultExpandedRows = (nodes: BIamPermissionTreeExpandResponseVo[]) => {
    state.expandedRowKeys = nodes.map(node => node.id)
  }

  const performSearch = () => {
    const { name, code, icon } = state.searchForm

    if (!name && !code && !icon) {
      resetSearch()
      return
    }

    state.isSearching = true

    const fieldHits: Array<{ key: SearchFieldKey; hits: FieldHit[] }> = []
    if (name) {
      fieldHits.push({
        key: 'name',
        hits: (state.nameFuse?.search(name) ?? []).map(result => ({ item: result.item, ranges: getHighlightRanges(result.matches) }))
      })
    }
    if (code) {
      // 编码是标识符，按“包含”精确匹配（模糊匹配会把 0001 命中到 0000）
      const keyword = code.toLowerCase()
      fieldHits.push({
        key: 'code',
        hits: state.flatData
          .filter(node => node.code?.toLowerCase().includes(keyword))
          .map(node => ({ item: node, ranges: collectSubstringRanges(node.code ?? '', code) }))
      })
    }
    if (icon) {
      fieldHits.push({
        key: 'icon',
        hits: (state.iconFuse?.search(icon) ?? []).map(result => ({ item: result.item, ranges: getHighlightRanges(result.matches) }))
      })
    }

    const [primary, ...restFields] = fieldHits
    const restIdSets = restFields.map(field => new Set(field.hits.map(hit => hit.item.id)))
    const allHits = primary.hits.filter(hit => restIdSets.every(idSet => idSet.has(hit.item.id)))

    state.resultTotal = allHits.length
    const hits = allHits.slice(0, SEARCH_RESULT_LIMIT)
    state.resultShown = hits.length

    const rangesById = new Map<string, Partial<Record<SearchFieldKey, HighlightRange[]>>>()
    fieldHits.forEach(({ key, hits: fieldHitList }) => {
      fieldHitList.forEach(hit => {
        const entry = rangesById.get(hit.item.id) ?? {}
        entry[key] = hit.ranges
        rangesById.set(hit.item.id, entry)
      })
    })

    const matchedItems = hits.map(hit => {
      const entry = rangesById.get(hit.item.id) ?? {}
      return {
        ...hit.item,
        highlight: {
          name: entry.name ?? [],
          code: entry.code ?? [],
          icon: entry.icon ?? []
        }
      }
    })

    const parentIdMap = new Map<string, string>()
    const collectParentIdMap = (nodes: BIamPermissionTreeExpandResponseVo[]) => {
      for (const node of nodes) {
        if (!node.children?.length) continue
        for (const child of node.children) {
          parentIdMap.set(child.id, node.id)
        }
        collectParentIdMap(node.children)
      }
    }
    collectParentIdMap(state.tableData)

    const matchedIds = new Set<string>()
    const parentIds = new Set<string>()
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
    const buildResultTree = (nodes: BIamPermissionTreeExpandResponseVo[]): BIamPermissionTreeExpandResponseVo[] => {
      const result: BIamPermissionTreeExpandResponseVo[] = []
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

    state.tableDataToShow = markRaw(buildResultTree(state.tableData))
    state.expandedRowKeys = Array.from(parentIds)
  }

  const handleSearch = () => {
    if (state.searchForm.code && state.searchForm.code.length < 3) {
      ElMessage.warning('编码至少需要3位字符')
      return
    }
    performSearch()
  }

  const resetSearch = () => {
    searchFormRef.value?.resetFields()
    state.isSearching = false
    state.tableDataToShow = state.tableData
    setDefaultExpandedRows(state.tableData)
    state.resultShown = state.loadedCount
    state.resultTotal = state.loadedCount
  }

  // 对话框操作
  const showCreateDialog = (row: BIamPermissionTreeExpandResponseVo) => {
    state.currentRow = row
    state.dialogs.create.visible = true
  }

  const showEditDialog = (row: BIamPermissionTreeExpandResponseVo) => {
    state.currentId = row.id
    state.dialogs.edit.visible = true
  }

  const showDetailDialog = (id: string) => {
    state.currentId = id
    state.dialogs.detail.visible = true
  }

  const showUpdateParentDialog = (row: BIamPermissionTreeExpandResponseVo) => {
    updateParentDialogRef.value?.open({
      id: row.id,
      name: row.name,
      parentId: row.parentId
    })
  }

  const handleDialogSuccess = () => {
    state.dialogs.create.visible = false
    state.dialogs.edit.visible = false
    // 刷新后仍按当前搜索条件过滤，并保留用户已展开的节点，避免视图跳变
    void refreshPreservingView([...state.expandedRowKeys])
  }

  const formatTime = (timestamp: number) => {
    return timestamp ? new Date(timestamp).toLocaleString() : '-'
  }

  const getResourceTypeTag = (type?: string | null): TagType => {
    if (!type) return 'info'
    return RESOURCE_TYPE_TAG_MAP[type] || 'info'
  }

  const PermissionIcon = defineComponent({
    name: 'PermissionIcon',
    props: {
      icon: { type: String, required: true }
    },
    setup(props) {
      return () => {
        if (props.icon.startsWith('el-icon')) {
          return h(ElIcon, null, { default: () => h(resolveComponent(props.icon)) })
        }
        return h(SvgIcon, { name: props.icon, width: '15', height: '15' })
      }
    }
  })

  const tableColumns = [
    {
      key: 'name',
      title: '名称',
      dataKey: 'name',
      width: 240,
      fixed: true,
      align: 'left',
      cellRenderer: ({ rowData }: { rowData: BIamPermissionTreeExpandResponseVo }) =>
        h('span', null, [
          rowData.icon ? h('span', { class: 'permission-icon' }, [h(PermissionIcon, { icon: rowData.icon })]) : null,
          rowData.highlight?.name?.length ? h('span', null, renderHighlight(rowData.name, rowData.highlight.name)) : rowData.name
        ])
    },
    {
      key: 'code',
      title: '编码',
      dataKey: 'code',
      width: 320,
      cellRenderer: ({ cellData, rowData }: { cellData: string; rowData: BIamPermissionTreeExpandResponseVo }) =>
        cellData && rowData.highlight?.code?.length ? h('span', null, renderHighlight(cellData, rowData.highlight.code)) : cellData
    },
    {
      key: 'resourceType',
      title: '类型',
      dataKey: 'resourceType',
      width: 120,
      cellRenderer: ({ rowData }: { rowData: BIamPermissionTreeExpandResponseVo }) =>
        h(ElTag, { type: getResourceTypeTag(rowData.resourceType) }, () =>
          rowData.resourceType ? enumStore.getEnumLabel(DICT_IAM_PERMISSION_RESOURCE_TYPE, rowData.resourceType) : '-'
        )
    },
    {
      key: 'icon',
      title: '图标',
      dataKey: 'icon',
      width: 180,
      align: 'center',
      cellRenderer: ({ cellData, rowData }: { cellData: string; rowData: BIamPermissionTreeExpandResponseVo }) =>
        cellData && rowData.highlight?.icon?.length ? h('span', null, renderHighlight(cellData, rowData.highlight.icon)) : cellData
    },
    { key: 'sort', title: '排序', dataKey: 'sort', width: 80, align: 'center' },
    { key: 'createName', title: '创建人', dataKey: 'createName', width: 180, align: 'center' },
    {
      key: 'createTime',
      title: '创建时间',
      dataKey: 'createTime',
      width: 180,
      align: 'center',
      cellRenderer: ({ cellData }: { cellData: number }) => formatTime(cellData)
    },
    { key: 'updateName', title: '修改人', dataKey: 'updateName', width: 180, align: 'center' },
    {
      key: 'updateTime',
      title: '更新时间',
      dataKey: 'updateTime',
      width: 180,
      align: 'center',
      cellRenderer: ({ cellData }: { cellData: number }) => formatTime(cellData)
    },
    {
      key: 'operation',
      title: '操作',
      width: 200,
      align: 'center',
      fixed: 'right',
      cellRenderer: ({ rowData }: { rowData: BIamPermissionTreeExpandResponseVo }) =>
        h('div', { class: 'table-actions' }, [
          h(
            ElButton,
            {
              size: 'small',
              disabled: !hasPermission(['MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION:DETAIL']),
              onClick: () => showDetailDialog(rowData.id)
            },
            () => '详情'
          ),
          h(
            ElButton,
            {
              size: 'small',
              type: 'primary',
              disabled: !hasPermission(['MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION:UPDATE']),
              onClick: () => showEditDialog(rowData)
            },
            () => '编辑'
          ),
          h(
            ElDropdown,
            {
              trigger: 'click',
              placement: 'bottom-end',
              onCommand: (command: string | number | object) => onPermissionDropdownCommand(command, rowData)
            },
            {
              default: () =>
                h(ElButton, { size: 'small', type: 'info' }, () => ['更多', h(ElIcon, { class: 'el-icon--right' }, { default: () => h(ArrowDown) })]),
              dropdown: () =>
                h(ElDropdownMenu, null, () => [
                  h(
                    ElDropdownItem,
                    {
                      command: 'create',
                      disabled: !hasPermission(['MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION:CREATE'])
                    },
                    () => [h(ElIcon, null, { default: () => h(Plus) }), h('span', null, '新增')]
                  ),
                  h(
                    ElDropdownItem,
                    {
                      command: 'updateParent',
                      disabled: !hasPermission(['MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION:UPDATE_PARENT'])
                    },
                    () => [h(ElIcon, null, { default: () => h(Connection) }), h('span', null, '移动')]
                  ),
                  h(
                    ElDropdownItem,
                    {
                      command: 'delete',
                      divided: true,
                      disabled: !hasPermission(['MANAGE_APP:SYSTEM:ACCESS_CONTROL:PERMISSION:DELETE'])
                    },
                    () => [h(ElIcon, null, { default: () => h(Delete) }), h('span', null, '删除')]
                  )
                ])
            }
          )
        ])
    }
  ]

  const handleDelete = async (row: { id: string }) => {
    try {
      await BIamPermissionApi.destroy({ id: row.id })
      handleDialogSuccess()
    } catch (error) {
      console.error('删除权限失败', error)
    }
  }

  const onPermissionDropdownCommand = (command: string | number | object, row: BIamPermissionTreeExpandResponseVo) => {
    handlePermissionDropdownCommand(String(command), row)
  }

  const handlePermissionDropdownCommand = (command: string, row: BIamPermissionTreeExpandResponseVo) => {
    const commandMap: Record<string, () => void> = {
      create: () => showCreateDialog(row),
      updateParent: () => showUpdateParentDialog(row),
      delete: () => {
        ElMessageBox.confirm('确定要删除此权限吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => handleDelete(row))
          .catch(() => {
            // 用户取消删除
          })
      }
    }
    commandMap[command]?.()
  }

  // 数据获取
  const fetchPermissionTree = async () => {
    try {
      state.loading = true
      const res = await BIamPermissionApi.treeExpand({ id: 'machine' })
      state.treeData = markRaw(res)
      state.tableData = markRaw(res.children || [])
      state.tableDataToShow = state.tableData
      initSearchTools()
      setDefaultExpandedRows(state.tableData)
    } catch (error) {
      console.error('获取权限树失败', error)
    } finally {
      state.loading = false
    }
  }

  /**
   * 重新拉取权限树并保持原有视图：
   * 1. 搜索条件被保留时，按原条件重新过滤，保证「搜索框内容」与「表格数据」一致；
   * 2. 未搜索时，保留用户已展开的节点（节点已不存在则回退到默认展开）。
   */
  const refreshPreservingView = async (previousExpandedKeys: string[]) => {
    await fetchPermissionTree()
    if (state.isSearching) {
      performSearch()
      return
    }
    if (!previousExpandedKeys.length) return
    const existingIds = new Set(state.flatData.map(node => node.id))
    const keptKeys = previousExpandedKeys.filter(id => existingIds.has(id))
    if (keptKeys.length) state.expandedRowKeys = keptKeys
  }

  watch(
    () => state.searchForm,
    ({ name, code, icon }) => {
      if (!name && !code && !icon && state.isSearching) {
        resetSearch()
      }
    },
    { deep: true }
  )

  onMounted(async () => {
    await Promise.all([enumStore.getEnumDataAsync(DICT_IAM_PERMISSION_RESOURCE_TYPE), enumStore.getEnumDataAsync(DICT_IAM_DATA_PERMISSION_SCOPE_TYPE)])
    await fetchPermissionTree()
    await nextTick()
    setupResizeObserver()
    await updateTableSize()
  })

  onActivated(async () => {
    if (isFirstActivation) {
      isFirstActivation = false
      return
    }
    // 从其他标签页切回时刷新数据，同时保持搜索条件与展开状态
    await refreshPreservingView([...state.expandedRowKeys])
    await updateTableSize()
  })

  onBeforeUnmount(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })
</script>

<style scoped lang="scss">
  .permission-page {
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
      align-items: center;
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
      }

      .el-input {
        width: 200px;
      }

      .el-select {
        width: 200px;
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
    }

    .table-wrapper {
      flex: 1;
      min-height: 0;
    }

    .table-placeholder {
      flex: 1;
      padding: 10px 0;
    }
  }

  /* 响应式调整 */
  @media (max-width: 1200px) {
    .search-form {
      .button-group {
        margin-left: 0;
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  /* 名称列图标（渲染函数内创建，需用 :deep 命中） */
  :deep(.permission-icon) {
    margin-right: 8px;
    vertical-align: middle;

    .icon-image {
      width: 16px;
      height: 16px;
      vertical-align: middle;
    }
  }

  .permission-table {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;

    :deep(.el-table-v2__header-cell),
    :deep(.el-table-v2__row-cell) {
      padding: 0 8px;
      border-right: 1px solid var(--el-border-color);
    }
  }

  .table-empty {
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }

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
</style>
