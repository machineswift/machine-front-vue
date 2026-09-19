<template>
  <div class="front-category-page">
    <!-- 搜索卡片 -->
    <el-card class="box-card-form">
      <el-form :model="state.searchForm" ref="searchFormRef" class="search-form" :inline="true" label-width="80px">
        <div class="form-items-group">
          <el-form-item label="名称:" prop="name">
            <el-input v-model="state.searchForm.name" placeholder="请输入类目名称" clearable />
          </el-form-item>
          <el-form-item label="编码:" prop="code">
            <el-input v-model="state.searchForm.code" placeholder="请输入类目编码,至少3位" clearable />
          </el-form-item>
        </div>

        <div class="button-group">
          <el-form-item>
            <span class="search-limit-hint">结果{{ state.resultShown }}/{{ state.resultTotal }}条</span>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </div>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="box-card-data">
      <!-- 操作按钮 -->
      <div class="operation-buttons">
        <el-button type="primary" @click="showCreateDialog(null)" v-hasPermission="[PERMISSION_CODE.create]">新增</el-button>
      </div>

      <!-- 表格区域 -->
      <div ref="tableWrapperRef" class="table-wrapper">
        <el-table-v2
          v-show="tableHeightReady"
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
          class="front-category-table"
          v-loading="state.loading"
        >
          <template #empty>
            <div class="table-empty">暂无数据</div>
          </template>
        </el-table-v2>

        <!-- 骨架屏占位 -->
        <div v-show="!tableHeightReady" class="table-placeholder">
          <el-skeleton :rows="8" animated />
        </div>
      </div>
    </el-card>

    <!-- 对话框组件 -->
    <ScmFrontCategoryCreateDialog
      v-model="state.dialogs.create.visible"
      :parent-node="state.currentRow"
      :root-node-id="state.treeData?.id"
      :root-node-name="state.treeData?.name"
      @success="handleDialogSuccess"
    />
    <ScmFrontCategoryEditDialog v-model="state.dialogs.edit.visible" :category-id="state.currentId" @success="handleDialogSuccess" />
    <ScmFrontCategoryDetailDialog v-model="state.dialogs.detail.visible" :category-id="state.currentId" />
    <ScmFrontCategoryUpdateParentDialog ref="updateParentDialogRef" :category-tree="state.treeData" @success="handleDialogSuccess" />

    <!-- 关联后台分类弹窗（仅展示后台分类树，不含基本信息） -->
    <el-dialog
      v-model="state.dialogs.backCategory.visible"
      title="关联后台分类"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :destroy-on-close="true"
      @closed="handleBackCategoryDialogClosed"
      width="640px"
      top="8vh"
    >
      <div class="detail-section">
        <TreeCheckPanel
          ref="backCategoryPanelRef"
          v-model="state.selectedBackCategoryIds"
          :roots="state.backCategoryTreeData"
          :height="260"
          placeholder="输入后台分类名称或编码搜索"
          :icon="FolderOpened"
          :closable-tags="false"
          empty-tags-text="暂无关联后台分类"
        />
      </div>

      <template #footer>
        <el-button @click="state.dialogs.backCategory.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  defineOptions({
    name: 'MANAGE_APP:SCM:CATEGORY:FRONT'
  })

  import { ref, reactive, computed, onMounted, onActivated, nextTick, h, watch, markRaw, type VNode } from 'vue'
  import Fuse, { type FuseResultMatch } from 'fuse.js'
  import { ElMessage, ElMessageBox, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem, ElIcon } from 'element-plus'
  import { ArrowDown, Plus, Connection, Delete, FolderOpened } from '@element-plus/icons-vue'
  import { useElementSize } from '@vueuse/core'
  import { hasPermission } from '@/shared/utils/Permission.util'
  import TreeCheckPanel from '@/shared/components/TreeCheckPanel.vue'
  import { ScmFrontCategoryApi } from '@/modules/scm/category/api/ScmFrontCategory.api'
  import { ScmBackCategoryApi } from '@/modules/scm/category/api/ScmBackCategory.api'
  import { TreeDataUtil } from '@/shared/utils/TreeData.util'
  import type { ScmFrontCategoryTreeExpandResponseVo } from '@/modules/scm/category/type/ScmFrontCategory.type'
  import type { HighlightRange } from '@/shared/types/Common.type'
  import type { ScmBackCategoryTreeSimpleResponseVo } from '@/modules/scm/category/type/ScmBackCategory.type'
  import ScmFrontCategoryCreateDialog from '@/modules/scm/category/ScmFrontCategoryCreateDialog.vue'
  import ScmFrontCategoryEditDialog from '@/modules/scm/category/ScmFrontCategoryEditDialog.vue'
  import ScmFrontCategoryDetailDialog from '@/modules/scm/category/ScmFrontCategoryDetailDialog.vue'
  import ScmFrontCategoryUpdateParentDialog from '@/modules/scm/category/ScmFrontCategoryUpdateParentDialog.vue'

  const searchFormRef = ref()
  const updateParentDialogRef = ref()
  const tableWrapperRef = ref<HTMLElement | null>(null)

  // 树形展开所在列
  const expandColumnKey = 'name'

  // 表格尺寸取自真实容器：容器尚未完成布局时先展示骨架屏，避免首帧尺寸抖动
  const { width: tableWrapperWidth, height: tableWrapperHeight } = useElementSize(tableWrapperRef)
  const tableWidth = computed(() => Math.max(tableWrapperWidth.value, 320))
  const tableHeight = computed(() => Math.max(tableWrapperHeight.value, 260))
  const tableHeightReady = computed(() => tableWrapperHeight.value > 0 && tableWrapperWidth.value > 0)

  let isFirstActivation = true

  /** 权限编码集中定义，避免散落在各个渲染函数中 */
  const PERMISSION_CODE = {
    detail: 'MANAGE_APP:SCM:CATEGORY:FRONT:DETAIL',
    create: 'MANAGE_APP:SCM:CATEGORY:FRONT:CREATE',
    update: 'MANAGE_APP:SCM:CATEGORY:FRONT:UPDATE',
    updateParent: 'MANAGE_APP:SCM:CATEGORY:FRONT:UPDATE_PARENT',
    delete: 'MANAGE_APP:SCM:CATEGORY:FRONT:DELETE'
  }

  // 单元格渲染函数会被虚拟表格频繁调用，权限结果提前算好（权限变化时自动重算）
  const permission = {
    detail: computed(() => hasPermission([PERMISSION_CODE.detail])),
    create: computed(() => hasPermission([PERMISSION_CODE.create])),
    update: computed(() => hasPermission([PERMISSION_CODE.update])),
    updateParent: computed(() => hasPermission([PERMISSION_CODE.updateParent])),
    delete: computed(() => hasPermission([PERMISSION_CODE.delete]))
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

  // 状态
  const state = reactive({
    loading: false,
    isSearching: false,
    searchForm: {
      name: '',
      code: ''
    },
    loadedCount: 0,
    resultShown: 0,
    resultTotal: 0,
    currentId: '',
    currentRow: null as ScmFrontCategoryTreeExpandResponseVo | null,
    expandedRowKeys: [] as string[],
    tableData: [] as ScmFrontCategoryTreeExpandResponseVo[],
    tableDataToShow: [] as ScmFrontCategoryTreeExpandResponseVo[],
    treeData: null as ScmFrontCategoryTreeExpandResponseVo | null,
    flatData: [] as ScmFrontCategoryTreeExpandResponseVo[],
    nameFuse: null as Fuse<ScmFrontCategoryTreeExpandResponseVo> | null,
    dialogs: {
      create: { visible: false },
      edit: { visible: false },
      detail: { visible: false },
      backCategory: { visible: false }
    },
    backCategoryTreeData: [] as ScmBackCategoryTreeSimpleResponseVo[],
    selectedBackCategoryIds: [] as string[]
  })

  const backCategoryPanelRef = ref<InstanceType<typeof TreeCheckPanel>>()

  const formatTime = (timestamp?: number): string => (timestamp ? new Date(timestamp).toLocaleString() : '-')

  const tableColumns = [
    {
      key: 'name',
      title: '名称',
      dataKey: 'name',
      width: 280,
      fixed: true,
      align: 'left',
      cellRenderer: ({ cellData, rowData }: { cellData: string; rowData: ScmFrontCategoryTreeExpandResponseVo }) =>
        cellData && rowData.highlight?.name?.length ? h('span', null, renderHighlight(cellData, rowData.highlight.name)) : cellData
    },
    {
      key: 'code',
      title: '编码',
      dataKey: 'code',
      width: 160,
      align: 'left',
      cellRenderer: ({ cellData, rowData }: { cellData: string; rowData: ScmFrontCategoryTreeExpandResponseVo }) =>
        cellData && rowData.highlight?.code?.length ? h('span', null, renderHighlight(cellData, rowData.highlight.code)) : cellData || '-'
    },
    { key: 'frontCategoryNumber', title: '前台分类数', dataKey: 'frontCategoryNumber', width: 110, align: 'center' },
    {
      key: 'backCategoryNumber',
      title: '后台分类数',
      dataKey: 'backCategoryNumber',
      width: 130,
      align: 'center',
      cellRenderer: ({ rowData }: { rowData: ScmFrontCategoryTreeExpandResponseVo }) =>
        (rowData.backCategoryNumber ?? 0) > 0
          ? h('span', { class: 'link-number', onClick: () => handleShowBackCategories(rowData) }, String(rowData.backCategoryNumber))
          : '0'
    },
    { key: 'sort', title: '排序', dataKey: 'sort', width: 90, align: 'center' },
    { key: 'createName', title: '创建人', dataKey: 'createName', width: 120, align: 'center' },
    {
      key: 'createTime',
      title: '创建时间',
      dataKey: 'createTime',
      width: 170,
      align: 'center',
      cellRenderer: ({ cellData }: { cellData: number }) => formatTime(cellData)
    },
    { key: 'updateName', title: '更新人', dataKey: 'updateName', width: 120, align: 'center' },
    {
      key: 'updateTime',
      title: '更新时间',
      dataKey: 'updateTime',
      width: 170,
      align: 'center',
      cellRenderer: ({ cellData }: { cellData: number }) => formatTime(cellData)
    },
    {
      key: 'operation',
      title: '操作',
      width: 260,
      align: 'center',
      fixed: 'right',
      cellRenderer: ({ rowData }: { rowData: ScmFrontCategoryTreeExpandResponseVo }) =>
        h('div', { class: 'table-actions' }, [
          h(ElButton, { size: 'small', disabled: !permission.detail.value, onClick: () => showDetailDialog(rowData.id) }, () => '详情'),
          h(ElButton, { size: 'small', type: 'primary', disabled: !permission.update.value, onClick: () => showEditDialog(rowData) }, () => '编辑'),
          h(
            ElDropdown,
            {
              trigger: 'click',
              placement: 'bottom-end',
              onCommand: (command: string | number | object) => onDropdownCommand(String(command), rowData)
            },
            {
              default: () =>
                h(ElButton, { size: 'small', type: 'info' }, () => ['更多', h(ElIcon, { class: 'el-icon--right' }, { default: () => h(ArrowDown) })]),
              dropdown: () =>
                h(ElDropdownMenu, null, () => [
                  h(ElDropdownItem, { command: 'create', disabled: !permission.create.value }, () => [
                    h(ElIcon, null, { default: () => h(Plus) }),
                    h('span', null, '新增子类目')
                  ]),
                  h(ElDropdownItem, { command: 'updateParent', disabled: !permission.updateParent.value }, () => [
                    h(ElIcon, null, { default: () => h(Connection) }),
                    h('span', null, '移动类目')
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

  const setDefaultExpandedRows = (nodes: ScmFrontCategoryTreeExpandResponseVo[]) => {
    // 默认展开第一级
    state.expandedRowKeys = nodes.map(node => node.id)
  }

  type SearchFieldKey = 'name' | 'code'

  /** 单字段命中：节点 + 该字段需高亮的区间 */
  interface FieldHit {
    item: ScmFrontCategoryTreeExpandResponseVo
    ranges: HighlightRange[]
  }

  const SEARCH_RESULT_LIMIT = 256

  /** 建索引（仅名称使用模糊匹配；编码是标识符，走精确包含匹配） */
  const createFuseIndex = (flatData: ScmFrontCategoryTreeExpandResponseVo[], keys: string[], threshold: number, minMatchCharLength: number, distance: number) =>
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
  }

  /** 收集并合并命中区间（升序、互不重叠），渲染时直接拼接文本节点 */
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

  const performSearch = () => {
    const { name, code } = state.searchForm

    if (!name && !code) {
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

    // 多字段取交集：以首个已填字段为基准，用其余字段的命中 id 集合逐一过滤
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
          code: entry.code ?? []
        }
      }
    })

    // 先建 id→父id 索引，再向上回溯命中项的全部祖先（避免在循环里反复遍历整棵树）
    const parentIdMap = new Map<string, string>()
    const collectParentIdMap = (nodes: ScmFrontCategoryTreeExpandResponseVo[]) => {
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

    // 构建搜索结果树：只保留命中项及其祖先，祖先用于承载层级
    const matchedMap = new Map(matchedItems.map(item => [item.id, item]))
    const buildResultTree = (nodes: ScmFrontCategoryTreeExpandResponseVo[]): ScmFrontCategoryTreeExpandResponseVo[] => {
      const result: ScmFrontCategoryTreeExpandResponseVo[] = []
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

    // 命中多少个就展开多少个父节点，不截断（否则深层命中会被折叠隐藏）
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
  const showCreateDialog = (row: ScmFrontCategoryTreeExpandResponseVo | null) => {
    state.currentRow = row
    state.dialogs.create.visible = true
  }

  const showEditDialog = (row: ScmFrontCategoryTreeExpandResponseVo) => {
    state.currentId = row.id
    state.dialogs.edit.visible = true
  }

  const showDetailDialog = (id: string) => {
    state.currentId = id
    state.dialogs.detail.visible = true
  }

  const showUpdateParentDialog = (row: ScmFrontCategoryTreeExpandResponseVo) => {
    updateParentDialogRef.value?.open({
      id: row.id,
      name: row.name,
      parentId: row.parentId
    })
  }

  const handleDialogSuccess = () => {
    state.dialogs.create.visible = false
    state.dialogs.edit.visible = false
    fetchCategoryTree()
  }

  const handleDelete = async (row: ScmFrontCategoryTreeExpandResponseVo) => {
    try {
      await ScmFrontCategoryApi.destroy({ id: row.id })
      fetchCategoryTree()
    } catch (error) {
      console.error('删除前台类目失败', error)
    }
  }

  // 下拉菜单命令
  const onDropdownCommand = (command: string, row: ScmFrontCategoryTreeExpandResponseVo) => {
    const commandMap: Record<string, () => void> = {
      create: () => showCreateDialog(row),
      updateParent: () => showUpdateParentDialog(row),
      delete: () => {
        ElMessageBox.confirm(`确定要删除类目「${row.name}」吗？删除后子类目将一并删除，请谨慎操作。`, '删除确认', {
          confirmButtonText: '确定删除',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => handleDelete(row))
          .catch(() => {})
      }
    }
    commandMap[command]?.()
  }

  /** 点击后台分类数：加载关联数据并打开独立弹窗 */
  const handleShowBackCategories = async (row: ScmFrontCategoryTreeExpandResponseVo) => {
    state.currentId = row.id
    state.dialogs.backCategory.visible = true

    try {
      const [detail, backTree] = await Promise.all([ScmFrontCategoryApi.detail({ id: row.id }), ScmBackCategoryApi.treeSimple()])

      state.backCategoryTreeData = backTree.children || (backTree.id ? [backTree] : [])
      state.selectedBackCategoryIds = detail.backCategoryIdSet || []

      await nextTick()
      backCategoryPanelRef.value?.setCheckedKeys(state.selectedBackCategoryIds)
    } catch (error) {
      console.error('获取关联后台分类失败', error)
    }
  }

  const handleBackCategoryDialogClosed = () => {
    state.backCategoryTreeData = []
    state.selectedBackCategoryIds = []
    backCategoryPanelRef.value?.reset()
  }

  /** 请求去重 Promise，防止并发重复调用 */
  let fetchPromise: Promise<void> | null = null

  const fetchCategoryTree = async () => {
    if (fetchPromise) return fetchPromise

    try {
      state.loading = true
      fetchPromise = ScmFrontCategoryApi.treeExpand()
        .then(res => {
          state.treeData = markRaw(res)
          state.tableData = markRaw(res.children || [])
          state.tableDataToShow = state.tableData
          initSearchTools()
          setDefaultExpandedRows(state.tableData)
        })
        .catch(error => {
          console.error('获取前台类目树失败', error)
        })
      await fetchPromise
    } finally {
      fetchPromise = null
      state.loading = false
    }
  }

  watch(
    () => state.searchForm,
    ({ name, code }) => {
      if (!name && !code && state.isSearching) {
        resetSearch()
      }
    },
    { deep: true }
  )

  onMounted(async () => {
    await fetchCategoryTree()
    await nextTick()
  })

  onActivated(async () => {
    if (isFirstActivation) {
      isFirstActivation = false
      return
    }
    await fetchCategoryTree()
  })
</script>

<style scoped lang="scss">
  .front-category-page {
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
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;

      .form-items-group {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }

      .button-group {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-left: auto;

        .search-limit-hint {
          margin-right: 12px;
          color: var(--el-text-color-secondary);
          font-size: 12px;
        }

        .el-form-item {
          margin-bottom: 0;
        }
      }
    }
  }

  .box-card-data {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
    overflow: hidden;

    :deep(.el-card__body) {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      padding: 12px;
      overflow: hidden;
    }
  }

  .operation-buttons {
    margin-bottom: 10px;
    flex-shrink: 0;
  }

  .table-wrapper {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  /* 后台分类数链接（cellRenderer 内创建，需用 :deep 命中） */
  :deep(.link-number) {
    color: var(--el-color-primary);
    cursor: pointer;
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: transparent;
    transition: text-decoration-color 0.2s;

    &:hover {
      text-decoration-color: var(--el-color-primary);
    }
  }

  .detail-section {
    padding: 0;
  }

  .back-category-selector {
    width: 100%;
  }

  .back-category-tree {
    margin-top: 8px;
    max-height: 320px;
    overflow-y: auto;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 8px;
  }

  .selected-tags {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
  }

  .selected-label {
    font-size: 12px;
    color: #909399;
    flex-shrink: 0;
  }

  .empty-hint {
    font-size: 12px;
    color: #c0c4cc;
  }

  .table-placeholder {
    padding: 10px 0;
  }

  .table-empty {
    color: var(--el-text-color-secondary);
    font-size: 14px;
  }

  .front-category-table {
    border: 1px solid var(--el-border-color);
    border-radius: 4px;

    :deep(.el-table-v2__header-cell),
    :deep(.el-table-v2__row-cell) {
      padding: 0 8px;
      border-right: 1px solid var(--el-border-color);
    }
  }

  /* 命中区间高亮（cellRenderer 内创建，需用 :deep 命中） */
  :deep(.highlight) {
    background-color: #fffb8f;
    color: #000;
    font-weight: bold;
    padding: 0 2px;
    border-radius: 2px;
  }

  /* 操作按钮样式 - 需要深度选择器以应用到 JSX 组件 */
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
